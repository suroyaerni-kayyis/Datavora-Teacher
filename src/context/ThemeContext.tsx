import React, { createContext, useContext, useState, useEffect } from 'react';
import { ThemeMode, SidebarColorTheme, AppColorTheme } from '../types';
import { colorThemes, ColorThemeDefinition } from '../lib/themeStyles';

interface ThemeContextType {
  theme: ThemeMode;
  actualTheme: 'light' | 'dark';
  setTheme: (theme: ThemeMode) => void;
  colorTheme: AppColorTheme;
  setColorTheme: (theme: AppColorTheme) => void;
  sidebarTheme: SidebarColorTheme;
  setSidebarTheme: (theme: SidebarColorTheme) => void;
  themeConfig: ColorThemeDefinition;
}

const THEME_STORAGE_KEY = 'datavora_theme_mode';
const COLOR_THEME_KEY = 'datavora_color_theme';

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<ThemeMode>(() => {
    try {
      const saved = localStorage.getItem(THEME_STORAGE_KEY) as ThemeMode | null;
      if (saved === 'light' || saved === 'dark' || saved === 'system') {
        return saved;
      }
    } catch {
      // Ignore storage errors
    }
    return 'system';
  });

  const [colorTheme, setColorThemeState] = useState<AppColorTheme>(() => {
    try {
      const saved = (localStorage.getItem(COLOR_THEME_KEY) || localStorage.getItem('datavora_sidebar_theme')) as AppColorTheme | null;
      if (saved && ['plum', 'maroon', 'navy', 'emerald', 'rose'].includes(saved)) {
        return saved;
      }
    } catch {
      // Ignore storage errors
    }
    return 'plum';
  });

  const setColorTheme = (newTheme: AppColorTheme) => {
    setColorThemeState(newTheme);
    try {
      localStorage.setItem(COLOR_THEME_KEY, newTheme);
      localStorage.setItem('datavora_sidebar_theme', newTheme);
    } catch {
      // Ignore storage errors
    }
  };

  const [systemIsDark, setSystemIsDark] = useState<boolean>(() => {
    if (typeof window !== 'undefined' && window.matchMedia) {
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  });

  // Listen to system preference changes
  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const handleChange = (e: MediaQueryListEvent) => {
      setSystemIsDark(e.matches);
    };

    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    } else {
      // Fallback for older browsers
      mediaQuery.addListener(handleChange);
      return () => mediaQuery.removeListener(handleChange);
    }
  }, []);

  const actualTheme: 'light' | 'dark' = theme === 'system' ? (systemIsDark ? 'dark' : 'light') : theme;
  const themeConfig = colorThemes[colorTheme] || colorThemes.plum;

  // Apply theme to HTML root element
  useEffect(() => {
    const root = document.documentElement;
    if (actualTheme === 'dark') {
      root.classList.add('dark');
      root.style.colorScheme = 'dark';
    } else {
      root.classList.remove('dark');
      root.style.colorScheme = 'light';
    }

    // Update meta theme-color to match selected color theme
    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (metaThemeColor) {
      metaThemeColor.setAttribute(
        'content', 
        actualTheme === 'dark' ? themeConfig.dotColor : themeConfig.dotColor
      );
    }
  }, [actualTheme, themeConfig]);

  const setTheme = (newTheme: ThemeMode) => {
    setThemeState(newTheme);
    try {
      localStorage.setItem(THEME_STORAGE_KEY, newTheme);
    } catch {
      // Ignore storage errors
    }
  };

  return (
    <ThemeContext.Provider value={{ 
      theme, 
      actualTheme, 
      setTheme, 
      colorTheme, 
      setColorTheme,
      sidebarTheme: colorTheme, 
      setSidebarTheme: setColorTheme,
      themeConfig 
    }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
