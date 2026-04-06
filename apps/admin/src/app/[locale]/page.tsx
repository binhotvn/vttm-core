import { useTranslations } from 'next-intl';

export default function DashboardPage() {
  const t = useTranslations('dashboard');

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">{t('title')}</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-sm text-gray-500">{t('totalOrders')}</p>
          <p className="text-3xl font-bold mt-2">0</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-sm text-gray-500">{t('totalShipments')}</p>
          <p className="text-3xl font-bold mt-2">0</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-sm text-gray-500">{t('deliveryRate')}</p>
          <p className="text-3xl font-bold mt-2">0%</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-sm text-gray-500">{t('pendingCOD')}</p>
          <p className="text-3xl font-bold mt-2">0₫</p>
        </div>
      </div>
    </div>
  );
}
