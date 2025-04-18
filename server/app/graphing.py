import time

from typing import Callable, List, TypedDict, Annotated

from langchain_openai import AzureChatOpenAI
from azure_client import azure_client
from loguru import logger as log

from langgraph.graph import add_messages, StateGraph, START, END
from langchain_core.tools import BaseTool

import sys
from pathlib import Path

sys.path.append(str(Path(__file__).parent.parent))

from models.general import ChatMessage

class MessageHistoryState(TypedDict):
    messages: Annotated[list, add_messages]

class LangGraphClient():
    def __init__(self, streaming_delay: int = 0):
        self.streaming_delay = streaming_delay
        
    def generate_chatbot_fn(self, llm: AzureChatOpenAI):
        async def chatbot_fn(state):
            return {"messages": [await llm.ainvoke(state["messages"])]}
        return chatbot_fn
    
    def generate_chatbot_fn_with_tools(self, llm: AzureChatOpenAI, tools: List[BaseTool]):
        llm_with_tools = llm.bind_tools(tools)
        async def chatbot_fn_with_tools(state):
            return {"messages": [await llm_with_tools.ainvoke(state["messages"])]}
        return chatbot_fn_with_tools
        
    async def generate_reply(self, content: str, history: List[ChatMessage], callback: Callable[[str], None], **kwargs) -> str:
        log.info("Creating graph...")
        
        llm = azure_client.create_llm(temperature=kwargs.get("temperature", 0))
        
        chatbot_fn = self.generate_chatbot_fn(llm)
        
        graph_builder = StateGraph(MessageHistoryState)
        graph_builder.add_node("chatbot", chatbot_fn)
        
        graph_builder.add_edge(START, "chatbot")
        graph_builder.add_edge("chatbot", END)
        
        graph = graph_builder.compile()
        
        inputs = {
            "messages": [
                {"role": "system", 
                 "content": 
                     """
                        You are a helpful AI assistant. Use emojis and markdown wherever you see fit. 
                        Render code blocks where appropiate. If using LaTeX, specify the language as "latex".
                    """
                },
                *list(map(lambda msg: msg.model_dump(), history)),
                {"role": "user", "content": content}
            ]
        }
        
        log.success("Graph created successfully!")
        log.info("Beginning streaming...")
        
        res = ''
        
        async for chunk, metadata in graph.astream(inputs, stream_mode="messages"):
            if chunk.content:
                time.sleep(self.streaming_delay)
                callback(chunk.content)
                res += chunk.content
        
        log.success("Streaming complete!")
        
        return res