'use client';

import React, { useState } from 'react';
import { useSystemStore, AppConfig } from '@/store/useSystemStore';
import { Plus, Trash2, X, Globe, Link as LinkIcon, Image as ImageIcon, LogOut, Settings } from 'lucide-react';
import { signOut } from 'next-auth/react';
import { motion } from 'framer-motion';

export default function SettingsModal() {
  const { wallpaper, setWallpaper, wallpaperHistory, deleteWallpaperFromHistory, apps, addApp, removeApp, setSettingsOpen } = useSystemStore();
  const [newAppName, setNewAppName] = useState('');
  const [newAppUrl, setNewAppUrl] = useState('');
  const [newAppIcon, setNewAppIcon] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editUrl, setEditUrl] = useState('');
  const [editIcon, setEditIcon] = useState('');

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'wallpaper' | 'icon' | 'edit-icon') => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (data.success) {
        if (type === 'wallpaper') {
          setWallpaper(data.url);
        } else if (type === 'icon') {
          setNewAppIcon(data.url);
        } else if (type === 'edit-icon') {
          setEditIcon(data.url);
        }
      }
    } catch (error) {
      console.error('Upload failed:', error);
    } finally {
      setIsUploading(false);
    }
  };

  const startEditing = (app: AppConfig) => {
    setEditingId(app.id);
    setEditName(app.name);
    setEditUrl(app.url);
    setEditIcon(app.icon);
  };

  const { updateApp } = useSystemStore();
  const handleUpdateApp = (id: string) => {
    updateApp(id, {
      name: editName,
      url: editUrl,
      icon: editIcon,
    });
    setEditingId(null);
  };

  const handleAddApp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAppName || !newAppUrl) return;
    
    addApp({
      id: Math.random().toString(36).substr(2, 9),
      name: newAppName,
      url: newAppUrl.startsWith('http') ? newAppUrl : `https://${newAppUrl}`,
      icon: newAppIcon || 'https://img.icons8.com/isometric/512/empty-box.png',
    });
    
    setNewAppName('');
    setNewAppUrl('');
    setNewAppIcon('');
  };

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Header (Close button is in Desktop.tsx/Modal Frame) */}
      <div className="flex items-center gap-4 mb-8 pl-10">
        <h2 className="text-2xl font-semibold text-white tracking-tight">Préférences Système</h2>
      </div>

      <div className="flex-1 overflow-y-auto space-y-6 pr-2 custom-scrollbar pb-10">
        
        {/* Appearance Section */}
        <div className="bg-black/40 border border-white/5 rounded-3xl p-6 backdrop-blur-md">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400">
              <ImageIcon className="w-4 h-4" />
            </div>
            <span className="text-sm font-semibold text-white/90 uppercase tracking-widest text-[10px]">Apparence</span>
          </div>

          <div className="space-y-6">
            <div className="space-y-3">
              <span className="text-[10px] font-bold text-white/30 uppercase tracking-[0.2em] ml-1">Fond d'écran</span>
              <div className="flex gap-2">
                <input 
                  type="text" 
                  value={wallpaper}
                  onChange={(e) => setWallpaper(e.target.value)}
                  className="flex-1 bg-[#1a1a1a]/80 border border-white/5 rounded-xl px-4 py-3 text-sm text-white focus:border-blue-500/50 outline-none transition-all"
                  placeholder="URL du contenu..."
                />
                <label className="cursor-pointer bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl px-4 py-3 text-sm text-white transition-all flex items-center gap-2 whitespace-nowrap">
                  <Plus className="w-4 h-4" />
                  <span>{isUploading ? '...' : 'Charger'}</span>
                  <input type="file" className="hidden" onChange={(e) => handleFileUpload(e, 'wallpaper')} accept="image/*,video/mp4" />
                </label>
              </div>
            </div>

            <div className="space-y-3">
              <span className="text-[10px] font-bold text-white/30 uppercase tracking-[0.2em] ml-1">Fonds d'écran récents</span>
              <div className="grid grid-cols-4 gap-3">
                {wallpaperHistory.map((url, idx) => (
                  <div key={idx} className="group relative aspect-video rounded-xl overflow-hidden border border-white/5 hover:border-white/20 transition-all bg-black/50">
                    <button 
                      onClick={() => setWallpaper(url)}
                      className="w-full h-full"
                    >
                      <img src={url} className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-opacity" alt="Past wallpaper" />
                    </button>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteWallpaperFromHistory(url);
                      }}
                      className="absolute top-1 right-1 p-1 rounded-lg bg-black/60 text-white/40 opacity-0 group-hover:opacity-100 hover:text-red-400 hover:bg-black transition-all"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
                {wallpaperHistory.length === 0 && (
                  <div className="col-span-4 py-8 flex flex-col items-center justify-center border border-dashed border-white/5 rounded-2xl bg-white/[0.02]">
                    <ImageIcon className="w-6 h-6 text-white/10 mb-2" />
                    <span className="text-[10px] text-white/20 uppercase tracking-widest">Aucun historique</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Dock Apps Section */}
        <div className="bg-black/40 border border-white/5 rounded-3xl p-6 backdrop-blur-md">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 rounded-xl bg-green-500/10 text-green-400">
              <Globe className="w-4 h-4" />
            </div>
            <span className="text-sm font-semibold text-white/90 uppercase tracking-widest text-[10px]">Applications du Dock</span>
          </div>
          
          <form onSubmit={handleAddApp} className="space-y-4 mb-8">
            <div className="flex gap-4">
              <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center p-2 border border-dashed border-white/20 relative group/newicon overflow-hidden">
                {newAppIcon ? (
                  <img src={newAppIcon} className="w-full h-full object-contain" alt="Preview" />
                ) : (
                  <ImageIcon className="w-6 h-6 text-white/10" />
                )}
                <label className="absolute inset-0 bg-black/60 opacity-0 group-hover/newicon:opacity-100 flex items-center justify-center cursor-pointer transition-opacity">
                  <Plus className="w-4 h-4 text-white" />
                  <input type="file" className="hidden" onChange={(e) => handleFileUpload(e, 'icon')} accept="image/*" />
                </label>
              </div>
              <div className="flex-1 space-y-2">
                <input 
                  type="text" 
                  placeholder="Nom de l'application" 
                  value={newAppName}
                  onChange={(e) => setNewAppName(e.target.value)}
                  className="w-full bg-[#1a1a1a]/80 border border-white/5 rounded-xl px-4 py-2.5 text-sm text-white focus:border-green-500/30 outline-none transition-all"
                />
                <input 
                  type="text" 
                  placeholder="Domaine (ex: google.com)" 
                  value={newAppUrl}
                  onChange={(e) => setNewAppUrl(e.target.value)}
                  className="w-full bg-[#1a1a1a]/80 border border-white/5 rounded-xl px-4 py-2.5 text-sm text-white focus:border-green-500/30 outline-none transition-all"
                />
              </div>
            </div>
            
            <div className="flex gap-2">
              <input 
                type="text" 
                placeholder="URL de l'icône (ou glissez/déposez)" 
                value={newAppIcon}
                onChange={(e) => setNewAppIcon(e.target.value)}
                className="flex-1 bg-[#1a1a1a]/80 border border-white/5 rounded-xl px-4 py-3 text-xs text-white/50 focus:border-green-500/30 outline-none transition-all"
              />
              <button 
                type="submit"
                className="bg-green-500 hover:bg-green-600 text-white rounded-xl px-6 text-xs font-bold uppercase tracking-widest transition-all h-[46px] shadow-[0_0_20px_rgba(34,197,94,0.3)] hover:shadow-[0_0_25px_rgba(34,197,94,0.4)]"
              >
                Ajouter
              </button>
            </div>
          </form>

          <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
            {apps.map((app) => (
              <div key={app.id} className="group relative bg-black/20 p-4 rounded-2xl border border-white/5 hover:border-white/10 transition-all">
                {editingId === app.id ? (
                  <div className="space-y-4">
                    <div className="flex gap-4">
                      <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center p-2 border border-white/10 relative group/editicon overflow-hidden">
                        <img src={editIcon || app.icon} className="w-full h-full object-contain" alt="Preview" />
                        <label className="absolute inset-0 bg-black/60 opacity-0 group-hover/editicon:opacity-100 flex items-center justify-center cursor-pointer transition-opacity">
                          <Plus className="w-4 h-4 text-white" />
                          <input type="file" className="hidden" onChange={(e) => handleFileUpload(e, 'edit-icon')} accept="image/*" />
                        </label>
                      </div>
                      <div className="flex-1 space-y-2">
                        <input 
                          type="text" 
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          placeholder="Nom de l'app"
                          className="w-full bg-[#1a1a1a]/80 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white outline-none focus:border-green-500/30 transition-all font-semibold"
                        />
                        <input 
                          type="text" 
                          value={editUrl}
                          onChange={(e) => setEditUrl(e.target.value)}
                          placeholder="URL / Domaine"
                          className="w-full bg-[#1a1a1a]/80 border border-white/10 rounded-xl px-4 py-2 text-[10px] text-white/50 outline-none focus:border-green-500/30 transition-all"
                        />
                      </div>
                    </div>
                    <div className="flex gap-2">
                       <input 
                          type="text" 
                          value={editIcon}
                          onChange={(e) => setEditIcon(e.target.value)}
                          placeholder="URL de l'icône"
                          className="flex-1 bg-[#1a1a1a]/80 border border-white/10 rounded-xl px-4 py-3 text-[10px] text-white/40 outline-none focus:border-green-500/30 transition-all"
                        />
                        <button 
                          onClick={() => handleUpdateApp(app.id)}
                          className="bg-green-500/20 hover:bg-green-500/30 text-green-400 border border-green-500/20 rounded-xl px-4 text-[10px] font-bold uppercase tracking-wider transition-all h-[42px]"
                        >
                          Sauvegarder
                        </button>
                    </div>
                    <div className="flex justify-end pt-1">
                      <button 
                        onClick={() => setEditingId(null)}
                        className="text-[10px] font-bold uppercase tracking-wider text-white/20 hover:text-white/40 transition-colors"
                      >
                        Annuler
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center p-2 overflow-hidden border border-white/5 shadow-inner">
                        <img src={app.icon} className="w-full h-full object-contain" alt={app.name} />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-white/90">{app.name}</p>
                        <p className="text-[10px] font-medium text-white/20 tracking-wider truncate max-w-[150px]">{app.url}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <button 
                        onClick={() => startEditing(app)}
                        className="p-2 text-white/30 hover:text-white transition-colors"
                        title="Modifier"
                      >
                        <Settings className="w-4 h-4" />
                      </button>
                      {!app.isInternal && (
                        <button 
                          onClick={() => removeApp(app.id)}
                          className="p-2 text-red-500/50 hover:text-red-500 transition-colors"
                          title="Supprimer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Danger Zone / Session */}
        <div className="pt-4 border-t border-white/5">
          <button 
            onClick={() => signOut({ callbackUrl: '/' })}
            className="w-full group flex items-center justify-center gap-3 py-4 rounded-2xl bg-red-500/5 hover:bg-red-500/10 border border-red-500/10 transition-all"
          >
            <LogOut className="w-4 h-4 text-red-400 group-hover:translate-x-1 transition-transform" />
            <span className="text-xs font-bold text-red-400 uppercase tracking-[0.2em]">Déconnexion</span>
          </button>
        </div>
      </div>
    </div>
  );
}
