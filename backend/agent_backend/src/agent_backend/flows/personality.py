import json
import os
from datetime import datetime, timezone
from typing import Any, Dict

from agent_backend.services.personality_service import (
    run_onboarding_question_generator,
    run_personality_agent,
    run_personality_behavior_update,
    run_personality_chat_turn,
)
from agent_backend.sessions import (
    build_dummy_user_context,
    default_onboarding_questions,
    iso_now,
    save_or_update_session,
)


def run_personality_flow() -> None:
    skip_agent = os.getenv("SOULSYNC_SKIP_AGENT", "false").lower() == "true"
    max_turns = int(os.getenv("SOULSYNC_MAX_TURNS", "30"))

    session_payload: Dict[str, Any] = {
        "session_id": f"personality-chat-{datetime.now(timezone.utc).strftime('%Y%m%d%H%M%S')}",
        "created_at": iso_now(),
        "last_updated_at": iso_now(),
        "agent": "personality_agent",
        "mode": "conversation",
        "user": {"name": ""},
        "onboarding": {
            "user_context": {},
            "questions": [],
            "answers": [],
        },
        "conversation": [],
        "profile": {},
        "behavior_updates": [],
        "notes": [],
    }
    thread_id = session_payload["session_id"]

    print("\nSoulSync Personality Agent (chat mode)")
    print("Type 'exit' anytime to stop.\n")

    user_name = input("Agent: Hi, what should I call you?\nYou: ").strip() or "User"
    session_payload["user"] = {"name": user_name}
    user_context = build_dummy_user_context(user_name)
    session_payload["onboarding"]["user_context"] = user_context

    if skip_agent:
        onboarding_questions = default_onboarding_questions()
    else:
        onboarding_questions = run_onboarding_question_generator(
            user_context,
            thread_id=thread_id,
        )
        if len(onboarding_questions) < 5:
            onboarding_questions = default_onboarding_questions()

    onboarding_questions = onboarding_questions[:5]
    session_payload["onboarding"]["questions"] = onboarding_questions

    print(f"\nAgent: Hi {user_name}. I am your SoulSync personality agent. Let's start with a few scenario questions.")

    for index, question in enumerate(onboarding_questions, start=1):
        print(f"\nAgent: {question['question']}")
        user_answer = input("You: ").strip()
        while not user_answer:
            print("Agent: take your time - even a short answer works.")
            user_answer = input("You: ").strip()

        session_payload["onboarding"]["answers"].append(
            {
                "step": index,
                "timestamp": iso_now(),
                "question": question,
                "answer": user_answer,
            }
        )

        if index < len(onboarding_questions):
            print("Agent: okay, that tracks.\n")
        else:
            print("Agent: that helps a lot. I have enough to shape the rest of what I know.\n")

    if skip_agent:
        profile_payload = {}
        profile_raw_output = "SOULSYNC_SKIP_AGENT=true"
    else:
        profile_input = {
            "source": "onboarding",
            "user_name": user_name,
            "user_context": user_context,
            "questions": onboarding_questions,
            "answers": [
                {
                    "step": item["step"],
                    "question_id": item["question"].get("id", f"question_{item['step']}") if isinstance(item.get("question"), dict) else f"question_{item['step']}",
                    "question": item["question"].get("question", "") if isinstance(item.get("question"), dict) else "",
                    "focus": item["question"].get("focus", "") if isinstance(item.get("question"), dict) else "",
                    "answer": item["answer"],
                }
                for item in session_payload["onboarding"]["answers"]
            ],
        }
        profile_result = run_personality_agent(
            questionnaire_json=json.dumps(profile_input, ensure_ascii=True),
            thread_id=thread_id,
        )
        profile_payload = profile_result.parsed_profile
        profile_raw_output = profile_result.raw_output

    session_payload["profile"] = profile_payload
    session_payload["profile_raw_output"] = profile_raw_output
    session_payload["last_updated_at"] = iso_now()
    last_path = save_or_update_session(session_payload)

    print(f"Agent: Hi {user_name}. I am your SoulSync personality agent. You can keep chatting normally now.")

    turn_no = 0

    while turn_no < max_turns:
        user_message = input("You: ").strip()
        if not user_message:
            continue
        if user_message.lower() in {"exit", "quit", "done", "bye"}:
            break

        turn_no += 1

        if skip_agent:
            agent_reply = "Thanks for sharing. Can you tell me more about what matters most to you in relationships?"
            memory_update: Dict[str, Any] = {}
            raw_chat_output = "SOULSYNC_SKIP_AGENT=true"
        else:
            chat_result = run_personality_chat_turn(
                conversation_history=session_payload["conversation"],
                user_message=user_message,
                user_name=user_name,
                thread_id=thread_id,
            )
            agent_reply = chat_result.assistant_reply
            memory_update = chat_result.memory_update
            raw_chat_output = chat_result.raw_output

        session_payload["conversation"].append(
            {
                "turn": turn_no,
                "timestamp": iso_now(),
                "user_message": user_message,
                "assistant_reply": agent_reply,
                "memory_update": memory_update,
                "raw_chat_output": raw_chat_output,
            }
        )

        if not skip_agent:
            behavior_result = run_personality_behavior_update(
                conversation_history=session_payload["conversation"],
                user_name=user_name,
                thread_id=thread_id,
            )
            session_payload["behavior_updates"].append(
                {
                    "turn": turn_no,
                    "timestamp": iso_now(),
                    "raw_output": behavior_result.raw_output,
                    "behavior_update": behavior_result.behavior_update,
                }
            )
            session_payload["notes"] = session_payload["behavior_updates"][-3:]

        session_payload["last_updated_at"] = iso_now()
        session_payload["total_turns"] = turn_no

        last_path = save_or_update_session(session_payload)
        print(f"Agent: {agent_reply}\n")

    print(f"\nSession saved to: {last_path}")
