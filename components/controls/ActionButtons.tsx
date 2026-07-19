'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, RotateCcw, Trash2, Square, Share2 } from 'lucide-react';
import { useVisualizerStore } from '@/store/useVisualizerStore';
import { serializeGrid } from '@/lib/grid/gridUtils';
import { GlassButton } from '../ui/GlassButton';
import { ShareModal } from './ShareModal';

/**
 * ActionButtons — Visualize, Pause/Resume, Clear Path, Clear Board.
 *
 * Features Framer Motion spring press states and AnimatePresence label morphing.
 */
export default function ActionButtons() {
  const [isShareModalOpen, setIsShareModalOpen] = React.useState(false);
  const isVisualizing = useVisualizerStore((s) => s.isVisualizing);
  const isPaused = useVisualizerStore((s) => s.isPaused);
  const runAlgorithm = useVisualizerStore((s) => s.runAlgorithm);
  const pauseAlgorithm = useVisualizerStore((s) => s.pauseAlgorithm);
  const resumeAlgorithm = useVisualizerStore((s) => s.resumeAlgorithm);
  const stopAlgorithm = useVisualizerStore((s) => s.stopAlgorithm);
  const clearPath = useVisualizerStore((s) => s.clearPath);
  const clearBoard = useVisualizerStore((s) => s.clearBoard);

  const handleShare = async (title: string): Promise<{ url?: string; error?: string }> => {
    try {
      const { grid, algorithm } = useVisualizerStore.getState();
      const gridData = serializeGrid(grid);
      const res = await fetch('/api/share', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, gridData, algorithm })
      });
      const data = await res.json();
      if (res.ok && data.id) {
        const url = `${window.location.origin}/visualizer?share=${data.id}`;
        return { url };
      } else {
        return { error: data.error || 'Failed to share grid.' };
      }
    } catch (err) {
      console.error(err);
      return { error: 'An unexpected error occurred.' };
    }
  };

  return (
    <div className="flex flex-col gap-2">
      {/* Primary action row */}
      <div className="flex gap-2">
        <AnimatePresence mode="wait">
          {!isVisualizing ? (
            <motion.div
              key="visualize"
              className="flex-1"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ type: 'spring' as const, stiffness: 400, damping: 25 }}
            >
              <motion.div whileTap={{ scale: 0.95 }} whileHover={{ scale: 1.02 }}>
                <GlassButton
                  variant="primary"
                  size="sm"
                  icon={Play}
                  onClick={runAlgorithm}
                  className="w-full"
                >
                  Visualize
                </GlassButton>
              </motion.div>
            </motion.div>
          ) : (
            <motion.div
              key="running"
              className="flex-1 flex gap-2"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ type: 'spring' as const, stiffness: 400, damping: 25 }}
            >
              <motion.div whileTap={{ scale: 0.95 }} className="flex-1">
                <GlassButton
                  variant="default"
                  size="sm"
                  icon={isPaused ? Play : Pause}
                  onClick={isPaused ? resumeAlgorithm : pauseAlgorithm}
                  className="w-full"
                >
                  {isPaused ? 'Resume' : 'Pause'}
                </GlassButton>
              </motion.div>
              <motion.div whileTap={{ scale: 0.95 }}>
                <GlassButton
                  variant="danger"
                  size="sm"
                  icon={Square}
                  onClick={stopAlgorithm}
                >
                  Stop
                </GlassButton>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Secondary action row */}
      <div className="flex gap-2">
        <motion.div whileTap={{ scale: 0.95 }} whileHover={{ scale: 1.02 }} className="flex-1">
          <GlassButton
            variant="ghost"
            size="sm"
            icon={RotateCcw}
            onClick={clearPath}
            disabled={isVisualizing}
            className="w-full"
          >
            Clear Path
          </GlassButton>
        </motion.div>
        <motion.div whileTap={{ scale: 0.95 }} whileHover={{ scale: 1.02 }} className="flex-1">
          <GlassButton
            variant="ghost"
            size="sm"
            icon={Trash2}
            onClick={clearBoard}
            disabled={isVisualizing}
            className="w-full"
          >
            Reset
          </GlassButton>
        </motion.div>
      </div>

      {/* Tertiary action row */}
      <div className="flex">
        <motion.div whileTap={{ scale: 0.95 }} whileHover={{ scale: 1.02 }} className="flex-1">
          <GlassButton
            variant="ghost"
            size="sm"
            icon={Share2}
            onClick={() => setIsShareModalOpen(true)}
            disabled={isVisualizing}
            className="w-full"
          >
            Share Grid
          </GlassButton>
        </motion.div>
      </div>

      <ShareModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        onShare={handleShare}
      />
    </div>
  );
}
