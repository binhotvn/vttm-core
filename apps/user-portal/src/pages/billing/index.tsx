import { useEffect, useState } from 'react';
import { Card, Statistic, Row, Col, Table, Empty } from 'antd';
import { DollarOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import apiClient from '@/lib/api-client';

export function BillingPage() {
  const { t, i18n } = useTranslation();
  const [summary, setSummary] = useState<any>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await apiClient.get('/cod/daily');
        setSummary(res.data.data);
      } catch (e) { console.error(e); }
    };
    load();
  }, []);

  return (
    <div>
      <h2 style={{ marginBottom: 16 }}>{t('nav.cod')}</h2>
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={8}>
          <Card><Statistic title={i18n.language === 'vi' ? 'T\u1ED5ng COD thu' : 'Total Collected'} value={summary?.totals?.collectedTotal || 0} prefix={<DollarOutlined />} suffix="\u20AB" /></Card>
        </Col>
        <Col span={8}>
          <Card><Statistic title={i18n.language === 'vi' ? 'T\u1ED5ng d\u1EF1 ki\u1EBFn' : 'Expected'} value={summary?.totals?.expectedTotal || 0} suffix="\u20AB" /></Card>
        </Col>
        <Col span={8}>
          <Card><Statistic title={i18n.language === 'vi' ? '\u0110\u01A1n h\u00E0ng' : 'Shipments'} value={summary?.totals?.shipmentCount || 0} /></Card>
        </Col>
      </Row>
      {summary?.drivers?.length > 0 ? (
        <Table
          dataSource={summary.drivers}
          rowKey="driverId"
          columns={[
            { title: 'Driver', dataIndex: 'driverId', render: (v: string) => v.slice(0, 8) + '...' },
            { title: i18n.language === 'vi' ? '\u0110\u01A1n' : 'Shipments', dataIndex: 'shipmentCount' },
            { title: i18n.language === 'vi' ? 'Thu h\u1ED9' : 'Collected', dataIndex: 'collectedTotal', render: (v: number) => `${v.toLocaleString('vi-VN')}\u20AB` },
            { title: i18n.language === 'vi' ? 'Ph\u00ED COD' : 'COD Fee', dataIndex: 'codFeeTotal', render: (v: number) => `${v.toLocaleString('vi-VN')}\u20AB` },
            { title: i18n.language === 'vi' ? 'Th\u1EF1c nh\u1EADn' : 'Net', dataIndex: 'netTransferTotal', render: (v: number) => `${v.toLocaleString('vi-VN')}\u20AB` },
          ]}
          pagination={false}
        />
      ) : (
        <Card><Empty description={i18n.language === 'vi' ? 'Ch\u01B0a c\u00F3 d\u1EEF li\u1EC7u COD' : 'No COD data yet'} /></Card>
      )}
    </div>
  );
}
