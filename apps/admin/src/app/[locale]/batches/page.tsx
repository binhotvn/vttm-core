'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { DataTable } from '@/components/data/data-table';
import { StatusBadge } from '@/components/data/status-badge';
import { apiFetch, getTokenFromCookie } from '@/lib/api-client';

export default function BatchesPage() {
  const t = useTranslations();
  const [data, setData] = useState<any[]>([]);
  const [meta, setMeta] = useState({ total: 0, page: 1, limit: 20, totalPages: 0 });
  const [loading, setLoading] = useState(true);

  const fetchBatches = async (page = 1) => {
    setLoading(true);
    try {
      const token = getTokenFromCookie();
      const result = await apiFetch(`/batches?page=${page}&limit=20`, { token: token! });
      setData(result.data || result);
      if (result.meta) setMeta(result.meta);
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  useEffect(() => { fetchBatches(); }, []);

  const columns = [
    { key: 'batchNumber', header: 'Batch #', render: (item: any) => <span className="font-mono text-sm">{item.batchNumber}</span> },
    { key: 'type', header: 'Type', render: (item: any) => <span className="text-xs bg-gray-100 px-2 py-0.5 rounded">{item.type}</span> },
    { key: 'status', header: 'Status', render: (item: any) => <StatusBadge status={item.status} /> },
    { key: 'shipmentCount', header: 'Shipments' },
    { key: 'totalWeightKg', header: 'Weight', render: (item: any) => `${item.totalWeightKg}kg` },
    { key: 'totalCodAmount', header: 'COD', render: (item: any) => `${Number(item.totalCodAmount).toLocaleString('vi-VN')}₫` },
    { key: 'sealNumber', header: 'Seal', render: (item: any) => item.sealNumber || <span className="text-gray-300">—</span> },
    { key: 'createdAt', header: 'Created', render: (item: any) => new Date(item.createdAt).toLocaleDateString('vi-VN') },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">{t('app.batches')}</h1>
        <button className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm hover:bg-blue-700">+ {t('common.create')}</button>
      </div>
      <DataTable columns={columns} data={data} total={meta.total} page={meta.page} limit={meta.limit} loading={loading} onPageChange={fetchBatches} />
    </div>
  );
}
