'use client';

import React, { useState } from 'react';
import { StickyNote, Plus } from 'lucide-react';
import { motion } from 'framer-motion';

export default function NotesWidget() {
  const [note, setNote] = useState('Construire le futur du Web OS...');

  return (
    <motion.div 
      drag
      dragConstraints={{ left: -500, right: 500, top: -500, bottom: 500 }}
      whileHover={{ scale: 1.02 }}
      className="bg-yellow-200/90 backdrop-blur-md p-6 rounded-[32px] w-64 h-64 shadow-2xl border border-yellow-300/20 cursor-grab active:cursor-grabbing flex flex-col"
    >
      <div className="flex items-center gap-2 mb-4 text-yellow-900/40">
        <StickyNote className="w-4 h-4" />
        <span className="text-[10px] font-bold uppercase tracking-widest">Note Rapide</span>
      </div>
      <textarea 
        value={note}
        onChange={(e) => setNote(e.target.value)}
        className="flex-1 bg-transparent text-yellow-900 font-medium text-lg outline-none resize-none placeholder:text-yellow-900/20"
        placeholder="Écrivez quelque chose..."
      />
      <div className="flex justify-end mt-2">
        <button className="w-8 h-8 rounded-full bg-yellow-900/10 flex items-center justify-center hover:bg-yellow-900/20 transition-colors">
          <Plus className="w-4 h-4 text-yellow-900" />
        </button>
      </div>
    </motion.div>
  );
}
