'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSystemStore } from '@/store/useSystemStore';
import { X, Check, Image as ImageIcon, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function WallpaperPicker() {
  const { 
    wallpaper, 
    setWallpaper, 
    wallpaperHistory, 
    isWallpaperPickerOpen, 
    setWallpaperPickerOpen, 
    setSettingsOpen 
  } = useSystemStore();

  if (!isWallpaperPickerOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 20, scale: 0.95 }}
      className="fixed inset-x-0 bottom-32 z-[150] flex justify-center px-6 pointer-events-none"
    >
      <div className="glass-dark w-full max-w-4xl rounded-[32px] p-6 shadow-3xl border border-white/10 pointer-events-auto relative overflow-hidden">
        {/* Background Glow */}
        <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent pointer-events-none" />
        
        <div className="relative flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400">
              <ImageIcon className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-white tracking-tight uppercase">Fonds d'écran récents</h3>
          </div>
          <button 
            onClick={() => setWallpaperPickerOpen(false)}
            className="p-2 rounded-full hover:bg-white/5 text-white/30 hover:text-white transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex gap-4 overflow-x-auto pb-4 custom-scrollbar snap-x">
          {/* Browse All Option */}
          <button 
            onClick={() => {
              setWallpaperPickerOpen(false);
              setSettingsOpen(true, 'wallpaper');
            }}
            className="flex-shrink-0 w-48 h-32 rounded-2xl border-2 border-dashed border-white/10 hover:border-white/30 flex flex-col items-center justify-center gap-3 text-white/20 hover:text-white/40 transition-all group snap-start"
          >
            <div className="p-3 rounded-full bg-white/5 group-hover:scale-110 transition-transform">
              <Plus className="w-6 h-6" />
            </div>
            <span className="text-[10px] font-bold uppercase tracking-widest">Voir tout</span>
          </button>

          {/* History Wallpapers */}
          {wallpaperHistory.map((wp, index) => (
            <button
              key={index}
              onClick={() => setWallpaper(wp)}
              className={cn(
                "flex-shrink-0 w-48 h-32 rounded-2xl overflow-hidden relative group transition-all snap-start",
                wallpaper === wp ? "ring-4 ring-blue-500/50 scale-105" : "hover:scale-105"
              )}
            >
              <img src={wp} className="w-full h-full object-cover" alt={`Recent ${index}`} />
              <div className={cn(
                "absolute inset-0 bg-black/40 flex items-center justify-center transition-opacity",
                wallpaper === wp ? "opacity-100" : "opacity-0 group-hover:opacity-100"
              )}>
                {wallpaper === wp && (
                  <div className="bg-blue-500 rounded-full p-1.5 shadow-lg">
                    <Check className="w-4 h-4 text-white" />
                  </div>
                )}
              </div>
            </button>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
