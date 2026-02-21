import os
from dotenv import load_dotenv

load_dotenv()

# --- OpenAI ---
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY", "")
OPENAI_MODEL = os.getenv("OPENAI_MODEL", "gpt-4o-mini")
OPENAI_MAX_TOKENS = int(os.getenv("OPENAI_MAX_TOKENS", "1024"))

# --- Redis ---
REDIS_URL = os.getenv("REDIS_URL", "redis://localhost:6379/0")

# --- Per-user rate limits ---
RATE_LIMIT_PER_MINUTE = int(os.getenv("RATE_LIMIT_PER_MINUTE", "5"))
RATE_LIMIT_PER_HOUR = int(os.getenv("RATE_LIMIT_PER_HOUR", "30"))
RATE_LIMIT_PER_DAY = int(os.getenv("RATE_LIMIT_PER_DAY", "100"))

# --- Cost protection ---
MAX_PROMPT_CHARS = int(os.getenv("MAX_PROMPT_CHARS", "20000"))

