'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSystemStore, AppConfig } from '@/store/useSystemStore';
import Image from 'next/image';
import { X } from 'lucide-react';

export default function FolderPopover() {
  const { 
    apps, activeFolderId, setActiveFolderId, setActiveApp, 
    setContextMenu, removeAppFromFolder, addAppToFolder 
  } = useSystemStore();

  const activeFolder = apps.find(app => app.id === activeFolderId && app.type === 'folder');

  if (!activeFolder) return null;

  const handleAppLaunch = (app: AppConfig) => {
    setActiveFolderId(null);
    if (app.isInternal) {
      setActiveApp(app.id);
    } else if (app.url) {
      window.open(app.url, '_blank');
    }
  };

  return (
    <AnimatePresence>
      {activeFolderId && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[60] flex items-center justify-center p-8 bg-black/20 backdrop-blur-md"
          onClick={() => setActiveFolderId(null)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="w-full max-w-2xl bg-[#1a1a1a]/80 backdrop-blur-3xl rounded-[48px] border border-white/10 p-12 shadow-[0_32px_128px_rgba(0,0,0,0.8)] relative"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-12 flex items-center justify-between">
              <motion.h2 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="text-4xl font-bold text-white/90 tracking-tight"
              >
                {activeFolder.name}
              </motion.h2>
              <button 
                onClick={() => setActiveFolderId(null)}
                className="p-3 rounded-full bg-white/5 text-white/40 hover:text-white hover:bg-white/10 transition-all"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="grid grid-cols-4 sm:grid-cols-6 gap-8">
              {activeFolder.folderApps?.map((app, index) => (
                <motion.div
                  key={app.id}
                  initial={{ opacity: 0, scale: 0.8, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="flex flex-col items-center gap-3 cursor-pointer group relative"
                  onClick={() => handleAppLaunch(app)}
                  onContextMenu={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    
                    const otherFolders = apps.filter(f => f.type === 'folder' && f.id !== activeFolder.id);
                    
                    setContextMenu(true, e.clientX, e.clientY, [
                      { 
                        label: "Ouvrir", 
                        icon: "Maximize2", 
                        action: () => handleAppLaunch(app) 
                      },
                      { separator: true },
                      { 
                        label: "Sortir du dossier", 
                        icon: "LogOut", 
                        action: () => {
                          removeAppFromFolder(activeFolder.id, app.id);
                        }
                      },
                      {
                        label: "Déplacer vers...",
                        icon: "FolderPlus",
                        disabled: otherFolders.length === 0,
                        submenu: otherFolders.map(f => ({
                          label: f.name,
                          icon: "Folder",
                          action: () => {
                            // First remove from current, then add to new
                            removeAppFromFolder(activeFolder.id, app.id);
                            // We need to wait for state to update or use a specialized action
                            // But for now, let's use the simple way
                            setTimeout(() => addAppToFolder(f.id, app.id), 100);
                          }
                        }))
                      }
                    ]);
                  }}
                >
                  <div className="relative w-20 h-20 rounded-[22%] bg-[#121212] flex items-center justify-center border border-white/5 shadow-2xl transition-all group-hover:scale-110 group-hover:shadow-[0_20px_40px_rgba(0,0,0,0.4)] overflow-hidden">
                    <Image
                      src={app.icon}
                      alt={app.name}
                      fill
                      className="object-contain p-3"
                      unoptimized
                    />
                    <div className="absolute inset-0 bg-gradient-to-tr from-white/5 via-transparent to-white/10 opacity-60 pointer-events-none" />
                  </div>
                  <span className="text-[13px] font-medium text-white/60 group-hover:text-white transition-colors text-center w-full truncate px-1">
                    {app.name}
                  </span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
