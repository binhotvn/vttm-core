'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { apiFetch, getTokenFromCookie } from '@/lib/api-client';

export default function HubsPage() {
  const t = useTranslations();
  const [hubs, setHubs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const token = getTokenFromCookie();
        const result = await apiFetch('/hubs?limit=50', { token: token! });
        setHubs(result.data || result);
      } catch (e) { console.error(e); }
      setLoading(false);
    };
    load();
  }, []);

  const typeLabels: Record<string, string> = {
    SORTING_CENTER: 'Trung tâm phân loại',
    DISTRIBUTION_CENTER: 'Trung tâm phân phối',
    CROSS_DOCK: 'Trung chuyển',
    COLLECTION_POINT: 'Điểm thu gom',
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">{t('app.hubs')}</h1>
        <button className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm hover:bg-blue-700">+ {t('common.create')}</button>
      </div>
      {loading ? (
        <p className="text-gray-400 text-center py-8">Loading...</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {hubs.map((hub: any) => (
            <div key={hub.id} className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold">{hub.name}</h3>
                <span className={`w-2 h-2 rounded-full ${hub.isActive ? 'bg-green-500' : 'bg-gray-300'}`} />
              </div>
              <p className="text-xs text-gray-400 font-mono mb-3">{hub.code}</p>
              <div className="text-sm text-gray-500 space-y-1">
                <p>{typeLabels[hub.type] || hub.type}</p>
                <p>{hub.address?.streetAddress || ''}</p>
                <p>{hub.address?.districtName}, {hub.address?.provinceName}</p>
                {hub.capacity && <p>Capacity: {hub.capacity} shipments/day</p>}
                {hub.contactPhone && <p>Tel: {hub.contactPhone}</p>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
