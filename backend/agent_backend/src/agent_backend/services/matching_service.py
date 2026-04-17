import os

from agent_backend.crew import create_matching_crew
from agent_backend.llm_runtime import enable_crewai_tracking, get_model_candidates, is_high_demand_error
from agent_backend.models import MatchingRunResult
from agent_backend.parsers import extract_json_object


def _run_matching_crew_with_fallback(
    sessions_json: str,
    target_profile_json: str,
    target_session_id: str,
    thread_id: str | None = None,
) -> str:
    candidates = get_model_candidates()
    last_error: Exception | None = None

    for model in candidates:
        previous_model = os.getenv("MODEL")
        if model:
            os.environ["MODEL"] = model

        try:
            crew_instance = create_matching_crew()
            enable_crewai_tracking(crew_instance)
            opik_args = {"trace": {"thread_id": thread_id}} if thread_id else None

            output = crew_instance.kickoff(
                inputs={
                    "sessions_json": sessions_json,
                    "target_profile_json": target_profile_json,
                    "target_session_id": target_session_id,
                },
                opik_args=opik_args,
            )

            raw = getattr(output, "raw", None)
            if raw is None:
                raw = str(output)
            return raw
        except Exception as exc:  # noqa: BLE001
            last_error = exc
            if not is_high_demand_error(exc):
                break
        finally:
            if previous_model is None:
                os.environ.pop("MODEL", None)
            else:
                os.environ["MODEL"] = previous_model

    if last_error is not None:
        raise last_error
    raise RuntimeError("Matching crew failed without a captured exception.")


def run_matching_agent(
    sessions_json: str,
    target_profile_json: str,
    target_session_id: str,
    thread_id: str | None = None,
) -> MatchingRunResult:
    try:
        raw = _run_matching_crew_with_fallback(
            sessions_json=sessions_json,
            target_profile_json=target_profile_json,
            target_session_id=target_session_id,
            thread_id=thread_id,
        )

        return MatchingRunResult(
            raw_output=raw,
            parsed_matches=extract_json_object(raw),
        )
    except Exception as exc:  # noqa: BLE001
        return MatchingRunResult(
            raw_output=f"ERROR: {exc}",
            parsed_matches={},
        )
