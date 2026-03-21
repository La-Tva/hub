import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface AppConfig {
  id: string;
  name: string;
  url?: string;
  icon: string;
  isInternal?: boolean;
  type?: 'app' | 'folder';
  folderApps?: AppConfig[];
}

interface SystemState {
  wallpaper: string;
  wallpaperHistory: string[];
  apps: AppConfig[];
  isSettingsOpen: boolean;
  isWallpaperPickerOpen: boolean;
  isAppPickerOpen: boolean;
  theme: 'dark' | 'light';
  showNotes: boolean;
  showWeather: boolean;
  showTimer: boolean;
  showClock: boolean;
  showCalculator: boolean;
  showClipboard: boolean;
  clipboardContent: string;
  notes: string;
  dockPosition: 'bottom' | 'top' | 'left' | 'right' | 'center';
  dockSize: 'small' | 'medium' | 'large';
  settingsSection: string | null;
  activeApp: string | null;
  isDashboardOpen: boolean;
  isFocusOverlayOpen: boolean;
  isLoading: boolean;
  pomodoroSettings: {
    work: number;
    shortBreak: number;
    longBreak: number;
  };
  pomodoroMode: 'work' | 'shortBreak' | 'longBreak';
  pomodoroTimeLeft: number;
  pomodoroIsRunning: boolean;
  pomodoroIsMinimized: boolean;
  weatherCity: string;
  isSpotifyActive: boolean;
  spotifyPlaylistId: string;
  activeFolderId: string | null;
  uploadStatus: 'idle' | 'uploading' | 'success' | 'error';
  uploadResultUrl: string | null;
  showDropZone: boolean;
  isGhostModeActive: boolean;
  isGhostModeLocked: boolean;
  ghostModePIN: string | null;
  calculatorSettings: {
    precision: number;
    soundEnabled: boolean;
    showHistory: boolean;
  };
  
  // Actions
  fetchData: () => Promise<void>;
  saveSettings: (settings: Partial<SystemState>) => Promise<void>; // Added saveSettings action
  setWallpaper: (url: string) => Promise<void>;
  deleteWallpaperFromHistory: (url: string) => Promise<void>;
  addApp: (app: Omit<AppConfig, 'id'>) => Promise<void>;
  removeApp: (id: string) => Promise<void>;
  updateApp: (id: string, app: Partial<AppConfig>) => Promise<void>;
  reorderApps: (newApps: AppConfig[]) => Promise<void>;
  createFolder: (name: string, appIds: string[]) => Promise<void>;
  addAppToFolder: (folderId: string, appId: string) => Promise<void>;
  removeAppFromFolder: (folderId: string, appId: string) => Promise<void>;
  renameFolder: (folderId: string, newName: string) => Promise<void>;
  setSettingsOpen: (isOpen: boolean, section?: string) => void;
  setWallpaperPickerOpen: (isOpen: boolean) => void;
  setAppPickerOpen: (isOpen: boolean) => void;
  toggleTheme: () => void;
  toggleNotes: () => void;
  toggleWeather: () => void;
  toggleTimer: () => void;
  toggleClock: () => void;
  toggleCalculator: () => void;
  toggleClipboard: () => void;
  setClipboardContent: (content: string) => Promise<void>;
  setNotes: (notes: string) => void;
  setDockPosition: (pos: 'bottom' | 'top' | 'left' | 'right' | 'center') => void;
  setDockSize: (size: 'small' | 'medium' | 'large') => void;
  setActiveApp: (id: string | null) => void;
  setDashboardOpen: (isOpen: boolean) => void;
  setFocusOverlayOpen: (isOpen: boolean) => void;
  setPomodoroSettings: (settings: Partial<SystemState['pomodoroSettings']>) => Promise<void>;
  setPomodoroMode: (mode: SystemState['pomodoroMode']) => void;
  setPomodoroTimeLeft: (time: number) => void;
  setPomodoroIsRunning: (isRunning: boolean) => void;
  setPomodoroMinimized: (isMinimized: boolean) => void;
  setWeatherCity: (city: string) => void;
  setSpotifyActive: (active: boolean) => void;
  setSpotifyPlaylistId: (id: string) => void;
  setActiveFolderId: (id: string | null) => void;
  setCalculatorSettings: (settings: Partial<SystemState['calculatorSettings']>) => void;
  contextMenu: {
    isOpen: boolean;
    x: number;
    y: number;
    items: ContextMenuItem[];
  };
  setContextMenu: (isOpen: boolean, x?: number, y?: number, items?: ContextMenuItem[]) => void;
  hideAllWidgets: () => void;
  showAllWidgets: () => void;
  setUploadStatus: (status: SystemState['uploadStatus']) => void;
  setUploadResultUrl: (url: string | null) => void;
  toggleDropZone: () => void;
  applyRemoteUpdate: (data: Partial<SystemState>) => void;
  setGhostModeActive: (active: boolean) => void;
  setGhostModeLocked: (locked: boolean) => void;
  setGhostModePIN: (pin: string | null) => Promise<void>;
}

