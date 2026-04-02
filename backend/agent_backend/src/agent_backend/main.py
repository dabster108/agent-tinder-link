import json
import os
import sys
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Dict, List

from dotenv import load_dotenv

from agent_backend.crew import run_personality_agent, run_personality_chat_turn


def _response_file_path() -> Path:
	return Path(__file__).resolve().parent / "response" / "agent_response.json"


def _load_env() -> None:
	env_path = Path(__file__).resolve().parents[2] / ".env"
	load_dotenv(dotenv_path=env_path, override=False)


def _iso_now() -> str:
	return datetime.now(timezone.utc).isoformat()


def _load_existing_sessions(path: Path) -> List[Dict[str, Any]]:
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


def _save_or_update_session(payload: Dict[str, Any]) -> Path:
	file_path = _response_file_path()
	file_path.parent.mkdir(parents=True, exist_ok=True)

	all_sessions = _load_existing_sessions(file_path)
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


def run() -> None:
	_load_env()

	skip_agent = os.getenv("SOULSYNC_SKIP_AGENT", "false").lower() == "true"
	max_turns = int(os.getenv("SOULSYNC_MAX_TURNS", "30"))

	session_payload: Dict[str, Any] = {
		"session_id": f"personality-chat-{datetime.now(timezone.utc).strftime('%Y%m%d%H%M%S')}",
		"created_at": _iso_now(),
		"last_updated_at": _iso_now(),
		"agent": "personality_agent",
		"mode": "conversation",
		"user": {"name": ""},
		"conversation": [],
		"profile": {},
		"notes": [],
	}

	print("\nSoulSync Personality Agent (chat mode)")
	print("Type 'exit' anytime to stop.\n")

	user_name = input("Agent: Hi, what should I call you?\nYou: ").strip() or "User"
	session_payload["user"] = {"name": user_name}
	print(f"\nAgent: Hi {user_name}. I am your SoulSync personality agent. Tell me something important about yourself.")

	turn_no = 0
	last_path = _save_or_update_session(session_payload)

	while turn_no < max_turns:
		user_message = input("You: ").strip()
		if not user_message:
			continue
		if user_message.lower() in {"exit", "quit", "done", "bye"}:
			break

		turn_no += 1

		if skip_agent:
			agent_reply = "Thanks for sharing. Can you tell me more about what matters most to you in relationships?"
			memory_update: Dict[str, Any] = {}
			raw_chat_output = "SOULSYNC_SKIP_AGENT=true"
		else:
			chat_result = run_personality_chat_turn(
				conversation_history=session_payload["conversation"],
				user_message=user_message,
				user_name=user_name,
			)
			agent_reply = chat_result.assistant_reply
			memory_update = chat_result.memory_update
			raw_chat_output = chat_result.raw_output

		session_payload["conversation"].append(
			{
				"turn": turn_no,
				"timestamp": _iso_now(),
				"user_message": user_message,
				"assistant_reply": agent_reply,
				"memory_update": memory_update,
				"raw_chat_output": raw_chat_output,
			}
		)

		if not skip_agent:
			profile_input = {
				"source": "conversation",
				"user_name": user_name,
				"conversation": [
					{
						"turn": x["turn"],
						"user_message": x["user_message"],
						"assistant_reply": x["assistant_reply"],
					}
					for x in session_payload["conversation"]
				],
			}
			profile_result = run_personality_agent(
				questionnaire_json=json.dumps(profile_input, ensure_ascii=True)
			)
			session_payload["profile"] = profile_result.parsed_profile
			session_payload["profile_raw_output"] = profile_result.raw_output

		session_payload["last_updated_at"] = _iso_now()
		session_payload["total_turns"] = turn_no

		last_path = _save_or_update_session(session_payload)
		print(f"Agent: {agent_reply}\n")

	print(f"\nSession saved to: {last_path}")
    


def train() -> None:
	print("Training mode is not configured yet for this project.")


def replay() -> None:
	print("Replay mode is not configured yet for this project.")


def test() -> None:
	print("Test mode is not configured yet for this project.")


def run_with_trigger() -> None:
	print("Trigger mode is not configured yet; running default flow.")
	run()


if __name__ == "__main__":
	try:
		run()
	except KeyboardInterrupt:
		print("\nSession cancelled by user.")
		sys.exit(1)
