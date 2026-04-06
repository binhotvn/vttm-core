'use client';

import { cn } from '@/lib/utils';

interface StatsCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  trend?: { value: number; label: string };
  icon?: React.ReactNode;
  accentColor?: 'blue' | 'yellow' | 'green' | 'red' | 'purple' | 'cyan';
  onClick?: () => void;
  loading?: boolean;
}

const accentStyles = {
  blue:   { border: 'border-l-blue-500',   iconBg: 'bg-blue-50',   iconText: 'text-blue-500' },
  yellow: { border: 'border-l-yellow-500', iconBg: 'bg-yellow-50', iconText: 'text-yellow-500' },
  green:  { border: 'border-l-green-500',  iconBg: 'bg-green-50',  iconText: 'text-green-500' },
  red:    { border: 'border-l-red-500',    iconBg: 'bg-red-50',    iconText: 'text-red-500' },
  purple: { border: 'border-l-purple-500', iconBg: 'bg-purple-50', iconText: 'text-purple-500' },
  cyan:   { border: 'border-l-cyan-500',   iconBg: 'bg-cyan-50',   iconText: 'text-cyan-500' },
};

export function StatsCard({
  title,
  value,
  subtitle,
  trend,
  icon,
  accentColor = 'blue',
  onClick,
  loading,
}: StatsCardProps) {
  const accent = accentStyles[accentColor];

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 border-l-4 border-l-gray-200">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="skeleton h-4 w-24 mb-3" />
            <div className="skeleton h-8 w-16 mb-2" />
            <div className="skeleton h-3 w-20" />
          </div>
          <div className="skeleton w-10 h-10 rounded-lg" />
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        'stat-card bg-white rounded-xl shadow-sm border border-gray-100 p-5 border-l-4',
        accent.border,
        onClick && 'cursor-pointer'
      )}
      onClick={onClick}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <p className="text-sm text-gray-500 font-medium">{title}</p>
          <p className="text-2xl font-bold mt-1 text-gray-900">{value}</p>
          <div className="flex items-center gap-2 mt-1">
            {trend && (
              <span className={cn(
                'text-xs font-medium',
                trend.value >= 0 ? 'text-green-600' : 'text-red-600'
              )}>
                {trend.value >= 0 ? '↑' : '↓'}{Math.abs(trend.value)}%
              </span>
            )}
            {subtitle && <span className="text-xs text-gray-400">{subtitle}</span>}
          </div>
        </div>
        {icon && (
          <div className={cn('w-10 h-10 rounded-lg flex items-center justify-center shrink-0', accent.iconBg, accent.iconText)}>
            {icon}
          </div>
        )}
      </div>
    </div>
  );
}
