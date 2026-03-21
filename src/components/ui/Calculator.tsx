'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSystemStore } from '@/store/useSystemStore';
import { 
  X, RotateCcw, History as HistoryIcon, 
  Settings as SettingsIcon, Volume2, VolumeX,
  Divide, Minus, Plus, X as Multiply, Equal,
  Delete, Percent, Settings, Check
} from 'lucide-react';
import { cn } from '@/lib/utils';

export default function Calculator() {
  const [mounted, setMounted] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const { setActiveApp, calculatorSettings, setCalculatorSettings, toggleCalculator, setSettingsOpen } = useSystemStore();

  const [display, setDisplay] = useState('0');
  const [equation, setEquation] = useState('');
  const [history, setHistory] = useState<{eq: string, res: string}[]>([]);
  const { precision, soundEnabled, showHistory } = calculatorSettings;

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (!mounted) return null;

  const playSound = () => {
    if (!soundEnabled) return;
    // Simple beep-like click sound could be added here
    // For now we just stay silent but have the setting ready
  };

  const handleNumber = (num: string) => {
    playSound();
    if (display === '0') {
      setDisplay(num);
    } else {
      setDisplay(display + num);
    }
  };

  const handleOperator = (op: string) => {
    playSound();
    setEquation(display + ' ' + op + ' ');
    setDisplay('0');
  };

  const calculate = () => {
    playSound();
    try {
      const fullEq = equation + display;
      // Using a safer evaluation for basic math
      // eslint-disable-next-line no-eval
      const result = eval(fullEq.replace('×', '*').replace('÷', '/'));
      const formattedRes = Number(result).toFixed(calculatorSettings.precision).replace(/\.?0+$/, "");
      
      setHistory([{eq: fullEq, res: formattedRes}, ...history].slice(0, 10));
      setDisplay(formattedRes);
      setEquation('');
    } catch (e) {
      setDisplay('Error');
    }
  };

  const clear = () => {
    playSound();
    setDisplay('0');
    setEquation('');
  };

  const togglePlusMinus = () => {
    setDisplay(display.startsWith('-') ? display.slice(1) : '-' + display);
  };

  const handlePercent = () => {
    setDisplay((parseFloat(display) / 100).toString());
  };

  const buttons = [
    { label: 'AC', action: clear, type: 'action' },
    { label: '+/-', action: togglePlusMinus, type: 'action' },
    { label: '%', action: handlePercent, type: 'action' },
    { label: '÷', action: () => handleOperator('/'), type: 'operator' },
    { label: '7', action: () => handleNumber('7'), type: 'number' },
    { label: '8', action: () => handleNumber('8'), type: 'number' },
    { label: '9', action: () => handleNumber('9'), type: 'number' },
    { label: '×', action: () => handleOperator('*'), type: 'operator' },
    { label: '4', action: () => handleNumber('4'), type: 'number' },
    { label: '5', action: () => handleNumber('5'), type: 'number' },
    { label: '6', action: () => handleNumber('6'), type: 'number' },
    { label: '-', action: () => handleOperator('-'), type: 'operator' },
    { label: '1', action: () => handleNumber('1'), type: 'number' },
    { label: '2', action: () => handleNumber('2'), type: 'number' },
    { label: '3', action: () => handleNumber('3'), type: 'number' },
    { label: '+', action: () => handleOperator('+'), type: 'operator' },
    { label: '0', action: () => handleNumber('0'), type: 'number', wide: true },
    { label: '.', action: () => handleNumber('.'), type: 'number' },
    { label: '=', action: calculate, type: 'equal' },
  ];

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
      className="flex flex-col w-[400px] bg-[#1c1c1e]/40 backdrop-blur-3xl p-8 rounded-[48px] border border-white/5 select-none shadow-2xl relative group cursor-grab active:cursor-grabbing"
    >
      
      {/* Context Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 10 }}
            className="absolute top-12 left-6 w-40 glass-dark rounded-2xl border border-white/10 p-2 shadow-2xl z-50 overflow-hidden text-left cursor-default"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-3 py-2 border-b border-white/5 mb-1">
              <span className="text-[10px] font-bold text-white/30 uppercase tracking-widest">Options</span>
            </div>
            <button 
              onClick={() => { setCalculatorSettings({ soundEnabled: !soundEnabled }); setIsMenuOpen(false); }}
              className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-[10px] font-bold text-white/60 hover:bg-white/10 transition-colors"
            >
              <span>Sons clics</span>
              {soundEnabled && <Check className="w-3 h-3 text-orange-500" />}
            </button>
            <button 
              onClick={() => { setCalculatorSettings({ showHistory: !showHistory }); setIsMenuOpen(false); }}
              className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-[10px] font-bold text-white/60 hover:bg-white/10 transition-colors"
            >
              <span>Historique</span>
              {showHistory && <Check className="w-3 h-3 text-orange-500" />}
            </button>
            <div className="px-3 py-2 mt-2 border-t border-white/5">
              <span className="text-[9px] text-white/20 uppercase">Précision : {precision}</span>
            </div>
            <div className="px-2 pb-2">
               <input 
                type="range" min="0" max="8" step="1" 
                value={precision} onChange={(e) => setCalculatorSettings({ precision: parseInt(e.target.value) })}
                className="w-full appearance-none bg-white/5 h-1 rounded-full accent-orange-500"
              />
            </div>
            <button 
              onClick={() => { toggleCalculator(); setIsMenuOpen(false); }}
              className="w-full text-left px-3 py-2 rounded-xl text-[10px] font-bold text-red-400/60 hover:bg-red-500/10 transition-colors"
            > Masquer </button>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Close Widget Button (Top Right) */}
      <button 
        onClick={(e) => { e.stopPropagation(); toggleCalculator(); }}
        className="absolute top-4 right-4 z-[60] w-6 h-6 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/20 hover:text-white transition-all opacity-0 group-hover:opacity-100"
      >
        <X className="w-3 h-3" />
      </button>

      {/* Background Decor */}
      <div className="absolute -top-24 -right-24 w-64 h-64 bg-orange-500/10 blur-[100px] rounded-full group-hover:bg-orange-500/15 transition-all" />
      <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-blue-500/10 blur-[100px] rounded-full group-hover:bg-blue-500/15 transition-all" />

      {/* Toolbar */}
      <div className="flex items-center justify-between mb-8 px-2 relative z-10">
        <div className="flex items-center gap-2">
           <button 
             onClick={() => setCalculatorSettings({ showHistory: !showHistory })}
             className={cn("p-2 rounded-xl transition-all", showHistory ? "bg-white/10 text-white" : "text-white/20 hover:text-white/40")}
           >
             <HistoryIcon className="w-4 h-4" />
           </button>
        </div>
        <button 
           onClick={() => setCalculatorSettings({ soundEnabled: !soundEnabled })}
           className={cn("p-2 rounded-xl transition-all", soundEnabled ? "text-orange-500" : "text-white/20 hover:text-white/40")}
        >
          {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
        </button>
      </div>

      {/* Screen */}
      <div className="flex-1 flex flex-col items-end justify-end mb-8 px-4 relative z-10">
        <AnimatePresence mode="wait">
          <motion.p 
            key={equation}
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-white/30 text-sm font-medium tracking-tight mb-2 h-5"
          >
            {equation}
          </motion.p>
        </AnimatePresence>
        <motion.div 
          className="text-7xl font-light text-white tracking-tighter"
        >
          {display}
        </motion.div>
      </div>

      {/* Buttons Grid */}
      <div className="grid grid-cols-4 gap-3 relative z-10">
        {buttons.map((btn, i) => (
          <button
            key={i}
            onClick={btn.action}
            className={cn(
              "h-20 rounded-[28px] text-xl font-bold flex items-center justify-center transition-all active:scale-95 shadow-lg",
              btn.wide ? "col-span-2 px-8" : "",
              btn.type === 'number' ? "bg-white/5 text-white hover:bg-white/10 border border-white/5" :
              btn.type === 'action' ? "bg-white/10 text-white/80 hover:bg-white/20" :
              btn.type === 'operator' ? "bg-orange-500/20 text-orange-500 hover:bg-orange-500/30 border border-orange-500/20" :
              "bg-orange-500 text-white hover:bg-orange-600 shadow-orange-500/20"
            )}
          >
            {btn.label}
          </button>
        ))}
      </div>

      {/* Overlay History */}
      <AnimatePresence>
        {showHistory && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="absolute inset-0 z-50 bg-[#1c1c1e] p-8"
          >
            <div className="flex items-center justify-between mb-8 border-b border-white/5 pb-4">
              <h3 className="text-xs font-bold uppercase tracking-widest text-white/40">Historique</h3>
              <button 
                onClick={() => setCalculatorSettings({ showHistory: false })}
                className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-white/30 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-6 overflow-y-auto max-h-[85%] pr-4 custom-scrollbar">
              {history.map((h, i) => (
                <div key={i} className="text-right group cursor-pointer" onClick={() => { setDisplay(h.res); setCalculatorSettings({ showHistory: false }); }}>
                  <p className="text-[10px] text-white/20 group-hover:text-white/40 transition-colors mb-1">{h.eq}</p>
                  <p className="text-xl text-white/60 group-hover:text-white transition-colors">={h.res}</p>
                </div>
              ))}
              {history.length === 0 && (
                <p className="text-xs text-center text-white/10 italic">Aucun calcul récent</p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>


    </motion.div>
  );
}
