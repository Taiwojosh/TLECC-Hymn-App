

import React, { createContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { AppContextType, Hymn, Branch, Language, Theme, FontSize, Page, Bookmark, ServiceHymnSlot, AccentColor, ToastType } from '../types';
import useLocalStorage from '../hooks/useLocalStorage';

const hexToRgb = (hex: string) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? `${parseInt(result[1], 16)} ${parseInt(result[2], 16)} ${parseInt(result[3], 16)}` : null;
};

const colorPalettes: Record<AccentColor, Record<string, string>> = {
  [AccentColor.GREEN]: {"50":"#f0fdf4","100":"#dcfce7","200":"#bbf7d0","300":"#86efac","400":"#4ade80","500":"#22c55e","600":"#16a34a","700":"#15803d","800":"#166534","900":"#14532d","950":"#052e16"},
  [AccentColor.BLUE]: {"50":"#eff6ff","100":"#dbeafe","200":"#bfdbfe","300":"#93c5fd","400":"#60a5fa","500":"#3b82f6","600":"#2563eb","700":"#1d4ed8","800":"#1e40af","900":"#1e3a8a","950":"#172554"},
  [AccentColor.RED]: {"50":"#fef2f2","100":"#fee2e2","200":"#fecaca","300":"#fca5a5","400":"#f87171","500":"#ef4444","600":"#dc2626","700":"#b91c1c","800":"#991b1b","900":"#7f1d1d","950":"#450a0a"},
  [AccentColor.PURPLE]: {"50":"#f5f3ff","100":"#ede9fe","200":"#ddd6fe","300":"#c4b5fd","400":"#a78bfa","500":"#8b5cf6","600":"#7c3aed","700":"#6d28d9","800":"#5b21b6","900":"#4c1d95","950":"#2e1065"},
  [AccentColor.ORANGE]: {"50":"#fff7ed","100":"#ffedd5","200":"#fed7aa","300":"#fdba74","400":"#fb923c","500":"#f97316","600":"#ea580c","700":"#c2410c","800":"#9a3412","900":"#7c2d12","950":"#431407"},
};

