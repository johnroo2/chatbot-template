from typing import List, Literal
from pydantic import BaseModel

class ChatMessage(BaseModel):
    role: Literal['user', 'assistant', 'system']
    content: str

class GeneratePromptRequest(BaseModel):
    prompt: str
    api_key: str
    history: List[ChatMessage]
    message_id: str
    chat_id: str
    user_id: str
    username: str