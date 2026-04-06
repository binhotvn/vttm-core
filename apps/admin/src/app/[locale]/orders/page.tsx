'use client';

import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import {
  Table, Tag, Badge, Button, Input, Select, DatePicker,
  Space, Tabs, Dropdown, Tooltip, message, Empty, Typography,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import {
  ShoppingCart, Clock, Truck, CircleCheck, CircleDot,
  Plus, Upload, ChevronDown, Search, X, RefreshCw, Download,
  Columns3, Eye, PackageSearch, Printer, Copy, CircleX,
  MoreVertical, Phone, MapPin, Zap, Timer, Flame, Rocket,
  Wallet, Package, List, LayoutGrid,
} from 'lucide-react';
import dayjs from 'dayjs';
import { apiFetch, getTokenFromCookie } from '@/lib/api-client';

const { RangePicker } = DatePicker;
const { Title, Text } = Typography;

// ============================================================
// STATUS & SERVICE CONFIGS
// ============================================================

const ORDER_STATUS: Record<string, { label: string; color: string; icon: any }> = {
  DRAFT:       { label: 'Nháp',                color: 'default',    icon: CircleDot },
  CONFIRMED:   { label: 'Đã xác nhận',         color: '#8854d0',    icon: CircleCheck },
  PROCESSING:  { label: 'Đang xử lý',          color: '#714B67',    icon: RefreshCw },
  SHIPPED:     { label: 'Đã giao vận chuyển',   color: '#2d98da',    icon: Truck },
  DELIVERED:   { label: 'Đã giao',              color: '#20bf6b',    icon: CircleCheck },
  CANCELLED:   { label: 'Đã hủy',              color: 'default',    icon: CircleX },
};

const SERVICE_TYPE: Record<string, { label: string; color: string; icon: any }> = {
  STANDARD:  { label: 'Tiêu chuẩn', color: 'default', icon: Timer },
  EXPRESS:   { label: 'Nhanh',       color: '#714B67', icon: Zap },
  SAME_DAY:  { label: 'Trong ngày',  color: '#e8590c', icon: Flame },
  ECONOMY:   { label: 'Tiết kiệm',  color: '#20bf6b', icon: Wallet },
  OVERNIGHT: { label: 'Hỏa tốc',    color: '#8854d0', icon: Rocket },
};

const PAYMENT_METHOD: Record<string, string> = {
  PREPAID: 'Đã thanh toán',
  COD:     'Thu hộ (COD)',
  BILLED:  'Trả sau',
};

// ============================================================
// HELPERS
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
// STATUS TAG
// ============================================================

function StatusTag({ status, map }: { status: string; map: Record<string, any> }) {
  const config = map[status];
  if (!config) return <Tag>{status}</Tag>;
  const IconComp = config.icon;
  return (
    <Tag
      color={config.color}
      style={{
        borderRadius: 20,
        padding: '2px 10px',
        display: 'inline-flex',
        alignItems: 'center',
        gap: 4,
        fontSize: 12,
      }}
    >
      {IconComp && <IconComp size={12} strokeWidth={2} />}
      {config.label}
    </Tag>
  );
}

// ============================================================
// KPI PILL
// ============================================================

function KpiPill({
  label, value, active, color, onClick,
}: {
  label: string;
  value: number;
  active?: boolean;
  color?: string;
  onClick?: () => void;
}) {
  return (
    <div
      onClick={onClick}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 8,
        padding: '6px 16px',
        borderRadius: 20,
        border: `1px solid ${active ? (color || '#714B67') : '#e0e0e0'}`,
        background: active ? `${color || '#714B67'}10` : '#fff',
        cursor: 'pointer',
        transition: 'all 0.15s',
        fontSize: 13,
        fontWeight: active ? 600 : 400,
        color: active ? (color || '#714B67') : '#495057',
      }}
    >
      {label}
      <span style={{
        background: active ? (color || '#714B67') : '#e9ecef',
        color: active ? '#fff' : '#495057',
        borderRadius: 10,
        padding: '1px 8px',
        fontSize: 12,
        fontWeight: 600,
        minWidth: 20,
        textAlign: 'center',
      }}>
        {value}
      </span>
    </div>
  );
}

