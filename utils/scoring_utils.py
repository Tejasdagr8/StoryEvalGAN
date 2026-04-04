import re
import numpy as np

# ------------------------------------------------------------
# 🔹 Extract numeric score (e.g., "Score: 8.5/10") from critic text
# ------------------------------------------------------------
def extract_score(feedback: str) -> float:
    """
    Extracts a numerical score (0–10) from a critic's feedback text.
    Example:
        "The story is creative and emotional. Final Score: 8.7/10"
        -> 8.7
    """
    match = re.search(r'(\d+(\.\d+)?)', feedback)
    if match:
        score = float(match.group(1))
        return np.clip(score, 0, 10)  # Ensure score stays within [0, 10]
    return 0.0


# ------------------------------------------------------------
# 🔹 Weighted score computation between critics
# ------------------------------------------------------------
def compute_weighted_score(lang_score: float, creativity_score: float, weights=(0.6, 0.4)) -> float:
    """
    Combines critic scores using a weighted average.
    Default weights:
        Language Critic: 60%
        Creativity Critic: 40%
    """
    final_score = round((weights[0] * lang_score + weights[1] * creativity_score), 2)
    return float(np.clip(final_score, 0, 10))


# ------------------------------------------------------------
# 🔹 Pretty print the feedback in a structured format
# ------------------------------------------------------------
def format_feedback(lang_feedback: str, creativity_feedback: str, final_score: float) -> str:
    """
    Returns a formatted summary of the critic evaluations.
    """
    summary = f"""
📝 **STORY EVALUATION SUMMARY**
----------------------------------------
📊 **Language Critic Feedback:**  
{lang_feedback.strip()}

🎨 **Creativity Critic Feedback:**  
{creativity_feedback.strip()}

🏆 **Final Weighted Score:** {final_score}/10
----------------------------------------
"""
    return summary


# ------------------------------------------------------------
# 🔹 Optional: Convert qualitative feedback to numerical scores
# ------------------------------------------------------------
def estimate_score_from_text(feedback: str) -> float:
    """
    Converts descriptive feedback into a score if numeric value missing.
    Uses keyword-based heuristics.
    """
    keywords = {
        "excellent": 9,
        "great": 8,
        "good": 7,
        "average": 6,
        "fair": 5,
        "poor": 4,
        "bad": 3,
        "weak": 2
    }
    text = feedback.lower()
    for word, value in keywords.items():
        if word in text:
            return value
    return 5.0  # Default mid value
