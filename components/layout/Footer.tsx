'use client';

import React from 'react';
import Link from 'next/link';
import { Heart, Github, GitBranch, Terminal } from 'lucide-react';
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
              <Github size={16} className="group-hover:text-[#00d4ff] transition-colors" />
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
