import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSystemStore } from '@/store/useSystemStore';
import { cn } from '@/lib/utils';
// Settings removed

export default function FocusTimer() {
  const { 
    pomodoroSettings,
    pomodoroMode, setPomodoroMode,
    pomodoroTimeLeft, setPomodoroTimeLeft,
    pomodoroIsRunning, setPomodoroIsRunning,
    setFocusOverlayOpen,
    setSettingsOpen,
    toggleTimer
  } = useSystemStore();

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<NodeJS.Timeout|null>(null);

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

  // Timer ticking logic
  useEffect(() => {
    if (pomodoroIsRunning && pomodoroTimeLeft > 0) {
      timerRef.current = setInterval(() => {
        setPomodoroTimeLeft(pomodoroTimeLeft - 1);
      }, 1000);
    } else if (pomodoroTimeLeft === 0 && pomodoroIsRunning) {
      setPomodoroIsRunning(false);
      handleCycleComplete();
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [pomodoroIsRunning, pomodoroTimeLeft]);

  const handleCycleComplete = () => {
    try {
      const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3');
      audio.volume = 0.5;
      audio.play();
    } catch (e) {
      console.warn('Audio playback failed', e);
    }
    
    if (pomodoroMode === 'work') {
      setPomodoroMode('shortBreak');
    } else {
      setPomodoroMode('work');
    }
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const totalTime = pomodoroMode === 'work' 
    ? pomodoroSettings.work * 60 
    : pomodoroMode === 'shortBreak' 
      ? pomodoroSettings.shortBreak * 60 
      : pomodoroSettings.longBreak * 60;

  const progress = (pomodoroTimeLeft / totalTime) * 100;

  return (
    <motion.div
      ref={containerRef}
      layoutId="pomodoro-container"
      drag
      dragConstraints={{ left: -500, right: 500, top: -500, bottom: 500 }}
      onClick={() => setFocusOverlayOpen(true)}
      onContextMenu={(e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsMenuOpen(!isMenuOpen);
      }}
      className="fixed top-32 right-12 z-40 p-3 rounded-2xl flex items-center gap-3 pointer-events-auto cursor-pointer group hover:scale-105 active:scale-95 transition-all"
    >
      <div className="flex items-center gap-2.5">
        <motion.div 
          animate={pomodoroIsRunning ? { scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] } : { scale: 1, opacity: 0.5 }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          className={cn(
            "w-2 h-2 rounded-full",
            pomodoroMode === 'work' ? "bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]" : 
            pomodoroMode === 'shortBreak' ? "bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]" : 
            "bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]"
          )} 
        />
        <span className="text-sm font-medium text-white/90 tabular-nums tracking-tight">
          {formatTime(pomodoroTimeLeft)}
        </span>
      </div>

      <div className="relative">
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 10 }}
              onClick={(e) => e.stopPropagation()}
              className="absolute top-10 right-0 w-32 glass-dark rounded-2xl border border-white/10 p-2 shadow-2xl z-50 overflow-hidden"
            >
              <button 
                onClick={() => { setPomodoroMode(pomodoroMode === 'work' ? 'shortBreak' : 'work'); setIsMenuOpen(false); }}
                className="w-full text-left px-3 py-2 rounded-xl text-[10px] font-bold text-white/60 hover:bg-white/10 transition-colors"
              > Passer cycle </button>
              <button 
                onClick={() => { setPomodoroTimeLeft(totalTime); setPomodoroIsRunning(false); setIsMenuOpen(false); }}
                className="w-full text-left px-3 py-2 rounded-xl text-[10px] font-bold text-white/60 hover:bg-white/10 transition-colors"
                > Réinitialiser </button>
              <button 
                onClick={() => { toggleTimer(); setIsMenuOpen(false); }}
                className="w-full text-left px-3 py-2 rounded-xl text-[10px] font-bold text-white/60 hover:bg-white/10 transition-colors"
                > Masquer </button>
              <button 
                onClick={() => { setSettingsOpen(true); setIsMenuOpen(false); }}
                className="w-full text-left px-3 py-2 rounded-xl text-[10px] font-bold text-white/40 hover:bg-white/10 transition-colors"
              > Plus... </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Subtle background glow when running */}
      {pomodoroIsRunning && (
        <div className={cn(
          "absolute inset-0 rounded-2xl blur-xl -z-10 opacity-20 transition-colors duration-1000",
          pomodoroMode === 'work' ? "bg-red-500/20" : 
          pomodoroMode === 'shortBreak' ? "bg-green-500/20" : "bg-blue-500/20"
        )} />
      )}
    </motion.div>
  );
}
