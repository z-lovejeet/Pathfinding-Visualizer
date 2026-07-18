import React, { Suspense } from 'react';
import Link from 'next/link';
import {
  ChevronDown,
  Zap,
  Scale,
  Compass,
  CheckCircle2,
  XCircle,
  ArrowRight,
  Lightbulb,
} from 'lucide-react';
import type { AlgorithmLearnData } from '@/lib/learn/algorithmData';
import PseudocodeBlock from './PseudocodeBlock';

/**
 * AlgorithmCard — Expandable glass card for each algorithm on the Learn page.
 * Uses server component <details>/<summary> for zero-JS expand/collapse.
 */
export default function AlgorithmCard({ data }: { data: AlgorithmLearnData }) {
  const isPathfinding = data.category === 'pathfinding';

  return (
    <div className="glass-elevated rounded-2xl p-5 flex flex-col gap-4 transition-all duration-300 hover:border-white/10">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span
              className={`text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                isPathfinding
                  ? 'bg-[#00d4ff]/10 text-[#00d4ff]'
                  : 'bg-[#a78bfa]/10 text-[#a78bfa]'
              }`}
            >
              {data.category}
            </span>
          </div>
          <h3 className="text-lg font-bold text-white font-outfit">{data.name}</h3>
          <p className="text-sm text-[#8888aa] mt-1 leading-relaxed">{data.tagline}</p>
        </div>
      </div>

      {/* Properties */}
      <div className="flex flex-wrap gap-2">
        {isPathfinding && (
          <>
            <span className="flex items-center gap-1 text-xs px-2.5 py-1 rounded-lg bg-white/[0.03] border border-white/5">
              {data.guaranteesShortestPath ? (
                <CheckCircle2 size={12} className="text-emerald-400" />
              ) : (
                <XCircle size={12} className="text-red-400" />
              )}
              {data.guaranteesShortestPath ? 'Optimal' : 'Non-optimal'}
            </span>
            <span className="flex items-center gap-1 text-xs px-2.5 py-1 rounded-lg bg-white/[0.03] border border-white/5">
              <Scale size={12} className="text-[#a78bfa]" />
              {data.handlesWeights ? 'Weighted' : 'Unweighted'}
            </span>
            {data.usesHeuristic && (
              <span className="flex items-center gap-1 text-xs px-2.5 py-1 rounded-lg bg-white/[0.03] border border-white/5">
                <Compass size={12} className="text-[#fbbf24]" />
                Heuristic
              </span>
            )}
          </>
        )}
        <span className="flex items-center gap-1 text-xs px-2.5 py-1 rounded-lg bg-white/[0.03] border border-white/5">
          <Zap size={12} className="text-[#00d4ff]" />
          {data.timeComplexity}
        </span>
        <span className="text-xs px-2.5 py-1 rounded-lg bg-white/[0.03] border border-white/5 text-[#8888aa] font-mono">
          {data.dataStructure}
        </span>
      </div>

      {/* Expandable: Explanation */}
      <details className="group">
        <summary className="flex items-center gap-2 cursor-pointer text-sm font-medium text-[#8888aa] hover:text-white transition-colors">
          <ChevronDown size={14} className="transition-transform group-open:rotate-180" />
          How it works
        </summary>
        <div className="mt-3 text-sm text-[#aaaacc] leading-relaxed whitespace-pre-line">
          {data.explanation}
        </div>
      </details>

      {/* Expandable: Pseudocode */}
      <details className="group">
        <summary className="flex items-center gap-2 cursor-pointer text-sm font-medium text-[#8888aa] hover:text-white transition-colors">
          <ChevronDown size={14} className="transition-transform group-open:rotate-180" />
          Pseudocode
        </summary>
        <div className="mt-3">
          <Suspense fallback={<div className="h-32 bg-black/20 rounded-xl animate-pulse" />}>
            <PseudocodeBlock code={data.pseudocode} language="plaintext" />
          </Suspense>
        </div>
      </details>

      {/* Expandable: Step-by-step */}
      <details className="group">
        <summary className="flex items-center gap-2 cursor-pointer text-sm font-medium text-[#8888aa] hover:text-white transition-colors">
          <ChevronDown size={14} className="transition-transform group-open:rotate-180" />
          Step-by-step
        </summary>
        <ol className="mt-3 space-y-2 text-sm text-[#aaaacc]">
          {data.steps.map((step, i) => (
            <li key={i} className="flex gap-2">
              <span className="flex-shrink-0 w-5 h-5 rounded-full bg-[#00d4ff]/10 text-[#00d4ff] text-xs flex items-center justify-center font-bold">
                {i + 1}
              </span>
              <span className="leading-relaxed">{step}</span>
            </li>
          ))}
        </ol>
      </details>

      {/* Key Insight */}
      <div className="flex items-start gap-2 p-3 rounded-xl bg-[#fbbf24]/5 border border-[#fbbf24]/10">
        <Lightbulb size={16} className="text-[#fbbf24] flex-shrink-0 mt-0.5" />
        <p className="text-xs text-[#fbbf24]/90 leading-relaxed">{data.keyInsight}</p>
      </div>

      {/* 3D Visual behavior */}
      <p className="text-xs text-[#555577] italic">
        🎮 3D Visual: {data.visualBehavior}
      </p>

      {/* Try it link */}
      {isPathfinding && (
        <Link
          href={`/visualizer`}
          className="flex items-center gap-1.5 text-sm font-medium text-[#00d4ff] hover:text-[#00d4ff]/80 transition-colors self-start"
        >
          Try it
          <ArrowRight size={14} />
        </Link>
      )}
    </div>
  );
}
