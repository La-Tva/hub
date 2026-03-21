'use client';

import React, { useRef } from 'react';
import { motion, useMotionValue, useSpring, useTransform, MotionValue, Reorder } from 'framer-motion';
import { useSystemStore, AppConfig } from '@/store/useSystemStore';
import Image from 'next/image';
import { cn } from '../../lib/utils';

function DockIcon({ 
  app, mouseX, priority, size: baseSize, mag, position 
}: { 
  app: AppConfig; 
  mouseX: MotionValue<{ x: number; y: number }>; 
  priority?: boolean; 
  size: number; 
  mag: number;
  position: 'bottom' | 'top' | 'left' | 'right' | 'center';
}) {
  const ref = useRef<HTMLDivElement>(null);
  const { 
    apps, setActiveApp, setSettingsOpen, setActiveFolderId, 
    setContextMenu, createFolder, addAppToFolder, removeApp,
    toggleCalculator
  } = useSystemStore();

  const distance = useTransform(mouseX, (val) => {
    if (val.x === Infinity) return Infinity;
    const bounds = ref.current?.getBoundingClientRect() ?? { x: 0, width: 0, y: 0, height: 0 };
    const center = {
      x: bounds.x + bounds.width / 2,
      y: bounds.y + bounds.height / 2
    };
    return Math.sqrt(Math.pow(val.x - center.x, 2) + Math.pow(val.y - center.y, 2));
  });

  const sizeTransform = useTransform(distance, [0, 150], [baseSize * mag, baseSize]);
  const size = useSpring(sizeTransform, {
    mass: 0.1,
    stiffness: 250,
    damping: 20,
  });

  const [isHovered, setIsHovered] = React.useState(false);
  const y = useSpring(isHovered ? -30 : 0, {
    mass: 0.1,
    stiffness: 250,
    damping: 20,
  });

  const handleClick = () => {
    if (app.type === 'folder') {
      setActiveFolderId(app.id);
      return;
    }

    if (app.id === 'settings') {
      setSettingsOpen(true);
      return;
    }
    
    if (app.id === 'calculator' || app.url === 'calculator') {
      toggleCalculator();
      return;
    }

    if (app.isInternal) {
      setActiveApp(app.id);
    } else if (app.url) {
      window.open(app.url, '_blank');
    }
  };

  const renderIcon = () => {
    if (app.type === 'folder' && app.folderApps) {
      return (
        <div className="w-full h-full grid grid-cols-2 gap-0.5 p-1.5 bg-white/5 rounded-[22%] group-hover:bg-white/10 transition-colors">
          {app.folderApps.slice(0, 4).map((fApp, i) => (
            <div key={fApp.id} className="relative w-full h-full">
              <Image
                src={fApp.icon}
                alt=""
                fill
                className="object-contain p-0.5"
                unoptimized
                draggable={false}
              />
            </div>
          ))}
          {/* Fill empty slots with placeholders if < 4 apps */}
          {[...Array(Math.max(0, 4 - app.folderApps.length))].map((_, i) => (
            <div key={`empty-${i}`} className="w-full h-full bg-white/5 rounded-sm" />
          ))}
        </div>
      );
    }

    return (
      <Image
        src={app.icon}
        alt={app.name}
        fill
        className="object-contain p-1 transform-gpu"
        unoptimized
        priority={priority}
        draggable={false}
      />
    );
  };

  return (
    <motion.div
      ref={ref}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onPointerDown={(e) => setActiveFolderId(null)}
      onClick={handleClick}
      onContextMenu={(e) => {
        e.preventDefault();
        e.stopPropagation();
        const folders = apps.filter(a => a.type === 'folder' && a.id !== app.id);
        setContextMenu(true, e.clientX, e.clientY, [
          { 
            label: "Déplacer vers un dossier", 
            icon: "FolderPlus",
            disabled: app.type === 'folder',
            submenu: [
              { 
                label: "Nouveau dossier...", 
                icon: "Plus", 
                action: () => {
                  const name = prompt('Nom du dossier :');
                  if (name) createFolder(name, [app.id]);
                } 
              },
              ...folders.map(f => ({
                label: f.name,
                icon: "Folder",
                action: () => addAppToFolder(f.id, app.id)
              }))
            ]
          },
          { separator: true },
          { label: "Supprimer", icon: "Trash", action: () => removeApp(app.id), danger: true },
        ]);
      }}
      whileTap={{ scale: 0.9 }}
      style={{
        width: size,
        height: size,
        y,
        originY: 1, // Anchor to bottom for magnification
      }}
      className="relative flex items-center justify-center cursor-pointer group z-10"
    >
      {/* Tooltip */}
      <div className={cn(
        "absolute opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none transform z-50",
        position === 'bottom' || position === 'center' ? "-top-14 left-1/2 -translate-x-1/2 group-hover:-translate-y-2" :
        position === 'top' ? "-bottom-14 left-1/2 -translate-x-1/2 group-hover:translate-y-2" :
        position === 'left' ? "left-full ml-4 top-1/2 -translate-y-1/2 group-hover:translate-x-2" :
        position === 'right' ? "right-full mr-4 top-1/2 -translate-y-1/2 group-hover:-translate-x-2" : ""
      )}>
        <div className="px-3 py-1 rounded-lg bg-black/90 backdrop-blur-xl border border-white/10 text-[12px] font-medium text-white shadow-3xl">
          {app.name}
        </div>
      </div>

      <div className="relative w-full h-full p-0.5">
        <div className="w-full h-full rounded-[24%] overflow-hidden relative shadow-2xl bg-black/20">
          {renderIcon()}
        </div>
      </div>

      {/* Active Indicator (Dot) */}
      {(app.isInternal || app.id === 'spotify') && (
        <motion.div 
          className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-white shadow-[0_0_8px_white]"
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
        />
      )}
    </motion.div>
  );
}

