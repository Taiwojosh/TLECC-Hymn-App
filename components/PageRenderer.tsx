import React, { useContext, useState, useMemo, useRef, useEffect } from 'react';
import { AppContext } from '../contexts/AppContext';
import { Hymn, Language, Page, Stanza } from '../types';
import { ChevronLeftIcon, HeartIcon, PlayIcon, SearchIcon, ShareIcon, SunIcon, MoonIcon, TrashIcon, FilterIcon, XIcon, FontSizeIcon, ChevronDownIcon } from './Icons';
import { Theme, FontSize } from '../types';


// HymnList Component
const HymnListItem: React.FC<{hymn: Hymn, onSelect: (hymn: Hymn) => void}> = ({hymn, onSelect}) => {
    const context = useContext(AppContext);
    if (!context) return null;
    const { language, isFavorite } = context;

    return (
        <li
            onClick={() => onSelect(hymn)}
            className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm hover:shadow-md transition-shadow cursor-pointer"
        >
            <div className="flex items-center">
                <div className="text-lg font-bold text-primary-600 dark:text-primary-400 w-12 text-center">{hymn.id}</div>
                <div className="ml-4">
                    <p className="font-semibold text-gray-800 dark:text-gray-200">
                        {language === Language.ENGLISH ? hymn.title_en : hymn.title_yo}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        {language === Language.ENGLISH ? hymn.first_line_en : hymn.first_line_yo}
                    </p>
                </div>
            </div>
            {isFavorite(hymn.id) && <HeartIcon className="w-5 h-5 text-red-500 fill-current" />}
        </li>
    );
};

