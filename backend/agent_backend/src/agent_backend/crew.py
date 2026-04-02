import json
import os
import time
from dataclasses import dataclass
from typing import Any, Dict, List

from crewai import Agent, Crew, Process, Task
from crewai.agents.agent_builder.base_agent import BaseAgent
from crewai.project import CrewBase, agent, crew, task


@dataclass
class PersonalityRunResult:
	raw_output: str
	parsed_profile: Dict[str, Any]


@dataclass
class ChatTurnResult:
	raw_output: str
	assistant_reply: str
	memory_update: Dict[str, Any]


QUESTION_GENERATION_PROMPT = """
Generate exactly {question_count} deep personality onboarding questions for SoulSync.

You are writing questions for one user so an AI agent can understand:
- values
- communication style
- behavior patterns
- relationship preferences
- boundaries and non-negotiables
- conflict and stress behavior
- growth mindset

Return ONLY valid JSON with this schema:
{
  "questions": [
	{
	  "id": "snake_case_id",
	  "question": "question text",
	  "focus": "what this question measures"
	}
  ]
}

Rules:
- Keep each question concise and conversational.
- Avoid yes/no-only questions.
- Use unique ids.
- Do not include markdown fences.
""".strip()


CHAT_TURN_PROMPT = """
You are SoulSync Personality Agent. Talk like a warm and intelligent personal AI companion.

Goals:
- Build trust through natural conversation.
- Understand the user deeply over time.
- Ask only one thoughtful follow-up question each turn.

User name: {user_name}
Conversation history JSON:
{history_json}

Latest user message:
{user_message}

Return ONLY valid JSON:
{{
	"assistant_reply": "natural conversational reply ending with one follow-up question",
	"memory_update": {{
		"values_signals": ["..."],
		"communication_notes": ["..."],
		"behavior_signals": ["..."],
		"relationship_goals": ["..."],
		"boundaries": ["..."]
	}}
}}
""".strip()


@CrewBase
class AgentBackend:
	"""Crew for SoulSync personality profiling."""

	agents: List[BaseAgent]
	tasks: List[Task]

	agents_config = "config/agents.yaml"
	tasks_config = "config/tasks.yaml"

	@agent
	def personality_agent(self) -> Agent:
		return Agent(
			config=self.agents_config["personality_agent"],
			verbose=True,
		)

	@task
	def build_personality_profile(self) -> Task:
		return Task(
			config=self.tasks_config["build_personality_profile"],
		)

	@crew
	def crew(self) -> Crew:
		return Crew(
			agents=self.agents,
			tasks=self.tasks,
			process=Process.sequential,
			verbose=True,
		)


def extract_json_object(raw_text: str) -> Dict[str, Any]:
	"""Parse model output into JSON, even if extra text is included."""
	text = (raw_text or "").strip()
	if not text:
		return {}

	try:
		return json.loads(text)
	except json.JSONDecodeError:
		pass

	start = text.find("{")
	end = text.rfind("}")
	if start == -1 or end == -1 or end <= start:
		return {}

	candidate = text[start : end + 1]
	try:
		return json.loads(candidate)
	except json.JSONDecodeError:
		return {}


def extract_questions(raw_text: str) -> List[Dict[str, str]]:
	parsed = extract_json_object(raw_text)
	items = parsed.get("questions", []) if isinstance(parsed, dict) else []
	if not isinstance(items, list):
		return []

	questions: List[Dict[str, str]] = []
	for idx, item in enumerate(items, start=1):
		if not isinstance(item, dict):
			continue

		question = str(item.get("question", "")).strip()
		if not question:
			continue

		qid = str(item.get("id", "")).strip() or f"question_{idx}"
		focus = str(item.get("focus", "")).strip()

		questions.append(
			{
				"id": qid,
				"question": question,
				"focus": focus,
			}
		)

	return questions


def _get_model_candidates() -> List[str]:
	primary = (os.getenv("MODEL", "") or "gemini/gemini-2.5-flash").strip()
	fallback_raw = os.getenv(
		"SOULSYNC_MODEL_FALLBACKS", "gemini/gemini-2.5-flash"
	)
	fallback_models = [item.strip() for item in fallback_raw.split(",") if item.strip()]

	candidates: List[str] = []
	for model in [primary] + fallback_models:
		if model and model not in candidates:
			candidates.append(model)
	return candidates


def _is_high_demand_error(exc: Exception) -> bool:
	message = str(exc).lower()
	return (
		"503" in message
		or "unavailable" in message
		or "high demand" in message
		or "resource_exhausted" in message
	)


def _run_prompt_with_fallback(prompt: str) -> str:
	backend = AgentBackend()
	candidates = _get_model_candidates()
	max_retries = max(1, int(os.getenv("SOULSYNC_LLM_RETRIES", "3")))
	last_error: Exception | None = None

	for model in candidates:
		for attempt in range(1, max_retries + 1):
			try:
				lite_agent = Agent(
					config=backend.agents_config["personality_agent"],
					llm=model,
					verbose=True,
				)
				output = lite_agent.kickoff(prompt)
				raw = getattr(output, "raw", None)
				if raw is None:
					raw = str(output)
				return raw
			except Exception as exc:  # noqa: BLE001
				last_error = exc
				if _is_high_demand_error(exc) and attempt < max_retries:
					time.sleep(min(2**attempt, 6))
					continue
				break

	if last_error is not None:
		raise last_error
	raise RuntimeError("LLM call failed without a captured exception.")


def run_personality_question_generator(question_count: int = 12) -> List[Dict[str, str]]:
	count = max(6, min(question_count, 20))
	prompt = QUESTION_GENERATION_PROMPT.format(question_count=count)
	raw = _run_prompt_with_fallback(prompt)
	return extract_questions(raw)


def run_personality_chat_turn(
	conversation_history: List[Dict[str, Any]], user_message: str, user_name: str = "User"
) -> ChatTurnResult:
	history_json = json.dumps(conversation_history, ensure_ascii=True)
	prompt = CHAT_TURN_PROMPT.format(
		user_name=user_name,
		history_json=history_json,
		user_message=user_message,
	)

	try:
		raw = _run_prompt_with_fallback(prompt)
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


def run_personality_agent(questionnaire_json: str) -> PersonalityRunResult:
	try:
		output = AgentBackend().crew().kickoff(
			inputs={"questionnaire_json": questionnaire_json}
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
