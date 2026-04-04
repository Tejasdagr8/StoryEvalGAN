"use client";

import { useState } from "react";
import type { EvaluationResult } from "@/app/page";
import ScoreRing from "./ScoreRing";
import CriticCard from "./CriticCard";

interface Props {
  result: EvaluationResult;
}

export default function StoryResult({ result }: Props) {
  const [copied, setCopied] = useState(false);

  const copyStory = () => {
    navigator.clipboard.writeText(result.story);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const wordCount = result.story.trim().split(/\s+/).length;

  return (
    <div className="mt-10 space-y-5">
      {/* ── Final Score Card ──────────────────────────────── */}
      <div className="anim-fade glass rounded-2xl p-8 flex flex-col sm:flex-row items-center gap-6 sm:gap-10">
        <ScoreRing score={result.final_score} size={148} />

        <div className="text-center sm:text-left">
          <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest mb-1">
            Final Weighted Score
          </p>
          <p className="text-slate-400 text-sm mb-4">
            Language{" "}
            <span className="font-semibold text-slate-300">
              {Math.round(result.language_weight * 100)}%
            </span>
            {" · "}
            Creativity{" "}
            <span className="font-semibold text-slate-300">
              {Math.round(result.creativity_weight * 100)}%
            </span>
          </p>

          <div className="flex gap-6 justify-center sm:justify-start">
            <ScorePill label="Language" score={result.language_critic.score} />
            <ScorePill label="Creativity" score={result.creativity_critic.score} />
          </div>
        </div>
      </div>

      {/* ── Generated Story ───────────────────────────────── */}
      <div className="anim-fade d1 glass rounded-2xl p-6 sm:p-8">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-violet-400 flex-shrink-0" />
            <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest">
              Generated Story
            </span>
            <span className="text-[11px] text-slate-700 ml-1">
              {wordCount} words
            </span>
          </div>

          <button
            onClick={copyStory}
            className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-300 transition-colors"
          >
            {copied ? (
              <>
                <svg className="w-3.5 h-3.5 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-green-400">Copied!</span>
              </>
            ) : (
              <>
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                Copy
              </>
            )}
          </button>
        </div>

        <p className="text-slate-300 font-serif text-[15px] leading-8 whitespace-pre-wrap">
          {result.story}
        </p>
      </div>

      {/* ── Critics ──────────────────────────────────────── */}
      <div className="grid sm:grid-cols-2 gap-4">
        <CriticCard
          critic={result.language_critic}
          icon="📝"
          accentClass="border-violet-500/20 bg-violet-500/5"
          barGradient="linear-gradient(90deg, #7c3aed, #a78bfa)"
          delay="d2"
        />
        <CriticCard
          critic={result.creativity_critic}
          icon="🎨"
          accentClass="border-pink-500/20 bg-pink-500/5"
          barGradient="linear-gradient(90deg, #db2777, #f472b6)"
          delay="d3"
        />
      </div>
    </div>
  );
}

function ScorePill({ label, score }: { label: string; score: number }) {
  const color =
    score >= 8 ? "text-green-400" : score >= 6 ? "text-yellow-400" : "text-orange-400";
  return (
    <div className="text-center">
      <p className="text-[10px] text-slate-600 uppercase tracking-widest mb-0.5">{label}</p>
      <span className={`text-xl font-bold tabular-nums ${color}`}>{score.toFixed(1)}</span>
      <span className="text-slate-700 text-xs">/10</span>
    </div>
  );
}
