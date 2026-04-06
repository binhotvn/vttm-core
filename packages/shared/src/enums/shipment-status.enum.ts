export enum ShipmentStatus {
  LABEL_CREATED = 'LABEL_CREATED',
  PICKUP_SCHEDULED = 'PICKUP_SCHEDULED',
  PICKUP_IN_PROGRESS = 'PICKUP_IN_PROGRESS',
  PICKED_UP = 'PICKED_UP',
  IN_TRANSIT_TO_ORIGIN_HUB = 'IN_TRANSIT_TO_ORIGIN_HUB',
  AT_ORIGIN_HUB = 'AT_ORIGIN_HUB',
  SORTING = 'SORTING',
  IN_TRANSIT = 'IN_TRANSIT',
  AT_DESTINATION_HUB = 'AT_DESTINATION_HUB',
  OUT_FOR_DELIVERY = 'OUT_FOR_DELIVERY',
  DELIVERY_ATTEMPTED = 'DELIVERY_ATTEMPTED',
  DELIVERED = 'DELIVERED',
  RETURNED_TO_SENDER = 'RETURNED_TO_SENDER',
  EXCEPTION = 'EXCEPTION',
  ON_HOLD = 'ON_HOLD',
  CANCELLED = 'CANCELLED',
  LOST = 'LOST',
}

export const ALLOWED_TRANSITIONS: Record<ShipmentStatus, ShipmentStatus[]> = {
  [ShipmentStatus.LABEL_CREATED]: [
    ShipmentStatus.PICKUP_SCHEDULED,
    ShipmentStatus.PICKED_UP,
    ShipmentStatus.CANCELLED,
    ShipmentStatus.ON_HOLD,
  ],
  [ShipmentStatus.PICKUP_SCHEDULED]: [
    ShipmentStatus.PICKUP_IN_PROGRESS,
    ShipmentStatus.CANCELLED,
    ShipmentStatus.ON_HOLD,
  ],
  [ShipmentStatus.PICKUP_IN_PROGRESS]: [
    ShipmentStatus.PICKED_UP,
    ShipmentStatus.EXCEPTION,
    ShipmentStatus.ON_HOLD,
  ],
  [ShipmentStatus.PICKED_UP]: [
    ShipmentStatus.IN_TRANSIT_TO_ORIGIN_HUB,
    ShipmentStatus.AT_ORIGIN_HUB,
    ShipmentStatus.ON_HOLD,
    ShipmentStatus.EXCEPTION,
  ],
  [ShipmentStatus.IN_TRANSIT_TO_ORIGIN_HUB]: [
    ShipmentStatus.AT_ORIGIN_HUB,
    ShipmentStatus.EXCEPTION,
    ShipmentStatus.ON_HOLD,
    ShipmentStatus.LOST,
  ],
  [ShipmentStatus.AT_ORIGIN_HUB]: [
    ShipmentStatus.SORTING,
    ShipmentStatus.ON_HOLD,
    ShipmentStatus.EXCEPTION,
  ],
  [ShipmentStatus.SORTING]: [
    ShipmentStatus.IN_TRANSIT,
    ShipmentStatus.AT_DESTINATION_HUB,
    ShipmentStatus.OUT_FOR_DELIVERY,
    ShipmentStatus.ON_HOLD,
    ShipmentStatus.EXCEPTION,
  ],
  [ShipmentStatus.IN_TRANSIT]: [
    ShipmentStatus.AT_DESTINATION_HUB,
    ShipmentStatus.EXCEPTION,
    ShipmentStatus.ON_HOLD,
    ShipmentStatus.LOST,
  ],
  [ShipmentStatus.AT_DESTINATION_HUB]: [
    ShipmentStatus.OUT_FOR_DELIVERY,
    ShipmentStatus.SORTING,
    ShipmentStatus.ON_HOLD,
    ShipmentStatus.EXCEPTION,
  ],
  [ShipmentStatus.OUT_FOR_DELIVERY]: [
    ShipmentStatus.DELIVERED,
    ShipmentStatus.DELIVERY_ATTEMPTED,
    ShipmentStatus.EXCEPTION,
    ShipmentStatus.ON_HOLD,
  ],
  [ShipmentStatus.DELIVERY_ATTEMPTED]: [
    ShipmentStatus.OUT_FOR_DELIVERY,
    ShipmentStatus.AT_DESTINATION_HUB,
    ShipmentStatus.RETURNED_TO_SENDER,
    ShipmentStatus.ON_HOLD,
  ],
  [ShipmentStatus.DELIVERED]: [],
  [ShipmentStatus.RETURNED_TO_SENDER]: [],
  [ShipmentStatus.EXCEPTION]: [
    ShipmentStatus.ON_HOLD,
    ShipmentStatus.AT_ORIGIN_HUB,
    ShipmentStatus.AT_DESTINATION_HUB,
    ShipmentStatus.OUT_FOR_DELIVERY,
    ShipmentStatus.RETURNED_TO_SENDER,
  ],
  [ShipmentStatus.ON_HOLD]: [
    ShipmentStatus.LABEL_CREATED,
    ShipmentStatus.PICKUP_SCHEDULED,
    ShipmentStatus.PICKED_UP,
    ShipmentStatus.AT_ORIGIN_HUB,
    ShipmentStatus.SORTING,
    ShipmentStatus.IN_TRANSIT,
    ShipmentStatus.AT_DESTINATION_HUB,
    ShipmentStatus.OUT_FOR_DELIVERY,
    ShipmentStatus.EXCEPTION,
  ],
  [ShipmentStatus.CANCELLED]: [],
  [ShipmentStatus.LOST]: [],
};

export function isValidTransition(from: ShipmentStatus, to: ShipmentStatus): boolean {
  return ALLOWED_TRANSITIONS[from].includes(to);
}
