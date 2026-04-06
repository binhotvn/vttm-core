'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { usePathname } from 'next/navigation';
import {
  Building2, MapPin, Phone, Package, Plus, Search, X,
  Warehouse, ArrowRightLeft, CircleDot,
} from 'lucide-react';
import { StatsCard } from '@/components/data/stats-card';
import { PageContainer } from '@/components/layout/page-container';
import { apiFetch, getTokenFromCookie } from '@/lib/api-client';
import { cn } from '@/lib/utils';

const HUB_TYPE_CONFIG: Record<string, { icon: React.ReactNode; color: string; labelVi: string; labelEn: string }> = {
  SORTING_CENTER:      { icon: <ArrowRightLeft size={14} />, color: 'bg-purple-50 text-purple-700', labelVi: 'Trung tâm phân loại', labelEn: 'Sorting Center' },
  DISTRIBUTION_CENTER: { icon: <Package size={14} />,        color: 'bg-blue-50 text-blue-700',     labelVi: 'Trung tâm phân phối', labelEn: 'Distribution Center' },
  CROSS_DOCK:          { icon: <ArrowRightLeft size={14} />, color: 'bg-cyan-50 text-cyan-700',     labelVi: 'Trung chuyển',         labelEn: 'Cross Dock' },
  COLLECTION_POINT:    { icon: <CircleDot size={14} />,      color: 'bg-green-50 text-green-700',   labelVi: 'Điểm thu gom',        labelEn: 'Collection Point' },
};

export default function HubsPage() {
  const t = useTranslations();
  const pathname = usePathname();
  const locale = pathname.split('/')[1];
  const [hubs, setHubs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('');

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

  const filteredHubs = hubs.filter((h) => {
    if (typeFilter && h.type !== typeFilter) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (h.name || '').toLowerCase().includes(q) || (h.code || '').toLowerCase().includes(q);
    }
    return true;
  });

  const activeCount = hubs.filter((h) => h.isActive).length;

  return (
    <PageContainer
      title={t('app.hubs')}
      description={locale === 'vi' ? 'Quản lý hệ thống kho bãi' : 'Manage warehouse network'}
      actions={
        <button className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-blue-600 text-sm font-medium text-white hover:bg-blue-700 transition-colors">
          <Plus size={16} />
          {t('common.create')}
        </button>
      }
    >
      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        <StatsCard
          title={locale === 'vi' ? 'Tổng kho' : 'Total Hubs'}
          value={hubs.length}
          icon={<Warehouse size={20} />}
          accentColor="blue"
          loading={loading}
        />
        <StatsCard
          title={locale === 'vi' ? 'Đang hoạt động' : 'Active'}
          value={activeCount}
          icon={<Building2 size={20} />}
          accentColor="green"
          loading={loading}
        />
        <StatsCard
          title={locale === 'vi' ? 'Ngừng hoạt động' : 'Inactive'}
          value={hubs.length - activeCount}
          icon={<Building2 size={20} />}
          accentColor="red"
          loading={loading}
        />
      </div>

      {/* Filter Bar */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-3 mb-6">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 flex-1 min-w-[200px] max-w-[360px] px-3 py-2 rounded-lg border border-gray-200 bg-gray-50 focus-within:bg-white focus-within:border-blue-300 focus-within:ring-2 focus-within:ring-blue-100 transition-all">
            <Search size={16} className="text-gray-400 shrink-0" />
            <input
              type="text"
              placeholder={locale === 'vi' ? 'Tên kho, mã kho...' : 'Hub name, code...'}
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
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-3 py-2 rounded-lg border border-gray-200 bg-white text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-300"
          >
            <option value="">{locale === 'vi' ? 'Loại: Tất cả' : 'Type: All'}</option>
            {Object.entries(HUB_TYPE_CONFIG).map(([key, cfg]) => (
              <option key={key} value={key}>{locale === 'vi' ? cfg.labelVi : cfg.labelEn}</option>
            ))}
          </select>
          {(typeFilter || searchQuery) && (
            <button
              onClick={() => { setTypeFilter(''); setSearchQuery(''); }}
              className="text-sm text-blue-600 hover:text-blue-800 font-medium transition-colors"
            >
              {locale === 'vi' ? 'Xóa bộ lọc' : 'Clear filters'}
            </button>
          )}
        </div>
      </div>

      {/* Hub Cards Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
              <div className="flex items-center justify-between mb-4">
                <div className="skeleton h-5 w-32" />
                <div className="skeleton w-2.5 h-2.5 rounded-full" />
              </div>
              <div className="skeleton h-3 w-20 mb-3" />
              <div className="space-y-2">
                <div className="skeleton h-3 w-full" />
                <div className="skeleton h-3 w-3/4" />
                <div className="skeleton h-3 w-1/2" />
              </div>
            </div>
          ))}
        </div>
      ) : filteredHubs.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
          <Warehouse size={40} className="mx-auto mb-3 text-gray-300" />
          <h3 className="text-base font-semibold text-gray-700 mb-1">
            {locale === 'vi' ? 'Chưa có kho nào' : 'No hubs yet'}
          </h3>
          <p className="text-sm text-gray-400">
            {locale === 'vi' ? 'Thêm kho để bắt đầu vận hành' : 'Add hubs to start operations'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredHubs.map((hub: any) => {
            const typeConfig = HUB_TYPE_CONFIG[hub.type] || { icon: <Building2 size={14} />, color: 'bg-gray-100 text-gray-600', labelVi: hub.type, labelEn: hub.type };
            return (
              <div key={hub.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 stat-card cursor-pointer">
                {/* Header */}
                <div className="flex items-center justify-between mb-1">
                  <h3 className="text-sm font-semibold text-gray-900">{hub.name}</h3>
                  <span className={cn(
                    'w-2.5 h-2.5 rounded-full shrink-0',
                    hub.isActive ? 'bg-green-500' : 'bg-gray-300'
                  )} title={hub.isActive ? 'Active' : 'Inactive'} />
                </div>
                <p className="text-xs text-gray-400 font-mono mb-3">{hub.code}</p>

                {/* Type badge */}
                <div className="mb-3">
                  <span className={cn('inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium', typeConfig.color)}>
                    {typeConfig.icon}
                    {locale === 'vi' ? typeConfig.labelVi : typeConfig.labelEn}
                  </span>
                </div>

                {/* Details */}
                <div className="space-y-2 text-sm">
                  {hub.address?.streetAddress && (
                    <div className="flex items-start gap-2 text-gray-500">
                      <MapPin size={14} className="text-gray-400 shrink-0 mt-0.5" />
                      <span className="leading-tight">
                        {hub.address.streetAddress}
                        {hub.address.districtName && `, ${hub.address.districtName}`}
                        {hub.address.provinceName && `, ${hub.address.provinceName}`}
                      </span>
                    </div>
                  )}
                  {hub.capacity && (
                    <div className="flex items-center gap-2 text-gray-500">
                      <Package size={14} className="text-gray-400 shrink-0" />
                      <span>{hub.capacity} {locale === 'vi' ? 'đơn/ngày' : 'shipments/day'}</span>
                    </div>
                  )}
                  {hub.contactPhone && (
                    <div className="flex items-center gap-2 text-gray-500">
                      <Phone size={14} className="text-gray-400 shrink-0" />
                      <span>{hub.contactPhone}</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </PageContainer>
  );
}
