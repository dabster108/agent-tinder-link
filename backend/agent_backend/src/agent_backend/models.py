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


@dataclass
class ConversationContextResult:
    raw_output: str
    persona_anchor: Dict[str, Any]


@dataclass
class ConversationTurnResult:
    raw_output: str
    message: str


@dataclass
class ConversationEvaluationResult:
    raw_output: str
    evaluation: Dict[str, Any]


@dataclass
class ConversationVerdictResult:
    raw_output: str
    verdict_payload: Dict[str, Any]
