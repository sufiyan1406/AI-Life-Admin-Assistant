import instructor
from openai import OpenAI
import pytesseract
from pytesseract import image_to_string
from PIL import Image
import io
import os
import pypdf
from models import TaskExtraction
from config import settings
from datetime import datetime

import json

# Standard client for text extraction (supports NVIDIA NIM)
client = OpenAI(
    base_url=settings.LLM_BASE_URL if settings.NVIDIA_API_KEY else None,
    api_key=settings.NVIDIA_API_KEY or settings.OPENAI_API_KEY
)

# Standard client for Whisper (only available with direct OpenAI key)
audio_client = OpenAI(api_key=settings.OPENAI_API_KEY) if settings.OPENAI_API_KEY else None

# Client for NVIDIA ASR (Canary)
asr_key = settings.NVIDIA_ASR_API_KEY or settings.NVIDIA_API_KEY
asr_client = OpenAI(
    base_url=settings.LLM_BASE_URL,
    api_key=asr_key
) if asr_key else None

# Client for Groq ASR
print(f"DEBUG: GROQ_API_KEY is {'set' if settings.GROQ_API_KEY else 'EMPTY'}")
groq_client = OpenAI(
    base_url=settings.GROQ_BASE_URL,
    api_key=settings.GROQ_API_KEY
) if settings.GROQ_API_KEY else None
print(f"DEBUG: groq_client initialized: {groq_client is not None}")

def extract_text_from_image(image_bytes: bytes) -> str:
    """Extract text from an image using Tesseract OCR."""
    image = Image.open(io.BytesIO(image_bytes))
    # Note: On Windows, you may need to specify the tesseract executable path if it's not in PATH
    pytesseract.pytesseract.tesseract_cmd = r'C:\Program Files\Tesseract-OCR\tesseract.exe'
    return image_to_string(image)

def extract_text_from_pdf(pdf_bytes: bytes) -> str:
    """Extract text from a PDF file."""
    reader = pypdf.PdfReader(io.BytesIO(pdf_bytes))
    text = ""
    for page in reader.pages:
        page_text = page.extract_text()
        if page_text:
            text += page_text + "\n"
    print(f"PDF Extraction Result: {len(text)} characters")
    if len(text) < 10:
        print("Warning: PDF text extraction returned very little text. Document might be scanned.")
    return text

def extract_text_from_audio(audio_bytes: bytes, filename: str) -> str:
    """Transcribe audio using Groq, NVIDIA NIM, or OpenAI Whisper."""
    last_error = ""
    
    # 1. Try Groq (Best Free Cloud Option)
    if groq_client:
        try:
            buffer = io.BytesIO(audio_bytes)
            buffer.name = filename
            transcript = groq_client.audio.transcriptions.create(
                model=settings.ASR_MODEL if "whisper" in settings.ASR_MODEL else "whisper-large-v3",
                file=buffer
            )
            return transcript.text
        except Exception as e:
            last_error = f"Groq ASR failed: {str(e)}"
            print(last_error)

    # 2. Try NVIDIA ASR (If model is configured for it)
    if asr_client and "nvidia" in settings.ASR_MODEL:
        try:
            buffer = io.BytesIO(audio_bytes)
            buffer.name = filename
            transcript = asr_client.audio.transcriptions.create(
                model=settings.ASR_MODEL,
                file=buffer
            )
            return transcript.text
        except Exception as e:
            last_error += f" | NVIDIA ASR failed: {str(e)}"
            print(last_error)
            
    # 3. Try OpenAI Whisper fallback
    if audio_client:
        try:
            buffer = io.BytesIO(audio_bytes)
            buffer.name = filename 
            transcript = audio_client.audio.transcriptions.create(
                model="whisper-1",
                file=buffer
            )
            return transcript.text
        except Exception as e:
            last_error += f" | OpenAI Whisper fallback failed: {str(e)}"
            print(last_error)
            
    if not last_error:
        last_error = "No valid API keys found for Groq, NVIDIA, or OpenAI Whisper."
        
    return f"[Transcription failed: {last_error}]"

