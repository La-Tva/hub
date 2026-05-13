'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSystemStore, AppConfig } from '@/store/useSystemStore';
import { 
  Search, Plus, X, Clock, StickyNote, Sun, Timer, Calculator, Music, Clipboard, CloudUpload, Eye 
} from 'lucide-react';
import { cn } from '@/lib/utils';
import Image from 'next/image';

export default function MobileHome() {
  const { 
    apps, 
    isMobileHomeOpen, 
    setMobileHomeOpen, 
    setActiveApp, 
    setAppPickerOpen,
    theme,
    // Widgets Support
    showClock, toggleClock,
    showNotes, toggleNotes,
    showWeather, toggleWeather,
    showTimer, toggleTimer,
    showCalculator, toggleCalculator,
    showClipboard, toggleClipboard,
    isSpotifyActive, setSpotifyActive,
    showDropZone, toggleDropZone,
    launchApp
  } = useSystemStore();

  if (!isMobileHomeOpen) return null;

  const handleAppClick = (app: AppConfig) => {
    launchApp(app);
    setMobileHomeOpen(false);
  };

  const widgetToggles = [
    { id: 'clock', icon: Clock, active: showClock, toggle: toggleClock, label: 'Horloge' },
    { id: 'notes', icon: StickyNote, active: showNotes, toggle: toggleNotes, label: 'Notes' },
    { id: 'weather', icon: Sun, active: showWeather, toggle: toggleWeather, label: 'Météo' },
    { id: 'timer', icon: Timer, active: showTimer, toggle: toggleTimer, label: 'Timer' },
    { id: 'calc', icon: Calculator, active: showCalculator, toggle: toggleCalculator, label: 'Calcul' },
    { id: 'clip', icon: Clipboard, active: showClipboard, toggle: toggleClipboard, label: 'Copier' },
    { id: 'spotify', icon: Music, active: isSpotifyActive, toggle: () => setSpotifyActive(!isSpotifyActive), label: 'Spotify' },
    { id: 'share', icon: CloudUpload, active: showDropZone, toggle: toggleDropZone, label: 'Cloud' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className={cn(
        "fixed inset-0 z-[150] pt-20 px-6 pb-10 overflow-y-auto backdrop-blur-3xl transition-colors duration-500",
        theme === 'dark' ? "bg-black/90 text-white" : "bg-white/90 text-black"
      )}
    >
      <div className="max-w-md mx-auto w-full">
        {/* Search Bar */}
        <div className="relative mb-10">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 opacity-30" />
          <input 
            type="text" 
            placeholder="Rechercher..." 
            className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-6 text-sm outline-none focus:border-white/20 transition-all font-medium"
          />
        </div>

        {/* Widgets Section */}
        <div className="mb-12">
          <h3 className="text-[10px] font-bold text-white/30 uppercase tracking-[0.2em] mb-6 ml-1">Widgets Favoris</h3>
          <div className="flex gap-4 overflow-x-auto pb-4 custom-scrollbar snap-x">
             {widgetToggles.map((widget) => {
               const Icon = widget.icon;
               return (
                 <button
                   key={widget.id}
                   onClick={() => widget.toggle()}
                   className="flex-shrink-0 flex flex-col items-center gap-3 snap-start"
                 >
                   <div className={cn(
                     "w-14 h-14 rounded-full flex items-center justify-center transition-all duration-300 border",
                     widget.active 
                      ? "bg-white/20 border-white/30 shadow-[0_0_20px_rgba(255,255,255,0.1)]" 
                      : "bg-white/5 border-white/5"
                   )}>
                     <Icon className={cn("w-6 h-6", widget.active ? "text-white" : "opacity-30")} />
                   </div>
                   <span className="text-[9px] font-bold uppercase tracking-tight opacity-40">{widget.label}</span>
                 </button>
               );
             })}
          </div>
        </div>

        {/* Apps Grid Section */}
        <div>
          <h3 className="text-[10px] font-bold text-white/30 uppercase tracking-[0.2em] mb-6 ml-1">Applications</h3>
          <div className="grid grid-cols-4 gap-y-8 gap-x-4 mb-20">
            {apps.map((app) => (
              <button
                key={app.id}
                onClick={() => handleAppClick(app)}
                className="flex flex-col items-center gap-3 active:scale-90 transition-all group"
              >
                <div className="w-16 h-16 rounded-[22%] bg-white/5 relative overflow-hidden shadow-xl border border-white/5 p-0.5">
                   <div className="w-full h-full relative p-2">
                      <Image 
                        src={app.icon} 
                        alt={app.name} 
                        fill 
                        className="object-contain" 
                        unoptimized 
                      />
                   </div>
                </div>
                <span className="text-[10px] font-bold tracking-tight uppercase opacity-60 text-center truncate w-full">
                  {app.name}
                </span>
              </button>
            ))}
            
            <button
              onClick={() => setAppPickerOpen(true)}
              className="flex flex-col items-center gap-3 active:scale-90 transition-all"
            >
              <div className="w-16 h-16 rounded-[22%] bg-white/5 border-2 border-dashed border-white/10 flex items-center justify-center">
                <Plus className="w-6 h-6 opacity-30" />
              </div>
              <span className="text-[10px] font-bold tracking-tight uppercase opacity-40">Ajouter</span>
            </button>
          </div>
        </div>

        {/* Footer / Close Indicator */}
        <div className="fixed bottom-6 left-0 right-0 flex justify-center pointer-events-none">
          <button 
            onClick={() => setMobileHomeOpen(false)}
            className="w-20 h-1 rounded-full bg-white/20 pointer-events-auto active:bg-white/40 transition-colors"
          />
        </div>
      </div>
    </motion.div>
  );
}
