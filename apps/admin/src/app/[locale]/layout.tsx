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
            colorPrimary: '#1677ff',
            borderRadius: 8,
            fontFamily: "'Inter', 'Be Vietnam Pro', -apple-system, BlinkMacSystemFont, sans-serif",
          },
          components: {
            Table: {
              headerBg: '#fafafa',
              headerColor: '#8c8c8c',
              headerSplitColor: 'transparent',
              rowHoverBg: '#f5f8ff',
              cellPaddingBlock: 12,
              cellPaddingInline: 16,
              headerBorderRadius: 0,
            },
            Menu: {
              darkItemBg: 'transparent',
              darkItemSelectedBg: 'rgba(255, 255, 255, 0.08)',
              darkItemHoverBg: 'rgba(255, 255, 255, 0.04)',
              itemBorderRadius: 8,
              itemMarginInline: 8,
              itemHeight: 40,
              iconSize: 18,
            },
            Card: {
              borderRadiusLG: 12,
            },
            Tag: {
              borderRadiusSM: 12,
            },
            Button: {
              controlHeight: 36,
            },
            Input: {
              controlHeight: 36,
            },
            Select: {
              controlHeight: 36,
            },
          },
        }}
      >
        <AdminLayout>{children}</AdminLayout>
      </ConfigProvider>
    </NextIntlClientProvider>
  );
}
