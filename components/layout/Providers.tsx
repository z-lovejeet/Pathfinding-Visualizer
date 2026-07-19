'use client';

import React from 'react';
import { MotionConfig } from 'framer-motion';
import { PageTransition } from './PageTransition';

/**
 * Providers — Client-side wrapper for layout.tsx.
 *
 * Wraps children in PageTransition (requires 'use client' for framer-motion).
 */
export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <MotionConfig reducedMotion="user">
      <PageTransition>{children}</PageTransition>
    </MotionConfig>
  );
}
