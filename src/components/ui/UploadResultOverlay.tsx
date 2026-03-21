'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, Copy, QrCode, X, ExternalLink, Share2, Loader2 } from 'lucide-react';
import { useSystemStore } from '@/store/useSystemStore';
import { cn } from '@/lib/utils';

export default function UploadResultOverlay() {
  const { uploadStatus, uploadResultUrl, setUploadStatus, setUploadResultUrl } = useSystemStore();
  const [copied, setCopied] = useState(false);
  const [showQR, setShowQR] = useState(true);

  const handleCopy = () => {
    if (uploadResultUrl) {
      navigator.clipboard.writeText(uploadResultUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleClose = () => {
    setUploadStatus('idle');
    setUploadResultUrl(null);
  };

  const qrUrl = uploadResultUrl 
    ? `https://quickchart.io/qr?text=${encodeURIComponent(uploadResultUrl)}&size=250&margin=1`
    : '';

  return (
    <AnimatePresence>
      {uploadStatus !== 'idle' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[110] flex items-center justify-center p-8 bg-black/60 backdrop-blur-md pointer-events-auto"
        >
          <motion.div
            initial={{ scale: 0.9, y: 20, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.9, y: 20, opacity: 0 }}
            className="relative w-full max-w-md glass-dark rounded-[40px] border border-white/10 overflow-hidden shadow-2xl p-8"
          >
            <button
              onClick={handleClose}
              className="absolute top-6 right-6 p-2 rounded-full border border-white/10 bg-white/5 hover:bg-white/10 text-white/40 hover:text-white transition-all"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex flex-col items-center text-center gap-6">
              {uploadStatus === 'uploading' ? (
                <>
                  <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center">
                    <Loader2 className="w-10 h-10 text-white animate-spin" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-2xl font-bold text-white">Envoi en cours...</h3>
                    <p className="text-white/40">Hub prépare votre lien magique</p>
                  </div>
                </>
              ) : uploadStatus === 'success' ? (
                <>
                  <div className="w-20 h-20 rounded-full bg-green-500/20 flex items-center justify-center">
                    <Check className="w-10 h-10 text-green-500" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-2xl font-bold text-white">Fichier partagé !</h3>
                    <p className="text-white/40">Voici votre lien éphémère</p>
                  </div>

                  {/* QR Code */}
                  <div className="relative group p-4 bg-white rounded-3xl overflow-hidden shadow-2xl">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={qrUrl} alt="QR Code" className="w-48 h-48" />
                  </div>

                  {/* Link Input */}
                  <div className="w-full flex items-center gap-2 p-2 rounded-2xl bg-white/5 border border-white/10 pr-2">
                    <div className="flex-1 px-4 overflow-hidden">
                      <p className="text-sm font-medium text-white/60 truncate tracking-tight uppercase">
                        {uploadResultUrl?.replace(/^https?:\/\//, '')}
                      </p>
                    </div>
                    <button
                      onClick={handleCopy}
                      className={cn(
                        "flex items-center gap-2 px-6 py-3 rounded-xl transition-all font-bold text-sm",
                        copied ? "bg-green-500 text-white" : "bg-white text-black hover:bg-white/90"
                      )}
                    >
                      {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                      {copied ? "Copié" : "Copier"}
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-3 w-full mt-2">
                    <button 
                      onClick={() => window.open(uploadResultUrl!, '_blank')}
                      className="flex items-center justify-center gap-2 py-4 rounded-2xl bg-white/5 border border-white/10 text-white/60 hover:text-white hover:bg-white/10 transition-all font-bold text-sm"
                    >
                      <ExternalLink className="w-4 h-4" />
                      Ouvrir
                    </button>
                    <button 
                      onClick={handleClose}
                      className="flex items-center justify-center gap-2 py-4 rounded-2xl bg-white text-black hover:bg-white/90 transition-all font-bold text-sm"
                    >
                      Terminer
                    </button>
                  </div>
                </>
              ) : (
                <>
                   <div className="w-20 h-20 rounded-full bg-red-500/20 flex items-center justify-center">
                    <X className="w-10 h-10 text-red-500" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-2xl font-bold text-white">Erreur d'envoi</h3>
                    <p className="text-white/40">Quelque chose s'est mal passé. Réessayez ?</p>
                  </div>
                  <button 
                    onClick={handleClose}
                    className="w-full py-4 rounded-2xl bg-white text-black hover:bg-white/90 transition-all font-bold text-sm"
                  >
                    Retour
                  </button>
                </>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
