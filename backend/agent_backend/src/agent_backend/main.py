from datetime import datetime
import os
import sys
import re
import time

from agent_backend.crew import SoulSyncCrew

# ─────────────────────────────────────────────────────────────────────
# Gemini rate-limit helpers
# ─────────────────────────────────────────────────────────────────────

_RETRY_AFTER_RE = re.compile(
    r"retry after\s+([0-9]+)", re.IGNORECASE
)


def _parse_retry_after_seconds(message: str) -> float | None:
    match = _RETRY_AFTER_RE.search(message)
    if not match:
        return None
    return float(match.group(1))


def _is_gemini_rate_limit_error(message: str) -> bool:
    lowered = message.lower()
    return (
        "429" in lowered or "resource_exhausted" in lowered or "quota" in lowered
    ) and "gemini" in lowered


# ─────────────────────────────────────────────────────────────────────
# Run
# ─────────────────────────────────────────────────────────────────────

def run():
    if not os.getenv("GEMINI_API_KEY"):
        print(
            "❌  Missing GEMINI_API_KEY.\n\n"
            "This project uses Gemini via LiteLLM (model='gemini/gemini-2.5-flash-preview-04-17').\n"
            "Create a .env file in the project root and set:\n"
            "  GEMINI_API_KEY=AIza...\n"
            "  MODEL=gemini/gemini-2.5-flash-preview-04-17\n"
        )
        return 1

    # ── Inputs ────────────────────────────────────────────────────────
    # Passed into every agent/task via {placeholder} in your YAML configs.
    # Adjust user_id and session_number per request in your real backend.
    inputs = {
        # Who this session belongs to
        "user_id": "user_demo_001",
        "session_id": f"session_{datetime.now().strftime('%Y%m%d_%H%M%S')}",
        "session_number": 1,

        # What the user said to open this session
        "user_message": (
            "Hey, I've been thinking a lot about what I actually want in a relationship. "
            "I always say I want someone spontaneous but honestly my best weeks are the "
            "planned, structured ones. I'm not sure what that says about me."
        ),

        # Personality Agent context
        "onboarding_complete": False,   # Set True after first session

        # Matching Agent context (populated by Orchestrator when a match is triggered)
        "user_a_id": "user_demo_001",
        "user_b_id": "user_demo_002",

        # Coach Agent context (populated after a match verdict)
        "match_id": "match_demo_001",
        "match_confidence_score": 84,

        # Meta
        "current_date": datetime.now().strftime("%Y-%m-%d"),
        "platform": "SoulSync v1.0",
    }

    print("💫  Starting SoulSync Crew...\n")
    print(f"    User       : {inputs['user_id']}")
    print(f"    Session    : {inputs['session_id']}")
    print(f"    Message    : {inputs['user_message'][:80]}...")
    print()

    # ── Initialize & run ──────────────────────────────────────────────
    crew_instance = SoulSyncCrew()

    try:
        result = crew_instance.soulsync_crew().kickoff(inputs=inputs)

    except Exception as exc:
        message = str(exc)

        if _is_gemini_rate_limit_error(message):
            retry_after = _parse_retry_after_seconds(message)

            if retry_after is not None:
                print(
                    f"❌  Gemini rate limit reached (429 / RESOURCE_EXHAUSTED).\n"
                    f"    Retry in ~{int(retry_after)}s, or check your quota at "
                    "https://aistudio.google.com/\n"
                    "    Tip: set CREWAI_AUTO_WAIT_ON_RATE_LIMIT=true to auto-wait and retry once.\n"
                )
                if os.getenv("CREWAI_AUTO_WAIT_ON_RATE_LIMIT", "").lower() in {"1", "true", "yes"}:
                    print(f"⏳  Waiting {int(retry_after)}s before retrying once...")
                    time.sleep(retry_after)
                    result = crew_instance.soulsync_crew().kickoff(inputs=inputs)
                else:
                    return 1
            else:
                print(
                    "❌  Gemini rate limit reached. "
                    "Wait a moment and rerun, or check your quota at https://aistudio.google.com/\n"
                )
                return 1

        raise

    print("\n✅  SoulSync crew completed successfully.\n")
    print("─" * 60)
    print("📋  FINAL OUTPUT:\n")
    print(result)
    return 0


# ─────────────────────────────────────────────────────────────────────
# Entry point
# ─────────────────────────────────────────────────────────────────────

if __name__ == "__main__":
    sys.exit(run())