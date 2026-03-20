'use client';

import React, { useRef } from 'react';
import { motion, useMotionValue, useSpring, useTransform, MotionValue } from 'framer-motion';
import { useSystemStore, AppConfig } from '@/store/useSystemStore';
import Image from 'next/image';
import { cn } from '../../lib/utils';

function DockIcon({ app, mouseX, priority, size: baseSize, mag }: { app: AppConfig; mouseX: MotionValue<{ x: number; y: number }>; priority?: boolean; size: number; mag: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const { setActiveApp, setSettingsOpen } = useSystemStore();

  const distance = useTransform(mouseX, (val) => {
    const bounds = ref.current?.getBoundingClientRect() ?? { x: 0, width: 0, y: 0, height: 0 };
    // Handle both vertical and horizontal mouse distance
    const center = {
      x: bounds.x + bounds.width / 2,
      y: bounds.y + bounds.height / 2
    };
    return Math.sqrt(Math.pow(val.x - center.x, 2) + Math.pow(val.y - center.y, 2));
  });

  const sizeTransform = useTransform(distance, [0, 140], [baseSize * mag, baseSize]);
  const size = useSpring(sizeTransform, {
    mass: 0.1,
    stiffness: 150,
    damping: 15,
  });

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
      style={{ width: size, height: size }}
      className="relative flex items-center justify-center cursor-pointer group z-10"
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
  const { apps, setContextMenu, setSettingsOpen, setAppPickerOpen, dockPosition, setDockPosition, dockSize, setDockSize } = useSystemStore();
  const mouseX = useMotionValue({ x: Infinity, y: Infinity });

  const getIconSize = () => {
    switch (dockSize) {
      case 'small': return 40;
      case 'large': return 68;
      default: return 54;
    }
  };

  const getMagnification = () => {
    switch (dockSize) {
      case 'small': return 1.8;
      case 'large': return 2.6;
      default: return 2.2;
    }
  };

  const nextPosition = () => {
    const positions: ('bottom' | 'top' | 'left' | 'right' | 'center')[] = ['bottom', 'left', 'top', 'right', 'center'];
    const currentIndex = positions.indexOf(dockPosition);
    setDockPosition(positions[(currentIndex + 1) % positions.length]);
  };

  const nextSize = () => {
    const sizes: ('small' | 'medium' | 'large')[] = ['small', 'medium', 'large'];
    const currentIndex = sizes.indexOf(dockSize);
    setDockSize(sizes[(currentIndex + 1) % sizes.length]);
  };

  const isVertical = dockPosition === 'left' || dockPosition === 'right';

  const positionClasses = {
    bottom: "bottom-6 left-1/2 -translate-x-1/2 flex-row",
    top: "top-6 left-1/2 -translate-x-1/2 flex-row",
    left: "left-6 top-1/2 -translate-y-1/2 flex-col",
    right: "right-6 top-1/2 -translate-y-1/2 flex-col",
    center: "top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex-row"
  };

  const baseSize = getIconSize();
  const mag = getMagnification();

  return (
    <div 
      className={cn(
        "fixed z-[50] pointer-events-none flex items-center justify-center",
        positionClasses[dockPosition]
      )}
    >
      <div className="relative pointer-events-auto">
        {/* The Thin Glass Shelf - Centered Floating Pill */}
        <motion.div
          onMouseMove={(e) => mouseX.set({ x: e.pageX, y: e.pageY })}
          onMouseLeave={() => mouseX.set({ x: Infinity, y: Infinity })}
          onContextMenu={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setContextMenu(true, e.clientX, e.clientY, [
              { label: "Ajouter une application", icon: "PlusCircle", action: () => setAppPickerOpen(true) },
              { label: "Préférences du Dock", icon: "Layers", action: () => setSettingsOpen(true, 'dock') },
              { separator: true },
              { 
                label: "Position du Dock", 
                icon: "Monitor", 
                submenu: [
                  { label: "Bas", icon: dockPosition === 'bottom' ? 'Check' : undefined, action: () => setDockPosition('bottom') },
                  { label: "Gauche", icon: dockPosition === 'left' ? 'Check' : undefined, action: () => setDockPosition('left') },
                  { label: "Haut", icon: dockPosition === 'top' ? 'Check' : undefined, action: () => setDockPosition('top') },
                  { label: "Droite", icon: dockPosition === 'right' ? 'Check' : undefined, action: () => setDockPosition('right') },
                  { label: "Centre", icon: dockPosition === 'center' ? 'Check' : undefined, action: () => setDockPosition('center') },
                ]
              },
              { 
                label: "Taille du Dock", 
                icon: "Monitor", 
                submenu: [
                  { label: "Petit", icon: dockSize === 'small' ? 'Check' : undefined, action: () => setDockSize('small') },
                  { label: "Moyen", icon: dockSize === 'medium' ? 'Check' : undefined, action: () => setDockSize('medium') },
                  { label: "Grand", icon: dockSize === 'large' ? 'Check' : undefined, action: () => setDockSize('large') },
                ]
              },
            ]);
          }}
          style={{
            height: isVertical ? 'auto' : baseSize + 24,
            width: isVertical ? baseSize + 24 : 'auto',
            padding: '12px',
          }}
          className={cn(
            "relative flex items-center gap-3 rounded-[32px] border border-white/10 shadow-[0_25px_60px_-10px_rgba(0,0,0,0.6)] glass-dark transition-all duration-500",
            isVertical ? "flex-col py-6" : "flex-row px-6"
          )}
        >
          {/* Top reflective edge - only for horizontal */}
          {!isVertical && (
            <div className="absolute top-0 left-8 right-8 h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent" />
          )}
          
          {/* Icons Container */}
          <div className={cn("flex gap-2.5 relative items-center", isVertical ? "flex-col" : "flex-row")}>
            {apps.map((app, index) => (
              <DockIcon 
                key={app.id} 
                app={app} 
                mouseX={mouseX} 
                priority={index < 4} 
                size={baseSize}
                mag={mag}
              />
            ))}
          </div>
        </motion.div>
        
        {/* Ambient Glow */}
        <div className="absolute inset-0 -z-10 bg-blue-500/10 blur-[120px] rounded-full opacity-40 scale-[2.5]" />
      </div>
    </div>
  );
}
