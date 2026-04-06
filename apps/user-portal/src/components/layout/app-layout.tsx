import { Layout, Menu, Button, Dropdown, Space } from 'antd';
import {
  DashboardOutlined,
  ShoppingOutlined,
  CarOutlined,
  SearchOutlined,
  EnvironmentOutlined,
  RollbackOutlined,
  DollarOutlined,
  SettingOutlined,
  LogoutOutlined,
  GlobalOutlined,
} from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import { useAuthStore } from '@/stores/auth-store';

const { Header, Sider, Content } = Layout;

export function AppLayout() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const logout = useAuthStore((s) => s.logout);

  const menuItems = [
    { key: '/', icon: <DashboardOutlined />, label: t('nav.dashboard') },
    { key: '/orders', icon: <ShoppingOutlined />, label: t('nav.orders') },
    { key: '/shipments', icon: <CarOutlined />, label: t('nav.shipments') },
    { key: '/tracking', icon: <SearchOutlined />, label: t('nav.tracking') },
    { key: '/pickups', icon: <EnvironmentOutlined />, label: t('nav.pickups') },
    { key: '/returns', icon: <RollbackOutlined />, label: t('nav.returns') },
    { key: '/billing/cod', icon: <DollarOutlined />, label: t('nav.cod') },
    { key: '/settings', icon: <SettingOutlined />, label: t('nav.settings') },
  ];

  const langMenu = {
    items: [
      { key: 'vi', label: 'Tiếng Việt' },
      { key: 'en', label: 'English' },
    ],
    onClick: ({ key }: { key: string }) => i18n.changeLanguage(key),
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider width={240} theme="dark">
        <div style={{ padding: '16px', color: '#fff', fontSize: '18px', fontWeight: 'bold' }}>
          VTTM
        </div>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[location.pathname]}
          items={menuItems}
          onClick={({ key }) => navigate(key)}
        />
      </Sider>
      <Layout>
        <Header style={{ background: '#fff', padding: '0 24px', display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 12 }}>
          <Dropdown menu={langMenu}>
            <Button icon={<GlobalOutlined />}>{i18n.language.toUpperCase()}</Button>
          </Dropdown>
          <Button icon={<LogoutOutlined />} onClick={logout}>{t('common.logout')}</Button>
        </Header>
        <Content style={{ margin: 24, padding: 24, background: '#fff', borderRadius: 8 }}>
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
}
