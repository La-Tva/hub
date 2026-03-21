'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Copy, Share2, RefreshCw, Check, Globe, Trash2, X } from 'lucide-react';
import { useSystemStore } from '@/store/useSystemStore';
import { cn } from '@/lib/utils';

export default function ClipboardWidget() {
  const { clipboardContent, setClipboardContent, toggleClipboard, fetchData } = useSystemStore();
  const [isSyncing, setIsSyncing] = useState(false);
  const [copyStatus, setCopyStatus] = useState<'idle' | 'copied'>('idle');
  const [localInput, setLocalInput] = useState(clipboardContent);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setLocalInput(clipboardContent);
  }, [clipboardContent]);

  // Auto-refresh when window gains focus or every 30s
  useEffect(() => {
    const handleFocus = () => fetchData();
    window.addEventListener('focus', handleFocus);
    const interval = setInterval(fetchData, 30000);
    return () => {
      window.removeEventListener('focus', handleFocus);
      clearInterval(interval);
    };
  }, [fetchData]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handlePushToCloud = async () => {
    setIsSyncing(true);
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        await setClipboardContent(text);
        setLocalInput(text);
      }
    } catch (err) {
      console.error('Failed to read clipboard:', err);
    } finally {
      setTimeout(() => setIsSyncing(false), 500);
    }
  };

  const handlePullFromCloud = async () => {
    setIsSyncing(true);
    try {
      await navigator.clipboard.writeText(clipboardContent);
      setCopyStatus('copied');
      setTimeout(() => setCopyStatus('idle'), 2000);
    } catch (err) {
      console.error('Failed to write clipboard:', err);
    } finally {
      setTimeout(() => setIsSyncing(false), 500);
    }
  };

  const handleManualSave = async () => {
    await setClipboardContent(localInput);
  };

  const handleClear = async () => {
    await setClipboardContent('');
    setLocalInput('');
  };

  return (
    <motion.div
      ref={containerRef}
      drag
      dragConstraints={{ left: -100, right: 100, top: -100, bottom: 100 }}
      whileHover={{ scale: 1.01 }}
      onContextMenu={(e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsMenuOpen(!isMenuOpen);
      }}
      className="p-3 pl-5 rounded-[24px] w-[640px] bg-white/5 backdrop-blur-3xl border border-white/5 cursor-grab active:cursor-grabbing group relative shadow-2xl overflow-hidden flex items-center gap-4 h-20"
    >
      {/* Context Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 10 }}
            className="absolute top-16 left-6 w-40 glass-dark rounded-2xl border border-white/10 p-2 shadow-2xl z-50 overflow-hidden text-left cursor-default"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-3 py-2 border-b border-white/5 mb-1">
              <span className="text-[10px] font-bold text-white/30 uppercase tracking-widest">Options</span>
            </div>
            <button 
              onClick={() => { handleClear(); setIsMenuOpen(false); }}
              className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-[10px] font-bold text-white/60 hover:bg-white/10 transition-colors text-red-400"
            >
              <span>Vider</span>
              <Trash2 className="w-3 h-3" />
            </button>
            <button 
              onClick={() => { toggleClipboard(); setIsMenuOpen(false); }}
              className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-[10px] font-bold text-white/60 hover:bg-white/10 transition-colors"
            >
              <span>Masquer</span>
              <X className="w-3 h-3" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Background Decor */}
      <div className="absolute -top-12 -right-12 w-32 h-32 bg-blue-500/5 blur-[60px] rounded-full pointer-events-none" />

      {/* Left: Icon & Info */}
      <div className="flex items-center gap-3 shrink-0">
        <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-400">
          <Globe className="w-5 h-5" />
        </div>
        <div className="hidden sm:block">
          <h3 className="text-[11px] font-black text-white leading-none">CLOUD</h3>
          <p className="text-[9px] text-white/20 uppercase tracking-widest mt-1">CLIP</p>
        </div>
      </div>

      {/* Middle: Textarea */}
      <div className="flex-1 relative h-12">
        <textarea
          value={localInput}
          onChange={(e) => setLocalInput(e.target.value)}
          onBlur={handleManualSave}
          placeholder="Presse-papier cloud..."
          className="w-full h-full bg-black/20 border border-white/5 rounded-xl px-4 py-2 text-[11px] text-white/70 placeholder:text-white/10 outline-none focus:border-blue-500/50 transition-all resize-none scrollbar-hide"
        />
        {localInput.length > 0 && (
          <div className="absolute right-2 bottom-1 text-[8px] text-white/10 font-mono">
            {localInput.length}
          </div>
        )}
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-2 shrink-0 pr-2">
        <button
          onClick={handlePushToCloud}
          disabled={isSyncing}
          title="Push to Cloud"
          className="p-3 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 text-white transition-all disabled:opacity-50"
        >
          <Share2 className={cn("w-4 h-4 text-blue-400", isSyncing && "animate-pulse")} />
        </button>
        <button
          onClick={handlePullFromCloud}
          disabled={isSyncing || !clipboardContent}
          title="Pull to Local"
          className="flex items-center gap-2 px-4 py-3 rounded-xl bg-blue-500 text-white shadow-lg shadow-blue-500/20 hover:bg-blue-600 transition-all disabled:opacity-50"
        >
          {copyStatus === 'copied' ? (
            <Check className="w-4 h-4" />
          ) : (
            <Copy className={cn("w-4 h-4", isSyncing && "animate-spin")} />
          )}
          <span className="text-[10px] font-black uppercase tracking-wider hidden md:block">Pull</span>
        </button>
      </div>

      <AnimatePresence>
        {isSyncing && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 rounded-[24px]"
          >
            <div className="flex items-center gap-3">
              <RefreshCw className="w-4 h-4 text-blue-400 animate-spin" />
              <span className="text-[9px] font-bold text-white/50 uppercase tracking-[0.2em]">Syncing</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
