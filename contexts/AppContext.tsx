
import React, { createContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { AppContextType, Hymn, Language, Theme, FontSize, Page } from '../types';
import useLocalStorage from '../hooks/useLocalStorage';

export const AppContext = createContext<AppContextType | null>(null);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [hymns, setHymns] = useState<Hymn[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [language, setLanguage] = useLocalStorage<Language>('hymn-lang', Language.ENGLISH);
  const [theme, setTheme] = useLocalStorage<Theme>('hymn-theme', Theme.LIGHT);
  const [fontSize, setFontSize] = useLocalStorage<FontSize>('hymn-font-size', FontSize.MEDIUM);
  const [isPro, setIsPro] = useLocalStorage<boolean>('hymn-pro', false);
  
  const [favorites, setFavorites] = useLocalStorage<number[]>('hymn-favorites', []);
  const [history, setHistory] = useLocalStorage<number[]>('hymn-history', []);

  const [activePage, setActivePageState] = useState<Page>(Page.Home);
  const [pageContext, setPageContext] = useState<any>(null);

  useEffect(() => {
    // This effect fetches the hymn data when the app loads.
    const fetchHymns = async () => {
      try {
        // Fetch data from the public path.
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
  }, []); // Empty dependency array ensures this runs only once.

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove(theme === Theme.LIGHT ? 'dark' : 'light');
    root.classList.add(theme === Theme.LIGHT ? 'light' : 'dark');
  }, [theme]);
  
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

  const setActivePage = (page: Page, context: any = null) => {
    setActivePageState(page);
    setPageContext(context);
    window.scrollTo(0, 0);
  };

  const value: AppContextType = {
    hymns,
    loading,
    language,
    setLanguage,
    theme,
    setTheme,
    fontSize,
    setFontSize,
    isPro,
    setIsPro,
    favorites,
    toggleFavorite,
    isFavorite,
    history,
    addToHistory,
    activePage,
    setActivePage,
    pageContext,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};