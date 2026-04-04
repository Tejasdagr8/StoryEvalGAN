# StoryEvalGAN

An AI-powered story generation and evaluation system built on the **Actor–2 Critics** architecture.

- **Actor** — GPT-4o-mini generates a creative short story from your prompt  
- **Critic 1** — Evaluates language quality, grammar, coherence, and narrative structure  
- **Critic 2** — Evaluates creativity, originality, and emotional depth  
- **Final Score** — Weighted aggregate (Language 60% + Creativity 40%)

> Built by **Tejas Melkote**

---

## Live Demo

| Service | URL |
|---------|-----|
| Frontend (Vercel) | _link will be added after deployment_ |
| Backend API (Render) | _link will be added after deployment_ |
| API Docs (Swagger) | _`<render-url>/docs`_ |

---

## Project Structure

```
StoryEvalGAN/
├── backend/                  # FastAPI backend → deploy on Render
│   ├── main.py               # API app with Actor + 2 Critics
│   ├── requirements.txt
│   └── render.yaml           # Render deployment config
│
├── frontend/                 # Next.js 14 frontend → deploy on Vercel
│   ├── src/
│   │   ├── app/
│   │   │   ├── layout.tsx
│   │   │   ├── page.tsx
│   │   │   └── globals.css
│   │   └── components/
│   │       ├── StoryForm.tsx
│   │       ├── StoryResult.tsx
│   │       ├── ScoreRing.tsx  # Animated SVG score ring
│   │       └── CriticCard.tsx
│   ├── package.json
│   ├── tailwind.config.ts
│   └── .env.example
│
├── app.py                    # Legacy Streamlit UI (local use)
├── main.py                   # Legacy CLI entry point
├── utils/scoring_utils.py    # Legacy scoring helpers
├── .env.example
└── .gitignore
```

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| LLM | OpenAI GPT-4o-mini |
| Backend | FastAPI + Uvicorn |
| Frontend | Next.js 14 + Tailwind CSS |
| Backend deploy | Render (free tier) |
| Frontend deploy | Vercel |

---

## Local Development

### 1. Backend

```bash
cd backend
python -m venv venv && source venv/bin/activate
pip install -r requirements.txt

# Create .env with your key
echo "OPENAI_API_KEY=sk-..." > .env

uvicorn main:app --reload
# API running at http://localhost:8000
# Swagger docs at http://localhost:8000/docs
```

### 2. Frontend

```bash
cd frontend
npm install

# Create local env
echo "NEXT_PUBLIC_API_URL=http://localhost:8000" > .env.local

npm run dev
# App running at http://localhost:3000
```

---

## API Reference

### `POST /api/evaluate`

**Request body:**
```json
{
  "prompt": "A boy discovers a magical pen that writes his dreams into reality",
  "language_weight": 0.6,
  "creativity_weight": 0.4
}
```

**Response:**
```json
{
  "story": "...",
  "language_critic": { "name": "Language & Structure", "feedback": "...", "score": 8.0 },
  "creativity_critic": { "name": "Creativity & Emotion", "feedback": "...", "score": 7.5 },
  "final_score": 7.8,
  "language_weight": 0.6,
  "creativity_weight": 0.4
}
```

---

## Deployment

### Deploy Backend → Render

1. Push this repo to GitHub
2. Go to [render.com](https://render.com) → New Web Service → connect repo
3. Set **Root Directory** to `backend`
4. Set **Build Command**: `pip install -r requirements.txt`
5. Set **Start Command**: `uvicorn main:app --host 0.0.0.0 --port $PORT`
6. Add env var: `OPENAI_API_KEY = <your key>`

The `render.yaml` in `backend/` automates this if you use Render's Blueprint feature.

### Deploy Frontend → Vercel

1. Go to [vercel.com](https://vercel.com) → New Project → import repo
2. Set **Root Directory** to `frontend`
3. Add env var: `NEXT_PUBLIC_API_URL = https://<your-render-service>.onrender.com`
4. Deploy

---

## Architecture

```
User prompt
     │
     ▼
┌─────────────┐
│    Actor    │  GPT-4o-mini (temp=0.9)
│  generates  │  → 250-350 word story
│   a story   │
└──────┬──────┘
       │ story
   ┌───┴────┐
   │        │
   ▼        ▼
┌──────┐  ┌──────────┐
│ C1   │  │    C2    │
│ Lang │  │Creativity│
│ 0.3  │  │  0.6     │  (temperature)
└──┬───┘  └────┬─────┘
   │score      │score
   └─────┬─────┘
         ▼
   Weighted Average
   (60% lang + 40% creativity)
         │
         ▼
    Final Score (0–10)
```
