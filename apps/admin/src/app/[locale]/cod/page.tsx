'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { usePathname } from 'next/navigation';
import {
  Truck, DollarSign, CheckCircle, AlertTriangle,
  User, ArrowRightLeft, Receipt,
} from 'lucide-react';
import { StatsCard } from '@/components/data/stats-card';
import { PageContainer } from '@/components/layout/page-container';
import { apiFetch, getTokenFromCookie } from '@/lib/api-client';
import { cn } from '@/lib/utils';

function formatVND(amount: number): string {
  return new Intl.NumberFormat('vi-VN').format(amount) + '₫';
}

export default function CodPage() {
  const t = useTranslations();
  const pathname = usePathname();
  const locale = pathname.split('/')[1];
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

  const totals = summary?.totals || {};
  const dateLabel = summary?.date
    ? new Date(summary.date).toLocaleDateString(locale === 'vi' ? 'vi-VN' : 'en-US', {
        weekday: 'long', day: '2-digit', month: '2-digit', year: 'numeric',
      })
    : '';

  return (
    <PageContainer
      title={t('app.cod')}
      description={locale === 'vi' ? 'Quản lý đối soát tiền thu hộ (COD) theo ngày' : 'Manage daily COD reconciliation'}
    >
      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatsCard
          title={locale === 'vi' ? 'Vận đơn hôm nay' : 'Shipments Today'}
          value={totals.shipmentCount || 0}
          icon={<Truck size={20} />}
          accentColor="blue"
          loading={loading}
        />
        <StatsCard
          title={locale === 'vi' ? 'COD kỳ vọng' : 'Expected COD'}
          value={formatVND(totals.expectedTotal || 0)}
          icon={<Receipt size={20} />}
          accentColor="yellow"
          loading={loading}
        />
        <StatsCard
          title={locale === 'vi' ? 'COD đã thu' : 'Collected COD'}
          value={formatVND(totals.collectedTotal || 0)}
          icon={<CheckCircle size={20} />}
          accentColor="green"
          loading={loading}
        />
        <StatsCard
          title={locale === 'vi' ? 'Chênh lệch' : 'Discrepancies'}
          value={discrepancies.length}
          icon={<AlertTriangle size={20} />}
          accentColor={discrepancies.length > 0 ? 'red' : 'green'}
          loading={loading}
        />
      </div>

      {/* COD by Driver table */}
      {!loading && summary?.drivers?.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mb-6">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
                <ArrowRightLeft size={16} className="text-blue-600" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-gray-800">
                  {locale === 'vi' ? 'COD theo tài xế' : 'COD by Driver'}
                </h3>
                <p className="text-xs text-gray-400 capitalize">{dateLabel}</p>
              </div>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gray-50/80">
                <tr>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    {locale === 'vi' ? 'Tài xế' : 'Driver'}
                  </th>
                  <th className="px-5 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    {locale === 'vi' ? 'Vận đơn' : 'Shipments'}
                  </th>
                  <th className="px-5 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    {locale === 'vi' ? 'Kỳ vọng' : 'Expected'}
                  </th>
                  <th className="px-5 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    {locale === 'vi' ? 'Đã thu' : 'Collected'}
                  </th>
                  <th className="px-5 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    {locale === 'vi' ? 'Phí COD' : 'COD Fee'}
                  </th>
                  <th className="px-5 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    {locale === 'vi' ? 'Chuyển ròng' : 'Net Transfer'}
                  </th>
                  <th className="px-5 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    {locale === 'vi' ? 'Sự cố' : 'Issues'}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {summary.drivers.map((d: any) => (
                  <tr key={d.driverId} className="table-row-hover">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center">
                          <User size={14} className="text-gray-500" />
                        </div>
                        <span className="text-sm font-medium text-gray-800 font-mono">
                          {d.driverName || d.driverId.slice(0, 8) + '...'}
                        </span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <span className="text-sm text-gray-700">{d.shipmentCount}</span>
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <span className="text-sm text-gray-700">{formatVND(d.expectedTotal)}</span>
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <span className={cn(
                        'text-sm font-medium',
                        d.collectedTotal === d.expectedTotal ? 'text-green-600' : 'text-orange-600'
                      )}>
                        {formatVND(d.collectedTotal)}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <span className="text-sm text-gray-500">{formatVND(d.codFeeTotal)}</span>
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <span className="text-sm font-bold text-gray-900">{formatVND(d.netTransferTotal)}</span>
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      {d.discrepancies > 0 ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-red-50 text-red-700">
                          <AlertTriangle size={11} />
                          {d.discrepancies}
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-50 text-green-600">
                          0
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
              {/* Totals row */}
              <tfoot>
                <tr className="bg-gray-50 border-t-2 border-gray-200">
                  <td className="px-5 py-3.5 text-sm font-bold text-gray-800">
                    {locale === 'vi' ? 'Tổng cộng' : 'Total'}
                  </td>
                  <td className="px-5 py-3.5 text-right text-sm font-bold text-gray-800">
                    {totals.shipmentCount}
                  </td>
                  <td className="px-5 py-3.5 text-right text-sm font-bold text-gray-800">
                    {formatVND(totals.expectedTotal || 0)}
                  </td>
                  <td className="px-5 py-3.5 text-right text-sm font-bold text-green-600">
                    {formatVND(totals.collectedTotal || 0)}
                  </td>
                  <td className="px-5 py-3.5 text-right text-sm font-bold text-gray-500">
                    {formatVND(totals.codFeeTotal || 0)}
                  </td>
                  <td className="px-5 py-3.5 text-right text-sm font-bold text-gray-900">
                    {formatVND(totals.netTransferTotal || 0)}
                  </td>
                  <td className="px-5 py-3.5 text-right text-sm font-bold">
                    {(totals.discrepancyCount || 0) > 0 ? (
                      <span className="text-red-600">{totals.discrepancyCount}</span>
                    ) : (
                      <span className="text-green-600">0</span>
                    )}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      )}

      {/* Empty state when no drivers */}
      {!loading && (!summary?.drivers || summary.drivers.length === 0) && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center mb-6">
          <DollarSign size={40} className="mx-auto mb-3 text-gray-300" />
          <h3 className="text-base font-semibold text-gray-700 mb-1">
            {locale === 'vi' ? 'Chưa có dữ liệu COD hôm nay' : 'No COD data today'}
          </h3>
          <p className="text-sm text-gray-400">
            {locale === 'vi' ? 'Dữ liệu sẽ hiển thị khi có vận đơn COD được giao.' : 'Data will appear when COD shipments are delivered.'}
          </p>
        </div>
      )}

      {/* Discrepancies */}
      {!loading && discrepancies.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="flex items-center gap-2 px-5 py-4 border-b border-gray-100">
            <div className="w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center">
              <AlertTriangle size={16} className="text-red-600" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-red-700">
                {locale === 'vi' ? 'Chênh lệch cần xử lý' : 'Discrepancies'}
              </h3>
              <p className="text-xs text-gray-400">{discrepancies.length} {locale === 'vi' ? 'mục' : 'items'}</p>
            </div>
          </div>
          <div className="divide-y divide-gray-50">
            {discrepancies.map((d: any) => (
              <div key={d.id} className="px-5 py-4 table-row-hover">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-800">
                      {locale === 'vi' ? 'Vận đơn' : 'Shipment'}: <span className="font-mono text-blue-600">{d.shipmentId?.slice(0, 8)}...</span>
                    </p>
                    <p className="text-sm text-gray-500 mt-0.5">{d.discrepancyNote}</p>
                  </div>
                  <span className="text-xs text-gray-400 whitespace-nowrap ml-4">
                    {new Date(d.createdAt).toLocaleString(locale === 'vi' ? 'vi-VN' : 'en-US', {
                      day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit',
                    })}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Loading skeleton */}
      {loading && (
        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
            <div className="skeleton h-5 w-48 mb-4" />
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-4 mb-3">
                <div className="skeleton w-7 h-7 rounded-full" />
                <div className="skeleton h-4 flex-1" />
                <div className="skeleton h-4 w-24" />
                <div className="skeleton h-4 w-24" />
                <div className="skeleton h-4 w-20" />
              </div>
            ))}
          </div>
        </div>
      )}
    </PageContainer>
  );
}
