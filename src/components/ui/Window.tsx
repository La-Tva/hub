'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Maximize2, Minimize2, ExternalLink, RefreshCw, ChevronLeft, ChevronRight, RotateCcw } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/useIsMobile';
import { useSystemStore, AppConfig } from '@/store/useSystemStore';

interface WindowProps {
  app: AppConfig;
  onClose: () => void;
  children?: React.ReactNode;
}

export default function Window({ app, onClose, children }: WindowProps) {
  const isMobile = useIsMobile();
  const [isMaximized, setIsMaximized] = useState(false);
  const [isIframeLoaded, setIsIframeLoaded] = useState(false);
  const [iframeKey, setIframeKey] = useState(0);

  const toggleMaximize = () => setIsMaximized(!isMaximized);
  const refreshIframe = () => {
    setIsIframeLoaded(false);
    setIframeKey(prev => prev + 1);
  };

  return (
    <motion.div
      initial={isMobile ? { x: '100%' } : { opacity: 0, scale: 0.9, y: 20 }}
      animate={isMaximized 
        ? { opacity: 1, scale: 1, x: 0, y: 0, width: '100%', height: '100%', padding: 0 } 
        : { opacity: 1, scale: 1, x: 0, y: 0, width: isMobile ? '100%' : '90%', height: isMobile ? '100%' : '80%', padding: isMobile ? 0 : 48 }
      }
      exit={isMobile ? { x: '100%' } : { opacity: 0, scale: 0.9, y: 20 }}
      transition={{ type: "spring", damping: 25, stiffness: 200 }}
      className={cn(
        "fixed inset-0 z-[90] flex items-center justify-center pointer-events-none",
      )}
    >
      <div className={cn(
        "glass-dark relative overflow-hidden pointer-events-auto border border-white/10 shadow-2xl flex flex-col transition-all duration-300",
        isMaximized ? "w-full h-full rounded-none" : "w-full h-full rounded-[32px]"
      )}>
        {/* Bandeau (Header) */}
        <div className={cn(
          "h-14 flex items-center justify-between px-6 border-b border-white/5 bg-white/[0.03] select-none",
          isMobile ? "pt-12 h-24" : ""
        )}>
          {/* Traffic Lights */}
          <div className="flex items-center gap-2">
            <button 
              onClick={onClose}
              className="w-3.5 h-3.5 rounded-full bg-[#FF5F56] hover:bg-[#FF5F56]/80 flex items-center justify-center group transition-colors shadow-sm"
            >
              <X className="w-2.5 h-2.5 text-black/60 opacity-0 group-hover:opacity-100" />
            </button>
            <button className="w-3.5 h-3.5 rounded-full bg-[#FFBD2E] flex items-center justify-center group transition-colors shadow-sm cursor-not-allowed">
              <div className="w-2 h-[1px] bg-black/40 opacity-0 group-hover:opacity-100" />
            </button>
            <button 
              onClick={toggleMaximize}
              className="w-3.5 h-3.5 rounded-full bg-[#27C93F] hover:bg-[#27C93F]/80 flex items-center justify-center group transition-colors shadow-sm"
            >
              <Maximize2 className="w-2.5 h-2.5 text-black/40 opacity-0 group-hover:opacity-100" />
            </button>
            
            {/* Title & Icon */}
            <div className="ml-4 flex items-center gap-3">
              <div className="w-6 h-6 rounded-lg bg-white/5 flex items-center justify-center p-1">
                <img src={app.icon} className="w-full h-full object-contain" alt="" />
              </div>
              <span className="text-[11px] font-bold uppercase tracking-widest text-white/40">{app.name}</span>
            </div>
          </div>

          {/* Navigation/Browser Controls (if iframe) */}
          {app.url && !children && !isMobile && (
             <div className="flex items-center gap-1 bg-white/5 p-1 rounded-xl border border-white/5">
                <button className="p-1.5 rounded-lg hover:bg-white/5 text-white/20 hover:text-white transition-all disabled:opacity-20" disabled>
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button className="p-1.5 rounded-lg hover:bg-white/5 text-white/20 hover:text-white transition-all disabled:opacity-20" disabled>
                  <ChevronRight className="w-4 h-4" />
                </button>
                <button 
                  onClick={refreshIframe}
                  className="p-1.5 rounded-lg hover:bg-white/5 text-white/20 hover:text-white transition-all"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
             </div>
          )}

          {/* Right Controls */}
          <div className="flex items-center gap-3">
            {!isMobile && app.url && !app.isInternal && (
              <button 
                onClick={() => window.open(app.url, '_blank')}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-500 hover:bg-blue-600 text-white shadow-lg shadow-blue-500/20 transition-all group"
              >
                <span className="text-[10px] font-black uppercase tracking-widest">Plein Écran</span>
                <ExternalLink className="w-3 h-3 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </button>
            )}
            {isMobile && (
              <button onClick={onClose} className="p-2 text-white/40"><X className="w-6 h-6" /></button>
            )}
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 w-full h-full relative overflow-hidden bg-black/40">
          {children ? (
            <div className="w-full h-full overflow-auto custom-scrollbar">
              {children}
            </div>
          ) : app.url ? (
            <div className="w-full h-full relative">
              <AnimatePresence>
                {!isIframeLoaded && (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-6 bg-[#0a0a0a]"
                  >
                    <div className="relative">
                      <div className="w-20 h-20 border-4 border-white/5 border-t-blue-500 rounded-full animate-spin" />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <img src={app.icon} className="w-8 h-8 object-contain animate-pulse" alt="" />
                      </div>
                    </div>
                    <div className="text-center">
                      <h4 className="text-white font-bold text-sm mb-1">Chargement de {app.name}</h4>
                      <p className="text-[10px] text-white/20 uppercase tracking-[0.2em]">Synchronisation en cours...</p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
              <iframe
                key={iframeKey}
                src={app.url}
                className={cn(
                  "w-full h-full border-none transition-all duration-1000",
                  isIframeLoaded ? "opacity-100 scale-100" : "opacity-0 scale-[0.98]"
                )}
                onLoad={() => setIsIframeLoaded(true)}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
              />
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full gap-4">
              <div className="w-16 h-16 rounded-3xl bg-white/5 flex items-center justify-center">
                <img src={app.icon} className="w-8 h-8 opacity-20" alt="" />
              </div>
              <p className="text-white/20 text-xs font-medium tracking-widest uppercase">Contenu indisponible</p>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
