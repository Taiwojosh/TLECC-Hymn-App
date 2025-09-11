
export enum Language {
  ENGLISH = 'en',
  YORUBA = 'yo',
}

export enum Theme {
  LIGHT = 'light',
  DARK = 'dark',
}

export enum FontSize {
  SMALL = 'sm',
  MEDIUM = 'md',
  LARGE = 'lg',
}

export interface Stanza {
  type: 'stanza' | 'chorus';
  lines: string[];
}

export interface Hymn {
  id: number;
  title_en: string;
  title_yo: string;
  first_line_en: string;
  first_line_yo: string;
  lyrics_en: Stanza[];
  lyrics_yo: Stanza[];
  category: string;
  tune_code: string;
}

export enum Page {
  HymnLibrary,
  HymnDetail,
  Favorites,
  History,
  ChurchDoctrine,
  UpdateHymns,
  Credits,
  Donate,
  Settings,
  About,
}

export interface AppContextType {
  hymns: Hymn[];
  loading: boolean;
  appLanguage: Language;
  setAppLanguage: (language: Language) => void;
  hymnLanguage: Language;
  setHymnLanguage: (language: Language) => void;
  defaultHymnLanguage: Language;
  setDefaultHymnLanguage: (language: Language) => void;
  theme: Theme;
  setTheme: (theme: Theme) => void;
  fontSize: FontSize;
  setFontSize: (size: FontSize) => void;
  
  favorites: number[];
  toggleFavorite: (hymnId: number) => void;
  isFavorite: (hymnId: number) => boolean;

  history: number[];
  addToHistory: (hymnId: number) => void;

  recentSearches: string[];
  addRecentSearch: (term: string) => void;
  clearRecentSearches: () => void;

  activePage: Page;
  setActivePage: (page: Page, context?: any) => void;
  pageContext: any;
}