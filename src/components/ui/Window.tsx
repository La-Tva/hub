'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { X, Maximize2, Minimize2, ExternalLink, RefreshCw } from 'lucide-react';
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
  const [isIframeLoaded, setIsIframeLoaded] = React.useState(false);

  return (
    <motion.div
      initial={isMobile ? { x: '100%' } : { opacity: 0, scale: 0.9, y: 20 }}
      animate={{ opacity: 1, scale: 1, x: 0, y: 0 }}
      exit={isMobile ? { x: '100%' } : { opacity: 0, scale: 0.9, y: 20 }}
      className={cn(
        "fixed inset-0 z-[90] flex items-center justify-center pointer-events-none",
        isMobile ? "p-0" : "p-12"
      )}
    >
      <div className={cn(
        "glass-dark relative overflow-hidden pointer-events-auto border border-white/10 shadow-2xl flex flex-col",
        isMobile ? "w-full h-full rounded-none pt-16" : "w-full max-w-5xl h-[700px] rounded-[32px]"
      )}>
        {/* Title Bar */}
        <div className={cn(
          "absolute z-50 flex items-center gap-2",
          isMobile ? "top-6 left-6" : "top-5 left-6"
        )}>
          <button 
            onClick={onClose}
            className={cn(
              "rounded-full bg-red-500 hover:bg-red-600 transition-all shadow-sm group flex items-center justify-center",
              isMobile ? "w-6 h-6" : "w-3 h-3 hover:w-8 hover:h-4 hover:rounded-lg"
            )}
          >
            <X className={cn("text-white opacity-0 group-hover:opacity-100 transition-opacity", isMobile ? "w-4 h-4 opacity-100" : "w-2.5 h-2.5")} />
          </button>
          {!isMobile && (
            <>
              <div className="w-3 h-3 rounded-full bg-yellow-500/50" />
              <div className="w-3 h-3 rounded-full bg-green-500/50" />
            </>
          )}
          <div className="ml-4 flex items-center gap-2 opacity-40">
            <img src={app.icon} className="w-4 h-4 object-contain" alt="" />
            <span className="text-[10px] font-bold uppercase tracking-widest">{app.name}</span>
          </div>
        </div>

        {/* Action Buttons (Right side) */}
        {!isMobile && (
          <div className="absolute top-4 right-6 z-50 flex items-center gap-3">
            {app.url && !app.isInternal && (
              <button 
                onClick={() => window.open(app.url, '_blank')}
                className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/30 hover:text-white transition-all"
                title="Ouvrir dans un nouvel onglet"
              >
                <ExternalLink className="w-4 h-4" />
              </button>
            )}
            <button className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/30 hover:text-white transition-all">
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Content */}
        <div className="flex-1 w-full h-full relative overflow-hidden bg-black/20">
          {children ? (
            children
          ) : app.url ? (
            <div className="w-full h-full relative">
              {!isIframeLoaded && (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
                  <div className="w-12 h-12 border-2 border-white/10 border-t-blue-500 rounded-full animate-spin" />
                  <p className="text-xs text-white/20 font-bold uppercase tracking-widest">Chargement de l'application...</p>
                </div>
              )}
              <iframe
                src={app.url}
                className={cn(
                  "w-full h-full border-none transition-opacity duration-500",
                  isIframeLoaded ? "opacity-100" : "opacity-0"
                )}
                onLoad={() => setIsIframeLoaded(true)}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
              />
            </div>
          ) : (
            <div className="flex items-center justify-center h-full">
              <p className="text-white/20">Aucun contenu disponible pour cette application.</p>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
