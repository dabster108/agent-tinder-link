import json
from copy import deepcopy
from typing import Any, Dict

from crewai import Agent, Crew, Process, Task

from agent_backend.crew import (
    get_conversation_agent_config,
    get_evaluation_agent_config,
    get_task_config,
)
from agent_backend.llm_runtime import enable_crewai_tracking, run_prompt_with_fallback


class ApiLimitReachedError(RuntimeError):
    """Raised when the model provider reports quota or rate-limit exhaustion."""


def as_json(value: Any) -> str:
    return json.dumps(value, ensure_ascii=True)


def clamp(value: int, minimum: int, maximum: int) -> int:
    return max(minimum, min(value, maximum))


def normalized_verdict(connection_score: int, turn_number: int, verdict: str | None = None) -> str:
    if isinstance(verdict, str) and verdict.strip().upper() in {"NOTIFY", "CONTINUE", "NO_MATCH"}:
        return verdict.strip().upper()

    if connection_score >= 72:
        return "NOTIFY"
    if connection_score < 45 and turn_number >= 10:
        return "NO_MATCH"
    return "CONTINUE"


def _is_quota_or_rate_limit_error(exc: Exception) -> bool:
    message = str(exc).lower()
    return (
        "429" in message
        or "quota" in message
        or "resource_exhausted" in message
        or "rate limit" in message
        or "too many requests" in message
    )


def raise_if_api_limit(exc: Exception) -> None:
    if _is_quota_or_rate_limit_error(exc):
        raise ApiLimitReachedError(
            "API limit reached. Please update/reset your model quota and run the conversation again."
        ) from exc


def _kickoff_task(
    task_name: str,
    inputs: Dict[str, Any],
    use_evaluation_agent: bool,
    thread_id: str | None = None,
) -> str:
    selected_agent_config = get_evaluation_agent_config() if use_evaluation_agent else get_conversation_agent_config()
    selected_agent = Agent(
        config=selected_agent_config,
        verbose=True,
    )

    task_config = deepcopy(get_task_config(task_name))
    if isinstance(task_config, dict):
        # Context refs in YAML are designed for chained crews; remove them for one-task execution.
        task_config.pop("context", None)

    single_task = Task(config=task_config, agent=selected_agent)

    crew_instance = Crew(
        agents=[selected_agent],
        tasks=[single_task],
        process=Process.sequential,
        verbose=True,
    )
    enable_crewai_tracking(crew_instance)

    opik_args = {"trace": {"thread_id": thread_id}} if thread_id else None
    output = crew_instance.kickoff(inputs=inputs, opik_args=opik_args)

    raw = getattr(output, "raw", None)
    if raw is None:
        raw = str(output)
    return raw


def run_task_with_fallback(
    task_name: str,
    inputs: Dict[str, Any],
    use_evaluation_agent: bool,
    prompt: str,
    thread_id: str | None = None,
) -> str:
    try:
        return _kickoff_task(
            task_name=task_name,
            inputs=inputs,
            use_evaluation_agent=use_evaluation_agent,
            thread_id=thread_id,
        )
    except Exception as exc:  # noqa: BLE001
        raise_if_api_limit(exc)

    fallback_config = get_evaluation_agent_config() if use_evaluation_agent else get_conversation_agent_config()
    try:
        return run_prompt_with_fallback(prompt, fallback_config)
    except Exception as fallback_exc:  # noqa: BLE001
        raise_if_api_limit(fallback_exc)
        raise
