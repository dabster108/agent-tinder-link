import json
import os
import sys
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Dict, List


from dotenv import load_dotenv

from agent_backend.crew import (
	run_onboarding_question_generator,
	run_matching_agent,
	run_personality_agent,
	run_personality_behavior_update,
	run_personality_chat_turn,
)


def _response_file_path() -> Path:
	return Path(__file__).resolve().parent / "response" / "agent_response.json"


def _load_env() -> None:
	env_path = Path(__file__).resolve().parents[2] / ".env"
	load_dotenv(dotenv_path=env_path, override=False)


def _iso_now() -> str:
	return datetime.now(timezone.utc).isoformat()


def _build_dummy_user_context(user_name: str) -> Dict[str, Any]:
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


def _default_onboarding_questions() -> List[Dict[str, str]]:
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


def _find_best_session_for_username(
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


def run_matching_flow(target_username: str) -> Dict[str, Any]:
	"""Run matching for one saved username against the rest of the session pool."""
	all_sessions = _load_existing_sessions(_response_file_path())
	if not all_sessions:
		print("No saved sessions were found yet.")
		return {}

	target_session = _find_best_session_for_username(all_sessions, target_username)
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
		"onboarding": {
			"user_context": {},
			"questions": [],
			"answers": [],
		},
		"conversation": [],
		"profile": {},
		"behavior_updates": [],
		"notes": [],
	}
	thread_id = session_payload["session_id"]

	print("\nSoulSync Personality Agent (chat mode)")
	print("Type 'exit' anytime to stop.\n")

	user_name = input("Agent: Hi, what should I call you?\nYou: ").strip() or "User"
	session_payload["user"] = {"name": user_name}
	user_context = _build_dummy_user_context(user_name)
	session_payload["onboarding"]["user_context"] = user_context

	if skip_agent:
		onboarding_questions = _default_onboarding_questions()
	else:
		onboarding_questions = run_onboarding_question_generator(
			user_context,
			thread_id=thread_id,
		)
		if len(onboarding_questions) < 5:
			onboarding_questions = _default_onboarding_questions()

	onboarding_questions = onboarding_questions[:5]
	session_payload["onboarding"]["questions"] = onboarding_questions

	print(f"\nAgent: Hi {user_name}. I am your SoulSync personality agent. Let's start with a few scenario questions.")

	for index, question in enumerate(onboarding_questions, start=1):
		print(f"\nAgent: {question['question']}")
		user_answer = input("You: ").strip()
		while not user_answer:
			print("Agent: take your time - even a short answer works.")
			user_answer = input("You: ").strip()

		session_payload["onboarding"]["answers"].append(
			{
				"step": index,
				"timestamp": _iso_now(),
				"question": question,
				"answer": user_answer,
			}
		)

		if index < len(onboarding_questions):
			print("Agent: okay, that tracks.\n")
		else:
			print("Agent: that helps a lot. I have enough to shape the rest of what I know.\n")

	if skip_agent:
		profile_result = None
		profile_payload = {}
		profile_raw_output = "SOULSYNC_SKIP_AGENT=true"
	else:
		profile_input = {
			"source": "onboarding",
			"user_name": user_name,
			"user_context": user_context,
			"questions": onboarding_questions,
			"answers": [
				{
					"step": item["step"],
					"question_id": item["question"].get("id", f"question_{item['step']}") if isinstance(item.get("question"), dict) else f"question_{item['step']}",
					"question": item["question"].get("question", "") if isinstance(item.get("question"), dict) else "",
					"focus": item["question"].get("focus", "") if isinstance(item.get("question"), dict) else "",
					"answer": item["answer"],
				}
				for item in session_payload["onboarding"]["answers"]
			],
		}
		profile_result = run_personality_agent(
			questionnaire_json=json.dumps(profile_input, ensure_ascii=True),
			thread_id=thread_id,
		)
		profile_payload = profile_result.parsed_profile
		profile_raw_output = profile_result.raw_output

	session_payload["profile"] = profile_payload
	session_payload["profile_raw_output"] = profile_raw_output
	session_payload["last_updated_at"] = _iso_now()
	last_path = _save_or_update_session(session_payload)

	print(f"Agent: Hi {user_name}. I am your SoulSync personality agent. You can keep chatting normally now.")

	turn_no = 0

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
				thread_id=thread_id,
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
			behavior_result = run_personality_behavior_update(
				conversation_history=session_payload["conversation"],
				user_name=user_name,
				thread_id=thread_id,
			)
			session_payload["behavior_updates"].append(
				{
					"turn": turn_no,
					"timestamp": _iso_now(),
					"raw_output": behavior_result.raw_output,
					"behavior_update": behavior_result.behavior_update,
				}
			)
			session_payload["notes"] = session_payload["behavior_updates"][-3:]

		session_payload["last_updated_at"] = _iso_now()
		session_payload["total_turns"] = turn_no

		last_path = _save_or_update_session(session_payload)
		print(f"Agent: {agent_reply}\n")

	print(f"\nSession saved to: {last_path}")


def run_matching_from_cli(username: str) -> None:
	_load_env()
	print(f"\nSoulSync matching mode for {username}")
	run_matching_flow(username)


def run_matching_cli() -> None:
	if len(sys.argv) < 2:
		print("Usage: match <username>")
		sys.exit(1)

	run_matching_from_cli(sys.argv[1])
    
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
		if len(sys.argv) >= 3 and sys.argv[2].lower() == "match":
			run_matching_from_cli(sys.argv[1])
		else:
			run()
	except KeyboardInterrupt:
		print("\nSession cancelled by user.")
		sys.exit(1)
