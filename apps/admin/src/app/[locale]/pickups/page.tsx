'use client';

import { useEffect, useState, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { usePathname } from 'next/navigation';
import {
  Package, Clock, Truck, CheckCircle,
  Search, X, Phone, Calendar, MapPin,
} from 'lucide-react';
import { DataTable } from '@/components/data/data-table';
import { StatusBadge } from '@/components/data/status-badge';
import { StatsCard } from '@/components/data/stats-card';
import { PageContainer } from '@/components/layout/page-container';
import { apiFetch, getTokenFromCookie } from '@/lib/api-client';
import { cn } from '@/lib/utils';

const PICKUP_STATUSES = ['', 'REQUESTED', 'DRIVER_ASSIGNED', 'PICKED_UP', 'FAILED'];

export default function PickupsPage() {
  const t = useTranslations();
  const pathname = usePathname();
  const locale = pathname.split('/')[1];
  const [data, setData] = useState<any[]>([]);
  const [meta, setMeta] = useState({ total: 0, page: 1, limit: 20, totalPages: 0 });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const fetchPickups = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const token = getTokenFromCookie();
      const params = new URLSearchParams({ page: String(page), limit: '20' });
      if (activeTab) params.set('status', activeTab);
      if (searchQuery) params.set('search', searchQuery);
      const result = await apiFetch(`/pickups?${params}`, { token: token! });
      setData(result.data || result);
      if (result.meta) setMeta(result.meta);
    } catch (e) { console.error(e); }
    setLoading(false);
  }, [activeTab, searchQuery]);

  useEffect(() => {
    const timer = setTimeout(() => fetchPickups(), searchQuery ? 300 : 0);
    return () => clearTimeout(timer);
  }, [fetchPickups]);

  const statusTabs = [
    { key: '', label: locale === 'vi' ? 'Tất cả' : 'All', count: meta.total },
    { key: 'REQUESTED', label: locale === 'vi' ? 'Yêu cầu' : 'Requested' },
    { key: 'DRIVER_ASSIGNED', label: locale === 'vi' ? 'Đã phân tài xế' : 'Assigned' },
    { key: 'PICKED_UP', label: locale === 'vi' ? 'Đã lấy' : 'Picked Up' },
    { key: 'FAILED', label: locale === 'vi' ? 'Thất bại' : 'Failed' },
  ];

  const columns = [
    {
      key: 'pickupNumber',
      header: locale === 'vi' ? 'Mã lấy hàng' : 'Pickup #',
      width: '180px',
      render: (item: any) => (
        <span className="text-sm font-semibold font-mono text-blue-600">{item.pickupNumber}</span>
      ),
    },
    {
      key: 'status',
      header: t('common.status'),
      width: '150px',
      render: (item: any) => <StatusBadge status={item.status} locale={locale} />,
    },
    {
      key: 'contact',
      header: locale === 'vi' ? 'Liên hệ' : 'Contact',
      width: '200px',
      render: (item: any) => {
        const info = item.contactInfo || {};
        return (
          <div>
            <p className="text-sm font-medium text-gray-900">{info.name || '—'}</p>
            {info.phone && (
              <p className="flex items-center gap-1 mt-0.5 text-xs text-gray-400">
                <Phone size={10} />
                {info.phone}
              </p>
            )}
          </div>
        );
      },
    },
    {
      key: 'timeSlot',
      header: locale === 'vi' ? 'Khung giờ' : 'Time Slot',
      width: '140px',
      render: (item: any) => item.timeSlot?.label
        ? <span className="inline-flex items-center gap-1 text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full"><Clock size={10} />{item.timeSlot.label}</span>
        : <span className="text-gray-300">—</span>,
    },
    {
      key: 'estimatedPieceCount',
      header: locale === 'vi' ? 'Số kiện' : 'Pieces',
      width: '90px',
      align: 'right' as const,
      render: (item: any) => <span className="text-sm text-gray-700">{item.estimatedPieceCount || 0}</span>,
    },
    {
      key: 'requestedDate',
      header: locale === 'vi' ? 'Ngày lấy' : 'Date',
      width: '120px',
      render: (item: any) => {
        const d = new Date(item.requestedDate);
        return (
          <div>
            <p className="text-sm text-gray-900">{d.toLocaleDateString('vi-VN')}</p>
          </div>
        );
      },
    },
  ];

  return (
    <PageContainer
      title={t('app.pickups')}
      description={locale === 'vi' ? 'Quản lý lịch lấy hàng' : 'Manage pickup schedules'}
    >
      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatsCard
          title={locale === 'vi' ? 'Lịch hôm nay' : "Today's Schedule"}
          value={meta.total}
          icon={<Calendar size={20} />}
          accentColor="blue"
          loading={loading}
        />
        <StatsCard
          title={locale === 'vi' ? 'Chờ tài xế' : 'Awaiting Driver'}
          value={0}
          icon={<Clock size={20} />}
          accentColor="yellow"
          onClick={() => setActiveTab('REQUESTED')}
          loading={loading}
        />
        <StatsCard
          title={locale === 'vi' ? 'Đang lấy' : 'In Progress'}
          value={0}
          icon={<Truck size={20} />}
          accentColor="cyan"
          onClick={() => setActiveTab('DRIVER_ASSIGNED')}
          loading={loading}
        />
        <StatsCard
          title={locale === 'vi' ? 'Đã hoàn tất' : 'Completed'}
          value={0}
          icon={<CheckCircle size={20} />}
          accentColor="green"
          onClick={() => setActiveTab('PICKED_UP')}
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
              placeholder={locale === 'vi' ? 'Mã lấy hàng, tên, SĐT...' : 'Pickup #, name, phone...'}
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
            {PICKUP_STATUSES.filter(Boolean).map((s) => (
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
        onPageChange={fetchPickups}
        onRefresh={() => fetchPickups(meta.page)}
      />
    </PageContainer>
  );
}
