import { useEffect, useState } from 'react';
import { Table, Button } from 'antd';
import { useTranslation } from 'react-i18next';
import { StatusTag } from '@/components/shared/status-tag';
import apiClient from '@/lib/api-client';

export function ReturnsPage() {
  const { t, i18n } = useTranslation();
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await apiClient.get('/returns?limit=20');
        const result = res.data.data;
        setData(result.data || []);
      } catch (e) { console.error(e); }
      setLoading(false);
    };
    load();
  }, []);

  const columns = [
    { title: 'Return #', dataIndex: 'returnNumber', key: 'num' },
    { title: 'Status', dataIndex: 'status', key: 'status', render: (s: string) => <StatusTag status={s} lang={i18n.language} /> },
    { title: i18n.language === 'vi' ? 'L\u00FD do' : 'Reason', dataIndex: 'reason', render: (v: string) => v?.replace(/_/g, ' ') },
    { title: i18n.language === 'vi' ? 'Ph\u00ED ho\u00E0n' : 'Fee', dataIndex: 'returnFee', render: (v: number) => `${Number(v).toLocaleString('vi-VN')}\u20AB` },
    { title: 'Created', dataIndex: 'createdAt', render: (d: string) => new Date(d).toLocaleDateString('vi-VN') },
  ];

  return (
    <div>
      <h2 style={{ marginBottom: 16 }}>{t('nav.returns')}</h2>
      <Table dataSource={data} columns={columns} rowKey="id" loading={loading} />
    </div>
  );
}
