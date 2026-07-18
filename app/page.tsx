'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import HeroContent from '@/components/landing/HeroContent';
import FeatureCards from '@/components/landing/FeatureCards';
import AlgorithmShowcase from '@/components/landing/AlgorithmShowcase';
import CTASection from '@/components/landing/CTASection';

// Dynamic import for 3D hero — no SSR (requires browser APIs)
const HeroScene = dynamic(() => import('@/components/landing/HeroScene'), {
  ssr: false,
  loading: () => (
    <div className="absolute inset-0 bg-[#050508]" />
  ),
});

/**
 * Landing Page — Cinematic 3D hero with premium animated sections.
 *
 * The 3D scene runs a looping A* demo behind the hero content.
 * Feature cards, algorithm showcase, and CTA reveal on scroll.
 */
export default function LandingPage() {
  return (
    <div className="flex-1 bg-[#050508] overflow-x-hidden">
      {/* Hero Section — 3D background + overlay */}
      <section className="relative min-h-[85vh] overflow-hidden">
        <HeroScene />
        {/* Gradient fade at bottom of hero */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#050508] to-transparent z-[5] pointer-events-none" />
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
