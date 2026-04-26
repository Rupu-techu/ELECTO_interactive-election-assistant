from pydantic import BaseModel


class ChatRequest(BaseModel):
    message: str


class ChatState(BaseModel):
    topic: str
    current_stage: str
    next_action: str


class ChatResponse(BaseModel):
    response: str
    state: ChatState
