import json
import os
from pathlib import Path
from typing import Any, Dict, List, Tuple

from agent_backend.services.conversation_service import (
    run_conversation_context_loader,
    run_conversation_turn,
)
from agent_backend.services.evaluation_service import (
    run_connection_verdict,
    run_evaluation_checkpoint,
)
from agent_backend.services.service_runtime import ApiLimitReachedError
from agent_backend.sessions import (
    find_best_session_for_username,
    has_pair_conversation,
    iso_now,
    latest_matches_file_for_username,
    load_existing_sessions,
    load_matches_payload,
    matches_dir_path,
    response_file_path,
    save_conversation_record,
)


def _resolve_matches_file(target_username: str, matches_ref: str) -> Path | None:
    ref = (matches_ref or "matches").strip()
    if not ref or ref.lower() == "matches":
        return latest_matches_file_for_username(target_username)

    direct = Path(ref)
    if direct.exists() and direct.is_file():
        return direct

    matches_dir = matches_dir_path()
    in_matches_dir = matches_dir / ref
    if in_matches_dir.exists() and in_matches_dir.is_file():
        return in_matches_dir

    if not ref.lower().endswith(".json"):
        with_json = matches_dir / f"{ref}.json"
        if with_json.exists() and with_json.is_file():
            return with_json

    return None


def _extract_matches(matches_payload: Dict[str, Any]) -> List[Dict[str, Any]]:
    if not isinstance(matches_payload, dict):
        return []

    matches_obj = matches_payload.get("matches", {})
    if not isinstance(matches_obj, dict):
        return []

    matches_list = matches_obj.get("matches", [])
    if not isinstance(matches_list, list):
        return []

    return [item for item in matches_list if isinstance(item, dict)]


def _get_candidate_name(match_item: Dict[str, Any]) -> str:
    candidate_user = match_item.get("candidate_user", {})
    if isinstance(candidate_user, dict):
        name = str(candidate_user.get("name", "")).strip()
        if name:
            return name

    target_user = match_item.get("target_user", {})
    if isinstance(target_user, dict):
        name = str(target_user.get("name", "")).strip()
        if name:
            return name

    return ""


def _safe_match_context(match_item: Dict[str, Any]) -> Tuple[int, str, str, str]:
    score = int(match_item.get("compatibility_score", 0) or 0)
    why = str(match_item.get("why_they_match", "")).strip()
    topics = str(match_item.get("what_theyd_talk_about", "")).strip()
    flag = str(match_item.get("the_honest_flag", "")).strip()

    reasons = why
    if topics:
        reasons = f"{reasons} Topics: {topics}".strip()

    summary = json.dumps(match_item, ensure_ascii=True)
    return score, reasons, flag, summary


def _profile_brief(profile: Dict[str, Any]) -> str:
    if not isinstance(profile, dict) or not profile:
        return "Profile details unavailable"
    summary = str(profile.get("summary", "")).strip()
    if summary:
        return summary
    return json.dumps(profile, ensure_ascii=True)