export default function Dock() {
  const [mounted, setMounted] = React.useState(false);
  const { 
    apps, setContextMenu, setSettingsOpen, setAppPickerOpen, 
    dockPosition, setDockPosition, dockSize, setDockSize,
    pomodoroMode, pomodoroIsRunning, setDashboardOpen,
    reorderApps
  } = useSystemStore();

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const mouseX = useMotionValue({ x: Infinity, y: Infinity });

  if (!mounted) return null;

  const getGlowColor = () => {
    if (!pomodoroIsRunning) return "bg-blue-500/10";
    if (pomodoroMode === 'work') return "bg-red-500/20";
    if (pomodoroMode === 'shortBreak') return "bg-green-500/20";
    return "bg-blue-500/20";
  };
  
  const getIconSize = () => {
    switch (dockSize) {
      case 'small': return 40;
      case 'large': return 68;
      default: return 54;
    }
  };

  const getMagnification = () => {
    switch (dockSize) {
      case 'small': return 1.6;
      case 'large': return 2.8;
      default: return 2.4;
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
              { label: "Personnaliser le bureau", icon: "Layout", action: () => setDashboardOpen(true) },
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
            padding: isVertical ? '12px 6px' : '6px 12px',
          }}
          className={cn(
            "relative flex items-end justify-center gap-2 transition-all duration-500",
            isVertical ? "flex-col" : "flex-row"
          )}
        >
          {/* Glass Shelf Background */}
          <div className={cn(
            "absolute inset-0 -z-10 bg-[#161616]/60 backdrop-blur-3xl border border-white/5 shadow-[0_40px_80px_-20px_rgba(0,0,0,0.8)]",
            isVertical ? "rounded-3xl" : "rounded-[32px]"
          )} />
          
          {/* Top reflective edge - only for horizontal */}
          {!isVertical && (
            <div className="absolute top-0 left-8 right-8 h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent" />
          )}
          
          {/* Icons Container */}
          <Reorder.Group 
            axis={isVertical ? "y" : "x"} 
            values={apps} 
            onReorder={reorderApps}
            className={cn("flex gap-2 relative items-end", isVertical ? "flex-col pb-2" : "flex-row pb-1.5")}
          >
            {apps.map((app, index) => (
              <Reorder.Item
                key={app.id}
                value={app}
                id={app.id}
                className="relative"
              >
                <DockIcon 
                  app={app} 
                  mouseX={mouseX} 
                  priority={index < 4}                  size={baseSize}
                  mag={mag}
                  position={dockPosition}
                />
              </Reorder.Item>
            ))}
          </Reorder.Group>
        </motion.div>
        
        {/* Ambient Glow */}
        <div className={cn(
          "absolute inset-0 -z-10 blur-[120px] rounded-full opacity-40 scale-[2.5] transition-colors duration-1000",
          getGlowColor()
        )} />
      </div>
    </div>
  );
}
