"use client";

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Image, PlusCircle, Settings, RefreshCw, Layers, Monitor, HardDrive, Cpu, ExternalLink, ChevronRight, Check, Sun, Moon, Eye, EyeOff, Github, LogIn, LogOut } from 'lucide-react';
import { useSystemStore, ContextMenuItem } from '@/store/useSystemStore';
import { cn } from '@/lib/utils';

const IconMap: Record<string, any> = {
  Image, PlusCircle, Settings, RefreshCw, Layers, Monitor, HardDrive, Cpu, ExternalLink, Sun, Moon, Eye, EyeOff, Github, LogIn, LogOut
};

function MenuItem({ item, closeAll }: { item: ContextMenuItem; closeAll: () => void }) {
  const [isSubOpen, setIsSubOpen] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const { setContextMenu } = useSystemStore();

  const handleMouseEnter = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    if (item.submenu) setIsSubOpen(true);
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setIsSubOpen(false);
    }, 150);
  };

  const IconComponent = item.icon ? IconMap[item.icon] : null;

  if (item.separator) {
    return <div className="h-[1px] bg-white/10 my-1 mx-2" />;
  }

  return (
    <div 
      className="relative"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <button
        onClick={() => {
          if (!item.submenu && item.action) {
            item.action();
            closeAll();
          }
        }}
        className={cn(
          "w-full flex items-center justify-between px-2 py-1.5 rounded-md transition-all duration-100 group text-left outline-none",
          isSubOpen ? "bg-white/10 text-white" : "hover:bg-white/10 text-white/90"
        )}
      >
        <div className="flex items-center gap-3">
          <span className="text-white/40 group-hover:text-white transition-colors min-w-[16px]">
            {IconComponent && <IconComponent className="w-4 h-4" />}
          </span>
          <span className="text-[13px] font-medium leading-none">
            {item.label}
          </span>
        </div>
        {item.submenu && (
          <ChevronRight className="w-3.5 h-3.5 text-white/30" />
        )}
      </button>

      {item.submenu && isSubOpen && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95, x: -10 }}
          animate={{ opacity: 1, scale: 1, x: 0 }}
          style={{ 
            position: 'absolute',
            left: '100%',
            top: -6,
            marginLeft: 4,
          }}
          className="w-[180px] bg-black/60 backdrop-blur-[40px] border border-white/15 rounded-xl shadow-2xl p-1.5 ring-1 ring-white/5"
        >
          {item.submenu.map((sub, idx) => (
            <MenuItem key={idx} item={sub} closeAll={closeAll} />
          ))}
        </motion.div>
      )}
    </div>
  );
}

export default function ContextMenu() {
  const { contextMenu, setContextMenu } = useSystemStore();
  const { isOpen, x, y, items } = contextMenu;
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleGlobalClick = () => {
      if (isOpen) setContextMenu(false);
    };
    window.addEventListener('click', handleGlobalClick);
    return () => window.removeEventListener('click', handleGlobalClick);
  }, [isOpen, setContextMenu]);

  const menuWidth = 220;
  let adjustedX = x;
  let adjustedY = y;

  if (typeof window !== 'undefined') {
    if (x + menuWidth > window.innerWidth) adjustedX -= menuWidth;
    if (y + 100 > window.innerHeight) adjustedY -= 100; // Rough min height
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          ref={menuRef}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.1, ease: 'easeOut' }}
          style={{ 
            left: adjustedX, 
            top: adjustedY,
            zIndex: 10000 
          }}
          className="fixed w-[220px] bg-black/40 backdrop-blur-[30px] border border-white/15 rounded-xl shadow-[0_10px_30px_rgba(0,0,0,0.3)] p-1.5 overflow-visible ring-1 ring-white/5 pointer-events-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {items.map((item, index) => (
            <MenuItem key={index} item={item} closeAll={() => setContextMenu(false)} />
          ))}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
