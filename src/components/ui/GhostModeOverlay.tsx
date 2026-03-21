'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, Unlock, ShieldAlert, Loader2, ArrowRight } from 'lucide-react';
import { useSystemStore } from '@/store/useSystemStore';
import { cn } from '@/lib/utils';
import { signOut } from 'next-auth/react';

export default function GhostModeOverlay() {
  const { 
    isGhostModeActive, setGhostModeActive,
    isGhostModeLocked, setGhostModeLocked,
    ghostModePIN, setGhostModePIN
  } = useSystemStore();

  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isSettingMode, setIsSettingMode] = useState(!ghostModePIN);
  const [newPIN, setNewPIN] = useState('');
  const [confirmPIN, setConfirmPIN] = useState('');
  const [step, setStep] = useState<'enter' | 'confirm'>( 'enter');

  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isGhostModeActive) {
      inputRef.current?.focus();
    }
  }, [isGhostModeActive, step, isSettingMode]);

  const handleUnlock = async () => {
    if (!ghostModePIN) {
      // If no PIN, maybe prompt to set one or just unlock
      setGhostModeLocked(false);
      setGhostModeActive(false);
      return;
    }

    setIsVerifying(true);
    setError(false);

    // Artificial delay for premium feel
    await new Promise(resolve => setTimeout(resolve, 600));

    if (pin === ghostModePIN) {
      setGhostModeLocked(false);
      setGhostModeActive(false);
      setPin('');
    } else {
      setError(true);
      setPin('');
      // Shake animation trigger
      setTimeout(() => setError(false), 500);
    }
    setIsVerifying(false);
  };

  const handleSetPIN = async () => {
    if (step === 'enter') {
      if (newPIN.length < 4) {
        setError(true);
        setTimeout(() => setError(false), 500);
        return;
      }
      setStep('confirm');
    } else {
      if (newPIN === confirmPIN) {
        setIsVerifying(true);
        await setGhostModePIN(newPIN);
        setIsSettingMode(false);
        setGhostModeLocked(false);
        setGhostModeActive(false);
        setIsVerifying(false);
      } else {
        setError(true);
        setConfirmPIN('');
        setStep('enter');
        setNewPIN('');
        setTimeout(() => setError(false), 500);
      }
    }
  };

  if (!isGhostModeActive) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[999] flex flex-col items-center justify-center p-8 bg-white/10 dark:bg-black/10 backdrop-blur-[40px]"
    >
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/20 pointer-events-none" />
      
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        className="relative z-10 w-full max-w-sm flex flex-col items-center text-center"
      >
        <motion.div 
          animate={error ? { x: [-10, 10, -10, 10, 0] } : {}}
          className={cn(
            "w-24 h-24 rounded-[32px] bg-white/5 border border-white/10 flex items-center justify-center mb-8 shadow-2xl relative group overflow-hidden",
            error ? "border-red-500/50 bg-red-500/10" : "hover:border-white/20"
          )}
        >
          <div className="absolute inset-0 bg-gradient-to-tr from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          {isVerifying ? (
            <Loader2 className="w-8 h-8 text-white animate-spin" />
          ) : error ? (
            <ShieldAlert className="w-8 h-8 text-red-400" />
          ) : isGhostModeLocked ? (
            <Lock className="w-8 h-8 text-white/40" />
          ) : (
            <Unlock className="w-8 h-8 text-white/40" />
          )}
        </motion.div>

        <h2 className="text-2xl font-bold text-white mb-2 tracking-tight">Ghost Mode</h2>
        <p className="text-sm text-white/40 mb-12">
          {isSettingMode 
            ? (step === 'enter' ? 'Définissez votre code PIN de sécurité' : 'Confirmez votre code PIN')
            : 'Saisissez votre code PIN pour déverrouiller'}
        </p>

        <div className="w-full relative px-8">
          <input
            ref={inputRef}
            type="password"
            maxLength={isSettingMode ? 8 : ghostModePIN?.length || 8}
            value={isSettingMode ? (step === 'enter' ? newPIN : confirmPIN) : pin}
            onChange={(e) => {
              const val = e.target.value.replace(/\D/g, '');
              if (isSettingMode) {
                if (step === 'enter') setNewPIN(val);
                else setConfirmPIN(val);
              } else {
                setPin(val);
              }
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                isSettingMode ? handleSetPIN() : handleUnlock();
              }
            }}
            className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-center text-2xl tracking-[1em] font-mono text-white outline-none focus:border-white/30 transition-all placeholder:text-white/10"
            placeholder="••••"
          />

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={isSettingMode ? handleSetPIN : handleUnlock}
            className="absolute right-12 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/10 hover:bg-white text-white/40 hover:text-black flex items-center justify-center transition-all group"
          >
            <ArrowRight className="w-4 h-4" />
          </motion.button>
        </div>

        {isSettingMode && step === 'confirm' && (
          <button 
            onClick={() => {
              setStep('enter');
              setConfirmPIN('');
              setNewPIN('');
            }}
            className="mt-6 text-[10px] font-bold uppercase tracking-widest text-white/20 hover:text-white/40 transition-colors"
          >
            Annuler
          </button>
        )}

        {!isSettingMode && (
          <div className="mt-12 space-y-4">
            <button 
              onClick={() => signOut()}
              className="text-[10px] font-bold uppercase tracking-widest text-white/20 hover:text-red-400 transition-colors"
            >
              Se déconnecter
            </button>
          </div>
        )}
      </motion.div>

      {/* Subtle instructions */}
      <div className="absolute bottom-12 left-1/2 -translate-x-1/2 text-center">
        <p className="text-[10px] font-bold uppercase tracking-widest text-white/10">Appuyez sur Entrée pour valider</p>
      </div>
    </motion.div>
  );
}
