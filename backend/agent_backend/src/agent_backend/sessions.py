import json
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Dict, List

from dotenv import load_dotenv


def response_file_path() -> Path:
    return Path(__file__).resolve().parent / "response" / "agent_response.json"


def load_env() -> None:
    env_path = Path(__file__).resolve().parents[2] / ".env"
    load_dotenv(dotenv_path=env_path, override=False)


def iso_now() -> str:
    return datetime.now(timezone.utc).isoformat()


def build_dummy_user_context(user_name: str) -> Dict[str, Any]:
    return {
        "name": user_name,
        "age": "unknown",
        "location": "unknown",
        "interests": [],
        "lifestyle": [],
        "relationship_goals": [],
        "account_notes": [
            "No signup profile details have been captured yet.",
            "Use vivid universal scenarios if the account context is sparse.",
        ],
    }


def default_onboarding_questions() -> List[Dict[str, str]]:
    return [
        {
            "id": "openness_unknown_place",
            "question": "You get a last-minute invite to spend the evening somewhere you've never been before with people you barely know. What do you actually do?",
            "focus": "openness to experience",
        },
        {
            "id": "extraversion_social_fatigue",
            "question": "You've had a draining week, but your friends want you out for a few hours. Halfway through the hangout, how are you really feeling?",
            "focus": "extraversion",
        },
        {
            "id": "agreeableness_honesty",
            "question": "You're watching something with a person you like, but you cannot stand it. Do you say something, fake it, or keep the peace?",
            "focus": "agreeableness",
        },
        {
            "id": "conscientiousness_group_trip",
            "question": "A group trip is coming together and nobody is organizing it. What role do you naturally fall into?",
            "focus": "conscientiousness",
        },
        {
            "id": "emotional_stability_read_receipt",
            "question": "You send a vulnerable message and it stays unread longer than expected. What starts happening in your head?",
            "focus": "emotional stability",
        },
    ]


def load_existing_sessions(path: Path) -> List[Dict[str, Any]]:
    if not path.exists() or path.stat().st_size == 0:
        return []

    try:
        content = json.loads(path.read_text(encoding="utf-8"))
    except json.JSONDecodeError:
        return []

    if isinstance(content, list):
        return content

    if isinstance(content, dict):
        return [content]

    return []


def save_or_update_session(payload: Dict[str, Any]) -> Path:
    file_path = response_file_path()
    file_path.parent.mkdir(parents=True, exist_ok=True)

    all_sessions = load_existing_sessions(file_path)
    session_id = payload.get("session_id")
    replaced = False

    for idx, item in enumerate(all_sessions):
        if isinstance(item, dict) and item.get("session_id") == session_id:
            all_sessions[idx] = payload
            replaced = True
            break

    if not replaced:
        all_sessions.append(payload)

    file_path.write_text(
        json.dumps(all_sessions, indent=2, ensure_ascii=True),
        encoding="utf-8",
    )
    return file_path


def save_matching_results(username: str, matches: Dict[str, Any]) -> Path:
    """Save matching results to a JSON file in the matches folder."""
    matches_dir = Path(__file__).resolve().parent / "matches"
    matches_dir.mkdir(parents=True, exist_ok=True)

    timestamp = datetime.now(timezone.utc).strftime("%Y%m%d_%H%M%S")
    filename = f"{username}_{timestamp}_matches.json"
    file_path = matches_dir / filename

    output = {
        "username": username,
        "generated_at": iso_now(),
        "matches": matches,
    }

    file_path.write_text(
        json.dumps(output, indent=2, ensure_ascii=True),
        encoding="utf-8",
    )
    return file_path


def find_best_session_for_username(
    all_sessions: List[Dict[str, Any]],
    username: str,
) -> Dict[str, Any]:
    target_name = username.strip().lower()
    matching_sessions: List[Dict[str, Any]] = []

    for session in all_sessions:
        if not isinstance(session, dict):
            continue
        user = session.get("user", {})
        if not isinstance(user, dict):
            continue
        name = str(user.get("name", "")).strip().lower()
        if name == target_name:
            matching_sessions.append(session)

    if not matching_sessions:
        return {}

    def _session_sort_key(session: Dict[str, Any]) -> tuple[int, int, str]:
        profile = session.get("profile", {})
        profile_size = len(profile) if isinstance(profile, dict) else 0
        total_turns = int(session.get("total_turns", 0) or 0)
        return (profile_size, total_turns, str(session.get("last_updated_at", "")))

    return sorted(matching_sessions, key=_session_sort_key, reverse=True)[0]
