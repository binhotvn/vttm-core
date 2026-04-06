'use client';

import { useState } from 'react';

interface Column<T> {
  key: string;
  header: string;
  render?: (item: T) => React.ReactNode;
  sortable?: boolean;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  total?: number;
  page?: number;
  limit?: number;
  onPageChange?: (page: number) => void;
  onRowClick?: (item: T) => void;
  loading?: boolean;
  emptyText?: string;
}

export function DataTable<T extends Record<string, any>>({
  columns, data, total = 0, page = 1, limit = 20,
  onPageChange, onRowClick, loading, emptyText = 'Không có dữ liệu',
}: DataTableProps<T>) {
  const totalPages = Math.ceil(total / limit);

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {columns.map((col) => (
                <th key={col.key} className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {loading ? (
              <tr><td colSpan={columns.length} className="px-4 py-8 text-center text-gray-400">Loading...</td></tr>
            ) : data.length === 0 ? (
              <tr><td colSpan={columns.length} className="px-4 py-8 text-center text-gray-400">{emptyText}</td></tr>
            ) : (
              data.map((item, idx) => (
                <tr
                  key={item.id || idx}
                  className={onRowClick ? 'cursor-pointer hover:bg-gray-50' : ''}
                  onClick={() => onRowClick?.(item)}
                >
                  {columns.map((col) => (
                    <td key={col.key} className="px-4 py-3 text-sm text-gray-900 whitespace-nowrap">
                      {col.render ? col.render(item) : item[col.key]}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      {totalPages > 1 && (
        <div className="px-4 py-3 border-t flex items-center justify-between text-sm">
          <span className="text-gray-500">
            {((page - 1) * limit) + 1}–{Math.min(page * limit, total)} / {total}
          </span>
          <div className="flex gap-1">
            <button
              onClick={() => onPageChange?.(page - 1)}
              disabled={page <= 1}
              className="px-3 py-1 rounded border disabled:opacity-50 hover:bg-gray-50"
            >
              ←
            </button>
            <span className="px-3 py-1">{page}/{totalPages}</span>
            <button
              onClick={() => onPageChange?.(page + 1)}
              disabled={page >= totalPages}
              className="px-3 py-1 rounded border disabled:opacity-50 hover:bg-gray-50"
            >
              →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
