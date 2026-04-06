'use client';

import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import {
  Row, Col, Card, Statistic, Table, Tag, Badge, Button,
  Input, Select, DatePicker, Space, Tabs, Dropdown, Tooltip, message, Empty, Typography,
} from 'antd';
import type { ColumnsType, TableProps } from 'antd/es/table';
import {
  ShoppingCart, Clock, Truck, CircleCheck, CircleDot,
  ArrowUpRight, Plus, Upload, ChevronDown,
  Search, Calendar, X, RefreshCw, Download,
  Columns3, Eye, PackageSearch, Printer,
  Copy, CircleX, MoreVertical, Phone, MapPin,
  Zap, Timer, Flame, Rocket, Wallet,
  Package,
} from 'lucide-react';
import dayjs from 'dayjs';
import { apiFetch, getTokenFromCookie } from '@/lib/api-client';

const { RangePicker } = DatePicker;
const { Title, Text } = Typography;

// ============================================================
// STATUS & SERVICE CONFIGS (Vietnamese labels, Lucide icons, colors)
// ============================================================

const ORDER_STATUS: Record<string, { label: string; color: string; icon: any }> = {
  DRAFT:       { label: 'Nháp',               color: 'default',    icon: CircleDot },
  CONFIRMED:   { label: 'Đã xác nhận',        color: 'processing', icon: CircleCheck },
  PROCESSING:  { label: 'Đang xử lý',         color: 'blue',       icon: RefreshCw },
  SHIPPED:     { label: 'Đã giao vận chuyển',  color: 'geekblue',   icon: Truck },
  DELIVERED:   { label: 'Đã giao',             color: 'success',    icon: CircleCheck },
  CANCELLED:   { label: 'Đã hủy',             color: 'default',    icon: CircleX },
};

const SERVICE_TYPE: Record<string, { label: string; color: string; icon: any }> = {
  STANDARD:  { label: 'Tiêu chuẩn', color: 'default', icon: Timer },
  EXPRESS:   { label: 'Nhanh',       color: 'blue',    icon: Zap },
  SAME_DAY:  { label: 'Trong ngày',  color: 'red',     icon: Flame },
  ECONOMY:   { label: 'Tiết kiệm',  color: 'green',   icon: Wallet },
  OVERNIGHT: { label: 'Hỏa tốc',    color: 'purple',  icon: Rocket },
};

const PAYMENT_METHOD: Record<string, string> = {
  PREPAID: 'Đã thanh toán',
  COD:     'Thu hộ (COD)',
  BILLED:  'Trả sau',
};

// ============================================================
// FORMAT HELPERS
// ============================================================

function formatVND(amount: number): string {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(amount);
}

function formatPhone(phone: string): string {
  if (!phone) return '';
  const clean = phone.replace(/\D/g, '');
  if (clean.length === 10) return `${clean.slice(0, 4)} ${clean.slice(4, 7)} ${clean.slice(7)}`;
  return phone;
}

// ============================================================
// STATUS TAG COMPONENT (reusable)
// ============================================================

function StatusTag({ status, map }: { status: string; map: Record<string, any> }) {
  const config = map[status];
  if (!config) return <Tag>{status}</Tag>;
  const IconComponent = config.icon;
  return (
    <Tag
      color={config.color}
      style={{
        borderRadius: 12,
        padding: '2px 10px',
        display: 'inline-flex',
        alignItems: 'center',
        gap: 4,
        fontSize: 12,
      }}
    >
      {IconComponent && <IconComponent size={12} strokeWidth={2} />}
      {config.label}
    </Tag>
  );
}

// ============================================================
// STAT CARD COMPONENT (reusable)
// ============================================================