// ============================================================
// MAIN PAGE
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
            style={{ fontWeight: 600, color: '#714B67' }}
            onClick={() => router.push(`/${locale}/orders/${record.id}`)}
          >
            {val}
          </a>
          {record.trackingNumber && (
            <div style={{ fontSize: 12, color: '#868e96', marginTop: 2, display: 'flex', alignItems: 'center', gap: 4 }}>
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
            <div style={{ fontSize: 12, color: '#868e96', marginTop: 2, display: 'flex', alignItems: 'center', gap: 3 }}>
              <Phone size={11} strokeWidth={1.5} />
              {formatPhone(record.recipientPhone)}
            </div>
          )}
          {record.recipientDistrict && (
            <div style={{ fontSize: 12, color: '#adb5bd', display: 'flex', alignItems: 'center', gap: 3 }}>
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
          ? <Text strong style={{ color: '#c92a2a' }}>{formatVND(amount)}</Text>
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
          <div style={{ fontSize: 12, color: '#868e96' }}>{dayjs(date).format('HH:mm')}</div>
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
    { key: 'all',        label: 'Tất cả',       count: meta.total || 0 },
    { key: 'DRAFT',      label: 'Nháp',          count: 0 },
    { key: 'CONFIRMED',  label: 'Đã xác nhận',  count: 0 },
    { key: 'PROCESSING', label: 'Đang xử lý',   count: 0 },
    { key: 'SHIPPED',    label: 'Đã giao VC',   count: 0 },
    { key: 'DELIVERED',  label: 'Đã giao',      count: 0 },
    { key: 'CANCELLED',  label: 'Đã hủy',       count: 0 },
  ];

  return (
    <div>
      {/* ── Control Panel ── */}
      <div
        style={{
          background: '#fff',
          padding: '12px 24px',
          borderBottom: '1px solid #dee2e6',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Title level={4} style={{ margin: 0, color: '#212529' }}>Đơn hàng</Title>
        <Space>
          <Button icon={<Upload size={14} />}>Nhập Excel</Button>
          <Dropdown.Button
            type="primary"
            icon={<ChevronDown size={14} />}
            menu={{
              items: [
                { key: 'single', icon: <Plus size={14} />,  label: 'Tạo đơn lẻ' },
                { key: 'bulk',   icon: <Upload size={14} />, label: 'Nhập từ Excel/CSV' },
                { key: 'copy',   icon: <Copy size={14} />,   label: 'Tạo từ đơn cũ' },
              ],
            }}
          >
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
              <Plus size={14} /> Tạo mới
            </span>
          </Dropdown.Button>
          {/* View switcher */}
          <div style={{ display: 'flex', border: '1px solid #dee2e6', borderRadius: 6, overflow: 'hidden' }}>
            <Tooltip title="Danh sách">
              <div style={{ padding: '5px 10px', background: '#714B67', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                <List size={16} />
              </div>
            </Tooltip>
            <Tooltip title="Kanban">
              <div style={{ padding: '5px 10px', background: '#fff', color: '#868e96', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                <LayoutGrid size={16} />
              </div>
            </Tooltip>
          </div>
        </Space>
      </div>

      {/* ── KPI Pills ── */}
      <div style={{ background: '#fff', padding: '12px 24px', borderBottom: '1px solid #dee2e6', display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <KpiPill label="Tổng đơn"      value={meta.total || 0} active={activeTab === 'all'}        color="#714B67" onClick={() => setActiveTab('all')} />
        <KpiPill label="Chờ xử lý"     value={0}               active={activeTab === 'PROCESSING'} color="#e8590c" onClick={() => setActiveTab('PROCESSING')} />
        <KpiPill label="Đang giao"      value={0}               active={activeTab === 'SHIPPED'}    color="#2d98da" onClick={() => setActiveTab('SHIPPED')} />
        <KpiPill label="Đã giao"        value={0}               active={activeTab === 'DELIVERED'}  color="#20bf6b" onClick={() => setActiveTab('DELIVERED')} />
        <KpiPill label="Đã hủy"         value={0}               active={activeTab === 'CANCELLED'}  color="#868e96" onClick={() => setActiveTab('CANCELLED')} />
      </div>

      {/* ── Search & Filter Bar ── */}
      <div style={{ background: '#fff', padding: '10px 24px', borderBottom: '1px solid #dee2e6', display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
        <Input
          prefix={<Search size={14} style={{ color: '#adb5bd' }} />}
          placeholder="Tìm kiếm đơn hàng..."
          allowClear
          style={{ width: 260, borderRadius: 6 }}
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
        />
        <Select
          placeholder="Dịch vụ"
          allowClear
          style={{ width: 140 }}
          options={Object.entries(SERVICE_TYPE).map(([value, c]) => ({ value, label: c.label }))}
        />
        <Select
          placeholder="Thanh toán"
          allowClear
          style={{ width: 140 }}
          options={Object.entries(PAYMENT_METHOD).map(([value, label]) => ({ value, label }))}
        />
        <RangePicker
          placeholder={['Từ ngày', 'Đến ngày']}
          style={{ borderRadius: 6 }}
          presets={[
            { label: 'Hôm nay', value: [dayjs(), dayjs()] },
            { label: '7 ngày qua', value: [dayjs().subtract(7, 'd'), dayjs()] },
            { label: '30 ngày qua', value: [dayjs().subtract(30, 'd'), dayjs()] },
            { label: 'Tháng này', value: [dayjs().startOf('month'), dayjs()] },
          ]}
        />
        <Button type="link" icon={<X size={12} />} style={{ color: '#868e96' }}>Xóa lọc</Button>

        <div style={{ flex: 1 }} />

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

      {/* ── Status Tabs ── */}
      <div style={{ background: '#fff', padding: '0 24px', borderBottom: '1px solid #dee2e6' }}>
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
                  color={tab.key === activeTab ? '#714B67' : '#dee2e6'}
                  style={{ fontSize: 11 }}
                />
              </span>
            ),
          }))}
        />
      </div>

      {/* ── Table ── */}
      <div style={{ padding: '0 24px 24px' }}>
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
            style: { padding: '12px 0', margin: 0 },
            onChange: (page) => fetchOrders(page),
          }}
          scroll={{ x: 1200 }}
          size="middle"
          style={{ background: '#fff', borderRadius: '0 0 8px 8px' }}
          locale={{
            emptyText: (
              <Empty
                image={
                  <div style={{ padding: 24 }}>
                    <Package size={64} strokeWidth={1} style={{ color: '#dee2e6' }} />
                  </div>
                }
                description={
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 16, marginBottom: 8, color: '#495057' }}>
                      Chưa có đơn hàng nào
                    </div>
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
      </div>

      {/* ── Bulk Action Bar ── */}
      {selectedRowKeys.length > 0 && (
        <div
          style={{
            position: 'fixed',
            bottom: 24,
            left: '50%',
            transform: 'translateX(-50%)',
            background: '#714B67',
            borderRadius: 10,
            boxShadow: '0 8px 24px rgba(113,75,103,0.3)',
            padding: '8px 24px',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            color: '#fff',
          }}
        >
          <Text style={{ fontSize: 13, color: '#fff' }}>
            Đã chọn <strong>{selectedRowKeys.length}</strong> đơn
          </Text>
          <div style={{ width: 1, height: 20, background: 'rgba(255,255,255,0.2)' }} />
          <Button size="small" ghost icon={<Printer size={14} />}>In nhãn</Button>
          <Button size="small" ghost icon={<Download size={14} />}>Xuất Excel</Button>
          <Button size="small" ghost danger icon={<CircleX size={14} />}>Hủy đơn</Button>
          <div style={{ width: 1, height: 20, background: 'rgba(255,255,255,0.2)' }} />
          <Button type="text" size="small" icon={<X size={14} />} style={{ color: 'rgba(255,255,255,0.7)' }} onClick={() => setSelectedRowKeys([])}>
            Bỏ chọn
          </Button>
        </div>
      )}
    </div>
  );
}
