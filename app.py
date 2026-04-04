import streamlit as st
from main import evaluate_story

st.set_page_config(page_title="StoryEvalGAN 🎭", layout="wide")

st.title("🎭 StoryEvalGAN — AI Story Evaluation System")
st.markdown("Built by **Tejas Melkote** | Actor–2 Critics model using OpenAI APIs")

prompt = st.text_area("Enter your story prompt:", "A boy discovers a magical pen that writes his dreams...")

if st.button("Generate & Evaluate Story"):
    with st.spinner("Evaluating your story... please wait"):
        result = evaluate_story(prompt)
        st.subheader("📝 Generated Story")
        st.write(result["story"])

        st.subheader("📊 Critic 1 — Language Feedback")
        st.write(result["language_feedback"]["feedback"])

        st.subheader("🎨 Critic 2 — Creativity Feedback")
        st.write(result["creativity_feedback"]["feedback"])

        st.success(f"🏆 Final Story Score: {result['final_score']}/10")
