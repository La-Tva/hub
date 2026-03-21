'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSystemStore } from '@/store/useSystemStore';
import { cn } from '@/lib/utils';

export default function Clock() {
  const { setSettingsOpen, toggleClock } = useSystemStore();
  const [time, setTime] = useState(new Date());
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [is24h, setIs24h] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);

  // Clock ticking logic
  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Outside click logic
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const formatOptions = { hour: '2-digit', minute: '2-digit', hour12: !is24h } as const;
  const timeString = time.toLocaleTimeString('fr-FR', formatOptions);

  return (
    <motion.div
      ref={containerRef}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      onContextMenu={(e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsMenuOpen(!isMenuOpen);
      }}
      className="absolute top-[180px] left-1/2 -translate-x-1/2 z-0 pointer-events-auto select-none text-center group transition-all"
    >
      <div className="relative inline-block">
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 10 }}
              className="absolute top-0 left-full ml-4 w-32 glass-dark rounded-2xl border border-white/10 p-2 shadow-2xl z-50 overflow-hidden"
            >
              <button 
                onClick={() => { setIs24h(true); setIsMenuOpen(false); }}
                className={cn("w-full text-left px-3 py-2 rounded-xl text-[10px] font-bold transition-colors", is24h ? "text-white bg-white/10" : "text-white/60 hover:bg-white/10")}
              > Format 24h </button>
              <button 
                onClick={() => { setIs24h(false); setIsMenuOpen(false); }}
                className={cn("w-full text-left px-3 py-2 rounded-xl text-[10px] font-bold transition-colors", !is24h ? "text-white bg-white/10" : "text-white/60 hover:bg-white/10")}
              > Format 12h </button>
              <button 
                onClick={() => { toggleClock(); setIsMenuOpen(false); }}
                className="w-full text-left px-3 py-2 rounded-xl text-[10px] font-bold text-white/60 hover:bg-white/10 transition-colors"
                > Masquer </button>
              <button 
                onClick={() => { setSettingsOpen(true); setIsMenuOpen(false); }}
                className="w-full text-left px-3 py-2 rounded-xl text-[10px] font-bold text-white/40 hover:bg-white/10 transition-colors"
              > Plus... </button>
            </motion.div>
          )}
        </AnimatePresence>
        
        <h1 className="text-[72px] font-bold tracking-tighter drop-shadow-2xl leading-none" style={{ color: 'var(--foreground-rgb)' }}>
          {timeString}
        </h1>
      </div>
      <p className="text-sm font-medium uppercase tracking-[0.3em] -mt-2" style={{ color: 'var(--text-secondary)' }}>
        {time.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}
      </p>
    </motion.div>
  );
}
