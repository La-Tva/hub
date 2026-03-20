import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface AppConfig {
  id: string;
  name: string;
  url: string;
  icon: string;
  isInternal?: boolean;
}

interface SystemState {
  wallpaper: string;
  wallpaperHistory: string[];
  apps: AppConfig[];
  isSettingsOpen: boolean;
  isWallpaperPickerOpen: boolean;
  isAppPickerOpen: boolean;
  theme: 'dark' | 'light';
  showWidgets: boolean;
  notes: string;
  dockPosition: 'bottom' | 'top' | 'left' | 'right' | 'center';
  dockSize: 'small' | 'medium' | 'large';
  settingsSection: string | null;
  activeApp: string | null;
  isLoading: boolean;
  
  // Actions
  fetchData: () => Promise<void>;
  setWallpaper: (url: string) => Promise<void>;
  deleteWallpaperFromHistory: (url: string) => Promise<void>;
  addApp: (app: Omit<AppConfig, 'id'>) => Promise<void>;
  removeApp: (id: string) => Promise<void>;
  updateApp: (id: string, app: Partial<AppConfig>) => Promise<void>;
  reorderApps: (newApps: AppConfig[]) => Promise<void>;
  setSettingsOpen: (isOpen: boolean, section?: string) => void;
  setWallpaperPickerOpen: (isOpen: boolean) => void;
  setAppPickerOpen: (isOpen: boolean) => void;
  toggleTheme: () => void;
  toggleWidgets: () => void;
  setNotes: (notes: string) => void;
  setDockPosition: (pos: 'bottom' | 'top' | 'left' | 'right' | 'center') => void;
  setDockSize: (size: 'small' | 'medium' | 'large') => void;
  setActiveApp: (id: string | null) => void;
  contextMenu: {
    isOpen: boolean;
    x: number;
    y: number;
    items: ContextMenuItem[];
  };
  setContextMenu: (isOpen: boolean, x?: number, y?: number, items?: ContextMenuItem[]) => void;
}

export type ContextMenuItem = {
  label?: string;
  icon?: string;
  action?: () => void;
  separator?: boolean;
  submenu?: ContextMenuItem[];
};

const DEFAULT_APPS: AppConfig[] = [];

