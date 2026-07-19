'use client';

import { motion } from 'framer-motion';
import { ReactNode } from 'react';

export default function FadeIn({
  children,
  delay = 0,
  y = 20,
  className = '',
}: {
  children: ReactNode;
  delay?: number;
  y?: number;
  className?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ delay, type: 'spring', stiffness: 300, damping: 24 }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
