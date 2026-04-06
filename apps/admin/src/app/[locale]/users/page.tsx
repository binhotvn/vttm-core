'use client';

import { useEffect, useState, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { usePathname } from 'next/navigation';
import {
  Users, UserCheck, UserX, Shield,
  Plus, Search, X, Mail, Phone,
} from 'lucide-react';
import { DataTable } from '@/components/data/data-table';
import { StatsCard } from '@/components/data/stats-card';
import { PageContainer } from '@/components/layout/page-container';
import { apiFetch, getTokenFromCookie } from '@/lib/api-client';
import { cn } from '@/lib/utils';

const ROLE_CONFIG: Record<string, { color: string; labelVi: string; labelEn: string }> = {
  SUPER_ADMIN:  { color: 'bg-red-50 text-red-700',    labelVi: 'Super Admin',   labelEn: 'Super Admin' },
  ORG_ADMIN:    { color: 'bg-purple-50 text-purple-700', labelVi: 'Quản trị',   labelEn: 'Org Admin' },
  MANAGER:      { color: 'bg-blue-50 text-blue-700',  labelVi: 'Quản lý',       labelEn: 'Manager' },
  DISPATCHER:   { color: 'bg-cyan-50 text-cyan-700',  labelVi: 'Điều phối',     labelEn: 'Dispatcher' },
  DRIVER:       { color: 'bg-green-50 text-green-700', labelVi: 'Tài xế',       labelEn: 'Driver' },
  CUSTOMER:     { color: 'bg-gray-100 text-gray-600', labelVi: 'Khách hàng',    labelEn: 'Customer' },
};

export default function UsersPage() {
  const t = useTranslations();
  const pathname = usePathname();
  const locale = pathname.split('/')[1];
  const [data, setData] = useState<any[]>([]);
  const [meta, setMeta] = useState({ total: 0, page: 1, limit: 20, totalPages: 0 });
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('');

  const fetchUsers = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const token = getTokenFromCookie();
      if (!token) return;
      const params = new URLSearchParams({ page: String(page), limit: '20' });
      if (searchQuery) params.set('search', searchQuery);
      if (roleFilter) params.set('role', roleFilter);
      const result = await apiFetch(`/users?${params}`, { token });
      setData(result.data || result);
      if (result.meta) setMeta(result.meta);
    } catch (e) { console.error(e); }
    setLoading(false);
  }, [searchQuery, roleFilter]);

  useEffect(() => {
    const timer = setTimeout(() => fetchUsers(), searchQuery ? 300 : 0);
    return () => clearTimeout(timer);
  }, [fetchUsers]);

  const columns = [
    {
      key: 'fullName',
      header: locale === 'vi' ? 'Họ tên' : 'Name',
      width: '200px',
      render: (item: any) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center shrink-0">
            <span className="text-xs font-bold text-blue-600">
              {(item.fullName || 'U')[0].toUpperCase()}
            </span>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-900">{item.fullName}</p>
            <p className="flex items-center gap-1 text-xs text-gray-400">
              <Mail size={10} />
              {item.email}
            </p>
          </div>
        </div>
      ),
    },
    {
      key: 'role',
      header: locale === 'vi' ? 'Vai trò' : 'Role',
      width: '130px',
      render: (item: any) => {
        const cfg = ROLE_CONFIG[item.role] || { color: 'bg-gray-100 text-gray-600', labelVi: item.role, labelEn: item.role };
        return (
          <span className={cn('inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium', cfg.color)}>
            <Shield size={10} />
            {locale === 'vi' ? cfg.labelVi : cfg.labelEn}
          </span>
        );
      },
    },
    {
      key: 'phone',
      header: locale === 'vi' ? 'Điện thoại' : 'Phone',
      width: '140px',
      render: (item: any) => item.phone
        ? <span className="flex items-center gap-1 text-sm text-gray-600"><Phone size={12} className="text-gray-400" />{item.phone}</span>
        : <span className="text-sm text-gray-300">—</span>,
    },
    {
      key: 'isActive',
      header: t('common.status'),
      width: '110px',
      render: (item: any) => (
        <span className={cn(
          'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium',
          item.isActive ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-500'
        )}>
          <span className={cn('w-1.5 h-1.5 rounded-full', item.isActive ? 'bg-green-500' : 'bg-gray-400')} />
          {item.isActive ? (locale === 'vi' ? 'Hoạt động' : 'Active') : (locale === 'vi' ? 'Vô hiệu' : 'Inactive')}
        </span>
      ),
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
      title={t('app.users')}
      description={locale === 'vi' ? 'Quản lý tài khoản người dùng' : 'Manage user accounts'}
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
          title={locale === 'vi' ? 'Tổng người dùng' : 'Total Users'}
          value={meta.total}
          icon={<Users size={20} />}
          accentColor="blue"
          loading={loading}
        />
        <StatsCard
          title={locale === 'vi' ? 'Đang hoạt động' : 'Active'}
          value={data.filter((u) => u.isActive).length}
          icon={<UserCheck size={20} />}
          accentColor="green"
          loading={loading}
        />
        <StatsCard
          title={locale === 'vi' ? 'Vô hiệu' : 'Inactive'}
          value={data.filter((u) => !u.isActive).length}
          icon={<UserX size={20} />}
          accentColor="red"
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
              placeholder={locale === 'vi' ? 'Tên, email, SĐT...' : 'Name, email, phone...'}
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
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="px-3 py-2 rounded-lg border border-gray-200 bg-white text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-300"
          >
            <option value="">{locale === 'vi' ? 'Vai trò: Tất cả' : 'Role: All'}</option>
            {Object.entries(ROLE_CONFIG).map(([key, cfg]) => (
              <option key={key} value={key}>{locale === 'vi' ? cfg.labelVi : cfg.labelEn}</option>
            ))}
          </select>
          {(searchQuery || roleFilter) && (
            <button
              onClick={() => { setSearchQuery(''); setRoleFilter(''); }}
              className="text-sm text-blue-600 hover:text-blue-800 font-medium transition-colors"
            >
              {locale === 'vi' ? 'Xóa bộ lọc' : 'Clear filters'}
            </button>
          )}
        </div>
      </div>

      <DataTable
        columns={columns}
        data={data}
        total={meta.total}
        page={meta.page}
        limit={meta.limit}
        loading={loading}
        selectable
        onPageChange={fetchUsers}
        onRefresh={() => fetchUsers(meta.page)}
      />
    </PageContainer>
  );
}
