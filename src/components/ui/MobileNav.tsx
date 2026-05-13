'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { useSystemStore } from '@/store/useSystemStore';
import { LayoutGrid, Settings, Search, Menu } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function MobileNav() {
  const { 
    theme, 
    setSettingsOpen, 
    isMobileHomeOpen, 
    setMobileHomeOpen,
    activeApp,
    setActiveApp
  } = useSystemStore();

  const [currentTime, setCurrentTime] = React.useState(new Date());

  React.useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const timeString = currentTime.toLocaleTimeString('fr-FR', { 
    hour: '2-digit', 
    minute: '2-digit' 
  });

  return (
    <motion.nav 
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className={cn(
        "fixed top-0 inset-x-0 h-16 z-[100] px-6 flex items-center justify-between backdrop-blur-xl border-b transition-colors duration-500",
        theme === 'dark' 
          ? "bg-black/40 border-white/10 text-white" 
          : "bg-white/40 border-black/5 text-black"
      )}
    >
      <div className="flex items-center gap-4">
        <button 
          onClick={() => {
            setMobileHomeOpen(!isMobileHomeOpen);
            if (activeApp) setActiveApp(null);
          }}
          className={cn(
            "p-2 rounded-xl transition-all active:scale-90",
            isMobileHomeOpen ? "bg-white/10" : "hover:bg-white/5"
          )}
        >
          <LayoutGrid className="w-6 h-6" />
        </button>
        <span className="text-sm font-bold tracking-tight uppercase opacity-60">Hub</span>
      </div>

      <div className="absolute left-1/2 -translate-x-1/2 flex flex-col items-center">
        <span className="text-sm font-bold tabular-nums">{timeString}</span>
      </div>

      <div className="flex items-center gap-2">
        <button 
          onClick={() => setSettingsOpen(true)}
          className="p-2 rounded-xl hover:bg-white/5 active:scale-90 transition-all"
        >
          <Settings className="w-6 h-6 opacity-60" />
        </button>
      </div>
    </motion.nav>
  );
}
