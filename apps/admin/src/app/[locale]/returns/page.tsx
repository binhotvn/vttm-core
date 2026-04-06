'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { DataTable } from '@/components/data/data-table';
import { StatusBadge } from '@/components/data/status-badge';
import { apiFetch, getTokenFromCookie } from '@/lib/api-client';

export default function ReturnsPage() {
  const t = useTranslations();
  const [data, setData] = useState<any[]>([]);
  const [meta, setMeta] = useState({ total: 0, page: 1, limit: 20, totalPages: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const token = getTokenFromCookie();
        const result = await apiFetch('/returns?limit=20', { token: token! });
        setData(result.data || result);
        if (result.meta) setMeta(result.meta);
      } catch (e) { console.error(e); }
      setLoading(false);
    };
    load();
  }, []);

  const columns = [
    { key: 'returnNumber', header: 'Return #', render: (item: any) => <span className="font-mono text-sm">{item.returnNumber}</span> },
    { key: 'status', header: 'Status', render: (item: any) => <StatusBadge status={item.status} /> },
    { key: 'reason', header: 'Reason', render: (item: any) => <span className="text-xs">{item.reason?.replace(/_/g, ' ')}</span> },
    { key: 'returnFee', header: 'Fee', render: (item: any) => `${Number(item.returnFee).toLocaleString('vi-VN')}₫` },
    { key: 'createdAt', header: 'Created', render: (item: any) => new Date(item.createdAt).toLocaleDateString('vi-VN') },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">{t('app.returns')}</h1>
      </div>
      <DataTable columns={columns} data={data} total={meta.total} page={meta.page} limit={meta.limit} loading={loading} />
    </div>
  );
}
