
import React, { createContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { AppContextType, Hymn, Language, Theme, FontSize, Page } from '../types';
import useLocalStorage from '../hooks/useLocalStorage';

export const AppContext = createContext<AppContextType | null>(null);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [hymns, setHymns] = useState<Hymn[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [appLanguage, setAppLanguage] = useLocalStorage<Language>('hymn-app-lang', Language.ENGLISH);
  const [defaultHymnLanguage, setDefaultHymnLanguage] = useLocalStorage<Language>('hymn-default-lang', Language.YORUBA);
  const [hymnLanguage, setHymnLanguage] = useState<Language>(defaultHymnLanguage);
  const [theme, setTheme] = useLocalStorage<Theme>('hymn-theme', Theme.LIGHT);
  const [fontSize, setFontSize] = useLocalStorage<FontSize>('hymn-font-size', FontSize.MEDIUM);
  
  const [favorites, setFavorites] = useLocalStorage<number[]>('hymn-favorites', []);
  const [history, setHistory] = useLocalStorage<number[]>('hymn-history', []);
  const [recentSearches, setRecentSearches] = useLocalStorage<string[]>('hymn-recent-searches', []);


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
    root.classList.remove(theme === Theme.LIGHT ? 'dark' : 'light');
    root.classList.add(theme === Theme.LIGHT ? 'light' : 'dark');
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
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};