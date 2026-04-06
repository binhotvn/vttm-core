import { Card, Col, Row, Statistic } from 'antd';
import { ShoppingCartOutlined, CarOutlined, CheckCircleOutlined, DollarOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';

export function DashboardPage() {
  const { t } = useTranslation();

  return (
    <div>
      <h2>{t('dashboard.title')}</h2>
      <Row gutter={16} style={{ marginTop: 16 }}>
        <Col span={6}>
          <Card><Statistic title={t('dashboard.inTransit')} value={0} prefix={<CarOutlined />} /></Card>
        </Col>
        <Col span={6}>
          <Card><Statistic title={t('dashboard.delivered')} value={0} prefix={<CheckCircleOutlined />} /></Card>
        </Col>
        <Col span={6}>
          <Card><Statistic title={t('dashboard.exceptions')} value={0} prefix={<ShoppingCartOutlined />} /></Card>
        </Col>
        <Col span={6}>
          <Card><Statistic title={t('dashboard.pendingCOD')} value={0} prefix={<DollarOutlined />} suffix="₫" /></Card>
        </Col>
      </Row>
    </div>
  );
}
