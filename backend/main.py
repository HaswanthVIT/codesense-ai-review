import os
from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv
from google import genai
from google.genai import types
from google.genai.errors import APIError

# --- Pydantic Model for Type Safety (No Change) ---
class CodeReview(BaseModel):
    """The structured output format for the AI Code Review."""
    summary: str
    readability: str
    modularity: str
    bugs: str
    suggestions: str
    score: int # Enforce an integer score (0-10)

# --- Configuration & Environment Setup ---
load_dotenv()
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

if not GEMINI_API_KEY:
    print("FATAL ERROR: GEMINI_API_KEY is not set in the .env file. The service will fail.")

# --- Gemini Client Initialization ---
# Initialize the Gemini client once globally
try:
    client = genai.Client(api_key=GEMINI_API_KEY)
except Exception:
    client = None

# --- FastAPI Application Setup ---
app = FastAPI(
    title="CodeSense AI Review Assistant",
    description="Backend API for code analysis using Gemini LLM."
)

# Allow frontend (React) to call the backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.post("/analyze", response_model=CodeReview)
async def analyze(file: UploadFile = File(...)):
    """
    Accepts a code file, sends it to the Gemini model for structured analysis.
    """
    if client is None:
        raise HTTPException(status_code=503, detail="API Service Unavailable: Gemini client failed to initialize.")
        
    # 1. Validate file type
    allowed_extensions = (".py", ".js", ".java", ".ts", ".cpp", ".c")
    if not file.filename or not file.filename.endswith(allowed_extensions):
        raise HTTPException(status_code=400, detail="Unsupported file type. Must be one of: " + ", ".join(allowed_extensions))

    # 2. Read code contents (limit to 4000 characters for prompt safety)
    content = await file.read()
    code = content.decode("utf-8", errors="replace")
    code_snippet = code[:4000]

    # 3. Build the prompt
    SYSTEM_INSTRUCTIONS = (
        "You are a professional senior software engineer. "
        "Your task is to review the provided code and return your analysis "
        "STRICTLY as a single JSON object that conforms to the required schema."
    )
    
    USER_PROMPT = f"""
Analyze this code for readability, modularity, and potential bugs.
Provide improvement suggestions.

Code file: {file.filename}

Code:
---
{code_snippet}
---

Generate the complete JSON object now.
"""

    # 4. Call the Gemini API for structured output
    try:
        response = client.models.generate_content(
            model='gemini-2.5-flash',  # Fast, efficient, and reliable for structured output
            contents=USER_PROMPT,
            config=types.GenerateContentConfig(
                system_instruction=SYSTEM_INSTRUCTIONS,
                response_mime_type="application/json",
                response_schema=CodeReview,  # Use Pydantic model for schema definition
                temperature=0.0
            )
        )
        
        # Gemini returns a JSON string in the response text, which we must parse
        # before FastAPI validates it against the CodeReview schema.
        import json
        review_data = json.loads(response.text)
        
        # FastAPI automatically validates this against the CodeReview Pydantic model
        return review_data
        
    except APIError as e:
        print(f"Gemini API Error: {e}")
        raise HTTPException(status_code=500, detail=f"Gemini API Error: Authentication or Service Issue. Details: {e}")
    except Exception as e:
        print(f"Unexpected Error during analysis: {e}")
        # This often means the model did not return valid JSON
        raise HTTPException(status_code=500, detail="An unexpected error occurred. Check if the LLM returned valid JSON.")