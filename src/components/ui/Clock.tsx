'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

export default function Clock() {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const hours = time.getHours().toString().padStart(2, '0');
  const minutes = time.getMinutes().toString().padStart(2, '0');

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="absolute top-[200px] left-1/2 -translate-x-1/2 z-0 pointer-events-none select-none text-center"
    >
      <h1 className="text-[64px] font-bold tracking-tighter drop-shadow-2xl" style={{ color: 'var(--foreground-rgb)' }}>
        {hours}:{minutes}
      </h1>
      <p className="text-sm font-medium uppercase tracking-[0.3em] -mt-2" style={{ color: 'var(--text-secondary)' }}>
        {time.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}
      </p>
    </motion.div>
  );
}
