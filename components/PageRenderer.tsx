import React, { useContext, useState, useMemo, useRef, useEffect } from 'react';
import { AppContext } from '../contexts/AppContext';
import { Hymn, Language, Page, Stanza, ServiceHymnSlot, Bookmark, Branch } from '../types';
import { ChevronLeftIcon, HeartIcon, PlayIcon, SearchIcon, ShareIcon, SunIcon, MoonIcon, TrashIcon, FilterIcon, XIcon, FontSizeIcon, ChevronDownIcon, HistoryIcon, FacebookIcon, TwitterIcon, InstagramIcon, DesktopIcon, BookmarkIcon, InfoIcon, BookOpenIcon, ChevronRightIcon, CheckIcon, UpdateIcon, RadioIcon, MapPinIcon } from './Icons';
import { Theme, FontSize, AccentColor } from '../types';


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
    const { hymns, setActivePage, appLanguage, hymnLanguage, setHymnLanguage, fontSize, setFontSize, isFavorite, toggleFavorite, bookmarks, setServiceHymn, setCustomBookmark, removeCustomBookmark, getCustomBookmark, getServiceHymnSlot, addToHistory, showToast } = context;

    const [isFontControlOpen, setIsFontControlOpen] = useState(false);
    const [isBookmarkPopoverOpen, setBookmarkPopoverOpen] = useState(false);
    const [customNote, setCustomNote] = useState(getCustomBookmark(hymn.id)?.type === 'custom' ? (getCustomBookmark(hymn.id) as any).description : '');

    const fontControlRef = useRef<HTMLDivElement>(null);
    const bookmarkPopoverRef = useRef<HTMLDivElement>(null);

    const [touchStartX, setTouchStartX] = useState<number | null>(null);
    const [touchEndX, setTouchEndX] = useState<number | null>(null);

    const sortedHymns = useMemo(() => [...hymns].sort((a, b) => a.id - b.id), [hymns]);
    const currentIndex = useMemo(() => sortedHymns.findIndex(h => h.id === hymn.id), [sortedHymns, hymn.id]);
    const previousHymn = currentIndex > 0 ? sortedHymns[currentIndex - 1] : null;
    const nextHymn = currentIndex < sortedHymns.length - 1 ? sortedHymns[currentIndex + 1] : null;

    const navigateToHymn = (targetHymn: Hymn | null) => {
        if (targetHymn) {
            addToHistory(targetHymn.id);
            setActivePage(Page.HymnDetail, { hymn: targetHymn });
        }
    };

    const minSwipeDistance = 50;
    const onTouchStart = (e: React.TouchEvent) => {
        setTouchEndX(null);
        setTouchStartX(e.targetTouches[0].clientX);
    };
    const onTouchMove = (e: React.TouchEvent) => {
        setTouchEndX(e.targetTouches[0].clientX);
    };
    const onTouchEnd = () => {
        if (!touchStartX || !touchEndX) return;
        const distance = touchStartX - touchEndX;
        const isLeftSwipe = distance > minSwipeDistance;
        const isRightSwipe = distance < -minSwipeDistance;
        if (isLeftSwipe && nextHymn) {
            navigateToHymn(nextHymn);
        } else if (isRightSwipe && previousHymn) {
            navigateToHymn(previousHymn);
        }
        setTouchStartX(null);
        setTouchEndX(null);
    };

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
            navigator.clipboard.writeText(textToShare).then(() => showToast(appLanguage === 'en' ? 'Hymn copied to clipboard!' : 'A ti gbe orin si clipboard!', 'success'));
        }
    };
    
    const handleSaveNote = () => {
        if(customNote.trim()) {
            setCustomBookmark(hymn.id, customNote.trim());
            showToast(appLanguage === 'en' ? 'Note saved!' : 'A ti fi àkíyèsí pamọ́!', 'success');
        } else {
            removeCustomBookmark(hymn.id);
            showToast(appLanguage === 'en' ? 'Note removed!' : 'A ti yọ àkíyèsí kúrò!', 'info');
        }
        setBookmarkPopoverOpen(false);
    };

    const ActionButton = ({ onClick, icon: Icon, active, colorClass, refProp }: any) => (
        <div className="relative" ref={refProp}>
            <button 
                onClick={onClick} 
                className={`p-2 rounded-full transition-all duration-200 active:scale-95 ${active ? 'bg-primary-50 dark:bg-primary-900/40 text-primary-600 dark:text-primary-400' : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-700 dark:hover:text-gray-200'}`}
            >
                <Icon className={`w-5 h-5 ${colorClass || ''}`} />
            </button>
        </div>
    );

    return (
        <div className="max-w-4xl mx-auto pb-10" onTouchStart={onTouchStart} onTouchMove={onTouchMove} onTouchEnd={onTouchEnd}>
            
            {/* World-Class Glassmorphic Navigation Bar */}
            <div className="sticky top-0 z-30 flex items-center justify-between px-3 py-2 bg-white/90 dark:bg-gray-900/90 backdrop-blur-md border-b border-gray-200/50 dark:border-gray-800/50 transition-all">
                 <button 
                    onClick={() => setActivePage(Page.HymnLibrary)} 
                    className="group flex items-center px-3 py-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                 >
                    <ChevronLeftIcon className="w-4 h-4 text-gray-500 dark:text-gray-400 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors mr-1" />
                    <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                        {appLanguage === Language.ENGLISH ? 'Library' : 'Àkójọpọ̀'}
                    </span>
                </button>

                <div className="flex items-center gap-1">
                    {/* Play - Coming Soon with Toast */}
                    <ActionButton 
                        onClick={() => showToast(appLanguage === 'en' ? 'Audio playback coming soon!' : 'A óò gbé orin síi láìpẹ́!', 'info')}
                        icon={PlayIcon} 
                    />

                     {/* Font Size */}
                    <div ref={fontControlRef} className="relative">
                         <ActionButton 
                            onClick={() => setIsFontControlOpen(prev => !prev)} 
                            icon={FontSizeIcon} 
                            active={isFontControlOpen}
                        />
                        {isFontControlOpen && (
                            <div className="absolute right-0 top-full mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 z-10 p-2 transform origin-top-right transition-all">
                                <div className="flex items-center justify-around">
                                    <button onClick={() => { setFontSize(FontSize.SMALL); setIsFontControlOpen(false); }} className={`w-8 h-8 flex items-center justify-center rounded-full transition-transform hover:scale-110 ${fontSize === FontSize.SMALL ? 'bg-primary-600 text-white' : 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200'}`}><span className="text-xs font-bold">A</span></button>
                                    <button onClick={() => { setFontSize(FontSize.MEDIUM); setIsFontControlOpen(false); }} className={`w-10 h-10 flex items-center justify-center rounded-full transition-transform hover:scale-110 ${fontSize === FontSize.MEDIUM ? 'bg-primary-600 text-white' : 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200'}`}><span className="text-sm font-bold">A</span></button>
                                    <button onClick={() => { setFontSize(FontSize.LARGE); setIsFontControlOpen(false); }} className={`w-12 h-12 flex items-center justify-center rounded-full transition-transform hover:scale-110 ${fontSize === FontSize.LARGE ? 'bg-primary-600 text-white' : 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200'}`}><span className="text-lg font-bold">A</span></button>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Favorite */}
                    <ActionButton 
                        onClick={() => {
                            toggleFavorite(hymn.id);
                            if(!isFavorite(hymn.id)) showToast(appLanguage === 'en' ? 'Added to favorites' : 'Ti fi kun awọn ayanfẹ', 'success');
                            else showToast(appLanguage === 'en' ? 'Removed from favorites' : 'Ti yọ kuro ninu awọn ayanfẹ', 'info');
                        }}
                        icon={HeartIcon} 
                        active={isFavorite(hymn.id)}
                        colorClass={isFavorite(hymn.id) ? 'text-red-500 fill-current' : ''}
                    />

                    {/* Bookmark */}
                    <div ref={bookmarkPopoverRef} className="relative">
                        <ActionButton 
                            onClick={() => setBookmarkPopoverOpen(prev => !prev)} 
                            icon={BookmarkIcon} 
                            active={isBookmarked}
                            colorClass={isBookmarked ? 'text-primary-600 fill-current' : ''}
                        />
                        {isBookmarkPopoverOpen && (
                            <div className="absolute right-0 top-full mt-2 w-64 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 z-20 p-4 transform origin-top-right">
                                    <div className="flex items-start bg-yellow-50 dark:bg-gray-700 p-2 rounded-md mb-3">
                                    <InfoIcon className="w-4 h-4 text-yellow-600 dark:text-yellow-400 mr-2 flex-shrink-0 mt-0.5"/>
                                    <p className="text-[10px] leading-tight text-yellow-800 dark:text-yellow-200">{appLanguage === 'en' ? 'Bookmarks are local to this device.' : 'Àwọn àmì ìwé wà lórí ẹ̀rọ yìí nìkan.'}</p>
                                </div>
                                <textarea value={customNote} onChange={(e) => setCustomNote(e.target.value)} rows={2} placeholder={appLanguage === 'en' ? 'Add a note...' : 'Fi àkíyèsí kún...'} className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 text-xs mb-2"></textarea>
                                <button onClick={handleSaveNote} className="w-full px-3 py-1.5 bg-primary-600 text-white text-xs font-semibold rounded-md hover:bg-primary-700">{appLanguage === 'en' ? 'Save' : 'Gba sílẹ̀'}</button>
                                <div className="border-t dark:border-gray-600 my-3"></div>
                                <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-wide">{appLanguage === 'en' ? 'Service Slot' : 'Àyè Ìsìn'}</h4>
                                <div className="space-y-1">
                                    {serviceSlots.map(slot => {
                                        const hymnInSlot = serviceHymnsBySlot[slot];
                                        const isThisHymnInSlot = hymnInSlot?.hymnId === hymn.id;
                                        return (
                                            <button key={slot} onClick={() => {
                                                setServiceHymn(slot, isThisHymnInSlot ? null : hymn.id);
                                                showToast(appLanguage === 'en' ? `Updated ${slot} hymn` : `Ti ṣe imudojuiwọn orin ${slot}`, 'success');
                                            }} className={`w-full text-left px-2 py-1.5 rounded text-xs transition-colors ${isThisHymnInSlot ? 'bg-primary-50 dark:bg-primary-900/50 text-primary-700 dark:text-primary-300 font-medium' : 'hover:bg-gray-100 dark:hover:bg-gray-700'}`}>
                                                {appLanguage === 'en' ? `${slot.charAt(0).toUpperCase() + slot.slice(1)}` : slot === 'opening' ? 'Ìbẹ̀rẹ̀' : slot === 'sermon' ? 'Ìwàásù' : 'Ìparí'}
                                                {isThisHymnInSlot && <CheckIcon className="w-3 h-3 inline ml-2"/>}
                                            </button>
                                        )
                                    })}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Share */}
                    <ActionButton 
                        onClick={handleShare} 
                        icon={ShareIcon} 
                    />
                </div>
            </div>

            <div className="bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-b-lg shadow-lg mx-2 sm:mx-0 mt-2">
                
                {/* Header */}
                <div className="mb-6">
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white leading-tight">
                        <span className="text-primary-600 dark:text-primary-400 mr-2">{hymn.id}.</span>
                        {hymnLanguage === Language.ENGLISH ? hymn.title_en : hymn.title_yo}
                    </h2>
                    <div className="flex flex-wrap items-center mt-2 text-sm text-gray-500 dark:text-gray-400 gap-x-3 gap-y-1">
                        <span>{hymnLanguage === Language.ENGLISH ? hymn.category.en : hymn.category.yo}</span>
                        <span className="w-1 h-1 bg-gray-400 rounded-full"></span>
                        <span className="font-mono">{hymn.tune_code}</span>
                    </div>
                    {hymn.theme_scripture && (
                        <div className="flex items-center text-gray-500 dark:text-gray-400 mt-2 text-sm">
                            <BookOpenIcon className="w-4 h-4 mr-2 flex-shrink-0" />
                            <p>
                                <em>
                                    {hymnLanguage === Language.ENGLISH ? hymn.theme_scripture.en : hymn.theme_scripture.yo}
                                </em>
                            </p>
                        </div>
                    )}
                </div>

                {/* Language Toggle */}
                <div className="flex space-x-1 border border-gray-200 dark:border-gray-700 rounded-lg p-1 w-fit mb-6 bg-gray-50 dark:bg-gray-900">
                    <button onClick={() => setHymnLanguage(Language.ENGLISH)} className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${hymnLanguage === Language.ENGLISH ? 'bg-white dark:bg-gray-700 text-primary-600 dark:text-primary-400 shadow-sm' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'}`} aria-pressed={hymnLanguage === Language.ENGLISH}> English </button>
                    <button onClick={() => setHymnLanguage(Language.YORUBA)} className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${hymnLanguage === Language.YORUBA ? 'bg-white dark:bg-gray-700 text-primary-600 dark:text-primary-400 shadow-sm' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'}`} aria-pressed={hymnLanguage === Language.YORUBA}> Yorùbá </button>
                </div>
                
                {/* Lyrics */}
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
                                            <div className="pl-4 border-l-4 border-gray-200 dark:border-gray-700 italic">
                                                <p className="font-bold mb-2 text-gray-400 text-xs uppercase tracking-wider">{hymnLanguage === Language.ENGLISH ? 'Chorus' : 'Egbe'}</p>
                                                {stanza.lines.map((line, lineIndex) => (
                                                    <p key={lineIndex} className="mb-1">{line}</p>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="flex">
                                                <span className="w-8 flex-shrink-0 font-bold text-gray-400 select-none text-right pr-3">{stanzaCounter}.</span>
                                                <div className="flex-1">
                                                    {stanza.lines.map((line, lineIndex) => (
                                                        <p key={lineIndex} className="mb-1">{line}</p>
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

                {/* Navigation Footer */}
                <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700 flex justify-between items-center">
                    <button onClick={() => navigateToHymn(previousHymn)} disabled={!previousHymn} className="flex items-center px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 disabled:opacity-30 disabled:hover:text-gray-600 transition-colors" aria-label={appLanguage === 'en' ? 'Previous Hymn' : 'Orin Tó Tẹ́lẹ̀'}>
                        <ChevronLeftIcon className="w-5 h-5 mr-1" />
                        {appLanguage === 'en' ? 'Prev' : 'Tẹ́lẹ̀'}
                    </button>
                    <span className="text-xs text-gray-400 font-mono">
                        {currentIndex + 1} / {sortedHymns.length}
                    </span>
                    <button onClick={() => navigateToHymn(nextHymn)} disabled={!nextHymn} className="flex items-center px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 disabled:opacity-30 disabled:hover:text-gray-600 transition-colors" aria-label={appLanguage === 'en' ? 'Next Hymn' : 'Orin Itele'}>
                        {appLanguage === 'en' ? 'Next' : 'Itele'}
                        <ChevronRightIcon className="w-5 h-5 ml-1" />
                    </button>
                </div>
            </div>
        </div>
    );
};

const HymnLibrary: React.FC = () => {
    const context = useContext(AppContext);
    if (!context) return null;
    const { hymns, setActivePage, appLanguage, loading } = context;
    const [searchTerm, setSearchTerm] = useState('');
    const [isSearchActive, setIsSearchActive] = useState(false);
    const [isSearchFocused, setIsSearchFocused] = useState(false);
    const [isFabOpen, setIsFabOpen] = useState(false);
    const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
    const [activeFilter, setActiveFilter] = useState<{ type: 'none' | 'chorus' | 'category', value?: string }>({ type: 'none' });
    const [viewMode, setViewMode] = useState<'list_number' | 'list_title' | 'category'>('list_number');
    const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
    const searchInputRef = useRef<HTMLInputElement>(null);

    // Filter Logic
    const { processedHymns, groupedHymns, categories } = useMemo(() => {
        let hymnsToProcess = [...hymns];

        // Search
        if (searchTerm) {
             const lowerCaseSearch = searchTerm.toLowerCase();
             hymnsToProcess = hymnsToProcess.filter(h => 
                h.id.toString().includes(lowerCaseSearch) ||
                h.title_en.toLowerCase().includes(lowerCaseSearch) ||
                h.title_yo.toLowerCase().includes(lowerCaseSearch) ||
                h.lyrics_en.some(s => s.lines.some(l => l.toLowerCase().includes(lowerCaseSearch))) ||
                h.lyrics_yo.some(s => s.lines.some(l => l.toLowerCase().includes(lowerCaseSearch)))
             );
        }

        // Filter
        if (activeFilter.type === 'category' && activeFilter.value) {
            hymnsToProcess = hymnsToProcess.filter(h => (appLanguage === Language.ENGLISH ? h.category.en : h.category.yo) === activeFilter.value);
        } else if (activeFilter.type === 'chorus') {
            hymnsToProcess = hymnsToProcess.filter(h => (appLanguage === Language.ENGLISH ? h.lyrics_en : h.lyrics_yo).some(s => s.type === 'chorus'));
        }

        // Sort
        if (!searchTerm) {
            hymnsToProcess.sort((a, b) => viewMode === 'list_title' ? (appLanguage === Language.ENGLISH ? a.title_en : a.title_yo).localeCompare(appLanguage === Language.ENGLISH ? b.title_en : b.title_yo) : a.id - b.id);
        }

        // Group
        let grouped: Record<string, Hymn[]> | null = null;
        if (viewMode === 'category') {
            grouped = hymnsToProcess.reduce((acc, hymn) => {
                const category = appLanguage === Language.ENGLISH ? hymn.category.en : hymn.category.yo;
                if (!acc[category]) acc[category] = [];
                acc[category].push(hymn);
                return acc;
            }, {} as Record<string, Hymn[]>);
        }
        
        const cats = Array.from(new Set(hymns.map(h => appLanguage === Language.ENGLISH ? h.category.en : h.category.yo))).sort();

        return { processedHymns: hymnsToProcess, groupedHymns: grouped, categories: cats };
    }, [hymns, searchTerm, activeFilter, viewMode, appLanguage]);


    if (loading) return <div className="flex justify-center p-10"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600"></div></div>;

    const toggleCategory = (category: string) => setExpandedCategories(prev => { const newSet = new Set(prev); newSet.has(category) ? newSet.delete(category) : newSet.add(category); return newSet; });

    const FabMenuItem: React.FC<{onClick: () => void, children: React.ReactNode}> = ({ onClick, children }) => ( <button onClick={onClick} className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md">{children}</button> );

    return (
        <div className="relative min-h-full">
            <div className="relative mb-4">
                <input
                    type="text"
                    placeholder={appLanguage === 'en' ? 'Search by number, title or lyrics...' : 'Wá nípa nọ́mbà, àkọlé tàbí àkọlé...'}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 shadow-sm"
                />
                <SearchIcon className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
                {searchTerm && (
                    <button onClick={() => setSearchTerm('')} className="absolute right-3 top-3.5 text-gray-400 hover:text-gray-600">
                        <XIcon className="w-5 h-5" />
                    </button>
                )}
            </div>
            
            {activeFilter.type !== 'none' && ( <div className="mb-4"><span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-primary-100 dark:bg-primary-900 text-primary-800 dark:text-primary-200">{activeFilter.type === 'category' ? `${appLanguage === 'en' ? 'Category' : 'Ẹ̀ka'}: ${activeFilter.value}` : `${appLanguage === 'en' ? 'Has Chorus' : 'Pẹ̀lú Egbe'}`}<button onClick={() => setActiveFilter({type: 'none'})} className="ml-2 -mr-1 p-0.5 rounded-full text-primary-600 dark:text-primary-200 hover:bg-primary-200 dark:hover:bg-primary-700"><XIcon className="w-3 h-3" /></button></span></div>)}

            {viewMode === 'category' && groupedHymns ? (
                 <div className="space-y-3 pb-20">
                    {Object.keys(groupedHymns).length > 0 ? Object.entries(groupedHymns).sort(([a], [b]) => a.localeCompare(b)).map(([category, hymnsInCategory]) => (
                        <div key={category} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
                            <button onClick={() => toggleCategory(category)} className="w-full flex justify-between items-center p-4 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-left transition-colors">
                                <div>
                                    <span className="font-semibold text-gray-800 dark:text-gray-200">{category}</span>
                                    <span className="text-sm text-gray-500 dark:text-gray-400 ml-2">({hymnsInCategory.length})</span>
                                </div>
                                <ChevronDownIcon className={`w-5 h-5 text-gray-500 dark:text-gray-400 transition-transform ${expandedCategories.has(category) ? 'rotate-180' : ''}`} />
                            </button>
                            {expandedCategories.has(category) && (<ul className="p-2 space-y-2">{hymnsInCategory.map(hymn => <HymnListItem key={hymn.id} hymn={hymn} onSelect={(h) => setActivePage(Page.HymnDetail, { hymn: h })} />)}</ul>)}
                        </div>)) 
                    : <p className="text-center text-gray-500 mt-8">{appLanguage === 'en' ? 'No hymns found.' : 'Ko si orin ti a ri.'}</p>}
                </div>
            ) : (
                <ul className="space-y-2 pb-20">
                    {processedHymns.slice(0, 50).map(hymn => (
                        <HymnListItem key={hymn.id} hymn={hymn} onSelect={(h) => setActivePage(Page.HymnDetail, { hymn: h })} />
                    ))}
                    {processedHymns.length === 0 && (
                        <p className="text-center text-gray-500 mt-8">{appLanguage === 'en' ? 'No hymns found.' : 'Ko si orin ti a ri.'}</p>
                    )}
                </ul>
            )}

            {/* FAB */}
             <div className="fixed bottom-6 right-6 z-30 flex flex-col items-end">
                {isFabOpen && ( <div className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl p-2 mb-2 w-56 border dark:border-gray-700"><div className="px-2 py-1 text-xs font-semibold text-gray-400">{appLanguage === 'en' ? 'View By' : 'Wo Nípa'}</div><FabMenuItem onClick={() => { setViewMode('list_number'); setIsFabOpen(false); }}>{appLanguage === 'en' ? 'List (by Number)' : 'Àkójọ (nípa Nọ́mbà)'}</FabMenuItem><FabMenuItem onClick={() => { setViewMode('list_title'); setIsFabOpen(false); }}>{appLanguage === 'en' ? 'List (by Title)' : 'Àkójọ (nípa Àkọlé)'}</FabMenuItem><FabMenuItem onClick={() => { setViewMode('category'); setIsFabOpen(false); }}>{appLanguage === 'en' ? 'Category' : 'Ẹ̀ka'}</FabMenuItem><div className="border-t my-1 dark:border-gray-700"></div><div className="px-2 py-1 text-xs font-semibold text-gray-400">{appLanguage === 'en' ? 'Filter By' : 'Sẹ́ Nípa'}</div><FabMenuItem onClick={() => setIsCategoryModalOpen(true)}>{appLanguage === 'en' ? 'Category' : 'Ẹ̀ka'}</FabMenuItem><FabMenuItem onClick={() => { setActiveFilter({type: 'chorus'}); setIsFabOpen(false); }}>{appLanguage === 'en' ? 'With Chorus' : 'Pẹ̀lú Egbe'}</FabMenuItem><FabMenuItem onClick={() => { setActiveFilter({type: 'none'}); setIsFabOpen(false); }}>{appLanguage === 'en' ? 'Show All' : 'Fi Gbogbo Rẹ̀ Hàn'}</FabMenuItem></div>)}
                <button onClick={() => setIsFabOpen(!isFabOpen)} className="p-4 bg-primary-600 text-white rounded-full shadow-lg hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-transform transform hover:scale-105" aria-label={appLanguage === 'en' ? 'View and filter options' : 'Àwọn àṣàyàn wíwò àti sísẹ́'}>{isFabOpen ? <XIcon className="w-6 h-6" /> : <FilterIcon className="w-6 h-6" />}</button>
            </div>

             {/* Category Modal */}
             {isCategoryModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md max-h-[80vh] flex flex-col">
                        <div className="p-4 border-b dark:border-gray-700 flex justify-between items-center"><h3 className="text-xl font-semibold">{appLanguage === 'en' ? 'Select a Category' : 'Yan Ẹ̀ka Kan'}</h3><button onClick={() => setIsCategoryModalOpen(false)} className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"><XIcon className="w-5 h-5" /></button></div>
                        <ul className="overflow-y-auto p-2">
                            {categories.map(category => (
                                <li key={category}><button onClick={() => { setActiveFilter({ type: 'category', value: category }); setIsCategoryModalOpen(false); setIsFabOpen(false); }} className="w-full text-left p-3 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700">{category}</button></li>
                            ))}
                        </ul>
                    </div>
                </div>
            )}
        </div>
    );
};

const Favorites: React.FC = () => {
    const context = useContext(AppContext);
    if (!context) return null;
    const { hymns, favorites, setActivePage, appLanguage } = context;
    const favoriteHymns = hymns.filter(h => favorites.includes(h.id));

    return (
        <div className="space-y-4">
            {favoriteHymns.length === 0 ? (
                 <div className="text-center py-10 opacity-60">
                    <HeartIcon className="w-16 h-16 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
                    <p>{appLanguage === 'en' ? 'No favorites yet.' : 'Ko si awọn ayanfẹ sibẹsibẹ.'}</p>
                </div>
            ) : (
                <ul className="space-y-2">
                    {favoriteHymns.map(hymn => (
                        <HymnListItem key={hymn.id} hymn={hymn} onSelect={(h) => setActivePage(Page.HymnDetail, { hymn: h })} />
                    ))}
                </ul>
            )}
        </div>
    );
};

const History: React.FC = () => {
    const context = useContext(AppContext);
    if (!context) return null;
    const { hymns, history, setActivePage, appLanguage } = context;
    // Map history ids to hymns, preserving order
    const historyHymns = history.map(id => hymns.find(h => h.id === id)).filter((h): h is Hymn => !!h);

    return (
        <div className="space-y-4">
            {historyHymns.length === 0 ? (
                 <div className="text-center py-10 opacity-60">
                    <HistoryIcon className="w-16 h-16 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
                    <p>{appLanguage === 'en' ? 'No history yet.' : 'Ko si itan sibẹsibẹ.'}</p>
                </div>
            ) : (
                <ul className="space-y-2">
                    {historyHymns.map((hymn, index) => (
                        <HymnListItem key={`${hymn.id}-${index}`} hymn={hymn} onSelect={(h) => setActivePage(Page.HymnDetail, { hymn: h })} />
                    ))}
                </ul>
            )}
        </div>
    );
};

const Bookmarks: React.FC = () => {
    const context = useContext(AppContext);
    if (!context) return null;
    const { bookmarks, hymns, setActivePage, appLanguage, removeCustomBookmark, setServiceHymn } = context;

    const serviceHymns = bookmarks.filter(b => b.type === 'service');
    const customBookmarks = bookmarks.filter(b => b.type === 'custom');

    const getHymn = (id: number) => hymns.find(h => h.id === id);

    return (
        <div className="space-y-6">
             {/* Service Hymns */}
             <div>
                <h3 className="text-lg font-semibold mb-3 text-primary-600 dark:text-primary-400 uppercase tracking-wider text-xs">{appLanguage === 'en' ? 'Service Hymns' : 'Orin Ìsìn'}</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {['opening', 'sermon', 'closing'].map((slot) => {
                         const bookmark = serviceHymns.find(b => (b as any).slot === slot);
                         const hymn = bookmark ? getHymn(bookmark.hymnId) : null;
                         
                         return (
                            <div key={slot} className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow border border-gray-100 dark:border-gray-700">
                                <div className="flex justify-between items-start mb-2">
                                     <span className="text-xs font-bold uppercase text-gray-500 dark:text-gray-400">
                                        {appLanguage === 'en' ? slot : slot === 'opening' ? 'Ìbẹ̀rẹ̀' : slot === 'sermon' ? 'Ìwàásù' : 'Ìparí'}
                                     </span>
                                     {hymn && <button onClick={() => setServiceHymn(slot as any, null)} className="text-gray-400 hover:text-red-500"><XIcon className="w-4 h-4"/></button>}
                                </div>
                                {hymn ? (
                                    <div onClick={() => setActivePage(Page.HymnDetail, { hymn })} className="cursor-pointer group">
                                         <span className="text-2xl font-bold text-primary-600 dark:text-primary-400 group-hover:underline">{hymn.id}</span>
                                         <p className="text-sm font-medium line-clamp-1 mt-1 text-gray-800 dark:text-gray-200">{appLanguage === Language.ENGLISH ? hymn.title_en : hymn.title_yo}</p>
                                    </div>
                                ) : (
                                    <p className="text-sm text-gray-400 italic py-2">{appLanguage === 'en' ? 'Empty' : 'Òfo'}</p>
                                )}
                            </div>
                         )
                    })}
                </div>
            </div>

            {/* Custom Bookmarks */}
             <div>
                <h3 className="text-lg font-semibold mb-3 text-primary-600 dark:text-primary-400 uppercase tracking-wider text-xs">{appLanguage === 'en' ? 'Notes & Bookmarks' : 'Àkíyèsí & Àmì Ìwé'}</h3>
                {customBookmarks.length === 0 ? (
                    <p className="text-gray-500 text-center py-4 italic">{appLanguage === 'en' ? 'No notes added.' : 'Kò sí àkíyèsí.'}</p>
                ) : (
                    <div className="space-y-3">
                        {customBookmarks.map((bookmark: any) => {
                            const hymn = getHymn(bookmark.hymnId);
                            if (!hymn) return null;
                            return (
                                <div key={bookmark.hymnId} className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700">
                                    <div className="flex justify-between items-start">
                                        <div onClick={() => setActivePage(Page.HymnDetail, { hymn })} className="cursor-pointer flex-1">
                                            <div className="flex items-center mb-1">
                                                <span className="font-bold text-primary-600 dark:text-primary-400 mr-2">{hymn.id}</span>
                                                <h4 className="font-semibold text-gray-800 dark:text-gray-200 line-clamp-1">{appLanguage === Language.ENGLISH ? hymn.title_en : hymn.title_yo}</h4>
                                            </div>
                                            <p className="text-sm text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-900/50 p-2 rounded">{bookmark.description}</p>
                                        </div>
                                        <button onClick={() => removeCustomBookmark(hymn.id)} className="ml-3 text-gray-400 hover:text-red-500"><TrashIcon className="w-4 h-4"/></button>
                                    </div>
                                    <div className="mt-2 text-xs text-gray-400 text-right">
                                        {new Date(bookmark.createdAt).toLocaleDateString()}
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                )}
            </div>
        </div>
    );
};

const Settings: React.FC = () => {
    const context = useContext(AppContext);
    if (!context) return null;
    const { appLanguage, setAppLanguage, defaultHymnLanguage, setDefaultHymnLanguage, theme, setTheme, accentColor, setAccentColor } = context;

    return (
        <div className="space-y-8 max-w-2xl mx-auto">
            {/* Theme */}
            <section>
                <h3 className="text-lg font-medium mb-4 text-gray-900 dark:text-gray-100">{appLanguage === 'en' ? 'Appearance' : 'Ìrísí'}</h3>
                <div className="grid grid-cols-3 gap-3">
                    <button onClick={() => setTheme(Theme.LIGHT)} className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all ${theme === Theme.LIGHT ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300' : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'}`}>
                        <SunIcon className="w-6 h-6 mb-2" />
                        <span className="text-sm">Light</span>
                    </button>
                     <button onClick={() => setTheme(Theme.DARK)} className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all ${theme === Theme.DARK ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300' : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'}`}>
                        <MoonIcon className="w-6 h-6 mb-2" />
                        <span className="text-sm">Dark</span>
                    </button>
                     <button onClick={() => setTheme(Theme.SYSTEM)} className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all ${theme === Theme.SYSTEM ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300' : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'}`}>
                        <DesktopIcon className="w-6 h-6 mb-2" />
                        <span className="text-sm">System</span>
                    </button>
                </div>
            </section>

             {/* Accent Color */}
             <section>
                <h3 className="text-lg font-medium mb-4 text-gray-900 dark:text-gray-100">{appLanguage === 'en' ? 'Accent Color' : 'Àwọ̀'}</h3>
                <div className="flex space-x-4">
                    {Object.values(AccentColor).map(color => (
                        <button 
                            key={color} 
                            onClick={() => setAccentColor(color)}
                            className={`w-10 h-10 rounded-full flex items-center justify-center transition-transform hover:scale-110 ${accentColor === color ? 'ring-2 ring-offset-2 ring-gray-400 dark:ring-gray-600' : ''}`}
                        >
                            <div className={`w-10 h-10 rounded-full`} style={{backgroundColor: color === 'green' ? '#22c55e' : color === 'blue' ? '#3b82f6' : color === 'red' ? '#ef4444' : color === 'purple' ? '#8b5cf6' : '#f97316'}}>
                                {accentColor === color && <CheckIcon className="w-5 h-5 text-white m-auto mt-2.5" />}
                            </div>
                        </button>
                    ))}
                </div>
            </section>

            {/* Language */}
            <section>
                 <h3 className="text-lg font-medium mb-4 text-gray-900 dark:text-gray-100">{appLanguage === 'en' ? 'Language' : 'Èdè'}</h3>
                 
                 <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded-lg">
                        <span className="text-gray-700 dark:text-gray-300">{appLanguage === 'en' ? 'App Interface' : 'Èdè Ohun Èlò'}</span>
                         <div className="flex rounded-md bg-gray-100 dark:bg-gray-700 p-1">
                            <button onClick={() => setAppLanguage(Language.ENGLISH)} className={`px-3 py-1 text-xs font-medium rounded ${appLanguage === Language.ENGLISH ? 'bg-white dark:bg-gray-600 shadow text-gray-900 dark:text-white' : 'text-gray-500 dark:text-gray-400'}`}>EN</button>
                            <button onClick={() => setAppLanguage(Language.YORUBA)} className={`px-3 py-1 text-xs font-medium rounded ${appLanguage === Language.YORUBA ? 'bg-white dark:bg-gray-600 shadow text-gray-900 dark:text-white' : 'text-gray-500 dark:text-gray-400'}`}>YO</button>
                        </div>
                    </div>

                    <div className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded-lg">
                        <span className="text-gray-700 dark:text-gray-300">{appLanguage === 'en' ? 'Default Hymn Language' : 'Èdè Orin Àtìbẹ̀rẹ̀'}</span>
                         <div className="flex rounded-md bg-gray-100 dark:bg-gray-700 p-1">
                            <button onClick={() => setDefaultHymnLanguage(Language.ENGLISH)} className={`px-3 py-1 text-xs font-medium rounded ${defaultHymnLanguage === Language.ENGLISH ? 'bg-white dark:bg-gray-600 shadow text-gray-900 dark:text-white' : 'text-gray-500 dark:text-gray-400'}`}>EN</button>
                            <button onClick={() => setDefaultHymnLanguage(Language.YORUBA)} className={`px-3 py-1 text-xs font-medium rounded ${defaultHymnLanguage === Language.YORUBA ? 'bg-white dark:bg-gray-600 shadow text-gray-900 dark:text-white' : 'text-gray-500 dark:text-gray-400'}`}>YO</button>
                        </div>
                    </div>
                 </div>
            </section>

             {/* Updates */}
             <section>
                <h3 className="text-lg font-medium mb-4 text-gray-900 dark:text-gray-100">{appLanguage === 'en' ? 'App Info & Updates' : 'Nípa Ohun Èlò & Àtúnṣe'}</h3>
                <div className="bg-white dark:bg-gray-800 rounded-lg p-4 flex items-center justify-between shadow-sm border border-gray-100 dark:border-gray-700">
                    <div className="flex items-center">
                        <div className="p-3 bg-primary-50 dark:bg-primary-900/30 rounded-full mr-4 text-primary-600 dark:text-primary-400">
                            <UpdateIcon className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="font-semibold text-gray-900 dark:text-white">Version 1.0.0</p>
                            <a 
                                href="https://play.google.com/store/apps/details?id=com.tlecc.hymnbook" 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-sm text-primary-600 dark:text-primary-400 hover:underline flex items-center mt-1"
                            >
                                {appLanguage === 'en' ? 'Check for updates' : 'Ṣayẹwo fun àtúnṣe'}
                                <PlayIcon className="w-3 h-3 ml-1" />
                            </a>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

const ConnectPage: React.FC = () => {
    const context = useContext(AppContext);
    if (!context) return null;
    const { appLanguage, branches } = context;
    const [searchBranch, setSearchBranch] = useState('');

    const mixlrUrl = "https://mixlr.com/tlecc-radio"; // Placeholder

    const filteredBranches = branches.filter(b => 
        b.city.toLowerCase().includes(searchBranch.toLowerCase()) || 
        b.state.toLowerCase().includes(searchBranch.toLowerCase()) || 
        b.address.toLowerCase().includes(searchBranch.toLowerCase()) ||
        b.name.toLowerCase().includes(searchBranch.toLowerCase())
    );

    const SocialLink = ({ icon: Icon, label, href, colorClass }: any) => (
        <a href={href} target="_blank" rel="noopener noreferrer" className={`flex flex-col items-center p-4 bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-md transition-all group ${colorClass}`}>
            <Icon className="w-8 h-8 mb-2 group-hover:scale-110 transition-transform" />
            <span className="text-xs font-medium text-gray-600 dark:text-gray-300">{label}</span>
        </a>
    );

    return (
        <div className="space-y-8 max-w-3xl mx-auto pb-10">
            {/* Online Service */}
            <section>
                <div className="bg-gradient-to-r from-primary-600 to-primary-800 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden">
                    <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-white opacity-10 rounded-full"></div>
                    <div className="relative z-10">
                        <div className="flex items-center mb-4">
                            <RadioIcon className="w-8 h-8 mr-3 animate-pulse" />
                            <h2 className="text-2xl font-bold">{appLanguage === 'en' ? 'Online Service' : 'Ìsìn Lórí Ayélujára'}</h2>
                        </div>
                        <p className="mb-6 text-primary-100 text-sm max-w-lg">
                            {appLanguage === 'en' 
                                ? 'Join us live for our weekly services and special programs on Mixlr. Stay connected in spirit and truth.' 
                                : 'Darapọ mọ wa lórí Mixlr fún àwọn ìsìn ọ̀sẹ̀ àti àwọn ètò pàtàkì. Dúró nínú ẹ̀mí àti òtítọ́.'}
                        </p>
                        <a 
                            href={mixlrUrl} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="inline-flex items-center px-6 py-2 bg-white text-primary-700 rounded-full font-bold text-sm hover:bg-gray-100 transition-colors shadow-md"
                        >
                            <PlayIcon className="w-4 h-4 mr-2" />
                            {appLanguage === 'en' ? 'Listen Live on Mixlr' : 'Gbọ́ Lórí Mixlr'}
                        </a>
                    </div>
                </div>
            </section>

            {/* Social Media */}
            <section>
                <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-gray-200">{appLanguage === 'en' ? 'Social Media' : 'Ayélujára'}</h3>
                <div className="grid grid-cols-3 gap-4">
                    <SocialLink icon={FacebookIcon} label="Facebook" href="#" colorClass="text-blue-600" />
                    <SocialLink icon={TwitterIcon} label="Twitter" href="#" colorClass="text-blue-400" />
                    <SocialLink icon={InstagramIcon} label="Instagram" href="#" colorClass="text-pink-600" />
                </div>
            </section>

            {/* Branch Finder */}
            <section>
                <div className="flex items-center justify-between mb-4">
                     <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">{appLanguage === 'en' ? 'Find a Branch' : 'Wá Ẹ̀ka Kan'}</h3>
                     <span className="text-xs text-gray-500 bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded-full">{filteredBranches.length} {appLanguage === 'en' ? 'Found' : 'Rí'}</span>
                </div>
               
                <div className="relative mb-6">
                    <input 
                        type="text" 
                        placeholder={appLanguage === 'en' ? 'Search by city, state or address...' : 'Wá nípa ìlú, ìpínlẹ̀ tàbí àdírẹ́sì...'} 
                        value={searchBranch}
                        onChange={(e) => setSearchBranch(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-primary-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 shadow-sm"
                    />
                    <SearchIcon className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
                </div>

                <div className="space-y-3">
                    {filteredBranches.length > 0 ? (
                        filteredBranches.map((branch, index) => (
                            <div key={index} className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 flex items-start hover:border-primary-200 dark:hover:border-primary-800 transition-colors">
                                <div className="p-2 bg-primary-50 dark:bg-primary-900/30 rounded-lg mr-4 text-primary-600 dark:text-primary-400 shrink-0">
                                    <MapPinIcon className="w-6 h-6" />
                                </div>
                                <div>
                                    <h4 className="font-bold text-gray-900 dark:text-gray-100 text-base mb-1">{branch.name}</h4>
                                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">{branch.address}</p>
                                    <div className="flex items-center text-xs text-gray-500 dark:text-gray-500 space-x-2">
                                        <span className="bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded">{branch.city}, {branch.state}</span>
                                        {branch.phone && <span>• {branch.phone}</span>}
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="text-center py-8 text-gray-500">
                             <MapPinIcon className="w-10 h-10 mx-auto mb-2 opacity-30" />
                             <p>{appLanguage === 'en' ? 'No branches found matching your search.' : 'Kò sí ẹ̀ka tí a rí.'}</p>
                        </div>
                    )}
                </div>
            </section>
        </div>
    );
};

const InfoPage: React.FC<{title: string, children: React.ReactNode}> = ({ title, children }) => (
    <div className="max-w-2xl mx-auto bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
        <h2 className="text-2xl font-bold mb-6 text-primary-600 dark:text-primary-400">{title}</h2>
        <div className="prose dark:prose-invert max-w-none text-gray-700 dark:text-gray-300">
            {children}
        </div>
    </div>
);

// Page Renderer
export const PageRenderer: React.FC = () => {
    const context = useContext(AppContext);
    if (!context) return null;
    const { activePage, pageContext, appLanguage } = context;

    switch (activePage) {
        case Page.HymnLibrary:
            return <HymnLibrary />;
        case Page.HymnDetail:
            return pageContext?.hymn ? <HymnDetail hymn={pageContext.hymn} /> : <HymnLibrary />;
        case Page.Favorites:
            return <Favorites />;
        case Page.History:
            return <History />;
        case Page.Bookmarks:
            return <Bookmarks />;
        case Page.Settings:
            return <Settings />;
        case Page.Connect:
            return <ConnectPage />;
        case Page.ChurchDoctrine:
            return (
                <InfoPage title={appLanguage === 'en' ? 'Church Doctrine' : 'Ẹ̀kọ́ Ìjọ'}>
                    <p>The Lord's Chosen Charismatic Revival Movement doctrine details...</p>
                    <ul className="list-disc pl-5 space-y-2 mt-4">
                        <li>The Three-Fold Vision...</li>
                        <li>10 Billion Souls Mandate...</li>
                    </ul>
                </InfoPage>
            );
        case Page.Credits:
            return (
                 <InfoPage title={appLanguage === 'en' ? 'Credits' : 'Ìdúpẹ́'}>
                    <p className="mb-4">Special thanks to the media department and all contributors.</p>
                     <div className="flex space-x-4 justify-center mt-6">
                         <a href="#" className="text-blue-600"><FacebookIcon className="w-6 h-6"/></a>
                         <a href="#" className="text-blue-400"><TwitterIcon className="w-6 h-6"/></a>
                         <a href="#" className="text-pink-600"><InstagramIcon className="w-6 h-6"/></a>
                     </div>
                </InfoPage>
            );
        case Page.Donate:
             return (
                 <InfoPage title={appLanguage === 'en' ? 'Donate' : 'Ṣe Ìtọrẹ'}>
                    <p>Support the development of this app.</p>
                     <button className="mt-4 px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 w-full md:w-auto">
                        {appLanguage === 'en' ? 'Donate Now' : 'Sanwó'}
                     </button>
                </InfoPage>
            );
        case Page.About:
             return (
                 <InfoPage title={appLanguage === 'en' ? 'About' : 'Nípa'}>
                    <p>TLECC Hymn Book App</p>
                    <p className="mt-2 text-sm text-gray-500">Developed with love for the body of Christ.</p>
                </InfoPage>
            );
        default:
            return <HymnLibrary />;
    }
};