'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Box, Zap, MousePointerClick } from 'lucide-react';

const features = [
  {
    icon: Box,
    title: '3D Interactive Grid',
    description: 'Explore a 25×50 node grid rendered in real-time 3D with spring physics and cinematic bloom effects.',
    color: '#00d4ff',
    bgColor: 'rgba(0, 212, 255, 0.08)',
    borderColor: 'rgba(0, 212, 255, 0.15)',
  },
  {
    icon: Zap,
    title: 'Real-time Execution',
    description: '6 pathfinding algorithms with live animated traversal, adjustable speed, and real-time statistics.',
    color: '#fbbf24',
    bgColor: 'rgba(251, 191, 36, 0.08)',
    borderColor: 'rgba(251, 191, 36, 0.15)',
  },
  {
    icon: MousePointerClick,
    title: 'Deep Interaction',
    description: 'Draw walls, place weights, drag start/end nodes, generate mazes — all with satisfying tactile feedback.',
    color: '#a855f7',
    bgColor: 'rgba(168, 85, 247, 0.08)',
    borderColor: 'rgba(168, 85, 247, 0.15)',
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.15 },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: 'spring' as const, stiffness: 120, damping: 18 },
  },
};

/**
 * FeatureCards — 3-card feature grid with scroll-triggered reveal.
 */
export default function FeatureCards() {
  return (
    <section className="relative z-10 px-6 py-24 max-w-6xl mx-auto">
      <motion.div
        className="text-center mb-16"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-100px' }}
        transition={{ type: 'spring', stiffness: 100, damping: 20 }}
      >
        <h2 className="text-3xl sm:text-4xl font-bold font-outfit text-[#f0f0f5] mb-4">
          Built for Understanding
        </h2>
        <p className="text-[#8888aa] max-w-lg mx-auto">
          Every feature is designed to make algorithms intuitive, visual, and memorable.
        </p>
      </motion.div>

      <motion.div
        className="grid grid-cols-1 md:grid-cols-3 gap-6"
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-80px' }}
      >
        {features.map((feature) => {
          const Icon = feature.icon;
          return (
            <motion.div
              key={feature.title}
              variants={cardVariants}
              whileHover={{
                y: -8,
                transition: { type: 'spring', stiffness: 300, damping: 20 },
              }}
              className="glass-elevated p-6 rounded-2xl cursor-default group transition-all duration-300 hover:border-white/15"
              style={{ borderColor: 'rgba(255,255,255,0.08)' }}
            >
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-transform duration-300 group-hover:scale-110"
                style={{
                  backgroundColor: feature.bgColor,
                  border: `1px solid ${feature.borderColor}`,
                }}
              >
                <Icon size={22} style={{ color: feature.color }} />
              </div>

              <h3 className="text-lg font-semibold text-[#f0f0f5] mb-2 font-outfit">
                {feature.title}
              </h3>

              <p className="text-sm text-[#8888aa] leading-relaxed">
                {feature.description}
              </p>
            </motion.div>
          );
        })}
      </motion.div>
    </section>
  );
}
