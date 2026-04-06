'use client';

import { useEffect, useState, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { usePathname } from 'next/navigation';
import {
  Package, Lock, CheckCircle, Layers,
  Plus, Search, X, Hash, Shield,
} from 'lucide-react';
import { DataTable } from '@/components/data/data-table';
import { StatusBadge } from '@/components/data/status-badge';
import { StatsCard } from '@/components/data/stats-card';
import { PageContainer } from '@/components/layout/page-container';
import { apiFetch, getTokenFromCookie } from '@/lib/api-client';
import { cn } from '@/lib/utils';

function formatVND(amount: number): string {
  return new Intl.NumberFormat('vi-VN').format(amount) + '₫';
}

const BATCH_STATUSES = ['', 'OPEN', 'LOCKED', 'SEALED', 'COMPLETED'];

export default function BatchesPage() {
  const t = useTranslations();
  const pathname = usePathname();
  const locale = pathname.split('/')[1];
  const [data, setData] = useState<any[]>([]);
  const [meta, setMeta] = useState({ total: 0, page: 1, limit: 20, totalPages: 0 });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const fetchBatches = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const token = getTokenFromCookie();
      const params = new URLSearchParams({ page: String(page), limit: '20' });
      if (activeTab) params.set('status', activeTab);
      if (searchQuery) params.set('search', searchQuery);
      const result = await apiFetch(`/batches?${params}`, { token: token! });
      setData(result.data || result);
      if (result.meta) setMeta(result.meta);
    } catch (e) { console.error(e); }
    setLoading(false);
  }, [activeTab, searchQuery]);

  useEffect(() => {
    const timer = setTimeout(() => fetchBatches(), searchQuery ? 300 : 0);
    return () => clearTimeout(timer);
  }, [fetchBatches]);

  const statusTabs = [
    { key: '', label: locale === 'vi' ? 'Tất cả' : 'All', count: meta.total },
    { key: 'OPEN', label: locale === 'vi' ? 'Mở' : 'Open' },
    { key: 'LOCKED', label: locale === 'vi' ? 'Khóa' : 'Locked' },
    { key: 'SEALED', label: locale === 'vi' ? 'Niêm phong' : 'Sealed' },
    { key: 'COMPLETED', label: locale === 'vi' ? 'Hoàn tất' : 'Completed' },
  ];

  const columns = [
    {
      key: 'batchNumber',
      header: locale === 'vi' ? 'Mã lô' : 'Batch #',
      width: '180px',
      render: (item: any) => (
        <div>
          <span className="text-sm font-semibold font-mono text-blue-600">{item.batchNumber}</span>
          <p className="text-xs text-gray-400 mt-0.5">
            {item.type === 'OUTBOUND' ? (locale === 'vi' ? 'Xuất kho' : 'Outbound') :
             item.type === 'INBOUND' ? (locale === 'vi' ? 'Nhập kho' : 'Inbound') :
             item.type === 'TRANSFER' ? (locale === 'vi' ? 'Chuyển kho' : 'Transfer') : item.type}
          </p>
        </div>
      ),
    },
    {
      key: 'status',
      header: t('common.status'),
      width: '140px',
      render: (item: any) => <StatusBadge status={item.status} locale={locale} />,
    },
    {
      key: 'shipmentCount',
      header: locale === 'vi' ? 'Vận đơn' : 'Shipments',
      width: '100px',
      align: 'right' as const,
      render: (item: any) => <span className="text-sm font-medium text-gray-700">{item.shipmentCount}</span>,
    },
    {
      key: 'totalWeightKg',
      header: locale === 'vi' ? 'Khối lượng' : 'Weight',
      width: '100px',
      align: 'right' as const,
      render: (item: any) => <span className="text-sm text-gray-600">{item.totalWeightKg}kg</span>,
    },
    {
      key: 'totalCodAmount',
      header: 'COD',
      width: '130px',
      align: 'right' as const,
      render: (item: any) => {
        const amount = Number(item.totalCodAmount);
        return amount > 0
          ? <span className="text-sm font-semibold text-orange-600">{formatVND(amount)}</span>
          : <span className="text-sm text-gray-300">—</span>;
      },
    },
    {
      key: 'sealNumber',
      header: locale === 'vi' ? 'Số niêm phong' : 'Seal #',
      width: '140px',
      render: (item: any) => item.sealNumber
        ? <span className="inline-flex items-center gap-1 text-xs font-mono bg-purple-50 text-purple-700 px-2 py-0.5 rounded-full"><Shield size={10} />{item.sealNumber}</span>
        : <span className="text-gray-300">—</span>,
    },
    {
      key: 'createdAt',
      header: locale === 'vi' ? 'Ngày tạo' : 'Created',
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
  ];

  return (
    <PageContainer
      title={t('app.batches')}
      description={locale === 'vi' ? 'Quản lý lô hàng vận chuyển' : 'Manage shipping batches'}
      actions={
        <button className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-blue-600 text-sm font-medium text-white hover:bg-blue-700 transition-colors">
          <Plus size={16} />
          {t('common.create')}
        </button>
      }
    >
      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatsCard
          title={locale === 'vi' ? 'Tổng lô hàng' : 'Total Batches'}
          value={meta.total}
          icon={<Layers size={20} />}
          accentColor="blue"
          loading={loading}
        />
        <StatsCard
          title={locale === 'vi' ? 'Đang mở' : 'Open'}
          value={0}
          icon={<Package size={20} />}
          accentColor="cyan"
          onClick={() => setActiveTab('OPEN')}
          loading={loading}
        />
        <StatsCard
          title={locale === 'vi' ? 'Đã khóa' : 'Locked'}
          value={0}
          icon={<Lock size={20} />}
          accentColor="yellow"
          onClick={() => setActiveTab('LOCKED')}
          loading={loading}
        />
        <StatsCard
          title={locale === 'vi' ? 'Hoàn tất' : 'Completed'}
          value={0}
          icon={<CheckCircle size={20} />}
          accentColor="green"
          onClick={() => setActiveTab('COMPLETED')}
          loading={loading}
        />
      </div>

      {/* Filter Bar */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-3 mb-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 flex-1 min-w-[200px] max-w-[360px] px-3 py-2 rounded-lg border border-gray-200 bg-gray-50 focus-within:bg-white focus-within:border-blue-300 focus-within:ring-2 focus-within:ring-blue-100 transition-all">
            <Search size={16} className="text-gray-400 shrink-0" />
            <input
              type="text"
              placeholder={locale === 'vi' ? 'Mã lô, số niêm phong...' : 'Batch #, seal #...'}
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
            <option value="">{t('common.status')}: {locale === 'vi' ? 'Tất cả' : 'All'}</option>
            {BATCH_STATUSES.filter(Boolean).map((s) => (
              <option key={s} value={s}>{t(`status.${s}`, { defaultValue: s })}</option>
            ))}
          </select>
          {(activeTab || searchQuery) && (
            <button
              onClick={() => { setActiveTab(''); setSearchQuery(''); }}
              className="text-sm text-blue-600 hover:text-blue-800 font-medium transition-colors"
            >
              {locale === 'vi' ? 'Xóa bộ lọc' : 'Clear filters'}
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

      <DataTable
        columns={columns}
        data={data}
        total={meta.total}
        page={meta.page}
        limit={meta.limit}
        loading={loading}
        selectable
        onPageChange={fetchBatches}
        onRefresh={() => fetchBatches(meta.page)}
      />
    </PageContainer>
  );
}
