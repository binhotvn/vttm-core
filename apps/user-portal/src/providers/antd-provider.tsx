import { ConfigProvider, App as AntApp } from 'antd';
import viVN from 'antd/locale/vi_VN';
import enUS from 'antd/locale/en_US';
import { useTranslation } from 'react-i18next';
import { antdTheme } from '@/theme/antd-theme';

export function AntdProvider({ children }: { children: React.ReactNode }) {
  const { i18n } = useTranslation();
  const locale = i18n.language === 'en' ? enUS : viVN;

  return (
    <ConfigProvider theme={antdTheme} locale={locale}>
      <AntApp>{children}</AntApp>
    </ConfigProvider>
  );
}
