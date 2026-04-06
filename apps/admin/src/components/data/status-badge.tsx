'use client';

import {
  FileText, CheckCircle, RefreshCw, Truck, Package,
  XCircle, RotateCcw, Clock, Zap, Send, AlertTriangle,
  Search, Pause, MapPin, Flag,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatusConfig {
  bg: string;
  text: string;
  dot?: string;
  icon?: React.ReactNode;
}

const STATUS_CONFIGS: Record<string, StatusConfig> = {
  // Order statuses
  DRAFT:              { bg: 'bg-gray-100',    text: 'text-gray-600',    dot: 'bg-gray-400',   icon: <FileText size={12} /> },
  CONFIRMED:          { bg: 'bg-blue-50',     text: 'text-blue-700',    dot: 'bg-blue-500',   icon: <CheckCircle size={12} /> },
  PROCESSING:         { bg: 'bg-yellow-50',   text: 'text-yellow-700',  dot: 'bg-yellow-500', icon: <RefreshCw size={12} /> },
  PARTIALLY_SHIPPED:  { bg: 'bg-cyan-50',     text: 'text-cyan-700',    dot: 'bg-cyan-500',   icon: <Package size={12} /> },
  SHIPPED:            { bg: 'bg-indigo-50',   text: 'text-indigo-700',  dot: 'bg-indigo-500', icon: <Send size={12} /> },
  DELIVERED:          { bg: 'bg-green-50',     text: 'text-green-700',   dot: 'bg-green-500',  icon: <CheckCircle size={12} /> },
  CANCELLED:          { bg: 'bg-gray-100',     text: 'text-gray-500',    dot: 'bg-gray-400',   icon: <XCircle size={12} /> },
  RETURNED:           { bg: 'bg-orange-50',    text: 'text-orange-700',  dot: 'bg-orange-500', icon: <RotateCcw size={12} /> },

  // Shipment statuses
  LABEL_CREATED:            { bg: 'bg-gray-100',    text: 'text-gray-600',    dot: 'bg-gray-400',   icon: <FileText size={12} /> },
  PICKUP_SCHEDULED:         { bg: 'bg-blue-50',     text: 'text-blue-700',    dot: 'bg-blue-500',   icon: <Clock size={12} /> },
  PICKUP_IN_PROGRESS:       { bg: 'bg-cyan-50',     text: 'text-cyan-700',    dot: 'bg-cyan-500',   icon: <Truck size={12} /> },
  PICKED_UP:                { bg: 'bg-green-50',    text: 'text-green-700',   dot: 'bg-green-500',  icon: <Package size={12} /> },
  IN_TRANSIT_TO_ORIGIN_HUB: { bg: 'bg-indigo-50',   text: 'text-indigo-700',  dot: 'bg-indigo-500', icon: <Truck size={12} /> },
  AT_ORIGIN_HUB:            { bg: 'bg-purple-50',   text: 'text-purple-700',  dot: 'bg-purple-500', icon: <MapPin size={12} /> },
  SORTING:                  { bg: 'bg-pink-50',     text: 'text-pink-700',    dot: 'bg-pink-500',   icon: <RefreshCw size={12} /> },
  IN_TRANSIT:               { bg: 'bg-blue-50',     text: 'text-blue-700',    dot: 'bg-blue-500',   icon: <Truck size={12} /> },
  AT_DESTINATION_HUB:       { bg: 'bg-lime-50',     text: 'text-lime-700',    dot: 'bg-lime-500',   icon: <MapPin size={12} /> },
  OUT_FOR_DELIVERY:         { bg: 'bg-yellow-50',   text: 'text-yellow-700',  dot: 'bg-yellow-500', icon: <Truck size={12} /> },
  DELIVERY_ATTEMPTED:       { bg: 'bg-red-50',      text: 'text-red-700',     dot: 'bg-red-500',    icon: <AlertTriangle size={12} /> },
  RETURNED_TO_SENDER:       { bg: 'bg-gray-100',    text: 'text-gray-600',    dot: 'bg-gray-400',   icon: <RotateCcw size={12} /> },
  EXCEPTION:                { bg: 'bg-red-50',      text: 'text-red-800',     dot: 'bg-red-600',    icon: <AlertTriangle size={12} /> },
  ON_HOLD:                  { bg: 'bg-amber-50',    text: 'text-amber-700',   dot: 'bg-amber-500',  icon: <Pause size={12} /> },
  LOST:                     { bg: 'bg-red-100',     text: 'text-red-900',     dot: 'bg-red-700',    icon: <Search size={12} /> },

  // Batch statuses
  OPEN:       { bg: 'bg-blue-50',   text: 'text-blue-700',   dot: 'bg-blue-500',   icon: <Package size={12} /> },
  LOCKED:     { bg: 'bg-yellow-50', text: 'text-yellow-700', dot: 'bg-yellow-500', icon: <Pause size={12} /> },
  SEALED:     { bg: 'bg-purple-50', text: 'text-purple-700', dot: 'bg-purple-500', icon: <CheckCircle size={12} /> },
  COMPLETED:  { bg: 'bg-green-50',  text: 'text-green-700',  dot: 'bg-green-500',  icon: <CheckCircle size={12} /> },

  // Driver statuses
  AVAILABLE:  { bg: 'bg-green-50',  text: 'text-green-700',  dot: 'bg-green-500' },
  ON_DUTY:    { bg: 'bg-blue-50',   text: 'text-blue-700',   dot: 'bg-blue-500' },
  ON_BREAK:   { bg: 'bg-yellow-50', text: 'text-yellow-700', dot: 'bg-yellow-500' },
  OFF_DUTY:   { bg: 'bg-gray-100',  text: 'text-gray-600',   dot: 'bg-gray-400' },
  ON_LEAVE:   { bg: 'bg-orange-50', text: 'text-orange-700', dot: 'bg-orange-500' },

  // Pickup
  REQUESTED:       { bg: 'bg-blue-50',  text: 'text-blue-700',  dot: 'bg-blue-500' },
  DRIVER_ASSIGNED: { bg: 'bg-cyan-50',  text: 'text-cyan-700',  dot: 'bg-cyan-500' },
  FAILED:          { bg: 'bg-red-50',   text: 'text-red-700',   dot: 'bg-red-500' },
};

const STATUS_LABELS_VI: Record<string, string> = {
  DRAFT: 'Nháp', CONFIRMED: 'Đã xác nhận', PROCESSING: 'Đang xử lý',
  PARTIALLY_SHIPPED: 'Giao một phần', SHIPPED: 'Đã gửi', DELIVERED: 'Đã giao',
  CANCELLED: 'Đã hủy', RETURNED: 'Đã hoàn',
  LABEL_CREATED: 'Đã tạo đơn', PICKUP_SCHEDULED: 'Lên lịch lấy',
  PICKUP_IN_PROGRESS: 'Đang lấy hàng', PICKED_UP: 'Đã lấy hàng',
  IN_TRANSIT_TO_ORIGIN_HUB: 'Đến kho gửi', AT_ORIGIN_HUB: 'Tại kho gửi',
  SORTING: 'Phân loại', IN_TRANSIT: 'Đang vận chuyển',
  AT_DESTINATION_HUB: 'Tại kho nhận', OUT_FOR_DELIVERY: 'Đang giao',
  DELIVERY_ATTEMPTED: 'Giao thất bại', RETURNED_TO_SENDER: 'Đã hoàn',
  EXCEPTION: 'Sự cố', ON_HOLD: 'Tạm giữ', LOST: 'Thất lạc',
  OPEN: 'Mở', LOCKED: 'Khóa', SEALED: 'Niêm phong', COMPLETED: 'Hoàn tất',
  AVAILABLE: 'Sẵn sàng', ON_DUTY: 'Đang làm', ON_BREAK: 'Nghỉ',
  OFF_DUTY: 'Hết ca', ON_LEAVE: 'Nghỉ phép',
  REQUESTED: 'Yêu cầu', DRIVER_ASSIGNED: 'Đã phân tài xế', FAILED: 'Thất bại',
};

interface StatusBadgeProps {
  status: string;
  locale?: string;
  size?: 'sm' | 'md';
  showIcon?: boolean;
  showDot?: boolean;
}

export function StatusBadge({
  status,
  locale = 'vi',
  size = 'sm',
  showIcon = true,
  showDot = false,
}: StatusBadgeProps) {
  const config = STATUS_CONFIGS[status] || { bg: 'bg-gray-100', text: 'text-gray-700', dot: 'bg-gray-400' };
  const label = locale === 'vi' ? (STATUS_LABELS_VI[status] || status) : status.replace(/_/g, ' ');

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full font-medium',
        config.bg,
        config.text,
        size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-3 py-1 text-sm'
      )}
    >
      {showDot && config.dot && (
        <span className={cn('w-1.5 h-1.5 rounded-full', config.dot)} />
      )}
      {showIcon && config.icon && (
        <span className="shrink-0">{config.icon}</span>
      )}
      {label}
    </span>
  );
}
