export function StatsCard({ title, value, subtitle, trend }: {
  title: string;
  value: string | number;
  subtitle?: string;
  trend?: { value: number; label: string };
}) {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <p className="text-sm text-gray-500">{title}</p>
      <p className="text-3xl font-bold mt-2">{value}</p>
      {subtitle && <p className="text-xs text-gray-400 mt-1">{subtitle}</p>}
      {trend && (
        <p className={`text-xs mt-1 ${trend.value >= 0 ? 'text-green-600' : 'text-red-600'}`}>
          {trend.value >= 0 ? '+' : ''}{trend.value}% {trend.label}
        </p>
      )}
    </div>
  );
}
