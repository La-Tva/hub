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
      className={cn(
        "relative w-[420px] h-[520px] rounded-[32px] overflow-hidden group shadow-[0_32px_64px_-16px_rgba(0,0,0,0.5)] transition-all",
        isFocusOverlayOpen ? "bg-transparent border-none shadow-none" : "border border-white/10 bg-black/40 backdrop-blur-2xl"
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
        className={cn(
          "transition-opacity duration-700",
          isFocusOverlayOpen ? "opacity-100" : "opacity-80 group-hover:opacity-100"
        )}
      />
    </motion.div>
  );

  return (
    <div className={cn("fixed inset-0 pointer-events-none", isFocusOverlayOpen ? "z-[400]" : "z-[10]")}>
      {/* Container that spans the whole screen when focus is on, or stays small when not */}
      <div 
        className={cn(
          "absolute transition-none",
          isFocusOverlayOpen 
            ? "inset-0 grid grid-cols-12 gap-16 items-center px-12" 
            : "bottom-8 right-8 w-[420px] h-[520px]"
        )}
      >
        <div className={cn(
          "relative pointer-events-auto",
          isFocusOverlayOpen ? "col-start-10 col-span-3 flex flex-col items-center" : "w-full h-full"
        )}>
           <div className="flex flex-col items-center w-[420px]">
             {isFocusOverlayOpen && (
               <div className="flex items-center gap-3 w-full mb-4">
                  <Music4 className="w-5 h-5 text-purple-400" />
                  <h3 className="text-sm font-bold uppercase tracking-[0.2em] text-white/20">Spotify Focus</h3>
               </div>
             )}
             
             <div className="w-full h-full">
               {renderContent()}
             </div>
           </div>
        </div>
      </div>
    </div>
  );
}
