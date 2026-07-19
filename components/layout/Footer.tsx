'use client';

import React from 'react';
import Image from 'next/image';
import { usePathname } from 'next/navigation';

/**
 * Footer — Ultra-minimal, single-row glass footer.
 */
export function Footer() {
  const pathname = usePathname();

  if (pathname === '/visualizer') {
    return null;
  }

  return (
    <footer className="relative z-10 w-full border-t border-white/5 bg-black/30 backdrop-blur-xl h-[58px] flex items-center">
      <div className="w-full max-w-7xl mx-auto px-6 flex items-center justify-between gap-4">
        
        {/* Left — Brand & Copyright */}
        <div className="flex items-center gap-3">
          <Image src="/logo.jpg" alt="Logo" width={18} height={18} className="rounded-sm" />
          <span className="font-semibold tracking-wide text-[11px] text-white/90">Pathfinder</span>
          <span className="text-[10px] text-[#555577] hidden sm:inline">© {new Date().getFullYear()}</span>
        </div>

        {/* Center — Team */}
        <div className="flex items-center justify-center flex-1">
          <span className="text-[10px] text-[#555577] hidden md:inline tracking-wide text-center">
            Built by Lovejeet Singh, Sachit Babbar, Mohammad Asim, Shubham Kumar & Vineetosh Kumar
          </span>
        </div>

        {/* Right — GitHub */}
        <div className="flex items-center">
          <a
            href="https://github.com/z-lovejeet/Pathfinding-Visualizer"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#8888aa] hover:text-[#00d4ff] transition-colors duration-300"
            title="Source Code"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
            </svg>
          </a>
        </div>
        
      </div>
    </footer>
  );
}
