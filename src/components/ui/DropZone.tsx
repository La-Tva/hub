'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { UploadCloud, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { useSystemStore } from '@/store/useSystemStore';
import { cn } from '@/lib/utils';

interface DropZoneProps {
  isDragging: boolean;
  onClose: () => void;
}

export default function DropZone({ isDragging, onClose }: DropZoneProps) {
  const { setUploadStatus, setUploadResultUrl, uploadStatus, showDropZone } = useSystemStore();
  const [isHovering, setIsHovering] = useState(false);

  if (!showDropZone) return null;

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsHovering(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsHovering(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsHovering(false);

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      const file = files[0];
      uploadFile(file);
    }
  };

  const uploadFile = async (file: File) => {
    setUploadStatus('uploading');
    
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      if (data.success) {
        setUploadStatus('success');
        setUploadResultUrl(window.location.origin + data.url);
        // We don't close immediately to let the result overlay show
      } else {
        setUploadStatus('error');
      }
    } catch (error) {
      console.error('Upload failed:', error);
      setUploadStatus('error');
    } finally {
      // Auto reset status after a delay if error
      if (uploadStatus === 'error') {
        setTimeout(() => setUploadStatus('idle'), 3000);
      }
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {isDragging && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className="fixed inset-0 z-[100] flex items-center justify-center p-12 bg-black/40 backdrop-blur-sm pointer-events-auto"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ 
              scale: isHovering ? 1.05 : 1, 
              opacity: 1,
              borderColor: isHovering ? 'rgba(255,255,255,0.4)' : 'rgba(255,255,255,0.1)'
            }}
            exit={{ scale: 0.9, opacity: 0 }}
            className={cn(
              "relative w-full max-w-2xl aspect-video rounded-[40px] border-2 border-dashed flex flex-col items-center justify-center gap-6 transition-all duration-500 overflow-hidden",
              isHovering ? "bg-white/10 shadow-[0_0_80px_-12px_rgba(255,255,255,0.3)]" : "bg-white/5"
            )}
          >
            {/* Animated Glow Effect */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-white/5 opacity-50" />
            
            <div className={cn(
              "p-8 rounded-full bg-white/5 backdrop-blur-xl border border-white/10 transition-all duration-500",
              isHovering ? "scale-110 bg-white/10" : ""
            )}>
              <UploadCloud className={cn(
                "w-16 h-16 transition-all duration-500",
                isHovering ? "text-white" : "text-white/40"
              )} />
            </div>

            <div className="text-center space-y-2 relative z-10">
              <h2 className="text-3xl font-bold text-white tracking-tight">
                {isHovering ? "Lâchez pour partager" : "Glissez un fichier ici"}
              </h2>
              <p className="text-white/40 font-medium">
                Générez un lien éphémère et un QR code instantanément
              </p>
            </div>

            {/* Dotted Border Animation using SVG */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none">
              <rect
                x="2" y="2"
                width="calc(100% - 4px)" height="calc(100% - 4px)"
                rx="38"
                fill="none"
                stroke="white"
                strokeWidth="2"
                strokeDasharray="12 12"
                className={cn(
                  "opacity-20 transition-all duration-500",
                  isHovering ? "stroke-[3] opacity-40 [stroke-dashoffset:-24] animate-[dash_2s_linear_infinite]" : ""
                )}
              />
            </svg>

            <style jsx>{`
              @keyframes dash {
                to { stroke-dashoffset: -24; }
              }
            `}</style>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
