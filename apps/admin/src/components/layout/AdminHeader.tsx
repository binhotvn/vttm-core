'use client';

import { Input, Badge, Avatar, Dropdown, Button, Space } from 'antd';
import type { MenuProps } from 'antd';
import {
  Search, Bell, Globe, User, Settings,
  LogOut, ChevronRight,
} from 'lucide-react';
import { useRouter } from 'next/navigation';

interface AdminHeaderProps {
  locale: string;
  breadcrumb: string;
  onLocaleChange: (locale: string) => void;
}

export function AdminHeader({ locale, breadcrumb, onLocaleChange }: AdminHeaderProps) {
  const router = useRouter();

  const userMenuItems: MenuProps['items'] = [
    {
      key: 'profile',
      icon: <User size={14} />,
      label: 'Hồ sơ cá nhân',
    },
    {
      key: 'language',
      icon: <Globe size={14} />,
      label: 'Ngôn ngữ',
      children: [
        { key: 'vi', label: 'Tiếng Việt', onClick: () => onLocaleChange('vi') },
        { key: 'en', label: 'English',     onClick: () => onLocaleChange('en') },
      ],
    },
    {
      key: 'settings',
      icon: <Settings size={14} />,
      label: 'Cài đặt',
    },
    { type: 'divider' },
    {
      key: 'logout',
      icon: <LogOut size={14} />,
      label: 'Đăng xuất',
      danger: true,
    },
  ];

  return (
    <header
      style={{
        background: '#714B67',
        height: 46,
        display: 'flex',
        alignItems: 'center',
        padding: '0 20px',
        gap: 16,
        position: 'sticky',
        top: 0,
        zIndex: 100,
      }}
    >
      {/* Breadcrumb */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <span
          style={{ color: 'rgba(255,255,255,0.6)', fontSize: 13, cursor: 'pointer' }}
          onClick={() => router.push(`/${locale}`)}
        >
          VTTM
        </span>
        <ChevronRight size={12} style={{ color: 'rgba(255,255,255,0.4)' }} />
        <span style={{ color: '#fff', fontSize: 13, fontWeight: 500 }}>
          {breadcrumb}
        </span>
      </div>

      {/* Spacer */}
      <div style={{ flex: 1 }} />

      {/* Search */}
      <Input
        prefix={<Search size={14} style={{ color: 'rgba(255,255,255,0.5)' }} />}
        placeholder="Tìm kiếm..."
        style={{
          maxWidth: 280,
          borderRadius: 20,
          background: 'rgba(255,255,255,0.15)',
          border: 'none',
          color: '#fff',
        }}
        styles={{
          input: { color: '#fff', background: 'transparent' },
        }}
        suffix={
          <kbd style={{
            fontSize: 10,
            padding: '1px 5px',
            borderRadius: 3,
            background: 'rgba(255,255,255,0.15)',
            color: 'rgba(255,255,255,0.6)',
            border: '1px solid rgba(255,255,255,0.2)',
          }}>
            Ctrl+K
          </kbd>
        }
      />

      {/* Right actions */}
      <Space size={4}>
        <Badge count={3} size="small" offset={[-2, 2]}>
          <Button
            type="text"
            icon={<Bell size={18} />}
            style={{ color: 'rgba(255,255,255,0.85)' }}
          />
        </Badge>

        <Dropdown menu={{ items: userMenuItems }} trigger={['click']} placement="bottomRight">
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              cursor: 'pointer',
              padding: '4px 8px',
              borderRadius: 6,
              transition: 'background 0.15s',
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
          >
            <Avatar size={26} style={{ background: 'rgba(255,255,255,0.25)', color: '#fff', fontSize: 11 }}>
              A
            </Avatar>
            <span style={{ fontSize: 13, color: '#fff', fontWeight: 500 }}>Admin</span>
          </div>
        </Dropdown>
      </Space>
    </header>
  );
}
