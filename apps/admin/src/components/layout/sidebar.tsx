'use client';

import { useTranslations } from 'next-intl';
import { usePathname } from 'next/navigation';
import Link from 'next/link';

const navItems = [
  { key: 'dashboard', href: '/', icon: '📊' },
  { key: 'orders', href: '/orders', icon: '📦' },
  { key: 'shipments', href: '/shipments', icon: '🚚' },
  { key: 'batches', href: '/batches', icon: '📋' },
  { key: 'drivers', href: '/drivers', icon: '🏍️' },
  { key: 'hubs', href: '/hubs', icon: '🏭' },
  { key: 'pickups', href: '/pickups', icon: '📥' },
  { key: 'cod', href: '/cod', icon: '💰' },
  { key: 'users', href: '/users', icon: '👥' },
  { key: 'settings', href: '/settings', icon: '⚙️' },
];

export function Sidebar() {
  const t = useTranslations('app');
  const pathname = usePathname();
  const locale = pathname.split('/')[1];

  return (
    <aside className="w-64 bg-gray-900 text-white flex flex-col">
      <div className="p-4 border-b border-gray-700">
        <h1 className="text-xl font-bold">VTTM</h1>
        <p className="text-xs text-gray-400">Logistics Platform</p>
      </div>
      <nav className="flex-1 py-4">
        {navItems.map((item) => {
          const fullHref = `/${locale}${item.href === '/' ? '' : item.href}`;
          const isActive = pathname === fullHref || (item.href !== '/' && pathname.startsWith(fullHref));
          return (
            <Link
              key={item.key}
              href={fullHref}
              className={`flex items-center gap-3 px-4 py-2.5 text-sm transition ${
                isActive ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-gray-800'
              }`}
            >
              <span>{item.icon}</span>
              <span>{t(item.key)}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
