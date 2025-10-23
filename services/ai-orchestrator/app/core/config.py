import os

# Configuration for Langflow and OpenAI
LANGFLOW_BASE_URL = os.getenv("LANGFLOW_BASE_URL", "http://localhost:7860") # Default to localhost if not set
LANGFLOW_GENERATE_FLOW_ID = os.getenv("LANGFLOW_GENERATE_FLOW_ID", "") # Langflow flow ID for plan generation
LANGFLOW_ADAPT_FLOW_ID = os.getenv("LANGFLOW_ADAPT_FLOW_ID", "") # Langflow flow ID for plan adaptation

OPENAI_API_KEY = os.getenv("OPENAI_API_KEY", "") # openAI key from environment
OPENAI_MODEL = os.getenv("OPENAI_MODEL", "gpt-4") # Default to GPT-4, but can be changed