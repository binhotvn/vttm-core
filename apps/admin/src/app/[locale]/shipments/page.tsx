'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter, usePathname } from 'next/navigation';
import { DataTable } from '@/components/data/data-table';
import { StatusBadge } from '@/components/data/status-badge';
import { apiFetch, getTokenFromCookie } from '@/lib/api-client';

export default function ShipmentsPage() {
  const t = useTranslations();
  const router = useRouter();
  const pathname = usePathname();
  const locale = pathname.split('/')[1];
  const [data, setData] = useState<any[]>([]);
  const [meta, setMeta] = useState({ total: 0, page: 1, limit: 20, totalPages: 0 });
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchShipments = async (page = 1) => {
    setLoading(true);
    try {
      const token = getTokenFromCookie();
      const params = new URLSearchParams({ page: String(page), limit: '20' });
      if (status) params.set('status', status);
      const result = await apiFetch(`/shipments?${params}`, { token: token! });
      setData(result.data || result);
      if (result.meta) setMeta(result.meta);
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  useEffect(() => { fetchShipments(); }, [status]);

  const columns = [
    { key: 'trackingNumber', header: 'Tracking #', render: (item: any) => <span className="font-mono text-sm font-medium text-blue-600">{item.trackingNumber}</span> },
    { key: 'status', header: t('common.status' as any) || 'Status', render: (item: any) => <StatusBadge status={item.status} locale={locale} /> },
    { key: 'serviceType', header: 'Service', render: (item: any) => <span className="text-xs">{item.serviceType}</span> },
    { key: 'weightKg', header: 'Weight', render: (item: any) => <span>{item.weightKg}kg</span> },
    { key: 'codAmount', header: 'COD', render: (item: any) => Number(item.codAmount) > 0 ? <span className="text-orange-600 font-medium">{Number(item.codAmount).toLocaleString('vi-VN')}₫</span> : <span className="text-gray-400">—</span> },
    { key: 'createdAt', header: 'Created', render: (item: any) => new Date(item.createdAt).toLocaleDateString('vi-VN') },
  ];

  const statuses = ['', 'LABEL_CREATED', 'PICKED_UP', 'IN_TRANSIT', 'AT_DESTINATION_HUB', 'OUT_FOR_DELIVERY', 'DELIVERED', 'EXCEPTION'];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">{t('app.shipments')}</h1>
      </div>

      <div className="flex gap-2 mb-4 flex-wrap">
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
        onPageChange={(p) => fetchShipments(p)}
        onRowClick={(item) => router.push(`/${locale}/shipments/${item.id}`)}
      />
    </div>
  );
}
