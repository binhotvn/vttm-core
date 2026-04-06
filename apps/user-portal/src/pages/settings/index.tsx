import { Card, Form, Input, Button, Select, message, Divider } from 'antd';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '@/stores/auth-store';

export function SettingsPage() {
  const { t, i18n } = useTranslation();
  const user = useAuthStore((s) => s.user);

  return (
    <div style={{ maxWidth: 600 }}>
      <h2 style={{ marginBottom: 16 }}>{t('nav.settings')}</h2>

      <Card title={t('common.profile')} style={{ marginBottom: 16 }}>
        <Form layout="vertical" initialValues={{ email: user?.email, fullName: user?.fullName }}>
          <Form.Item name="fullName" label={t('auth.fullName')}><Input /></Form.Item>
          <Form.Item name="email" label={t('auth.email')}><Input disabled /></Form.Item>
          <Form.Item name="phone" label={t('auth.phone')}><Input /></Form.Item>
          <Button type="primary">{t('common.save')}</Button>
        </Form>
      </Card>

      <Card title={t('common.language')}>
        <Select
          value={i18n.language}
          onChange={(v) => i18n.changeLanguage(v)}
          style={{ width: 200 }}
          options={[
            { value: 'vi', label: '\uD83C\uDDFB\uD83C\uDDF3 Ti\u1EBFng Vi\u1EC7t' },
            { value: 'en', label: '\uD83C\uDDFA\uD83C\uDDF8 English' },
          ]}
        />
      </Card>
    </div>
  );
}
