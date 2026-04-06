'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { Sidebar } from './sidebar';
import { Header } from './header';
import { Breadcrumb } from './breadcrumb';
import { BreadcrumbProvider } from './breadcrumb-context';

const SHELL_EXCLUDED_ROUTES = ['/login'];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  // Check if current route should skip the shell
  const segments = pathname.split('/').filter(Boolean);
  const routePath = '/' + segments.slice(1).join('/'); // Remove locale
  const skipShell = SHELL_EXCLUDED_ROUTES.some((r) => routePath.startsWith(r));

  // Persist sidebar state
  useEffect(() => {
    const saved = localStorage.getItem('sidebar-collapsed');
    if (saved === 'true') setCollapsed(true);
  }, []);

  const toggleSidebar = () => {
    setCollapsed((prev) => {
      localStorage.setItem('sidebar-collapsed', String(!prev));
      return !prev;
    });
  };

  if (skipShell) {
    return <>{children}</>;
  }

  return (
    <BreadcrumbProvider>
      <div className="flex h-screen overflow-hidden">
        <Sidebar collapsed={collapsed} onToggle={toggleSidebar} />
        <div className="flex flex-col flex-1 min-w-0">
          <Header onToggleSidebar={toggleSidebar} />
          <Breadcrumb />
          <main className="flex-1 overflow-auto p-6">
            {children}
          </main>
        </div>
      </div>
    </BreadcrumbProvider>
  );
}