function StatCard({
  title, value, icon: Icon, iconColor, borderColor,
  trend, trendLabel, subtitle, valueColor, onClick,
}: {
  title: string;
  value: number;
  icon: any;
  iconColor: string;
  borderColor: string;
  trend?: { value: number; direction: 'up' | 'down' };
  trendLabel?: string;
  subtitle?: string;
  valueColor?: string;
  onClick?: () => void;
}) {
  return (
    <Card
      hoverable={!!onClick}
      onClick={onClick}
      style={{
        borderRadius: 12,
        borderLeft: `3px solid ${borderColor}`,
        cursor: onClick ? 'pointer' : 'default',
      }}
      styles={{ body: { padding: '16px 20px' } }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <Text type="secondary" style={{ fontSize: 13 }}>{title}</Text>
          <div style={{ fontSize: 28, fontWeight: 600, color: valueColor || 'inherit', marginTop: 4, lineHeight: 1 }}>
            {value.toLocaleString('vi-VN')}
          </div>
          {trend && (
            <div style={{ fontSize: 12, color: trend.direction === 'up' ? '#52c41a' : '#ff4d4f', marginTop: 6, display: 'flex', alignItems: 'center', gap: 2 }}>
              <ArrowUpRight size={12} />
              {trend.value}% {trendLabel}
            </div>
          )}
          {subtitle && !trend && (
            <Text type="secondary" style={{ fontSize: 12, marginTop: 6, display: 'block' }}>{subtitle}</Text>
          )}
        </div>
        <div style={{
          width: 40, height: 40, borderRadius: 10,
          background: `${iconColor}10`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Icon size={20} strokeWidth={1.75} style={{ color: iconColor }} />
        </div>
      </div>
    </Card>
  );
}

// ============================================================
// MAIN ORDERS PAGE
// ============================================================

export default function OrdersPage() {
  const router = useRouter();
  const pathname = usePathname();
  const locale = pathname.split('/')[1] || 'vi';

  const [activeTab, setActiveTab] = useState('all');
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [searchText, setSearchText] = useState('');
  const [data, setData] = useState<any[]>([]);
  const [meta, setMeta] = useState({ total: 0, page: 1, limit: 20, totalPages: 0 });
  const [isLoading, setIsLoading] = useState(true);

  const fetchOrders = async (page = 1) => {
    setIsLoading(true);
    try {
      const token = getTokenFromCookie();
      const params = new URLSearchParams({ page: String(page), limit: '20' });
      if (activeTab && activeTab !== 'all') params.set('status', activeTab);
      if (searchText) params.set('search', searchText);
      const result = await apiFetch(`/orders?${params}`, { token: token! });
      setData(result.data || result);
      if (result.meta) setMeta(result.meta);
    } catch (e) {
      console.error(e);
    }
    setIsLoading(false);
  };

  useEffect(() => { fetchOrders(); }, [activeTab]);

  // ---- COLUMNS ----
  const columns: ColumnsType<any> = [
    {
      title: 'Đơn hàng',
      dataIndex: 'orderNumber',
      width: 200,
      fixed: 'left',
      render: (val: string, record: any) => (
        <div>
          <a
            style={{ fontWeight: 600, color: '#1677ff' }}
            onClick={() => router.push(`/${locale}/orders/${record.id}`)}
          >
            {val}
          </a>
          {record.trackingNumber && (
            <div style={{ fontSize: 12, color: '#8c8c8c', marginTop: 2, display: 'flex', alignItems: 'center', gap: 4 }}>
              <Copy
                size={11} strokeWidth={1.5}
                style={{ cursor: 'pointer', flexShrink: 0 }}
                onClick={(e) => {
                  e.stopPropagation();
                  navigator.clipboard.writeText(record.trackingNumber);
                  message.success('Đã sao chép mã vận đơn');
                }}
              />
              <span>{record.trackingNumber}</span>
            </div>
          )}
        </div>
      ),
      sorter: true,
    },
    {
      title: 'Người nhận',
      dataIndex: 'recipientName',
      width: 200,
      render: (val: string, record: any) => (
        <div>
          <div style={{ fontWeight: 500 }}>{val || '—'}</div>
          {record.recipientPhone && (
            <div style={{ fontSize: 12, color: '#8c8c8c', marginTop: 2, display: 'flex', alignItems: 'center', gap: 3 }}>
              <Phone size={11} strokeWidth={1.5} />
              {formatPhone(record.recipientPhone)}
            </div>
          )}
          {record.recipientDistrict && (
            <div style={{ fontSize: 12, color: '#bfbfbf', display: 'flex', alignItems: 'center', gap: 3 }}>
              <MapPin size={11} strokeWidth={1.5} />
              {record.recipientDistrict}
            </div>
          )}
        </div>
      ),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      width: 170,
      render: (status: string) => <StatusTag status={status} map={ORDER_STATUS} />,
    },
    {
      title: 'Dịch vụ',
      dataIndex: 'serviceType',
      width: 130,
      render: (type: string) => <StatusTag status={type} map={SERVICE_TYPE} />,
    },
    {
      title: 'Thanh toán',
      dataIndex: 'paymentMethod',
      width: 130,
      render: (method: string) => (
        <Text style={{ fontSize: 13 }}>{PAYMENT_METHOD[method] || method}</Text>
      ),
    },
    {
      title: 'COD',
      dataIndex: 'codAmount',
      width: 130,
      align: 'right',
      render: (amount: number) => (
        amount > 0
          ? <Text strong style={{ color: '#cf1322' }}>{formatVND(amount)}</Text>
          : <Text type="secondary">—</Text>
      ),
      sorter: true,
    },
    {
      title: 'Số kiện',
      dataIndex: 'items',
      width: 80,
      align: 'center',
      render: (items: any) => {
        const count = Array.isArray(items) ? items.length : items;
        return count || '—';
      },
    },
    {
      title: 'Ngày tạo',
      dataIndex: 'createdAt',
      width: 130,
      render: (date: string) => date ? (
        <div>
          <div style={{ fontSize: 13 }}>{dayjs(date).format('DD/MM/YYYY')}</div>
          <div style={{ fontSize: 12, color: '#8c8c8c' }}>{dayjs(date).format('HH:mm')}</div>
        </div>
      ) : '—',
      sorter: true,
      defaultSortOrder: 'descend',
    },
    {
      title: '',
      key: 'actions',
      width: 48,
      fixed: 'right',
      render: (_: any, record: any) => (
        <Dropdown
          menu={{
            items: [
              { key: 'view',   icon: <Eye size={14} />,           label: 'Xem chi tiết', onClick: () => router.push(`/${locale}/orders/${record.id}`) },
              { key: 'track',  icon: <PackageSearch size={14} />, label: 'Theo dõi' },
              { key: 'label',  icon: <Printer size={14} />,       label: 'In nhãn' },
              { key: 'copy',   icon: <Copy size={14} />,          label: 'Sao chép mã VĐ' },
              { type: 'divider' },
              { key: 'cancel', icon: <CircleX size={14} />,       label: 'Hủy đơn', danger: true },
            ],
          }}
          trigger={['click']}
        >
          <Button type="text" size="small" icon={<MoreVertical size={16} />} />
        </Dropdown>
      ),
    },
  ];

  // ---- STATUS TABS ----
  const statusTabs = [
    { key: 'all',        label: 'Tất cả',        count: meta.total || 0 },
    { key: 'DRAFT',      label: 'Nháp',           count: 0,  color: undefined },
    { key: 'CONFIRMED',  label: 'Đã xác nhận',   count: 0, color: '#1677ff' },
    { key: 'PROCESSING', label: 'Đang xử lý',    count: 0, color: '#722ed1' },
    { key: 'SHIPPED',    label: 'Đã giao VC',    count: 0, color: '#13c2c2' },
    { key: 'DELIVERED',  label: 'Đã giao',       count: 0, color: '#52c41a' },
    { key: 'CANCELLED',  label: 'Đã hủy',        count: 0,  color: undefined },
  ];

  // ---- RENDER ----
  return (
    <div style={{ padding: 24 }}>
      {/* Page header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
        <div>
          <Title level={3} style={{ margin: 0 }}>Đơn hàng</Title>
          <Text type="secondary">Quản lý tất cả đơn hàng</Text>
        </div>
        <Space>
          <Button icon={<Upload size={14} />}>Nhập Excel</Button>
          <Dropdown.Button
            type="primary"
            icon={<ChevronDown size={14} />}
            menu={{
              items: [
                { key: 'single', icon: <Plus size={14} />,   label: 'Tạo đơn lẻ' },
                { key: 'bulk',   icon: <Upload size={14} />,  label: 'Nhập từ Excel/CSV' },
                { key: 'copy',   icon: <Copy size={14} />,    label: 'Tạo từ đơn cũ' },
              ],
            }}
          >
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
              <Plus size={14} /> Tạo đơn hàng
            </span>
          </Dropdown.Button>
        </Space>
      </div>

      {/* Stat cards */}
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={6}>
          <StatCard
            title="Tổng đơn tháng này"
            value={meta.total || 0}
            icon={ShoppingCart}
            iconColor="#1677ff"
            borderColor="#1677ff"
            trend={{ value: 12, direction: 'up' }}
            trendLabel="so với tháng trước"
          />
        </Col>
        <Col span={6}>
          <StatCard
            title="Chờ xử lý"
            value={0}
            icon={Clock}
            iconColor="#faad14"
            borderColor="#faad14"
            valueColor="#faad14"
            subtitle="cần xác nhận"
            onClick={() => setActiveTab('PROCESSING')}
          />
        </Col>
        <Col span={6}>
          <StatCard
            title="Đang vận chuyển"
            value={0}
            icon={Truck}
            iconColor="#1677ff"
            borderColor="#1677ff"
            subtitle="trên đường giao"
            onClick={() => setActiveTab('SHIPPED')}
          />
        </Col>
        <Col span={6}>
          <StatCard
            title="Đã giao hôm nay"
            value={0}
            icon={CircleCheck}
            iconColor="#52c41a"
            borderColor="#52c41a"
            valueColor="#52c41a"
            subtitle="thành công"
            onClick={() => setActiveTab('DELIVERED')}
          />
        </Col>
      </Row>

      {/* Main content card */}
      <Card
        styles={{ body: { padding: 0 } }}
        style={{ borderRadius: 12 }}
      >
        {/* Filter bar */}
        <div style={{ padding: '12px 16px', borderBottom: '1px solid #f0f0f0', display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
          <Input
            prefix={<Search size={14} style={{ color: '#bfbfbf' }} />}
            placeholder="Mã đơn, mã vận đơn, SĐT, tên..."
            allowClear
            style={{ width: 260, borderRadius: 8 }}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
          />
          <Select
            placeholder="Dịch vụ"
            allowClear
            style={{ width: 140 }}
            options={Object.entries(SERVICE_TYPE).map(([value, config]) => ({
              value,
              label: config.label,
            }))}
          />
          <Select
            placeholder="Thanh toán"
            allowClear
            style={{ width: 140 }}
            options={Object.entries(PAYMENT_METHOD).map(([value, label]) => ({
              value,
              label,
            }))}
          />
          <RangePicker
            placeholder={['Từ ngày', 'Đến ngày']}
            style={{ borderRadius: 8 }}
            presets={[
              { label: 'Hôm nay', value: [dayjs(), dayjs()] },
              { label: '7 ngày qua', value: [dayjs().subtract(7, 'd'), dayjs()] },
              { label: '30 ngày qua', value: [dayjs().subtract(30, 'd'), dayjs()] },
              { label: 'Tháng này', value: [dayjs().startOf('month'), dayjs()] },
            ]}
          />
          <Button type="link" icon={<X size={12} />} style={{ color: '#8c8c8c' }}>
            Xóa lọc
          </Button>
        </div>

        {/* Status tabs + table toolbar */}
        <div style={{ padding: '0 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #f0f0f0' }}>
          <Tabs
            activeKey={activeTab}
            onChange={setActiveTab}
            style={{ marginBottom: 0 }}
            items={statusTabs.map((tab) => ({
              key: tab.key,
              label: (
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                  {tab.label}
                  <Badge
                    count={tab.count}
                    showZero
                    size="small"
                    color={tab.key === activeTab ? (tab.color || '#1677ff') : '#d9d9d9'}
                    style={{ fontSize: 11 }}
                  />
                </span>
              ),
            }))}
          />
          <Space size={4}>
            <Tooltip title="Làm mới">
              <Button type="text" size="small" icon={<RefreshCw size={14} />} onClick={() => fetchOrders(meta.page)} />
            </Tooltip>
            <Tooltip title="Xuất Excel">
              <Button type="text" size="small" icon={<Download size={14} />} />
            </Tooltip>
            <Tooltip title="Tùy chỉnh cột">
              <Button type="text" size="small" icon={<Columns3 size={14} />} />
            </Tooltip>
          </Space>
        </div>

        {/* Table */}
        <Table
          columns={columns}
          dataSource={data}
          rowKey="id"
          loading={isLoading}
          rowSelection={{
            selectedRowKeys,
            onChange: setSelectedRowKeys,
          }}
          pagination={{
            current: meta.page,
            pageSize: meta.limit,
            total: meta.total,
            showTotal: (total, range) => `${range[0]}-${range[1]} / ${total} đơn hàng`,
            showSizeChanger: true,
            pageSizeOptions: ['10', '20', '50', '100'],
            style: { padding: '12px 16px', margin: 0 },
            onChange: (page) => fetchOrders(page),
          }}
          scroll={{ x: 1200 }}
          size="middle"
          locale={{
            emptyText: (
              <Empty
                image={
                  <div style={{ padding: 24 }}>
                    <Package size={64} strokeWidth={1} style={{ color: '#d9d9d9' }} />
                  </div>
                }
                description={
                  <div>
                    <Title level={5} style={{ marginBottom: 8 }}>Chưa có đơn hàng nào</Title>
                    <Text type="secondary" style={{ display: 'block', marginBottom: 16 }}>
                      Tạo đơn hàng đầu tiên để bắt đầu gửi hàng
                    </Text>
                    <Button type="primary" icon={<Plus size={14} />}>
                      Tạo đơn hàng
                    </Button>
                  </div>
                }
              />
            ),
          }}
        />
      </Card>

      {/* Bulk action bar — floating at bottom when rows selected */}
      {selectedRowKeys.length > 0 && (
        <div
          style={{
            position: 'fixed',
            bottom: 24,
            left: '50%',
            transform: 'translateX(-50%)',
            background: '#fff',
            borderRadius: 12,
            boxShadow: '0 6px 16px rgba(0,0,0,0.12), 0 3px 6px rgba(0,0,0,0.08)',
            padding: '8px 24px',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            border: '1px solid #f0f0f0',
          }}
        >
          <Text style={{ fontSize: 13 }}>
            <CircleCheck size={14} style={{ verticalAlign: -2, marginRight: 4 }} />
            Đã chọn <strong>{selectedRowKeys.length}</strong> đơn
          </Text>
          <div style={{ width: 1, height: 20, background: '#f0f0f0' }} />
          <Button size="small" icon={<Printer size={14} />}>In nhãn</Button>
          <Button size="small" icon={<Download size={14} />}>Xuất Excel</Button>
          <Button size="small" danger icon={<CircleX size={14} />}>Hủy đơn</Button>
          <div style={{ width: 1, height: 20, background: '#f0f0f0' }} />
          <Button type="text" size="small" icon={<X size={14} />} onClick={() => setSelectedRowKeys([])}>
            Bỏ chọn
          </Button>
        </div>
      )}
    </div>
  );
}