// HymnDetail Component
const HymnDetail: React.FC<{hymn: Hymn}> = ({ hymn }) => {
    const context = useContext(AppContext);
    if (!context) return null;
    // Destructure context values
    const { language, setLanguage, fontSize, setFontSize, isPro, isFavorite, toggleFavorite, setActivePage, addToHistory } = context;

    // State and ref for the new font size control popover
    const [isFontControlOpen, setIsFontControlOpen] = useState(false);
    const fontControlRef = useRef<HTMLDivElement>(null);

    // Effect to close the font size popover when clicking outside of it
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (fontControlRef.current && !fontControlRef.current.contains(event.target as Node)) {
                setIsFontControlOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    // Determine which lyrics to display based on the current language context.
    const lyrics = language === Language.ENGLISH ? hymn.lyrics_en : hymn.lyrics_yo;

    // Check if lyrics are available for the selected language to handle missing translations.
    const lyricsAvailable = lyrics && lyrics.length > 0;
    
    // Define font size classes for easy mapping
    const fontSizes: Record<FontSize, string> = {
        [FontSize.SMALL]: 'text-base',
        [FontSize.MEDIUM]: 'text-lg',
        [FontSize.LARGE]: 'text-xl',
    };

    // Share functionality to copy hymn text to clipboard or use native share API
    const handleShare = async () => {
        const title = language === Language.ENGLISH ? hymn.title_en : hymn.title_yo;
        const textToShare = `${title}\n\n${lyrics.map(stanza => stanza.lines.join('\n')).join('\n\n')}`;

        if(navigator.share) {
            try {
                await navigator.share({
                    title: title,
                    text: textToShare,
                });
            } catch (error) {
                console.error('Error sharing:', error);
            }
        } else {
            navigator.clipboard.writeText(textToShare).then(() => alert('Hymn copied to clipboard!'));
        }
    };
    
    return (
        <div className="max-w-4xl mx-auto">
            {/* Back button to return to the hymn library */}
            <button onClick={() => setActivePage(Page.HymnLibrary)} className="flex items-center mb-4 text-primary-600 dark:text-primary-400 hover:underline">
                <ChevronLeftIcon className="w-5 h-5 mr-1" />
                {language === Language.ENGLISH ? 'Back to Library' : 'Padà sí Àkójọpọ̀'}
            </button>
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
                <div className="flex justify-between items-start mb-4">
                    <div>
                        <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
                            {hymn.id}. {language === Language.ENGLISH ? hymn.title_en : hymn.title_yo}
                        </h2>
                        <p className="text-md text-gray-500 dark:text-gray-400">{hymn.category} | {hymn.tune_code}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                        {/* Font Size Control */}
                        <div className="relative" ref={fontControlRef}>
                            <button onClick={() => setIsFontControlOpen(prev => !prev)} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700" aria-label="Adjust font size">
                                <FontSizeIcon className="w-6 h-6 text-gray-600 dark:text-gray-300"/>
                            </button>
                            {isFontControlOpen && (
                                <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-xl border dark:border-gray-700 z-10 p-2">
                                    <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 px-2 py-1">{language === Language.ENGLISH ? 'Font Size' : 'Ìwọ̀n Lẹ́tà'}</p>
                                    <div className="flex items-center justify-around mt-2">
                                        <button 
                                          onClick={() => { setFontSize(FontSize.SMALL); setIsFontControlOpen(false); }} 
                                          className={`w-10 h-10 flex items-center justify-center rounded-full ${fontSize === FontSize.SMALL ? 'bg-primary-600 text-white' : 'bg-gray-200 dark:bg-gray-600'}`}
                                          aria-pressed={fontSize === FontSize.SMALL}
                                        >
                                          <span className="text-sm font-bold">A</span>
                                        </button>
                                        <button 
                                          onClick={() => { setFontSize(FontSize.MEDIUM); setIsFontControlOpen(false); }} 
                                          className={`w-10 h-10 flex items-center justify-center rounded-full ${fontSize === FontSize.MEDIUM ? 'bg-primary-600 text-white' : 'bg-gray-200 dark:bg-gray-600'}`}
                                          aria-pressed={fontSize === FontSize.MEDIUM}
                                        >
                                          <span className="text-base font-bold">A</span>
                                        </button>
                                        <button 
                                          onClick={() => { setFontSize(FontSize.LARGE); setIsFontControlOpen(false); }} 
                                          className={`w-10 h-10 flex items-center justify-center rounded-full ${fontSize === FontSize.LARGE ? 'bg-primary-600 text-white' : 'bg-gray-200 dark:bg-gray-600'}`}
                                          aria-pressed={fontSize === FontSize.LARGE}
                                        >
                                          <span className="text-lg font-bold">A</span>
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                        {/* Share Button */}
                        <button onClick={handleShare} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700" aria-label="Share hymn">
                             <ShareIcon className="w-6 h-6 text-gray-600 dark:text-gray-300"/>
                        </button>
                        {/* Favorite Button */}
                         <button onClick={() => toggleFavorite(hymn.id)} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700" aria-label="Toggle favorite">
                            <HeartIcon className={`w-6 h-6 transition-colors ${isFavorite(hymn.id) ? 'text-red-500 fill-current' : 'text-gray-600 dark:text-gray-300'}`} />
                        </button>
                    </div>
                </div>

                {/* Language Toggle: Allows switching between English and Yoruba lyrics */}
                <div className="flex space-x-2 border border-gray-300 dark:border-gray-600 rounded-full p-1 w-fit mb-6">
                    <button 
                        onClick={() => setLanguage(Language.ENGLISH)}
                        className={`px-4 py-1 rounded-full text-sm font-semibold transition-colors ${language === Language.ENGLISH ? 'bg-primary-600 text-white' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'}`}
                        aria-pressed={language === Language.ENGLISH}
                    >
                        English
                    </button>
                    <button 
                        onClick={() => setLanguage(Language.YORUBA)}
                        className={`px-4 py-1 rounded-full text-sm font-semibold transition-colors ${language === Language.YORUBA ? 'bg-primary-600 text-white' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'}`}
                        aria-pressed={language === Language.YORUBA}
                    >
                        Yorùbá
                    </button>
                </div>

                 {isPro && (
                    <div className="mb-6">
                        <button className="flex items-center justify-center w-full px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors">
                            <PlayIcon className="w-5 h-5 mr-2"/>
                            {language === Language.ENGLISH ? 'Play Audio (Pro)' : 'Gbọ́ Orin (Pro)'}
                        </button>
                    </div>
                )}
                
                {/* Lyrics Display: Conditionally renders lyrics or a "not available" message */}
                <div className={`lyrics leading-relaxed ${fontSizes[fontSize]}`}>
                    {lyricsAvailable ? (
                        lyrics.map((stanza: Stanza, index: number) => (
                            <div key={index} className="mb-6">
                                {stanza.type === 'chorus' && <p className="font-bold italic mb-2">{language === Language.ENGLISH ? 'Chorus' : 'Egbe'}</p>}
                                {stanza.lines.map((line, lineIndex) => (
                                    <p key={lineIndex}>{line}</p>
                                ))}
                            </div>
                        ))
                    ) : (
                        <p className="text-gray-500 dark:text-gray-400 italic">
                            {language === Language.ENGLISH 
                                ? 'Lyrics not available in English.' 
                                : 'Àkọlé orin kò sí ní èdè Yorùbá.'}
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
};


// Pages
const HomePage = () => {
    const context = useContext(AppContext);
    if (!context) return null;
    const { setActivePage, hymns, language } = context;

    return (
        <div className="text-center">
            <h1 className="text-4xl font-bold text-primary-600 dark:text-primary-400 mb-4">{language === Language.ENGLISH ? 'Welcome to the Digital Hymn Book' : 'Ẹ kú àbọ̀ sí Ìwé Orin Oní Dìjítà'}</h1>
            <p className="text-lg text-gray-600 dark:text-gray-300 mb-8">{language === Language.ENGLISH ? 'Your companion for worship and praise.' : 'Alábàápín rẹ fún ìjọsìn àti ìyìn.'}</p>
            <button onClick={() => setActivePage(Page.HymnLibrary)} className="px-8 py-3 bg-primary-600 text-white font-semibold rounded-lg shadow-md hover:bg-primary-700 transition-colors">
                {language === Language.ENGLISH ? 'Browse Hymns' : 'Ṣàwárí Àwọn Orin'}
            </button>
            <div className="mt-12">
                <h2 className="text-2xl font-semibold mb-4">{language === Language.ENGLISH ? 'Featured Hymn' : 'Orin Àkànṣe'}</h2>
                <HymnListItem hymn={hymns[0]} onSelect={(hymn) => setActivePage(Page.HymnDetail, { hymn })} />
            </div>
        </div>
    );
};

// Collapsible category header for the 'Category' view mode
const CategoryHeader: React.FC<{ category: string, count: number, isExpanded: boolean, onToggle: () => void, language: Language }> = ({ category, count, isExpanded, onToggle, language }) => (
    <button onClick={onToggle} className="w-full flex justify-between items-center p-4 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-left transition-colors">
        <div>
            <span className="font-semibold text-gray-800 dark:text-gray-200">{category}</span>
            <span className="text-sm text-gray-500 dark:text-gray-400 ml-2">
                ({count} {language === 'en' ? (count > 1 ? 'hymns' : 'hymn') : 'orin'})
            </span>
        </div>
        <ChevronDownIcon className={`w-5 h-5 text-gray-500 dark:text-gray-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
    </button>
);


const HymnLibraryPage = () => {
    const context = useContext(AppContext);
    if (!context) return null;
    const { hymns, language, setActivePage, addToHistory } = context;
    
    // State for all UI interactions
    const [searchTerm, setSearchTerm] = useState('');
    const [isSearchActive, setIsSearchActive] = useState(false);
    const [isFabOpen, setIsFabOpen] = useState(false);
    const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
    const [activeFilter, setActiveFilter] = useState<{ type: 'none' | 'chorus' | 'category', value?: string }>({ type: 'none' });
    const [viewMode, setViewMode] = useState<'list_number' | 'list_title' | 'category'>('list_number');
    const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
    const searchInputRef = useRef<HTMLInputElement>(null);

    // Focus input when search becomes active
    useEffect(() => {
        if (isSearchActive) {
            searchInputRef.current?.focus();
        }
    }, [isSearchActive]);

    // Memoized list of unique categories for the filter modal
    const categories = useMemo(() => Array.from(new Set(hymns.map(h => h.category))).sort(), [hymns]);

    // Main logic for processing hymns: search -> filter -> sort
    const processedHymns = useMemo(() => {
        let hymnsToProcess = [...hymns];

        // 1. Search Filter
        if (searchTerm) {
            const lowerCaseSearch = searchTerm.toLowerCase();
            hymnsToProcess = hymnsToProcess.filter(hymn =>
                hymn.id.toString().includes(lowerCaseSearch) ||
                (language === Language.ENGLISH ? hymn.title_en : hymn.title_yo).toLowerCase().includes(lowerCaseSearch) ||
                (language === Language.ENGLISH ? hymn.first_line_en : hymn.first_line_yo).toLowerCase().includes(lowerCaseSearch) ||
                hymn.category.toLowerCase().includes(lowerCaseSearch) ||
                hymn.tune_code.toLowerCase().includes(lowerCaseSearch) ||
                (language === Language.ENGLISH ? hymn.lyrics_en : hymn.lyrics_yo).some(stanza => stanza.lines.some(line => line.toLowerCase().includes(lowerCaseSearch)))
            );
        }

        // 2. Active Filter (Category or Chorus)
        if (activeFilter.type === 'category' && activeFilter.value) {
            hymnsToProcess = hymnsToProcess.filter(hymn => hymn.category === activeFilter.value);
        } else if (activeFilter.type === 'chorus') {
            hymnsToProcess = hymnsToProcess.filter(hymn => 
                (language === Language.ENGLISH ? hymn.lyrics_en : hymn.lyrics_yo).some(s => s.type === 'chorus')
            );
        }

        // 3. Sorting based on View Mode
        hymnsToProcess.sort((a, b) => {
            if (viewMode === 'list_title') {
                return (language === Language.ENGLISH ? a.title_en : a.title_yo).localeCompare(language === Language.ENGLISH ? b.title_en : b.title_yo);
            }
            return a.id - b.id; // Default sort by number for 'list_number' and 'category' views
        });

        return hymnsToProcess;
    }, [hymns, searchTerm, language, activeFilter, viewMode]);

    // Group hymns for category view
    const groupedHymns = useMemo(() => {
        if (viewMode !== 'category') return null;
        return processedHymns.reduce((acc, hymn) => {
            const category = hymn.category;
            if (!acc[category]) acc[category] = [];
            acc[category].push(hymn);
            return acc;
        }, {} as Record<string, Hymn[]>);
    }, [viewMode, processedHymns]);

    const toggleCategory = (category: string) => {
        setExpandedCategories(prev => {
            const newSet = new Set(prev);
            if (newSet.has(category)) newSet.delete(category);
            else newSet.add(category);
            return newSet;
        });
    };

    const handleSelectHymn = (hymn: Hymn) => {
        addToHistory(hymn.id);
        setActivePage(Page.HymnDetail, { hymn });
    };

    const handleCategorySelect = (category: string) => {
        setActiveFilter({ type: 'category', value: category });
        setIsCategoryModalOpen(false);
        setIsFabOpen(false);
    };

    const FabMenuItem: React.FC<{onClick: () => void, children: React.ReactNode}> = ({ onClick, children }) => (
         <button onClick={onClick} className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md">{children}</button>
    );
    
    return (
        <div className="relative min-h-full">
            {isSearchActive && (
                <div className="relative mb-6">
                    <input
                        ref={searchInputRef}
                        type="text"
                        placeholder={language === Language.ENGLISH ? 'Search by title, number, lyrics...' : 'Ṣàwárí pẹ̀lú àkọlé, nọ́mbà...'}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-10 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-full focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                    <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <button onClick={() => { setIsSearchActive(false); setSearchTerm(''); }} className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                       <XIcon className="w-5 h-5" />
                    </button>
                </div>
            )}
            
            {activeFilter.type !== 'none' && (
                 <div className="mb-4">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-primary-100 dark:bg-primary-900 text-primary-800 dark:text-primary-200">
                        {activeFilter.type === 'category' ? `${language === 'en' ? 'Category' : 'Ẹ̀ka'}: ${activeFilter.value}` : `${language === 'en' ? 'Has Chorus' : 'Pẹ̀lú Egbe'}`}
                        <button onClick={() => setActiveFilter({type: 'none'})} className="ml-2 -mr-1 p-0.5 rounded-full text-primary-600 dark:text-primary-200 hover:bg-primary-200 dark:hover:bg-primary-700">
                            <XIcon className="w-3 h-3" />
                        </button>
                    </span>
                 </div>
            )}

            {viewMode === 'category' && groupedHymns ? (
                <div className="space-y-3 pb-20">
                    {Object.entries(groupedHymns).map(([category, hymnsInCategory]) => (
                        <div key={category} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
                            <CategoryHeader 
                                category={category}
                                count={hymnsInCategory.length}
                                isExpanded={expandedCategories.has(category)}
                                onToggle={() => toggleCategory(category)}
                                language={language}
                            />
                            {expandedCategories.has(category) && (
                                <ul className="p-2 space-y-2">
                                    {hymnsInCategory.map(hymn => <HymnListItem key={hymn.id} hymn={hymn} onSelect={handleSelectHymn} />)}
                                </ul>
                            )}
                        </div>
                    ))}
                </div>
            ) : (
                <ul className="space-y-3 pb-20">
                    {processedHymns.length > 0 ? (
                        processedHymns.map(hymn => <HymnListItem key={hymn.id} hymn={hymn} onSelect={handleSelectHymn} />)
                    ) : (
                         <p className="text-center text-gray-500 dark:text-gray-400 mt-8">{language === 'en' ? 'No hymns found.' : 'Kò sí orin kankan.'}</p>
                    )}
                </ul>
            )}

            <div className="fixed bottom-6 right-6 z-20 flex flex-col items-end">
                {isFabOpen && (
                     <div className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl p-2 mb-2 w-56 border dark:border-gray-700">
                        <FabMenuItem onClick={() => { setIsSearchActive(true); setIsFabOpen(false); }}>
                            <div className="flex items-center">
                                <SearchIcon className="w-5 h-5 mr-3 text-gray-500 dark:text-gray-400" />
                                <span>{language === 'en' ? 'Search Hymns' : 'Ṣàwárí Orin'}</span>
                            </div>
                        </FabMenuItem>
                        <div className="border-t my-1 dark:border-gray-700"></div>
                        <div className="px-2 py-1 text-xs font-semibold text-gray-400">{language === 'en' ? 'View By' : 'Wo Nípa'}</div>
                        <FabMenuItem onClick={() => { setViewMode('list_number'); setIsFabOpen(false); }}>{language === 'en' ? 'List (by Number)' : 'Àkójọ (nípa Nọ́mbà)'}</FabMenuItem>
                        <FabMenuItem onClick={() => { setViewMode('list_title'); setIsFabOpen(false); }}>{language === 'en' ? 'List (by Title)' : 'Àkójọ (nípa Àkọlé)'}</FabMenuItem>
                        <FabMenuItem onClick={() => { setViewMode('category'); setIsFabOpen(false); }}>{language === 'en' ? 'Category' : 'Ẹ̀ka'}</FabMenuItem>
                        <div className="border-t my-1 dark:border-gray-700"></div>
                        <div className="px-2 py-1 text-xs font-semibold text-gray-400">{language === 'en' ? 'Filter By' : 'Sẹ́ Nípa'}</div>
                        <FabMenuItem onClick={() => setIsCategoryModalOpen(true)}>{language === 'en' ? 'Category' : 'Ẹ̀ka'}</FabMenuItem>
                        <FabMenuItem onClick={() => { setActiveFilter({type: 'chorus'}); setIsFabOpen(false); }}>{language === 'en' ? 'With Chorus' : 'Pẹ̀lú Egbe'}</FabMenuItem>
                        <FabMenuItem onClick={() => { setActiveFilter({type: 'none'}); setIsFabOpen(false); }}>{language === 'en' ? 'Show All' : 'Fi Gbogbo Rẹ̀ Hàn'}</FabMenuItem>
                     </div>
                )}
                <button
                    onClick={() => setIsFabOpen(!isFabOpen)}
                    className="p-4 bg-primary-600 text-white rounded-full shadow-lg hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-transform transform hover:scale-105"
                    aria-label={language === 'en' ? 'View and filter options' : 'Àwọn àṣàyàn wíwò àti sísẹ́'}
                >
                    {isFabOpen ? <XIcon className="w-6 h-6" /> : <FilterIcon className="w-6 h-6" />}
                </button>
            </div>
            
            {isCategoryModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 z-30 flex justify-center items-center p-4">
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md max-h-[80vh] flex flex-col">
                        <div className="p-4 border-b dark:border-gray-700 flex justify-between items-center">
                            <h3 className="text-xl font-semibold">{language === 'en' ? 'Select a Category' : 'Yan Ẹ̀ka Kan'}</h3>
                            <button onClick={() => setIsCategoryModalOpen(false)} className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700">
                                <XIcon className="w-5 h-5" />
                            </button>
                        </div>
                        <ul className="overflow-y-auto p-2">
                           {categories.map(category => (
                               <li key={category}>
                                   <button onClick={() => handleCategorySelect(category)} className="w-full text-left p-3 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700">
                                       {category}
                                   </button>
                               </li>
                           ))}
                        </ul>
                    </div>
                </div>
            )}
        </div>
    );
};

const FavoritesPage = () => {
    const context = useContext(AppContext);
    if (!context) return null;
    const { hymns, favorites, language, setActivePage, addToHistory } = context;
    
    const favoriteHymns = useMemo(() => hymns.filter(hymn => favorites.includes(hymn.id)), [hymns, favorites]);
    
    const handleSelectHymn = (hymn: Hymn) => {
        addToHistory(hymn.id);
        setActivePage(Page.HymnDetail, { hymn });
    };

    return (
        <div>
            <h2 className="text-2xl font-bold mb-4">{language === Language.ENGLISH ? 'Favorite Hymns' : 'Àwọn Orin Ayànfẹ́'}</h2>
            {favoriteHymns.length > 0 ? (
                <ul className="space-y-3">
                    {favoriteHymns.map(hymn => <HymnListItem key={hymn.id} hymn={hymn} onSelect={handleSelectHymn} />)}
                </ul>
            ) : (
                <p className="text-gray-500 dark:text-gray-400">{language === Language.ENGLISH ? 'You have no favorite hymns yet.' : 'O kò tíì ní orin ayànfẹ́ kankan.'}</p>
            )}
        </div>
    );
};

const HistoryPage = () => {
    const context = useContext(AppContext);
    if (!context) return null;
    const { hymns, history, language, setActivePage, addToHistory } = context;

    const historyHymns = useMemo(() => history.map(id => hymns.find(h => h.id === id)).filter(Boolean) as Hymn[], [history, hymns]);
    
    const handleSelectHymn = (hymn: Hymn) => {
        addToHistory(hymn.id);
        setActivePage(Page.HymnDetail, { hymn });
    };

    return (
        <div>
            <h2 className="text-2xl font-bold mb-4">{language === Language.ENGLISH ? 'Recently Viewed' : 'Àwọn Tí O Wò Láìpẹ́'}</h2>
            {historyHymns.length > 0 ? (
                <ul className="space-y-3">
                    {historyHymns.map(hymn => <HymnListItem key={`hist-${hymn.id}`} hymn={hymn} onSelect={handleSelectHymn} />)}
                </ul>
            ) : (
                <p className="text-gray-500 dark:text-gray-400">{language === Language.ENGLISH ? 'Your viewing history is empty.' : 'Ìtàn wíwò rẹ òfìfo ni.'}</p>
            )}
        </div>
    );
};

const DoctrinePage = () => {
    const context = useContext(AppContext);
    if (!context) return null;
    const { language } = context;

    return (
        <div className="max-w-4xl mx-auto bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
            <h2 className="text-3xl font-bold mb-4">{language === 'en' ? 'Our Doctrine' : 'Ẹ̀kọ́ Wa'}</h2>
            <p className="mb-4">{language === 'en' ? 'Here you can read about the core beliefs and doctrines of our church. These principles guide our worship, our community, and our daily lives.' : 'Níhìn-ín, o lè ka nípa àwọn ìgbàgbọ́ àti ẹ̀kọ́ ìjọ wa. Àwọn ìlànà wọ̀nyí ni ó ń darí ìjọsìn wa, àwùjọ wa, àti ìgbésí ayé wa ojoojúmọ́.'}</p>
            <div className="space-y-2 mb-8">
                <p><strong>{language === 'en' ? '1. The Holy Scriptures' : '1. Ìwé Mímọ́'}</strong></p>
                <p><strong>{language === 'en' ? '2. The Godhead' : '2. Mẹ́talọ́kan'}</strong></p>
                <p><strong>{language === 'en' ? '3. Man, His Fall and Redemption' : '3. Ènìyàn, Ìṣubú àti Ìràpadà Rẹ̀'}</strong></p>
            </div>
            <h3 className="text-2xl font-bold mb-4">{language === 'en' ? 'Find a Branch' : 'Wá Ẹ̀ka Ìjọ'}</h3>
            <div className="flex flex-col sm:flex-row gap-4">
                <input type="text" placeholder={language === 'en' ? "Enter your city or zip code" : "Tẹ ìlú tàbí koodu ìfìwéránṣẹ́"} className="flex-grow p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600" />
                <button className="px-6 py-2 bg-primary-600 text-white font-semibold rounded-md hover:bg-primary-700">{language === 'en' ? 'Search' : 'Wáà'}</button>
            </div>
        </div>
    );
};

const SettingsPage = () => {
    const context = useContext(AppContext);
    if (!context) return null;
    const { language, setLanguage, theme, setTheme, fontSize, setFontSize, isPro, setIsPro } = context;

    const SettingRow: React.FC<{label: string, children: React.ReactNode}> = ({label, children}) => (
        <div className="flex items-center justify-between py-4 border-b border-gray-200 dark:border-gray-700">
            <span className="text-lg">{label}</span>
            <div>{children}</div>
        </div>
    );

    return (
        <div className="max-w-2xl mx-auto bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
            <h2 className="text-3xl font-bold mb-6">{language === 'en' ? 'Settings' : 'Ètò'}</h2>
            <SettingRow label={language === 'en' ? 'Language' : 'Èdè'}>
                <div className="flex space-x-2">
                    <button onClick={() => setLanguage(Language.ENGLISH)} className={`px-4 py-1 rounded-full ${language === Language.ENGLISH ? 'bg-primary-600 text-white' : 'bg-gray-200 dark:bg-gray-600'}`}>English</button>
                    <button onClick={() => setLanguage(Language.YORUBA)} className={`px-4 py-1 rounded-full ${language === Language.YORUBA ? 'bg-primary-600 text-white' : 'bg-gray-200 dark:bg-gray-600'}`}>Yorùbá</button>
                </div>
            </SettingRow>
            <SettingRow label={language === 'en' ? 'Theme' : 'Àwọ̀'}>
                <button onClick={() => setTheme(theme === Theme.LIGHT ? Theme.DARK : Theme.LIGHT)} className="p-2 rounded-full bg-gray-200 dark:bg-gray-600">
                    {theme === Theme.LIGHT ? <MoonIcon className="w-6 h-6" /> : <SunIcon className="w-6 h-6" />}
                </button>
            </SettingRow>
            <SettingRow label={language === 'en' ? 'Font Size' : 'Ìwọ̀n Lẹ́tà'}>
                <div className="flex items-center space-x-2">
                    <button onClick={() => setFontSize(FontSize.SMALL)} className={`px-3 py-1 rounded-full ${fontSize === FontSize.SMALL ? 'bg-primary-600 text-white' : 'bg-gray-200 dark:bg-gray-600'}`}>A</button>
                    <button onClick={() => setFontSize(FontSize.MEDIUM)} className={`px-3 py-1 rounded-full text-lg ${fontSize === FontSize.MEDIUM ? 'bg-primary-600 text-white' : 'bg-gray-200 dark:bg-gray-600'}`}>A</button>
                    <button onClick={() => setFontSize(FontSize.LARGE)} className={`px-3 py-1 rounded-full text-xl ${fontSize === FontSize.LARGE ? 'bg-primary-600 text-white' : 'bg-gray-200 dark:bg-gray-600'}`}>A</button>
                </div>
            </SettingRow>
            <SettingRow label={language === 'en' ? 'Pro Access' : 'Ànfàní Pro'}>
                 <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" checked={isPro} onChange={() => setIsPro(!isPro)} className="sr-only peer" />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 dark:peer-focus:ring-primary-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary-600"></div>
                </label>
            </SettingRow>
        </div>
    );
};

const SimpleInfoPage: React.FC<{title: string, content: string}> = ({ title, content }) => {
    return (
        <div className="max-w-2xl mx-auto bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
            <h2 className="text-3xl font-bold mb-4">{title}</h2>
            <p className="text-lg whitespace-pre-wrap">{content}</p>
        </div>
    );
};


export const PageRenderer = () => {
    const context = useContext(AppContext);
    if (!context) {
        return <div className="text-center p-8">Loading...</div>;
    }
    const { activePage, pageContext, language, loading, hymns } = context;

    // Display a loading indicator while hymns are being fetched.
    if (loading) {
        return (
            <div className="flex justify-center items-center h-full">
                <p className="text-lg text-gray-500 dark:text-gray-400">
                    {language === 'en' ? 'Loading Hymns...' : 'Ó ń gbé àwọn orin wọlé...'}
                </p>
            </div>
        );
    }

    // After loading, if no hymns are available, show an error.
    // This also prevents crashes in components that expect hymns to exist.
    if (hymns.length === 0) {
        return (
            <div className="flex justify-center items-center h-full">
                <p className="text-lg text-red-500">
                    {language === 'en' ? 'Could not load hymn data.' : 'Kò lè gbé àwọn orin wọlé.'}
                </p>
            </div>
        );
    }


    switch (activePage) {
        case Page.Home:
            return <HomePage />;
        case Page.HymnLibrary:
            return <HymnLibraryPage />;
        case Page.HymnDetail:
            return pageContext?.hymn ? <HymnDetail hymn={pageContext.hymn} /> : <HymnLibraryPage />;
        case Page.Favorites:
            return <FavoritesPage />;
        case Page.History:
            return <HistoryPage />;
        case Page.ChurchDoctrine:
            return <DoctrinePage />;
        case Page.UpdateHymns:
            return <SimpleInfoPage 
                title={language === 'en' ? 'Update Hymns' : 'Ṣe Àtúnṣe Orin'} 
                content={language === 'en' ? 'Hymns are updated periodically by the development team. Please ensure you have the latest version of the app to receive new hymns and corrections.' : 'Àwọn orin ni a máa ń ṣe àtúnṣe sí nígbà gbogbo láti ọwọ́ àwọn tó ń ṣe ìdàgbàsókè. Jọ̀wọ́ rí i dájú pé o ní ẹ̀yà tuntun ìṣàfilọ́lẹ̀ náà láti gba àwọn orin tuntun àti àwọn àtúnṣe.'}
            />;
        case Page.Credits:
            return <SimpleInfoPage 
                title={language === 'en' ? 'Credits' : 'Ìdúpẹ́'} 
                content={language === 'en' ? 'This app was developed with love for the glory of God.\n\nSpecial thanks to all contributors and the open-source community.' : 'Ìṣàfilọ́lẹ̀ yíì jẹ́ dídá pẹ̀lú ìfẹ́ fún ògo Ọlọ́run.\n\nỌpẹ́ pàtàkì sí gbogbo àwọn olùrànlọ́wọ́ àti àwùjọ open-source.'}
            />;
        case Page.Donate:
            return <SimpleInfoPage 
                title={language === 'en' ? 'Donate' : 'Ṣe Ìtọrẹ'} 
                content={language === 'en' ? 'Your generous donations help us maintain and improve this app. Your support allows us to add new features, expand the hymn library, and keep the app free for everyone.\n\nThank you for your support!' : 'Ìtọrẹ onínúure rẹ ń ràn wá lọ́wọ́ láti tọ́jú àti láti mú ìṣàfilọ́lẹ̀ yíì dára síi. Ìtìlẹ́yìn rẹ jẹ́ kí a lè fi àwọn nǹkan tuntun kún un, mú kí àkójọpọ̀ orin pọ̀ síi, àti láti jẹ́ kí ìṣàfilọ́lẹ̀ náà wà ní ọ̀fẹ́ fún gbogbo ènìyàn.\n\nẸ ṣeun fún ìtìlẹ́yìn yín!'}
            />;
        case Page.Settings:
            return <SettingsPage />;
        default:
            return <HomePage />;
    }
};