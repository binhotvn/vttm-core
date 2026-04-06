'use client';

import { usePathname, useRouter } from 'next/navigation';
import { AdminSidebar } from './AdminSidebar';
import { AdminHeader } from './AdminHeader';

const BREADCRUMB_MAP: Record<string, string> = {
  '/':          'Tổng quan',
  '/orders':    'Đơn hàng',
  '/shipments': 'Vận đơn',
  '/batches':   'Lô hàng',
  '/drivers':   'Tài xế',
  '/hubs':      'Kho',
  '/pickups':   'Lấy hàng',
  '/cod':       'Đối soát COD',
  '/users':     'Người dùng',
  '/settings':  'Cài đặt',
  '/returns':   'Hoàn hàng',
};

export function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const locale = pathname.split('/')[1] || 'vi';
  const cleanPath = pathname.replace(/^\/(vi|en)/, '') || '/';

  // Find matching breadcrumb (supports nested routes like /orders/123)
  const breadcrumb = BREADCRUMB_MAP[cleanPath]
    || BREADCRUMB_MAP['/' + cleanPath.split('/').filter(Boolean)[0]]
    || 'Tổng quan';

  const handleLocaleChange = (newLocale: string) => {
    const segments = pathname.split('/');
    segments[1] = newLocale;
    router.push(segments.join('/'));
  };

  return (
    <div style={{ minHeight: '100vh', background: '#f8f9fa' }}>
      <AdminSidebar />
      <div style={{ marginLeft: 56 }}>
        <AdminHeader
          locale={locale}
          breadcrumb={breadcrumb}
          onLocaleChange={handleLocaleChange}
        />
        <main>{children}</main>
      </div>
    </div>
  );
}
