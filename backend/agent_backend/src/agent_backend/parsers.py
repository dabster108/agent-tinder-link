import json
from typing import Any, Dict, List


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
