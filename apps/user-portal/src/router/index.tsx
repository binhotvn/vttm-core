import { createBrowserRouter, Navigate } from 'react-router-dom';
import { AppLayout } from '@/components/layout/app-layout';
import { LoginPage } from '@/pages/login';
import { DashboardPage } from '@/pages/dashboard';
import { TrackingPage } from '@/pages/tracking';
import { OrdersPage } from '@/pages/orders';
import { ShipmentsPage } from '@/pages/shipments';
import { PickupsPage } from '@/pages/pickups';
import { ReturnsPage } from '@/pages/returns';
import { BillingPage } from '@/pages/billing';
import { SettingsPage } from '@/pages/settings';

export const router = createBrowserRouter([
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/tracking',
    element: <TrackingPage />,
  },
  {
    path: '/',
    element: <AppLayout />,
    children: [
      { index: true, element: <DashboardPage /> },
      { path: 'orders', element: <OrdersPage /> },
      { path: 'shipments', element: <ShipmentsPage /> },
      { path: 'pickups', element: <PickupsPage /> },
      { path: 'returns', element: <ReturnsPage /> },
      { path: 'billing/cod', element: <BillingPage /> },
      { path: 'settings', element: <SettingsPage /> },
    ],
  },
  {
    path: '*',
    element: <Navigate to="/" replace />,
  },
]);
