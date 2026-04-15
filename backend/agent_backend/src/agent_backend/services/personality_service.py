import json
from typing import Any, Dict, List

from agent_backend.crew import create_personality_crew, get_personality_agent_config
from agent_backend.llm_runtime import enable_crewai_tracking, run_prompt_with_fallback
from agent_backend.models import BehaviorUpdateResult, ChatTurnResult, PersonalityRunResult
from agent_backend.parsers import extract_json_object, extract_questions
from agent_backend.prompts import (
    BEHAVIOR_UPDATE_PROMPT,
    CHAT_TURN_PROMPT,
    ONBOARDING_QUESTION_PROMPT,
    QUESTION_GENERATION_PROMPT,
)


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

        return PersonalityRunResult(
            raw_output=raw,
            parsed_profile=extract_json_object(raw),
        )
    except Exception as exc:  # noqa: BLE001
        return PersonalityRunResult(
            raw_output=f"ERROR: {exc}",
            parsed_profile={},
        )
