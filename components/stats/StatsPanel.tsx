'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Activity, Route, Scale, Timer, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import { useVisualizerStore } from '@/store/useVisualizerStore';
import { ALGORITHM_INFO } from '@/lib/constants';
import { AnimatedCounter } from '@/components/ui/AnimatedCounter';

const STAT_TOOLTIPS: Record<string, string> = {
  'Nodes Visited': 'Total nodes explored by the algorithm',
  'Path Length': 'Number of nodes in the shortest path',
  'Path Cost': 'Sum of weights along the path',
  'Time': 'Algorithm execution time (excludes animation)',
};

/**
 * StatsPanel — Floating glass card with real-time animated algorithm statistics.
 *
 * Features: animated count-up counters, live elapsed timer during visualization,
 * mini execution bars, stat hover tooltips, and algorithm badges.
 */
const StatsPanel = React.memo(function StatsPanel() {
  const nodesVisited = useVisualizerStore((s) => s.nodesVisited);
  const pathLength = useVisualizerStore((s) => s.pathLength);
  const pathCost = useVisualizerStore((s) => s.pathCost);
  const executionTime = useVisualizerStore((s) => s.executionTime);
  const algorithm = useVisualizerStore((s) => s.algorithm);
  const isComplete = useVisualizerStore((s) => s.isComplete);
  const isVisualizing = useVisualizerStore((s) => s.isVisualizing);
  const rows = useVisualizerStore((s) => s.rows);
  const cols = useVisualizerStore((s) => s.cols);
  const visualizationStartTime = useVisualizerStore((s) => s.visualizationStartTime);

  const [hoveredStat, setHoveredStat] = useState<string | null>(null);
  const [liveElapsed, setLiveElapsed] = useState(0);
  const rafRef = useRef<number>(0);

  const algoInfo = ALGORITHM_INFO[algorithm];
  const hasData = nodesVisited > 0 || isVisualizing;
  const noPathFound = isComplete && pathLength === 0;
  const totalNodes = rows * cols;

  // Live elapsed timer
  const updateTimer = useCallback(() => {
    const startTime = useVisualizerStore.getState().visualizationStartTime;
    if (startTime) {
      setLiveElapsed(performance.now() - startTime);
      rafRef.current = requestAnimationFrame(updateTimer);
    }
  }, []);

  useEffect(() => {
    if (visualizationStartTime) {
      rafRef.current = requestAnimationFrame(updateTimer);
    } else {
      setLiveElapsed(0);
    }
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [visualizationStartTime, updateTimer]);

  const stats = [
    { label: 'Nodes Visited', value: nodesVisited, icon: Activity, color: '#8b5cf6' },
    { label: 'Path Length', value: pathLength, icon: Route, color: '#fbbf24' },
    { label: 'Path Cost', value: pathCost, icon: Scale, color: '#22d3ee' },
    { label: 'Time', value: executionTime, icon: Timer, color: '#f59e0b', suffix: 'ms', isTime: true },
  ];

  return (
    <motion.div
      className="absolute bottom-4 right-4 z-10 glass-elevated p-4 w-[240px] rounded-2xl hidden md:block"
      initial={{ opacity: 0, x: 20, y: 20 }}
      animate={{ opacity: 1, x: 0, y: 0 }}
      transition={{ type: 'spring' as const, stiffness: 200, damping: 20, delay: 0.15 }}
    >
      {/* Algorithm badge */}
      <div className="flex items-center gap-2 mb-3">
        <div
          className="w-2 h-2 rounded-full transition-all duration-300"
          style={{
            backgroundColor: isVisualizing ? '#22d3ee' : isComplete ? '#22c55e' : '#8888aa',
            boxShadow: isVisualizing ? '0 0 8px rgba(34, 211, 238, 0.6)' : 'none',
          }}
        />
        <span className="text-xs font-semibold text-[#f0f0f5] tracking-wide">
          {algoInfo.name}
        </span>
        {isComplete && (
          pathLength > 0 ? (
            <CheckCircle size={14} className="text-emerald-400 ml-auto" />
          ) : (
            <XCircle size={14} className="text-red-400 ml-auto" />
          )
        )}
      </div>

      {/* Divider */}
      <div className="h-px bg-white/5 mb-3" />

      {/* Live elapsed timer */}
      {isVisualizing && (
        <div className="flex items-center gap-2 mb-3 px-2 py-1.5 rounded-lg bg-[#00d4ff]/5 border border-[#00d4ff]/10">
          <div className="w-1.5 h-1.5 rounded-full bg-[#00d4ff] timer-live" />
          <span className="text-[10px] text-[#8888aa] font-medium">Elapsed</span>
          <span className="text-xs font-mono tabular-nums text-[#00d4ff] ml-auto">
            {(liveElapsed / 1000).toFixed(2)}s
          </span>
        </div>
      )}

      {/* No path found warning */}
      {noPathFound && (
        <motion.div
          className="flex items-center gap-2 mb-3 px-2 py-1.5 rounded-lg bg-red-500/10 border border-red-500/20"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'spring' as const, stiffness: 300, damping: 20 }}
        >
          <AlertTriangle size={12} className="text-red-400 shrink-0" />
          <span className="text-[10px] text-red-400 font-medium">No path found</span>
        </motion.div>
      )}

      {/* Stats grid with animated counters */}
      <div className="grid grid-cols-2 gap-3">
        {stats.map(({ label, value, icon: Icon, color, suffix, isTime }) => (
          <div
            key={label}
            className="flex flex-col gap-1 relative"
            onMouseEnter={() => setHoveredStat(label)}
            onMouseLeave={() => setHoveredStat(null)}
          >
            <div className="flex items-center gap-1.5">
              <Icon size={12} style={{ color }} />
              <span className="text-[10px] text-[#8888aa] uppercase tracking-wider font-medium">
                {label}
              </span>
            </div>
            <div
              className="text-lg font-bold"
              style={{ color: hasData ? '#f0f0f5' : '#555577' }}
            >
              {isTime ? (
                <span className="font-mono tabular-nums">{value}{suffix}</span>
              ) : (
                <AnimatedCounter
                  value={value}
                  duration={400}
                  suffix={suffix}
                />
              )}
            </div>

            {/* Tooltip */}
            <AnimatePresence>
              {hoveredStat === label && (
                <motion.div
                  className="absolute -top-8 left-0 z-50 glass-tooltip text-[10px] text-[#8888aa] whitespace-nowrap stat-tooltip"
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 4 }}
                  transition={{ duration: 0.15 }}
                >
                  {STAT_TOOLTIPS[label]}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </div>

      {/* Mini execution bars (shown after completion) */}
      <AnimatePresence>
        {isComplete && nodesVisited > 0 && (
          <motion.div
            className="mt-3 pt-3 border-t border-white/5 flex flex-col gap-1.5"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ type: 'spring' as const, stiffness: 300, damping: 25 }}
          >
            {/* Visited bar */}
            <div className="flex items-center gap-2">
              <span className="text-[9px] text-[#8888aa] w-12 shrink-0">Visited</span>
              <div className="flex-1 h-1 rounded-full bg-white/5 overflow-hidden">
                <motion.div
                  className="h-full rounded-full bg-[#8b5cf6]"
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min((nodesVisited / totalNodes) * 100, 100)}%` }}
                  transition={{ type: 'spring' as const, stiffness: 100, damping: 15, delay: 0.1 }}
                />
              </div>
              <span className="text-[9px] text-[#555577] font-mono w-8 text-right">
                {Math.round((nodesVisited / totalNodes) * 100)}%
              </span>
            </div>

            {/* Path bar */}
            {pathLength > 0 && (
              <div className="flex items-center gap-2">
                <span className="text-[9px] text-[#8888aa] w-12 shrink-0">Path</span>
                <div className="flex-1 h-1 rounded-full bg-white/5 overflow-hidden">
                  <motion.div
                    className="h-full rounded-full bg-[#fbbf24]"
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min((pathLength / nodesVisited) * 100, 100)}%` }}
                    transition={{ type: 'spring' as const, stiffness: 100, damping: 15, delay: 0.2 }}
                  />
                </div>
                <span className="text-[9px] text-[#555577] font-mono w-8 text-right">
                  {Math.round((pathLength / nodesVisited) * 100)}%
                </span>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Algorithm properties */}
      <div className="flex gap-2 mt-3 pt-3 border-t border-white/5">
        <span
          className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${
            algoInfo.isShortest
              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
              : 'bg-red-500/10 text-red-400 border border-red-500/20'
          }`}
        >
          {algoInfo.isShortest ? '✓ Optimal' : '✗ Non-optimal'}
        </span>
        <span
          className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${
            algoInfo.isWeighted
              ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20'
              : 'bg-gray-500/10 text-gray-400 border border-gray-500/20'
          }`}
        >
          {algoInfo.isWeighted ? '⚖ Weighted' : '○ Unweighted'}
        </span>
      </div>
    </motion.div>
  );
});

export default StatsPanel;
