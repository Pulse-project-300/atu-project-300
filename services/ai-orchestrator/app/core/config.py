import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# Configuration for OpenAI api and Langflow

OPENAI_API_KEY = os.getenv("OPENAI_API_KEY", "") # openAI key from environment
OPENAI_MODEL = os.getenv("OPENAI_MODEL", "gpt-4") # Default to GPT-4, but can be changed

LANGFLOW_BASE_URL = os.getenv("LANGFLOW_BASE_URL", "http://localhost:7860")

LANGFLOW_GENERATE_FLOW_ID = os.getenv("LANGFLOW_GENERATE_FLOW_ID", "")
LANGFLOW_ADAPT_FLOW_ID = os.getenv("LANGFLOW_ADAPT_FLOW_ID", "")


