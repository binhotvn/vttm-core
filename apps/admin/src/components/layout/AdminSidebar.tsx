'use client';

import { usePathname, useRouter } from 'next/navigation';
import { Tooltip, Badge, Avatar } from 'antd';
import {
  LayoutDashboard,
  ShoppingCart,
  Package,
  Layers,
  Truck,
  Warehouse,
  ClipboardList,
  Scale,
  UserCog,
  Settings,
} from 'lucide-react';

interface NavItem {
  key: string;
  href: string;
  icon: any;
  label: string;
  badge?: boolean;
}

const NAV_GROUPS: { items: NavItem[] }[] = [
  {
    items: [
      { key: 'dashboard',  href: '/',          icon: LayoutDashboard, label: 'Tổng quan' },
      { key: 'orders',     href: '/orders',    icon: ShoppingCart,    label: 'Đơn hàng',     badge: true },
      { key: 'shipments',  href: '/shipments', icon: Package,         label: 'Vận đơn',      badge: true },
      { key: 'batches',    href: '/batches',   icon: Layers,          label: 'Lô hàng' },
    ],
  },
  {
    items: [
      { key: 'drivers',  href: '/drivers',  icon: Truck,         label: 'Tài xế' },
      { key: 'hubs',     href: '/hubs',     icon: Warehouse,     label: 'Kho' },
      { key: 'pickups',  href: '/pickups',  icon: ClipboardList, label: 'Lấy hàng', badge: true },
      { key: 'cod',      href: '/cod',      icon: Scale,         label: 'Đối soát COD' },
    ],
  },
  {
    items: [
      { key: 'users',    href: '/users',    icon: UserCog,  label: 'Người dùng' },
      { key: 'settings', href: '/settings', icon: Settings, label: 'Cài đặt' },
    ],
  },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const locale = pathname.split('/')[1] || 'vi';
  const cleanPath = pathname.replace(/^\/(vi|en)/, '') || '/';

  const isActive = (href: string) => {
    if (href === '/') return cleanPath === '/' || cleanPath === '';
    return cleanPath === href || cleanPath.startsWith(href + '/');
  };

  return (
    <div
      style={{
        width: 56,
        height: '100vh',
        position: 'fixed',
        left: 0,
        top: 0,
        background: 'linear-gradient(180deg, #714B67 0%, #5B3A52 100%)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        zIndex: 200,
        paddingTop: 8,
      }}
    >
      {/* Logo */}
      <div
        style={{
          width: 36,
          height: 36,
          borderRadius: 8,
          background: 'rgba(255,255,255,0.2)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontWeight: 700,
          fontSize: 13,
          color: '#fff',
          cursor: 'pointer',
          marginBottom: 12,
          flexShrink: 0,
        }}
        onClick={() => router.push(`/${locale}`)}
      >
        VT
      </div>

      {/* Nav groups */}
      <div style={{ flex: 1, width: '100%', overflow: 'auto', display: 'flex', flexDirection: 'column', gap: 4 }}>
        {NAV_GROUPS.map((group, gi) => (
          <div key={gi}>
            {gi > 0 && (
              <div style={{ height: 1, background: 'rgba(255,255,255,0.12)', margin: '6px 10px' }} />
            )}
            {group.items.map((item) => {
              const active = isActive(item.href);
              const fullHref = item.href === '/' ? `/${locale}` : `/${locale}${item.href}`;
              const Icon = item.icon;
              return (
                <Tooltip key={item.key} title={item.label} placement="right">
                  <div
                    onClick={() => router.push(fullHref)}
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: 8,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      margin: '2px auto',
                      background: active ? 'rgba(255,255,255,0.2)' : 'transparent',
                      transition: 'background 0.15s',
                      position: 'relative',
                    }}
                    onMouseEnter={(e) => {
                      if (!active) e.currentTarget.style.background = 'rgba(255,255,255,0.1)';
                    }}
                    onMouseLeave={(e) => {
                      if (!active) e.currentTarget.style.background = 'transparent';
                    }}
                  >
                    <Icon
                      size={20}
                      strokeWidth={1.75}
                      style={{ color: active ? '#fff' : 'rgba(255,255,255,0.7)' }}
                    />
                    {item.badge && (
                      <div
                        style={{
                          position: 'absolute',
                          top: 6,
                          right: 6,
                          width: 8,
                          height: 8,
                          borderRadius: '50%',
                          background: '#e8590c',
                          border: '1.5px solid #714B67',
                        }}
                      />
                    )}
                  </div>
                </Tooltip>
              );
            })}
          </div>
        ))}
      </div>

      {/* Bottom: user avatar */}
      <div style={{ paddingBottom: 12, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
        <Tooltip title="Cài đặt" placement="right">
          <div
            onClick={() => router.push(`/${locale}/settings`)}
            style={{
              width: 36,
              height: 36,
              borderRadius: 8,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              transition: 'background 0.15s',
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
          >
            <Settings size={18} style={{ color: 'rgba(255,255,255,0.6)' }} />
          </div>
        </Tooltip>
        <Avatar
          size={32}
          style={{
            background: 'rgba(255,255,255,0.2)',
            color: '#fff',
            fontSize: 13,
            cursor: 'pointer',
          }}
        >
          A
        </Avatar>
      </div>
    </div>
  );
}