export type ContextMenuItem = {
  label?: string;
  icon?: string;
  action?: () => void;
  separator?: boolean;
  submenu?: ContextMenuItem[];
  disabled?: boolean;
  danger?: boolean;
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
      showNotes: true,
      showWeather: true,
      showTimer: true,
      showClock: true,
      showCalculator: false,
      showClipboard: false,
      clipboardContent: '',
      isGhostModeActive: false,
      isGhostModeLocked: false,
      ghostModePIN: null,
      notes: '',
      dockPosition: 'bottom',
      dockSize: 'medium',
      settingsSection: null,
      activeApp: null,
      isDashboardOpen: false,
      isFocusOverlayOpen: false,
      isLoading: false,
      pomodoroSettings: { work: 25, shortBreak: 5, longBreak: 15 },
      pomodoroMode: 'work',
      pomodoroTimeLeft: 25 * 60,
      pomodoroIsRunning: false,
      pomodoroIsMinimized: false,
      weatherCity: 'Paris',
      isSpotifyActive: false,
      spotifyPlaylistId: '0vvXsWCC9xrXsKd4FyS8kM',
      activeFolderId: null,
      uploadStatus: 'idle',
      uploadResultUrl: null,
      showDropZone: true,
      calculatorSettings: {
        precision: 2,
        soundEnabled: true,
        showHistory: false
      },
      contextMenu: {
        isOpen: false,
        x: 0,
        y: 0,
        items: [],
      },

      // Generic function to save settings
      saveSettings: async (settings) => {
        try {
          await fetch('/api/settings', {
            method: 'PATCH',
            body: JSON.stringify(settings),
          });
        } catch (error) {
          console.error('Failed to sync settings:', error);
        }
      },

      fetchData: async () => {
        // Only show global loader on initial mount (blank apps)
        const isInitialLoad = get().apps.length === 0;
        if (isInitialLoad) set({ isLoading: true });
        
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
            if (settings.weatherCity) set({ weatherCity: settings.weatherCity });
            if (settings.pomodoroSettings) {
              set({ 
                pomodoroSettings: settings.pomodoroSettings,
                pomodoroTimeLeft: settings.pomodoroSettings.work * 60 
              });
            }
            if (settings.isSpotifyActive !== undefined) set({ isSpotifyActive: settings.isSpotifyActive });
            if (settings.spotifyPlaylistId) set({ spotifyPlaylistId: settings.spotifyPlaylistId });
            if (settings.calculatorSettings) set({ calculatorSettings: { ...get().calculatorSettings, ...settings.calculatorSettings } });
            if (settings.clipboardContent !== undefined) set({ clipboardContent: settings.clipboardContent });
            if (settings.showClipboard !== undefined) set({ showClipboard: settings.showClipboard });
          }
          if (appsRes.ok) {
            let savedApps = await appsRes.json();
            
            // Localize internal apps
            savedApps = savedApps.map((app: AppConfig) => {
              if (app.isInternal) {
                if (app.id === 'settings') return { ...app, name: 'Réglages' };
                if (app.id === 'finder') return { ...app, name: 'Explorateur' };
                if (app.id === 'calculator') return { ...app, name: 'Calculatrice' };
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
            
            // Calculator is now purely a widget (requested to remove from dock)
            const finalApps = mergedApps.filter(a => a.id !== 'calculator' && a.url !== 'calculator');
            set({ apps: finalApps });
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

      createFolder: async (name, appIds) => {
        const apps = get().apps;
        const selectedApps = apps.filter(a => appIds.includes(a.id));
        const remainingApps = apps.filter(a => !appIds.includes(a.id));
        
        const folder: AppConfig = {
          id: Math.random().toString(36).substring(7),
          name,
          icon: 'Folder',
          type: 'folder',
          folderApps: selectedApps
        };
        
        const nextApps = [...remainingApps, folder];
        set({ apps: nextApps });
        
        try {
          await fetch('/api/apps', {
            method: 'PUT',
            body: JSON.stringify(nextApps),
          });
        } catch (error) {
          console.error('Failed to sync folder creation:', error);
        }
      },

      addAppToFolder: async (folderId, appId) => {
        const apps = get().apps;
        const appToMove = apps.find(a => a.id === appId);
        if (!appToMove) return;

        const nextApps = apps.map(app => {
          if (app.id === folderId && app.type === 'folder') {
            return {
              ...app,
              folderApps: [...(app.folderApps || []), appToMove]
            };
          }
          return app;
        }).filter(a => a.id !== appId);

        set({ apps: nextApps });
        
        try {
          await fetch('/api/apps', {
            method: 'PUT',
            body: JSON.stringify(nextApps),
          });
        } catch (error) {
          console.error('Failed to sync app move to folder:', error);
        }
      },

      removeAppFromFolder: async (folderId, appId) => {
        const apps = get().apps;
        let appToRestore: AppConfig | undefined;

        const nextApps = apps.map(app => {
          if (app.id === folderId && app.type === 'folder') {
            appToRestore = app.folderApps?.find(a => a.id === appId);
            return {
              ...app,
              folderApps: app.folderApps?.filter(a => a.id !== appId) || []
            };
          }
          return app;
        });

        if (appToRestore) {
          nextApps.push(appToRestore);
        }

        set({ apps: nextApps });
        
        try {
          await fetch('/api/apps', {
            method: 'PUT',
            body: JSON.stringify(nextApps),
          });
        } catch (error) {
          console.error('Failed to sync app removal from folder:', error);
        }
      },

      renameFolder: async (folderId, newName) => {
        const apps = get().apps;
        const nextApps = apps.map(app => {
          if (app.id === folderId && app.type === 'folder') {
            return { ...app, name: newName };
          }
          return app;
        });

        set({ apps: nextApps });
        
        try {
          await fetch('/api/apps', {
            method: 'PUT',
            body: JSON.stringify(nextApps),
          });
        } catch (error) {
          console.error('Failed to sync folder rename:', error);
        }
      },
 
      setSettingsOpen: (isOpen, section) => set({ isSettingsOpen: isOpen, settingsSection: section || null }),
      setWallpaperPickerOpen: (isOpen) => set({ isWallpaperPickerOpen: isOpen }),
      setAppPickerOpen: (isOpen) => set({ isAppPickerOpen: isOpen }),
      toggleTheme: () => set((state) => ({ theme: state.theme === 'dark' ? 'light' : 'dark' })),
      toggleNotes: () => set((state) => ({ showNotes: !state.showNotes })),
      toggleWeather: () => set((state) => ({ showWeather: !state.showWeather })),
      toggleTimer: () => set((state) => ({ showTimer: !state.showTimer })),
      toggleClock: () => set((state) => ({ showClock: !state.showClock })),
      toggleCalculator: () => {
        const newState = !get().showCalculator;
        set({ showCalculator: newState });
        get().saveSettings({ showCalculator: newState });
      },
      toggleClipboard: () => {
        const newState = !get().showClipboard;
        set({ showClipboard: newState });
        get().saveSettings({ showClipboard: newState });
      },
      toggleDropZone: () => {
        const newState = !get().showDropZone;
        set({ showDropZone: newState });
        get().saveSettings({ showDropZone: newState });
      },
      setClipboardContent: async (content) => {
        set({ clipboardContent: content });
        await get().saveSettings({ clipboardContent: content });
      },

      hideAllWidgets: () => {
        const update = {
          showClock: false, showNotes: false, showWeather: false,
          showTimer: false, showCalculator: false, showClipboard: false,
          isSpotifyActive: false, showDropZone: false
        };
        set(update);
        get().saveSettings(update);
      },

      showAllWidgets: () => {
        const update = {
          showClock: true, showNotes: true, showWeather: true,
          showTimer: true, showCalculator: true, showClipboard: true,
          isSpotifyActive: true, showDropZone: true
        };
        set(update);
        get().saveSettings(update);
      },
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
      setDashboardOpen: (isOpen) => set({ 
        isDashboardOpen: isOpen,
        isWallpaperPickerOpen: false,
        isAppPickerOpen: false
      }),
      setFocusOverlayOpen: (isOpen) => set({ isFocusOverlayOpen: isOpen }),
      setPomodoroSettings: async (settings) => {
        const newSettings = { ...get().pomodoroSettings, ...settings };
        set({ pomodoroSettings: newSettings });
        
        // Update time left if we change the setting for the current mode
        const mode = get().pomodoroMode;
        if (mode === 'work' && settings.work) set({ pomodoroTimeLeft: settings.work * 60 });
        if (mode === 'shortBreak' && settings.shortBreak) set({ pomodoroTimeLeft: settings.shortBreak * 60 });
        if (mode === 'longBreak' && settings.longBreak) set({ pomodoroTimeLeft: settings.longBreak * 60 });

        try {
          await fetch('/api/settings', {
            method: 'PATCH',
            body: JSON.stringify({ pomodoroSettings: newSettings }),
          });
        } catch (error) {
          console.error('Failed to sync pomodoro settings:', error);
        }
      },
      setPomodoroMode: (mode) => {
        const settings = get().pomodoroSettings;
        let time = settings.work * 60;
        if (mode === 'shortBreak') time = settings.shortBreak * 60;
        if (mode === 'longBreak') time = settings.longBreak * 60;
        set({ pomodoroMode: mode, pomodoroTimeLeft: time, pomodoroIsRunning: false });
      },
      setPomodoroTimeLeft: (time) => set({ pomodoroTimeLeft: time }),
      setPomodoroIsRunning: (isRunning) => set({ pomodoroIsRunning: isRunning }),
      setPomodoroMinimized: (isMinimized) => set({ pomodoroIsMinimized: isMinimized }),
      setWeatherCity: (city) => {
        set({ weatherCity: city });
        // Sync with API
        fetch('/api/settings', {
          method: 'PATCH',
          body: JSON.stringify({ weatherCity: city }),
        }).catch(err => console.error('Failed to sync city:', err));
      },
      setContextMenu: (isOpen, x, y, items) => set({ 
        contextMenu: { 
          isOpen, 
          x: x || 0, 
          y: y || 0, 
          items: items || [] 
        } 
      }),
      setSpotifyActive: (active) => {
        set({ isSpotifyActive: active });
        fetch('/api/settings', {
          method: 'PATCH',
          body: JSON.stringify({ isSpotifyActive: active }),
        }).catch(err => console.error('Failed to sync spotify active:', err));
      },
      setSpotifyPlaylistId: (id) => {
        set({ spotifyPlaylistId: id });
        fetch('/api/settings', {
          method: 'PATCH',
          body: JSON.stringify({ spotifyPlaylistId: id }),
        }).catch(err => console.error('Failed to sync spotify id:', err));
      },
      setActiveFolderId: (id) => set({ activeFolderId: id }),
      setCalculatorSettings: (settings) => {
        const newSettings = { ...get().calculatorSettings, ...settings };
        set({ calculatorSettings: newSettings });
        fetch('/api/settings', {
          method: 'PATCH',
          body: JSON.stringify({ calculatorSettings: newSettings }),
        }).catch(err => console.error('Failed to sync cal settings:', err));
      },
      setUploadStatus: (status) => set({ uploadStatus: status }),
      setUploadResultUrl: (url) => set({ uploadResultUrl: url }),
      applyRemoteUpdate: (data) => {
        // Apply updates silently (no saveSettings call here)
        set((state) => ({ ...state, ...data }));
      },
      setGhostModeActive: (active) => set({ isGhostModeActive: active }),
      setGhostModeLocked: (locked) => set({ isGhostModeLocked: locked }),
      setGhostModePIN: async (pin) => {
        set({ ghostModePIN: pin });
        await get().saveSettings({ ghostModePIN: pin });
      },
    }),
    {
      name: 'system-storage',
      partialize: (state) => ({
        // Persist wallpaper for login screen and non-db UI state
        wallpaper: state.wallpaper,
        wallpaperHistory: state.wallpaperHistory,
        isSettingsOpen: state.isSettingsOpen,
        theme: state.theme,
        showNotes: state.showNotes,
        showWeather: state.showWeather,
        showTimer: state.showTimer,
        showClock: state.showClock,
        showCalculator: state.showCalculator,
        notes: state.notes,
        dockPosition: state.dockPosition,
        dockSize: state.dockSize,
        activeApp: state.activeApp,
        weatherCity: state.weatherCity,
        isSpotifyActive: state.isSpotifyActive,
        spotifyPlaylistId: state.spotifyPlaylistId,
        calculatorSettings: state.calculatorSettings,
        showDropZone: state.showDropZone,
        ghostModePIN: state.ghostModePIN,
        isGhostModeActive: state.isGhostModeActive,
        isGhostModeLocked: state.isGhostModeLocked,
      }),
    }
  )
);
