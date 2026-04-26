import json
from pathlib import Path

from app.schemas.chat import ChatResponse, ChatState


DATA_FILE = Path(__file__).resolve().parent.parent / "data" / "election_steps.json"
CURRENT_STAGE = "Voting"


def load_election_steps() -> list[str]:
    with DATA_FILE.open("r", encoding="utf-8") as file:
        data = json.load(file)
    return data["steps"]


def build_response(*, topic: str, lines: list[str], next_action: str) -> ChatResponse:
    return ChatResponse(
        response="\n".join(lines),
        state=ChatState(
            topic=topic,
            current_stage=CURRENT_STAGE,
            next_action=next_action,
        ),
    )


def build_chat_reply(message: str) -> ChatResponse:
    normalized_message = message.lower()

    if "eligibility" in normalized_message:
        return build_response(
            topic="eligibility",
            lines=[
                "Eligibility check:",
                "- Step 1: Confirm you are at least 18 years old on or before election day.",
                "- Step 2: Make sure you meet local citizenship and residency rules.",
                "- Step 3: Verify that your voter registration is active.",
                "- Step 4: Keep a valid ID ready for verification.",
            ],
            next_action="registration",
        )

    if "registration" in normalized_message or "show election steps" in normalized_message:
        return build_response(
            topic="registration",
            lines=[
                "Election steps:",
                "- Step 1: Check your voter registration status.",
                "- Step 2: Confirm your polling station or approved voting method.",
                "- Step 3: Review the required identification documents.",
                "- Step 4: Prepare before voting day so the process is smooth.",
            ],
            next_action="voting",
        )

    if "voting process" in normalized_message or "how to vote" in normalized_message or "steps" in normalized_message:
        return build_response(
            topic="voting",
            lines=[
                "Voting process:",
                "- Step 1: Arrive at the correct polling station or open the approved voting channel.",
                "- Step 2: Complete identity verification with the election staff.",
                "- Step 3: Follow the ballot or machine instructions carefully.",
                "- Step 4: Submit your vote and confirm the process is complete.",
            ],
            next_action="complete",
        )

    return build_response(
        topic="general",
        lines=[
            "I can help you through the election flow:",
            "- Step 1: Check eligibility.",
            "- Step 2: Review election steps and registration details.",
            "- Step 3: Understand the voting process.",
            "Try asking: Check eligibility, Show election steps, or Voting process.",
        ],
        next_action="eligibility",
    )
