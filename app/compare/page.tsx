'use client';

import React, { useEffect } from 'react';
import { GitCompareArrows } from 'lucide-react';
import { motion } from 'framer-motion';
import { useCompareStore } from '@/store/useCompareStore';
import { ALGORITHM_INFO } from '@/lib/constants';
import CompareControls from '@/components/compare/CompareControls';
import CompareGrid from '@/components/compare/CompareGrid';
import CompareStatsPanel from '@/components/compare/CompareStats';

/**
 * Compare Page — Side-by-side algorithm comparison with
 * shared grid, animated 2D mini-grids, and Recharts stats.
 */
export default function ComparePage() {
  const grid = useCompareStore((s) => s.grid);
  const rows = useCompareStore((s) => s.rows);
  const cols = useCompareStore((s) => s.cols);
  const algo1 = useCompareStore((s) => s.algo1);
  const algo2 = useCompareStore((s) => s.algo2);
  const speed = useCompareStore((s) => s.speed);
  const result1 = useCompareStore((s) => s.result1);
  const result2 = useCompareStore((s) => s.result2);
  const stats1 = useCompareStore((s) => s.stats1);
  const stats2 = useCompareStore((s) => s.stats2);
  const isRunning = useCompareStore((s) => s.isRunning);
  const toggleWall = useCompareStore((s) => s.toggleWall);
  const initGrid = useCompareStore((s) => s.initGrid);

  // Initialize grid on mount
  useEffect(() => {
    initGrid();
  }, [initGrid]);

  return (
    <div className="flex-1 w-full max-w-7xl mx-auto px-6 py-8 flex flex-col gap-6">
      
      {/* Global Progress Bar (Top) */}
      {isRunning && (
        <motion.div 
          initial={{ opacity: 0, scaleX: 0 }}
          animate={{ opacity: 1, scaleX: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5, ease: "linear" }}
          className="fixed top-0 left-0 w-full h-1 z-50 origin-left bg-gradient-to-r from-[#00d4ff] via-[#8b5cf6] to-[#a855f7]"
        />
      )}

      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 24, delay: 0.1 }}
        className="flex items-center gap-3"
      >
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#00d4ff]/20 to-[#a855f7]/20 flex items-center justify-center border border-white/5">
          <GitCompareArrows size={20} className="text-[#00d4ff]" />
        </div>
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-white font-outfit">
            Algorithm Comparison
          </h1>
          <p className="text-sm text-[#8888aa]">
            Race two pathfinding algorithms side-by-side to compare efficiency and behavior.
          </p>
        </div>
      </motion.div>

      {/* Controls */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 24, delay: 0.2 }}
      >
        <CompareControls />
      </motion.div>

      {/* Grids */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 24, delay: 0.3 }}
        className="grid grid-cols-1 md:grid-cols-2 gap-6"
      >
        <CompareGrid
          grid={grid}
          rows={rows}
          cols={cols}
          result={result1}
          speed={speed}
          label={ALGORITHM_INFO[algo1].name}
          accentColor="#00d4ff"
          isRunning={isRunning}
          onToggleWall={toggleWall}
        />
        <CompareGrid
          grid={grid}
          rows={rows}
          cols={cols}
          result={result2}
          speed={speed}
          label={ALGORITHM_INFO[algo2].name}
          accentColor="#a855f7"
          isRunning={isRunning}
          onToggleWall={toggleWall}
        />
      </motion.div>

      {/* Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 24, delay: 0.4 }}
      >
        <CompareStatsPanel
          stats1={stats1}
          stats2={stats2}
          algo1={algo1}
          algo2={algo2}
        />
      </motion.div>
    </div>
  );
}
