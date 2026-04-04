"use client";

import { useState } from "react";
import type { CriticResult } from "@/app/page";

interface Props {
  critic: CriticResult;
  icon: string;
  accentClass: string; // Tailwind border + bg tint
  barGradient: string; // inline style gradient for the score bar
  delay: string;
}

function scoreColor(s: number) {
  if (s >= 8) return "text-green-400";
  if (s >= 6) return "text-yellow-400";
  if (s >= 4) return "text-orange-400";
  return "text-red-400";
}

export default function CriticCard({ critic, icon, accentClass, barGradient, delay }: Props) {
  const [expanded, setExpanded] = useState(false);
  const isLong = critic.feedback.length > 220;

  return (
    <div
      className={`anim-fade ${delay} glass rounded-2xl p-6 border ${accentClass} flex flex-col gap-3`}
    >
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2.5">
          <span className="text-xl">{icon}</span>
          <div>
            <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest">
              Critic
            </p>
            <h4 className="text-sm font-semibold text-slate-200 leading-snug">
              {critic.name}
            </h4>
          </div>
        </div>
        <div className="text-right leading-none">
          <span className={`text-2xl font-bold tabular-nums ${scoreColor(critic.score)}`}>
            {critic.score.toFixed(1)}
          </span>
          <span className="text-slate-600 text-xs"> /10</span>
        </div>
      </div>

      {/* Score bar */}
      <div className="w-full bg-white/5 rounded-full h-1.5">
        <div
          className="h-1.5 rounded-full transition-all duration-1000"
          style={{
            width: `${(critic.score / 10) * 100}%`,
            background: barGradient,
          }}
        />
      </div>

      {/* Feedback */}
      <p className={`text-slate-400 text-sm leading-relaxed ${!expanded && isLong ? "line-clamp-4" : ""}`}>
        {critic.feedback}
      </p>
      {isLong && (
        <button
          onClick={() => setExpanded((v) => !v)}
          className="self-start text-xs font-medium text-violet-400 hover:text-violet-300 transition-colors"
        >
          {expanded ? "Show less" : "Read more…"}
        </button>
      )}
    </div>
  );
}
