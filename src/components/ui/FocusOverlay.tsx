'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useSystemStore } from '@/store/useSystemStore';
import { 
  Play, Pause, RotateCcw, 
  Minimize2, ListTodo,
  Music4, Timer
} from 'lucide-react';
import { cn } from '@/lib/utils';

export default function FocusOverlay() {
  const [mounted, setMounted] = React.useState(false);
  const { 
    isFocusOverlayOpen, setFocusOverlayOpen,
    pomodoroTimeLeft, setPomodoroTimeLeft,
    pomodoroMode, setPomodoroMode,
    pomodoroIsRunning, setPomodoroIsRunning,
    pomodoroSettings,
    notes,
    isSpotifyActive, setSpotifyActive,
    spotifyPlaylistId
  } = useSystemStore();

  React.useEffect(() => {
    setMounted(true);
  }, []);

  React.useEffect(() => {
    if (!mounted) return;
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setFocusOverlayOpen(false);
      if (e.key === ' ' && !e.repeat) setPomodoroIsRunning(!pomodoroIsRunning);
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [mounted, setFocusOverlayOpen, pomodoroIsRunning, setPomodoroIsRunning]);

  if (!mounted || !isFocusOverlayOpen) return null;

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const resetTimer = () => {
    setPomodoroTimeLeft(pomodoroSettings[pomodoroMode] * 60);
    setPomodoroIsRunning(false);
  };

  const progress = (pomodoroTimeLeft / (pomodoroSettings[pomodoroMode] * 60)) * 100;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[300] bg-black/40 backdrop-blur-[100px] flex flex-col items-center justify-center p-12 overflow-hidden"
    >
      {/* Background Animated Gradient */}
      <div className={cn(
        "absolute inset-0 -z-10 opacity-30 transition-colors duration-1000",
        pomodoroMode === 'work' ? "bg-red-900/50" : pomodoroMode === 'shortBreak' ? "bg-green-900/50" : "bg-blue-900/50"
      )} />
      
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-white/5 rounded-full blur-[120px] -z-10 animate-pulse" />

      {/* Header Controls */}
      <div className="absolute top-12 left-12 right-12 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center border border-white/10">
            <Timer className="w-6 h-6 text-white/60" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white tracking-tight">Focus Mode</h2>
            <p className="text-[10px] uppercase tracking-widest text-white/30 font-bold">Deep Work Session</p>
          </div>
        </div>

        <button 
          onClick={() => setFocusOverlayOpen(false)}
          className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center text-white/30 hover:bg-white/10 hover:text-white transition-all border border-white/5"
        >
          <Minimize2 className="w-5 h-5" />
        </button>
      </div>

      <div className="w-full max-w-7xl grid grid-cols-12 gap-16 items-center">
        {/* Left: Task List / Notes */}
        <div className="col-span-3 space-y-8 animate-in slide-in-from-left-8 duration-700">
           <div className="flex items-center gap-3">
             <ListTodo className="w-5 h-5 text-blue-400" />
             <h3 className="text-sm font-bold uppercase tracking-[0.2em] text-white/20">Objectifs</h3>
           </div>
           <div className="space-y-4 max-h-[500px] overflow-y-auto pr-4 custom-scrollbar">
              {notes.split('\n').filter(l => l.trim()).slice(0, 8).map((line, i) => (
                <motion.div 
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  key={i} 
                  className="p-4 rounded-2xl bg-white/[0.03] border border-white/5 flex items-start gap-3 group hover:bg-white/[0.06] transition-all"
                >
                  <div className="mt-1 w-4 h-4 rounded-full border border-white/20 group-hover:border-blue-500/50 transition-colors" />
                  <p className="text-sm text-white/60 group-hover:text-white/80 transition-colors line-clamp-2">{line}</p>
                </motion.div>
              ))}
              {notes.trim() === '' && (
                <p className="text-xs text-white/20 italic">Aucune note pour le moment...</p>
              )}
           </div>
        </div>

        {/* Center: Hero Timer */}
        <div className="col-span-6 flex flex-col items-center">
          <div className="relative flex items-center justify-center mb-16">
            {/* Massive Circular Progress */}
            <svg className="w-[500px] h-[500px] -rotate-90">
              <circle
                cx="250"
                cy="250"
                r="240"
                className="stroke-white/5 fill-none"
                strokeWidth="4"
              />
              <motion.circle
                cx="250"
                cy="250"
                r="240"
                className={cn("fill-none rounded-full", 
                  pomodoroMode === 'work' ? "stroke-red-500" : pomodoroMode === 'shortBreak' ? "stroke-green-500" : "stroke-blue-500"
                )}
                strokeWidth="4"
                strokeLinecap="round"
                strokeDasharray="1508"
                initial={{ strokeDashoffset: 1508 }}
                animate={{ strokeDashoffset: 1508 * (1 - progress / 100) }}
                transition={{ duration: 0.5, ease: "linear" }}
              />
            </svg>
            
            <div className="absolute flex flex-col items-center">
              <span className="text-[11rem] font-light text-white tabular-nums tracking-tighter leading-none">
                {formatTime(pomodoroTimeLeft)}
              </span>
              <motion.span 
                key={pomodoroMode}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={cn("text-sm font-bold uppercase tracking-[0.5em] mt-8", 
                  pomodoroMode === 'work' ? "text-red-500/60" : pomodoroMode === 'shortBreak' ? "text-green-500/60" : "text-blue-500/60"
                )}
              >
                {pomodoroMode === 'work' ? 'Concentration' : 'Temps de Pause'}
              </motion.span>
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-12">
            <button 
              onClick={resetTimer}
              className="p-4 rounded-full bg-white/5 text-white/20 hover:text-white hover:bg-white/10 transition-all"
            >
              <RotateCcw className="w-6 h-6" />
            </button>
            
            <button 
              onClick={() => setPomodoroIsRunning(!pomodoroIsRunning)}
              className={cn(
                "w-24 h-24 rounded-full flex items-center justify-center transition-all shadow-2xl",
                pomodoroIsRunning ? "bg-white/5 text-white ring-2 ring-white/10" : "bg-white text-black scale-110"
              )}
            >
              {pomodoroIsRunning ? <Pause className="w-10 h-10 fill-current" /> : <Play className="w-10 h-10 fill-current ml-1" />}
            </button>

            <div className="flex bg-white/5 rounded-full p-2 border border-white/10">
              {['work', 'shortBreak', 'longBreak'].map((m) => (
                <button
                  key={m}
                  onClick={() => setPomodoroMode(m as any)}
                  className={cn(
                    "px-6 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all",
                    pomodoroMode === m ? "bg-white text-black shadow-lg" : "text-white/20 hover:text-white/40"
                  )}
                >
                  {m === 'work' ? 'Work' : m === 'shortBreak' ? 'Short' : 'Long'}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Spotify Focus */}
        <div className="col-start-10 col-span-3 space-y-8 animate-in slide-in-from-right-8 duration-700 h-full flex flex-col items-center justify-center">
           
           {/* This container acts as the visual home for the floating SpotifyWidget */}
           <div className="w-[420px] h-[520px] relative">
             {!isSpotifyActive && (
               <div className="flex flex-col items-center p-8 text-center">
                 <div className="w-16 h-16 rounded-full bg-purple-500/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-all duration-500 shadow-[0_0_30px_rgba(168,85,247,0.1)]">
                    <Music4 className="w-8 h-8 text-purple-400" />
                 </div>
                 <h4 className="text-white/80 font-bold mb-2">Musique de Concentration</h4>
                 <p className="text-[10px] text-white/30 mb-8 max-w-[200px] leading-relaxed">Activez votre playlist Lofi pour une session de travail immersive.</p>
                 <button 
                   onClick={() => setSpotifyActive(true)}
                   className="px-10 py-3.5 rounded-full bg-white text-black text-[10px] font-black uppercase tracking-[0.2em] hover:bg-purple-400 hover:text-white transition-all shadow-2xl active:scale-95"
                 >
                   Lancer Spotify
                 </button>
               </div>
             )}
             
             {isSpotifyActive && (
               <div className="flex flex-col items-center opacity-0">
                 {/* Hidden but keeps layout consistent */}
                 <div className="w-2 h-2 rounded-full bg-green-500 mb-2" />
                 <p className="text-[10px] font-bold uppercase tracking-widest text-white/40">Lecteur Intégré</p>
               </div>
             )}
           </div>
        </div>
      </div>

      {/* Footer Info */}
      <div className="absolute bottom-12 text-center space-y-2 opacity-20 hover:opacity-100 transition-opacity">
        <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-white">Press Space to Toggle • Esc to Exit</p>
        <p className="text-[9px] text-white/40">Stay Focused, Stay Brilliant.</p>
      </div>
    </motion.div>
  );
}
