'use client';

import React from 'react';
import { Cloud, Sun, CloudRain, Wind } from 'lucide-react';
import { motion } from 'framer-motion';

export default function WeatherWidget() {
  return (
    <motion.div 
      drag
      dragConstraints={{ left: -100, right: 100, top: -100, bottom: 100 }}
      whileHover={{ scale: 1.02 }}
      className="glass-dark p-6 rounded-[32px] w-64 shadow-2xl border border-white/5 cursor-grab active:cursor-grabbing"
    >
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-xl font-bold text-white">Paris</h3>
          <p className="text-white/40 text-sm">Nuageux</p>
        </div>
        <Cloud className="w-10 h-10 text-white/80" />
      </div>
      <div className="flex items-end gap-2 mb-6">
        <span className="text-5xl font-light text-white">18°</span>
        <div className="flex flex-col text-xs text-white/40 mb-1">
          <span>Max: 22°</span>
          <span>Min: 14°</span>
        </div>
      </div>
      <div className="flex justify-between text-white/60">
        <div className="flex flex-col items-center gap-1">
          <span className="text-[10px] uppercase tracking-wider">Lun</span>
          <Sun className="w-4 h-4" />
          <span className="text-xs">24°</span>
        </div>
        <div className="flex flex-col items-center gap-1">
          <span className="text-[10px] uppercase tracking-wider">Mar</span>
          <CloudRain className="w-4 h-4" />
          <span className="text-xs">19°</span>
        </div>
        <div className="flex flex-col items-center gap-1">
          <span className="text-[10px] uppercase tracking-wider">Mer</span>
          <Wind className="w-4 h-4" />
          <span className="text-xs">21°</span>
        </div>
      </div>
    </motion.div>
  );
}
