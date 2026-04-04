import os
import re
import numpy as np
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, field_validator
from openai import OpenAI
from dotenv import load_dotenv

load_dotenv()

app = FastAPI(
    title="StoryEvalGAN API",
    description="AI story generation and evaluation using Actor-2 Critics architecture",
    version="2.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

api_key = os.getenv("OPENAI_API_KEY")
if not api_key:
    raise RuntimeError("OPENAI_API_KEY environment variable is not set")

client = OpenAI(api_key=api_key)
MODEL = "gpt-4o-mini"


# ----------------------------------------------------------
# Request / Response models
# ----------------------------------------------------------

class EvaluateRequest(BaseModel):
    prompt: str
    language_weight: float = 0.6
    creativity_weight: float = 0.4

    @field_validator("prompt")
    @classmethod
    def prompt_not_empty(cls, v: str) -> str:
        v = v.strip()
        if not v:
            raise ValueError("Prompt cannot be empty")
        if len(v) > 1000:
            raise ValueError("Prompt too long (max 1000 characters)")
        return v


class CriticResult(BaseModel):
    name: str
    feedback: str
    score: float


class EvaluateResponse(BaseModel):
    story: str
    language_critic: CriticResult
    creativity_critic: CriticResult
    final_score: float
    language_weight: float
    creativity_weight: float


# ----------------------------------------------------------
# Score extraction
# ----------------------------------------------------------

def extract_score(text: str) -> float:
    """Extract a 0-10 score from critic feedback text."""
    patterns = [
        r"final\s+score[:\s]+(\d+(?:\.\d+)?)\s*(?:/\s*10)?",
        r"score[:\s]+(\d+(?:\.\d+)?)\s*/\s*10",
        r"(\d+(?:\.\d+)?)\s*/\s*10",
        r"(\d+(?:\.\d+)?)\s+out\s+of\s+10",
        r"rating[:\s]+(\d+(?:\.\d+)?)",
    ]
    for pattern in patterns:
        match = re.search(pattern, text, re.IGNORECASE)
        if match:
            score = float(match.group(1))
            if 0 <= score <= 10:
                return float(np.clip(score, 0, 10))

    # Fallback: last number in [0,10] range
    numbers = re.findall(r"\b(\d+(?:\.\d+)?)\b", text)
    for num_str in reversed(numbers):
        num = float(num_str)
        if 0 < num <= 10:
            return num
    return 5.0


# ----------------------------------------------------------
# Actor
# ----------------------------------------------------------

def generate_story(prompt: str) -> str:
    """Generate a creative short story from the prompt."""
    response = client.chat.completions.create(
        model=MODEL,
        messages=[
            {
                "role": "system",
                "content": (
                    "You are a master storyteller who crafts compelling, vivid short stories. "
                    "Write with rich sensory details, strong characters, and emotional resonance. "
                    "Create a complete story with a clear beginning, middle, and end."
                ),
            },
            {
                "role": "user",
                "content": f"Write a captivating short story (250-350 words) based on this prompt: {prompt}",
            },
        ],
        temperature=0.9,
        max_tokens=650,
    )
    return response.choices[0].message.content.strip()


# ----------------------------------------------------------
# Critic 1 — Language & Structure
# ----------------------------------------------------------

def evaluate_language(story: str) -> dict:
    """Evaluate grammar, coherence, pacing, and narrative structure."""
    response = client.chat.completions.create(
        model=MODEL,
        messages=[
            {
                "role": "system",
                "content": (
                    "You are a professional editor and writing coach. Evaluate stories for: "
                    "grammar and mechanics, sentence variety, clarity, coherence, pacing, and narrative structure. "
                    "Be specific and constructive. Always end your response with a line that reads exactly: "
                    "'Final Score: X/10' where X is your numeric score."
                ),
            },
            {
                "role": "user",
                "content": (
                    "Evaluate this story for language quality and structure. "
                    "Give 2-3 specific observations, then provide your Final Score:\n\n"
                    + story
                ),
            },
        ],
        temperature=0.3,
    )
    feedback = response.choices[0].message.content.strip()
    return {"name": "Language & Structure", "feedback": feedback, "score": extract_score(feedback)}


# ----------------------------------------------------------
# Critic 2 — Creativity & Emotion
# ----------------------------------------------------------

def evaluate_creativity(story: str) -> dict:
    """Evaluate originality, emotional depth, and imaginative impact."""
    response = client.chat.completions.create(
        model=MODEL,
        messages=[
            {
                "role": "system",
                "content": (
                    "You are a literary critic specializing in creative fiction. Evaluate stories for: "
                    "originality, imaginative use of the prompt, emotional depth, character development, "
                    "and memorable imagery. Be thoughtful and specific. Always end your response with a line "
                    "that reads exactly: 'Final Score: X/10' where X is your numeric score."
                ),
            },
            {
                "role": "user",
                "content": (
                    "Evaluate the creativity and emotional impact of this story. "
                    "Highlight what works and what could be more imaginative, then provide your Final Score:\n\n"
                    + story
                ),
            },
        ],
        temperature=0.6,
    )
    feedback = response.choices[0].message.content.strip()
    return {"name": "Creativity & Emotion", "feedback": feedback, "score": extract_score(feedback)}


# ----------------------------------------------------------
# Endpoints
# ----------------------------------------------------------

@app.get("/")
def root():
    return {
        "status": "ok",
        "message": "StoryEvalGAN API v2.0",
        "docs": "/docs",
    }


@app.get("/health")
def health():
    return {"status": "healthy", "model": MODEL}


@app.post("/api/evaluate", response_model=EvaluateResponse)
def evaluate(request: EvaluateRequest):
    """Run the full Actor→Critic1→Critic2 evaluation pipeline."""
    try:
        story = generate_story(request.prompt)

        lang = evaluate_language(story)
        creativity = evaluate_creativity(story)

        # Normalize weights
        total = request.language_weight + request.creativity_weight
        lang_w = request.language_weight / total
        cre_w = request.creativity_weight / total

        final_score = float(
            np.clip(
                round(lang_w * lang["score"] + cre_w * creativity["score"], 1),
                0,
                10,
            )
        )

        return {
            "story": story,
            "language_critic": lang,
            "creativity_critic": creativity,
            "final_score": final_score,
            "language_weight": round(lang_w, 2),
            "creativity_weight": round(cre_w, 2),
        }

    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc))
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Evaluation failed: {exc}")
