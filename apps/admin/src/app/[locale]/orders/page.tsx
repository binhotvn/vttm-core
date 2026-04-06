'use client';

import { useEffect, useState, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter, usePathname } from 'next/navigation';
import {
  ShoppingCart, Clock, Truck, CheckCircle, Plus, Upload, Copy,
  ChevronDown, Search, X, Eye, Printer, XCircle, MoreHorizontal,
  Phone, MapPin,
} from 'lucide-react';
import { DataTable } from '@/components/data/data-table';
import { StatusBadge } from '@/components/data/status-badge';
import { StatsCard } from '@/components/data/stats-card';
import { PageContainer } from '@/components/layout/page-container';
import { apiFetch, getTokenFromCookie } from '@/lib/api-client';
import { cn } from '@/lib/utils';

const ORDER_STATUSES = ['', 'DRAFT', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'RETURNED'];
const SERVICE_TYPES = ['', 'STANDARD', 'EXPRESS', 'SAME_DAY', 'ECONOMY', 'OVERNIGHT'];

function formatVND(amount: number): string {
  return new Intl.NumberFormat('vi-VN').format(amount) + '₫';
}

function formatPhone(phone: string): string {
  if (!phone) return '';
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.length === 10) return `${cleaned.slice(0, 4)} ${cleaned.slice(4, 7)} ${cleaned.slice(7)}`;
  return phone;
}

