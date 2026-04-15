from agent_backend.crew import create_matching_crew
from agent_backend.llm_runtime import enable_crewai_tracking
from agent_backend.models import MatchingRunResult
from agent_backend.parsers import extract_json_object


def run_matching_agent(
    sessions_json: str,
    target_profile_json: str,
    target_session_id: str,
    thread_id: str | None = None,
) -> MatchingRunResult:
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

        return MatchingRunResult(
            raw_output=raw,
            parsed_matches=extract_json_object(raw),
        )
    except Exception as exc:  # noqa: BLE001
        return MatchingRunResult(
            raw_output=f"ERROR: {exc}",
            parsed_matches={},
        )
