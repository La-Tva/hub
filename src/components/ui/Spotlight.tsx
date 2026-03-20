"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, Command, CornerDownLeft, Calculator } from 'lucide-react';
import { useSystemStore, AppConfig } from '@/store/useSystemStore';
import Image from 'next/image';
import { cn } from '@/lib/utils';

type SpotlightResult = 
  | { type: 'app'; data: AppConfig }
  | { type: 'calculator'; result: string; expression: string }
  | { type: 'google'; query: string };

export default function Spotlight() {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const { apps, setActiveApp } = useSystemStore();
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Math detection
  const isMath = /^[0-9+\-*/().\s^%]+$/.test(search) && /[0-9]/.test(search) && /[+\-*/^%]/.test(search);
  let mathResult: string | null = null;
  if (isMath) {
    try {
      // Basic math evaluation (safe-ish for simple expressions)
      // replace ^ with ** for power
      const sanitized = search.replace(/\^/g, '**');
      const result = Function(`"use strict"; return (${sanitized})`)();
      if (typeof result === 'number' && !isNaN(result)) {
        mathResult = result.toString();
      }
    } catch (e) {
      mathResult = null;
    }
  }

  const filteredApps = apps.filter(app => 
    app.name.toLowerCase().includes(search.toLowerCase()) ||
    (app.isInternal && app.id.toLowerCase().includes(search.toLowerCase()))
  );

  const results: SpotlightResult[] = [];

  // Add Math result if available
  if (mathResult !== null) {
    results.push({ type: 'calculator', result: mathResult, expression: search });
  }

  // Add App results
  const appsToDisplay = search === '' ? apps.slice(0, 5) : filteredApps;
  appsToDisplay.forEach(app => results.push({ type: 'app', data: app }));

  // Add Google result if there is search
  if (search.trim() !== '' && !isMath) {
    results.push({ type: 'google', query: search });
  }

  const handleOpen = useCallback(() => {
    setIsOpen(true);
    setSearch('');
    setSelectedIndex(0);
    setTimeout(() => inputRef.current?.focus(), 100);
  }, []);

  const handleClose = useCallback(() => {
    setIsOpen(false);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        isOpen ? handleClose() : handleOpen();
      }
      if (e.key === 'Escape' && isOpen) {
        handleClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, handleOpen, handleClose]);

  const handleLaunch = (result: SpotlightResult) => {
    if (result.type === 'app') {
      if (result.data.isInternal) {
        setActiveApp(result.data.id);
      } else {
        window.open(result.data.url, '_blank');
      }
    } else if (result.type === 'calculator') {
      navigator.clipboard.writeText(result.result);
      // Maybe show a toast or something, but for now just close
    } else if (result.type === 'google') {
      window.open(`https://www.google.com/search?q=${encodeURIComponent(result.query)}`, '_blank');
    }
    handleClose();
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => (prev + 1) % results.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => (prev - 1 + results.length) % results.length);
    } else if (e.key === 'Enter' && results.length > 0) {
      handleLaunch(results[selectedIndex]);
    }
  };

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        handleClose();
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, handleClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[9998]"
          />
          <div className="fixed inset-0 z-[9999] flex items-start justify-center pt-[20vh] pointer-events-none">
            <motion.div
              ref={containerRef}
              initial={{ opacity: 0, scale: 0.95, y: -20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -20 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="w-full max-w-[600px] bg-white/10 backdrop-blur-[50px] border border-white/20 rounded-2xl shadow-[0_20px_70px_-10px_rgba(0,0,0,0.7)] overflow-hidden pointer-events-auto"
            >
              <div className="relative flex items-center px-4 py-4 border-b border-white/10">
                <Search className="w-6 h-6 text-white/50 mr-3" />
                <input
                  ref={inputRef}
                  type="text"
                  placeholder="Application, calcul ou recherche..."
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setSelectedIndex(0);
                  }}
                  onKeyDown={onKeyDown}
                  className="flex-1 bg-transparent border-none outline-none text-xl text-white placeholder:text-white/30"
                />
                <div className="flex items-center gap-2">
                  <span className="px-1.5 py-0.5 rounded border border-white/20 bg-white/5 text-[10px] text-white/50">ESC</span>
                </div>
              </div>

              <div className="max-h-[400px] overflow-y-auto p-2 custom-scrollbar">
                {results.length > 0 ? (
                  <div className="space-y-1">
                    <p className="px-3 py-2 text-[10px] font-bold text-white/30 uppercase tracking-widest">
                      {search === '' ? 'Suggestions' : 'Résultats'}
                    </p>
                    {results.map((result, index) => (
                      <button
                        key={index}
                        onClick={() => handleLaunch(result)}
                        onMouseEnter={() => setSelectedIndex(index)}
                        className={cn(
                          "w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 group text-left",
                          index === selectedIndex 
                            ? "bg-white/20 shadow-lg" 
                            : "hover:bg-white/5"
                        )}
                      >
                        {result.type === 'app' ? (
                          <>
                            <div className="w-10 h-10 rounded-lg bg-[#121212] flex items-center justify-center overflow-hidden border border-white/10 relative">
                              <Image 
                                src={result.data.icon} 
                                alt={result.data.name} 
                                fill 
                                className="object-contain p-1" 
                                unoptimized 
                              />
                            </div>
                            <div className="flex-1">
                              <p className="text-white font-medium text-sm">{result.data.name}</p>
                              <p className="text-white/40 text-xs">{result.data.isInternal ? 'Application Système' : 'Web App'}</p>
                            </div>
                          </>
                        ) : result.type === 'calculator' ? (
                          <>
                            <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center overflow-hidden border border-blue-500/30">
                              <Calculator className="w-6 h-6 text-blue-400" />
                            </div>
                            <div className="flex-1">
                              <p className="text-white font-medium text-lg">{result.result}</p>
                              <p className="text-white/40 text-xs">Calculer</p>
                            </div>
                          </>
                        ) : (
                          <>
                            <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center overflow-hidden border border-white/10">
                              <Search className="w-5 h-5 text-white/50" />
                            </div>
                            <div className="flex-1">
                              <p className="text-white font-medium text-sm">Rechercher "{result.query}"</p>
                              <p className="text-white/40 text-xs">Google Search</p>
                            </div>
                          </>
                        )}
                        {index === selectedIndex && (
                          <div className="flex items-center gap-1 text-white/40">
                             <CornerDownLeft className="w-3 h-3" />
                             <span className="text-[10px]">Entrée</span>
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="py-12 text-center">
                    <p className="text-white/40">Aucun résultat pour "{search}"</p>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