def _simulate_pair_conversation(
    user_a_name: str,
    user_b_name: str,
    user_a_profile: Dict[str, Any],
    user_b_profile: Dict[str, Any],
    match_item: Dict[str, Any],
) -> Dict[str, Any]:
    max_turns = max(2, int(os.getenv("SOULSYNC_CONVO_MAX_TURNS", "12")))
    evaluation_every_turns = max(2, int(os.getenv("SOULSYNC_EVAL_EVERY_TURNS", "2")))

    match_confidence, compatibility_reasons, match_flags, match_summary = _safe_match_context(match_item)
    pair_thread_id = f"convo::{user_a_name.lower()}::{user_b_name.lower()}"

    anchor_a = run_conversation_context_loader(
        user_name=user_a_name,
        personality_profile=user_a_profile,
        match_confidence=match_confidence,
        compatibility_reasons=compatibility_reasons,
        match_flags=match_flags,
        match_summary=match_summary,
        thread_id=pair_thread_id,
    )
    anchor_b = run_conversation_context_loader(
        user_name=user_b_name,
        personality_profile=user_b_profile,
        match_confidence=match_confidence,
        compatibility_reasons=compatibility_reasons,
        match_flags=match_flags,
        match_summary=match_summary,
        thread_id=pair_thread_id,
    )

    conversation_history: List[Dict[str, Any]] = []
    scores_history: List[Dict[str, Any]] = []

    verdict = "CONTINUE"
    stop_reason = "max_turn_limit"

    speaker_is_user_a = True
    turn_number = 0

    while turn_number < max_turns:
        turn_number += 1

        speaker_name = user_a_name if speaker_is_user_a else user_b_name
        active_anchor = anchor_a.persona_anchor if speaker_is_user_a else anchor_b.persona_anchor

        turn_result = run_conversation_turn(
            user_name=speaker_name,
            persona_anchor=active_anchor,
            conversation_history=conversation_history,
            turn_number=turn_number,
            match_confidence=match_confidence,
            compatibility_reasons=compatibility_reasons,
            match_flags=match_flags,
            thread_id=pair_thread_id,
        )

        conversation_history.append(
            {
                "turn": turn_number,
                "speaker": speaker_name,
                "message": turn_result.message,
                "timestamp": iso_now(),
            }
        )

        speaker_is_user_a = not speaker_is_user_a

        if turn_number % evaluation_every_turns == 0:
            evaluation_result = run_evaluation_checkpoint(
                conversation_history=conversation_history,
                turn_number=turn_number,
                compatibility_reasons=compatibility_reasons,
                match_flags=match_flags,
                match_confidence=match_confidence,
                user_a_name=user_a_name,
                user_b_name=user_b_name,
                scores_history=scores_history,
                thread_id=pair_thread_id,
            )

            checkpoint = evaluation_result.evaluation
            scores_history.append(checkpoint)
            verdict = str(checkpoint.get("verdict", "CONTINUE") or "CONTINUE").upper()

            if verdict in {"NOTIFY", "NO_MATCH"}:
                stop_reason = "evaluation_verdict"
                break

    if not scores_history or int(scores_history[-1].get("turn_number", 0) or 0) != turn_number:
        evaluation_result = run_evaluation_checkpoint(
            conversation_history=conversation_history,
            turn_number=turn_number,
            compatibility_reasons=compatibility_reasons,
            match_flags=match_flags,
            match_confidence=match_confidence,
            user_a_name=user_a_name,
            user_b_name=user_b_name,
            scores_history=scores_history,
            thread_id=pair_thread_id,
        )
        scores_history.append(evaluation_result.evaluation)

    verdict = str(scores_history[-1].get("verdict", "CONTINUE") or "CONTINUE").upper()
    final_connection_score = int(scores_history[-1].get("connection_score", 0) or 0)

    if verdict == "CONTINUE":
        verdict = "NOTIFY" if final_connection_score >= 72 else "NO_MATCH"
        stop_reason = "max_turn_limit"

    final_verdict_result = run_connection_verdict(
        conversation_history=conversation_history,
        scores_history=scores_history,
        final_connection_score=final_connection_score,
        verdict=verdict,
        user_a_name=user_a_name,
        user_b_name=user_b_name,
        user_a_brief=_profile_brief(user_a_profile),
        user_b_brief=_profile_brief(user_b_profile),
        match_confidence=match_confidence,
        compatibility_reasons=compatibility_reasons,
        match_flags=match_flags,
        thread_id=pair_thread_id,
    )

    return {
        "participants": [user_a_name, user_b_name],
        "source_match": {
            "rank": match_item.get("rank", None),
            "compatibility_score": match_item.get("compatibility_score", None),
            "candidate_user": match_item.get("candidate_user", {}),
        },
        "conversation": conversation_history,
        "checkpoints": scores_history,
        "final": final_verdict_result.verdict_payload,
        "stop_reason": stop_reason,
        "max_turns": max_turns,
        "evaluation_every_turns": evaluation_every_turns,
    }


