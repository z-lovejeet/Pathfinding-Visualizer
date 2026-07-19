'use client';

import React, { useEffect, useId, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { XCircle, X } from 'lucide-react';
import { useVisualizerStore } from '@/store/useVisualizerStore';

const FOCUSABLE_SELECTOR = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(',');

function getFocusableElements(container: HTMLElement) {
  return Array.from(container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)).filter(
    (element) => !element.hasAttribute('aria-hidden') && element.tabIndex >= 0
  );
}

/**
 * NoPathModal — An accessible alert dialog shown when an algorithm cannot
 * reach its target. It remains open until the user dismisses it.
 */
export function NoPathModal() {
  const showNoPathModal = useVisualizerStore((s) => s.showNoPathModal);
  const dismissNoPathModal = useVisualizerStore((s) => s.dismissNoPathModal);
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const titleId = useId();
  const descriptionId = useId();

  useEffect(() => {
    if (!showNoPathModal) return;

    const previouslyFocused = document.activeElement instanceof HTMLElement
      ? document.activeElement
      : null;
    const focusFrame = window.requestAnimationFrame(() => closeButtonRef.current?.focus());

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        dismissNoPathModal();
        return;
      }

      if (event.key !== 'Tab') return;

      const dialog = dialogRef.current;
      if (!dialog) return;

      const focusableElements = getFocusableElements(dialog);
      if (focusableElements.length === 0) {
        event.preventDefault();
        dialog.focus();
        return;
      }

      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];
      const activeElement = document.activeElement;

      if (event.shiftKey && (activeElement === firstElement || !dialog.contains(activeElement))) {
        event.preventDefault();
        lastElement.focus();
      } else if (!event.shiftKey && (activeElement === lastElement || !dialog.contains(activeElement))) {
        event.preventDefault();
        firstElement.focus();
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      window.cancelAnimationFrame(focusFrame);
      document.removeEventListener('keydown', handleKeyDown);
      if (previouslyFocused?.isConnected) {
        previouslyFocused.focus();
      }
    };
  }, [dismissNoPathModal, showNoPathModal]);

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
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={dismissNoPathModal}
            aria-hidden="true"
          />

          {/* Modal */}
          <motion.div
            ref={dialogRef}
            role="alertdialog"
            aria-modal="true"
            aria-labelledby={titleId}
            aria-describedby={descriptionId}
            tabIndex={-1}
            className="relative glass-elevated p-8 rounded-2xl max-w-sm w-full mx-4 text-center border border-red-500/15"
            initial={{ opacity: 0, scale: 0.9, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 5 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          >
            {/* Close button */}
            <button
              ref={closeButtonRef}
              type="button"
              onClick={dismissNoPathModal}
              className="absolute top-3 right-3 p-1 rounded-lg text-[#555577] hover:text-[#8888aa] hover:bg-white/5 transition-all duration-200"
              aria-label="Close no path dialog"
            >
              <X size={16} aria-hidden="true" />
            </button>

            {/* Icon */}
            <div className="w-14 h-14 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto mb-4" aria-hidden="true">
              <XCircle size={28} className="text-red-400" style={{ filter: 'drop-shadow(0 0 8px rgba(255,71,87,0.4))' }} />
            </div>

            {/* Text */}
            <h3 id={titleId} className="text-lg font-semibold text-[#f0f0f5] font-outfit mb-2">
              No Path Found
            </h3>
            <p id={descriptionId} className="text-sm text-[#8888aa] leading-relaxed mb-6">
              The target is unreachable. Try removing some walls or generating a new maze.
            </p>

            {/* Dismiss button */}
            <button
              type="button"
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
