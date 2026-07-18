'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import { Box, Code2, Network, BookOpen, Menu, X, Share2 } from 'lucide-react';
import { GlassButton } from '../ui/GlassButton';

export const Navbar = () => {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const navLinks = [
    { href: '/visualizer', label: 'Visualizer', icon: Network },
    { href: '/learn', label: 'Learn', icon: BookOpen },
    { href: '/compare', label: 'Compare', icon: Code2 },
  ];

  return (
    <nav className="glass-navbar">
      <div className="flex-1 flex items-center justify-start">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#00d4ff]/20 to-[#8b5cf6]/20 border border-white/10 flex items-center justify-center group-hover:scale-105 transition-transform">
            <Box className="text-[#00d4ff]" size={24} />
          </div>
          <span className="text-xl font-bold bg-gradient-to-r from-[#f0f0f5] to-[#8888aa] bg-clip-text text-transparent ml-2 font-outfit tracking-wide">
            DSA Visualizer
          </span>
        </Link>
      </div>

      {/* Desktop nav */}
      <div className="hidden md:flex items-center justify-center bg-[#0a0a0f]/50 p-1.5 rounded-2xl border border-white/5">
        {navLinks.map((link) => {
          const isActive = pathname === link.href;
          const Icon = link.icon;
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all duration-300 ${
                isActive 
                  ? 'bg-gradient-to-r from-[#00d4ff]/10 to-[#8b5cf6]/10 text-[#f0f0f5] shadow-[0_0_15px_rgba(0,212,255,0.15)]' 
                  : 'text-[#8888aa] hover:text-[#f0f0f5] hover:bg-white/5'
              }`}
            >
              <Icon size={18} className={isActive ? 'text-[#00d4ff]' : ''} />
              <span className="font-medium text-sm font-inter tracking-wide">{link.label}</span>
            </Link>
          );
        })}
      </div>

      <div className="flex-1 flex items-center justify-end gap-4">
        {pathname === '/visualizer' && (
          <GlassButton variant="primary" size="sm" icon={Share2}>
            Share Grid
          </GlassButton>
        )}

        {/* Mobile hamburger */}
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="md:hidden p-2 rounded-xl text-[#8888aa] hover:text-[#f0f0f5] hover:bg-white/5 transition-all duration-200"
        >
          {mobileOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Mobile nav panel */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              className="fixed inset-0 top-[72px] z-40 bg-black/40 backdrop-blur-sm md:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
            />

            {/* Panel */}
            <motion.div
              className="fixed top-[72px] left-0 right-0 z-50 md:hidden glass-elevated border-b border-white/5 p-4"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            >
              <div className="flex flex-col gap-1">
                {navLinks.map((link) => {
                  const isActive = pathname === link.href;
                  const Icon = link.icon;
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => setMobileOpen(false)}
                      className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                        isActive
                          ? 'bg-gradient-to-r from-[#00d4ff]/10 to-[#8b5cf6]/10 text-[#f0f0f5]'
                          : 'text-[#8888aa] hover:text-[#f0f0f5] hover:bg-white/5'
                      }`}
                    >
                      <Icon size={20} className={isActive ? 'text-[#00d4ff]' : ''} />
                      <span className="font-medium text-sm">{link.label}</span>
                    </Link>
                  );
                })}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </nav>
  );
};
