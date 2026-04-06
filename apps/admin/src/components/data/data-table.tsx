'use client';

import { useState } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  RefreshCw,
  Download,
  CheckCircle,
  Printer,
  XCircle,
  X,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface Column<T> {
  key: string;
  header: string;
  render?: (item: T) => React.ReactNode;
  sortable?: boolean;
  width?: string;
  align?: 'left' | 'center' | 'right';
  fixed?: 'left' | 'right';
}

interface BulkAction {
  key: string;
  label: string;
  icon?: React.ReactNode;
  danger?: boolean;
  onClick: (selectedIds: string[]) => void;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  total?: number;
  page?: number;
  limit?: number;
  onPageChange?: (page: number) => void;
  onLimitChange?: (limit: number) => void;
  onRowClick?: (item: T) => void;
  onRefresh?: () => void;
  onExport?: () => void;
  loading?: boolean;
  emptyText?: string;
  emptyContent?: React.ReactNode;
  selectable?: boolean;
  bulkActions?: BulkAction[];
  showToolbar?: boolean;
  stickyHeader?: boolean;
  showingLabel?: string;
  ofLabel?: string;
  unitLabel?: string;
}

function SkeletonRows({ columns, rows = 5 }: { columns: number; rows?: number }) {
  return (
    <>
      {Array.from({ length: rows }).map((_, ri) => (
        <tr key={ri} className="border-b border-gray-50">
          {Array.from({ length: columns }).map((_, ci) => (
            <td key={ci} className="px-4 py-3.5">
              <div className="skeleton h-4 rounded" style={{ width: `${50 + Math.random() * 40}%` }} />
              {ci < 3 && (
                <div className="skeleton h-3 rounded mt-2" style={{ width: `${30 + Math.random() * 30}%` }} />
              )}
            </td>
          ))}
        </tr>
      ))}
    </>
  );
}

