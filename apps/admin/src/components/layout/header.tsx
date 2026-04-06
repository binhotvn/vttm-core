'use client';

import { useTranslations, useLocale } from 'next-intl';
import { useRouter, usePathname } from 'next/navigation';

export function Header() {
  const t = useTranslations('common');
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  const switchLocale = (newLocale: string) => {
    const segments = pathname.split('/');
    segments[1] = newLocale;
    router.push(segments.join('/'));
  };

  return (
    <header className="bg-white shadow-sm border-b px-6 py-3 flex items-center justify-between">
      <div>
        <input
          type="text"
          placeholder={t('search')}
          className="px-3 py-1.5 border border-gray-300 rounded-md text-sm w-64 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      <div className="flex items-center gap-4">
        <div className="flex gap-1">
          <button
            onClick={() => switchLocale('vi')}
            className={`px-2 py-1 text-xs rounded ${locale === 'vi' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
          >
            VI
          </button>
          <button
            onClick={() => switchLocale('en')}
            className={`px-2 py-1 text-xs rounded ${locale === 'en' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
          >
            EN
          </button>
        </div>
        <button className="text-sm text-gray-600 hover:text-gray-900">{t('logout')}</button>
      </div>
    </header>
  );
}
