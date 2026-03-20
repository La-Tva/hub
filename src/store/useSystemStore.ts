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
  activeApp: string | null;
  isLoading: boolean;
  
  // Actions
  fetchData: () => Promise<void>;
  setWallpaper: (url: string) => Promise<void>;
  deleteWallpaperFromHistory: (url: string) => Promise<void>;
  addApp: (app: AppConfig) => Promise<void>;
  removeApp: (id: string) => Promise<void>;
  updateApp: (id: string, app: Partial<AppConfig>) => Promise<void>;
  setSettingsOpen: (isOpen: boolean) => void;
  setActiveApp: (id: string | null) => void;
}

const DEFAULT_APPS: AppConfig[] = [];

export const useSystemStore = create<SystemState>()(
  persist(
    (set, get) => ({
      wallpaper: 'https://images.unsplash.com/photo-1614850523296-d861d993c9ef?q=80&w=2070&auto=format&fit=crop',
      wallpaperHistory: [],
      apps: DEFAULT_APPS,
      isSettingsOpen: false,
      activeApp: null,
      isLoading: false,

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

      addApp: async (app) => {
        set((state) => ({ apps: [...state.apps, app] }));
        try {
          await fetch('/api/apps', {
            method: 'POST',
            body: JSON.stringify(app),
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

      setSettingsOpen: (isOpen) => set({ isSettingsOpen: isOpen }),
      setActiveApp: (id) => set({ activeApp: id }),
    }),
    {
      name: 'system-storage',
      partialize: (state) => ({
        // Persist wallpaper for login screen and non-db UI state
        wallpaper: state.wallpaper,
        wallpaperHistory: state.wallpaperHistory,
        isSettingsOpen: state.isSettingsOpen,
        activeApp: state.activeApp,
      }),
    }
  )
);
