import os
import time
from typing import Any, Dict, List

from crewai import Agent, Crew
from opik.integrations.crewai import track_crewai


_TRACKED_CREW_IDS: set[int] = set()


def get_model_candidates() -> List[str]:
    primary = (os.getenv("MODEL", "") or "gemini/gemini-2.5-flash").strip()
    fallback_raw = os.getenv("SOULSYNC_MODEL_FALLBACKS", "gemini/gemini-2.5-flash")
    fallback_models = [item.strip() for item in fallback_raw.split(",") if item.strip()]

    candidates: List[str] = []
    for model in [primary] + fallback_models:
        if model and model not in candidates:
            candidates.append(model)
    return candidates


def is_high_demand_error(exc: Exception) -> bool:
    message = str(exc).lower()
    return (
        "503" in message
        or "unavailable" in message
        or "high demand" in message
        or "resource_exhausted" in message
    )


def run_prompt_with_fallback(prompt: str, agent_config: Dict[str, Any]) -> str:
    candidates = get_model_candidates()
    max_retries = max(1, int(os.getenv("SOULSYNC_LLM_RETRIES", "3")))
    last_error: Exception | None = None

    for model in candidates:
        for attempt in range(1, max_retries + 1):
            try:
                lite_agent = Agent(
                    config=agent_config,
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
                if is_high_demand_error(exc) and attempt < max_retries:
                    time.sleep(min(2**attempt, 6))
                    continue
                break

    if last_error is not None:
        raise last_error
    raise RuntimeError("LLM call failed without a captured exception.")


def get_opik_project_name() -> str:
    project_name = (os.getenv("OPIK_PROJECT_NAME", "") or "").strip()
    return project_name or "soulsync-agent"


def enable_crewai_tracking(crew_instance: Crew) -> None:
    crew_id = id(crew_instance)
    if crew_id in _TRACKED_CREW_IDS:
        return

    track_crewai(project_name=get_opik_project_name(), crew=crew_instance)
    _TRACKED_CREW_IDS.add(crew_id)
