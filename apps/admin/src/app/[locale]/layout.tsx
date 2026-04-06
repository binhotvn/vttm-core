import { NextIntlClientProvider } from 'next-intl';
import { notFound } from 'next/navigation';
import { ConfigProvider } from 'antd';
import viVN from 'antd/locale/vi_VN';
import { routing } from '@/i18n/routing';
import { AdminLayout } from '@/components/layout/AdminLayout';

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!routing.locales.includes(locale as any)) {
    notFound();
  }

  let messages;
  try {
    messages = (await import(`@/messages/${locale}.json`)).default;
  } catch {
    notFound();
  }

  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      <ConfigProvider
        locale={viVN}
        theme={{
          token: {
            colorPrimary: '#714B67',
            borderRadius: 6,
            fontFamily: "'Inter', 'Be Vietnam Pro', -apple-system, BlinkMacSystemFont, sans-serif",
            colorLink: '#714B67',
            colorLinkHover: '#8B6085',
          },
          components: {
            Table: {
              headerBg: '#f8f9fa',
              headerColor: '#868e96',
              headerSplitColor: 'transparent',
              rowHoverBg: '#f5f0f4',
              cellPaddingBlock: 12,
              cellPaddingInline: 16,
              headerBorderRadius: 0,
              borderColor: '#e9ecef',
            },
            Card: {
              borderRadiusLG: 8,
            },
            Tag: {
              borderRadiusSM: 20,
            },
            Tabs: {
              inkBarColor: '#714B67',
              itemActiveColor: '#714B67',
              itemSelectedColor: '#714B67',
              itemHoverColor: '#8B6085',
            },
            Button: {
              controlHeight: 34,
              borderRadius: 6,
            },
            Input: {
              controlHeight: 34,
            },
            Select: {
              controlHeight: 34,
            },
          },
        }}
      >
        <AdminLayout>{children}</AdminLayout>
      </ConfigProvider>
    </NextIntlClientProvider>
  );
}