def parse_task_from_text(text: str) -> TaskExtraction:
    """Convert raw text into a structured JSON task using LLM."""
    
    # Truncate text if it's extremely long to avoid token limits and keep focus
    MAX_CHAR_LIMIT = 8000
    if len(text) > MAX_CHAR_LIMIT:
        print(f"DEBUG: Truncating text from {len(text)} to {MAX_CHAR_LIMIT} characters.")
        text = text[:MAX_CHAR_LIMIT] + "... [Text Truncated]"

    current_time = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    prompt = f"""
    You are an AI Life Admin Assistant. 
    Analyze the following text extracted from a document, audio, or image.
    Your goal is to extract ONE concise, high-level task.
    
    CURRENT DATE AND TIME: {current_time}
    
    CRITICAL INSTRUCTIONS:
    1. task_title: MUST be a short, clear action-oriented title (e.g., "Pay Electricity Bill", "Review Medical Report").
    2. description: Provide a concise 1-2 sentence summary of the task details.
    3. deadline: Extract or calculate the deadline. Resolve relative expressions like "tomorrow", "next Monday", "in 2 days", "tonight" relative to {current_time}. 
       Format as ISO 8601 string (e.g., "2026-03-16T12:00:00"). If no time is specified, assume 12:00:00 or end of day. If no date is found, return null.
    4. category: Assign exactly one: "Bills", "Study", "Appointments", "Subscriptions", "Personal", "Work".
    5. priority: Determine importance (low, medium, or high).
    6. confidence: Provide a score between 0.0 and 1.0 representing how certain you are about the extraction.
    
    You MUST respond with ONLY a valid JSON object matching this schema, no markdown, no extra text:
    {{
        "task_title": "string",
        "category": "string",
        "deadline": "ISO 8601 string, or null",
        "priority": "low, medium, or high",
        "description": "string",
        "confidence": float
    }}
    
    Raw Text:
    {text}
    """
    
    response = client.chat.completions.create(
        model=settings.LLM_MODEL,
        messages=[
            {"role": "system", "content": "You are a helpful assistant that extracts structured JSON tasks from unstructured input. You output raw JSON only."},
            {"role": "user", "content": prompt}
        ],
        temperature=0.1
    )
    
    try:
        content = response.choices[0].message.content.strip()
        # Find the first { and last } to handle cases where the model adds introductory text
        start_idx = content.find('{')
        end_idx = content.rfind('}')
        if start_idx != -1 and end_idx != -1:
            content = content[start_idx:end_idx+1]
            
        data = json.loads(content)
        
        # Handle the common LLM mistake of returning "null" as a string for datetime
        if data.get("deadline") in ["null", "None", ""]:
            data["deadline"] = None
            
        return TaskExtraction(**data)
    except Exception as e:
        print(f"Failed to parse LLM JSON: {e}")
        print(f"Raw content was: {content if 'content' in locals() else 'N/A'}")
        return TaskExtraction(
            task_title="Extracted Task",
            category="Personal",
            priority="medium",
            description=text,
            confidence=0.5
        )

def process_file_and_extract_task(file_bytes: bytes, filename: str, content_type: str) -> TaskExtraction:
    """Main pipeline to process a file and return a structured task."""
    extracted_text = ""
    
    print(f"DEBUG: Processing file {filename} with content_type {content_type}")
    if content_type.startswith("image/"):
        extracted_text = extract_text_from_image(file_bytes)
    elif content_type.startswith("audio/") or content_type in ["video/mp4", "video/webm"]:
        extracted_text = extract_text_from_audio(file_bytes, filename)
    elif content_type == "text/plain":
        extracted_text = file_bytes.decode("utf-8")
    elif content_type == "application/pdf":
        extracted_text = extract_text_from_pdf(file_bytes)
    else:
        # Fallback handling
        extracted_text = f"Unsupported file type: {content_type}. Cannot extract text automatically."
        
    # If text is very short or empty, just return a default structure
    if not extracted_text or len(extracted_text.strip()) < 2:
        return TaskExtraction(
            task_title=f"Review file: {filename}",
            category="Personal",
            priority="medium",
            description="Could not extract contents.",
            confidence=1.0
        )
        
    return parse_task_from_text(extracted_text)
