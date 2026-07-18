'use client';

import React from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowRight, Sparkles } from 'lucide-react';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.12,
      delayChildren: 0.3,
    },
  },
} as const;

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: 'spring' as const, stiffness: 100, damping: 20 },
  },
};

/**
 * HeroContent — Glassmorphism overlay positioned above the 3D hero scene.
 */
export default function HeroContent() {
  return (
    <motion.div
      className="relative z-10 flex flex-col items-center justify-center min-h-[85vh] px-6 text-center"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Badge */}
      <motion.div
        variants={itemVariants}
        className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 mb-8"
      >
        <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
        <Sparkles size={14} className="text-[#fbbf24]" />
        <span className="text-xs font-medium text-[#8888aa] tracking-wide">
          Interactive 3D Engine
        </span>
      </motion.div>

      {/* Title */}
      <motion.h1
        variants={itemVariants}
        className="text-4xl sm:text-5xl md:text-7xl lg:text-8xl font-bold font-outfit leading-[1.05] tracking-tight mb-6"
      >
        <span className="bg-gradient-to-b from-[#f0f0f5] via-[#d0d0dd] to-[#8888aa] bg-clip-text text-transparent">
          Algorithms in
        </span>
        <br />
        <span className="bg-gradient-to-r from-[#00d4ff] via-[#a855f7] to-[#fbbf24] bg-clip-text text-transparent">
          True Dimension
        </span>
      </motion.h1>

      {/* Subtitle */}
      <motion.p
        variants={itemVariants}
        className="max-w-xl text-base sm:text-lg text-[#8888aa] leading-relaxed mb-10"
      >
        Explore pathfinding algorithms through an immersive 3D experience.
        Watch BFS, Dijkstra, and A* come alive on a fully interactive grid.
      </motion.p>

      {/* CTA Buttons */}
      <motion.div
        variants={itemVariants}
        className="flex flex-col sm:flex-row items-center gap-4"
      >
        <Link href="/visualizer">
          <motion.button
            className="group flex items-center gap-2 px-8 py-3.5 rounded-xl bg-gradient-to-r from-[#00d4ff]/15 to-[#8b5cf6]/15 border border-[#00d4ff]/20 text-[#f0f0f5] font-semibold text-sm tracking-wide transition-all duration-300 hover:border-[#00d4ff]/40 hover:shadow-[0_0_30px_rgba(0,212,255,0.15)]"
            whileHover={{ scale: 1.03, y: -2 }}
            whileTap={{ scale: 0.98 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
          >
            Open Canvas
            <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
          </motion.button>
        </Link>

        <Link href="/learn">
          <motion.button
            className="flex items-center gap-2 px-8 py-3.5 rounded-xl bg-white/5 border border-white/10 text-[#8888aa] font-medium text-sm tracking-wide transition-all duration-300 hover:text-[#f0f0f5] hover:bg-white/8 hover:border-white/15"
            whileHover={{ scale: 1.03, y: -2 }}
            whileTap={{ scale: 0.98 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
          >
            Learn Algorithms
          </motion.button>
        </Link>
      </motion.div>
    </motion.div>
  );
}
