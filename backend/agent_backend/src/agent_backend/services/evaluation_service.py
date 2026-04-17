from typing import Any, Dict, List

from agent_backend.models import ConversationEvaluationResult, ConversationVerdictResult
from agent_backend.parsers import extract_json_object
from agent_backend.services.service_runtime import (
    ApiLimitReachedError,
    as_json,
    clamp,
    normalized_verdict,
    run_task_with_fallback,
)


def run_evaluation_checkpoint(
    conversation_history: List[Dict[str, Any]],
    turn_number: int,
    compatibility_reasons: str,
    match_flags: str,
    match_confidence: int,
    user_a_name: str,
    user_b_name: str,
    scores_history: List[Dict[str, Any]],
    thread_id: str | None = None,
) -> ConversationEvaluationResult:
    prompt = f"""
Evaluate this AI-to-AI dating conversation checkpoint.

CONVERSATION TRANSCRIPT JSON:
{as_json(conversation_history)}

TURN NUMBER: {turn_number}

MATCH CONTEXT:
- compatibility_reasons: {compatibility_reasons}
- match_flags: {match_flags}
- match_confidence: {match_confidence}
- user_a_name: {user_a_name}
- user_b_name: {user_b_name}

PREVIOUS CHECKPOINT SCORES JSON:
{as_json(scores_history)}

Score with these caps:
- emotional_resonance: 0-25
- topic_depth_progression: 0-20
- mutual_curiosity: 0-20
- value_alignment_signals: 0-20
- conversational_flow: 0-15

Compute connection_score (0-100) and verdict rules:
- score >= 72 -> NOTIFY
- score < 45 and turn_number >= 10 -> NO_MATCH
- otherwise CONTINUE

Return ONLY valid JSON with keys:
- turn_number
- scores (object with the five dimensions)
- connection_score
- score_delta
- arc_direction
- verdict
- evaluator_note
- highlight_moment (turn, speaker, quote, why_it_matters)
""".strip()

    inputs = {
        "conversation_history": as_json(conversation_history),
        "turn_number": turn_number,
        "compatibility_reasons": compatibility_reasons,
        "match_flags": match_flags,
        "match_confidence": match_confidence,
        "user_a_name": user_a_name,
        "user_b_name": user_b_name,
        "scores_history": as_json(scores_history),
    }

    try:
        raw = run_task_with_fallback(
            task_name="evaluate_conversation_turn",
            inputs=inputs,
            use_evaluation_agent=True,
            prompt=prompt,
            thread_id=thread_id,
        )
    except ApiLimitReachedError:
        raise
    except Exception as exc:  # noqa: BLE001
        fallback_payload = {
            "turn_number": turn_number,
            "scores": {
                "emotional_resonance": 0,
                "topic_depth_progression": 0,
                "mutual_curiosity": 0,
                "value_alignment_signals": 0,
                "conversational_flow": 0,
            },
            "connection_score": 0,
            "score_delta": None,
            "arc_direction": "flat",
            "verdict": normalized_verdict(0, turn_number),
            "evaluator_note": "Evaluation temporarily failed; defaulting to conservative scoring.",
            "highlight_moment": {
                "turn": turn_number,
                "speaker": user_a_name,
                "quote": "",
                "why_it_matters": "No evaluable highlight due to temporary error.",
            },
        }
        return ConversationEvaluationResult(raw_output=f"ERROR: {exc}", evaluation=fallback_payload)

    parsed = extract_json_object(raw)
    if not isinstance(parsed, dict):
        parsed = {}

    scores = parsed.get("scores", {})
    if not isinstance(scores, dict):
        scores = {}

    normalized_scores = {
        "emotional_resonance": clamp(int(scores.get("emotional_resonance", 0) or 0), 0, 25),
        "topic_depth_progression": clamp(int(scores.get("topic_depth_progression", 0) or 0), 0, 20),
        "mutual_curiosity": clamp(int(scores.get("mutual_curiosity", 0) or 0), 0, 20),
        "value_alignment_signals": clamp(int(scores.get("value_alignment_signals", 0) or 0), 0, 20),
        "conversational_flow": clamp(int(scores.get("conversational_flow", 0) or 0), 0, 15),
    }

    connection_score = clamp(int(parsed.get("connection_score", sum(normalized_scores.values())) or 0), 0, 100)
    verdict = normalized_verdict(
        connection_score=connection_score,
        turn_number=turn_number,
        verdict=str(parsed.get("verdict", "") or ""),
    )

    highlight = parsed.get("highlight_moment", {})
    if not isinstance(highlight, dict):
        highlight = {}

    evaluation_payload = {
        "turn_number": int(parsed.get("turn_number", turn_number) or turn_number),
        "scores": normalized_scores,
        "connection_score": connection_score,
        "score_delta": parsed.get("score_delta", None),
        "arc_direction": str(parsed.get("arc_direction", "flat") or "flat"),
        "verdict": verdict,
        "evaluator_note": str(parsed.get("evaluator_note", "No evaluator note provided.")).strip(),
        "highlight_moment": {
            "turn": int(highlight.get("turn", turn_number) or turn_number),
            "speaker": str(highlight.get("speaker", user_a_name)).strip(),
            "quote": str(highlight.get("quote", "")).strip(),
            "why_it_matters": str(highlight.get("why_it_matters", "No highlight rationale provided.")).strip(),
        },
    }

    return ConversationEvaluationResult(raw_output=raw, evaluation=evaluation_payload)


