'use client';

import { useTranslations } from 'next-intl';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import {
  LayoutDashboard,
  ShoppingCart,
  Truck,
  Search,
  Package,
  RotateCcw,
  DollarSign,
  FileText,
  BookOpen,
  ClipboardList,
  Settings,
  HelpCircle,
  ChevronLeft,
  ChevronRight,
  User,
  Crown,
  Users,
  Snowflake,
  Thermometer,
  AlertOctagon,
  Radio,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface NavItem {
  key: string;
  href: string;
  icon: React.ReactNode;
  labelKey: string;
  badge?: number;
}

interface NavGroup {
  type: 'group';
  labelKey: string;
  items: NavItem[];
}

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

function getNavGroups(badges: Record<string, number> = {}): NavGroup[] {
  return [
    {
      type: 'group',
      labelKey: 'sidebar.orderManagement',
      items: [
        { key: 'dashboard', href: '/', icon: <LayoutDashboard size={20} />, labelKey: 'app.dashboard' },
        { key: 'orders', href: '/orders', icon: <ShoppingCart size={20} />, labelKey: 'app.orders', badge: badges.orders },
        { key: 'shipments', href: '/shipments', icon: <Truck size={20} />, labelKey: 'app.shipments', badge: badges.shipments },
        { key: 'tracking', href: '/tracking', icon: <Search size={20} />, labelKey: 'sidebar.tracking' },
      ],
    },
    {
      type: 'group',
      labelKey: 'sidebar.operations',
      items: [
        { key: 'pickups', href: '/pickups', icon: <Package size={20} />, labelKey: 'app.pickups', badge: badges.pickups },
        { key: 'returns', href: '/returns', icon: <RotateCcw size={20} />, labelKey: 'app.returns', badge: badges.returns },
        { key: 'cod', href: '/cod', icon: <DollarSign size={20} />, labelKey: 'app.cod' },
      ],
    },
    {
      type: 'group',
      labelKey: 'sidebar.coldChain',
      items: [
        { key: 'cold-chain', href: '/cold-chain', icon: <Snowflake size={20} />, labelKey: 'sidebar.coldChainDashboard' },
        { key: 'cold-chain-monitor', href: '/cold-chain/monitor', icon: <Thermometer size={20} />, labelKey: 'sidebar.liveMonitor' },
        { key: 'cold-chain-breaches', href: '/cold-chain/breaches', icon: <AlertOctagon size={20} />, labelKey: 'sidebar.breaches', badge: badges.coldChainBreaches },
        { key: 'cold-chain-sensors', href: '/cold-chain/sensors', icon: <Radio size={20} />, labelKey: 'sidebar.sensors' },
      ],
    },
    {
      type: 'group',
      labelKey: 'sidebar.finance',
      items: [
        { key: 'invoices', href: '/invoices', icon: <FileText size={20} />, labelKey: 'sidebar.invoices' },
        { key: 'ledger', href: '/ledger', icon: <BookOpen size={20} />, labelKey: 'sidebar.ledger' },
        { key: 'reconciliation', href: '/reconciliation', icon: <ClipboardList size={20} />, labelKey: 'sidebar.reconciliation' },
      ],
    },
  ];
}

const bottomItems: NavItem[] = [
  { key: 'users', href: '/users', icon: <Users size={20} />, labelKey: 'app.users' },
  { key: 'settings', href: '/settings', icon: <Settings size={20} />, labelKey: 'app.settings' },
  { key: 'help', href: '/help', icon: <HelpCircle size={20} />, labelKey: 'sidebar.help' },
];

export function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const t = useTranslations();
  const pathname = usePathname();
  const locale = pathname.split('/')[1];

  const navGroups = getNavGroups();

  const isActive = (href: string) => {
    const fullHref = `/${locale}${href === '/' ? '' : href}`;
    return pathname === fullHref || (href !== '/' && pathname.startsWith(fullHref));
  };

  const renderNavItem = (item: NavItem) => {
    const fullHref = `/${locale}${item.href === '/' ? '' : item.href}`;
    const active = isActive(item.href);

    return (
      <Link
        key={item.key}
        href={fullHref}
        title={collapsed ? t(item.labelKey) : undefined}
        className={cn(
          'group flex items-center gap-3 rounded-lg text-sm font-medium transition-all duration-150',
          collapsed ? 'justify-center px-2 py-2.5 mx-2' : 'px-3 py-2.5 mx-2',
          active
            ? 'bg-white/10 text-white shadow-sm'
            : 'text-white/65 hover:bg-white/[0.04] hover:text-white/90'
        )}
      >
        <span className={cn('shrink-0', active && 'text-blue-400')}>
          {item.icon}
        </span>
        {!collapsed && (
          <>
            <span className="flex-1 text-truncate">{t(item.labelKey)}</span>
            {item.badge != null && item.badge > 0 && (
              <span className="min-w-[20px] h-5 flex items-center justify-center rounded-full bg-blue-500 text-[11px] font-semibold text-white px-1.5">
                {item.badge > 99 ? '99+' : item.badge}
              </span>
            )}
          </>
        )}
        {collapsed && item.badge != null && item.badge > 0 && (
          <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-blue-500" />
        )}
      </Link>
    );
  };

  return (
    <aside
      className={cn(
        'sidebar-transition flex flex-col bg-[#001529] text-white shrink-0 h-screen overflow-hidden',
        collapsed ? 'w-[72px]' : 'w-64'
      )}
    >
      {/* Logo */}
      <div className={cn(
        'flex items-center border-b border-white/10 shrink-0',
        collapsed ? 'justify-center px-2 h-14' : 'px-4 h-14 gap-3'
      )}>
        <div className="w-8 h-8 rounded-lg bg-blue-500 flex items-center justify-center font-bold text-sm shrink-0">
          V
        </div>
        {!collapsed && (
          <div className="overflow-hidden">
            <h1 className="text-base font-bold leading-tight text-white">VTTM</h1>
            <p className="text-[10px] text-white/50 leading-tight">Vận tải thông minh</p>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto overflow-x-hidden py-2 sidebar-nav">
        {navGroups.map((group, gi) => (
          <div key={gi} className="mb-1">
            {!collapsed && (
              <div className="px-5 pt-4 pb-1.5">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-white/35">
                  {t(group.labelKey)}
                </span>
              </div>
            )}
            {collapsed && gi > 0 && (
              <div className="mx-4 my-2 border-t border-white/10" />
            )}
            <div className="space-y-0.5">
              {group.items.map(renderNavItem)}
            </div>
          </div>
        ))}
      </nav>

      {/* Divider */}
      <div className="mx-4 border-t border-white/10" />

      {/* Bottom nav items */}
      <div className="py-2 space-y-0.5 shrink-0">
        {bottomItems.map(renderNavItem)}
      </div>

      {/* User profile card */}
      {!collapsed && (
        <div className="mx-3 mb-3 p-3 rounded-lg bg-white/[0.06] shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-blue-500/30 flex items-center justify-center shrink-0">
              <User size={16} className="text-blue-300" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white leading-tight text-truncate">Admin</p>
              <p className="text-[11px] text-white/50 leading-tight text-truncate">VTTM Logistics</p>
            </div>
            <Crown size={14} className="text-yellow-400 shrink-0" />
          </div>
        </div>
      )}

      {/* Collapse toggle */}
      <button
        onClick={onToggle}
        className="flex items-center justify-center h-10 border-t border-white/10 text-white/50 hover:text-white/80 hover:bg-white/[0.04] transition-colors shrink-0"
      >
        {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
      </button>
    </aside>
  );
}
