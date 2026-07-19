'use client';

import React from 'react';
import HeroContent from '@/components/landing/HeroContent';
import FeatureCards from '@/components/landing/FeatureCards';
import AlgorithmShowcase from '@/components/landing/AlgorithmShowcase';
import CTASection from '@/components/landing/CTASection';

/**
 * Landing Page — Premium aesthetic without the 3D background grid.
 *
 * Feature cards, algorithm showcase, and CTA reveal on scroll.
 */
export default function LandingPage() {
  return (
    <div className="flex-1 overflow-x-hidden">
      {/* Hero Section */}
      <section className="relative min-h-[85vh] overflow-hidden flex flex-col justify-center">
        <HeroContent />
      </section>

      {/* Feature Cards */}
      <FeatureCards />

      {/* Algorithm Showcase */}
      <AlgorithmShowcase />

      {/* CTA */}
      <CTASection />
    </div>
  );
}
