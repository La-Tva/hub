'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSystemStore, AppConfig } from '@/store/useSystemStore';
import { X, Plus, Globe, Search } from 'lucide-react';
import { cn } from '@/lib/utils';

const SUGGESTED_APPS = [
  { name: 'ChatGPT', url: 'https://chat.openai.com', icon: 'https://upload.wikimedia.org/wikipedia/commons/0/04/ChatGPT_logo.svg' },
  { name: 'YouTube', url: 'https://www.youtube.com', icon: 'https://upload.wikimedia.org/wikipedia/commons/0/09/YouTube_full-color_icon_%282017%29.svg' },
  { name: 'GitHub', url: 'https://www.github.com', icon: 'https://upload.wikimedia.org/wikipedia/commons/9/91/Octicons-mark-github.svg' },
  { name: 'Twitch', url: 'https://www.twitch.tv', icon: 'https://upload.wikimedia.org/wikipedia/commons/d/d3/Twitch_Glitch_Logo_Purple.svg' },
  { name: 'Netflix', url: 'https://www.netflix.com', icon: 'https://upload.wikimedia.org/wikipedia/commons/0/08/Netflix_2015_logo.svg' },
  { name: 'Twitter', url: 'https://www.twitter.com', icon: 'https://upload.wikimedia.org/wikipedia/commons/c/ce/X_logo_2023.svg' },
  { name: 'LinkedIn', url: 'https://www.linkedin.com', icon: 'https://upload.wikimedia.org/wikipedia/commons/8/81/LinkedIn_icon.svg' },
];

export default function AppPicker() {
  const { 
    apps, 
    addApp, 
    isAppPickerOpen, 
    setAppPickerOpen, 
    setSettingsOpen 
  } = useSystemStore();

  if (!isAppPickerOpen) return null;

  const handleAdd = async (suggestion: { name: string, url: string, icon: string }) => {
    // Check if app already exists
    if (apps.some(a => a.url === suggestion.url)) {
      setAppPickerOpen(false);
      return;
    }

    const newApp: Omit<AppConfig, 'id'> = {
      name: suggestion.name,
      url: suggestion.url,
      icon: suggestion.icon,
      isInternal: false
    };

    await addApp(newApp);
    setAppPickerOpen(false);
  };

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
            <div className="p-2 rounded-xl bg-green-500/10 text-green-400">
              <Plus className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-white tracking-tight uppercase text-[10px] tracking-widest">Ajouter une application</h3>
          </div>
          <button 
            onClick={() => setAppPickerOpen(false)}
            className="p-2 rounded-full hover:bg-white/5 text-white/30 hover:text-white transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex gap-4 overflow-x-auto pb-4 custom-scrollbar snap-x">
          {/* Custom App Option */}
          <button 
            onClick={() => {
              setAppPickerOpen(false);
              setSettingsOpen(true, 'apps');
            }}
            className="flex-shrink-0 w-40 h-40 rounded-3xl border-2 border-dashed border-white/10 hover:border-white/30 flex flex-col items-center justify-center gap-3 text-white/20 hover:text-white/40 transition-all group snap-start bg-white/[0.02]"
          >
            <div className="p-4 rounded-2xl bg-white/5 group-hover:scale-110 transition-transform">
              <Globe className="w-8 h-8" />
            </div>
            <span className="text-[10px] font-bold uppercase tracking-widest">Personnalisé</span>
          </button>

          {/* Suggested Apps */}
          {SUGGESTED_APPS.map((suggestion, index) => {
            const isInstalled = apps.some(a => a.url === suggestion.url);
            return (
              <button
                key={index}
                disabled={isInstalled}
                onClick={() => handleAdd(suggestion)}
                className={cn(
                  "flex-shrink-0 w-40 h-40 rounded-3xl p-6 flex flex-col items-center justify-between transition-all snap-start relative group",
                  isInstalled ? "opacity-40 cursor-not-allowed bg-black/20" : "bg-white/5 hover:bg-white/10 hover:scale-105 active:scale-95"
                )}
              >
                <div className="w-16 h-16 relative">
                  <img src={suggestion.icon} className="w-full h-full object-contain filter drop-shadow-xl" alt={suggestion.name} />
                </div>
                <div className="flex flex-col items-center gap-1">
                  <span className="text-[11px] font-bold text-white/90">{suggestion.name}</span>
                  <span className="text-[9px] text-white/30 uppercase tracking-tighter">
                    {isInstalled ? 'Installé' : 'Ajouter'}
                  </span>
                </div>
                
                {!isInstalled && (
                  <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="bg-green-500 rounded-full p-1 shadow-lg">
                      <Plus className="w-3 h-3 text-white" />
                    </div>
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
}
