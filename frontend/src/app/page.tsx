"use client";

import { useState, useRef, useEffect } from "react";
import StoryForm from "@/components/StoryForm";
import StoryResult from "@/components/StoryResult";

export type CriticResult = {
  name: string;
  feedback: string;
  score: number;
};

export type EvaluationResult = {
  story: string;
  language_critic: CriticResult;
  creativity_critic: CriticResult;
  final_score: number;
  language_weight: number;
  creativity_weight: number;
};

const LOADING_STEPS = [
  "Generating story from your prompt…",
  "Critic 1 evaluating language & structure…",
  "Critic 2 evaluating creativity & emotion…",
  "Computing final weighted score…",
];

export default function Home() {
  const [result, setResult] = useState<EvaluationResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadStep, setLoadStep] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const resultRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (result && resultRef.current) {
      resultRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [result]);

  useEffect(() => {
    if (!loading) {
      setLoadStep(0);
      return;
    }
    const interval = setInterval(() => {
      setLoadStep((s) => (s < LOADING_STEPS.length - 1 ? s + 1 : s));
    }, 4000);
    return () => clearInterval(interval);
  }, [loading]);

  const handleEvaluate = async (prompt: string) => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const apiUrl =
        process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
      const res = await fetch(`${apiUrl}/api/evaluate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.detail || `Request failed (${res.status})`);
      }

      setResult(await res.json());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen">
      {/* Ambient background blobs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-48 -right-48 w-[500px] h-[500px] rounded-full bg-violet-900/20 blur-3xl" />
        <div className="absolute -bottom-48 -left-48 w-[500px] h-[500px] rounded-full bg-indigo-900/20 blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full bg-purple-900/10 blur-3xl" />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-4 py-14 sm:py-20">
        {/* Header */}
        <header className="text-center mb-12">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-400 text-xs font-semibold uppercase tracking-widest mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-pulse" />
            GPT-4o-mini · Actor-2 Critics
          </span>

          <h1 className="text-5xl sm:text-7xl font-extrabold tracking-tight mb-4">
            <span className="gradient-text">StoryEvalGAN</span>
          </h1>

          <p className="text-slate-400 text-lg max-w-lg mx-auto leading-relaxed">
            Enter a prompt. The AI generates a story, then two independent
            critics evaluate it for{" "}
            <span className="text-slate-300">language quality</span> and{" "}
            <span className="text-slate-300">creative depth</span>.
          </p>
        </header>

        {/* Form */}
        <StoryForm onEvaluate={handleEvaluate} loading={loading} />

        {/* Error */}
        {error && (
          <div className="mt-6 flex items-start gap-3 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm anim-fade">
            <svg className="w-4 h-4 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {error}
          </div>
        )}

        {/* Loading state */}
        {loading && (
          <div className="mt-8 glass rounded-2xl p-8 anim-fade space-y-6">
            <div className="flex items-center gap-4">
              <div className="w-8 h-8 rounded-full border-2 border-violet-500 border-t-transparent animate-spin flex-shrink-0" />
              <p className="text-slate-300 font-medium">{LOADING_STEPS[loadStep]}</p>
            </div>

            <div className="space-y-2.5 pl-12">
              {LOADING_STEPS.map((step, i) => (
                <div key={i} className="flex items-center gap-2.5 text-sm">
                  <div
                    className={`w-1.5 h-1.5 rounded-full transition-colors duration-500 ${
                      i < loadStep
                        ? "bg-violet-400"
                        : i === loadStep
                        ? "bg-violet-400 animate-pulse"
                        : "bg-slate-700"
                    }`}
                  />
                  <span className={i <= loadStep ? "text-slate-300" : "text-slate-600"}>
                    {step}
                  </span>
                </div>
              ))}
            </div>

            {/* Skeleton */}
            <div className="pt-2 space-y-3">
              <div className="h-3 rounded-full shimmer" />
              <div className="h-3 rounded-full shimmer w-[85%]" />
              <div className="h-3 rounded-full shimmer w-[70%]" />
            </div>
          </div>
        )}

        {/* Results */}
        <div ref={resultRef}>
          {result && <StoryResult result={result} />}
        </div>

        <footer className="mt-20 text-center text-slate-700 text-sm">
          Built by{" "}
          <span className="text-slate-500 font-medium">Tejas Melkote</span>
          {" · "}Actor–2 Critics Architecture
        </footer>
      </div>
    </main>
  );
}