def run_conversation_flow(target_username: str, matches_ref: str = "matches") -> Dict[str, Any]:
    all_sessions = load_existing_sessions(response_file_path())
    if not all_sessions:
        print("No saved sessions were found yet.")
        return {}

    target_session = find_best_session_for_username(all_sessions, target_username)
    if not target_session:
        print(f"No saved profile found for username: {target_username}")
        return {}

    target_profile = target_session.get("profile", {})
    if not isinstance(target_profile, dict) or not target_profile:
        print(f"Profile for {target_username} is not complete enough for conversation yet.")
        return {}

    matches_file = _resolve_matches_file(target_username, matches_ref)
    if not matches_file:
        print(
            f"No matches file found for {target_username}. Run matching first or provide a file path as the second argument."
        )
        return {}

    matches_payload = load_matches_payload(matches_file)
    match_items = _extract_matches(matches_payload)
    if not match_items:
        print(f"No matches found in file: {matches_file}")
        return {}

    max_matches = int(os.getenv("SOULSYNC_CONVO_MAX_MATCHES", "0") or 0)
    if max_matches > 0:
        match_items = match_items[:max_matches]

    processed: List[Dict[str, Any]] = []
    skipped: List[Dict[str, Any]] = []

    print(f"\nStarting conversation simulations for {target_username} using {matches_file.name}")

    for match_item in match_items:
        candidate_name = _get_candidate_name(match_item)
        if not candidate_name:
            skipped.append({"reason": "missing_candidate_name", "match": match_item})
            continue

        if candidate_name.strip().lower() == target_username.strip().lower():
            skipped.append({"candidate": candidate_name, "reason": "self_pair"})
            continue

        if has_pair_conversation(target_username, candidate_name):
            skipped.append(
                {
                    "candidate": candidate_name,
                    "reason": "already_conversed",
                }
            )
            print(f"- Skipping {target_username} x {candidate_name}: conversation already exists.")
            continue

        candidate_session = find_best_session_for_username(all_sessions, candidate_name)
        if not candidate_session:
            skipped.append({"candidate": candidate_name, "reason": "candidate_profile_not_found"})
            print(f"- Skipping {target_username} x {candidate_name}: candidate session not found.")
            continue

        candidate_profile = candidate_session.get("profile", {})
        if not isinstance(candidate_profile, dict) or not candidate_profile:
            skipped.append({"candidate": candidate_name, "reason": "candidate_profile_empty"})
            print(f"- Skipping {target_username} x {candidate_name}: candidate profile incomplete.")
            continue

        print(f"- Simulating conversation: {target_username} x {candidate_name}")

        try:
            conversation_payload = _simulate_pair_conversation(
                user_a_name=target_username,
                user_b_name=candidate_name,
                user_a_profile=target_profile,
                user_b_profile=candidate_profile,
                match_item=match_item,
            )
        except ApiLimitReachedError as exc:
            message = str(exc).strip() or "API limit reached. Please update/reset your model quota and run again."
            print(f"- Stopping conversation flow: {message}")

            summary = {
                "target_username": target_username,
                "matches_file": str(matches_file),
                "matches_considered": len(match_items),
                "processed_count": len(processed),
                "skipped_count": len(skipped),
                "processed": processed,
                "skipped": skipped,
                "error": message,
            }
            print("\nConversation simulation summary")
            print(json.dumps(summary, indent=2, ensure_ascii=True))
            return summary

        conversation_path = save_conversation_record(
            user_a=target_username,
            user_b=candidate_name,
            payload=conversation_payload,
        )

        final_summary = conversation_payload.get("final", {}).get("system_summary", {})
        final_verdict = str(final_summary.get("verdict", "NO_MATCH"))
        final_score = int(final_summary.get("final_connection_score", 0) or 0)

        processed.append(
            {
                "candidate": candidate_name,
                "file": str(conversation_path),
                "final_verdict": final_verdict,
                "final_score": final_score,
            }
        )

        print(
            f"  Saved: {conversation_path.name} | verdict={final_verdict} | score={final_score}"
        )

    summary = {
        "target_username": target_username,
        "matches_file": str(matches_file),
        "matches_considered": len(match_items),
        "processed_count": len(processed),
        "skipped_count": len(skipped),
        "processed": processed,
        "skipped": skipped,
    }

    print("\nConversation simulation summary")
    print(json.dumps(summary, indent=2, ensure_ascii=True))

    return summary
