from typing import Any, Dict, List

from agent_backend.models import ConversationContextResult, ConversationTurnResult
from agent_backend.parsers import extract_json_object

from agent_backend.services.service_runtime import (
    ApiLimitReachedError,
    as_json,
    run_task_with_fallback,
)
from agent_backend.prompts import (
    CONVERSATION_CONTEXT_PROMPT,
    CONVERSATION_TURN_PROMPT,
)


def _extract_turn_message(raw: str) -> str:
    parsed = extract_json_object(raw)
    if isinstance(parsed, dict):
        for key in ["assistant_reply", "message", "response", "text"]:
            value = parsed.get(key)
            if isinstance(value, str) and value.strip():
                return value.strip()

    text = (raw or "").strip()
    if text.startswith("```") and text.endswith("```"):
        text = text[3:-3].strip()
    return text or "That is interesting, can you tell me a bit more about that?"


def run_conversation_context_loader(
    user_name: str,
    personality_profile: Dict[str, Any],
    match_confidence: int,
    compatibility_reasons: str,
    match_flags: str,
    match_summary: str,
    thread_id: str | None = None,
) -> ConversationContextResult:

    prompt = CONVERSATION_CONTEXT_PROMPT.format(
        user_name=user_name,
        personality_profile_json=as_json(personality_profile),
        match_confidence=match_confidence,
        compatibility_reasons=compatibility_reasons,
        match_flags=match_flags,
        match_summary=match_summary,
    )

    inputs = {
        "user_name": user_name,
        "personality_profile_json": as_json(personality_profile),
        "match_confidence": match_confidence,
        "compatibility_reasons": compatibility_reasons,
        "match_flags": match_flags,
        "match_summary": match_summary,
    }

    try:
        raw = run_task_with_fallback(
            task_name="load_conversation_context",
            inputs=inputs,
            use_evaluation_agent=False,
            prompt=prompt,
            thread_id=thread_id,
        )
    except ApiLimitReachedError:
        raise
    except Exception as exc:  # noqa: BLE001
        fallback = {
            "user_name": user_name,
            "opening_energy": "Warm and curious in the first few turns, with one grounded question at a time.",
            "underlying_need": "Needs steady engagement and emotionally present replies to feel momentum.",
            "avoid_at_all_costs": "Do not rush intimacy or force depth before trust is earned.",
            "curiosity_seeds": ["daily life rhythms", "how they support people", "what makes conversations feel safe"],
            "voice_notes": "Acknowledge first, then add one specific question.",
        }
        return ConversationContextResult(raw_output=f"ERROR: {exc}", persona_anchor=fallback)

    parsed = extract_json_object(raw)
    if not isinstance(parsed, dict):
        parsed = {}

    persona_anchor = {
        "user_name": str(parsed.get("user_name", user_name) or user_name),
        "opening_energy": str(parsed.get("opening_energy", "Warm and curious with steady pacing.")).strip(),
        "underlying_need": str(parsed.get("underlying_need", "Needs genuine curiosity and consistency.")).strip(),
        "avoid_at_all_costs": str(parsed.get("avoid_at_all_costs", "Avoid forcing emotional intensity.")).strip(),
        "curiosity_seeds": parsed.get("curiosity_seeds", []),
        "voice_notes": str(parsed.get("voice_notes", "Acknowledge, then ask one natural question.")).strip(),
    }
    if not isinstance(persona_anchor["curiosity_seeds"], list):
        persona_anchor["curiosity_seeds"] = []

    return ConversationContextResult(raw_output=raw, persona_anchor=persona_anchor)


def run_conversation_turn(
    user_name: str,
    persona_anchor: Dict[str, Any],
    conversation_history: List[Dict[str, Any]],
    turn_number: int,
    match_confidence: int = 0,
    compatibility_reasons: str = "",
    match_flags: str = "",
    thread_id: str | None = None,
) -> ConversationTurnResult:

    prompt = CONVERSATION_TURN_PROMPT.format(
        user_name=user_name,
        persona_anchor_json=as_json(persona_anchor),
        conversation_history_json=as_json(conversation_history),
        turn_number=turn_number,
    )

    inputs = {
        "user_name": user_name,
        "persona_anchor_json": as_json(persona_anchor),
        "conversation_history": as_json(conversation_history),
        "turn_number": turn_number,
        "match_confidence": match_confidence,
        "compatibility_reasons": compatibility_reasons,
        "match_flags": match_flags,
    }

    try:
        raw = run_task_with_fallback(
            task_name="run_conversation_turn",
            inputs=inputs,
            use_evaluation_agent=False,
            prompt=prompt,
            thread_id=thread_id,
        )
    except ApiLimitReachedError:
        raise
    except Exception as exc:  # noqa: BLE001
        fallback_message = "That is genuinely interesting, what part of that feels most important to you right now?"
        return ConversationTurnResult(raw_output=f"ERROR: {exc}", message=fallback_message)

    message = _extract_turn_message(raw)
    return ConversationTurnResult(raw_output=raw, message=message)
