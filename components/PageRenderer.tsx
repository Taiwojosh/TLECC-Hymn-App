
import React, { useContext, useState, useMemo, useRef, useEffect } from 'react';
import { AppContext } from '../contexts/AppContext';
import { Hymn, Language, Page, Stanza, ServiceHymnSlot, Bookmark } from '../types';
import { ChevronLeftIcon, HeartIcon, PlayIcon, SearchIcon, ShareIcon, SunIcon, MoonIcon, TrashIcon, FilterIcon, XIcon, FontSizeIcon, ChevronDownIcon, HistoryIcon, FacebookIcon, TwitterIcon, InstagramIcon, DesktopIcon, BookmarkIcon, InfoIcon } from './Icons';
import { Theme, FontSize } from '../types';


// HymnList Component
const HymnListItem: React.FC<{hymn: Hymn, onSelect: (hymn: Hymn) => void}> = ({hymn, onSelect}) => {
    const context = useContext(AppContext);
    if (!context) return null;
    const { hymnLanguage, isFavorite } = context;

    return (
        <li
            onClick={() => onSelect(hymn)}
            className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm hover:shadow-md transition-shadow cursor-pointer"
        >
            <div className="flex items-center">
                <div className="text-lg font-bold text-primary-600 dark:text-primary-400 w-12 text-center">{hymn.id}</div>
                <div className="ml-4">
                    <p className="font-semibold text-gray-800 dark:text-gray-200">
                        {hymnLanguage === Language.ENGLISH ? hymn.title_en : hymn.title_yo}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        {hymnLanguage === Language.ENGLISH ? hymn.first_line_en : hymn.first_line_yo}
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
    const { appLanguage, hymnLanguage, setHymnLanguage, fontSize, setFontSize, isFavorite, toggleFavorite, bookmarks, setServiceHymn, setCustomBookmark, removeCustomBookmark, getCustomBookmark, getServiceHymnSlot, addToHistory } = context;

    const [isFontControlOpen, setIsFontControlOpen] = useState(false);
    const [isBookmarkPopoverOpen, setBookmarkPopoverOpen] = useState(false);
    const [customNote, setCustomNote] = useState(getCustomBookmark(hymn.id)?.type === 'custom' ? (getCustomBookmark(hymn.id) as any).description : '');

    const fontControlRef = useRef<HTMLDivElement>(null);
    const bookmarkPopoverRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (fontControlRef.current && !fontControlRef.current.contains(event.target as Node)) setIsFontControlOpen(false);
            if (bookmarkPopoverRef.current && !bookmarkPopoverRef.current.contains(event.target as Node)) setBookmarkPopoverOpen(false);
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);
    
    useEffect(() => {
        setCustomNote(getCustomBookmark(hymn.id)?.type === 'custom' ? (getCustomBookmark(hymn.id) as any).description : '');
    }, [hymn.id, getCustomBookmark]);

    const lyrics = hymnLanguage === Language.ENGLISH ? hymn.lyrics_en : hymn.lyrics_yo;
    const lyricsAvailable = lyrics && lyrics.length > 0;
    
    const fontSizes: Record<FontSize, string> = { [FontSize.SMALL]: 'text-base', [FontSize.MEDIUM]: 'text-lg', [FontSize.LARGE]: 'text-xl' };
    
    const isBookmarked = !!getCustomBookmark(hymn.id) || !!getServiceHymnSlot(hymn.id);
    const serviceSlots: ServiceHymnSlot[] = ['opening', 'sermon', 'closing'];
    const serviceHymnsBySlot = useMemo(() => {
        return bookmarks.reduce((acc, bm) => {
            if (bm.type === 'service') acc[bm.slot] = bm;
            return acc;
        }, {} as Record<ServiceHymnSlot, Bookmark | undefined>);
    }, [bookmarks]);


    const handleShare = async () => {
        const title = hymnLanguage === Language.ENGLISH ? hymn.title_en : hymn.title_yo;
        const textToShare = `${title}\n\n${lyrics.map(stanza => stanza.lines.join('\n')).join('\n\n')}`;

        if(navigator.share) {
            try {
                await navigator.share({ title: title, text: textToShare });
            } catch (error) {
                console.error('Error sharing:', error);
            }
        } else {
            navigator.clipboard.writeText(textToShare).then(() => alert('Hymn copied to clipboard!'));
        }
    };
    
    const handleSaveNote = () => {
        if(customNote.trim()) {
            setCustomBookmark(hymn.id, customNote.trim());
        } else {
            removeCustomBookmark(hymn.id);
        }
        setBookmarkPopoverOpen(false);
    };

    return (
        <div className="max-w-4xl mx-auto">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
                <div className="flex justify-between items-start mb-4">
                    <div>
                        <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
                            {hymn.id}. {hymnLanguage === Language.ENGLISH ? hymn.title_en : hymn.title_yo}
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
                                    <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 px-2 py-1">{appLanguage === Language.ENGLISH ? 'Font Size' : 'Ìwọ̀n Lẹ́tà'}</p>
                                    <div className="flex items-center justify-around mt-2">
                                        <button onClick={() => { setFontSize(FontSize.SMALL); setIsFontControlOpen(false); }} className={`w-10 h-10 flex items-center justify-center rounded-full ${fontSize === FontSize.SMALL ? 'bg-primary-600 text-white' : 'bg-gray-200 dark:bg-gray-600'}`} aria-pressed={fontSize === FontSize.SMALL}><span className="text-sm font-bold">A</span></button>
                                        <button onClick={() => { setFontSize(FontSize.MEDIUM); setIsFontControlOpen(false); }} className={`w-10 h-10 flex items-center justify-center rounded-full ${fontSize === FontSize.MEDIUM ? 'bg-primary-600 text-white' : 'bg-gray-200 dark:bg-gray-600'}`} aria-pressed={fontSize === FontSize.MEDIUM}><span className="text-base font-bold">A</span></button>
                                        <button onClick={() => { setFontSize(FontSize.LARGE); setIsFontControlOpen(false); }} className={`w-10 h-10 flex items-center justify-center rounded-full ${fontSize === FontSize.LARGE ? 'bg-primary-600 text-white' : 'bg-gray-200 dark:bg-gray-600'}`} aria-pressed={fontSize === FontSize.LARGE}><span className="text-lg font-bold">A</span></button>
                                    </div>
                                </div>
                            )}
                        </div>
                        {/* Bookmark Control */}
                        <div className="relative" ref={bookmarkPopoverRef}>
                            <button onClick={() => setBookmarkPopoverOpen(prev => !prev)} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700" aria-label="Bookmark hymn">
                                <BookmarkIcon className={`w-6 h-6 transition-colors ${isBookmarked ? 'text-primary-600 fill-current' : 'text-gray-600 dark:text-gray-300'}`} />
                            </button>
                            {isBookmarkPopoverOpen && (
                                <div className="absolute right-0 mt-2 w-72 bg-white dark:bg-gray-800 rounded-lg shadow-xl border dark:border-gray-700 z-20 p-4">
                                    <div className="flex items-start bg-yellow-50 dark:bg-gray-700 p-2 rounded-md mb-4">
                                        <InfoIcon className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mr-2 flex-shrink-0 mt-0.5"/>
                                        <p className="text-xs text-yellow-800 dark:text-yellow-200">{appLanguage === 'en' ? 'Bookmarks are stored on this device and cannot be recovered if browser data is cleared.' : 'Àwọn àmì ìwé wà ní pamọ́ sínú ẹ̀rọ yìí, a kò lè gbà wọ́n padà tí a bá pa data trình duyệt rẹ́.'}</p>
                                    </div>
                                    
                                    <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 block mb-2">{appLanguage === 'en' ? 'Add a Note' : 'Fi Àkíyèsí Kún Un'}</label>
                                    <textarea value={customNote} onChange={(e) => setCustomNote(e.target.value)} rows={3} placeholder={appLanguage === 'en' ? 'Your note...' : 'Àkíyèsí rẹ...'} className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 text-sm mb-2"></textarea>
                                    <button onClick={handleSaveNote} className="w-full px-4 py-2 bg-primary-600 text-white text-sm font-semibold rounded-md hover:bg-primary-700">{appLanguage === 'en' ? 'Save Note' : 'Gba Àkíyèsí sílẹ̀'}</button>
                                    
                                    <div className="border-t dark:border-gray-600 my-4"></div>
                                    
                                    <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">{appLanguage === 'en' ? 'Set as Service Hymn' : 'Ṣètò Gẹ́gẹ́ bí Orin Ìsìn'}</h4>
                                    <div className="space-y-2">
                                        {serviceSlots.map(slot => {
                                            const hymnInSlot = serviceHymnsBySlot[slot];
                                            const isThisHymnInSlot = hymnInSlot?.hymnId === hymn.id;
                                            return (
                                                <button key={slot} onClick={() => setServiceHymn(slot, isThisHymnInSlot ? null : hymn.id)} className={`w-full text-left p-2 rounded-md text-sm transition-colors ${isThisHymnInSlot ? 'bg-primary-100 dark:bg-primary-900 text-primary-800 dark:text-primary-200' : 'hover:bg-gray-100 dark:hover:bg-gray-700'}`}>
                                                    <span>{appLanguage === 'en' ? `${slot.charAt(0).toUpperCase() + slot.slice(1)} Hymn` : `Orin ${slot === 'opening' ? 'Ìbẹ̀rẹ̀' : slot === 'sermon' ? 'Ìwàásù' : 'Ìparí'}`}</span>
                                                    {hymnInSlot && !isThisHymnInSlot && <span className="text-xs text-gray-500 ml-2">(#{hymnInSlot.hymnId})</span>}
                                                </button>
                                            )
                                        })}
                                    </div>
                                </div>
                            )}
                        </div>
                        <button onClick={handleShare} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700" aria-label="Share hymn"> <ShareIcon className="w-6 h-6 text-gray-600 dark:text-gray-300"/> </button>
                        <button onClick={() => toggleFavorite(hymn.id)} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700" aria-label="Toggle favorite"> <HeartIcon className={`w-6 h-6 transition-colors ${isFavorite(hymn.id) ? 'text-red-500 fill-current' : 'text-gray-600 dark:text-gray-300'}`} /> </button>
                    </div>
                </div>

                <div className="flex space-x-2 border border-gray-300 dark:border-gray-600 rounded-full p-1 w-fit mb-6">
                    <button onClick={() => setHymnLanguage(Language.ENGLISH)} className={`px-4 py-1 rounded-full text-sm font-semibold transition-colors ${hymnLanguage === Language.ENGLISH ? 'bg-primary-600 text-white' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'}`} aria-pressed={hymnLanguage === Language.ENGLISH}> English </button>
                    <button onClick={() => setHymnLanguage(Language.YORUBA)} className={`px-4 py-1 rounded-full text-sm font-semibold transition-colors ${hymnLanguage === Language.YORUBA ? 'bg-primary-600 text-white' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'}`} aria-pressed={hymnLanguage === Language.YORUBA}> Yorùbá </button>
                </div>
                
                <div className={`lyrics leading-relaxed ${fontSizes[fontSize]}`}>
                    {lyricsAvailable ? (
                        (() => {
                            let stanzaCounter = 0;
                            return lyrics.map((stanza: Stanza, index: number) => {
                                if (stanza.type === 'stanza') {
                                    stanzaCounter++;
                                }
                                return (
                                    <div key={index} className="mb-6">
                                        {stanza.type === 'chorus' ? (
                                            <div className="italic">
                                                <p className="font-bold mb-2">{hymnLanguage === Language.ENGLISH ? 'Chorus' : 'Egbe'}</p>
                                                {stanza.lines.map((line, lineIndex) => (
                                                    <p key={lineIndex}>{line}</p>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="flex">
                                                <span className="w-6 flex-shrink-0 font-bold text-gray-500 dark:text-gray-400 select-none">{stanzaCounter}.</span>
                                                <div className="flex-1">
                                                    {stanza.lines.map((line, lineIndex) => (
                                                        <p key={lineIndex}>{line}</p>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                );
                            });
                        })()
                    ) : (
                        <p className="text-gray-500 dark:text-gray-400 italic">{hymnLanguage === Language.ENGLISH ? 'Lyrics not available in English.' : 'Àkọlé orin kò sí ní èdè Yorùbá.'}</p>
                    )}
                </div>
            </div>
        </div>
    );
};


// Pages

const CategoryHeader: React.FC<{ category: string, count: number, isExpanded: boolean, onToggle: () => void, language: Language }> = ({ category, count, isExpanded, onToggle, language }) => (
    <button onClick={onToggle} className="w-full flex justify-between items-center p-4 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-left transition-colors">
        <div>
            <span className="font-semibold text-gray-800 dark:text-gray-200">{category}</span>
            <span className="text-sm text-gray-500 dark:text-gray-400 ml-2">({count} {language === 'en' ? (count > 1 ? 'hymns' : 'hymn') : 'orin'})</span>
        </div>
        <ChevronDownIcon className={`w-5 h-5 text-gray-500 dark:text-gray-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
    </button>
);

const EmptyState: React.FC<{ title: string, message: string, icon?: React.ReactNode }> = ({ title, message, icon }) => (
    <div className="text-center text-gray-500 dark:text-gray-400 mt-8 px-4 py-12">
        {icon || <SearchIcon className="w-16 h-16 mx-auto text-gray-300 dark:text-gray-600 mb-4" />}
        <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-2">{title}</h3>
        <p>{message}</p>
    </div>
);


const HymnLibraryPage = () => {
    const context = useContext(AppContext);
    if (!context) return null;
    const { hymns, appLanguage, hymnLanguage, setHymnLanguage, setActivePage, addToHistory, recentSearches, addRecentSearch, clearRecentSearches } = context;
    
    const [searchTerm, setSearchTerm] = useState('');
    const [isSearchActive, setIsSearchActive] = useState(false);
    const [isSearchFocused, setIsSearchFocused] = useState(false);
    const [isFabOpen, setIsFabOpen] = useState(false);
    const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
    const [activeFilter, setActiveFilter] = useState<{ type: 'none' | 'chorus' | 'category', value?: string }>({ type: 'none' });
    const [viewMode, setViewMode] = useState<'list_number' | 'list_title' | 'category'>('list_number');
    const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
    const searchInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (isSearchActive) searchInputRef.current?.focus();
    }, [isSearchActive]);

    const categories = useMemo(() => Array.from(new Set(hymns.map(h => h.category))).sort(), [hymns]);

    const processedHymns = useMemo(() => {
        let hymnsToProcess = [...hymns];

        if (searchTerm) {
            const lowerCaseSearch = searchTerm.toLowerCase();
            const calculateScore = (hymn: Hymn) => {
                let score = 0;
                const title = hymnLanguage === Language.ENGLISH ? hymn.title_en : hymn.title_yo;
                const firstLine = hymnLanguage === Language.ENGLISH ? hymn.first_line_en : hymn.first_line_yo;
                const lyrics = hymnLanguage === Language.ENGLISH ? hymn.lyrics_en : hymn.lyrics_yo;
                if (hymn.id.toString().includes(lowerCaseSearch)) score += 50 + (hymn.id.toString() === lowerCaseSearch ? 50 : 0);
                if (title.toLowerCase().includes(lowerCaseSearch)) score += 40 + (title.toLowerCase().startsWith(lowerCaseSearch) ? 10 : 0);
                if (firstLine.toLowerCase().includes(lowerCaseSearch)) score += 20 + (firstLine.toLowerCase().startsWith(lowerCaseSearch) ? 10 : 0);
                if (hymn.tune_code.toLowerCase().replace(/[. ]/g, '').includes(lowerCaseSearch.replace(/[. ]/g, ''))) score += 15;
                if (hymn.category.toLowerCase().includes(lowerCaseSearch)) score += 10;
                if (lyrics.some(s => s.lines.some(l => l.toLowerCase().includes(lowerCaseSearch)))) score += 5;
                return score;
            };
            hymnsToProcess = hymnsToProcess.map(hymn => ({ hymn, score: calculateScore(hymn) })).filter(item => item.score > 0).sort((a, b) => b.score - a.score).map(item => item.hymn);
        }

        if (activeFilter.type === 'category' && activeFilter.value) hymnsToProcess = hymnsToProcess.filter(h => h.category === activeFilter.value);
        else if (activeFilter.type === 'chorus') hymnsToProcess = hymnsToProcess.filter(h => (hymnLanguage === Language.ENGLISH ? h.lyrics_en : h.lyrics_yo).some(s => s.type === 'chorus'));

        if (!searchTerm) {
            hymnsToProcess.sort((a, b) => viewMode === 'list_title' ? (hymnLanguage === Language.ENGLISH ? a.title_en : a.title_yo).localeCompare(hymnLanguage === Language.ENGLISH ? b.title_en : b.title_yo) : a.id - b.id);
        }

        return hymnsToProcess;
    }, [hymns, searchTerm, hymnLanguage, activeFilter, viewMode]);

    const groupedHymns = useMemo(() => {
        if (viewMode !== 'category') return null;
        return processedHymns.reduce((acc, hymn) => {
            const category = hymn.category;
            if (!acc[category]) acc[category] = [];
            acc[category].push(hymn);
            return acc;
        }, {} as Record<string, Hymn[]>);
    }, [viewMode, processedHymns]);

    const toggleCategory = (category: string) => setExpandedCategories(prev => { const newSet = new Set(prev); newSet.has(category) ? newSet.delete(category) : newSet.add(category); return newSet; });
    const handleSelectHymn = (hymn: Hymn) => { addToHistory(hymn.id); setActivePage(Page.HymnDetail, { hymn }); };
    const handleCategorySelect = (category: string) => { setActiveFilter({ type: 'category', value: category }); setIsCategoryModalOpen(false); setIsFabOpen(false); };
    const handleSearchSubmit = () => { if (searchTerm.trim()) { addRecentSearch(searchTerm.trim()); searchInputRef.current?.blur(); } };
    const handleRecentSearchClick = (search: string) => { setSearchTerm(search); addRecentSearch(search); setIsSearchFocused(false); };
    const FabMenuItem: React.FC<{onClick: () => void, children: React.ReactNode}> = ({ onClick, children }) => ( <button onClick={onClick} className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md">{children}</button> );
    
    const searchEmptyState = <EmptyState 
        title={searchTerm ? (appLanguage === 'en' ? 'No Results Found' : 'Kò Rí Àbájáde Kankan') : (appLanguage === 'en' ? 'No Hymns to Display' : 'Kò Sí Orin Láti Fi Hàn')}
        message={searchTerm ? `${appLanguage === 'en' ? `We couldn't find any hymns matching ` : `A kò rí orin kankan tó bámu `}"${searchTerm}". ${appLanguage === 'en' ? 'Try searching for something else.' : 'Gbìyànjú wá nǹkan mìíràn.'}` : (appLanguage === 'en' ? 'There are no hymns matching your current filters.' : 'Kò sí orin kankan tó bá àwọn asẹ́ rẹ mu.')}
    />;

    return (
        <div className="relative min-h-full">
            {isSearchActive ? (
                <div className="relative mb-6">
                    <input ref={searchInputRef} type="text" placeholder={appLanguage === 'en' ? 'Search by title, number, lyrics...' : 'Ṣàwárí pẹ̀lú àkọlé, nọ́mbà...'} value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} onFocus={() => setIsSearchFocused(true)} onBlur={() => setTimeout(() => setIsSearchFocused(false), 200)} onKeyDown={(e) => { if (e.key === 'Enter') handleSearchSubmit(); }} className="w-full pl-10 pr-10 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-full focus:outline-none focus:ring-2 focus:ring-primary-500" />
                    <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <button onClick={() => { setIsSearchActive(false); setSearchTerm(''); }} className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"> <XIcon className="w-5 h-5" /> </button>
                    {isSearchFocused && searchTerm.length === 0 && recentSearches.length > 0 && (
                        <div className="absolute top-full mt-2 w-full bg-white dark:bg-gray-800 rounded-lg shadow-lg border dark:border-gray-700 z-10 py-2">
                            <div className="flex justify-between items-center px-4 pb-2 mb-2 border-b dark:border-gray-600">
                                <h4 className="text-sm font-semibold text-gray-500 dark:text-gray-400">{appLanguage === 'en' ? 'Recent Searches' : 'Àwọn Ìwárí Àìpẹ́'}</h4>
                                <button onClick={clearRecentSearches} className="text-sm text-primary-600 dark:text-primary-400 hover:underline">{appLanguage === 'en' ? 'Clear' : 'Paarẹ́'}</button>
                            </div>
                            <ul className="max-h-60 overflow-y-auto">
                                {recentSearches.map((search, index) => ( <li key={index}><button className="w-full text-left px-4 py-2 flex items-center text-gray-800 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors" onClick={() => handleRecentSearchClick(search)}><HistoryIcon className="w-4 h-4 mr-3 text-gray-400"/>{search}</button></li>))}
                            </ul>
                        </div>
                    )}
                </div>
            ) : (
                <div className="flex justify-center items-center mb-4 space-x-4">
                    <div className="flex space-x-1 border border-gray-300 dark:border-gray-600 rounded-full p-1 w-fit">
                        <button onClick={() => setHymnLanguage(Language.YORUBA)} className={`px-4 py-1 rounded-full text-sm font-semibold transition-colors ${hymnLanguage === Language.YORUBA ? 'bg-primary-600 text-white' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'}`} aria-pressed={hymnLanguage === Language.YORUBA}> Yorùbá </button>
                        <button onClick={() => setHymnLanguage(Language.ENGLISH)} className={`px-4 py-1 rounded-full text-sm font-semibold transition-colors ${hymnLanguage === Language.ENGLISH ? 'bg-primary-600 text-white' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'}`} aria-pressed={hymnLanguage === Language.ENGLISH}> English </button>
                    </div>
                    <button onClick={() => setIsSearchActive(true)} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 dark:ring-offset-gray-800 focus:ring-primary-500" aria-label={appLanguage === 'en' ? 'Search Hymns' : 'Ṣàwárí Orin'}> <SearchIcon className="w-6 h-6 text-gray-600 dark:text-gray-400" /> </button>
                </div>
            )}
            
            {activeFilter.type !== 'none' && ( <div className="mb-4"><span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-primary-100 dark:bg-primary-900 text-primary-800 dark:text-primary-200">{activeFilter.type === 'category' ? `${appLanguage === 'en' ? 'Category' : 'Ẹ̀ka'}: ${activeFilter.value}` : `${appLanguage === 'en' ? 'Has Chorus' : 'Pẹ̀lú Egbe'}`}<button onClick={() => setActiveFilter({type: 'none'})} className="ml-2 -mr-1 p-0.5 rounded-full text-primary-600 dark:text-primary-200 hover:bg-primary-200 dark:hover:bg-primary-700"><XIcon className="w-3 h-3" /></button></span></div>)}

            {viewMode === 'category' && groupedHymns ? (
                <div className="space-y-3 pb-20">
                    {Object.keys(groupedHymns).length > 0 ? Object.entries(groupedHymns).map(([category, hymnsInCategory]) => (<div key={category} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden"><CategoryHeader category={category} count={hymnsInCategory.length} isExpanded={expandedCategories.has(category)} onToggle={() => toggleCategory(category)} language={appLanguage} />{expandedCategories.has(category) && (<ul className="p-2 space-y-2">{hymnsInCategory.map(hymn => <HymnListItem key={hymn.id} hymn={hymn} onSelect={handleSelectHymn} />)}</ul>)}</div>)) : searchEmptyState}
                </div>
            ) : (
                <ul className="space-y-3 pb-20">
                    {processedHymns.length > 0 ? processedHymns.map(hymn => <HymnListItem key={hymn.id} hymn={hymn} onSelect={handleSelectHymn} />) : searchEmptyState}
                </ul>
            )}

            <div className="fixed bottom-6 right-6 z-20 flex flex-col items-end">
                {isFabOpen && ( <div className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl p-2 mb-2 w-56 border dark:border-gray-700"><div className="px-2 py-1 text-xs font-semibold text-gray-400">{appLanguage === 'en' ? 'View By' : 'Wo Nípa'}</div><FabMenuItem onClick={() => { setViewMode('list_number'); setIsFabOpen(false); }}>{appLanguage === 'en' ? 'List (by Number)' : 'Àkójọ (nípa Nọ́mbà)'}</FabMenuItem><FabMenuItem onClick={() => { setViewMode('list_title'); setIsFabOpen(false); }}>{appLanguage === 'en' ? 'List (by Title)' : 'Àkójọ (nípa Àkọlé)'}</FabMenuItem><FabMenuItem onClick={() => { setViewMode('category'); setIsFabOpen(false); }}>{appLanguage === 'en' ? 'Category' : 'Ẹ̀ka'}</FabMenuItem><div className="border-t my-1 dark:border-gray-700"></div><div className="px-2 py-1 text-xs font-semibold text-gray-400">{appLanguage === 'en' ? 'Filter By' : 'Sẹ́ Nípa'}</div><FabMenuItem onClick={() => setIsCategoryModalOpen(true)}>{appLanguage === 'en' ? 'Category' : 'Ẹ̀ka'}</FabMenuItem><FabMenuItem onClick={() => { setActiveFilter({type: 'chorus'}); setIsFabOpen(false); }}>{appLanguage === 'en' ? 'With Chorus' : 'Pẹ̀lú Egbe'}</FabMenuItem><FabMenuItem onClick={() => { setActiveFilter({type: 'none'}); setIsFabOpen(false); }}>{appLanguage === 'en' ? 'Show All' : 'Fi Gbogbo Rẹ̀ Hàn'}</FabMenuItem></div>)}
                <button onClick={() => setIsFabOpen(!isFabOpen)} className="p-4 bg-primary-600 text-white rounded-full shadow-lg hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-transform transform hover:scale-105" aria-label={appLanguage === 'en' ? 'View and filter options' : 'Àwọn àṣàyàn wíwò àti sísẹ́'}>{isFabOpen ? <XIcon className="w-6 h-6" /> : <FilterIcon className="w-6 h-6" />}</button>
            </div>
            
            {isCategoryModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 z-30 flex justify-center items-center p-4">
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md max-h-[80vh] flex flex-col">
                        <div className="p-4 border-b dark:border-gray-700 flex justify-between items-center"><h3 className="text-xl font-semibold">{appLanguage === 'en' ? 'Select a Category' : 'Yan Ẹ̀ka Kan'}</h3><button onClick={() => setIsCategoryModalOpen(false)} className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"><XIcon className="w-5 h-5" /></button></div>
                        <ul className="overflow-y-auto p-2">{categories.map(category => (<li key={category}><button onClick={() => handleCategorySelect(category)} className="w-full text-left p-3 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700">{category}</button></li>))}</ul>
                    </div>
                </div>
            )}
        </div>
    );
};

const FavoritesPage = () => {
    const context = useContext(AppContext);
    if (!context) return null;
    const { hymns, favorites, appLanguage, setActivePage, addToHistory } = context;
    
    const favoriteHymns = useMemo(() => hymns.filter(hymn => favorites.includes(hymn.id)), [hymns, favorites]);
    
    const handleSelectHymn = (hymn: Hymn) => { addToHistory(hymn.id); setActivePage(Page.HymnDetail, { hymn }); };

    return (
        <div>
            <h2 className="text-2xl font-bold mb-4">{appLanguage === Language.ENGLISH ? 'Favorite Hymns' : 'Àwọn Orin Ayànfẹ́'}</h2>
            {favoriteHymns.length > 0 ? (
                <ul className="space-y-3">
                    {favoriteHymns.map(hymn => <HymnListItem key={hymn.id} hymn={hymn} onSelect={handleSelectHymn} />)}
                </ul>
            ) : (
                 <EmptyState 
                    icon={<HeartIcon className="w-16 h-16 mx-auto text-gray-300 dark:text-gray-600 mb-4" />}
                    title={appLanguage === 'en' ? 'No Favorites Yet' : 'Kò sí Àwọn Ayànfẹ́ Síbẹ̀'}
                    message={appLanguage === 'en' ? 'Tap the heart icon on any hymn to add it to your favorites.' : 'Tẹ àmì ọkàn lórí orin èyíkéyìí láti fi kún àwọn ayànfẹ́ rẹ.'}
                />
            )}
        </div>
    );
};

const BookmarksPage = () => {
    const context = useContext(AppContext);
    if (!context) return null;
    const { hymns, bookmarks, appLanguage, setActivePage, addToHistory, setServiceHymn, removeCustomBookmark } = context;

    const serviceSlots: ServiceHymnSlot[] = ['opening', 'sermon', 'closing'];

    const { serviceHymns, customBookmarks } = useMemo(() => {
        const service: Record<string, Hymn | null> = {};
        const custom: { hymn: Hymn, description: string }[] = [];
        
        const serviceBookmarks = bookmarks.filter(b => b.type === 'service');
        for (const slot of serviceSlots) {
            const bm = serviceBookmarks.find(b => (b as any).slot === slot);
            service[slot] = bm ? hymns.find(h => h.id === bm.hymnId) || null : null;
        }

        const customBms = bookmarks.filter(b => b.type === 'custom').sort((a,b) => b.createdAt - a.createdAt);
        for(const bm of customBms){
            const hymn = hymns.find(h => h.id === bm.hymnId);
            if(hymn) custom.push({ hymn, description: (bm as any).description });
        }
        
        return { serviceHymns: service, customBookmarks: custom };
    }, [bookmarks, hymns]);

    const handleSelectHymn = (hymn: Hymn) => {
        addToHistory(hymn.id);
        setActivePage(Page.HymnDetail, { hymn });
    };
    
    const noBookmarks = customBookmarks.length === 0 && Object.values(serviceHymns).every(h => h === null);

    if (noBookmarks) {
        return (
            <EmptyState 
                icon={<BookmarkIcon className="w-16 h-16 mx-auto text-gray-300 dark:text-gray-600 mb-4" />}
                title={appLanguage === 'en' ? 'No Bookmarks Yet' : 'Kò sí Àwọn Àmì Ìwé Síbẹ̀'}
                message={appLanguage === 'en' ? 'You can bookmark hymns from the hymn detail page to see them here.' : 'O le fi àmì ìwé sí àwọn orin láti ojú-ewé ìwé orin láti rí wọn níbí.'}
            />
        );
    }

    return (
        <div className="space-y-8">
            <div>
                <h2 className="text-2xl font-bold mb-4">{appLanguage === 'en' ? 'Service Hymns' : 'Àwọn Orin Ìsìn'}</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {serviceSlots.map(slot => (
                        <div key={slot} className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm">
                            <h3 className="font-semibold text-gray-800 dark:text-gray-200 mb-2">{appLanguage === 'en' ? `${slot.charAt(0).toUpperCase() + slot.slice(1)} Hymn` : `Orin ${slot === 'opening' ? 'Ìbẹ̀rẹ̀' : slot === 'sermon' ? 'Ìwàásù' : 'Ìparí'}`}</h3>
                            {serviceHymns[slot] ? (
                                <div>
                                    <div onClick={() => handleSelectHymn(serviceHymns[slot]!)} className="p-3 bg-gray-50 dark:bg-gray-700 rounded-md cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 mb-2">
                                        <p className="font-semibold text-primary-600 dark:text-primary-400">#{serviceHymns[slot]!.id}: {appLanguage === 'en' ? serviceHymns[slot]!.title_en : serviceHymns[slot]!.title_yo}</p>
                                    </div>
                                    <button onClick={() => setServiceHymn(slot, null)} className="text-sm text-red-500 hover:underline">{appLanguage === 'en' ? 'Clear' : 'Paarẹ́'}</button>
                                </div>
                            ) : (
                                <p className="text-gray-500 dark:text-gray-400 text-sm">{appLanguage === 'en' ? 'Not set' : 'Kò sí'}</p>
                            )}
                        </div>
                    ))}
                </div>
            </div>
            
            {customBookmarks.length > 0 && (
                <div>
                    <h2 className="text-2xl font-bold mb-4">{appLanguage === 'en' ? 'My Bookmarks' : 'Àwọn Àmì Ìwé Mi'}</h2>
                    <ul className="space-y-4">
                        {customBookmarks.map(({ hymn, description }) => (
                            <li key={hymn.id} className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm">
                                <HymnListItem hymn={hymn} onSelect={handleSelectHymn} />
                                <div className="mt-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-md">
                                    <p className="text-sm text-gray-700 dark:text-gray-300 italic">"{description}"</p>
                                </div>
                                <button onClick={() => removeCustomBookmark(hymn.id)} className="text-sm text-red-500 hover:underline mt-2 flex items-center">
                                    <TrashIcon className="w-4 h-4 mr-1"/>
                                    {appLanguage === 'en' ? 'Remove Bookmark' : 'Yọ Àmì Ìwé kúrò'}
                                </button>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
};


const HistoryPage = () => {
    const context = useContext(AppContext);
    if (!context) return null;
    const { hymns, history, appLanguage, setActivePage, addToHistory } = context;

    const historyHymns = useMemo(() => history.map(id => hymns.find(h => h.id === id)).filter(Boolean) as Hymn[], [history, hymns]);
    
    const handleSelectHymn = (hymn: Hymn) => { addToHistory(hymn.id); setActivePage(Page.HymnDetail, { hymn }); };

    return (
        <div>
            <h2 className="text-2xl font-bold mb-4">{appLanguage === Language.ENGLISH ? 'Recently Viewed' : 'Àwọn Tí O Wò Láìpẹ́'}</h2>
            {historyHymns.length > 0 ? (
                <ul className="space-y-3">
                    {historyHymns.map(hymn => <HymnListItem key={`hist-${hymn.id}`} hymn={hymn} onSelect={handleSelectHymn} />)}
                </ul>
            ) : (
                 <EmptyState 
                    icon={<HistoryIcon className="w-16 h-16 mx-auto text-gray-300 dark:text-gray-600 mb-4" />}
                    title={appLanguage === 'en' ? 'No History Yet' : 'Kò sí Ìtàn Wíwò Síbẹ̀'}
                    message={appLanguage === 'en' ? 'Your recently viewed hymns will appear here.' : 'Àwọn orin tí o wò láìpẹ́ yóò fara hàn níbí.'}
                />
            )}
        </div>
    );
};

const DoctrinePage = () => {
    const context = useContext(AppContext);
    if (!context) return null;
    const { appLanguage } = context;

    return (
        <div className="max-w-4xl mx-auto bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
            <h2 className="text-3xl font-bold mb-4">{appLanguage === 'en' ? 'Our Doctrine' : 'Ẹ̀kọ́ Wa'}</h2>
            <p className="mb-4">{appLanguage === 'en' ? 'Here you can read about the core beliefs and doctrines of our church. These principles guide our worship, our community, and our daily lives.' : 'Níhìn-ín, o lè ka nípa àwọn ìgbàgbọ́ àti ẹ̀kọ́ ìjọ wa. Àwọn ìlànà wọ̀nyí ni ó ń darí ìjọsìn wa, àwùjọ wa, àti ìgbésí ayé wa ojoojúmọ́.'}</p>
            <div className="space-y-2 mb-8">
                <p><strong>{appLanguage === 'en' ? '1. The Holy Scriptures' : '1. Ìwé Mímọ́'}</strong></p>
                <p><strong>{appLanguage === 'en' ? '2. The Godhead' : '2. Mẹ́talọ́kan'}</strong></p>
                <p><strong>{appLanguage === 'en' ? '3. Man, His Fall and Redemption' : '3. Ènìyàn, Ìṣubú àti Ìràpadà Rẹ̀'}</strong></p>
            </div>
            <h3 className="text-2xl font-bold mb-4">{appLanguage === 'en' ? 'Find a Branch' : 'Wá Ẹ̀ka Ìjọ'}</h3>
            <div className="flex flex-col sm:flex-row gap-4">
                <input type="text" placeholder={appLanguage === 'en' ? "Enter your city or zip code" : "Tẹ ìlú tàbí koodu ìfìwéránṣẹ́"} className="flex-grow p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600" />
                <button className="px-6 py-2 bg-primary-600 text-white font-semibold rounded-md hover:bg-primary-700">{appLanguage === 'en' ? 'Search' : 'Wáà'}</button>
            </div>
        </div>
    );
};

const SettingsPage = () => {
    const context = useContext(AppContext);
    if (!context) return null;
    const { appLanguage, setAppLanguage, theme, setTheme, defaultHymnLanguage, setDefaultHymnLanguage } = context;

    const SettingRow: React.FC<{label: string, description: string, children: React.ReactNode}> = ({label, description, children}) => (
        <div className="py-4 border-b border-gray-200 dark:border-gray-700 last:border-b-0">
            <div className="flex items-center justify-between">
                <span className="text-lg">{label}</span>
                <div>{children}</div>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 pr-8">{description}</p>
        </div>
    );

    return (
        <div className="max-w-2xl mx-auto bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
            <h2 className="text-3xl font-bold mb-6">{appLanguage === 'en' ? 'Settings' : 'Ètò'}</h2>
            
            <SettingRow label={appLanguage === 'en' ? 'App Language' : 'Èdè Ìṣàfilọ́lẹ̀'} description={appLanguage === 'en' ? 'Change the language for the app interface.' : 'Yí èdè ìṣàfilọ́lẹ̀ ohun èlò náà padà.'}>
                <div className="flex space-x-2">
                    <button onClick={() => setAppLanguage(Language.ENGLISH)} className={`px-4 py-1 rounded-full ${appLanguage === Language.ENGLISH ? 'bg-primary-600 text-white' : 'bg-gray-200 dark:bg-gray-600'}`}>English</button>
                    <button onClick={() => setAppLanguage(Language.YORUBA)} className={`px-4 py-1 rounded-full ${appLanguage === Language.YORUBA ? 'bg-primary-600 text-white' : 'bg-gray-200 dark:bg-gray-600'}`}>Yorùbá</button>
                </div>
            </SettingRow>

            <SettingRow label={appLanguage === 'en' ? 'Default Hymn Language' : 'Èdè Orin Àkọ́kọ́'} description={appLanguage === 'en' ? 'Choose the default language for viewing hymns.' : 'Yan èdè àkọ́kọ́ fún wíwo àwọn orin.'}>
                <div className="flex space-x-2">
                    <button onClick={() => setDefaultHymnLanguage(Language.ENGLISH)} className={`px-4 py-1 rounded-full ${defaultHymnLanguage === Language.ENGLISH ? 'bg-primary-600 text-white' : 'bg-gray-200 dark:bg-gray-600'}`}>English</button>
                    <button onClick={() => setDefaultHymnLanguage(Language.YORUBA)} className={`px-4 py-1 rounded-full ${defaultHymnLanguage === Language.YORUBA ? 'bg-primary-600 text-white' : 'bg-gray-200 dark:bg-gray-600'}`}>Yorùbá</button>
                </div>
            </SettingRow>

            <SettingRow label={appLanguage === 'en' ? 'Theme' : 'Àwọ̀'} description={appLanguage === 'en' ? 'Choose a theme or follow the system preference.' : 'Yan àwọ̀ kan tàbí tẹ́lẹ̀ ààyò ètò kọ̀ǹpútà.'}>
                <div className="flex space-x-2">
                    <button onClick={() => setTheme(Theme.LIGHT)} aria-label="Light theme" className={`p-2 rounded-full ${theme === Theme.LIGHT ? 'bg-primary-600 text-white' : 'bg-gray-200 dark:bg-gray-600'}`}><SunIcon className="w-6 h-6" /></button>
                    <button onClick={() => setTheme(Theme.DARK)} aria-label="Dark theme" className={`p-2 rounded-full ${theme === Theme.DARK ? 'bg-primary-600 text-white' : 'bg-gray-200 dark:bg-gray-600'}`}><MoonIcon className="w-6 h-6" /></button>
                    <button onClick={() => setTheme(Theme.SYSTEM)} aria-label="System theme" className={`p-2 rounded-full ${theme === Theme.SYSTEM ? 'bg-primary-600 text-white' : 'bg-gray-200 dark:bg-gray-600'}`}><DesktopIcon className="w-6 h-6" /></button>
                </div>
            </SettingRow>
        </div>
    );
};

const AboutPage = () => {
    const context = useContext(AppContext);
    if (!context) return null;
    const { appLanguage } = context;
    const currentYear = new Date().getFullYear();

    return (
        <div className="max-w-4xl mx-auto bg-white dark:bg-gray-800 p-6 sm:p-8 rounded-lg shadow-md">
            <h2 className="text-3xl font-bold mb-4 text-gray-900 dark:text-white">{appLanguage === 'en' ? 'About TLECC Hymns' : 'Nípa Orin TLECC'}</h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 mb-6">{appLanguage === 'en' ? 'This digital hymn book is a project dedicated to preserving and making accessible the rich collection of hymns used in The Truth Living Evangelical Church of Christ (TLECC). Our goal is to provide a modern, easy-to-use platform for members and worshippers to engage with these sacred songs, both in English and Yoruba.' : 'Ìwé orin oní-nọ́mbà yíì jẹ́ iṣẹ́ àkànṣe kan tí a yà sọ́tọ̀ fún pípa àkójọpọ̀ ọlọ́rọ̀ àwọn orin tí a ń lò ní The Truth Living Evangelical Church of Christ (TLECC) mọ́ àti ṣíṣe é ní irọ̀rùn. Èròǹgbà wa ni láti pèsè pẹpẹ ìgbàlódé, tó rọrùn láti lò fún àwọn ọmọ ìjọ àti àwọn olùjọ́sìn láti fi ara wọn bá àwọn orin mímọ́ wọ̀nyí ṣiṣẹ́, ní èdè Gẹ̀ẹ́sì àti Yorùbá.'}</p>
            <div className="border-t border-gray-200 dark:border-gray-700 my-8"></div>
            <h3 className="text-2xl font-semibold mb-4 text-gray-800 dark:text-gray-200">{appLanguage === 'en' ? 'Connect With Us' : 'Dàpọ̀ Mọ́ Wa'}</h3>
            <div className="flex items-center space-x-6 text-gray-600 dark:text-gray-400">
                <a href="#" className="hover:text-primary-500 transition-colors" aria-label="Facebook"><FacebookIcon className="w-7 h-7" /></a>
                <a href="#" className="hover:text-primary-500 transition-colors" aria-label="Twitter"><TwitterIcon className="w-7 h-7" /></a>
                <a href="#" className="hover:text-primary-500 transition-colors" aria-label="Instagram"><InstagramIcon className="w-7 h-7" /></a>
            </div>
            <div className="border-t border-gray-200 dark:border-gray-700 my-8"></div>
            <p className="text-center text-sm text-gray-500 dark:text-gray-400">{appLanguage === 'en' ? `Copyright © ${currentYear} TLECC. All Rights Reserved.` : `Aṣẹ-ìwé © ${currentYear} TLECC. Gbogbo Ẹ̀tọ́ Wa Ni A Pamọ́.`}</p>
        </div>
    );
};

const SimpleInfoPage: React.FC<{title: string, content: string}> = ({ title, content }) => (
    <div className="max-w-2xl mx-auto bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
        <h2 className="text-3xl font-bold mb-4">{title}</h2>
        <p className="text-lg whitespace-pre-wrap">{content}</p>
    </div>
);


export const PageRenderer = () => {
    const context = useContext(AppContext);
    if (!context) {
        return <div className="text-center p-8">Loading...</div>;
    }
    const { activePage, pageContext, appLanguage, loading, hymns, setActivePage } = context;

    if (loading) {
        return ( <div className="flex justify-center items-center h-full"><p className="text-lg text-gray-500 dark:text-gray-400">{appLanguage === 'en' ? 'Loading Hymns...' : 'Ó ń gbé àwọn orin wọlé...'}</p></div> );
    }

    if (hymns.length === 0) {
        return ( <div className="flex justify-center items-center h-full"><p className="text-lg text-red-500">{appLanguage === 'en' ? 'Could not load hymn data.' : 'Kò lè gbé àwọn orin wọlé.'}</p></div>);
    }
    
    const shouldShowBackButton = activePage !== Page.HymnLibrary;

    const renderPage = () => {
        switch (activePage) {
            case Page.HymnLibrary: return <HymnLibraryPage />;
            case Page.HymnDetail: return pageContext?.hymn ? <HymnDetail hymn={pageContext.hymn} /> : <HymnLibraryPage />;
            case Page.Favorites: return <FavoritesPage />;
            case Page.Bookmarks: return <BookmarksPage />;
            case Page.History: return <HistoryPage />;
            case Page.ChurchDoctrine: return <DoctrinePage />;
            case Page.UpdateHymns: return <SimpleInfoPage title={appLanguage === 'en' ? 'Update Hymns' : 'Ṣe Àtúnṣe Orin'} content={appLanguage === 'en' ? 'Hymns are updated periodically by the development team. Please ensure you have the latest version of the app to receive new hymns and corrections.' : 'Àwọn orin ni a máa ń ṣe àtúnṣe sí nígbà gbogbo láti ọwọ́ àwọn tó ń ṣe ìdàgbàsókè. Jọ̀wọ́ rí i dájú pé o ní ẹ̀yà tuntun ìṣàfilọ́lẹ̀ náà láti gba àwọn orin tuntun àti àwọn àtúnṣe.'} />;
            case Page.Credits: return <SimpleInfoPage title={appLanguage === 'en' ? 'Credits' : 'Ìdúpẹ́'} content={appLanguage === 'en' ? 'This app was developed with love for the glory of God.\n\nSpecial thanks to all contributors and the open-source community.' : 'Ìṣàfilọ́lẹ̀ yíì jẹ́ dídá pẹ̀lú ìfẹ́ fún ògo Ọlọ́run.\n\nỌpẹ́ pàtàkì sí gbogbo àwọn olùrànlọ́wọ́ àti àwùjọ open-source.'} />;
            case Page.Donate: return <SimpleInfoPage title={appLanguage === 'en' ? 'Donate' : 'Ṣe Ìtọrẹ'} content={appLanguage === 'en' ? 'Your generous donations help us maintain and improve this app. Your support allows us to add new features, expand the hymn library, and keep the app free for everyone.\n\nThank you for your support!' : 'Ìtọrẹ onínúure rẹ ń ràn wá lọ́wọ́ láti tọ́jú àti láti mú ìṣàfilọ́lẹ̀ yíì dára síi. Ìtìlẹ́yìn rẹ jẹ́ kí a lè fi àwọn nǹkan tuntun kún un, mú kí àkójọpọ̀ orin pọ̀ síi, àti láti jẹ́ kí ìṣàfilọ́lẹ̀ náà wà ní ọ̀fẹ́ fún gbogbo ènìyàn.\n\nẸ ṣeun fún ìtìlẹ́yìn yín!'} />;
            case Page.Settings: return <SettingsPage />;
            case Page.About: return <AboutPage />;
            default: return <HymnLibraryPage />;
        }
    };

    return (
        <div>
            {shouldShowBackButton && (
                <button onClick={() => setActivePage(Page.HymnLibrary)} className="flex items-center mb-4 text-primary-600 dark:text-primary-400 hover:underline font-semibold">
                    <ChevronLeftIcon className="w-5 h-5 mr-1" />
                    {appLanguage === Language.ENGLISH ? 'Back to Library' : 'Padà sí Àkójọpọ̀'}
                </button>
            )}
            {renderPage()}
        </div>
    );
};
