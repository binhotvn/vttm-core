import { ShipmentStatus, SHIPMENT_STATUS_CONFIG } from '../index';
import { isValidTransition, ALLOWED_TRANSITIONS } from '../enums/shipment-status.enum';

describe('Shipment Status Config', () => {
  it('should have config for all statuses', () => {
    const allStatuses = Object.values(ShipmentStatus);
    for (const status of allStatuses) {
      expect(SHIPMENT_STATUS_CONFIG[status]).toBeDefined();
      expect(SHIPMENT_STATUS_CONFIG[status].vi).toBeTruthy();
      expect(SHIPMENT_STATUS_CONFIG[status].en).toBeTruthy();
      expect(SHIPMENT_STATUS_CONFIG[status].color).toBeTruthy();
    }
  });

  it('should have 17 statuses', () => {
    expect(Object.keys(ShipmentStatus)).toHaveLength(17);
  });
});

describe('Status Machine Transitions', () => {
  it('should allow valid transitions', () => {
    expect(isValidTransition(ShipmentStatus.LABEL_CREATED, ShipmentStatus.PICKUP_SCHEDULED)).toBe(true);
    expect(isValidTransition(ShipmentStatus.PICKED_UP, ShipmentStatus.AT_ORIGIN_HUB)).toBe(true);
    expect(isValidTransition(ShipmentStatus.OUT_FOR_DELIVERY, ShipmentStatus.DELIVERED)).toBe(true);
  });

  it('should reject invalid transitions', () => {
    expect(isValidTransition(ShipmentStatus.DELIVERED, ShipmentStatus.PICKED_UP)).toBe(false);
    expect(isValidTransition(ShipmentStatus.CANCELLED, ShipmentStatus.IN_TRANSIT)).toBe(false);
    expect(isValidTransition(ShipmentStatus.LOST, ShipmentStatus.DELIVERED)).toBe(false);
  });

  it('should have terminal states with no transitions', () => {
    expect(ALLOWED_TRANSITIONS[ShipmentStatus.DELIVERED]).toHaveLength(0);
    expect(ALLOWED_TRANSITIONS[ShipmentStatus.CANCELLED]).toHaveLength(0);
    expect(ALLOWED_TRANSITIONS[ShipmentStatus.LOST]).toHaveLength(0);
  });

  it('should allow ON_HOLD from most states', () => {
    const statesWithOnHold = Object.entries(ALLOWED_TRANSITIONS).filter(([, targets]) =>
      targets.includes(ShipmentStatus.ON_HOLD),
    );
    expect(statesWithOnHold.length).toBeGreaterThan(5);
  });

  it('should allow EXCEPTION resumption', () => {
    const exceptionTargets = ALLOWED_TRANSITIONS[ShipmentStatus.EXCEPTION];
    expect(exceptionTargets).toContain(ShipmentStatus.AT_ORIGIN_HUB);
    expect(exceptionTargets).toContain(ShipmentStatus.RETURNED_TO_SENDER);
  });

  it('should support the full happy path', () => {
    const happyPath = [
      ShipmentStatus.LABEL_CREATED,
      ShipmentStatus.PICKUP_SCHEDULED,
      ShipmentStatus.PICKUP_IN_PROGRESS,
      ShipmentStatus.PICKED_UP,
      ShipmentStatus.AT_ORIGIN_HUB,
      ShipmentStatus.SORTING,
      ShipmentStatus.IN_TRANSIT,
      ShipmentStatus.AT_DESTINATION_HUB,
      ShipmentStatus.OUT_FOR_DELIVERY,
      ShipmentStatus.DELIVERED,
    ];

    for (let i = 0; i < happyPath.length - 1; i++) {
      expect(isValidTransition(happyPath[i], happyPath[i + 1])).toBe(true);
    }
  });

  it('should support delivery retry path', () => {
    expect(isValidTransition(ShipmentStatus.OUT_FOR_DELIVERY, ShipmentStatus.DELIVERY_ATTEMPTED)).toBe(true);
    expect(isValidTransition(ShipmentStatus.DELIVERY_ATTEMPTED, ShipmentStatus.OUT_FOR_DELIVERY)).toBe(true);
    expect(isValidTransition(ShipmentStatus.DELIVERY_ATTEMPTED, ShipmentStatus.RETURNED_TO_SENDER)).toBe(true);
  });
});
