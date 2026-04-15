import sys
from agent_backend.flows.matching import run_matching_flow
from agent_backend.flows.personality import run_personality_flow
from agent_backend.sessions import load_env


def run() -> None:
	load_env()
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
