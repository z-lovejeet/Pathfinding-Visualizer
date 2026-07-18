'use client';

import React, { useEffect, useRef, useState } from 'react';

interface AnimatedCounterProps {
  value: number;
  duration?: number;
  formatOptions?: Intl.NumberFormatOptions;
  className?: string;
  suffix?: string;
}

/**
 * AnimatedCounter — Smooth count-up/down animation with easeOutExpo easing.
 *
 * Interpolates between old and new values using requestAnimationFrame
 * for a premium number-tick effect.
 */
export function AnimatedCounter({
  value,
  duration = 600,
  formatOptions,
  className = '',
  suffix = '',
}: AnimatedCounterProps) {
  const [displayValue, setDisplayValue] = useState(value);
  const previousValue = useRef(value);
  const animationRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(0);

  useEffect(() => {
    // Cancel any running animation
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }

    const from = previousValue.current;
    const to = value;

    // Skip animation if values are the same
    if (from === to) {
      setDisplayValue(to);
      return;
    }

    startTimeRef.current = performance.now();

    const animate = (now: number) => {
      const elapsed = now - startTimeRef.current;
      const progress = Math.min(elapsed / duration, 1);

      // easeOutExpo: rapid deceleration for satisfying feel
      const eased = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);

      const current = Math.round(from + (to - from) * eased);
      setDisplayValue(current);

      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animate);
      } else {
        previousValue.current = to;
        animationRef.current = null;
      }
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [value, duration]);

  // Update previous value ref when value changes
  useEffect(() => {
    return () => {
      previousValue.current = value;
    };
  }, [value]);

  const formatted = formatOptions
    ? new Intl.NumberFormat('en-US', formatOptions).format(displayValue)
    : displayValue.toLocaleString();

  return (
    <span className={`font-mono tabular-nums ${className}`}>
      {formatted}{suffix}
    </span>
  );
}
