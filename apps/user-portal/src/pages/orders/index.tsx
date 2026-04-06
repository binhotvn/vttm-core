import { useEffect, useState } from 'react';
import { Table, Button, Space, Card, Input } from 'antd';
import { PlusOutlined, SearchOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { StatusTag } from '@/components/shared/status-tag';
import apiClient from '@/lib/api-client';

export function OrdersPage() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);

  const fetchOrders = async (p = 1) => {
    setLoading(true);
    try {
      const res = await apiClient.get(`/orders?page=${p}&limit=10`);
      const result = res.data.data;
      setData(result.data || []);
      setTotal(result.meta?.total || 0);
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  useEffect(() => { fetchOrders(page); }, [page]);

  const columns = [
    { title: t('nav.orders') + ' #', dataIndex: 'orderNumber', key: 'orderNumber' },
    { title: 'Status', dataIndex: 'status', key: 'status', render: (s: string) => <StatusTag status={s} lang={i18n.language} /> },
    { title: 'COD', dataIndex: 'codAmount', key: 'cod', render: (v: number) => `${Number(v).toLocaleString('vi-VN')}₫` },
    { title: 'Service', dataIndex: 'serviceType', key: 'service' },
    { title: 'Created', dataIndex: 'createdAt', key: 'created', render: (d: string) => new Date(d).toLocaleDateString('vi-VN') },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <h2>{t('nav.orders')}</h2>
        <Button type="primary" icon={<PlusOutlined />}>{t('common.create')}</Button>
      </div>
      <Table
        dataSource={data}
        columns={columns}
        rowKey="id"
        loading={loading}
        pagination={{ total, current: page, pageSize: 10, onChange: setPage }}
        onRow={(record) => ({ onClick: () => navigate(`/orders/${record.id}`) })}
        style={{ cursor: 'pointer' }}
      />
    </div>
  );
}
