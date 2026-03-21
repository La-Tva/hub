import React, { useState, useEffect, useRef } from 'react';
import { StickyNote, Plus, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSystemStore } from '@/store/useSystemStore';
import { cn } from '@/lib/utils';

export default function NotesWidget() {
  const { notes, setNotes, setSettingsOpen, toggleNotes } = useSystemStore();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

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

  return (
    <motion.div 
      ref={containerRef}
      layoutId="notes-widget-container"
      drag
      dragConstraints={{ left: -500, right: 500, top: -500, bottom: 500 }}
      whileHover={{ scale: 1.01 }}
      onContextMenu={(e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsMenuOpen(!isMenuOpen);
      }}
      className="p-6 rounded-[32px] w-72 h-72 cursor-grab active:cursor-grabbing flex flex-col relative group"
    >
      <div className="flex items-center justify-between mb-4 relative z-10">
        <div className="flex items-center gap-2.5 text-white/60">
          <div className="p-1.5 rounded-lg bg-white/10 text-white/80">
            <StickyNote className="w-3.5 h-3.5" />
          </div>
          <span className="text-[10px] font-bold uppercase tracking-[0.2em]">Notes</span>
        </div>
        
        <div className="flex items-center gap-1 relative">
          <AnimatePresence>
            {isMenuOpen && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 10 }}
                className="absolute top-0 right-0 w-32 glass-dark rounded-2xl border border-white/10 p-2 shadow-2xl z-50 overflow-hidden"
              >
                <button 
                  onClick={() => { setNotes(''); setIsMenuOpen(false); }}
                  className="w-full text-left px-3 py-2 rounded-xl text-[10px] font-bold text-red-400 hover:bg-red-500/10 transition-colors"
                > Effacer tout </button>
                <button 
                  onClick={() => { navigator.clipboard.writeText(notes); setIsMenuOpen(false); }}
                  className="w-full text-left px-3 py-2 rounded-xl text-[10px] font-bold text-white/60 hover:bg-white/10 transition-colors"
                > Copier </button>
                <button 
                  onClick={() => { toggleNotes(); setIsMenuOpen(false); }}
                  className="w-full text-left px-3 py-2 rounded-xl text-[10px] font-bold text-white/60 hover:bg-white/10 transition-colors"
                > Masquer </button>
                <button 
                  onClick={() => { setSettingsOpen(true); setIsMenuOpen(false); }}
                  className="w-full text-left px-3 py-2 rounded-xl text-[10px] font-bold text-white/40 hover:bg-white/10 transition-colors"
                > Plus... </button>
              </motion.div>
            )}
          </AnimatePresence>

          <button 
            onClick={() => {
              const timestamp = new Date().toLocaleString('fr-FR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
              setNotes(notes ? `${notes}\n\n--- ${timestamp} ---\n` : `--- ${timestamp} ---\n`);
            }}
            className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center text-white/40 hover:text-white hover:bg-white/20 transition-all opacity-0 group-hover:opacity-100"
            title="Ajouter une section"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="flex-1 relative group/input">
        <textarea 
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className="w-full h-full bg-white/[0.04] hover:bg-white/[0.06] focus:bg-white/[0.08] border border-white/10 focus:border-white/30 rounded-2xl p-4 text-white font-normal text-sm leading-relaxed outline-none resize-none placeholder:text-white/20 custom-scrollbar transition-all"
          placeholder="Commencer à écrire ici..."
        />
        <div className="absolute inset-0 pointer-events-none rounded-2xl ring-1 ring-inset ring-white/10 group-hover/input:ring-white/20 group-focus-within/input:ring-white/40 transition-all shadow-[inset_0_0_20px_rgba(255,255,255,0.02)]" />
      </div>
      
      <div className="mt-3 flex items-center justify-between text-[8px] font-bold uppercase tracking-widest text-white/30 relative z-10 px-1">
        <span>{notes.length} caractères</span>
        <span className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 text-white/40">
          <Check className="w-2.5 h-2.5 text-green-500/50" />
          Cloud Synced
        </span>
      </div>
    </motion.div>
  );
}

