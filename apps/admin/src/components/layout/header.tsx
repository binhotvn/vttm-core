'use client';

import { useState, useRef, useEffect } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { useRouter, usePathname } from 'next/navigation';
import {
  Menu,
  Search,
  Bell,
  User,
  ChevronDown,
  Globe,
  Settings,
  LogOut,
  UserCircle,
  Check,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface HeaderProps {
  onToggleSidebar: () => void;
}

export function Header({ onToggleSidebar }: HeaderProps) {
  const t = useTranslations('common');
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  const switchLocale = (newLocale: string) => {
    const segments = pathname.split('/');
    segments[1] = newLocale;
    router.push(segments.join('/'));
    setUserMenuOpen(false);
  };

  const handleLogout = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('accessToken');
      window.location.href = `/${locale}/login`;
    }
  };

  // Close menu on outside click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  // Ctrl+K shortcut for search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        searchRef.current?.focus();
      }
      if (e.key === 'Escape') {
        searchRef.current?.blur();
        setUserMenuOpen(false);
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <header className="h-14 bg-white border-b border-gray-200/80 flex items-center gap-4 px-4 shrink-0 z-40">
      {/* Sidebar toggle */}
      <button
        onClick={onToggleSidebar}
        className="p-2 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors"
      >
        <Menu size={20} />
      </button>

      {/* Global search */}
      <div className="flex-1 max-w-lg">
        <div
          className={cn(
            'flex items-center gap-2 px-3 py-2 rounded-lg border transition-all duration-150',
            searchFocused
              ? 'border-blue-400 bg-white shadow-sm ring-2 ring-blue-100'
              : 'border-gray-200 bg-gray-50 hover:bg-gray-100'
          )}
        >
          <Search size={16} className="text-gray-400 shrink-0" />
          <input
            ref={searchRef}
            type="text"
            placeholder={`${t('search')}... (Ctrl+K)`}
            className="flex-1 bg-transparent text-sm outline-none placeholder:text-gray-400"
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
          />
          <kbd className="hidden sm:inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-gray-100 border border-gray-200 text-[10px] text-gray-400 font-mono">
            ⌘K
          </kbd>
        </div>
      </div>

      {/* Right section */}
      <div className="flex items-center gap-1">
        {/* Notifications */}
        <button className="relative p-2 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors">
          <Bell size={20} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-500 ring-2 ring-white" />
        </button>

        {/* User dropdown */}
        <div ref={userMenuRef} className="relative">
          <button
            onClick={() => setUserMenuOpen(!userMenuOpen)}
            className={cn(
              'flex items-center gap-2 px-2 py-1.5 rounded-lg transition-colors',
              userMenuOpen
                ? 'bg-gray-100 text-gray-900'
                : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
            )}
          >
            <div className="w-7 h-7 rounded-full bg-blue-500 flex items-center justify-center">
              <span className="text-xs font-semibold text-white">A</span>
            </div>
            <span className="hidden md:block text-sm font-medium">Admin</span>
            <ChevronDown size={14} className={cn('transition-transform duration-150', userMenuOpen && 'rotate-180')} />
          </button>

          {/* Dropdown menu */}
          {userMenuOpen && (
            <div className="dropdown-menu absolute right-0 top-full mt-1 w-56 py-1 overflow-hidden">
              {/* User info */}
              <div className="px-4 py-3 border-b border-gray-100">
                <p className="text-sm font-semibold text-gray-900">Admin</p>
                <p className="text-xs text-gray-500">admin@vttm.vn</p>
              </div>

              {/* Menu items */}
              <div className="py-1">
                <button className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                  <UserCircle size={16} className="text-gray-400" />
                  {t('profile')}
                </button>

                {/* Language submenu */}
                <div className="relative group">
                  <div className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700">
                    <Globe size={16} className="text-gray-400" />
                    <span className="flex-1">{t('language')}</span>
                    <div className="flex gap-1">
                      <button
                        onClick={() => switchLocale('vi')}
                        className={cn(
                          'px-2 py-0.5 rounded text-xs font-medium transition-colors',
                          locale === 'vi'
                            ? 'bg-blue-100 text-blue-700'
                            : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                        )}
                      >
                        {locale === 'vi' && <Check size={10} className="inline mr-0.5" />}
                        VI
                      </button>
                      <button
                        onClick={() => switchLocale('en')}
                        className={cn(
                          'px-2 py-0.5 rounded text-xs font-medium transition-colors',
                          locale === 'en'
                            ? 'bg-blue-100 text-blue-700'
                            : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                        )}
                      >
                        {locale === 'en' && <Check size={10} className="inline mr-0.5" />}
                        EN
                      </button>
                    </div>
                  </div>
                </div>

                <button className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                  <Settings size={16} className="text-gray-400" />
                  {t('settings')}
                </button>
              </div>

              {/* Logout */}
              <div className="border-t border-gray-100 py-1">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                >
                  <LogOut size={16} />
                  {t('logout')}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
