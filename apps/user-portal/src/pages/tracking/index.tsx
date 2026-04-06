import { useState } from 'react';
import { Input, Card, Steps, Descriptions, Empty, Spin, Tag } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import apiClient from '@/lib/api-client';

export function TrackingPage() {
  const { t, i18n } = useTranslation();
  const [trackingNumber, setTrackingNumber] = useState('');
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleTrack = async (value: string) => {
    if (!value.trim()) return;
    setLoading(true);
    setError('');
    setResult(null);
    try {
      const res = await apiClient.get(`/tracking/${value}?lang=${i18n.language}`);
      setResult(res.data.data);
    } catch {
      setError(t('tracking.notFound'));
    }
    setLoading(false);
  };

  return (
    <div style={{ maxWidth: 700, margin: '0 auto', paddingTop: 40 }}>
      <h2 style={{ textAlign: 'center', marginBottom: 24 }}>{t('tracking.title')}</h2>
      <Input.Search
        size="large"
        placeholder={t('tracking.placeholder')}
        enterButton={t('tracking.submit')}
        prefix={<SearchOutlined />}
        value={trackingNumber}
        onChange={(e) => setTrackingNumber(e.target.value)}
        onSearch={handleTrack}
        loading={loading}
      />

      {loading && <div style={{ textAlign: 'center', marginTop: 40 }}><Spin size="large" /></div>}

      {error && <Card style={{ marginTop: 24 }}><Empty description={error} /></Card>}

      {result && (
        <div style={{ marginTop: 24 }}>
          <Card>
            <Descriptions bordered size="small" column={2}>
              <Descriptions.Item label="Tracking">{result.trackingNumber}</Descriptions.Item>
              <Descriptions.Item label="Status">
                <Tag color={result.statusColor}>{result.statusLabel}</Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Service">{result.serviceType}</Descriptions.Item>
              <Descriptions.Item label="From">{result.senderAddress?.provinceName}</Descriptions.Item>
              <Descriptions.Item label="To">{result.recipientAddress?.provinceName}</Descriptions.Item>
              {result.estimatedDeliveryDate && (
                <Descriptions.Item label="ETA">{new Date(result.estimatedDeliveryDate).toLocaleDateString('vi-VN')}</Descriptions.Item>
              )}
            </Descriptions>
          </Card>

          <Card title={i18n.language === 'vi' ? 'L\u1ECBch s\u1EED v\u1EADn chuy\u1EC3n' : 'Tracking History'} style={{ marginTop: 16 }}>
            <Steps
              direction="vertical"
              size="small"
              current={0}
              items={result.events?.map((event: any, idx: number) => ({
                title: event.title,
                description: (
                  <div>
                    {event.location && <div style={{ fontSize: 12, color: '#666' }}>{event.location}</div>}
                    <div style={{ fontSize: 11, color: '#999' }}>{new Date(event.timestamp).toLocaleString('vi-VN')}</div>
                  </div>
                ),
                status: idx === 0 ? 'process' as const : 'finish' as const,
              })) || []}
            />
          </Card>
        </div>
      )}
    </div>
  );
}
