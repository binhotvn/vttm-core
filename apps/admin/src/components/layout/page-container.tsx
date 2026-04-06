'use client';

import { cn } from '@/lib/utils';

interface PageContainerProps {
  title: string;
  description?: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

export function PageContainer({ title, description, actions, children, className }: PageContainerProps) {
  return (
    <div className={cn('animate-fade-in', className)}>
      {/* Page header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-gray-900">{title}</h1>
          {description && (
            <p className="mt-0.5 text-sm text-gray-500">{description}</p>
          )}
        </div>
        {actions && <div className="flex items-center gap-2 shrink-0">{actions}</div>}
      </div>
      {children}
    </div>
  );
}
