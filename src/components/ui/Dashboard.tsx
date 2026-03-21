'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSystemStore, AppConfig } from '@/store/useSystemStore';
import { 
  X, Image as ImageIcon, Plus, Layout, Settings, 
  Moon, Sun, Eye, EyeOff, Monitor, Github, 
  Check, Globe, Search, Timer, StickyNote,
  ChevronRight, Apple, Minus, Maximize2, Loader2,
  Calculator as CalcIcon, Share2
} from 'lucide-react';
import { cn } from '@/lib/utils';

const SUGGESTED_APPS = [
  { name: 'ChatGPT', url: 'https://chat.openai.com', icon: 'https://upload.wikimedia.org/wikipedia/commons/0/04/ChatGPT_logo.svg' },
  { name: 'YouTube', url: 'https://www.youtube.com', icon: 'https://upload.wikimedia.org/wikipedia/commons/0/09/YouTube_full-color_icon_%282017%29.svg' },
  { name: 'GitHub', url: 'https://www.github.com', icon: 'https://upload.wikimedia.org/wikipedia/commons/9/91/Octicons-mark-github.svg' },
  { name: 'Twitch', url: 'https://www.twitch.tv', icon: 'https://upload.wikimedia.org/wikipedia/commons/d/d3/Twitch_Glitch_Logo_Purple.svg' },
  { name: 'Netflix', url: 'https://www.netflix.com', icon: 'https://upload.wikimedia.org/wikipedia/commons/0/08/Netflix_2015_logo.svg' },
];

