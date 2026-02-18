import os
from dotenv import load_dotenv

# Load .env file from the orchestrator service directory
load_dotenv()

# Configuration for OpenAI api and Langflow

OPENAI_API_KEY = os.getenv("OPENAI_API_KEY", "") # openAI key from environment
OPENAI_MODEL = os.getenv("OPENAI_MODEL", "gpt-4") # Default to GPT-4, but can be changed




