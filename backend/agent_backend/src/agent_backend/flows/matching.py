import json
from typing import Any, Dict

from agent_backend.services.matching_service import run_matching_agent
from agent_backend.sessions import (
    find_best_session_for_username,
    load_existing_sessions,
    response_file_path,
    save_matching_results,
)


def run_matching_flow(target_username: str) -> Dict[str, Any]:
    """Run matching for one saved username against the rest of the session pool."""
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
        print(f"Profile for {target_username} is not complete enough for matching yet.")
        return {}

    result = run_matching_agent(
        sessions_json=json.dumps(all_sessions, ensure_ascii=True),
        target_profile_json=json.dumps(target_profile, ensure_ascii=True),
        target_session_id=str(target_session.get("session_id", "")),
        thread_id=str(target_session.get("session_id", "")),
    )

    matches = result.parsed_matches if isinstance(result.parsed_matches, dict) else {}
    if not matches:
        print("No matching result was produced.")
        return {}

    matches_file = save_matching_results(target_username, matches)
    print(f"\nMatching results saved to: {matches_file}")

    analysis_summary = matches.get("analysis_summary", {}) if isinstance(matches, dict) else {}
    print(f"\nMatching results for {target_username}")
    if isinstance(analysis_summary, dict) and analysis_summary:
        print(json.dumps(analysis_summary, indent=2, ensure_ascii=True))

    for match in matches.get("matches", [])[:3] if isinstance(matches, dict) else []:
        if not isinstance(match, dict):
            continue
        candidate = match.get("candidate_user", {})
        candidate_name = candidate.get("name", "unknown") if isinstance(candidate, dict) else "unknown"
        print(f"- {match.get('rank', '?')}: {candidate_name} ({match.get('compatibility_score', 0)}/100)")

    return matches