export default function Dashboard() {
  const [mounted, setMounted] = React.useState(false);
  const { 
    isDashboardOpen, setDashboardOpen,
    wallpaper, setWallpaper, wallpaperHistory,
    apps, addApp,
    theme, toggleTheme,
    showNotes, toggleNotes,
    showWeather, toggleWeather,
    showTimer, toggleTimer,
    showClock, toggleClock,
    showCalculator, toggleCalculator,
    showClipboard, toggleClipboard,
    notes, setNotes,
    dockPosition, setDockPosition,
    dockSize, setDockSize,
    pomodoroSettings, setPomodoroSettings,
    isFocusOverlayOpen, setFocusOverlayOpen,
    setSettingsOpen,
    setContextMenu, createFolder, addAppToFolder, renameFolder,
    removeApp
  } = useSystemStore();

  const [activeTab, setActiveTab] = useState<'appearance' | 'apps' | 'system' | 'focus'>('appearance');
  const [isCreatingCustomApp, setIsCreatingCustomApp] = useState(false);
  const [customAppName, setCustomAppName] = useState('');
  const [customAppUrl, setCustomAppUrl] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setDashboardOpen(false);
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [setDashboardOpen]);

  if (!isDashboardOpen) return null;

  const tabs = [
    { id: 'appearance', label: 'Apparence', icon: ImageIcon },
    { id: 'apps', label: 'Applications', icon: Globe },
    { id: 'focus', label: 'Productivité', icon: Timer },
    { id: 'system', label: 'Système', icon: Settings },
  ] as const;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[200] flex items-center justify-center p-8 bg-black/20 backdrop-blur-md"
      onClick={() => setDashboardOpen(false)}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        transition={{ type: "spring", damping: 25, stiffness: 200 }}
        className="w-full max-w-6xl h-full max-h-[800px] bg-black/40 backdrop-blur-[80px] rounded-[48px] border border-white/10 shadow-[0_50px_100px_-20px_rgba(0,0,0,0.5)] overflow-hidden flex pointer-events-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Sidebar */}
        <div className="w-80 border-r border-white/5 bg-white/[0.02] p-8 flex flex-col">
          <div className="flex items-center gap-4 mb-12 px-2">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-cyan-400 flex items-center justify-center shadow-lg shadow-blue-500/20">
              <Apple className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white tracking-tight">Hub Dashboard</h1>
              <p className="text-[10px] uppercase tracking-widest text-white/30 font-bold">Version 2.0</p>
            </div>
          </div>

          <nav className="flex-1 space-y-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "w-full flex items-center gap-4 px-6 py-4 rounded-3xl transition-all group relative",
                  activeTab === tab.id 
                    ? "bg-white/10 text-white shadow-xl shadow-black/20" 
                    : "text-white/40 hover:text-white/70 hover:bg-white/5"
                )}
              >
                {activeTab === tab.id && (
                  <motion.div 
                    layoutId="active-tab"
                    className="absolute inset-0 bg-white/5 rounded-3xl -z-10 border border-white/10"
                  />
                )}
                <tab.icon className={cn("w-5 h-5", activeTab === tab.id ? "text-blue-400" : "text-current")} />
                <span className="text-sm font-semibold tracking-tight">{tab.label}</span>
              </button>
            ))}
          </nav>

          <div className="mt-auto">
            <button 
              onClick={() => {
                setDashboardOpen(false);
                setSettingsOpen(true);
              }}
              className="w-full flex items-center justify-between px-6 py-4 rounded-3xl bg-white/5 hover:bg-white/10 text-white/60 hover:text-white transition-all group"
            >
              <div className="flex items-center gap-4">
                <Settings className="w-5 h-5" />
                <span className="text-sm font-semibold">Tous les réglages</span>
              </div>
              <ChevronRight className="w-4 h-4 text-white/20 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 flex flex-col min-w-0">
          <div className="flex items-center justify-between p-8 border-b border-white/5 relative z-10">
            <div>
              <h2 className="text-2xl font-bold text-white tracking-tight">
                {tabs.find(t => t.id === activeTab)?.label}
              </h2>
              <p className="text-sm text-white/30 mt-1">Personnalisez votre expérience de bureau.</p>
            </div>
            <button 
              onClick={() => setDashboardOpen(false)}
              className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white/30 hover:bg-red-500/20 hover:text-red-400 transition-all"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
            {activeTab === 'appearance' && (
              <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4">
                <section>
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-sm font-bold uppercase tracking-widest text-white/20">Fonds d'écran récents</h3>
                    <button className="text-[11px] font-bold text-blue-400 hover:text-blue-300">Voir tout</button>
                  </div>
                  <div className="grid grid-cols-3 gap-6">
                    {wallpaperHistory.map((wp, i) => (
                      <button
                        key={i}
                        onClick={() => setWallpaper(wp)}
                        className={cn(
                          "aspect-[16/10] rounded-3xl overflow-hidden relative group transition-all",
                          wallpaper === wp ? "ring-4 ring-blue-500/50 scale-[1.02]" : "hover:scale-[1.02] border border-white/5"
                        )}
                      >
                        <img src={wp} className="w-full h-full object-cover" alt="History" />
                        <div className={cn(
                          "absolute inset-0 bg-black/40 flex items-center justify-center transition-opacity",
                          wallpaper === wp ? "opacity-100" : "opacity-0 group-hover:opacity-100"
                        )}>
                          {wallpaper === wp && <div className="bg-blue-500 rounded-full p-2"><Check className="w-4 h-4 text-white" /></div>}
                        </div>
                      </button>
                    ))}
                    <button className="aspect-[16/10] rounded-3xl border-2 border-dashed border-white/10 flex flex-col items-center justify-center gap-3 text-white/20 hover:border-white/30 hover:text-white/40 transition-all bg-white/[0.02]">
                      <Plus className="w-8 h-8" />
                      <span className="text-[10px] font-bold uppercase tracking-widest">Nouveau fond</span>
                    </button>
                  </div>
                </section>

                <section>
                   <h3 className="text-sm font-bold uppercase tracking-widest text-white/20 mb-6">Contrôles Rapides</h3>
                   <div className="grid grid-cols-2 gap-6">
                      <div className="bg-white/5 p-6 rounded-[32px] border border-white/5 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className={cn("p-3 rounded-2xl", theme === 'dark' ? "bg-indigo-500/20 text-indigo-400" : "bg-orange-500/20 text-orange-400")}>
                            {theme === 'dark' ? <Moon className="w-6 h-6" /> : <Sun className="w-6 h-6" />}
                          </div>
                          <div>
                            <p className="text-sm font-bold text-white">Thème {theme === 'dark' ? 'Sombre' : 'Clair'}</p>
                            <p className="text-[10px] text-white/30 uppercase tracking-tight">Interface système</p>
                          </div>
                        </div>
                        <button onClick={toggleTheme} className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-[10px] font-bold uppercase tracking-widest text-white transition-all">Basculer</button>
                      </div>

                      {/* Granular Widget Controls */}
                      <div className="col-span-2 bg-white/5 p-8 rounded-[40px] border border-white/5 space-y-8">
                        <h3 className="text-sm font-bold uppercase tracking-widest text-white/20">Widgets Bureau</h3>
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                          {[
                            { label: 'Clock', toggle: toggleClock, active: showClock, icon: Timer, color: 'indigo' },
                            { label: 'Notes', toggle: toggleNotes, active: showNotes, icon: StickyNote, color: 'orange' },
                            { label: 'Météo', toggle: toggleWeather, active: showWeather, icon: Sun, color: 'blue' },
                            { label: 'Timer', toggle: toggleTimer, active: showTimer, icon: Timer, color: 'red' },
                            { label: 'Calculatrice', toggle: toggleCalculator, active: showCalculator, icon: CalcIcon, color: 'purple' },
                            { label: 'Presse-papier', toggle: toggleClipboard, active: showClipboard, icon: Share2, color: 'blue' },
                          ].map((widget) => (
                            <button
                              key={widget.label}
                              onClick={widget.toggle}
                              className={cn(
                                "flex flex-col items-center gap-3 p-6 rounded-[32px] border transition-all relative overflow-hidden group",
                                widget.active 
                                  ? "bg-white/10 border-white/20 text-white shadow-xl scale-[1.02]" 
                                  : "bg-white/[0.02] border-white/5 text-white/20 hover:text-white/40"
                              )}
                            >
                              <div className={cn(
                                "p-3 rounded-2xl transition-colors",
                                widget.active ? "bg-white/10" : "bg-white/5"
                              )}>
                                <widget.icon className="w-6 h-6" />
                              </div>
                              <span className="text-[10px] font-bold uppercase tracking-widest">{widget.label}</span>
                              <div className="absolute top-3 right-3">
                                {widget.active ? <Check className="w-3 h-3 text-green-400" /> : <div className="w-3 h-3 rounded-full border border-white/10" />}
                              </div>
                            </button>
                          ))}
                        </div>
                      </div>
                   </div>
                </section>
              </div>
            )}

            {activeTab === 'apps' && (
              <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4">
                 <section>
                   <div className="flex items-center justify-between mb-6">
                     <h3 className="text-sm font-bold uppercase tracking-widest text-white/20">Mes Applications</h3>
                     <span className="text-[10px] font-bold text-white/20 bg-white/5 px-3 py-1 rounded-full">{apps.length} au total</span>
                   </div>
                   <div className="grid grid-cols-4 gap-6">
                      {apps.map((app, i) => (
                        <div
                          key={app.id}
                          onContextMenu={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            
                            const otherFolders = apps.filter(f => f.type === 'folder' && f.id !== app.id);
                            
                            if (app.type === 'folder') {
                              setContextMenu(true, e.clientX, e.clientY, [
                                { 
                                  label: "Renommer", 
                                  icon: "Edit3", 
                                  action: () => {
                                    const newName = prompt("Nouveau nom du dossier :", app.name);
                                    if (newName && newName !== app.name) {
                                      renameFolder(app.id, newName);
                                    }
                                  } 
                                },
                                { separator: true },
                                { label: "Supprimer", icon: "Trash", action: () => removeApp(app.id), danger: true },
                              ]);
                            } else {
                              setContextMenu(true, e.clientX, e.clientY, [
                                { 
                                  label: "Ajouter à un groupe...", 
                                  icon: "FolderPlus",
                                  disabled: otherFolders.length === 0,
                                  submenu: otherFolders.map(f => ({
                                    label: f.name,
                                    icon: "Folder",
                                    action: () => addAppToFolder(f.id, app.id)
                                  }))
                                },
                                { 
                                  label: "Nouveau groupe...", 
                                  icon: "PlusCircle", 
                                  action: () => {
                                    const name = prompt("Nom du groupe :");
                                    if (name) createFolder(name, [app.id]);
                                  }
                                },
                                { separator: true },
                                { label: "Supprimer", icon: "Trash", action: () => removeApp(app.id), danger: true },
                              ]);
                            }
                          }}
                          className="aspect-square rounded-[36px] bg-white/5 border border-white/5 p-8 flex flex-col items-center justify-between transition-all relative group hover:bg-white/10"
                        >
                          <div className="relative">
                            {app.type === 'folder' ? (
                              <div className="w-16 h-16 grid grid-cols-2 gap-0.5 p-1 bg-white/5 rounded-2xl">
                                {app.folderApps?.slice(0, 4).map((f, fi) => (
                                  <img key={fi} src={f.icon} className="w-full h-full object-contain p-0.5" alt="" />
                                ))}
                                {[...Array(Math.max(0, 4 - (app.folderApps?.length || 0)))].map((_, fi) => (
                                  <div key={fi} className="w-full h-full bg-white/5 rounded-sm" />
                                ))}
                              </div>
                            ) : (
                              <img src={app.icon} className="w-16 h-16 object-contain drop-shadow-2xl" alt={app.name} />
                            )}
                          </div>
                          <div className="text-center">
                            <p className="text-xs font-bold text-white">{app.name}</p>
                            <p className="text-[9px] uppercase tracking-tighter text-white/30 mt-1">{app.type === 'folder' ? 'Dossier' : 'Application'}</p>
                          </div>
                          
                          <button 
                            onClick={() => removeApp(app.id)}
                            className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-red-500 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all hover:scale-110 shadow-xl z-20"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                   </div>
                 </section>

                 <section>
                   <h3 className="text-sm font-bold uppercase tracking-widest text-white/20 mb-6">Découvrir</h3>
                   <div className="grid grid-cols-4 gap-6">
                      {SUGGESTED_APPS.map((suggestion, i) => {
                        const isInstalled = apps.some(a => a.url === suggestion.url);
                        return (
                          <button
                            key={i}
                            disabled={isInstalled}
                            onClick={() => addApp({ ...suggestion, isInternal: false })}
                            className={cn(
                              "aspect-square rounded-[36px] bg-white/5 border border-white/5 p-8 flex flex-col items-center justify-between transition-all relative group",
                              isInstalled ? "opacity-30 grayscale cursor-not-allowed" : "hover:bg-white/10 hover:scale-105 active:scale-95 shadow-xl"
                            )}
                          >
                            <img src={suggestion.icon} className="w-16 h-16 object-contain drop-shadow-2xl" alt={suggestion.name} />
                            <div className="text-center">
                              <p className="text-xs font-bold text-white">{suggestion.name}</p>
                              <p className="text-[9px] uppercase tracking-tighter text-white/30 mt-1">{isInstalled ? 'Installé' : 'Ajouter'}</p>
                            </div>
                            {!isInstalled && (
                              <div className="absolute top-4 right-4 bg-green-500 rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <Plus className="w-3 h-3 text-white" />
                              </div>
                            )}
                          </button>
                        );
                      })}
                   </div>
                 </section>

                 <section className="bg-gradient-to-br from-blue-600/20 to-purple-600/20 p-8 rounded-[40px] border border-white/10 relative overflow-hidden min-h-[140px] flex items-center">
                    <AnimatePresence mode="wait">
                      {!isCreatingCustomApp ? (
                        <motion.div 
                          key="invite"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          className="flex items-center gap-6 w-full"
                        >
                          <div className="w-16 h-16 rounded-2xl bg-white/10 flex items-center justify-center shrink-0">
                            <Globe className="w-8 h-8 text-blue-400" />
                          </div>
                          <div className="flex-1">
                            <h4 className="text-lg font-bold text-white">Application Personnalisée</h4>
                            <p className="text-sm text-white/50">Ajoutez n'importe quel site web comme une application système.</p>
                          </div>
                          <button 
                            onClick={() => setIsCreatingCustomApp(true)}
                            className="ml-auto px-6 py-3 bg-white text-black rounded-2xl text-xs font-bold hover:bg-white/90 transition-all shrink-0"
                          >
                            Créer maintenant
                          </button>
                        </motion.div>
                      ) : (
                        <motion.div 
                          key="form"
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.95 }}
                          className="flex flex-col gap-6 w-full"
                        >
                          <div className="flex items-center justify-between">
                            <h4 className="text-lg font-bold text-white">Nouvelle Application Web</h4>
                            <button onClick={() => setIsCreatingCustomApp(false)} className="text-white/20 hover:text-white"><X className="w-4 h-4" /></button>
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <input 
                              type="text" 
                              placeholder="Nom (ex: ChatGPT)" 
                              value={customAppName}
                              onChange={(e) => setCustomAppName(e.target.value)}
                              className="bg-white/10 rounded-2xl p-4 text-white outline-none border border-white/5 focus:border-white/20 transition-all text-xs"
                            />
                            <input 
                              type="url" 
                              placeholder="URL (ex: https://...)" 
                              value={customAppUrl}
                              onChange={(e) => setCustomAppUrl(e.target.value)}
                              className="bg-white/10 rounded-2xl p-4 text-white outline-none border border-white/5 focus:border-white/20 transition-all text-xs"
                            />
                          </div>
                          <button 
                            onClick={async () => {
                              if (!customAppName || !customAppUrl) return;
                              setIsAdding(true);
                              await addApp({
                                name: customAppName,
                                url: customAppUrl,
                                icon: `https://www.google.com/s2/favicons?sz=128&domain=${customAppUrl}`,
                                isInternal: false
                              });
                              setCustomAppName('');
                              setCustomAppUrl('');
                              setIsCreatingCustomApp(false);
                              setIsAdding(false);
                            }}
                            disabled={isAdding}
                            className="w-full py-4 bg-blue-500 hover:bg-blue-600 text-white rounded-2xl text-xs font-bold transition-all flex items-center justify-center gap-2"
                          >
                            {isAdding ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Ajouter au Dock'}
                          </button>
                        </motion.div>
                      )}
                    </AnimatePresence>
                 </section>
              </div>
            )}

            {activeTab === 'focus' && (
              <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 max-w-2xl mx-auto py-8">
                <div className="text-center mb-12">
                   <div className="inline-flex p-4 rounded-3xl bg-red-500/20 text-red-400 mb-6">
                     <Timer className="w-12 h-12" />
                   </div>
                   <h3 className="text-3xl font-bold text-white tracking-tight">Liquid Glass Focus</h3>
                   <p className="text-white/30 mt-2">Optimisez votre productivité avec la technique Pomodoro.</p>
                   <button 
                    onClick={() => {
                      setDashboardOpen(false);
                      setFocusOverlayOpen(true);
                    }}
                    className="mt-6 px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl text-[10px] font-bold uppercase tracking-widest text-white transition-all flex items-center gap-3 mx-auto"
                   >
                     <Maximize2 className="w-4 h-4" />
                     Lancer le mode immersif
                   </button>
                </div>

                <div className="grid grid-cols-3 gap-8">
                  {[
                    { label: 'Focus', key: 'work', val: pomodoroSettings.work, color: 'red' },
                    { label: 'Pause', key: 'shortBreak', val: pomodoroSettings.shortBreak, color: 'green' },
                    { label: 'Longue', key: 'longBreak', val: pomodoroSettings.longBreak, color: 'blue' },
                  ].map((item) => (
                    <div key={item.key} className="bg-white/5 p-8 rounded-[40px] border border-white/5 flex flex-col items-center">
                      <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/20 mb-6">{item.label}</span>
                      <div className="flex flex-col items-center gap-4">
                        <button 
                          onClick={() => setPomodoroSettings({ [item.key]: item.val + 1 })}
                          className="w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/40 hover:text-white"
                        ><Plus className="w-4 h-4" /></button>
                        <span className="text-4xl font-light text-white tabular-nums">{item.val}</span>
                        <button 
                          onClick={() => setPomodoroSettings({ [item.key]: Math.max(1, item.val - 1) })}
                          className="w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/40 hover:text-white"
                        ><Minus className="w-4 h-4" /></button>
                      </div>
                      <span className="text-[9px] text-white/20 uppercase tracking-widest mt-4">minutes</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'system' && (
               <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
                 <div className="bg-white/5 p-8 rounded-[40px] border border-white/5">
                   <h3 className="text-sm font-bold uppercase tracking-widest text-white/20 mb-8">Préférences du Dock</h3>
                   <div className="grid grid-cols-2 gap-12">
                     <div className="space-y-4">
                        <p className="text-xs font-bold text-white/60 ml-2">Position</p>
                        <div className="grid grid-cols-5 gap-2 p-2 bg-black/20 rounded-2xl">
                          {['left', 'top', 'right', 'bottom', 'center'].map((pos) => (
                            <button
                              key={pos}
                              onClick={() => setDockPosition(pos as any)}
                              className={cn(
                                "py-2 rounded-xl text-[10px] font-bold capitalize transition-all",
                                dockPosition === pos ? "bg-white/10 text-white shadow-lg" : "text-white/20 hover:text-white/40"
                              )}
                            >
                              {pos}
                            </button>
                          ))}
                        </div>
                     </div>
                     <div className="space-y-4">
                        <p className="text-xs font-bold text-white/60 ml-2">Taille des icônes</p>
                        <div className="grid grid-cols-3 gap-2 p-2 bg-black/20 rounded-2xl">
                          {['small', 'medium', 'large'].map((size) => (
                            <button
                              key={size}
                              onClick={() => setDockSize(size as any)}
                              className={cn(
                                "py-2 rounded-xl text-[10px] font-bold capitalize transition-all",
                                dockSize === size ? "bg-white/10 text-white shadow-lg" : "text-white/20 hover:text-white/40"
                              )}
                            >
                              {size}
                            </button>
                          ))}
                        </div>
                     </div>
                   </div>
                 </div>

                 <div className="bg-gradient-to-r from-gray-900 to-black p-8 rounded-[40px] border border-white/5 flex items-center justify-between">
                    <div className="flex items-center gap-6">
                      <div className="w-16 h-16 rounded-3xl bg-white/10 flex items-center justify-center">
                        <Github className="w-8 h-8 text-white" />
                      </div>
                      <div>
                        <h4 className="text-lg font-bold text-white">Hub Projet Open-Source</h4>
                        <p className="text-sm text-white/40">Contribuez à l'évolution de votre plateforme.</p>
                      </div>
                    </div>
                    <a href="https://github.com/La-Tva/hub" target="_blank" className="px-8 py-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-3xl text-xs font-bold text-white transition-all">
                      Inspecter le code
                    </a>
                 </div>
               </div>
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
