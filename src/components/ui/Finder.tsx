'use client';

import React from 'react';
import { Folder, File, Search, ChevronRight, HardDrive } from 'lucide-react';

export default function Finder() {
  const folders = [
    { name: 'Applications', icon: <Folder className="w-4 h-4 text-blue-400 fill-blue-400/20" /> },
    { name: 'Documents', icon: <Folder className="w-4 h-4 text-blue-400 fill-blue-400/20" /> },
    { name: 'Bureau', icon: <Folder className="w-4 h-4 text-blue-400 fill-blue-400/20" /> },
    { name: 'Téléchargements', icon: <Folder className="w-4 h-4 text-blue-400 fill-blue-400/20" /> },
    { name: 'Images', icon: <Folder className="w-4 h-4 text-blue-400 fill-blue-400/20" /> },
  ];

  const files = [
    { name: 'Project_Hub.zip', size: '1.2 GB', type: 'Archive' },
    { name: 'Resume.pdf', size: '245 KB', type: 'PDF Document' },
    { name: 'Vacation.jpg', size: '4.5 MB', type: 'JPEG Image' },
    { name: 'Meeting_Notes.txt', size: '12 KB', type: 'Text Document' },
  ];

  return (
    <div className="flex h-full text-white/90">
      {/* Sidebar */}
      <div className="w-48 bg-black/20 backdrop-blur-md p-4 border-r border-white/5">
        <div className="mb-6">
          <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest mb-3 px-2">Favoris</p>
          <div className="space-y-1">
            {folders.map((f) => (
              <div key={f.name} className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-white/10 cursor-pointer group transition-colors">
                {f.icon}
                <span className="text-sm">{f.name}</span>
              </div>
            ))}
          </div>
        </div>
        <div>
          <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest mb-3 px-2">Emplacements</p>
          <div className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-white/10 cursor-pointer group transition-colors">
            <HardDrive className="w-4 h-4 text-white/40" />
            <span className="text-sm">Disque Interne</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Toolbar */}
        <div className="h-12 border-b border-white/5 flex items-center justify-between px-4">
          <div className="flex items-center gap-4 text-white/40">
            <div className="flex items-center gap-1">
              <ChevronRight className="w-4 h-4 rotate-180" />
              <ChevronRight className="w-4 h-4" />
            </div>
            <span className="text-sm font-medium text-white/80">Documents</span>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/20" />
            <input 
              type="text" 
              placeholder="Rechercher" 
              className="bg-white/5 border border-white/5 rounded-md pl-9 pr-3 py-1 text-xs outline-none focus:border-white/20 transition-all w-48"
            />
          </div>
        </div>

        {/* Grid View */}
        <div className="p-6 grid grid-cols-4 gap-6 overflow-y-auto">
          {files.map((file) => (
            <div key={file.name} className="flex flex-col items-center gap-2 group cursor-pointer">
              <div className="w-16 h-16 bg-white/5 rounded-xl flex items-center justify-center border border-white/5 group-hover:bg-white/10 group-hover:border-white/20 transition-all shadow-lg">
                <File className="w-8 h-8 text-blue-400/60" />
              </div>
              <p className="text-xs text-center font-medium truncate w-full px-2">{file.name}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
