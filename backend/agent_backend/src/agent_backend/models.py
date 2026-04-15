from dataclasses import dataclass
from typing import Any, Dict


@dataclass
class PersonalityRunResult:
    raw_output: str
    parsed_profile: Dict[str, Any]


@dataclass
class ChatTurnResult:
    raw_output: str
    assistant_reply: str
    memory_update: Dict[str, Any]


@dataclass
class BehaviorUpdateResult:
    raw_output: str
    behavior_update: Dict[str, Any]


@dataclass
class MatchingRunResult:
    raw_output: str
    parsed_matches: Dict[str, Any]
