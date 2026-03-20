'use client';

import React, { useRef } from 'react';
import { motion, useMotionValue, useSpring, useTransform, MotionValue } from 'framer-motion';
import { useSystemStore, AppConfig } from '@/store/useSystemStore';
import Image from 'next/image';

const DOCK_HEIGHT = 72;
const ICON_SIZE = 50;
const MAGNIFICATION = 2.4;
const DISTANCE = 140;

function DockIcon({ app, mouseX, priority }: { app: AppConfig; mouseX: MotionValue; priority?: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  const { setActiveApp, setSettingsOpen } = useSystemStore();

  const distance = useTransform(mouseX, (val) => {
    const bounds = ref.current?.getBoundingClientRect() ?? { x: 0, width: 0 };
    return val - bounds.x - bounds.width / 2;
  });

  const sizeTransform = useTransform(distance, [-DISTANCE, 0, DISTANCE], [ICON_SIZE, ICON_SIZE * MAGNIFICATION, ICON_SIZE]);
  const size = useSpring(sizeTransform, {
    mass: 0.1,
    stiffness: 150,
    damping: 15,
  });

  // Vertical displacement (Liquid Style)
  const yTransform = useTransform(sizeTransform, [ICON_SIZE, ICON_SIZE * MAGNIFICATION], [0, -30]);
  const y = useSpring(yTransform, { stiffness: 150, damping: 15 });

  const handleClick = () => {
    if (app.id === 'settings') {
      setSettingsOpen(true);
      return;
    }
    
    if (app.isInternal) {
      setActiveApp(app.id);
    } else {
      window.open(app.url, '_blank');
    }
  };

  return (
    <motion.div
      ref={ref}
      style={{ width: size, height: size, y }}
      className="relative flex items-center justify-center cursor-pointer group z-10 origin-bottom"
      onClick={handleClick}
      whileTap={{ scale: 0.9 }}
    >
      {/* Tooltip with Triangle Pointer (Beak) */}
      <div className="absolute -top-16 left-1/2 -translate-x-1/2 flex flex-col items-center opacity-0 group-hover:opacity-100 transition-all duration-200 pointer-events-none transform group-hover:-translate-y-1">
        <div className="px-4 py-1.5 rounded-2xl bg-[#1a1a1a]/90 backdrop-blur-xl border border-white/10 text-[13px] font-medium text-white shadow-2xl whitespace-nowrap">
          {app.name}
        </div>
        <div className="w-2.5 h-2.5 bg-[#1a1a1a]/90 border-r border-b border-white/10 rotate-45 -mt-1.5 backdrop-blur-xl" />
      </div>

      <div className="relative w-full h-full p-1 drop-shadow-2xl">
        <div className="w-full h-full rounded-[23%] bg-gradient-to-b from-white/10 to-transparent p-[1px] shadow-2xl transition-all group-hover:shadow-[0_20px_40px_rgba(0,0,0,0.4)]">
          <div className="w-full h-full rounded-[22%] bg-[#121212] overflow-hidden relative group/icon">
            <Image
              src={app.icon}
              alt={app.name}
              fill
              className="object-contain p-1 transform-gpu transition-transform group-hover/icon:scale-110"
              unoptimized
              priority={priority}
            />
            {/* Glossy Overlay */}
            <div className="absolute inset-0 bg-gradient-to-tr from-white/10 via-transparent to-white/20 opacity-60 pointer-events-none" />
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default function Dock() {
  const { apps } = useSystemStore();
  const mouseX = useMotionValue(Infinity);

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none">
      <div className="relative pointer-events-auto">
        {/* The Thin Glass Shelf - Centered Floating Pill */}
        <motion.div
          onMouseMove={(e) => mouseX.set(e.pageX)}
          onMouseLeave={() => mouseX.set(Infinity)}
          className="relative h-[72px] px-8 flex items-end pb-2.5 gap-4 rounded-[40px] border border-white/10 shadow-[0_25px_60px_-10px_rgba(0,0,0,0.6)] glass-dark overflow-visible"
        >
          {/* Top reflective edge */}
          <div className="absolute top-0 left-8 right-8 h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent" />
          
          {/* Icons Container */}
          <div className="flex items-end gap-2.5 relative">
            {apps.map((app, index) => (
              <DockIcon key={app.id} app={app} mouseX={mouseX} priority={index < 4} />
            ))}
          </div>
        </motion.div>
        
        {/* Ambient Glow */}
        <div className="absolute inset-0 -z-10 bg-blue-500/10 blur-[120px] rounded-full opacity-40 scale-[2.5]" />
        
        {/* Floor Shadow/Reflection Glow */}
        <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-[90%] h-4 bg-white/5 blur-2xl rounded-full opacity-30" />
      </div>
    </div>
  );
}
