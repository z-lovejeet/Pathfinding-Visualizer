'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Palette } from 'lucide-react';
import { useVisualizerStore } from '@/store/useVisualizerStore';
import { NODE_COLORS } from '@/lib/constants';

const LEGEND_ITEMS = [
  { label: 'Empty', color: NODE_COLORS.empty.css, mode: null },
  { label: 'Start', color: NODE_COLORS.start.css, mode: 'start' as const },
  { label: 'End', color: NODE_COLORS.end.css, mode: 'end' as const },
  { label: 'Wall', color: NODE_COLORS.wall.css, mode: 'wall' as const },
  { label: 'Weight', color: NODE_COLORS.weight.css, mode: 'weight' as const },
  { label: 'Visited', color: NODE_COLORS.visited.css, mode: null },
  { label: 'Path', color: NODE_COLORS.path.css, mode: null },
];

/**
 * Legend — Node type color swatches with interactive hover highlighting
 * and current tool indicator.
 *
 * Desktop: Horizontal glass bar at bottom center.
 * Mobile: Collapsible icon button that expands to show legend.
 */
export default function Legend() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const interactionMode = useVisualizerStore((s) => s.interactionMode);

  const renderItem = ({ label, color, mode }: typeof LEGEND_ITEMS[number]) => {
    const isGlowing = label === 'Start' || label === 'End' || label === 'Path';
    const isCurrentTool = mode !== null && interactionMode === mode;
    const isDimmed = hoveredItem !== null && hoveredItem !== label;

    return (
      <div
        key={label}
        className={`flex items-center gap-1.5 transition-all duration-200 ${
          isDimmed ? 'opacity-40' : 'opacity-100'
        }`}
        onMouseEnter={() => setHoveredItem(label)}
        onMouseLeave={() => setHoveredItem(null)}
      >
        <motion.div
          className="w-3 h-3 rounded-sm border border-white/10"
          style={{
            backgroundColor: color,
            boxShadow: isGlowing ? `0 0 8px ${color}60` : 'none',
          }}
          animate={{
            scale: hoveredItem === label ? 1.3 : 1,
          }}
          transition={{ type: 'spring' as const, stiffness: 400, damping: 20 }}
        />
        <span
          className={`text-[11px] font-medium transition-colors duration-200 ${
            isCurrentTool ? 'text-[#00d4ff]' : 'text-[#8888aa]'
          }`}
          style={{
            borderBottom: isCurrentTool ? '1px solid currentColor' : 'none',
            paddingBottom: isCurrentTool ? '1px' : '2px',
          }}
        >
          {label}
        </span>
      </div>
    );
  };

  return (
    <>
      {/* Desktop legend — horizontal bar */}
      <motion.div
        className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 glass p-3 px-5 rounded-2xl items-center gap-4 hidden md:flex"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring' as const, stiffness: 200, damping: 20, delay: 0.2 }}
      >
        {LEGEND_ITEMS.map(renderItem)}
      </motion.div>

      {/* Mobile legend — collapsible icon */}
      <div className="md:hidden absolute top-4 right-4 z-10">
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="glass-elevated p-2.5 rounded-xl text-[#8888aa] hover:text-[#f0f0f5] transition-colors duration-200"
        >
          <Palette size={18} />
        </button>

        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              className="absolute top-12 right-0 glass-elevated p-3 rounded-xl flex flex-col gap-2.5 min-w-[120px]"
              initial={{ opacity: 0, scale: 0.95, y: -5 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -5 }}
              transition={{ type: 'spring' as const, stiffness: 300, damping: 25 }}
            >
              {LEGEND_ITEMS.map(renderItem)}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
}