export function DataTable<T extends Record<string, any>>({
  columns,
  data,
  total = 0,
  page = 1,
  limit = 20,
  onPageChange,
  onLimitChange,
  onRowClick,
  onRefresh,
  onExport,
  loading,
  emptyText = 'Không có dữ liệu',
  emptyContent,
  selectable = false,
  bulkActions = [],
  showToolbar = true,
  stickyHeader = false,
  showingLabel = 'Hiển thị',
  ofLabel = '/',
  unitLabel = '',
}: DataTableProps<T>) {
  const [selectedKeys, setSelectedKeys] = useState<Set<string>>(new Set());
  const totalPages = Math.ceil(total / limit);
  const allIds = data.map((item) => item.id as string);
  const allSelected = allIds.length > 0 && allIds.every((id) => selectedKeys.has(id));
  const someSelected = allIds.some((id) => selectedKeys.has(id));

  const toggleAll = () => {
    if (allSelected) {
      setSelectedKeys(new Set());
    } else {
      setSelectedKeys(new Set(allIds));
    }
  };

  const toggleRow = (id: string) => {
    const next = new Set(selectedKeys);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedKeys(next);
  };

  const clearSelection = () => setSelectedKeys(new Set());

  const rangeStart = Math.min((page - 1) * limit + 1, total);
  const rangeEnd = Math.min(page * limit, total);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      {/* Toolbar */}
      {showToolbar && (
        <div className="flex items-center justify-between px-4 py-2.5 border-b border-gray-100">
          <div className="text-sm text-gray-500">
            {selectable && selectedKeys.size > 0 ? (
              <span className="flex items-center gap-1.5 font-medium text-blue-600">
                <CheckCircle size={14} />
                {selectedKeys.size} đã chọn
              </span>
            ) : (
              total > 0 && <span>{showingLabel} {rangeStart}–{rangeEnd} {ofLabel} {total} {unitLabel}</span>
            )}
          </div>
          <div className="flex items-center gap-1">
            {onRefresh && (
              <button
                onClick={onRefresh}
                className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-50 transition-colors"
                title="Làm mới"
              >
                <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
              </button>
            )}
            {onExport && (
              <button
                onClick={onExport}
                className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-50 transition-colors"
                title="Xuất file"
              >
                <Download size={16} />
              </button>
            )}
          </div>
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead className={cn(
            'bg-gray-50/80',
            stickyHeader && 'sticky top-0 z-10'
          )}>
            <tr>
              {selectable && (
                <th className="w-12 px-4 py-3">
                  <input
                    type="checkbox"
                    checked={allSelected}
                    ref={(el) => { if (el) el.indeterminate = someSelected && !allSelected; }}
                    onChange={toggleAll}
                    className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                  />
                </th>
              )}
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={cn(
                    'px-4 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500',
                    col.align === 'right' ? 'text-right' : col.align === 'center' ? 'text-center' : 'text-left'
                  )}
                  style={col.width ? { width: col.width } : undefined}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {loading ? (
              <SkeletonRows columns={(selectable ? 1 : 0) + columns.length} />
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={(selectable ? 1 : 0) + columns.length} className="px-4 py-16 text-center">
                  {emptyContent || (
                    <div className="text-gray-400">
                      <div className="text-4xl mb-3">📦</div>
                      <p className="text-sm font-medium">{emptyText}</p>
                    </div>
                  )}
                </td>
              </tr>
            ) : (
              data.map((item, idx) => {
                const isSelected = selectable && selectedKeys.has(item.id);
                return (
                  <tr
                    key={item.id || idx}
                    className={cn(
                      'table-row-hover',
                      isSelected && 'bg-blue-50/50',
                      onRowClick && 'cursor-pointer'
                    )}
                    onClick={(e) => {
                      // Don't trigger row click when clicking checkbox or action buttons
                      if ((e.target as HTMLElement).closest('input, button, a, [role="menuitem"]')) return;
                      onRowClick?.(item);
                    }}
                  >
                    {selectable && (
                      <td className="w-12 px-4 py-3">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleRow(item.id)}
                          onClick={(e) => e.stopPropagation()}
                          className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                        />
                      </td>
                    )}
                    {columns.map((col) => (
                      <td
                        key={col.key}
                        className={cn(
                          'px-4 py-3 text-sm text-gray-900',
                          col.align === 'right' ? 'text-right' : col.align === 'center' ? 'text-center' : 'text-left'
                        )}
                      >
                        {col.render ? col.render(item) : item[col.key]}
                      </td>
                    ))}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 0 && !loading && (
        <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100">
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <span>{showingLabel} {rangeStart}–{rangeEnd} {ofLabel} {total} {unitLabel}</span>
            {onLimitChange && (
              <select
                value={limit}
                onChange={(e) => onLimitChange(Number(e.target.value))}
                className="ml-2 border border-gray-200 rounded-md text-sm px-2 py-1 bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                {[10, 20, 50, 100].map((n) => (
                  <option key={n} value={n}>{n} / trang</option>
                ))}
              </select>
            )}
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => onPageChange?.(1)}
              disabled={page <= 1}
              className="p-1.5 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronsLeft size={16} />
            </button>
            <button
              onClick={() => onPageChange?.(page - 1)}
              disabled={page <= 1}
              className="p-1.5 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft size={16} />
            </button>
            {/* Page numbers */}
            {generatePageNumbers(page, totalPages).map((p, i) =>
              p === '...' ? (
                <span key={`dots-${i}`} className="px-1 text-gray-400 text-sm">...</span>
              ) : (
                <button
                  key={p}
                  onClick={() => onPageChange?.(p as number)}
                  className={cn(
                    'min-w-[32px] h-8 rounded-md text-sm font-medium transition-colors',
                    p === page
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-600 hover:bg-gray-100'
                  )}
                >
                  {p}
                </button>
              )
            )}
            <button
              onClick={() => onPageChange?.(page + 1)}
              disabled={page >= totalPages}
              className="p-1.5 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight size={16} />
            </button>
            <button
              onClick={() => onPageChange?.(totalPages)}
              disabled={page >= totalPages}
              className="p-1.5 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronsRight size={16} />
            </button>
          </div>
        </div>
      )}

      {/* Bulk action bar */}
      {selectable && selectedKeys.size > 0 && bulkActions.length > 0 && (
        <div className="bulk-action-bar">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1.5 text-sm font-medium text-gray-700">
              <CheckCircle size={16} className="text-blue-600" />
              {selectedKeys.size} đã chọn
            </span>
            <div className="w-px h-5 bg-gray-200" />
            {bulkActions.map((action) => (
              <button
                key={action.key}
                onClick={() => action.onClick(Array.from(selectedKeys))}
                className={cn(
                  'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors',
                  action.danger
                    ? 'text-red-600 hover:bg-red-50'
                    : 'text-gray-700 hover:bg-gray-100'
                )}
              >
                {action.icon}
                {action.label}
              </button>
            ))}
            <div className="w-px h-5 bg-gray-200" />
            <button
              onClick={clearSelection}
              className="flex items-center gap-1 px-2 py-1.5 rounded-lg text-sm text-gray-500 hover:bg-gray-100 transition-colors"
            >
              <X size={14} />
              Bỏ chọn
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function generatePageNumbers(current: number, total: number): (number | string)[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);

  const pages: (number | string)[] = [1];

  if (current > 3) pages.push('...');

  const start = Math.max(2, current - 1);
  const end = Math.min(total - 1, current + 1);

  for (let i = start; i <= end; i++) {
    pages.push(i);
  }

  if (current < total - 2) pages.push('...');

  pages.push(total);

  return pages;
}
