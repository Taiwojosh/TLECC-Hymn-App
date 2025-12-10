

export enum Language {
  ENGLISH = 'en',
  YORUBA = 'yo',
}

export enum Theme {
  LIGHT = 'light',
  DARK = 'dark',
  SYSTEM = 'system',
}

export enum FontSize {
  SMALL = 'sm',
  MEDIUM = 'md',
  LARGE = 'lg',
}

export enum AccentColor {
  GREEN = 'green',
  BLUE = 'blue',
  RED = 'red',
  PURPLE = 'purple',
  ORANGE = 'orange',
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
  category: {
    en: string;
    yo: string;
  };
  tune_code: string;
  theme_scripture?: {
    en: string;
    yo: string;
  };
}

export interface Branch {
  name: string;
  address: string;
  city: string;
  state: string;
  phone?: string;
}

export enum Page {
  HymnLibrary,
  HymnDetail,
  Favorites,
  Bookmarks,
  History,
  ChurchDoctrine,
  Connect,
  Credits,
  Donate,
  Settings,
  About,
}

export type ServiceHymnSlot = 'opening' | 'sermon' | 'closing';

export type Bookmark =
  | {
      type: 'custom';
      hymnId: number;
      description: string;
      createdAt: number;
    }
  | {
      type: 'service';
      hymnId: number;
      slot: ServiceHymnSlot;
      createdAt: number;
    };

export type ToastType = 'success' | 'error' | 'info';

export interface AppContextType {
  hymns: Hymn[];
  branches: Branch[];
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
  accentColor: AccentColor;
  setAccentColor: (color: AccentColor) => void;
  
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

  bookmarks: Bookmark[];
  setServiceHymn: (slot: ServiceHymnSlot, hymnId: number | null) => void;
  setCustomBookmark: (hymnId: number, description: string) => void;
  removeCustomBookmark: (hymnId: number) => void;
  getCustomBookmark: (hymnId: number) => Bookmark | undefined;
  getServiceHymnSlot: (hymnId: number) => ServiceHymnSlot | undefined;

  toast: { message: string; type: ToastType | null };
  showToast: (message: string, type?: ToastType) => void;
}