'use client';

import { Layout, Input, Badge, Avatar, Dropdown, Space, Button, Tooltip } from 'antd';
import type { MenuProps } from 'antd';
import {
  Search, Bell, Globe, User, Settings,
  LogOut, Menu as MenuIcon, Sun, Moon,
} from 'lucide-react';
import { useRouter } from 'next/navigation';

const { Header } = Layout;

interface AdminHeaderProps {
  collapsed: boolean;
  onToggleCollapse: () => void;
  locale: string;
  onLocaleChange: (locale: string) => void;
}

export function AdminHeader({ collapsed, onToggleCollapse, locale, onLocaleChange }: AdminHeaderProps) {
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
        {
          key: 'vi',
          label: 'Tiếng Việt',
          onClick: () => onLocaleChange('vi'),
        },
        {
          key: 'en',
          label: 'English',
          onClick: () => onLocaleChange('en'),
        },
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
    <Header
      style={{
        background: '#fff',
        padding: '0 24px',
        display: 'flex',
        alignItems: 'center',
        gap: 16,
        height: 56,
        borderBottom: '1px solid #f0f0f0',
        position: 'sticky',
        top: 0,
        zIndex: 100,
      }}
    >
      {/* Sidebar toggle */}
      <Button
        type="text"
        icon={<MenuIcon size={18} />}
        onClick={onToggleCollapse}
        style={{ color: '#595959' }}
      />

      {/* Global search */}
      <Input
        prefix={<Search size={14} style={{ color: '#bfbfbf' }} />}
        placeholder="Tìm đơn hàng, vận đơn, mã vận đơn..."
        style={{
          maxWidth: 400,
          borderRadius: 8,
          background: '#f5f5f5',
          border: 'none',
        }}
        suffix={
          <kbd style={{
            fontSize: 11,
            padding: '1px 6px',
            borderRadius: 4,
            background: '#e8e8e8',
            color: '#8c8c8c',
            border: '1px solid #d9d9d9',
          }}>
            Ctrl+K
          </kbd>
        }
      />

      {/* Spacer */}
      <div style={{ flex: 1 }} />

      {/* Right section */}
      <Space size={8}>
        {/* Notifications */}
        <Tooltip title="Thông báo">
          <Badge count={3} size="small">
            <Button
              type="text"
              icon={<Bell size={18} />}
              style={{ color: '#595959' }}
            />
          </Badge>
        </Tooltip>

        {/* User dropdown */}
        <Dropdown menu={{ items: userMenuItems }} trigger={['click']} placement="bottomRight">
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            cursor: 'pointer',
            padding: '4px 8px',
            borderRadius: 8,
            transition: 'background 0.2s',
          }}
          onMouseEnter={(e) => e.currentTarget.style.background = '#f5f5f5'}
          onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
          >
            <Avatar size={30} style={{ background: '#1677ff', fontSize: 12 }}>A</Avatar>
            <span style={{ fontSize: 13, color: '#262626', fontWeight: 500 }}>Admin</span>
          </div>
        </Dropdown>
      </Space>
    </Header>
  );
}
