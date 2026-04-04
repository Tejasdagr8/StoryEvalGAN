from openai import OpenAI
from dotenv import load_dotenv
import os
from utils.scoring_utils import extract_score, compute_weighted_score, format_feedback

# ----------------------------------------------------------
# 🔹 Environment Setup
# ----------------------------------------------------------
load_dotenv()
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))


# ----------------------------------------------------------
# 🎭 Actor – Story Generator
# ----------------------------------------------------------
def actor_generate_story(prompt: str) -> str:
    """Generates a creative short story from the given prompt."""
    try:
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": "You are a creative storyteller who writes engaging short stories."},
                {"role": "user", "content": f"Write a short story based on this prompt: {prompt}"}
            ],
            temperature=0.9,
            max_tokens=500
        )
        return response.choices[0].message.content.strip()
    except Exception as e:
        print(f"❌ Error generating story: {e}")
        return "Error generating story."


# ----------------------------------------------------------
# 🧠 Critic 1 – Language & Structure Evaluation
# ----------------------------------------------------------
def critic_language_score(story: str) -> dict:
    """Evaluates grammar, coherence, and narrative flow."""
    try:
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": "You are an expert writing evaluator focusing on grammar, coherence, and structure."},
                {"role": "user", "content": f"Evaluate this story technically and give a score out of 10:\n\n{story}"}
            ],
            temperature=0.2
        )
        feedback = response.choices[0].message.content.strip()
        return {"critic": "Language", "feedback": feedback}
    except Exception as e:
        return {"critic": "Language", "feedback": f"Error evaluating language: {e}"}


# ----------------------------------------------------------
# 🎨 Critic 2 – Creativity & Emotional Depth
# ----------------------------------------------------------
def critic_creativity_score(story: str) -> dict:
    """Evaluates creativity, originality, and emotional impact."""
    try:
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": "You are a literary critic who judges creativity, emotion, and originality."},
                {"role": "user", "content": f"Rate the creativity and originality of this story out of 10, and justify:\n\n{story}"}
            ],
            temperature=0.6
        )
        feedback = response.choices[0].message.content.strip()
        return {"critic": "Creativity", "feedback": feedback}
    except Exception as e:
        return {"critic": "Creativity", "feedback": f"Error evaluating creativity: {e}"}


# ----------------------------------------------------------
# 🧮 Evaluation Controller
# ----------------------------------------------------------
def evaluate_story(prompt: str):
    """Runs the full Actor–Critic pipeline for a given prompt."""
    print("🎭 Generating story...")
    story = actor_generate_story(prompt)

    print("\n🧠 Evaluating story...")
    lang_feedback = critic_language_score(story)
    creativity_feedback = critic_creativity_score(story)

    # Extract numeric scores
    lang_score = extract_score(lang_feedback["feedback"])
    creativity_score = extract_score(creativity_feedback["feedback"])

    # Weighted final score
    final_score = compute_weighted_score(lang_score, creativity_score)

    # Format result
    summary = format_feedback(
        lang_feedback["feedback"],
        creativity_feedback["feedback"],
        final_score
    )

    # Display results
    print("\n" + "=" * 60)
    print("📝 STORY GENERATED:\n")
    print(story)
    print("\n" + "=" * 60)
    print(summary)
    print("=" * 60)

    # Return structured result
    return {
        "story": story,
        "language_feedback": lang_feedback,
        "creativity_feedback": creativity_feedback,
        "final_score": final_score
    }


# ----------------------------------------------------------
# 🚀 CLI Entry Point
# ----------------------------------------------------------
if __name__ == "__main__":
    print("🎬 Welcome to StoryEvalGAN (Actor–2 Critics System)")
    prompt = input("👉 Enter a story prompt: ")
    evaluate_story(prompt)
