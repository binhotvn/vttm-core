import { Tag } from 'antd';

const STATUS_CONFIG: Record<string, { color: string; vi: string }> = {
  LABEL_CREATED: { color: 'default', vi: 'Đã tạo đơn' },
  PICKUP_SCHEDULED: { color: 'blue', vi: 'Lên lịch lấy' },
  PICKED_UP: { color: 'cyan', vi: 'Đã lấy hàng' },
  IN_TRANSIT: { color: 'orange', vi: 'Đang vận chuyển' },
  AT_ORIGIN_HUB: { color: 'purple', vi: 'Tại kho gửi' },
  SORTING: { color: 'magenta', vi: 'Phân loại' },
  AT_DESTINATION_HUB: { color: 'lime', vi: 'Tại kho nhận' },
  OUT_FOR_DELIVERY: { color: 'gold', vi: 'Đang giao' },
  DELIVERED: { color: 'green', vi: 'Đã giao' },
  DELIVERY_ATTEMPTED: { color: 'red', vi: 'Giao thất bại' },
  RETURNED_TO_SENDER: { color: 'default', vi: 'Đã hoàn' },
  EXCEPTION: { color: 'error', vi: 'Sự cố' },
  ON_HOLD: { color: 'warning', vi: 'Tạm giữ' },
  CANCELLED: { color: 'default', vi: 'Đã hủy' },
  LOST: { color: 'error', vi: 'Thất lạc' },
  DRAFT: { color: 'default', vi: 'Nháp' },
  CONFIRMED: { color: 'blue', vi: 'Xác nhận' },
  PROCESSING: { color: 'processing', vi: 'Xử lý' },
  REQUESTED: { color: 'blue', vi: 'Yêu cầu' },
};

export function StatusTag({ status, lang = 'vi' }: { status: string; lang?: string }) {
  const config = STATUS_CONFIG[status] || { color: 'default', vi: status };
  return <Tag color={config.color}>{lang === 'vi' ? config.vi : status.replace(/_/g, ' ')}</Tag>;
}
