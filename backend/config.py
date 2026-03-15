import os
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    SUPABASE_URL: str
    SUPABASE_KEY: str
    OPENAI_API_KEY: str = ""
    NVIDIA_API_KEY: str = ""
    NVIDIA_ASR_API_KEY: str = "" # Optional, defaults to NVIDIA_API_KEY if empty
    GROQ_API_KEY: str = ""
    LLM_BASE_URL: str = "https://integrate.api.nvidia.com/v1"
    GROQ_BASE_URL: str = "https://api.groq.com/openai/v1"
    LLM_MODEL: str = "meta/llama-3.1-405b-instruct"
    ASR_MODEL: str = "whisper-large-v3"
    
    EMAIL_HOST: str = "smtp.gmail.com"
    EMAIL_PORT: int = 587
    EMAIL_HOST_USER: str = ""
    EMAIL_HOST_PASSWORD: str = ""
    DOMAIN_URL: str = "http://localhost:3000"

    class Config:
        env_file = "../.env" # Assuming backend is a subdirectory of the main project where .env is located
        env_file_encoding = "utf-8"

settings = Settings()
