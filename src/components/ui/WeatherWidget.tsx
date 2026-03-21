import React, { useState, useEffect, useRef } from 'react';
import { Cloud, Sun, CloudRain, Wind } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSystemStore } from '@/store/useSystemStore';
import { cn } from '@/lib/utils';

export default function WeatherWidget() {
  const { weatherCity, setWeatherCity, setSettingsOpen, toggleWeather } = useSystemStore();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isEditingCity, setIsEditingCity] = useState(false);
  const [tempCity, setTempCity] = useState(weatherCity);
  const [weatherData, setWeatherData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);

  const fetchWeather = async () => {
    setIsLoading(true);
    try {
      const resp = await fetch(`/api/weather?city=${encodeURIComponent(weatherCity)}`);
      const data = await resp.json();
      if (data.error) throw new Error(data.error);
      setWeatherData(data);
    } catch (err) {
      console.error('Weather fetch error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchWeather();
  }, [weatherCity]);

  // Outside click logic
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const getWeatherIcon = (desc: string = '') => {
    const d = desc.toLowerCase();
    if (d.includes('sun') || d.includes('clear')) return Sun;
    if (d.includes('rain') || d.includes('shower') || d.includes('drizzle')) return CloudRain;
    if (d.includes('wind') || d.includes('storm')) return Wind;
    return Cloud;
  };

  const Icon = getWeatherIcon(weatherData?.desc);

  return (
    <motion.div 
      ref={containerRef}
      drag
      dragConstraints={{ left: -100, right: 100, top: -100, bottom: 100 }}
      whileHover={{ scale: 1.02 }}
      onContextMenu={(e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsMenuOpen(!isMenuOpen);
      }}
      className="p-6 rounded-[32px] w-64 cursor-grab active:cursor-grabbing group relative"
    >
      <div className="flex justify-between items-start mb-4 relative z-10">
        <div className="flex-1">
          {isEditingCity ? (
            <input 
              autoFocus
              type="text"
              value={tempCity}
              onChange={(e) => setTempCity(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  setWeatherCity(tempCity);
                  setIsEditingCity(false);
                }
                if (e.key === 'Escape') {
                  setTempCity(weatherCity);
                  setIsEditingCity(false);
                }
              }}
              onBlur={() => setIsEditingCity(false)}
              className="bg-white/10 text-white rounded-lg px-2 py-1 text-xl font-bold w-full outline-none border border-white/20"
            />
          ) : (
            <div className={cn("transition-opacity duration-300", isLoading ? "opacity-20" : "opacity-100")}>
              <h3 className="text-xl font-bold" style={{ color: 'var(--foreground-rgb)' }}>{weatherCity}</h3>
              <p className="text-sm opacity-40 capitalize" style={{ color: 'var(--foreground-rgb)' }}>
                {weatherData?.condition || (isLoading ? 'Chargement...' : 'Indisponible')}
              </p>
            </div>
          )}
        </div>
        <div className="flex flex-col items-end gap-2 relative">
          <AnimatePresence>
            {isMenuOpen && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 10 }}
                className="absolute top-0 right-10 w-32 glass-dark rounded-2xl border border-white/10 p-2 shadow-2xl z-50 overflow-hidden"
              >
                <button 
                  onClick={() => { fetchWeather(); setIsMenuOpen(false); }}
                  className="w-full text-left px-3 py-2 rounded-xl text-[10px] font-bold text-white/60 hover:bg-white/10 transition-colors"
                > Rafraîchir </button>
                <button 
                  onClick={() => { setIsEditingCity(true); setIsMenuOpen(false); }}
                  className="w-full text-left px-3 py-2 rounded-xl text-[10px] font-bold text-white/60 hover:bg-white/10 transition-colors"
                > Changer ville </button>
                <button 
                  onClick={() => { toggleWeather(); setIsMenuOpen(false); }}
                  className="w-full text-left px-3 py-2 rounded-xl text-[10px] font-bold text-white/60 hover:bg-white/10 transition-colors"
                > Masquer </button>
                <button 
                  onClick={() => { setSettingsOpen(true); setIsMenuOpen(false); }}
                  className="w-full text-left px-3 py-2 rounded-xl text-[10px] font-bold text-white/40 hover:bg-white/10 transition-colors"
                > Plus... </button>
              </motion.div>
            )}
          </AnimatePresence>

          <Icon className={cn("w-10 h-10 transition-all duration-500", isLoading ? "opacity-20 scale-90" : "opacity-80 scale-100")} style={{ color: 'var(--foreground-rgb)' }} />
        </div>
      </div>
      
      <div className={cn("transition-all duration-500", isLoading ? "opacity-20 translate-y-2" : "opacity-100 translate-y-0")}>
        <div className="flex items-end gap-2 mb-6">
          <span className="text-5xl font-light" style={{ color: 'var(--foreground-rgb)' }}>{weatherData?.temp || '--'}°</span>
          <div className="flex flex-col text-xs opacity-40 mb-1" style={{ color: 'var(--foreground-rgb)' }}>
            <span>Max: {weatherData?.max || '--'}°</span>
            <span>Min: {weatherData?.min || '--'}°</span>
          </div>
        </div>

        <div className="flex justify-between opacity-60" style={{ color: 'var(--foreground-rgb)' }}>
          {weatherData?.forecast?.map((f: any, i: number) => {
            const ForecastIcon = getWeatherIcon(f.desc);
            const days = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];
            const today = new Date().getDay();
            const dayName = days[(today + i) % 7];

            return (
              <div key={i} className="flex flex-col items-center gap-1">
                <span className="text-[10px] uppercase tracking-wider">{dayName}</span>
                <ForecastIcon className="w-4 h-4" />
                <span className="text-xs">{f.max}°</span>
              </div>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
}

