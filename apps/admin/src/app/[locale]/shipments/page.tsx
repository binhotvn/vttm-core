'use client';

import { useEffect, useState, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter, usePathname } from 'next/navigation';
import {
  Truck, AlertTriangle, CheckCircle, Package,
  Search, X, Eye, Copy, MoreHorizontal, Phone, MapPin,
} from 'lucide-react';
import { DataTable } from '@/components/data/data-table';
import { StatusBadge } from '@/components/data/status-badge';
import { StatsCard } from '@/components/data/stats-card';
import { PageContainer } from '@/components/layout/page-container';
import { apiFetch, getTokenFromCookie } from '@/lib/api-client';
import { cn } from '@/lib/utils';

const SHIPMENT_STATUSES = [
  '', 'LABEL_CREATED', 'PICKED_UP', 'IN_TRANSIT', 'AT_DESTINATION_HUB',
  'OUT_FOR_DELIVERY', 'DELIVERED', 'DELIVERY_ATTEMPTED', 'EXCEPTION', 'RETURNED_TO_SENDER',
];

function formatVND(amount: number): string {
  return new Intl.NumberFormat('vi-VN').format(amount) + '₫';
}

export default function ShipmentsPage() {
  const t = useTranslations();
  const router = useRouter();
  const pathname = usePathname();
  const locale = pathname.split('/')[1];

  const [data, setData] = useState<any[]>([]);
  const [meta, setMeta] = useState({ total: 0, page: 1, limit: 20, totalPages: 0 });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const fetchShipments = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const token = getTokenFromCookie();
      const params = new URLSearchParams({ page: String(page), limit: String(meta.limit) });
      if (activeTab) params.set('status', activeTab);
      if (searchQuery) params.set('search', searchQuery);
      const result = await apiFetch(`/shipments?${params}`, { token: token! });
      setData(result.data || result);
      if (result.meta) setMeta(result.meta);
    } catch (e) { console.error(e); }
    setLoading(false);
  }, [activeTab, searchQuery, meta.limit]);

  useEffect(() => {
    const timer = setTimeout(() => fetchShipments(), searchQuery ? 300 : 0);
    return () => clearTimeout(timer);
  }, [fetchShipments]);

  const statusTabs = [
    { key: '', label: t('status.all'), count: meta.total },
    { key: 'PICKED_UP', label: t('status.PICKED_UP') },
    { key: 'IN_TRANSIT', label: t('status.IN_TRANSIT') },
    { key: 'OUT_FOR_DELIVERY', label: t('status.OUT_FOR_DELIVERY') },
    { key: 'DELIVERED', label: t('status.DELIVERED') },
    { key: 'EXCEPTION', label: t('status.EXCEPTION') },
    { key: 'RETURNED_TO_SENDER', label: t('status.RETURNED_TO_SENDER') },
  ];

  const columns = [
    {
      key: 'trackingNumber',
      header: t('shipments.trackingNumber'),
      width: '200px',
      render: (item: any) => (
        <div>
          <button
            onClick={() => router.push(`/${locale}/shipments/${item.id}`)}
            className="text-sm font-semibold font-mono text-blue-600 hover:text-blue-800 hover:underline transition-colors"
          >
            {item.trackingNumber}
          </button>
          {item.orderNumber && (
            <p className="text-xs text-gray-400 mt-0.5">{item.orderNumber}</p>
          )}
        </div>
      ),
    },
    {
      key: 'recipient',
      header: t('orders.recipient'),
      width: '200px',
      render: (item: any) => {
        const addr = item.recipientAddress || {};
        return (
          <div>
            <p className="text-sm font-medium text-gray-900">{addr.contactName || '—'}</p>
            {addr.phone && (
              <p className="flex items-center gap-1 mt-0.5 text-xs text-gray-400">
                <Phone size={10} />
                {addr.phone}
              </p>
            )}
            {(addr.districtName || addr.provinceName) && (
              <p className="flex items-center gap-1 mt-0.5 text-xs text-gray-400 text-truncate max-w-[180px]">
                <MapPin size={10} />
                {[addr.districtName, addr.provinceName].filter(Boolean).join(', ')}
              </p>
            )}
          </div>
        );
      },
    },
    {
      key: 'status',
      header: t('common.status'),
      width: '160px',
      render: (item: any) => <StatusBadge status={item.status} locale={locale} />,
    },
    {
      key: 'serviceType',
      header: t('orders.service'),
      width: '120px',
      render: (item: any) => {
        const serviceKey = item.serviceType as string;
        const label = t(`serviceType.${serviceKey}`, { defaultValue: serviceKey });
        const colors: Record<string, string> = {
          STANDARD: 'bg-gray-100 text-gray-600',
          EXPRESS: 'bg-blue-50 text-blue-700',
          SAME_DAY: 'bg-red-50 text-red-700',
          ECONOMY: 'bg-green-50 text-green-700',
          OVERNIGHT: 'bg-purple-50 text-purple-700',
        };
        return (
          <span className={cn('inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium', colors[serviceKey] || 'bg-gray-100 text-gray-600')}>
            {label}
          </span>
        );
      },
    },
    {
      key: 'weightKg',
      header: t('orders.weight'),
      width: '80px',
      align: 'right' as const,
      render: (item: any) => <span className="text-sm text-gray-600">{item.weightKg}kg</span>,
    },
    {
      key: 'codAmount',
      header: t('orders.cod'),
      width: '120px',
      align: 'right' as const,
      render: (item: any) => {
        const amount = Number(item.codAmount);
        return amount > 0
          ? <span className="text-sm font-semibold text-orange-600">{formatVND(amount)}</span>
          : <span className="text-sm text-gray-300">—</span>;
      },
    },
    {
      key: 'createdAt',
      header: t('orders.createdAt'),
      width: '120px',
      render: (item: any) => {
        const d = new Date(item.createdAt);
        return (
          <div>
            <p className="text-sm text-gray-900">{d.toLocaleDateString('vi-VN')}</p>
            <p className="text-xs text-gray-400">{d.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}</p>
          </div>
        );
      },
    },
    {
      key: 'actions',
      header: '',
      width: '50px',
      render: (item: any) => <ShipmentRowActions item={item} locale={locale} router={router} t={t} />,
    },
  ];

  return (
    <PageContainer
      title={t('shipments.title')}
      description={t('shipments.description')}
    >
      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatsCard
          title={t('shipments.totalShipments')}
          value={meta.total || 0}
          icon={<Package size={20} />}
          accentColor="blue"
        />
        <StatsCard
          title={t('shipments.inTransit')}
          value={0}
          icon={<Truck size={20} />}
          accentColor="cyan"
          onClick={() => setActiveTab('IN_TRANSIT')}
        />
        <StatsCard
          title={t('shipments.deliveryFailed')}
          value={0}
          icon={<AlertTriangle size={20} />}
          accentColor="red"
          onClick={() => setActiveTab('DELIVERY_ATTEMPTED')}
        />
        <StatsCard
          title={t('shipments.deliveredToday')}
          value={0}
          icon={<CheckCircle size={20} />}
          accentColor="green"
          onClick={() => setActiveTab('DELIVERED')}
        />
      </div>

      {/* Filter Bar */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-3 mb-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 flex-1 min-w-[200px] max-w-[360px] px-3 py-2 rounded-lg border border-gray-200 bg-gray-50 focus-within:bg-white focus-within:border-blue-300 focus-within:ring-2 focus-within:ring-blue-100 transition-all">
            <Search size={16} className="text-gray-400 shrink-0" />
            <input
              type="text"
              placeholder={t('filters.searchPlaceholder')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 bg-transparent text-sm outline-none placeholder:text-gray-400"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} className="text-gray-400 hover:text-gray-600">
                <X size={14} />
              </button>
            )}
          </div>

          <select
            value={activeTab}
            onChange={(e) => setActiveTab(e.target.value)}
            className="px-3 py-2 rounded-lg border border-gray-200 bg-white text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-300"
          >
            <option value="">{t('filters.status')}: {t('status.all')}</option>
            {SHIPMENT_STATUSES.filter(Boolean).map((s) => (
              <option key={s} value={s}>{t(`status.${s}`)}</option>
            ))}
          </select>

          {(activeTab || searchQuery) && (
            <button
              onClick={() => { setActiveTab(''); setSearchQuery(''); }}
              className="text-sm text-blue-600 hover:text-blue-800 font-medium transition-colors"
            >
              {t('filters.clearAll')}
            </button>
          )}
        </div>
      </div>

      {/* Status Tabs */}
      <div className="flex gap-1 mb-4 overflow-x-auto pb-1">
        {statusTabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={cn(
              'flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors',
              activeTab === tab.key
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
            )}
          >
            {tab.label}
            {tab.count != null && (
              <span className={cn(
                'min-w-[20px] h-5 flex items-center justify-center rounded-full text-[11px] font-semibold px-1.5',
                activeTab === tab.key ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-500'
              )}>
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Table */}
      <DataTable
        columns={columns}
        data={data}
        total={meta.total}
        page={meta.page}
        limit={meta.limit}
        loading={loading}
        selectable
        onPageChange={(p) => fetchShipments(p)}
        onLimitChange={(l) => setMeta((m) => ({ ...m, limit: l }))}
        onRefresh={() => fetchShipments(meta.page)}
        onRowClick={(item) => router.push(`/${locale}/shipments/${item.id}`)}
      />
    </PageContainer>
  );
}

function ShipmentRowActions({ item, locale, router, t }: { item: any; locale: string; router: any; t: any }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={(e) => { e.stopPropagation(); setOpen(!open); }}
        className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
      >
        <MoreHorizontal size={16} />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="dropdown-menu absolute right-0 top-full mt-1 w-48 py-1 z-50">
            <button
              onClick={() => { router.push(`/${locale}/shipments/${item.id}`); setOpen(false); }}
              className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <Eye size={14} className="text-gray-400" />
              {t('orders.viewDetail')}
            </button>
            <button
              onClick={() => { navigator.clipboard.writeText(item.trackingNumber); setOpen(false); }}
              className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <Copy size={14} className="text-gray-400" />
              {t('orders.copyTracking')}
            </button>
          </div>
        </>
      )}
    </div>
  );
}