export const AppContext = createContext<AppContextType | null>(null);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [hymns, setHymns] = useState<Hymn[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [appLanguage, setAppLanguage] = useLocalStorage<Language>('hymn-app-lang', Language.ENGLISH);
  const [defaultHymnLanguage, setDefaultHymnLanguage] = useLocalStorage<Language>('hymn-default-lang', Language.YORUBA);
  const [hymnLanguage, setHymnLanguage] = useState<Language>(defaultHymnLanguage);
  const [theme, setTheme] = useLocalStorage<Theme>('hymn-theme', Theme.SYSTEM);
  const [fontSize, setFontSize] = useLocalStorage<FontSize>('hymn-font-size', FontSize.MEDIUM);
  const [accentColor, setAccentColor] = useLocalStorage<AccentColor>('hymn-accent-color', AccentColor.GREEN);
  
  const [favorites, setFavorites] = useLocalStorage<number[]>('hymn-favorites', []);
  const [history, setHistory] = useLocalStorage<number[]>('hymn-history', []);
  const [recentSearches, setRecentSearches] = useLocalStorage<string[]>('hymn-recent-searches', []);
  const [bookmarks, setBookmarks] = useLocalStorage<Bookmark[]>('hymn-bookmarks', []);
  
  // Toast State
  const [toast, setToast] = useState<{ message: string; type: ToastType | null }>({ message: '', type: null });

  const [activePage, setActivePageState] = useState<Page>(Page.HymnLibrary);
  const [pageContext, setPageContext] = useState<any>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [hymnsResponse, branchesResponse] = await Promise.all([
            fetch('/hymns.json'),
            fetch('/branches.json')
        ]);

        if (hymnsResponse.ok) {
            const hymnsData = await hymnsResponse.json();
            setHymns(hymnsData as Hymn[]);
        } else {
            console.error(`Failed to fetch hymns: ${hymnsResponse.statusText}`);
        }

        if (branchesResponse.ok) {
            const branchesData = await branchesResponse.json();
            setBranches(branchesData as Branch[]);
        } else {
            console.error(`Failed to fetch branches: ${branchesResponse.statusText}`);
            setBranches([]); // Ensure it's empty array on failure
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    const root = window.document.documentElement;
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    const applyTheme = (isDark: boolean) => {
      root.classList.remove('light', 'dark');
      root.classList.add(isDark ? 'dark' : 'light');
    };

    const handleChange = () => {
      if (theme === Theme.SYSTEM) {
        applyTheme(mediaQuery.matches);
      }
    };

    if (theme === Theme.SYSTEM) {
      applyTheme(mediaQuery.matches);
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    } else {
      applyTheme(theme === Theme.DARK);
    }
  }, [theme]);

  useEffect(() => {
    const root = document.documentElement;
    const palette = colorPalettes[accentColor];
    for (const [shade, hex] of Object.entries(palette)) {
      const rgb = hexToRgb(hex);
      if (rgb) {
        root.style.setProperty(`--color-primary-${shade}`, rgb);
      }
    }
  }, [accentColor]);
  
  useEffect(() => {
    setHymnLanguage(defaultHymnLanguage);
  }, [defaultHymnLanguage]);

  const toggleFavorite = useCallback((hymnId: number) => {
    setFavorites(prev => 
      prev.includes(hymnId) ? prev.filter(id => id !== hymnId) : [...prev, hymnId]
    );
  }, [setFavorites]);

  const isFavorite = useCallback((hymnId: number) => {
    return favorites.includes(hymnId);
  }, [favorites]);

  const addToHistory = useCallback((hymnId: number) => {
    setHistory(prev => {
      const newHistory = [hymnId, ...prev.filter(id => id !== hymnId)];
      return newHistory.slice(0, 50); // Keep last 50
    });
  }, [setHistory]);

  const addRecentSearch = useCallback((term: string) => {
    if (!term || term.trim() === '') return;
    const cleanedTerm = term.trim();
    setRecentSearches(prev => {
      const newSearches = [cleanedTerm, ...prev.filter(s => s.toLowerCase() !== cleanedTerm.toLowerCase())];
      return newSearches.slice(0, 10); // Keep last 10 searches
    });
  }, [setRecentSearches]);

  const clearRecentSearches = useCallback(() => {
    setRecentSearches([]);
  }, [setRecentSearches]);

  const setActivePage = (page: Page, context: any = null) => {
    setActivePageState(page);
    setPageContext(context);
    window.scrollTo(0, 0);
  };
  
  // Bookmark Functions
  const setServiceHymn = useCallback((slot: ServiceHymnSlot, hymnId: number | null) => {
      setBookmarks(prev => {
          // Remove any existing hymn from this slot
          let filtered = prev.filter(b => !(b.type === 'service' && b.slot === slot));
          // If a hymnId is provided, add the new one
          if (hymnId !== null) {
              filtered.push({ type: 'service', hymnId, slot, createdAt: Date.now() });
          }
          return filtered;
      });
  }, [setBookmarks]);

  const setCustomBookmark = useCallback((hymnId: number, description: string) => {
      setBookmarks(prev => {
          // Remove existing custom bookmark for this hymn to prevent duplicates
          const filtered = prev.filter(b => !(b.type === 'custom' && b.hymnId === hymnId));
          filtered.push({ type: 'custom', hymnId, description, createdAt: Date.now() });
          return filtered;
      });
  }, [setBookmarks]);
  
  const removeCustomBookmark = useCallback((hymnId: number) => {
      setBookmarks(prev => prev.filter(b => !(b.type === 'custom' && b.hymnId === hymnId)));
  }, [setBookmarks]);

  const getCustomBookmark = useCallback((hymnId: number) => {
      return bookmarks.find(b => b.type === 'custom' && b.hymnId === hymnId);
  }, [bookmarks]);

  const getServiceHymnSlot = useCallback((hymnId: number) => {
      const bookmark = bookmarks.find(b => b.type === 'service' && b.hymnId === hymnId);
      return bookmark?.type === 'service' ? bookmark.slot : undefined;
  }, [bookmarks]);

  const showToast = useCallback((message: string, type: ToastType = 'info') => {
    setToast({ message, type });
    // Auto-hide after 3 seconds
    setTimeout(() => {
        setToast(prev => prev.message === message ? { message: '', type: null } : prev);
    }, 3000);
  }, []);

  const value: AppContextType = {
    hymns,
    branches,
    loading,
    appLanguage,
    setAppLanguage,
    hymnLanguage,
    setHymnLanguage,
    defaultHymnLanguage,
    setDefaultHymnLanguage,
    theme,
    setTheme,
    fontSize,
    setFontSize,
    accentColor,
    setAccentColor,
    favorites,
    toggleFavorite,
    isFavorite,
    history,
    addToHistory,
    recentSearches,
    addRecentSearch,
    clearRecentSearches,
    activePage,
    setActivePage,
    pageContext,
    bookmarks,
    setServiceHymn,
    setCustomBookmark,
    removeCustomBookmark,
    getCustomBookmark,
    getServiceHymnSlot,
    toast,
    showToast
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};