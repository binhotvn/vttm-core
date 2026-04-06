import { useEffect, useState } from 'react';
import { Table, Tag, Input } from 'antd';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { StatusTag } from '@/components/shared/status-tag';
import apiClient from '@/lib/api-client';

export function ShipmentsPage() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);

  const fetchShipments = async (p = 1) => {
    setLoading(true);
    try {
      const res = await apiClient.get(`/shipments?page=${p}&limit=10`);
      const result = res.data.data;
      setData(result.data || []);
      setTotal(result.meta?.total || 0);
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  useEffect(() => { fetchShipments(page); }, [page]);

  const columns = [
    { title: 'Tracking', dataIndex: 'trackingNumber', key: 'tracking', render: (v: string) => <span style={{ fontFamily: 'monospace', color: '#1677ff' }}>{v}</span> },
    { title: 'Status', dataIndex: 'status', key: 'status', render: (s: string) => <StatusTag status={s} lang={i18n.language} /> },
    { title: 'Weight', dataIndex: 'weightKg', key: 'weight', render: (v: number) => `${v}kg` },
    { title: 'COD', dataIndex: 'codAmount', key: 'cod', render: (v: number) => Number(v) > 0 ? <Tag color="orange">{Number(v).toLocaleString('vi-VN')}₫</Tag> : '—' },
    { title: 'Service', dataIndex: 'serviceType', key: 'service' },
  ];

  return (
    <div>
      <h2 style={{ marginBottom: 16 }}>{t('nav.shipments')}</h2>
      <Table
        dataSource={data}
        columns={columns}
        rowKey="id"
        loading={loading}
        pagination={{ total, current: page, pageSize: 10, onChange: setPage }}
        onRow={(record) => ({ onClick: () => navigate(`/shipments/${record.id}`) })}
      />
    </div>
  );
}
