'use client';

import { useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Layout, Menu, Badge, Tooltip, Avatar, Typography } from 'antd';
import type { MenuProps } from 'antd';
import {
  LayoutDashboard,
  ShoppingCart,
  Package,
  Layers,
  Users,
  Warehouse,
  ClipboardList,
  Scale,
  UserCog,
  Settings,
  HelpCircle,
  ChevronLeft,
  ChevronRight,
  Truck,
} from 'lucide-react';

const { Sider } = Layout;
const { Text } = Typography;

// Wrap Lucide icons for Ant Design Menu compatibility
const LucideIcon = ({ icon: Icon, size = 18 }: { icon: any; size?: number }) => (
  <Icon size={size} strokeWidth={1.75} style={{ minWidth: size }} />
);

interface AdminSidebarProps {
  collapsed: boolean;
  onCollapse: (collapsed: boolean) => void;
}

export function AdminSidebar({ collapsed, onCollapse }: AdminSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();

  // Remove locale prefix from pathname for matching
  const cleanPath = pathname.replace(/^\/(vi|en)/, '') || '/';

  const menuItems: MenuProps['items'] = [
    {
      type: 'group',
      label: !collapsed ? 'QUẢN LÝ ĐƠN' : undefined,
      children: [
        {
          key: '/dashboard',
          icon: <LucideIcon icon={LayoutDashboard} />,
          label: 'Tổng quan',
        },
        {
          key: '/orders',
          icon: <LucideIcon icon={ShoppingCart} />,
          label: (
            <span style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              Đơn hàng
              <Badge count={12} size="small" style={{ marginLeft: 'auto' }} />
            </span>
          ),
        },
        {
          key: '/shipments',
          icon: <LucideIcon icon={Package} />,
          label: (
            <span style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              Vận đơn
              <Badge count={3} size="small" color="#1677ff" style={{ marginLeft: 'auto' }} />
            </span>
          ),
        },
        {
          key: '/batches',
          icon: <LucideIcon icon={Layers} />,
          label: 'Lô hàng',
        },
      ],
    },
    {
      type: 'group',
      label: !collapsed ? 'VẬN HÀNH' : undefined,
      children: [
        {
          key: '/drivers',
          icon: <LucideIcon icon={Truck} />,
          label: 'Tài xế',
        },
        {
          key: '/hubs',
          icon: <LucideIcon icon={Warehouse} />,
          label: 'Kho',
        },
        {
          key: '/pickups',
          icon: <LucideIcon icon={ClipboardList} />,
          label: (
            <span style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              Lấy hàng
              <Badge count={5} size="small" color="#faad14" style={{ marginLeft: 'auto' }} />
            </span>
          ),
        },
        {
          key: '/cod',
          icon: <LucideIcon icon={Scale} />,
          label: 'Đối soát COD',
        },
      ],
    },
    {
      type: 'group',
      label: !collapsed ? 'HỆ THỐNG' : undefined,
      children: [
        {
          key: '/users',
          icon: <LucideIcon icon={UserCog} />,
          label: 'Người dùng',
        },
        {
          key: '/settings',
          icon: <LucideIcon icon={Settings} />,
          label: 'Cài đặt',
        },
      ],
    },
  ];

  const handleMenuClick: MenuProps['onClick'] = ({ key }) => {
    // Extract locale from current pathname
    const locale = pathname.split('/')[1] || 'vi';
    const targetPath = key === '/dashboard' ? `/${locale}` : `/${locale}${key}`;
    router.push(targetPath);
  };

  // Map cleanPath for selectedKeys — "/" maps to "/dashboard"
  const selectedKey = cleanPath === '/' || cleanPath === '' ? '/dashboard' : cleanPath;

  return (
    <Sider
      width={256}
      collapsedWidth={72}
      collapsed={collapsed}
      style={{
        height: '100vh',
        position: 'fixed',
        left: 0,
        top: 0,
        bottom: 0,
        display: 'flex',
        flexDirection: 'column',
        borderRight: '1px solid rgba(255,255,255,0.06)',
      }}
      theme="dark"
    >
      {/* Logo */}
      <div
        style={{
          padding: collapsed ? '20px 0' : '20px 20px',
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          justifyContent: collapsed ? 'center' : 'flex-start',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
          marginBottom: 8,
        }}
      >
        <div
          style={{
            width: 36,
            height: 36,
            borderRadius: 10,
            background: 'linear-gradient(135deg, #1677ff, #4096ff)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 700,
            fontSize: 14,
            color: '#fff',
            flexShrink: 0,
          }}
        >
          VT
        </div>
        {!collapsed && (
          <div>
            <div style={{ color: '#fff', fontWeight: 600, fontSize: 16, lineHeight: 1.2 }}>VTTM</div>
            <div style={{ color: 'rgba(255,255,255,0.45)', fontSize: 11 }}>Logistics Platform</div>
          </div>
        )}
      </div>

      {/* Menu */}
      <div style={{ flex: 1, overflow: 'auto' }}>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[selectedKey]}
          items={menuItems}
          onClick={handleMenuClick}
          style={{ border: 'none' }}
        />
      </div>

      {/* Collapse toggle */}
      <div
        onClick={() => onCollapse(!collapsed)}
        style={{
          padding: '12px 0',
          display: 'flex',
          justifyContent: 'center',
          cursor: 'pointer',
          borderTop: '1px solid rgba(255,255,255,0.06)',
          color: 'rgba(255,255,255,0.45)',
          transition: 'color 0.2s',
        }}
      >
        {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
      </div>

      {/* User profile card */}
      {!collapsed && (
        <div
          style={{
            margin: '0 12px 12px',
            padding: '10px 12px',
            background: 'rgba(255,255,255,0.04)',
            borderRadius: 10,
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            cursor: 'pointer',
          }}
        >
          <Avatar size={32} style={{ background: '#1677ff', fontSize: 13 }}>A</Avatar>
          <div style={{ overflow: 'hidden' }}>
            <div style={{ color: '#fff', fontSize: 13, fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              Admin User
            </div>
            <div style={{ color: 'rgba(255,255,255,0.45)', fontSize: 11 }}>
              Quản trị viên
            </div>
          </div>
        </div>
      )}
      {collapsed && (
        <div style={{ display: 'flex', justifyContent: 'center', paddingBottom: 12 }}>
          <Avatar size={32} style={{ background: '#1677ff', fontSize: 13, cursor: 'pointer' }}>A</Avatar>
        </div>
      )}
    </Sider>
  );
}