def run_connection_verdict(
    conversation_history: List[Dict[str, Any]],
    scores_history: List[Dict[str, Any]],
    final_connection_score: int,
    verdict: str,
    user_a_name: str,
    user_b_name: str,
    user_a_brief: str,
    user_b_brief: str,
    match_confidence: int,
    compatibility_reasons: str,
    match_flags: str,
    thread_id: str | None = None,
) -> ConversationVerdictResult:
    prompt = f"""
Create the final conversation verdict output.

CONVERSATION TRANSCRIPT JSON:
{as_json(conversation_history)}

CHECKPOINT SCORES JSON:
{as_json(scores_history)}

FINAL SCORE: {final_connection_score}
FINAL VERDICT: {verdict}

MATCH CONTEXT:
- user_a_name: {user_a_name}
- user_b_name: {user_b_name}
- user_a_brief: {user_a_brief}
- user_b_brief: {user_b_brief}
- match_confidence: {match_confidence}
- compatibility_reasons: {compatibility_reasons}
- match_flags: {match_flags}

Return ONLY valid JSON:
{{
    "notification": {{
        "headline": "...",
        "body": "...",
        "cta": "..."
    }},
    "system_summary": {{
        "final_connection_score": <int>,
        "total_turns": <int>,
        "verdict": "NOTIFY | NO_MATCH",
        "peak_score": <int>,
        "peak_score_turn": <int>,
        "score_progression": [<int>],
        "arc_description": "...",
        "top_3_moments": ["...", "...", "..."],
        "what_connected": "...",
        "what_to_watch": "...",
        "unlock_human_chat": <true | false>
    }}
}}
""".strip()

    normalized_verdict_input = str(verdict or "NO_MATCH").upper()
    if normalized_verdict_input not in {"NOTIFY", "NO_MATCH"}:
        normalized_verdict_input = "NO_MATCH"

    inputs = {
        "conversation_history": as_json(conversation_history),
        "scores_history": as_json(scores_history),
        "final_connection_score": final_connection_score,
        "verdict": normalized_verdict_input,
        "user_a_name": user_a_name,
        "user_b_name": user_b_name,
        "user_a_brief": user_a_brief,
        "user_b_brief": user_b_brief,
        "match_confidence": match_confidence,
        "compatibility_reasons": compatibility_reasons,
        "match_flags": match_flags,
    }

    try:
        raw = run_task_with_fallback(
            task_name="produce_connection_verdict",
            inputs=inputs,
            use_evaluation_agent=True,
            prompt=prompt,
            thread_id=thread_id,
        )
    except ApiLimitReachedError:
        raise
    except Exception as exc:  # noqa: BLE001
        fallback = {
            "notification": {
                "headline": f"Conversation review complete for {user_a_name} and {user_b_name}",
                "body": "The agents completed their conversation review. You can now see the summary in the app.",
                "cta": "See conversation summary",
            },
            "system_summary": {
                "final_connection_score": final_connection_score,
                "total_turns": len(conversation_history),
                "verdict": normalized_verdict_input,
                "peak_score": final_connection_score,
                "peak_score_turn": len(conversation_history),
                "score_progression": [item.get("connection_score", 0) for item in scores_history if isinstance(item, dict)],
                "arc_description": "flat",
                "top_3_moments": [],
                "what_connected": "Final verdict generated with fallback due to temporary model error.",
                "what_to_watch": "Re-run evaluation for richer summary if needed.",
                "unlock_human_chat": normalized_verdict_input == "NOTIFY",
            },
        }
        return ConversationVerdictResult(raw_output=f"ERROR: {exc}", verdict_payload=fallback)

    parsed = extract_json_object(raw)
    if not isinstance(parsed, dict):
        parsed = {}

    notification = parsed.get("notification", {})
    if not isinstance(notification, dict):
        notification = {}

    system_summary = parsed.get("system_summary", {})
    if not isinstance(system_summary, dict):
        system_summary = {}

    fallback_progression = [item.get("connection_score", 0) for item in scores_history if isinstance(item, dict)]
    normalized_final_verdict = str(system_summary.get("verdict", normalized_verdict_input) or normalized_verdict_input).upper()
    if normalized_final_verdict not in {"NOTIFY", "NO_MATCH"}:
        normalized_final_verdict = normalized_verdict_input

    final_payload = {
        "notification": {
            "headline": str(notification.get("headline", f"Connection update for {user_a_name} and {user_b_name}")).strip(),
            "body": str(notification.get("body", "Your agent conversation review is complete.")).strip(),
            "cta": str(notification.get("cta", "See details")).strip(),
        },
        "system_summary": {
            "final_connection_score": clamp(int(system_summary.get("final_connection_score", final_connection_score) or final_connection_score), 0, 100),
            "total_turns": int(system_summary.get("total_turns", len(conversation_history)) or len(conversation_history)),
            "verdict": normalized_final_verdict,
            "peak_score": clamp(int(system_summary.get("peak_score", max(fallback_progression) if fallback_progression else final_connection_score) or final_connection_score), 0, 100),
            "peak_score_turn": int(system_summary.get("peak_score_turn", len(conversation_history)) or len(conversation_history)),
            "score_progression": system_summary.get("score_progression", fallback_progression),
            "arc_description": str(system_summary.get("arc_description", "flat") or "flat"),
            "top_3_moments": system_summary.get("top_3_moments", []),
            "what_connected": str(system_summary.get("what_connected", "No structured summary returned.")).strip(),
            "what_to_watch": str(system_summary.get("what_to_watch", "No watch item returned.")).strip(),
            "unlock_human_chat": bool(system_summary.get("unlock_human_chat", normalized_final_verdict == "NOTIFY")),
        },
    }

    if not isinstance(final_payload["system_summary"]["score_progression"], list):
        final_payload["system_summary"]["score_progression"] = fallback_progression
    if not isinstance(final_payload["system_summary"]["top_3_moments"], list):
        final_payload["system_summary"]["top_3_moments"] = []

    return ConversationVerdictResult(raw_output=raw, verdict_payload=final_payload)
