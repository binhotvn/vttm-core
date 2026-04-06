'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter, usePathname } from 'next/navigation';
import { DataTable } from '@/components/data/data-table';
import { StatusBadge } from '@/components/data/status-badge';
import { apiFetch, getTokenFromCookie } from '@/lib/api-client';

export default function OrdersPage() {
  const t = useTranslations();
  const router = useRouter();
  const pathname = usePathname();
  const locale = pathname.split('/')[1];
  const [data, setData] = useState<any[]>([]);
  const [meta, setMeta] = useState({ total: 0, page: 1, limit: 20, totalPages: 0 });
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchOrders = async (page = 1) => {
    setLoading(true);
    try {
      const token = getTokenFromCookie();
      const params = new URLSearchParams({ page: String(page), limit: '20' });
      if (status) params.set('status', status);
      const result = await apiFetch(`/orders?${params}`, { token: token! });
      setData(result.data || result);
      if (result.meta) setMeta(result.meta);
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  useEffect(() => { fetchOrders(); }, [status]);

  const columns = [
    { key: 'orderNumber', header: t('app.orders') + ' #' },
    { key: 'status', header: t('common.status' as any) || 'Status', render: (item: any) => <StatusBadge status={item.status} locale={locale} /> },
    { key: 'serviceType', header: 'Service', render: (item: any) => <span className="text-xs">{item.serviceType}</span> },
    { key: 'paymentMethod', header: 'Payment', render: (item: any) => <span className="text-xs">{item.paymentMethod}</span> },
    { key: 'codAmount', header: 'COD', render: (item: any) => <span>{Number(item.codAmount).toLocaleString('vi-VN')}₫</span> },
    { key: 'items', header: 'Items', render: (item: any) => <span>{item.items?.length || 0}</span> },
    { key: 'createdAt', header: 'Created', render: (item: any) => new Date(item.createdAt).toLocaleDateString('vi-VN') },
  ];

  const statuses = ['', 'DRAFT', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">{t('app.orders')}</h1>
        <button className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm hover:bg-blue-700">
          + {t('common.create')}
        </button>
      </div>

      <div className="flex gap-2 mb-4">
        {statuses.map((s) => (
          <button
            key={s}
            onClick={() => setStatus(s)}
            className={`px-3 py-1 rounded-full text-xs border ${status === s ? 'bg-blue-600 text-white border-blue-600' : 'bg-white border-gray-300 hover:bg-gray-50'}`}
          >
            {s || 'All'}
          </button>
        ))}
      </div>

      <DataTable
        columns={columns}
        data={data}
        total={meta.total}
        page={meta.page}
        limit={meta.limit}
        loading={loading}
        onPageChange={(p) => fetchOrders(p)}
        onRowClick={(item) => router.push(`/${locale}/orders/${item.id}`)}
      />
    </div>
  );
}
