'use client';

import React from 'react';
import Link from 'next/link';
import { Heart, GitBranch, Terminal } from 'lucide-react';
import { motion } from 'framer-motion';

/**
 * Footer — Premium glass footer with nav links, repo info, and credits.
 */
export function Footer() {
  return (
    <footer className="relative z-10 w-full border-t border-white/10 bg-black/40 backdrop-blur-2xl">
      <div className="absolute inset-0 bg-gradient-to-t from-[#050508]/80 to-transparent pointer-events-none" />
      
      <div className="relative max-w-7xl mx-auto px-6 py-12 md:py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
          
          {/* Left — Brand / Credits */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2 text-white">
              <Terminal size={18} className="text-[#00d4ff]" />
              <span className="font-bold tracking-wide">Pathfinding Visualizer</span>
            </div>
            <div className="flex items-center gap-1.5 text-sm text-[#8888aa]">
              <span>Crafted with Next.js, R3F &</span>
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
              >
                <Heart size={14} className="text-red-400 fill-red-400" />
              </motion.div>
            </div>
          </div>

          {/* Center — Nav links */}
          <div className="flex items-center justify-center gap-8">
            {[
              { href: '/visualizer', label: 'Visualizer' },
              { href: '/learn', label: 'Learn' },
              { href: '/compare', label: 'Compare' },
            ].map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="relative text-sm font-medium text-[#8888aa] hover:text-white transition-colors duration-300 group"
              >
                {link.label}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-[#00d4ff] transition-all duration-300 group-hover:w-full rounded-full" />
              </Link>
            ))}
          </div>

          {/* Right — GitHub & Repository Info */}
          <div className="flex items-center justify-end gap-6">
            <a
              href="https://github.com/z-lovejeet/Pathfinding-Visualizer"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 hover:shadow-[0_0_20px_rgba(0,212,255,0.1)] text-[#8888aa] hover:text-white transition-all duration-300 group"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" className="group-hover:text-[#00d4ff] transition-colors">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
              </svg>
              <span className="text-sm font-medium">Source Code</span>
              <GitBranch size={14} className="ml-1 opacity-50" />
            </a>
          </div>
          
        </div>
        
        {/* Bottom copyright */}
        <div className="mt-8 pt-4 border-t border-white/5 flex items-center justify-between text-xs text-[#555577]">
          <p>© {new Date().getFullYear()} Lovejeet Singh. All rights reserved.</p>
          <p>Designed for learning and exploration.</p>
        </div>
      </div>
    </footer>
  );
}
