'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
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
import StepByStep from './StepByStep';

/**
 * AlgorithmCard — Expandable glass card for each algorithm on the Learn page.
 * Client component with Framer Motion accordions.
 */
export default function AlgorithmCard({
  data,
  pseudocodeNode,
  index = 0,
}: {
  data: AlgorithmLearnData;
  pseudocodeNode: React.ReactNode;
  index?: number;
}) {
  const isPathfinding = data.category === 'pathfinding';
  const [openSection, setOpenSection] = useState<string | null>(null);

  const toggleSection = (section: string) => {
    setOpenSection(openSection === section ? null : section);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      whileHover={{ y: -4, boxShadow: '0 20px 60px rgba(0,0,0,0.3)' }}
      transition={{ 
        type: 'spring', 
        stiffness: 300, 
        damping: 20,
        opacity: { delay: index * 0.08 },
        y: { delay: index * 0.08 }
      }}
      className={`glass-elevated rounded-2xl p-5 flex flex-col gap-4 transition-all duration-300 ${
        isPathfinding ? 'algo-card-pathfinding' : 'algo-card-maze'
      }`}
    >
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

      {/* Accordions */}
      <div className="flex flex-col gap-1 mt-2">
        {/* Explanation */}
        <div>
          <button
            onClick={() => toggleSection('explanation')}
            className="flex items-center gap-2 text-sm font-medium text-[#8888aa] hover:text-white transition-colors w-full text-left py-1"
          >
            <ChevronDown
              size={14}
              className={`transition-transform duration-300 ${openSection === 'explanation' ? 'rotate-180 text-white' : ''}`}
            />
            How it works
          </button>
          <AnimatePresence initial={false}>
            {openSection === 'explanation' && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3, ease: 'easeInOut' }}
                className="overflow-hidden"
              >
                <div className="pt-2 pb-3 text-sm text-[#aaaacc] leading-relaxed whitespace-pre-line">
                  {data.explanation}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Pseudocode */}
        <div>
          <button
            onClick={() => toggleSection('pseudocode')}
            className="flex items-center gap-2 text-sm font-medium text-[#8888aa] hover:text-white transition-colors w-full text-left py-1"
          >
            <ChevronDown
              size={14}
              className={`transition-transform duration-300 ${openSection === 'pseudocode' ? 'rotate-180 text-white' : ''}`}
            />
            Pseudocode
          </button>
          <AnimatePresence initial={false}>
            {openSection === 'pseudocode' && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3, ease: 'easeInOut' }}
                className="overflow-hidden"
              >
                <div className="pt-2 pb-3">
                  {pseudocodeNode}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Step-by-step */}
        <div>
          <button
            onClick={() => toggleSection('steps')}
            className="flex items-center gap-2 text-sm font-medium text-[#8888aa] hover:text-white transition-colors w-full text-left py-1"
          >
            <ChevronDown
              size={14}
              className={`transition-transform duration-300 ${openSection === 'steps' ? 'rotate-180 text-white' : ''}`}
            />
            Step-by-step
          </button>
          <AnimatePresence initial={false}>
            {openSection === 'steps' && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3, ease: 'easeInOut' }}
                className="overflow-hidden"
              >
                <div className="pt-2 pb-3">
                  <StepByStep steps={data.steps} />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Key Insight */}
      <div className="flex items-start gap-2 p-3 rounded-xl bg-[#fbbf24]/5 border border-[#fbbf24]/10 mt-auto">
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
    </motion.div>
  );
}
