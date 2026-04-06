'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { usePathname } from 'next/navigation';
import {
  Users, UserCheck, Coffee, UserX,
  Plus, Search, X, Phone, MapPin, Truck as TruckIcon,
  Star, Weight, Building2,
} from 'lucide-react';
import { StatusBadge } from '@/components/data/status-badge';
import { StatsCard } from '@/components/data/stats-card';
import { PageContainer } from '@/components/layout/page-container';
import { apiFetch, getTokenFromCookie } from '@/lib/api-client';
import { cn } from '@/lib/utils';

export default function DriversPage() {
  const t = useTranslations();
  const pathname = usePathname();
  const locale = pathname.split('/')[1];
  const [drivers, setDrivers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

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

  const filteredDrivers = drivers.filter((d) => {
    if (statusFilter && d.status !== statusFilter) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const name = (d.user?.fullName || '').toLowerCase();
      const phone = (d.user?.phone || '').toLowerCase();
      return name.includes(q) || phone.includes(q);
    }
    return true;
  });

  const counts = {
    total: drivers.length,
    available: drivers.filter((d) => d.status === 'AVAILABLE').length,
    onDuty: drivers.filter((d) => d.status === 'ON_DUTY').length,
    offDuty: drivers.filter((d) => d.status === 'OFF_DUTY' || d.status === 'ON_BREAK').length,
  };

  const vehicleLabels: Record<string, string> = {
    MOTORBIKE: locale === 'vi' ? 'Xe máy' : 'Motorbike',
    VAN: 'Van',
    TRUCK: locale === 'vi' ? 'Xe tải' : 'Truck',
    BICYCLE: locale === 'vi' ? 'Xe đạp' : 'Bicycle',
  };

  return (
    <PageContainer
      title={t('app.drivers')}
      description={locale === 'vi' ? 'Quản lý đội ngũ tài xế giao hàng' : 'Manage delivery driver team'}
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
          title={locale === 'vi' ? 'Tổng tài xế' : 'Total Drivers'}
          value={counts.total}
          icon={<Users size={20} />}
          accentColor="blue"
          loading={loading}
        />
        <StatsCard
          title={locale === 'vi' ? 'Sẵn sàng' : 'Available'}
          value={counts.available}
          icon={<UserCheck size={20} />}
          accentColor="green"
          onClick={() => setStatusFilter('AVAILABLE')}
          loading={loading}
        />
        <StatsCard
          title={locale === 'vi' ? 'Đang làm' : 'On Duty'}
          value={counts.onDuty}
          icon={<TruckIcon size={20} />}
          accentColor="cyan"
          onClick={() => setStatusFilter('ON_DUTY')}
          loading={loading}
        />
        <StatsCard
          title={locale === 'vi' ? 'Nghỉ' : 'Off Duty'}
          value={counts.offDuty}
          icon={<Coffee size={20} />}
          accentColor="yellow"
          onClick={() => setStatusFilter('OFF_DUTY')}
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
              placeholder={locale === 'vi' ? 'Tên tài xế, SĐT...' : 'Driver name, phone...'}
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
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 rounded-lg border border-gray-200 bg-white text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-300"
          >
            <option value="">{t('common.status')}: {locale === 'vi' ? 'Tất cả' : 'All'}</option>
            <option value="AVAILABLE">{locale === 'vi' ? 'Sẵn sàng' : 'Available'}</option>
            <option value="ON_DUTY">{locale === 'vi' ? 'Đang làm' : 'On Duty'}</option>
            <option value="ON_BREAK">{locale === 'vi' ? 'Nghỉ giải lao' : 'On Break'}</option>
            <option value="OFF_DUTY">{locale === 'vi' ? 'Hết ca' : 'Off Duty'}</option>
            <option value="ON_LEAVE">{locale === 'vi' ? 'Nghỉ phép' : 'On Leave'}</option>
          </select>
          {(statusFilter || searchQuery) && (
            <button
              onClick={() => { setStatusFilter(''); setSearchQuery(''); }}
              className="text-sm text-blue-600 hover:text-blue-800 font-medium transition-colors"
            >
              {locale === 'vi' ? 'Xóa bộ lọc' : 'Clear filters'}
            </button>
          )}
        </div>
      </div>

      {/* Driver Cards Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
              <div className="flex items-center gap-3 mb-4">
                <div className="skeleton w-10 h-10 rounded-full" />
                <div className="flex-1">
                  <div className="skeleton h-4 w-32 mb-2" />
                  <div className="skeleton h-3 w-24" />
                </div>
                <div className="skeleton h-6 w-16 rounded-full" />
              </div>
              <div className="space-y-2">
                <div className="skeleton h-3 w-full" />
                <div className="skeleton h-3 w-3/4" />
              </div>
            </div>
          ))}
        </div>
      ) : filteredDrivers.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
          <Users size={40} className="mx-auto mb-3 text-gray-300" />
          <h3 className="text-base font-semibold text-gray-700 mb-1">
            {locale === 'vi' ? 'Chưa có tài xế' : 'No drivers yet'}
          </h3>
          <p className="text-sm text-gray-400">
            {locale === 'vi' ? 'Thêm tài xế để bắt đầu phân công giao hàng' : 'Add drivers to start assigning deliveries'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredDrivers.map((driver: any) => (
            <div key={driver.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 stat-card cursor-pointer">
              {/* Header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center">
                    <span className="text-sm font-bold text-blue-600">
                      {(driver.user?.fullName || 'D')[0].toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900">{driver.user?.fullName || 'Driver'}</h3>
                    {driver.user?.phone && (
                      <p className="flex items-center gap-1 text-xs text-gray-400">
                        <Phone size={10} />
                        {driver.user.phone}
                      </p>
                    )}
                  </div>
                </div>
                <StatusBadge status={driver.status} locale={locale} />
              </div>

              {/* Details */}
              <div className="space-y-2.5 text-sm">
                <div className="flex items-center gap-2 text-gray-500">
                  <TruckIcon size={14} className="text-gray-400 shrink-0" />
                  <span>{vehicleLabels[driver.capabilities?.vehicleType] || driver.capabilities?.vehicleType || '—'}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-500">
                  <Weight size={14} className="text-gray-400 shrink-0" />
                  <span>{locale === 'vi' ? 'Tối đa' : 'Max'}: {driver.capabilities?.maxWeightKg || 30}kg</span>
                </div>
                <div className="flex items-center gap-2 text-gray-500">
                  <Building2 size={14} className="text-gray-400 shrink-0" />
                  <span>{driver.homeHub?.name || '—'}</span>
                </div>
                {driver.performanceMetrics?.successRate != null && (
                  <div className="flex items-center gap-2">
                    <Star size={14} className="text-yellow-500 shrink-0" />
                    <span className="text-gray-700 font-medium">
                      {(driver.performanceMetrics.successRate * 100).toFixed(0)}%
                    </span>
                    <span className="text-gray-400 text-xs">{locale === 'vi' ? 'tỷ lệ thành công' : 'success rate'}</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </PageContainer>
  );
}
