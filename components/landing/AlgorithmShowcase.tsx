'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { ALGORITHM_INFO } from '@/lib/constants';
import { AlgorithmType } from '@/lib/grid/types';

const algorithmCards: {
  key: AlgorithmType;
  tagline: string;
  color: string;
  borderColor: string;
}[] = [
  { key: 'bfs', tagline: 'Level-by-level explorer', color: '#00d4ff', borderColor: 'rgba(0,212,255,0.2)' },
  { key: 'dfs', tagline: 'Deep dive pathfinder', color: '#a855f7', borderColor: 'rgba(168,85,247,0.2)' },
  { key: 'dijkstra', tagline: 'Optimal cost seeker', color: '#22d3ee', borderColor: 'rgba(34,211,238,0.2)' },
  { key: 'astar', tagline: 'Heuristic-guided star', color: '#fbbf24', borderColor: 'rgba(251,191,36,0.2)' },
  { key: 'greedy', tagline: 'Speed over optimality', color: '#f59e0b', borderColor: 'rgba(245,158,11,0.2)' },
  { key: 'bidirectional', tagline: 'Meet in the middle', color: '#22c55e', borderColor: 'rgba(34,197,94,0.2)' },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const cardVariants = {
  hidden: { opacity: 0, x: 20 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { type: 'spring' as const, stiffness: 120, damping: 18 },
  },
};

/**
 * AlgorithmShowcase — Horizontal scroll of mini algorithm preview cards.
 */
export default function AlgorithmShowcase() {
  return (
    <section className="relative z-10 px-6 py-20 max-w-6xl mx-auto">
      <motion.div
        className="text-center mb-12"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-100px' }}
        transition={{ type: 'spring', stiffness: 100, damping: 20 }}
      >
        <h2 className="text-3xl sm:text-4xl font-bold font-outfit text-[#f0f0f5] mb-4">
          6 Algorithms, One Canvas
        </h2>
        <p className="text-[#8888aa] max-w-lg mx-auto">
          Compare how different strategies explore the same grid.
        </p>
      </motion.div>

      <motion.div
        className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide snap-x snap-mandatory md:grid md:grid-cols-3 md:overflow-visible"
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-60px' }}
      >
        {algorithmCards.map((card) => {
          const info = ALGORITHM_INFO[card.key];
          return (
            <motion.div
              key={card.key}
              variants={cardVariants}
              whileHover={{
                y: -6,
                transition: { type: 'spring', stiffness: 300, damping: 20 },
              }}
              className="snap-start shrink-0 w-[260px] md:w-auto glass p-5 rounded-2xl cursor-default group border border-white/8 hover:border-white/15 transition-colors duration-300"
            >
              <div className="flex items-center gap-3 mb-3">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{
                    backgroundColor: card.color,
                    boxShadow: `0 0 10px ${card.borderColor}`,
                  }}
                />
                <span className="text-sm font-semibold text-[#f0f0f5] font-outfit">
                  {info.name}
                </span>
              </div>

              <p className="text-xs text-[#8888aa] mb-3 leading-relaxed">
                {card.tagline}
              </p>

              <div className="flex gap-2">
                <span
                  className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${
                    info.isShortest
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                      : 'bg-red-500/10 text-red-400 border border-red-500/20'
                  }`}
                >
                  {info.isShortest ? '✓ Shortest' : '✗ Not shortest'}
                </span>
                <span
                  className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${
                    info.isWeighted
                      ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20'
                      : 'bg-gray-500/10 text-gray-400 border border-gray-500/20'
                  }`}
                >
                  {info.isWeighted ? '⚖ Weighted' : '○ Unweighted'}
                </span>
              </div>
            </motion.div>
          );
        })}
      </motion.div>
    </section>
  );
}
