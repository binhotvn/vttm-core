'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { usePathname, useRouter } from 'next/navigation';
import {
  ShoppingCart, Truck, CheckCircle, AlertTriangle, DollarSign,
  ArrowRight, Search, Clock, Package, TrendingUp,
} from 'lucide-react';
import { StatsCard } from '@/components/data/stats-card';
import { StatusBadge } from '@/components/data/status-badge';
import { apiFetch, getTokenFromCookie } from '@/lib/api-client';
import { cn } from '@/lib/utils';

function formatVND(amount: number): string {
  if (amount >= 1000000) return (amount / 1000000).toFixed(1) + 'tr₫';
  if (amount >= 1000) return (amount / 1000).toFixed(0) + 'K₫';
  return new Intl.NumberFormat('vi-VN').format(amount) + '₫';
}

export default function DashboardPage() {
  const t = useTranslations();
  const pathname = usePathname();
  const router = useRouter();
  const locale = pathname.split('/')[1];
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ total: 0, inTransit: 0, delivered: 0, issues: 0, codPending: 0 });

  useEffect(() => {
    async function load() {
      try {
        const token = getTokenFromCookie();
        if (!token) return;
        const result = await apiFetch('/orders?limit=5&sort=createdAt:desc', { token });
        const orders = result.data || result;
        setRecentOrders(Array.isArray(orders) ? orders : []);
        if (result.meta) {
          setStats((s) => ({ ...s, total: result.meta.total }));
        }
      } catch (e) { console.error(e); }
      setLoading(false);
    }
    load();
  }, []);

  const today = new Date().toLocaleDateString(locale === 'vi' ? 'vi-VN' : 'en-US', {
    weekday: 'long',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });

  return (
    <div className="animate-fade-in">
      {/* Greeting */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-gray-900">
            {t('dashboard.greeting')} 👋
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">VTTM Logistics</p>
        </div>
        <div className="text-sm text-gray-400 text-right">
          <p className="capitalize">{today}</p>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        <StatsCard
          title={t('dashboard.todayOrders')}
          value={stats.total}
          icon={<ShoppingCart size={20} />}
          accentColor="blue"
          onClick={() => router.push(`/${locale}/orders`)}
          loading={loading}
        />
        <StatsCard
          title={t('dashboard.inTransit')}
          value={stats.inTransit}
          icon={<Truck size={20} />}
          accentColor="cyan"
          onClick={() => router.push(`/${locale}/shipments`)}
          loading={loading}
        />
        <StatsCard
          title={t('dashboard.deliveredToday')}
          value={stats.delivered}
          icon={<CheckCircle size={20} />}
          accentColor="green"
          loading={loading}
        />
        <StatsCard
          title={t('dashboard.issues')}
          value={stats.issues}
          icon={<AlertTriangle size={20} />}
          accentColor="red"
          loading={loading}
        />
        <StatsCard
          title={t('dashboard.codPending')}
          value={formatVND(stats.codPending)}
          icon={<DollarSign size={20} />}
          accentColor="yellow"
          onClick={() => router.push(`/${locale}/cod`)}
          loading={loading}
        />
      </div>

      {/* Main content grid */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Left column — 60% */}
        <div className="lg:col-span-3 space-y-6">
          {/* Recent Orders */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <h2 className="text-sm font-semibold text-gray-800">{t('dashboard.recentOrders')}</h2>
              <button
                onClick={() => router.push(`/${locale}/orders`)}
                className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800 font-medium transition-colors"
              >
                {t('dashboard.viewAll')}
                <ArrowRight size={14} />
              </button>
            </div>
            <div className="overflow-x-auto">
              {loading ? (
                <div className="p-5 space-y-4">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="flex items-center gap-4">
                      <div className="skeleton h-4 w-24" />
                      <div className="skeleton h-4 w-32 flex-1" />
                      <div className="skeleton h-6 w-20 rounded-full" />
                      <div className="skeleton h-4 w-20" />
                    </div>
                  ))}
                </div>
              ) : recentOrders.length === 0 ? (
                <div className="p-10 text-center text-gray-400">
                  <Package size={32} className="mx-auto mb-2 text-gray-300" />
                  <p className="text-sm">{t('common.noData')}</p>
                </div>
              ) : (
                <table className="min-w-full">
                  <thead>
                    <tr className="bg-gray-50/50">
                      <th className="px-5 py-2.5 text-left text-xs font-semibold text-gray-500 uppercase">{t('orders.orderNumber')}</th>
                      <th className="px-5 py-2.5 text-left text-xs font-semibold text-gray-500 uppercase">{t('orders.recipient')}</th>
                      <th className="px-5 py-2.5 text-left text-xs font-semibold text-gray-500 uppercase">{t('common.status')}</th>
                      <th className="px-5 py-2.5 text-right text-xs font-semibold text-gray-500 uppercase">{t('orders.cod')}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {recentOrders.map((order) => (
                      <tr
                        key={order.id}
                        className="table-row-hover cursor-pointer"
                        onClick={() => router.push(`/${locale}/orders/${order.id}`)}
                      >
                        <td className="px-5 py-3">
                          <span className="text-sm font-semibold text-blue-600">{order.orderNumber}</span>
                        </td>
                        <td className="px-5 py-3">
                          <span className="text-sm text-gray-700">{order.recipientAddress?.contactName || '—'}</span>
                        </td>
                        <td className="px-5 py-3">
                          <StatusBadge status={order.status} locale={locale} />
                        </td>
                        <td className="px-5 py-3 text-right">
                          {Number(order.codAmount) > 0 ? (
                            <span className="text-sm font-semibold text-red-600">{formatVND(Number(order.codAmount))}</span>
                          ) : (
                            <span className="text-sm text-gray-300">—</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>

          {/* Order Chart placeholder */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
            <h2 className="text-sm font-semibold text-gray-800 mb-4">
              {t('dashboard.orderChart')} — {t('dashboard.last7Days')}
            </h2>
            <div className="h-48 flex items-center justify-center text-gray-300">
              <div className="text-center">
                <TrendingUp size={40} className="mx-auto mb-2" />
                <p className="text-sm">Chart coming soon</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right column — 40% */}
        <div className="lg:col-span-2 space-y-6">
          {/* Activity Feed */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100">
              <h2 className="text-sm font-semibold text-gray-800">{t('dashboard.recentActivity')}</h2>
            </div>
            <div className="p-5">
              {loading ? (
                <div className="space-y-4">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="flex gap-3">
                      <div className="skeleton w-8 h-8 rounded-full shrink-0" />
                      <div className="flex-1">
                        <div className="skeleton h-4 w-full mb-1" />
                        <div className="skeleton h-3 w-20" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-4">
                  {recentOrders.slice(0, 5).map((order, i) => (
                    <div key={order.id} className="flex items-start gap-3">
                      <div className={cn(
                        'w-8 h-8 rounded-full flex items-center justify-center shrink-0',
                        order.status === 'DELIVERED' ? 'bg-green-50 text-green-600' :
                        order.status === 'SHIPPED' ? 'bg-blue-50 text-blue-600' :
                        order.status === 'PROCESSING' ? 'bg-yellow-50 text-yellow-600' :
                        'bg-gray-50 text-gray-400'
                      )}>
                        {order.status === 'DELIVERED' ? <CheckCircle size={16} /> :
                         order.status === 'SHIPPED' ? <Truck size={16} /> :
                         <Clock size={16} />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-gray-700">
                          <span className="font-medium text-blue-600">{order.orderNumber}</span>
                          {' — '}
                          <StatusBadge status={order.status} locale={locale} size="sm" />
                        </p>
                        <p className="text-xs text-gray-400 mt-0.5">
                          {new Date(order.updatedAt || order.createdAt).toLocaleString(locale === 'vi' ? 'vi-VN' : 'en-US', {
                            hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit',
                          })}
                        </p>
                      </div>
                    </div>
                  ))}
                  {recentOrders.length === 0 && (
                    <p className="text-sm text-gray-400 text-center py-4">{t('common.noData')}</p>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Quick Track */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
            <h2 className="text-sm font-semibold text-gray-800 mb-3">{t('dashboard.quickTrack')}</h2>
            <div className="flex items-center gap-2 px-3 py-2.5 rounded-lg border border-gray-200 bg-gray-50 focus-within:bg-white focus-within:border-blue-300 focus-within:ring-2 focus-within:ring-blue-100 transition-all">
              <Search size={16} className="text-gray-400 shrink-0" />
              <input
                type="text"
                placeholder={t('dashboard.quickTrackPlaceholder')}
                className="flex-1 bg-transparent text-sm outline-none placeholder:text-gray-400"
              />
            </div>
          </div>

          {/* COD Summary */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
            <h2 className="text-sm font-semibold text-gray-800 mb-4">{t('dashboard.codSummary')}</h2>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">{t('dashboard.codWaiting')}</span>
                <span className="text-sm font-bold text-orange-600">{formatVND(0)}</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-1.5">
                <div className="bg-orange-500 h-1.5 rounded-full" style={{ width: '0%' }} />
              </div>
              <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                <span className="text-sm text-gray-500">{t('dashboard.codTransferred')}</span>
                <span className="text-sm font-bold text-green-600">{formatVND(0)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
