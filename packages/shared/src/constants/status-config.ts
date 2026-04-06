import { ShipmentStatus } from '../enums/shipment-status.enum.js';

export interface StatusDisplay {
  vi: string;
  en: string;
  color: string;
  icon: string;
}

export const SHIPMENT_STATUS_CONFIG: Record<ShipmentStatus, StatusDisplay> = {
  [ShipmentStatus.LABEL_CREATED]: {
    vi: 'Đã tạo đơn',
    en: 'Label Created',
    color: '#8c8c8c',
    icon: 'FileTextOutlined',
  },
  [ShipmentStatus.PICKUP_SCHEDULED]: {
    vi: 'Đã lên lịch lấy hàng',
    en: 'Pickup Scheduled',
    color: '#1890ff',
    icon: 'CalendarOutlined',
  },
  [ShipmentStatus.PICKUP_IN_PROGRESS]: {
    vi: 'Đang lấy hàng',
    en: 'Pickup In Progress',
    color: '#13c2c2',
    icon: 'CarOutlined',
  },
  [ShipmentStatus.PICKED_UP]: {
    vi: 'Đã lấy hàng',
    en: 'Picked Up',
    color: '#52c41a',
    icon: 'CheckCircleOutlined',
  },
  [ShipmentStatus.IN_TRANSIT_TO_ORIGIN_HUB]: {
    vi: 'Đang về kho gửi',
    en: 'In Transit to Hub',
    color: '#2f54eb',
    icon: 'SwapOutlined',
  },
  [ShipmentStatus.AT_ORIGIN_HUB]: {
    vi: 'Đã đến kho gửi',
    en: 'At Origin Hub',
    color: '#722ed1',
    icon: 'HomeOutlined',
  },
  [ShipmentStatus.SORTING]: {
    vi: 'Đang phân loại',
    en: 'Sorting',
    color: '#eb2f96',
    icon: 'FilterOutlined',
  },
  [ShipmentStatus.IN_TRANSIT]: {
    vi: 'Đang vận chuyển',
    en: 'In Transit',
    color: '#fa8c16',
    icon: 'RocketOutlined',
  },
  [ShipmentStatus.AT_DESTINATION_HUB]: {
    vi: 'Đã đến kho nhận',
    en: 'At Destination Hub',
    color: '#a0d911',
    icon: 'FlagOutlined',
  },
  [ShipmentStatus.OUT_FOR_DELIVERY]: {
    vi: 'Đang giao hàng',
    en: 'Out for Delivery',
    color: '#faad14',
    icon: 'SendOutlined',
  },
  [ShipmentStatus.DELIVERY_ATTEMPTED]: {
    vi: 'Giao không thành công',
    en: 'Delivery Attempted',
    color: '#ff4d4f',
    icon: 'ExclamationCircleOutlined',
  },
  [ShipmentStatus.DELIVERED]: {
    vi: 'Đã giao hàng',
    en: 'Delivered',
    color: '#52c41a',
    icon: 'CheckSquareOutlined',
  },
  [ShipmentStatus.RETURNED_TO_SENDER]: {
    vi: 'Đã hoàn hàng',
    en: 'Returned to Sender',
    color: '#595959',
    icon: 'RollbackOutlined',
  },
  [ShipmentStatus.EXCEPTION]: {
    vi: 'Sự cố',
    en: 'Exception',
    color: '#f5222d',
    icon: 'WarningOutlined',
  },
  [ShipmentStatus.ON_HOLD]: {
    vi: 'Tạm giữ',
    en: 'On Hold',
    color: '#d48806',
    icon: 'PauseCircleOutlined',
  },
  [ShipmentStatus.CANCELLED]: {
    vi: 'Đã hủy',
    en: 'Cancelled',
    color: '#bfbfbf',
    icon: 'CloseCircleOutlined',
  },
  [ShipmentStatus.LOST]: {
    vi: 'Thất lạc',
    en: 'Lost',
    color: '#cf1322',
    icon: 'QuestionCircleOutlined',
  },
};
