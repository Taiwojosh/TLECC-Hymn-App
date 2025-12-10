

import React, { ReactNode, useContext, useState } from 'react';
import { AppContext } from '../contexts/AppContext';
import { Page } from '../types';
import { LibraryIcon, HeartIcon, HistoryIcon, CrossIcon, InfoIcon, DonateIcon, SettingsIcon, MenuIcon, XIcon, UsersIcon, BookmarkIcon, CheckIcon, RadioIcon } from './Icons';

interface LayoutProps {
  children: ReactNode;
}

const NavItem: React.FC<{ icon: ReactNode; label: string; page: Page; onNavigate?: () => void }> = ({ icon, label, page, onNavigate }) => {
    const context = useContext(AppContext);
    if (!context) return null;
    const { activePage, setActivePage } = context;

    const isActive = activePage === page;

    return (
        <button
            onClick={() => {
                setActivePage(page);
                onNavigate?.();
            }}
            className={`flex items-center w-full px-4 py-3 text-sm font-medium rounded-lg transition-colors duration-200 ${
                isActive
                ? 'bg-primary-500 text-white'
                : 'text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
            }`}
        >
            <span className="mr-4">{icon}</span>
            {label}
        </button>
    );
};

export const Layout: React.FC<LayoutProps> = ({ children }) => {
    const [isSidebarOpen, setSidebarOpen] = useState(false);
    const context = useContext(AppContext);
    if (!context) return null;
    const { appLanguage, toast } = context;
    
    const pageTitles = {
        [Page.HymnLibrary]: appLanguage === 'en' ? 'TLECC Hymn Library' : 'Àkójọpọ̀ Orin TLECC',
        [Page.HymnDetail]: appLanguage === 'en' ? 'Hymn' : 'Orin',
        [Page.Favorites]: appLanguage === 'en' ? 'Favorites' : 'Àwọn Ayànfẹ́',
        [Page.Bookmarks]: appLanguage === 'en' ? 'Bookmarks' : 'Àwọn Àmì Ìwé',
        [Page.History]: appLanguage === 'en' ? 'History' : 'Ìtàn',
        [Page.ChurchDoctrine]: appLanguage === 'en' ? 'Church Doctrine' : 'Ẹ̀kọ́ Ìjọ',
        [Page.Connect]: appLanguage === 'en' ? 'Connect' : 'Darapọ',
        [Page.Credits]: appLanguage === 'en' ? 'Credits' : 'Ìdúpẹ́',
        [Page.Donate]: appLanguage === 'en' ? 'Donate' : 'Ṣe Ìtọrẹ',
        [Page.Settings]: appLanguage === 'en' ? 'Settings' : 'Ètò',
        [Page.About]: appLanguage === 'en' ? 'About TLECC Hymns' : 'Nípa Orin TLECC',
    };

    const navItems = [
        { icon: <LibraryIcon className="w-5 h-5" />, label: pageTitles[Page.HymnLibrary], page: Page.HymnLibrary },
        { icon: <HeartIcon className="w-5 h-5" />, label: pageTitles[Page.Favorites], page: Page.Favorites },
        { icon: <BookmarkIcon className="w-5 h-5" />, label: pageTitles[Page.Bookmarks], page: Page.Bookmarks },
        { icon: <HistoryIcon className="w-5 h-5" />, label: pageTitles[Page.History], page: Page.History },
        { icon: <CrossIcon className="w-5 h-5" />, label: pageTitles[Page.ChurchDoctrine], page: Page.ChurchDoctrine },
        { icon: <RadioIcon className="w-5 h-5" />, label: pageTitles[Page.Connect], page: Page.Connect },
    ];

    const secondaryNavItems = [
        { icon: <InfoIcon className="w-5 h-5" />, label: pageTitles[Page.About], page: Page.About },
        { icon: <UsersIcon className="w-5 h-5" />, label: pageTitles[Page.Credits], page: Page.Credits },
        { icon: <DonateIcon className="w-5 h-5" />, label: pageTitles[Page.Donate], page: Page.Donate },
        { icon: <SettingsIcon className="w-5 h-5" />, label: pageTitles[Page.Settings], page: Page.Settings },
    ];

    const SidebarContent = ({ onNavigate }: { onNavigate?: () => void }) => (
        <div className="flex flex-col h-full p-4 space-y-4">
            <h1 className="text-2xl font-bold text-primary-600 dark:text-primary-400 px-2">Hymn Book</h1>
            <nav className="flex-1 space-y-2">
                {navItems.map(item => <NavItem key={item.page} {...item} onNavigate={onNavigate} />)}
            </nav>
            <div className="border-t border-gray-200 dark:border-gray-700 pt-4 space-y-2">
                 {secondaryNavItems.map(item => <NavItem key={item.page} {...item} onNavigate={onNavigate} />)}
            </div>
        </div>
    );

    return (
        <div className="flex h-screen bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200">
             {/* Toast Notification */}
             {toast.type && (
                <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-[60] flex items-center bg-gray-900/90 dark:bg-white/90 backdrop-blur text-white dark:text-gray-900 px-6 py-3 rounded-full shadow-2xl animate-fade-in-down transition-all duration-300">
                    {toast.type === 'info' && <InfoIcon className="w-5 h-5 mr-3 text-blue-400 dark:text-blue-600" />}
                    {toast.type === 'success' && <CheckIcon className="w-5 h-5 mr-3 text-green-400 dark:text-green-600" />}
                    {toast.type === 'error' && <XIcon className="w-5 h-5 mr-3 text-red-400 dark:text-red-600" />}
                    <span className="font-medium text-sm">{toast.message}</span>
                </div>
            )}

             {/* Mobile Sidebar */}
            <div
                className={`fixed inset-0 z-40 bg-black bg-opacity-50 transition-opacity lg:hidden ${
                    isSidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
                }`}
                onClick={() => setSidebarOpen(false)}
            ></div>
            <div
                className={`fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-gray-900 transform transition-transform lg:hidden ${
                    isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
                }`}
            >
                <SidebarContent onNavigate={() => setSidebarOpen(false)} />
            </div>

            {/* Desktop Sidebar */}
            <aside className="hidden lg:block w-64 flex-shrink-0 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700">
                <SidebarContent />
            </aside>

            <main className="flex-1 flex flex-col overflow-hidden">
                <header className="flex items-center justify-between p-4 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 lg:justify-end">
                    <button onClick={() => setSidebarOpen(true)} className="lg:hidden text-gray-500 dark:text-gray-400">
                        <MenuIcon className="w-6 h-6" />
                    </button>
                    <h2 className="text-xl font-semibold">{pageTitles[context.activePage]}</h2>
                </header>
                <div className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
                    {children}
                </div>
            </main>
        </div>
    );
};