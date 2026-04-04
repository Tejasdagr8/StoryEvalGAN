"use client";

import { useState } from "react";

const EXAMPLES = [
  "A boy discovers a magical pen that writes his dreams into reality",
  "An astronaut stranded on Mars finds evidence of ancient life",
  "A librarian stumbles upon a book that predicts the future",
  "Two rival chefs compete in a magical cooking tournament",
  "A clockmaker builds a device that can revisit memories",
];

interface Props {
  onEvaluate: (prompt: string) => void;
  loading: boolean;
}

export default function StoryForm({ onEvaluate, loading }: Props) {
  const [prompt, setPrompt] = useState(EXAMPLES[0]);
  const MAX = 500;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (prompt.trim() && !loading) onEvaluate(prompt.trim());
  };

  return (
    <form onSubmit={handleSubmit} className="glass rounded-2xl p-6 sm:p-8">
      {/* Label */}
      <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-widest mb-3">
        Story Prompt
      </label>

      {/* Textarea */}
      <div className="relative mb-4">
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value.slice(0, MAX))}
          placeholder="Enter a creative story prompt…"
          rows={4}
          disabled={loading}
          className="
            w-full bg-[#0f172a] border border-white/10 rounded-xl px-4 py-3
            text-slate-200 placeholder-slate-600 resize-none text-sm leading-relaxed
            focus:outline-none focus:border-violet-500/50
            transition-colors duration-200 disabled:opacity-60
          "
        />
        <span className="absolute bottom-3 right-3 text-[11px] text-slate-600 select-none">
          {prompt.length}/{MAX}
        </span>
      </div>

      {/* Example chips */}
      <div className="mb-6">
        <p className="text-[11px] text-slate-600 mb-2">Try an example:</p>
        <div className="flex flex-wrap gap-2">
          {EXAMPLES.slice(0, 4).map((ex, i) => (
            <button
              key={i}
              type="button"
              disabled={loading}
              onClick={() => setPrompt(ex)}
              className="
                text-[11px] px-3 py-1.5 rounded-full
                bg-white/5 border border-white/10
                text-slate-400 hover:text-slate-200
                hover:border-violet-500/40 hover:bg-violet-500/10
                transition-all duration-150 disabled:opacity-40
              "
            >
              {ex.slice(0, 42)}…
            </button>
          ))}
        </div>
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={loading || !prompt.trim()}
        className="
          w-full py-3.5 rounded-xl font-semibold text-sm
          bg-gradient-to-r from-violet-600 to-purple-600
          hover:from-violet-500 hover:to-purple-500
          text-white shadow-lg shadow-violet-900/30 hover:shadow-violet-900/50
          transition-all duration-200
          disabled:opacity-50 disabled:cursor-not-allowed
          flex items-center justify-center gap-2.5
        "
      >
        {loading ? (
          <>
            <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
              />
            </svg>
            Running pipeline…
          </>
        ) : (
          <>
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            Generate &amp; Evaluate Story
          </>
        )}
      </button>
    </form>
  );
}
