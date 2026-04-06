import { RouterProvider } from 'react-router-dom';
import { AntdProvider } from '@/providers/antd-provider';
import { router } from '@/router';

export function App() {
  return (
    <AntdProvider>
      <RouterProvider router={router} />
    </AntdProvider>
  );
}
