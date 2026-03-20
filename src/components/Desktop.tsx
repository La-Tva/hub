'use client';

import React from 'react';
import { useSystemStore } from '@/store/useSystemStore';
import Clock from './ui/Clock';
import Dock from './ui/Dock';
import SettingsModal from './ui/SettingsModal';
import Finder from './ui/Finder';
import WeatherWidget from './ui/WeatherWidget';
import NotesWidget from './ui/NotesWidget';
import { motion, AnimatePresence } from 'framer-motion';

import { useSession, signIn, signOut } from 'next-auth/react';
import { LogIn, Loader2, LogOut, Plus, Settings } from 'lucide-react';

export default function Desktop() {
  const { wallpaper, isSettingsOpen, setSettingsOpen, activeApp, setActiveApp, fetchData, isLoading } = useSystemStore();
  const { data: session, status } = useSession();
  
  const [loginName, setLoginName] = React.useState('');
  const [loginPassword, setLoginPassword] = React.useState('');
  const [isLoggingIn, setIsLoggingIn] = React.useState(false);
  const [showNameInput, setShowNameInput] = React.useState(false);
  const [authorizedUsers, setAuthorizedUsers] = React.useState<string[]>([]);
  const [selectedUser, setSelectedUser] = React.useState<string | null>(null);
  const [loginError, setLoginError] = React.useState<string | null>(null);

  // Load users from localStorage
  React.useEffect(() => {
    const saved = localStorage.getItem('hub_authorized_users');
    if (saved) {
      const userList = JSON.parse(saved);
      setAuthorizedUsers(userList);
      if (userList.length === 1) {
        setSelectedUser(userList[0]);
        setLoginName(userList[0]);
      }
    } else {
      setShowNameInput(true);
    }
  }, []);

  React.useEffect(() => {
    if (status === 'authenticated' && session?.user?.name) {
      fetchData();
      
      // Update authorized users list
      const saved = localStorage.getItem('hub_authorized_users');
      let userList: string[] = saved ? JSON.parse(saved) : [];
      if (!userList.includes(session.user.name)) {
        userList.push(session.user.name);
        localStorage.setItem('hub_authorized_users', JSON.stringify(userList));
      }
    }
  }, [status, fetchData, session]);

  // Handle navigation/popstate fix
  React.useEffect(() => {
    const handleNavigation = () => {
      // Re-trigger data fetch or store sync if needed on browser navigation
      if (status === 'authenticated') fetchData();
    };
    window.addEventListener('popstate', handleNavigation);
    return () => window.removeEventListener('popstate', handleNavigation);
  }, [status, fetchData]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginName || !loginPassword) return;
    
    setIsLoggingIn(true);
    setLoginError(null);
    const result = await signIn('credentials', { 
      username: loginName, 
      password: loginPassword,
      redirect: false 
    });
    
    if (result?.error) {
      setLoginError("Incorrect password. Please try again.");
      setLoginPassword('');
    }
    setIsLoggingIn(false);
  };

  if (status === 'loading' || isLoading) {
    return (
      <div className="h-screen w-screen bg-black flex items-center justify-center">
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        >
          <Loader2 className="w-12 h-12 text-blue-500" />
        </motion.div>
      </div>
    );
  }

  return (
    <main className="relative h-screen w-screen overflow-hidden bg-black font-sans">
      <AnimatePresence mode="wait">
        {!session ? (
          <motion.div 
            key="login-screen"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-[200] flex flex-col items-center justify-center p-8 overflow-hidden"
          >
            {/* Wallpaper Background with overlay */}
            <div 
              className="absolute inset-0 z-0 bg-cover bg-center scale-105 transition-all duration-1000"
              style={{ backgroundImage: `url(${wallpaper})` }}
            />
            <div className="absolute inset-0 z-10 backdrop-blur-md bg-black/20" />

            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              className="relative z-20 flex flex-col items-center w-full max-w-lg"
              onClick={(e) => e.stopPropagation()}
            >
              {/* SaaS LOGIN FORM CARD (Matching Settings Modal) */}
              <div className="glass-dark w-full max-w-md min-h-[500px] rounded-[32px] p-10 shadow-3xl relative overflow-hidden border border-white/10 flex flex-col items-center">
                
                {/* Logo removed as requested */}
                <div className="mb-8 w-full" />

                {/* USER GALLERY */}
                {!selectedUser && !showNameInput ? (
                  <div className="flex-1 flex flex-col items-center justify-center w-full">
                    <h2 className="text-xs font-bold text-white/30 uppercase tracking-[0.2em] mb-8">Choisir un compte</h2>
                    <div className="flex flex-wrap justify-center gap-8 w-full">
                      {authorizedUsers.map((user) => (
                        <motion.button
                          key={user}
                          whileHover={{ y: -4 }}
                          onClick={() => {
                            setSelectedUser(user);
                            setLoginName(user);
                          }}
                          className="flex flex-col items-center gap-4 group"
                        >
                          <div className="w-20 h-20 rounded-full bg-white/5 border border-white/10 flex items-center justify-center p-0.5 shadow-xl transition-all group-hover:border-white/20">
                            <div className="w-full h-full rounded-full bg-gradient-to-tr from-blue-500/5 to-purple-500/5 flex items-center justify-center">
                              <span className="text-2xl text-white font-bold">{user[0].toUpperCase()}</span>
                            </div>
                          </div>
                          <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest group-hover:text-white/60 transition-colors">{user}</span>
                        </motion.button>
                      ))}
                      
                      <motion.button
                        whileHover={{ y: -4 }}
                        onClick={() => setShowNameInput(true)}
                        className="flex flex-col items-center gap-4 group"
                      >
                        <div className="w-20 h-20 rounded-full bg-white/5 border border-dashed border-white/10 flex items-center justify-center p-0.5 shadow-xl transition-all group-hover:border-white/20">
                          <Plus className="w-6 h-6 text-white/20" />
                        </div>
                        <span className="text-[10px] font-bold text-white/20 uppercase tracking-widest group-hover:text-white/40">Nouveau</span>
                      </motion.button>
                    </div>
                  </div>
                ) : (
                  <form onSubmit={handleLogin} className="flex-1 flex flex-col items-center justify-center w-full max-w-xs">
                    <div className="w-24 h-24 rounded-full bg-white/5 border border-white/10 p-0.5 mb-8 shadow-2xl overflow-hidden ring-4 ring-white/5">
                      <div className="w-full h-full rounded-full bg-gradient-to-tr from-white/10 to-transparent flex items-center justify-center">
                         <span className="text-4xl text-white font-bold uppercase">
                           {loginName ? loginName[0].toUpperCase() : 'U'}
                         </span>
                      </div>
                    </div>

                    <h2 className="text-xl font-semibold text-white mb-8 tracking-tight">
                      {loginName || 'S\'identifier'}
                    </h2>

                    <div className="w-full space-y-3 mb-8">
                      {loginError && (
                        <motion.p 
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="text-red-400 text-[10px] font-bold uppercase tracking-widest mb-4 bg-red-400/10 py-3 px-4 rounded-xl border border-red-400/10 text-center"
                        >
                          {loginError === "Incorrect password. Please try again." ? "Mot de passe incorrect" : loginError}
                        </motion.p>
                      )}
                      {showNameInput && (
                        <input 
                          type="text"
                          placeholder="Nom"
                          value={loginName}
                          onChange={(e) => setLoginName(e.target.value)}
                          className="w-full bg-white/5 border border-white/10 rounded-xl px-5 py-3.5 text-sm text-white placeholder:text-white/20 outline-none focus:border-white/30 transition-all text-center"
                          autoFocus
                        />
                      )}
                      <input 
                        type="password"
                        placeholder="Mot de passe"
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-5 py-3.5 text-sm text-white placeholder:text-white/20 outline-none focus:border-white/30 transition-all text-center"
                        autoFocus={!showNameInput}
                      />
                    </div>

                    <button 
                      type="submit"
                      disabled={isLoggingIn || !loginName}
                      className="group relative w-full h-12 bg-white/10 hover:bg-white/20 backdrop-blur-xl border border-white/20 rounded-xl px-6 flex items-center justify-center gap-3 transition-all duration-300 active:scale-95 shadow-xl disabled:opacity-50"
                    >
                      {isLoggingIn ? (
                        <Loader2 className="w-5 h-5 text-white animate-spin" />
                      ) : (
                        <span className="text-white text-xs font-bold uppercase tracking-[0.2em]">Connexion</span>
                      )}
                    </button>
                    
                    <button 
                      type="button"
                      onClick={() => {
                        if (authorizedUsers.length > 0) {
                          setSelectedUser(null);
                          setShowNameInput(false);
                        }
                      }}
                      className="mt-8 text-white/20 hover:text-white/40 text-[10px] font-bold uppercase tracking-[0.2em] transition-colors"
                    >
                      Retour
                    </button>
                  </form>
                )}
              </div>
            </motion.div>
          </motion.div>
        ) : (
              <motion.div 
                key="desktop"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="absolute inset-0 z-0"
              >
            {/* Dynamic Wallpaper */}
            <div 
              className="absolute inset-0 z-0 bg-cover bg-center transition-all duration-1000 scale-[1.02]"
              style={{ 
                backgroundImage: `url(${wallpaper})`,
                filter: (isSettingsOpen || activeApp) ? 'blur(20px) brightness(0.7)' : 'blur(0px) brightness(1)'
              }}
            />

            {/* Settings Trigger - Top Right Corner */}
            <div className="absolute top-6 right-6 z-50">
              <button 
                onClick={() => setSettingsOpen(true)}
                className="w-10 h-10 rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 flex items-center justify-center text-white/40 hover:text-white hover:bg-white/10 hover:border-white/20 transition-all active:scale-95 shadow-2xl overflow-hidden group"
                title="Réglages"
              >
                <div className="absolute inset-0 bg-gradient-to-b from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <Settings className="w-5 h-5" />
              </button>
            </div>

            {/* Content Layer - Empty/Minimalist */}
            <div className="relative z-10 w-full h-full flex items-center justify-center pointer-events-none">
              {/* Central element removed as requested */}
            </div>

            {/* Dock */}
            <Dock />

            {/* Settings Modal */}
            <AnimatePresence>
              {isSettingsOpen && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="fixed inset-0 z-[100] flex items-center justify-center p-8 bg-black/20 backdrop-blur-sm"
                >
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: 20 }}
                    className="glass-dark w-full max-w-2xl h-[600px] rounded-[32px] p-8 shadow-2xl relative overflow-hidden pointer-events-auto border border-white/10"
                  >
                    <button 
                      onClick={() => setSettingsOpen(false)}
                      className="absolute top-6 left-6 z-50 w-3 h-3 rounded-full bg-red-500 hover:bg-red-600 transition-colors shadow-lg"
                    />
                    <SettingsModal />
                  </motion.div>
                  <div className="absolute inset-0 -z-10" onClick={() => setSettingsOpen(false)} />
                </motion.div>
              )}
            </AnimatePresence>

            {/* Internal App Modals (Finder) */}
            <AnimatePresence>
              {activeApp === 'finder' && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9, y: 20 }}
                  className="fixed inset-0 z-[90] flex items-center justify-center p-12 pointer-events-none"
                >
                  <div className="glass-dark w-full max-w-4xl h-[600px] rounded-3xl shadow-2xl relative overflow-hidden pointer-events-auto border border-white/10">
                    <div className="absolute top-4 left-6 z-50 flex gap-2">
                      <button 
                        onClick={() => setActiveApp(null)}
                        className="w-3 h-3 rounded-full bg-red-500 hover:bg-red-600 transition-colors shadow-sm"
                      />
                      <div className="w-3 h-3 rounded-full bg-yellow-500" />
                      <div className="w-3 h-3 rounded-full bg-green-500" />
                    </div>
                    <div className="pt-2 h-full">
                      <Finder />
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