export default function OrdersPage() {
  const t = useTranslations();
  const router = useRouter();
  const pathname = usePathname();
  const locale = pathname.split('/')[1];

  // State
  const [data, setData] = useState<any[]>([]);
  const [meta, setMeta] = useState({ total: 0, page: 1, limit: 20, totalPages: 0 });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [serviceFilter, setServiceFilter] = useState('');
  const [createMenuOpen, setCreateMenuOpen] = useState(false);

  const fetchOrders = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const token = getTokenFromCookie();
      if (!token) {
        router.push(`/${locale}/login`);
        return;
      }
      const params = new URLSearchParams({ page: String(page), limit: String(meta.limit) });
      if (activeTab) params.set('status', activeTab);
      if (searchQuery) params.set('search', searchQuery);
      if (serviceFilter) params.set('serviceType', serviceFilter);
      const result = await apiFetch(`/orders?${params}`, { token });
      setData(result.data || result);
      if (result.meta) setMeta(result.meta);
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  }, [activeTab, searchQuery, serviceFilter, meta.limit, locale, router]);

  useEffect(() => {
    const timer = setTimeout(() => fetchOrders(), searchQuery ? 300 : 0);
    return () => clearTimeout(timer);
  }, [fetchOrders]);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  // Status tab counts (would come from API in real app)
  const statusTabs = [
    { key: '', label: t('status.all'), count: meta.total },
    { key: 'DRAFT', label: t('status.DRAFT') },
    { key: 'CONFIRMED', label: t('status.CONFIRMED') },
    { key: 'PROCESSING', label: t('status.PROCESSING') },
    { key: 'SHIPPED', label: t('status.SHIPPED') },
    { key: 'DELIVERED', label: t('status.DELIVERED') },
    { key: 'CANCELLED', label: t('status.CANCELLED') },
    { key: 'RETURNED', label: t('status.RETURNED') },
  ];

  // Table columns — compound cells
  const columns = [
    {
      key: 'orderNumber',
      header: t('orders.orderNumber'),
      width: '200px',
      render: (item: any) => (
        <div>
          <button
            onClick={() => router.push(`/${locale}/orders/${item.id}`)}
            className="text-sm font-semibold text-blue-600 hover:text-blue-800 hover:underline transition-colors"
          >
            {item.orderNumber}
          </button>
          {item.trackingNumber && (
            <div className="flex items-center gap-1 mt-0.5">
              <span className="text-xs text-gray-400 font-mono">{item.trackingNumber}</span>
              <button
                onClick={() => copyToClipboard(item.trackingNumber)}
                className="p-0.5 rounded text-gray-300 hover:text-gray-500 transition-colors"
                title={t('orders.copyTracking')}
              >
                <Copy size={11} />
              </button>
            </div>
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
                {formatPhone(addr.phone)}
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
      width: '150px',
      render: (item: any) => <StatusBadge status={item.status} locale={locale} />,
    },
    {
      key: 'codAmount',
      header: t('orders.cod'),
      width: '130px',
      align: 'right' as const,
      render: (item: any) => {
        const amount = Number(item.codAmount);
        return (
          <div>
            {amount > 0 ? (
              <span className="text-sm font-semibold text-red-600">{formatVND(amount)}</span>
            ) : (
              <span className="text-sm text-gray-300">—</span>
            )}
            <p className="text-xs text-gray-400 mt-0.5">
              {item.paymentMethod === 'COD' ? t('orders.collect') :
               item.paymentMethod === 'PREPAID' ? t('orders.prepaid') : t('orders.postpaid')}
            </p>
          </div>
        );
      },
    },
    {
      key: 'shippingFee',
      header: t('orders.shippingFee'),
      width: '110px',
      align: 'right' as const,
      render: (item: any) => (
        <span className="text-sm font-medium text-gray-700">
          {formatVND(Number(item.shippingFee || 0))}
        </span>
      ),
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
      render: (item: any) => <RowActions item={item} locale={locale} router={router} t={t} />,
    },
  ];

  const bulkActions = [
    {
      key: 'print',
      label: t('table.printLabels'),
      icon: <Printer size={14} />,
      onClick: (ids: string[]) => console.log('Print labels:', ids),
    },
    {
      key: 'export',
      label: t('table.exportExcel'),
      icon: <Upload size={14} />,
      onClick: (ids: string[]) => console.log('Export:', ids),
    },
    {
      key: 'cancel',
      label: t('table.cancelSelected'),
      icon: <XCircle size={14} />,
      danger: true,
      onClick: (ids: string[]) => console.log('Cancel:', ids),
    },
  ];

  return (
    <PageContainer
      title={t('orders.title')}
      description={t('orders.description')}
      actions={
        <div className="flex items-center gap-2">
          <button
            onClick={() => router.push(`/${locale}/orders/import`)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-gray-200 text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
          >
            <Upload size={16} />
            {t('orders.importExcel')}
          </button>
          <div className="relative">
            <button
              onClick={() => setCreateMenuOpen(!createMenuOpen)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-blue-600 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
            >
              <Plus size={16} />
              {t('orders.create')}
              <ChevronDown size={14} className={cn('transition-transform', createMenuOpen && 'rotate-180')} />
            </button>
            {createMenuOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setCreateMenuOpen(false)} />
                <div className="dropdown-menu absolute right-0 top-full mt-1 w-52 py-1 z-50">
                  <button
                    onClick={() => { setCreateMenuOpen(false); router.push(`/${locale}/orders/create`); }}
                    className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    <Plus size={14} className="text-gray-400" />
                    {t('orders.createSingle')}
                  </button>
                  <button
                    onClick={() => { setCreateMenuOpen(false); router.push(`/${locale}/orders/import`); }}
                    className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    <Upload size={14} className="text-gray-400" />
                    {t('orders.importExcel')}
                  </button>
                  <button
                    onClick={() => { setCreateMenuOpen(false); router.push(`/${locale}/orders/create?from=existing`); }}
                    className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    <Copy size={14} className="text-gray-400" />
                    {t('orders.createFromOld')}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      }
    >
      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatsCard
          title={t('orders.totalThisMonth')}
          value={meta.total || 0}
          icon={<ShoppingCart size={20} />}
          accentColor="blue"
          trend={{ value: 12, label: '' }}
          subtitle={t('orders.comparedLastMonth')}
        />
        <StatsCard
          title={t('orders.pending')}
          value={0}
          icon={<Clock size={20} />}
          accentColor="yellow"
          onClick={() => setActiveTab('CONFIRMED')}
        />
        <StatsCard
          title={t('orders.shipping')}
          value={0}
          icon={<Truck size={20} />}
          accentColor="blue"
          onClick={() => setActiveTab('SHIPPED')}
        />
        <StatsCard
          title={t('orders.deliveredToday')}
          value={0}
          icon={<CheckCircle size={20} />}
          accentColor="green"
          onClick={() => setActiveTab('DELIVERED')}
        />
      </div>

      {/* Filter Bar */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-3 mb-4">
        <div className="flex flex-wrap items-center gap-3">
          {/* Search */}
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

          {/* Status filter */}
          <select
            value={activeTab}
            onChange={(e) => setActiveTab(e.target.value)}
            className="px-3 py-2 rounded-lg border border-gray-200 bg-white text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-300"
          >
            <option value="">{t('filters.status')}: {t('status.all')}</option>
            {ORDER_STATUSES.filter(Boolean).map((s) => (
              <option key={s} value={s}>{t(`status.${s}`)}</option>
            ))}
          </select>

          {/* Service filter */}
          <select
            value={serviceFilter}
            onChange={(e) => setServiceFilter(e.target.value)}
            className="px-3 py-2 rounded-lg border border-gray-200 bg-white text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-300"
          >
            <option value="">{t('filters.service')}: {t('status.all')}</option>
            {SERVICE_TYPES.filter(Boolean).map((s) => (
              <option key={s} value={s}>{t(`serviceType.${s}`)}</option>
            ))}
          </select>

          {/* Clear filters */}
          {(activeTab || searchQuery || serviceFilter) && (
            <button
              onClick={() => { setActiveTab(''); setSearchQuery(''); setServiceFilter(''); }}
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
                activeTab === tab.key
                  ? 'bg-white/20 text-white'
                  : 'bg-gray-100 text-gray-500'
              )}>
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Data Table */}
      <DataTable
        columns={columns}
        data={data}
        total={meta.total}
        page={meta.page}
        limit={meta.limit}
        loading={loading}
        selectable
        bulkActions={bulkActions}
        onPageChange={(p) => fetchOrders(p)}
        onLimitChange={(l) => setMeta((m) => ({ ...m, limit: l }))}
        onRefresh={() => fetchOrders(meta.page)}
        onRowClick={(item) => router.push(`/${locale}/orders/${item.id}`)}
        showingLabel={t('orders.showing')}
        ofLabel={t('orders.of')}
        unitLabel={t('orders.orderUnit')}
        emptyContent={
          <div className="py-8 text-center">
            <div className="text-5xl mb-4">📦</div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">{t('orders.noOrders')}</h3>
            <p className="text-sm text-gray-500 max-w-md mx-auto mb-6">{t('orders.noOrdersDesc')}</p>
            <div className="flex items-center justify-center gap-3">
              <button
                onClick={() => router.push(`/${locale}/orders/create`)}
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-blue-600 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
              >
                <Plus size={16} />
                {t('orders.create')}
              </button>
              <button
                onClick={() => router.push(`/${locale}/orders/import`)}
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg border border-gray-200 text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
              >
                <Upload size={16} />
                {t('orders.importExcel')}
              </button>
            </div>
          </div>
        }
      />
    </PageContainer>
  );
}

// Row actions dropdown component
function RowActions({ item, locale, router, t }: { item: any; locale: string; router: any; t: any }) {
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
              onClick={() => { router.push(`/${locale}/orders/${item.id}`); setOpen(false); }}
              className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <Eye size={14} className="text-gray-400" />
              {t('orders.viewDetail')}
            </button>
            <button
              onClick={() => setOpen(false)}
              className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <Search size={14} className="text-gray-400" />
              {t('orders.track')}
            </button>
            <button
              onClick={() => setOpen(false)}
              className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <Printer size={14} className="text-gray-400" />
              {t('orders.printLabel')}
            </button>
            {item.trackingNumber && (
              <button
                onClick={() => { navigator.clipboard.writeText(item.trackingNumber); setOpen(false); }}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <Copy size={14} className="text-gray-400" />
                {t('orders.copyTracking')}
              </button>
            )}
            <div className="my-1 border-t border-gray-100" />
            <button
              onClick={() => setOpen(false)}
              className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
            >
              <XCircle size={14} />
              {t('orders.cancelOrder')}
            </button>
          </div>
        </>
      )}
    </div>
  );
}
