
import React, { createContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { AppContextType, Hymn, Language, Theme, FontSize, Page, Bookmark, ServiceHymnSlot } from '../types';
import useLocalStorage from '../hooks/useLocalStorage';

export const AppContext = createContext<AppContextType | null>(null);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [hymns, setHymns] = useState<Hymn[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [appLanguage, setAppLanguage] = useLocalStorage<Language>('hymn-app-lang', Language.ENGLISH);
  const [defaultHymnLanguage, setDefaultHymnLanguage] = useLocalStorage<Language>('hymn-default-lang', Language.YORUBA);
  const [hymnLanguage, setHymnLanguage] = useState<Language>(defaultHymnLanguage);
  const [theme, setTheme] = useLocalStorage<Theme>('hymn-theme', Theme.SYSTEM);
  const [fontSize, setFontSize] = useLocalStorage<FontSize>('hymn-font-size', FontSize.MEDIUM);
  
  const [favorites, setFavorites] = useLocalStorage<number[]>('hymn-favorites', []);
  const [history, setHistory] = useLocalStorage<number[]>('hymn-history', []);
  const [recentSearches, setRecentSearches] = useLocalStorage<string[]>('hymn-recent-searches', []);
  const [bookmarks, setBookmarks] = useLocalStorage<Bookmark[]>('hymn-bookmarks', []);


  const [activePage, setActivePageState] = useState<Page>(Page.HymnLibrary);
  const [pageContext, setPageContext] = useState<any>(null);

  useEffect(() => {
    const fetchHymns = async () => {
      try {
        const response = await fetch('/contexts/hymns.json');
        if (!response.ok) {
          throw new Error(`Failed to fetch hymns: ${response.statusText}`);
        }
        const data = await response.json();
        setHymns(data as Hymn[]);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchHymns();
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

  const value: AppContextType = {
    hymns,
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
    getServiceHymnSlot
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};
