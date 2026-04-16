import sys
from agent_backend.flows.conversation import run_conversation_flow
from agent_backend.flows.matching import run_matching_flow
from agent_backend.flows.personality import run_personality_flow
from agent_backend.services.service_runtime import ApiLimitReachedError
from agent_backend.sessions import load_env


def _route_from_args() -> bool:
	if len(sys.argv) < 3:
		return False

	username = str(sys.argv[1]).strip()
	command = str(sys.argv[2]).strip().lower()
	if not username or not command:
		return False

	if command == "match":
		run_matching_from_cli(username)
		return True

	if command in {"matches", "convo", "conversation"}:
		matches_ref = sys.argv[3] if len(sys.argv) >= 4 else "matches"
		run_conversation_from_cli(username, matches_ref)
		return True

	return False


def run() -> None:
	load_env()
	if _route_from_args():
		return
	run_personality_flow()


def run_matching_from_cli(username: str) -> None:
	load_env()
	print(f"\nSoulSync matching mode for {username}")
	run_matching_flow(username)


def run_matching_cli() -> None:
	if len(sys.argv) < 2:
		print("Usage: match <username>")
		sys.exit(1)

	run_matching_from_cli(sys.argv[1])


def run_conversation_from_cli(username: str, matches_ref: str = "matches") -> None:
	load_env()
	print(f"\nSoulSync conversation mode for {username}")
	try:
		run_conversation_flow(username, matches_ref)
	except ApiLimitReachedError as exc:
		print(str(exc))


def run_conversation_cli() -> None:
	if len(sys.argv) < 2:
		print("Usage: convo <username> <matches|matches_file>")
		sys.exit(1)

	username = sys.argv[1]
	matches_ref = sys.argv[2] if len(sys.argv) >= 3 else "matches"
	run_conversation_from_cli(username, matches_ref)
    
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
