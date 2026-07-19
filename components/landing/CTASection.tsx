'use client';

import React from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

/**
 * CTASection — Bottom call-to-action with animated gradient border glow.
 */
export default function CTASection() {
  return (
    <section className="relative z-10 px-6 py-24 max-w-4xl mx-auto">
      <motion.div
        className="relative overflow-hidden rounded-3xl"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-80px' }}
        transition={{ type: 'spring', stiffness: 100, damping: 20 }}
      >
        {/* Gradient glow behind */}
        <div className="absolute -inset-[1px] rounded-3xl bg-gradient-to-r from-[#00d4ff]/20 via-[#a855f7]/20 to-[#fbbf24]/20 blur-sm" />

        {/* Content card */}
        <div className="relative glass-elevated rounded-3xl p-10 sm:p-14 text-center border border-white/8">
          {/* Decorative gradient orbs */}
          <div className="absolute top-0 left-1/4 w-64 h-64 bg-[#00d4ff]/5 rounded-full blur-3xl pointer-events-none" style={{ animation: 'ambientFloat 8s ease-in-out infinite' }} />
          <div className="absolute bottom-0 right-1/4 w-48 h-48 bg-[#a855f7]/5 rounded-full blur-3xl pointer-events-none" style={{ animation: 'ambientFloat 10s ease-in-out infinite reverse' }} />

          <h2 className="text-3xl sm:text-4xl font-bold font-outfit text-[#f0f0f5] mb-4 relative z-10">
            Ready to Visualize?
          </h2>

          <p className="text-[#8888aa] max-w-md mx-auto mb-8 relative z-10">
            Jump into the 3D canvas and start exploring pathfinding algorithms with full interactivity.
          </p>

          <motion.div
            className="relative z-10 inline-flex"
            whileHover={{ scale: 1.05, y: -3 }}
            whileTap={{ scale: 0.97 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
          >
            <Link
              href="/visualizer"
              className="group relative z-10 inline-flex items-center gap-2 px-10 py-4 rounded-xl bg-gradient-to-r from-[#00d4ff]/15 to-[#8b5cf6]/15 border border-[#00d4ff]/25 text-[#f0f0f5] font-semibold tracking-wide transition-all duration-300 hover:border-[#00d4ff]/50 hover:shadow-[0_0_40px_rgba(0,212,255,0.2)]"
            >
              Open Canvas
              <ArrowRight
                size={18}
                className="group-hover:translate-x-1 transition-transform"
              />
            </Link>
          </motion.div>
        </div>
      </motion.div>
    </section>
  );
}
