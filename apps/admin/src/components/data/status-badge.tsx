'use client';

const STATUS_COLORS: Record<string, { bg: string; text: string }> = {
  LABEL_CREATED:            { bg: 'bg-gray-100', text: 'text-gray-700' },
  PICKUP_SCHEDULED:         { bg: 'bg-blue-100', text: 'text-blue-700' },
  PICKUP_IN_PROGRESS:       { bg: 'bg-cyan-100', text: 'text-cyan-700' },
  PICKED_UP:                { bg: 'bg-green-100', text: 'text-green-700' },
  IN_TRANSIT_TO_ORIGIN_HUB: { bg: 'bg-indigo-100', text: 'text-indigo-700' },
  AT_ORIGIN_HUB:            { bg: 'bg-purple-100', text: 'text-purple-700' },
  SORTING:                  { bg: 'bg-pink-100', text: 'text-pink-700' },
  IN_TRANSIT:               { bg: 'bg-orange-100', text: 'text-orange-700' },
  AT_DESTINATION_HUB:       { bg: 'bg-lime-100', text: 'text-lime-700' },
  OUT_FOR_DELIVERY:         { bg: 'bg-yellow-100', text: 'text-yellow-700' },
  DELIVERY_ATTEMPTED:       { bg: 'bg-red-100', text: 'text-red-700' },
  DELIVERED:                { bg: 'bg-green-100', text: 'text-green-700' },
  RETURNED_TO_SENDER:       { bg: 'bg-gray-200', text: 'text-gray-700' },
  EXCEPTION:                { bg: 'bg-red-200', text: 'text-red-800' },
  ON_HOLD:                  { bg: 'bg-amber-100', text: 'text-amber-700' },
  CANCELLED:                { bg: 'bg-gray-100', text: 'text-gray-500' },
  LOST:                     { bg: 'bg-red-200', text: 'text-red-900' },
  // Order statuses
  DRAFT:                    { bg: 'bg-gray-100', text: 'text-gray-600' },
  CONFIRMED:                { bg: 'bg-blue-100', text: 'text-blue-700' },
  PROCESSING:               { bg: 'bg-yellow-100', text: 'text-yellow-700' },
  SHIPPED:                  { bg: 'bg-indigo-100', text: 'text-indigo-700' },
  // Batch statuses
  OPEN:                     { bg: 'bg-blue-100', text: 'text-blue-700' },
  LOCKED:                   { bg: 'bg-yellow-100', text: 'text-yellow-700' },
  SEALED:                   { bg: 'bg-purple-100', text: 'text-purple-700' },
  COMPLETED:                { bg: 'bg-green-100', text: 'text-green-700' },
  // Driver statuses
  AVAILABLE:                { bg: 'bg-green-100', text: 'text-green-700' },
  ON_DUTY:                  { bg: 'bg-blue-100', text: 'text-blue-700' },
  ON_BREAK:                 { bg: 'bg-yellow-100', text: 'text-yellow-700' },
  OFF_DUTY:                 { bg: 'bg-gray-100', text: 'text-gray-600' },
  ON_LEAVE:                 { bg: 'bg-orange-100', text: 'text-orange-700' },
  // Pickup
  REQUESTED:                { bg: 'bg-blue-100', text: 'text-blue-700' },
  DRIVER_ASSIGNED:          { bg: 'bg-cyan-100', text: 'text-cyan-700' },
  FAILED:                   { bg: 'bg-red-100', text: 'text-red-700' },
};

const STATUS_LABELS_VI: Record<string, string> = {
  LABEL_CREATED: 'Đã tạo đơn', PICKUP_SCHEDULED: 'Lên lịch lấy', PICKED_UP: 'Đã lấy hàng',
  IN_TRANSIT: 'Đang vận chuyển', AT_ORIGIN_HUB: 'Tại kho gửi', SORTING: 'Phân loại',
  AT_DESTINATION_HUB: 'Tại kho nhận', OUT_FOR_DELIVERY: 'Đang giao', DELIVERED: 'Đã giao',
  DELIVERY_ATTEMPTED: 'Giao thất bại', RETURNED_TO_SENDER: 'Đã hoàn', EXCEPTION: 'Sự cố',
  ON_HOLD: 'Tạm giữ', CANCELLED: 'Đã hủy', LOST: 'Thất lạc',
  DRAFT: 'Nháp', CONFIRMED: 'Xác nhận', PROCESSING: 'Xử lý', SHIPPED: 'Đã gửi',
  OPEN: 'Mở', LOCKED: 'Khóa', SEALED: 'Niêm phong', COMPLETED: 'Hoàn tất',
  AVAILABLE: 'Sẵn sàng', ON_DUTY: 'Đang làm', ON_BREAK: 'Nghỉ', OFF_DUTY: 'Hết ca', ON_LEAVE: 'Nghỉ phép',
  REQUESTED: 'Yêu cầu', DRIVER_ASSIGNED: 'Đã phân tài xế', FAILED: 'Thất bại',
};

export function StatusBadge({ status, locale = 'vi' }: { status: string; locale?: string }) {
  const colors = STATUS_COLORS[status] || { bg: 'bg-gray-100', text: 'text-gray-700' };
  const label = locale === 'vi' ? (STATUS_LABELS_VI[status] || status) : status.replace(/_/g, ' ');

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${colors.bg} ${colors.text}`}>
      {label}
    </span>
  );
}
