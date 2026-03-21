'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSystemStore } from '@/store/useSystemStore';
import { Music4, X } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function SpotifyWidget() {
  const [mounted, setMounted] = React.useState(false);
  const { 
    isSpotifyActive, setSpotifyActive, 
    spotifyPlaylistId, 
    isFocusOverlayOpen 
  } = useSystemStore();

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || !isSpotifyActive) return null;

  const renderContent = () => (
    <motion.div 
      layout
      className={cn(
        "relative w-[380px] h-[160px] rounded-[32px] overflow-hidden group shadow-[0_32px_64px_-16px_rgba(0,0,0,0.5)] transition-all",
        isFocusOverlayOpen ? "bg-transparent border-none shadow-none w-[420px] h-[520px]" : "border border-white/10 bg-black/40 backdrop-blur-2xl"
      )}
    >
      {/* Header - Only on Desktop */}
      {!isFocusOverlayOpen && (
        <div className="absolute top-4 right-4 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
          <button 
            onClick={() => setSpotifyActive(false)}
            className="w-6 h-6 rounded-full bg-white/5 flex items-center justify-center text-white/30 hover:bg-white/10 hover:text-white transition-all"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      <iframe 
        src={`https://open.spotify.com/embed/playlist/${spotifyPlaylistId}?utm_source=generator&theme=0`} 
        width="100%" 
        height="100%" 
        frameBorder="0" 
        allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" 
        loading="lazy"
        className={cn(
          "transition-opacity duration-700",
          isFocusOverlayOpen ? "opacity-100" : "opacity-80 group-hover:opacity-100"
        )}
      />
    </motion.div>
  );

  if (isFocusOverlayOpen) {
    return (
      <div className="fixed inset-0 z-[400] flex items-center justify-center p-12 pointer-events-none">
        <div className="w-full max-w-7xl grid grid-cols-12 gap-16 h-full items-center">
          <div className="col-start-10 col-span-3 space-y-8 flex flex-col items-center pointer-events-none">
             {/* Ghost Header for perfect vertical spacing match */}
             <div className="flex items-center gap-3 w-[420px] opacity-0 invisible">
               <Music4 className="w-5 h-5 text-purple-400" />
               <h3 className="text-sm font-bold uppercase tracking-[0.2em] text-white/20">Spotify Focus</h3>
             </div>
             
             <div className="pointer-events-auto">
               {renderContent()}
             </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      layout
      transition={{ type: 'spring', stiffness: 200, damping: 25 }}
      style={{ zIndex: 30 }}
      className="fixed bottom-32 right-12 pointer-events-auto"
    >
      {renderContent()}
    </motion.div>
  );
}
