'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { StatsCard } from '@/components/data/stats-card';
import { apiFetch, getTokenFromCookie } from '@/lib/api-client';

export default function CodPage() {
  const t = useTranslations();
  const [summary, setSummary] = useState<any>(null);
  const [discrepancies, setDiscrepancies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const token = getTokenFromCookie();
        const [daily, discs] = await Promise.all([
          apiFetch('/cod/daily', { token: token! }),
          apiFetch('/cod/discrepancies', { token: token! }),
        ]);
        setSummary(daily);
        setDiscrepancies(Array.isArray(discs) ? discs : []);
      } catch (e) { console.error(e); }
      setLoading(false);
    };
    load();
  }, []);

  if (loading) return <p className="text-gray-400 text-center py-8">Loading...</p>;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">{t('app.cod')}</h1>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <StatsCard title="Shipments Today" value={summary?.totals?.shipmentCount || 0} />
        <StatsCard title="Expected COD" value={`${(summary?.totals?.expectedTotal || 0).toLocaleString('vi-VN')}₫`} />
        <StatsCard title="Collected COD" value={`${(summary?.totals?.collectedTotal || 0).toLocaleString('vi-VN')}₫`} />
        <StatsCard title="Discrepancies" value={discrepancies.length} />
      </div>

      {summary?.drivers?.length > 0 && (
        <div className="bg-white rounded-lg shadow overflow-hidden mb-6">
          <div className="px-4 py-3 border-b"><h3 className="font-semibold">COD by Driver — {summary.date}</h3></div>
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left">Driver</th>
                <th className="px-4 py-2 text-right">Shipments</th>
                <th className="px-4 py-2 text-right">Expected</th>
                <th className="px-4 py-2 text-right">Collected</th>
                <th className="px-4 py-2 text-right">COD Fee</th>
                <th className="px-4 py-2 text-right">Net Transfer</th>
                <th className="px-4 py-2 text-right">Issues</th>
              </tr>
            </thead>
            <tbody>
              {summary.drivers.map((d: any) => (
                <tr key={d.driverId} className="border-t">
                  <td className="px-4 py-2 font-mono text-xs">{d.driverId.slice(0, 8)}...</td>
                  <td className="px-4 py-2 text-right">{d.shipmentCount}</td>
                  <td className="px-4 py-2 text-right">{d.expectedTotal.toLocaleString('vi-VN')}₫</td>
                  <td className="px-4 py-2 text-right">{d.collectedTotal.toLocaleString('vi-VN')}₫</td>
                  <td className="px-4 py-2 text-right">{d.codFeeTotal.toLocaleString('vi-VN')}₫</td>
                  <td className="px-4 py-2 text-right font-medium">{d.netTransferTotal.toLocaleString('vi-VN')}₫</td>
                  <td className="px-4 py-2 text-right">{d.discrepancies > 0 ? <span className="text-red-600">{d.discrepancies}</span> : '0'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {discrepancies.length > 0 && (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-4 py-3 border-b"><h3 className="font-semibold text-red-600">Discrepancies</h3></div>
          <div className="divide-y">
            {discrepancies.map((d: any) => (
              <div key={d.id} className="px-4 py-3 text-sm">
                <p className="font-medium">Shipment: {d.shipmentId?.slice(0, 8)}...</p>
                <p className="text-gray-500">{d.discrepancyNote}</p>
                <p className="text-xs text-gray-400">{new Date(d.createdAt).toLocaleString('vi-VN')}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
