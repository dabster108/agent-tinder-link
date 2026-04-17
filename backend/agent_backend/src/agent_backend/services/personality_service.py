import json
import os
from typing import Any, Dict, List

from agent_backend.crew import create_personality_crew, get_personality_agent_config
from agent_backend.llm_runtime import (
    enable_crewai_tracking,
    get_model_candidates,
    is_high_demand_error,
    run_prompt_with_fallback,
)
from agent_backend.models import BehaviorUpdateResult, ChatTurnResult, PersonalityRunResult
from agent_backend.parsers import extract_json_object, extract_questions
from agent_backend.prompts import (
    BEHAVIOR_UPDATE_PROMPT,
    CHAT_TURN_PROMPT,
    ONBOARDING_QUESTION_PROMPT,
    QUESTION_GENERATION_PROMPT,
)


def _run_personality_crew_with_fallback(questionnaire_json: str, thread_id: str | None = None):
    candidates = get_model_candidates()
    last_error: Exception | None = None

    for model_idx, model in enumerate(candidates):
        previous_model = os.getenv("MODEL")
        if model:
            os.environ["MODEL"] = model

        try:
            if model_idx > 0:
                print(f"\n[Fallback] Switching personality crew to model: {model}")
            
            crew_instance = create_personality_crew()
            enable_crewai_tracking(crew_instance)
            opik_args = {"trace": {"thread_id": thread_id}} if thread_id else None

            output = crew_instance.kickoff(
                inputs={"questionnaire_json": questionnaire_json},
                opik_args=opik_args,
            )

            raw = getattr(output, "raw", None)
            if raw is None:
                raw = str(output)

            if model_idx > 0:
                print(f"✓ Fallback model {model} crew succeeded!")
            return raw
        except Exception as exc:  # noqa: BLE001
            last_error = exc
            if not is_high_demand_error(exc):
                # Non-transient error - stop trying other models
                print(f"\n[Error] Non-transient error with {model}: {str(exc)[:100]}")
                break
            elif model_idx == 0:
                # First model failed - try fallbacks
                print(f"\n[Retry] Model {model} is overloaded. Trying fallback models...")
            else:
                # Fallback also failed
                print(f"\n[Skip] Fallback model {model} also overloaded.")
        finally:
            if previous_model is None:
                os.environ.pop("MODEL", None)
            else:
                os.environ["MODEL"] = previous_model

    if last_error is not None:
        raise last_error
    raise RuntimeError("Personality crew failed without a captured exception.")


def run_personality_question_generator(question_count: int = 12) -> List[Dict[str, str]]:
    count = max(6, min(question_count, 20))
    prompt = QUESTION_GENERATION_PROMPT.format(question_count=count)
    raw = run_prompt_with_fallback(prompt, get_personality_agent_config())
    return extract_questions(raw)


def run_onboarding_question_generator(
    user_context: Dict[str, Any],
    question_count: int = 5,
    thread_id: str | None = None,
) -> List[Dict[str, str]]:
    context_json = json.dumps(user_context, ensure_ascii=True)
    prompt = ONBOARDING_QUESTION_PROMPT.format(
        question_count=max(1, question_count),
        user_context=context_json,
    )
    raw = run_prompt_with_fallback(prompt, get_personality_agent_config())
    questions = extract_questions(raw)
    if len(questions) > question_count:
        return questions[:question_count]
    return questions


def run_personality_chat_turn(
    conversation_history: List[Dict[str, Any]],
    user_message: str,
    user_name: str = "User",
    thread_id: str | None = None,
) -> ChatTurnResult:
    history_json = json.dumps(conversation_history, ensure_ascii=True)
    prompt = CHAT_TURN_PROMPT.format(
        user_name=user_name,
        history_json=history_json,
        user_message=user_message,
    )

    try:
        raw = run_prompt_with_fallback(prompt, get_personality_agent_config())
    except Exception as exc:  # noqa: BLE001
        fallback_reply = (
            "I am facing temporary high traffic right now, but I am still here with you. "
            "Please share one more detail about your personality, and I will continue building your profile."
        )
        return ChatTurnResult(
            raw_output=f"ERROR: {exc}",
            assistant_reply=fallback_reply,
            memory_update={},
        )

    parsed = extract_json_object(raw)
    assistant_reply = str(parsed.get("assistant_reply", "")).strip() if parsed else ""
    if not assistant_reply:
        assistant_reply = raw.strip() or "Tell me a little more about yourself."

    memory_update = parsed.get("memory_update", {}) if isinstance(parsed, dict) else {}
    if not isinstance(memory_update, dict):
        memory_update = {}

    return ChatTurnResult(
        raw_output=raw,
        assistant_reply=assistant_reply,
        memory_update=memory_update,
    )


def run_personality_behavior_update(
    conversation_history: List[Dict[str, Any]],
    user_name: str = "User",
    thread_id: str | None = None,
) -> BehaviorUpdateResult:
    conversation_json = json.dumps(conversation_history, ensure_ascii=True)
    prompt = BEHAVIOR_UPDATE_PROMPT.format(
        user_name=user_name,
        conversation_json=conversation_json,
    )

    try:
        raw = run_prompt_with_fallback(prompt, get_personality_agent_config())
    except Exception as exc:  # noqa: BLE001
        return BehaviorUpdateResult(
            raw_output=f"ERROR: {exc}",
            behavior_update={},
        )

    parsed = extract_json_object(raw)
    behavior_update = parsed if isinstance(parsed, dict) else {}

    return BehaviorUpdateResult(
        raw_output=raw,
        behavior_update=behavior_update,
    )


def run_personality_agent(
    questionnaire_json: str,
    thread_id: str | None = None,
) -> PersonalityRunResult:
    try:
        raw = _run_personality_crew_with_fallback(questionnaire_json, thread_id=thread_id)

        return PersonalityRunResult(
            raw_output=raw,
            parsed_profile=extract_json_object(raw),
        )
    except Exception as exc:  # noqa: BLE001
        return PersonalityRunResult(
            raw_output=f"ERROR: {exc}",
            parsed_profile={},
        )
