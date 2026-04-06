'use client';

import { useEffect, useState, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { usePathname } from 'next/navigation';
import {
  RotateCcw, Clock, CheckCircle, AlertTriangle,
  Search, X,
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

const RETURN_REASONS: Record<string, Record<string, string>> = {
  vi: {
    CUSTOMER_REFUSED: 'Khách từ chối',
    WRONG_ADDRESS: 'Sai địa chỉ',
    DAMAGED: 'Hư hỏng',
    NOT_HOME: 'Không có người nhận',
    OTHER: 'Lý do khác',
  },
  en: {
    CUSTOMER_REFUSED: 'Customer Refused',
    WRONG_ADDRESS: 'Wrong Address',
    DAMAGED: 'Damaged',
    NOT_HOME: 'Not Home',
    OTHER: 'Other',
  },
};

export default function ReturnsPage() {
  const t = useTranslations();
  const pathname = usePathname();
  const locale = pathname.split('/')[1];
  const [data, setData] = useState<any[]>([]);
  const [meta, setMeta] = useState({ total: 0, page: 1, limit: 20, totalPages: 0 });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const fetchReturns = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const token = getTokenFromCookie();
      const params = new URLSearchParams({ page: String(page), limit: '20' });
      if (activeTab) params.set('status', activeTab);
      if (searchQuery) params.set('search', searchQuery);
      const result = await apiFetch(`/returns?${params}`, { token: token! });
      setData(result.data || result);
      if (result.meta) setMeta(result.meta);
    } catch (e) { console.error(e); }
    setLoading(false);
  }, [activeTab, searchQuery]);

  useEffect(() => {
    const timer = setTimeout(() => fetchReturns(), searchQuery ? 300 : 0);
    return () => clearTimeout(timer);
  }, [fetchReturns]);

  const statusTabs = [
    { key: '', label: locale === 'vi' ? 'Tất cả' : 'All', count: meta.total },
    { key: 'REQUESTED', label: locale === 'vi' ? 'Chờ duyệt' : 'Pending' },
    { key: 'IN_TRANSIT', label: locale === 'vi' ? 'Đang hoàn' : 'In Transit' },
    { key: 'COMPLETED', label: locale === 'vi' ? 'Đã hoàn xong' : 'Completed' },
  ];

  const columns = [
    {
      key: 'returnNumber',
      header: locale === 'vi' ? 'Mã hoàn' : 'Return #',
      width: '180px',
      render: (item: any) => (
        <span className="text-sm font-semibold font-mono text-blue-600">{item.returnNumber}</span>
      ),
    },
    {
      key: 'status',
      header: t('common.status'),
      width: '140px',
      render: (item: any) => <StatusBadge status={item.status} locale={locale} />,
    },
    {
      key: 'reason',
      header: locale === 'vi' ? 'Lý do' : 'Reason',
      width: '180px',
      render: (item: any) => {
        const reasonLabel = RETURN_REASONS[locale]?.[item.reason] || item.reason?.replace(/_/g, ' ') || '—';
        const reasonColors: Record<string, string> = {
          CUSTOMER_REFUSED: 'bg-orange-50 text-orange-700',
          WRONG_ADDRESS: 'bg-red-50 text-red-700',
          DAMAGED: 'bg-red-50 text-red-700',
          NOT_HOME: 'bg-yellow-50 text-yellow-700',
          OTHER: 'bg-gray-100 text-gray-600',
        };
        return (
          <span className={cn('inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium', reasonColors[item.reason] || 'bg-gray-100 text-gray-600')}>
            {reasonLabel}
          </span>
        );
      },
    },
    {
      key: 'returnFee',
      header: locale === 'vi' ? 'Phí hoàn' : 'Fee',
      width: '120px',
      align: 'right' as const,
      render: (item: any) => {
        const fee = Number(item.returnFee);
        return fee > 0
          ? <span className="text-sm font-medium text-gray-700">{formatVND(fee)}</span>
          : <span className="text-sm text-gray-300">—</span>;
      },
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
      title={t('app.returns')}
      description={locale === 'vi' ? 'Quản lý đơn hoàn hàng' : 'Manage return orders'}
    >
      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        <StatsCard
          title={locale === 'vi' ? 'Chờ duyệt' : 'Pending Approval'}
          value={0}
          icon={<Clock size={20} />}
          accentColor="yellow"
          onClick={() => setActiveTab('REQUESTED')}
          loading={loading}
        />
        <StatsCard
          title={locale === 'vi' ? 'Đang hoàn' : 'In Transit'}
          value={0}
          icon={<RotateCcw size={20} />}
          accentColor="blue"
          onClick={() => setActiveTab('IN_TRANSIT')}
          loading={loading}
        />
        <StatsCard
          title={locale === 'vi' ? 'Đã hoàn xong' : 'Completed'}
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
              placeholder={locale === 'vi' ? 'Mã hoàn, mã vận đơn...' : 'Return #, tracking #...'}
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
        onPageChange={fetchReturns}
        onRefresh={() => fetchReturns(meta.page)}
      />
    </PageContainer>
  );
}
