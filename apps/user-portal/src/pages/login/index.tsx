import { Form, Input, Button, Card, message } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/auth-store';

export function LoginPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const login = useAuthStore((s) => s.login);

  const onFinish = async (values: { email: string; password: string }) => {
    try {
      await login(values.email, values.password);
      navigate('/');
    } catch {
      message.error(t('auth.invalidCredentials'));
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f0f2f5' }}>
      <Card title={t('auth.login')} style={{ width: 400 }}>
        <Form onFinish={onFinish} layout="vertical">
          <Form.Item name="email" label={t('auth.email')} rules={[{ required: true, type: 'email' }]}>
            <Input prefix={<UserOutlined />} />
          </Form.Item>
          <Form.Item name="password" label={t('auth.password')} rules={[{ required: true }]}>
            <Input.Password prefix={<LockOutlined />} />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" block>{t('auth.submit')}</Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
}
