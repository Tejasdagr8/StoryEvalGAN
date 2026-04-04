"use client";

import { useEffect, useState } from "react";

interface Props {
  score: number;
  size?: number;
}

const RADIUS = 54;
const STROKE = 8;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS; // ≈ 339.3

function scoreColor(score: number) {
  if (score >= 8) return "#22c55e";   // green
  if (score >= 6) return "#eab308";   // yellow
  if (score >= 4) return "#f97316";   // orange
  return "#ef4444";                   // red
}

function scoreLabel(score: number) {
  if (score >= 8.5) return "Excellent";
  if (score >= 7)   return "Great";
  if (score >= 5.5) return "Good";
  if (score >= 4)   return "Average";
  return "Needs Work";
}

export default function ScoreRing({ score, size = 140 }: Props) {
  const [animated, setAnimated] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setAnimated(true), 120);
    return () => clearTimeout(t);
  }, [score]);

  const dashoffset = animated
    ? CIRCUMFERENCE * (1 - score / 10)
    : CIRCUMFERENCE;

  const color = scoreColor(score);
  const center = size / 2;

  return (
    <div className="relative inline-flex items-center justify-center flex-shrink-0">
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="-rotate-90"
        aria-label={`Score: ${score} out of 10`}
      >
        {/* Track ring */}
        <circle
          cx={center}
          cy={center}
          r={RADIUS}
          fill="none"
          stroke="rgba(255,255,255,0.06)"
          strokeWidth={STROKE}
        />
        {/* Progress ring */}
        <circle
          cx={center}
          cy={center}
          r={RADIUS}
          fill="none"
          stroke={color}
          strokeWidth={STROKE}
          strokeDasharray={CIRCUMFERENCE}
          strokeDashoffset={dashoffset}
          strokeLinecap="round"
          style={{
            transition: "stroke-dashoffset 1.4s cubic-bezier(0.4, 0, 0.2, 1)",
          }}
        />
      </svg>

      {/* Center label */}
      <div className="absolute flex flex-col items-center justify-center gap-0.5">
        <span
          className="text-4xl font-extrabold leading-none tabular-nums"
          style={{ color }}
        >
          {score.toFixed(1)}
        </span>
        <span className="text-[10px] text-slate-600 font-semibold uppercase tracking-widest">
          {scoreLabel(score)}
        </span>
      </div>
    </div>
  );
}
