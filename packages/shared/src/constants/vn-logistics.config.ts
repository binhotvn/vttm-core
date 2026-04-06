export const VN_LOGISTICS_CONFIG = {
  currency: 'VND' as const,
  currencyLocale: 'vi-VN',

  cod: {
    enabled: true,
    maxAmount: 20_000_000,
    feePercent: 1.5,
    minFee: 10_000,
    settlementDays: 3,
  },

  sla: {
    INNER_CITY: { hours: 4, vi: 'Nội thành', en: 'Inner City' },
    INTRA_PROVINCE: { hours: 24, vi: 'Nội tỉnh', en: 'Intra-Province' },
    ADJACENT: { hours: 48, vi: 'Liền kề', en: 'Adjacent Province' },
    INTER_PROVINCE: { hours: 72, vi: 'Liên tỉnh', en: 'Inter-Province' },
    REMOTE: { hours: 120, vi: 'Vùng sâu vùng xa', en: 'Remote Area' },
  },

  surcharges: [
    { type: 'REMOTE_AREA', vi: 'Phụ phí vùng xa', en: 'Remote Area', flat: 15_000 },
    { type: 'OVERSIZE', vi: 'Phụ phí quá khổ', en: 'Oversize', percent: 30 },
    { type: 'FRAGILE', vi: 'Hàng dễ vỡ', en: 'Fragile', flat: 10_000 },
    { type: 'RETURN_FEE', vi: 'Phí hoàn hàng', en: 'Return Fee', percent: 50 },
    { type: 'REDELIVERY', vi: 'Phí giao lại', en: 'Redelivery', flat: 5_000 },
    { type: 'INSURANCE', vi: 'Phí bảo hiểm', en: 'Insurance', percent: 0.5 },
    { type: 'COD_FEE', vi: 'Phí thu hộ COD', en: 'COD Fee', percent: 1.5 },
  ],

  exceptionReasons: {
    RECIPIENT_ABSENT: { vi: 'Người nhận không có mặt', en: 'Recipient absent' },
    WRONG_ADDRESS: { vi: 'Sai địa chỉ', en: 'Wrong address' },
    CANNOT_FIND: { vi: 'Không tìm được địa chỉ', en: 'Cannot locate address' },
    PHONE_UNREACHABLE: { vi: 'Không liên lạc được', en: 'Phone unreachable' },
    RECIPIENT_REFUSED: { vi: 'Người nhận từ chối', en: 'Refused delivery' },
    RECIPIENT_RESCHEDULE: { vi: 'Hẹn giao lại', en: 'Rescheduled' },
    COD_NOT_READY: { vi: 'Không có tiền COD', en: 'COD not ready' },
    DAMAGED: { vi: 'Hư hỏng', en: 'Damaged' },
    FLOOD_BLOCKED: { vi: 'Ngập nước', en: 'Flood blocked' },
    TET_HOLIDAY: { vi: 'Nghỉ Tết', en: 'Tet holiday' },
  },

  weight: {
    standardMaxKg: 30,
    oversizeMinCm: 150,
    volumetricDivisor: 6000,
  },

  maxDeliveryAttempts: 3,
} as const;
