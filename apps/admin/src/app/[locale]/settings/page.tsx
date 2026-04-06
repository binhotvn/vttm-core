'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { usePathname } from 'next/navigation';
import {
  Webhook, Plus, ExternalLink, Trash2, Globe, Bell, Shield,
} from 'lucide-react';
import { PageContainer } from '@/components/layout/page-container';
import { apiFetch, getTokenFromCookie } from '@/lib/api-client';
import { cn } from '@/lib/utils';

export default function SettingsPage() {
  const t = useTranslations();
  const pathname = usePathname();
  const locale = pathname.split('/')[1];
  const [webhooks, setWebhooks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const token = getTokenFromCookie();
        const wh = await apiFetch('/webhooks', { token: token! }).catch(() => []);
        setWebhooks(Array.isArray(wh) ? wh : []);
      } catch (e) { console.error(e); }
      setLoading(false);
    };
    load();
  }, []);

  const settingSections = [
    {
      key: 'general',
      icon: <Globe size={20} className="text-blue-600" />,
      title: locale === 'vi' ? 'Chung' : 'General',
      description: locale === 'vi' ? 'Cài đặt ngôn ngữ, múi giờ, định dạng' : 'Language, timezone, format settings',
      disabled: true,
    },
    {
      key: 'notifications',
      icon: <Bell size={20} className="text-yellow-600" />,
      title: locale === 'vi' ? 'Thông báo' : 'Notifications',
      description: locale === 'vi' ? 'Cấu hình email, SMS, push notifications' : 'Email, SMS, push notification settings',
      disabled: true,
    },
    {
      key: 'security',
      icon: <Shield size={20} className="text-red-600" />,
      title: locale === 'vi' ? 'Bảo mật' : 'Security',
      description: locale === 'vi' ? 'Mật khẩu, xác thực 2 bước, phiên đăng nhập' : 'Password, 2FA, login sessions',
      disabled: true,
    },
  ];

  return (
    <PageContainer
      title={t('app.settings')}
      description={locale === 'vi' ? 'Quản lý cài đặt hệ thống' : 'Manage system settings'}
    >
      {/* Setting sections */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {settingSections.map((section) => (
          <div
            key={section.key}
            className={cn(
              'bg-white rounded-xl shadow-sm border border-gray-100 p-5 transition-all',
              section.disabled ? 'opacity-60' : 'stat-card cursor-pointer'
            )}
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-lg bg-gray-50 flex items-center justify-center">
                {section.icon}
              </div>
              <div>
                <h3 className="text-sm font-semibold text-gray-900">{section.title}</h3>
                {section.disabled && (
                  <span className="text-[10px] text-gray-400 uppercase font-medium">
                    {locale === 'vi' ? 'Sắp có' : 'Coming soon'}
                  </span>
                )}
              </div>
            </div>
            <p className="text-xs text-gray-500 ml-[52px]">{section.description}</p>
          </div>
        ))}
      </div>

      {/* Webhooks */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center">
              <Webhook size={16} className="text-indigo-600" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-800">Webhooks</h3>
              <p className="text-xs text-gray-400">
                {locale === 'vi' ? 'Nhận thông báo khi có sự kiện' : 'Receive notifications on events'}
              </p>
            </div>
          </div>
          <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors">
            <Plus size={14} />
            {locale === 'vi' ? 'Thêm webhook' : 'Add webhook'}
          </button>
        </div>

        {loading ? (
          <div className="p-5 space-y-3">
            {[1, 2].map((i) => (
              <div key={i} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                <div className="skeleton h-4 flex-1" />
                <div className="skeleton h-3 w-32" />
                <div className="skeleton w-2.5 h-2.5 rounded-full" />
              </div>
            ))}
          </div>
        ) : webhooks.length === 0 ? (
          <div className="p-10 text-center">
            <Webhook size={32} className="mx-auto mb-2 text-gray-300" />
            <p className="text-sm text-gray-500 mb-1">
              {locale === 'vi' ? 'Chưa có webhook nào' : 'No webhooks configured'}
            </p>
            <p className="text-xs text-gray-400">
              {locale === 'vi' ? 'Thêm webhook để nhận thông báo tự động' : 'Add webhooks to receive automatic notifications'}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {webhooks.map((wh: any) => (
              <div key={wh.id} className="flex items-center justify-between px-5 py-4 table-row-hover">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-mono text-gray-800 text-truncate">{wh.url}</span>
                    <ExternalLink size={12} className="text-gray-400 shrink-0" />
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    {(wh.events || []).map((evt: string) => (
                      <span key={evt} className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-gray-100 text-gray-500">
                        {evt}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="flex items-center gap-3 ml-4 shrink-0">
                  <span className={cn(
                    'w-2.5 h-2.5 rounded-full',
                    wh.isActive ? 'bg-green-500' : 'bg-gray-300'
                  )} />
                  <button className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </PageContainer>
  );
}
