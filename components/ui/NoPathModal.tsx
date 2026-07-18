'use client';

import React, { useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { XCircle, X } from 'lucide-react';
import { useVisualizerStore } from '@/store/useVisualizerStore';

/**
 * NoPathModal — Glass modal shown when algorithm finds no path.
 *
 * Auto-dismisses after 5 seconds with fade-out.
 */
export function NoPathModal() {
  const showNoPathModal = useVisualizerStore((s) => s.showNoPathModal);
  const dismissNoPathModal = useVisualizerStore((s) => s.dismissNoPathModal);

  // Auto-dismiss after 5 seconds
  useEffect(() => {
    if (!showNoPathModal) return;
    const timer = setTimeout(() => {
      dismissNoPathModal();
    }, 5000);
    return () => clearTimeout(timer);
  }, [showNoPathModal, dismissNoPathModal]);

  return (
    <AnimatePresence>
      {showNoPathModal && (
        <motion.div
          className="absolute inset-0 z-50 flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={dismissNoPathModal}
          />

          {/* Modal */}
          <motion.div
            className="relative glass-elevated p-8 rounded-2xl max-w-sm w-full mx-4 text-center border border-red-500/15"
            initial={{ opacity: 0, scale: 0.9, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 5 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          >
            {/* Close button */}
            <button
              onClick={dismissNoPathModal}
              className="absolute top-3 right-3 p-1 rounded-lg text-[#555577] hover:text-[#8888aa] hover:bg-white/5 transition-all duration-200"
            >
              <X size={16} />
            </button>

            {/* Icon */}
            <div className="w-14 h-14 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto mb-4">
              <XCircle size={28} className="text-red-400" style={{ filter: 'drop-shadow(0 0 8px rgba(255,71,87,0.4))' }} />
            </div>

            {/* Text */}
            <h3 className="text-lg font-semibold text-[#f0f0f5] font-outfit mb-2">
              No Path Found
            </h3>
            <p className="text-sm text-[#8888aa] leading-relaxed mb-6">
              The target is unreachable. Try removing some walls or generating a new maze.
            </p>

            {/* Dismiss button */}
            <button
              onClick={dismissNoPathModal}
              className="px-6 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm font-medium text-[#f0f0f5] hover:bg-white/8 hover:border-white/15 transition-all duration-200"
            >
              OK
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
