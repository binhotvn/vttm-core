'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { DataTable } from '@/components/data/data-table';
import { StatusBadge } from '@/components/data/status-badge';
import { apiFetch, getTokenFromCookie } from '@/lib/api-client';

export default function PickupsPage() {
  const t = useTranslations();
  const [data, setData] = useState<any[]>([]);
  const [meta, setMeta] = useState({ total: 0, page: 1, limit: 20, totalPages: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const token = getTokenFromCookie();
        const result = await apiFetch('/pickups?limit=20', { token: token! });
        setData(result.data || result);
        if (result.meta) setMeta(result.meta);
      } catch (e) { console.error(e); }
      setLoading(false);
    };
    load();
  }, []);

  const columns = [
    { key: 'pickupNumber', header: 'Pickup #', render: (item: any) => <span className="font-mono text-sm">{item.pickupNumber}</span> },
    { key: 'status', header: 'Status', render: (item: any) => <StatusBadge status={item.status} /> },
    { key: 'contactInfo', header: 'Contact', render: (item: any) => <span className="text-sm">{item.contactInfo?.name} ({item.contactInfo?.phone})</span> },
    { key: 'timeSlot', header: 'Time Slot', render: (item: any) => <span className="text-xs">{item.timeSlot?.label || '—'}</span> },
    { key: 'estimatedPieceCount', header: 'Pieces' },
    { key: 'requestedDate', header: 'Date', render: (item: any) => new Date(item.requestedDate).toLocaleDateString('vi-VN') },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">{t('app.pickups')}</h1>
      </div>
      <DataTable columns={columns} data={data} total={meta.total} page={meta.page} limit={meta.limit} loading={loading} />
    </div>
  );
}
