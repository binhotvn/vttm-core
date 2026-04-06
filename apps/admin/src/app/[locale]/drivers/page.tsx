'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { StatusBadge } from '@/components/data/status-badge';
import { apiFetch, getTokenFromCookie } from '@/lib/api-client';

export default function DriversPage() {
  const t = useTranslations();
  const [drivers, setDrivers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const token = getTokenFromCookie();
        const result = await apiFetch('/drivers?limit=50', { token: token! });
        setDrivers(result.data || result);
      } catch (e) { console.error(e); }
      setLoading(false);
    };
    load();
  }, []);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">{t('app.drivers')}</h1>
        <button className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm hover:bg-blue-700">+ {t('common.create')}</button>
      </div>
      {loading ? (
        <p className="text-gray-400 text-center py-8">Loading...</p>
      ) : drivers.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center text-gray-400">
          <p className="text-lg mb-2">No drivers yet</p>
          <p className="text-sm">Create driver profiles to start assigning deliveries</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {drivers.map((driver: any) => (
            <div key={driver.id} className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold">{driver.user?.fullName || 'Driver'}</h3>
                <StatusBadge status={driver.status} />
              </div>
              <div className="text-sm text-gray-500 space-y-1">
                <p>{driver.user?.phone || '—'}</p>
                <p>Vehicle: {driver.capabilities?.vehicleType || '—'}</p>
                <p>Max: {driver.capabilities?.maxWeightKg || 30}kg</p>
                <p>Hub: {driver.homeHub?.name || '—'}</p>
                {driver.performanceMetrics?.successRate && (
                  <p>Success Rate: {(driver.performanceMetrics.successRate * 100).toFixed(0)}%</p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
