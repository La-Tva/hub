'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Clock, StickyNote, Sun, Timer, Calculator, Share2, EyeOff, Eye, Music, Clipboard, CloudUpload 
} from 'lucide-react';
import { useSystemStore } from '@/store/useSystemStore';
import { cn } from '@/lib/utils';

export default function WidgetDock() {
  const { 
    showClock, toggleClock,
    showNotes, toggleNotes,
    showWeather, toggleWeather,
    showTimer, toggleTimer,
    showCalculator, toggleCalculator,
    showClipboard, toggleClipboard,
    isSpotifyActive, setSpotifyActive,
    showDropZone, toggleDropZone,
    hideAllWidgets, showAllWidgets
  } = useSystemStore();

  const widgets = [
    { id: 'clock', icon: Clock, active: showClock, toggle: toggleClock, label: 'Horloge' },
    { id: 'notes', icon: StickyNote, active: showNotes, toggle: toggleNotes, label: 'Notes' },
    { id: 'weather', icon: Sun, active: showWeather, toggle: toggleWeather, label: 'Météo' },
    { id: 'timer', icon: Timer, active: showTimer, toggle: toggleTimer, label: 'Timer' },
    { id: 'calc', icon: Calculator, active: showCalculator, toggle: toggleCalculator, label: 'Calculatrice' },
    { id: 'clip', icon: Clipboard, active: showClipboard, toggle: toggleClipboard, label: 'Presse-papier' },
    { id: 'spotify', icon: Music, active: isSpotifyActive, toggle: () => setSpotifyActive(!isSpotifyActive), label: 'Spotify' },
    { id: 'share', icon: CloudUpload, active: showDropZone, toggle: toggleDropZone, label: 'Cloud Share' },
  ];

  return (
    <div className="fixed bottom-2 left-1/2 -translate-x-1/2 z-40 pointer-events-auto">
      <motion.div 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="flex items-center gap-2 p-2 rounded-2xl glass-dark border border-white/10 shadow-2xl"
      >
        <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent rounded-2xl pointer-events-none" />
        
        {widgets.map((widget) => {
          const Icon = widget.icon;
          return (
            <button
              key={widget.id}
              onClick={widget.toggle}
              className="relative group p-2 transition-all"
            >
              <motion.div
                whileHover={{ y: -4, scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                className={cn(
                  "p-3 rounded-xl border transition-all duration-300 flex items-center justify-center relative overflow-hidden",
                  widget.active 
                    ? "bg-white/15 border-white/20 shadow-[0_0_20px_rgba(255,255,255,0.05)]" 
                    : "bg-white/5 border-white/5 hover:bg-white/10"
                )}
              >
                <Icon className={cn(
                  "w-5 h-5 transition-colors duration-300",
                  widget.active ? "text-white" : "text-white/40 group-hover:text-white/70"
                )} />
                
                {/* Active Indicator Splash */}
                {widget.active && (
                  <motion.div
                    layoutId={`active-bg-${widget.id}`}
                    className="absolute inset-0 bg-white/5 blur-sm"
                  />
                )}

                {/* Tooltip */}
                <div className="absolute -top-10 left-1/2 -translate-x-1/2 px-2 py-1 rounded-lg bg-black/80 backdrop-blur-md border border-white/10 text-[10px] font-bold text-white opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
                  {widget.label}
                </div>
              </motion.div>

              {/* Dot Indicator */}
              <AnimatePresence>
                {widget.active && (
                  <motion.div
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0, opacity: 0 }}
                    className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-white shadow-[0_0_8px_rgba(255,255,255,0.8)] blur-[0.5px]"
                  />
                )}
              </AnimatePresence>
            </button>
          );
        })}

        <div className="w-[1px] h-6 bg-white/10 mx-1" />

        {/* Smart Toggle: Show/Hide All */}
        <button
          onClick={widgets.some(w => w.active) ? hideAllWidgets : showAllWidgets}
          className="relative group p-2 transition-all"
        >
          <motion.div
            whileHover={{ y: -4, scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            className="p-3 rounded-xl border border-white/5 bg-white/5 hover:bg-white/10 hover:border-white/10 transition-all duration-300 flex items-center justify-center relative overflow-hidden"
          >
            {widgets.some(w => w.active) ? (
              <EyeOff className="w-5 h-5 text-white/40 group-hover:text-white transition-colors duration-300" />
            ) : (
              <Eye className="w-5 h-5 text-white/40 group-hover:text-white transition-colors duration-300" />
            ) }
            <div className="absolute -top-10 left-1/2 -translate-x-1/2 px-2 py-1 rounded-lg bg-black/80 backdrop-blur-md border border-white/10 text-[10px] font-bold text-white opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
              {widgets.some(w => w.active) ? "Tout masquer" : "Tout afficher"}
            </div>
          </motion.div>
        </button>
      </motion.div>
    </div>
  );
}
