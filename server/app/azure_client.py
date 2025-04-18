import dotenv
from azure.identity import DefaultAzureCredential
from loguru import logger as log
from typing import Dict, Literal
from langchain_openai import AzureChatOpenAI

dotenv.load_dotenv()

class AzureClient():
    def __init__(self, deployment: Literal["gpt-4o", "gpt-4o-mini", "gpt-35-turbo", "gpt-35-turbo-16k"]):
        log.info("Initializing Azure client")
        
        self.credential = DefaultAzureCredential()
        self.token = self.credential.get_token("https://cognitiveservices.azure.com/.default")
        self.headers = {
            "Authorization": f"Bearer {self.token.token}",
            "Content-Type": "application/json"
        }
        self.azure_deployment = deployment
        self.openai_api_key = dotenv.get_key(dotenv.find_dotenv(), "AZURE_AUTH_API_KEY")
        self.azure_endpoint = dotenv.get_key(dotenv.find_dotenv(), "AZURE_AUTH_API_BASE")
        self.api_version = dotenv.get_key(dotenv.find_dotenv(), "AZURE_AUTH_API_VERSION")
        
        log.success("Azure client initialized")

    def get_token(self) -> str:
        return self.token.token
    
    def get_headers(self) -> Dict[str, str]:
        return self.headers
    
    def create_llm(self, temperature: float = 0, max_tokens: int = None, timeout: int = None, max_retries: int = 2, **kwargs) -> AzureChatOpenAI:
        return AzureChatOpenAI(
            azure_deployment=self.azure_deployment,
            azure_endpoint=self.azure_endpoint,
            api_key=self.openai_api_key,
            api_version=self.api_version,
            temperature=temperature,
            max_tokens=max_tokens,
            timeout=timeout,
            max_retries=max_retries,
            **kwargs
        )
        
azure_client = AzureClient(deployment="gpt-4o-mini")