export const useSystemStore = create<SystemState>()(
  persist(
    (set, get) => ({
      wallpaper: 'https://images.unsplash.com/photo-1614850523296-d861d993c9ef?q=80&w=2070&auto=format&fit=crop',
      wallpaperHistory: [],
      apps: DEFAULT_APPS,
      isSettingsOpen: false,
      isWallpaperPickerOpen: false,
      isAppPickerOpen: false,
      theme: 'dark',
      showWidgets: true,
      notes: '',
      dockPosition: 'bottom',
      dockSize: 'medium',
      settingsSection: null,
      activeApp: null,
      isLoading: false,
      contextMenu: {
        isOpen: false,
        x: 0,
        y: 0,
        items: [],
      },

      fetchData: async () => {
        set({ isLoading: true });
        try {
          const [settingsRes, appsRes] = await Promise.all([
            fetch('/api/settings'),
            fetch('/api/apps')
          ]);
          if (settingsRes.ok) {
            const settings = await settingsRes.json();
            if (settings.wallpaper) set({ wallpaper: settings.wallpaper });
            if (settings.wallpaperHistory) set({ wallpaperHistory: settings.wallpaperHistory });
            if (settings.notes !== undefined) set({ notes: settings.notes });
            if (settings.theme) set({ theme: settings.theme });
          }
          if (appsRes.ok) {
            let savedApps = await appsRes.json();
            
            // Localize internal apps
            savedApps = savedApps.map((app: AppConfig) => {
              if (app.isInternal) {
                if (app.id === 'settings') return { ...app, name: 'Réglages' };
                if (app.id === 'finder') return { ...app, name: 'Explorateur' };
              }
              return app;
            });

            // Merge default apps with saved apps, avoiding duplicates
            const mergedApps = [...DEFAULT_APPS];
            savedApps.forEach((savedApp: AppConfig) => {
              if (!mergedApps.some(a => a.id === savedApp.id)) {
                mergedApps.push(savedApp);
              }
            });
            set({ apps: mergedApps });
          }
        } catch (error) {
          console.error('Failed to fetch data:', error);
        } finally {
          set({ isLoading: false });
        }
      },

      setWallpaper: async (url) => {
        const currentHistory = get().wallpaperHistory;
        const newHistory = currentHistory.includes(url) 
          ? currentHistory 
          : [url, ...currentHistory].slice(0, 12); // Keep last 12
          
        set({ wallpaper: url, wallpaperHistory: newHistory });
        try {
          await fetch('/api/settings', {
            method: 'PATCH',
            body: JSON.stringify({ wallpaper: url }),
          });
        } catch (error) {
          console.error('Failed to sync wallpaper:', error);
        }
      },

      deleteWallpaperFromHistory: async (url) => {
        const newHistory = get().wallpaperHistory.filter(w => w !== url);
        set({ wallpaperHistory: newHistory });
        try {
          await fetch('/api/settings', {
            method: 'DELETE',
            body: JSON.stringify({ wallpaper: url }), // We need to handle DELETE in API too
          });
        } catch (error) {
          console.error('Failed to delete wallpaper from history:', error);
        }
      },

      addApp: async (appData) => {
        const id = Math.random().toString(36).substring(7);
        const newApp = { ...appData, id };
        set((state) => ({ apps: [...state.apps, newApp] }));
        try {
          await fetch('/api/apps', {
            method: 'POST',
            body: JSON.stringify(newApp),
          });
        } catch (error) {
          console.error('Failed to sync app:', error);
        }
      },

      removeApp: async (id) => {
        set((state) => ({ apps: state.apps.filter((a) => a.id !== id) }));
        try {
          await fetch('/api/apps', {
            method: 'DELETE',
            body: JSON.stringify({ id }),
          });
        } catch (error) {
          console.error('Failed to delete app:', error);
        }
      },

      updateApp: async (id, updatedFields) => {
        set((state) => ({
          apps: state.apps.map((a) => a.id === id ? { ...a, ...updatedFields } : a)
        }));
        try {
          await fetch('/api/apps', {
            method: 'PATCH',
            body: JSON.stringify({ id, ...updatedFields }),
          });
        } catch (error) {
          console.error('Failed to sync app update:', error);
        }
      },
      
      reorderApps: async (newApps) => {
        set({ apps: newApps });
        
        // Debounce sync
        const timeoutId = (globalThis as any)._reorderTimeout;
        if (timeoutId) clearTimeout(timeoutId);
        
        (globalThis as any)._reorderTimeout = setTimeout(async () => {
          try {
            await fetch('/api/apps', {
              method: 'PUT',
              body: JSON.stringify(newApps),
            });
          } catch (error) {
            console.error('Failed to sync app reordering:', error);
          }
        }, 1000); // 1s debounce
      },
 
      setSettingsOpen: (isOpen, section) => set({ isSettingsOpen: isOpen, settingsSection: section || null }),
      setWallpaperPickerOpen: (isOpen) => set({ isWallpaperPickerOpen: isOpen }),
      setAppPickerOpen: (isOpen) => set({ isAppPickerOpen: isOpen }),
      toggleTheme: () => set((state) => ({ theme: state.theme === 'dark' ? 'light' : 'dark' })),
      toggleWidgets: () => set((state) => ({ showWidgets: !state.showWidgets })),
      setNotes: (notes) => {
        set({ notes });
        
        // Debounce sync
        const timeoutId = (globalThis as any)._notesTimeout;
        if (timeoutId) clearTimeout(timeoutId);
        
        (globalThis as any)._notesTimeout = setTimeout(async () => {
          try {
            await fetch('/api/settings', {
              method: 'PATCH',
              body: JSON.stringify({ notes }),
            });
          } catch (error) {
            console.error('Failed to sync notes:', error);
          }
        }, 1000); // 1s debounce
      },
      setDockPosition: (pos) => set({ dockPosition: pos }),
      setDockSize: (size) => set({ dockSize: size }),
      setActiveApp: (id) => set({ activeApp: id }),
      setContextMenu: (isOpen, x, y, items) => set({ 
        contextMenu: { 
          isOpen, 
          x: x || 0, 
          y: y || 0, 
          items: items || [] 
        } 
      }),
    }),
    {
      name: 'system-storage',
      partialize: (state) => ({
        // Persist wallpaper for login screen and non-db UI state
        wallpaper: state.wallpaper,
        wallpaperHistory: state.wallpaperHistory,
        isSettingsOpen: state.isSettingsOpen,
        theme: state.theme,
        showWidgets: state.showWidgets,
        notes: state.notes,
        dockPosition: state.dockPosition,
        dockSize: state.dockSize,
        activeApp: state.activeApp,
      }),
    }
  )
);
