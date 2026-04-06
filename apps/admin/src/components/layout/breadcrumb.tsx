'use client';

import { usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { Home, ChevronRight } from 'lucide-react';
import { useBreadcrumbOverride } from './breadcrumb-context';

const ROUTE_LABEL_KEYS: Record<string, string> = {
  '': 'app.dashboard',
  orders: 'app.orders',
  shipments: 'app.shipments',
  batches: 'app.batches',
  drivers: 'app.drivers',
  hubs: 'app.hubs',
  pickups: 'app.pickups',
  cod: 'app.cod',
  returns: 'app.returns',
  settings: 'app.settings',
  users: 'app.users',
  tracking: 'sidebar.tracking',
  invoices: 'sidebar.invoices',
  ledger: 'sidebar.ledger',
  reconciliation: 'sidebar.reconciliation',
  help: 'sidebar.help',
};

export function Breadcrumb() {
  const pathname = usePathname();
  const t = useTranslations();
  const { overrides } = useBreadcrumbOverride();

  const segments = pathname.split('/').filter(Boolean);
  // Remove locale segment
  const locale = segments[0];
  const routeSegments = segments.slice(1);

  if (routeSegments.length === 0) return null;

  const crumbs = routeSegments.map((seg, i) => {
    const href = `/${locale}/${routeSegments.slice(0, i + 1).join('/')}`;
    const overrideLabel = overrides[seg];
    const labelKey = ROUTE_LABEL_KEYS[seg];
    const label = overrideLabel || (labelKey ? t(labelKey) : seg);
    const isLast = i === routeSegments.length - 1;

    return { href, label, isLast };
  });

  return (
    <nav className="flex items-center gap-1.5 px-6 py-2.5 text-sm bg-white/50 border-b border-gray-100">
      <Link
        href={`/${locale}`}
        className="flex items-center text-gray-400 hover:text-gray-600 transition-colors"
      >
        <Home size={14} />
      </Link>
      {crumbs.map((crumb, i) => (
        <span key={i} className="flex items-center gap-1.5">
          <ChevronRight size={12} className="text-gray-300" />
          {crumb.isLast ? (
            <span className="font-medium text-gray-800">{crumb.label}</span>
          ) : (
            <Link href={crumb.href} className="text-gray-500 hover:text-gray-700 transition-colors">
              {crumb.label}
            </Link>
          )}
        </span>
      ))}
    </nav>
  );
}
