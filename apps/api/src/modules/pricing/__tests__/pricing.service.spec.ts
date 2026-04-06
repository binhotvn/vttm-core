import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { PricingService } from '../pricing.service';
import { PricingZone } from '../entities/pricing-zone.entity';
import { PricingRule } from '../entities/pricing-rule.entity';

const mockZoneRepo = {
  find: jest.fn(), create: jest.fn(), save: jest.fn(),
};
const mockRuleRepo = {
  findAndCount: jest.fn(), find: jest.fn(), findOne: jest.fn(),
  create: jest.fn(), save: jest.fn(),
};

describe('PricingService', () => {
  let service: PricingService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        PricingService,
        { provide: getRepositoryToken(PricingZone), useValue: mockZoneRepo },
        { provide: getRepositoryToken(PricingRule), useValue: mockRuleRepo },
      ],
    }).compile();
    service = module.get<PricingService>(PricingService);
    jest.clearAllMocks();
  });

  describe('calculate', () => {
    it('should calculate PER_KG pricing', async () => {
      mockZoneRepo.find.mockResolvedValue([
        { code: 'HCM', provinceCodes: ['79'], isRemote: false, slaHours: 4 },
        { code: 'DN', provinceCodes: ['48'], isRemote: false, slaHours: 48 },
      ]);
      mockRuleRepo.find.mockResolvedValue([{
        id: 'r1', name: 'Express HCM-DN', method: 'PER_KG',
        conditions: { originZoneCode: 'HCM', destinationZoneCode: 'DN' },
        rates: { baseRate: 20000, perKgRate: 5000 },
      }]);

      const result = await service.calculate({
        originProvinceCode: '79', destinationProvinceCode: '48',
        weightKg: 3, serviceType: 'EXPRESS' as any,
      }, 'org-1');

      expect(result.basePrice).toBe(35000); // 20000 + 3*5000
      expect(result.destinationZone?.code).toBe('DN');
      expect(result.estimatedSlaHours).toBe(48);
    });

    it('should apply remote area surcharge', async () => {
      mockZoneRepo.find.mockResolvedValue([
        { code: 'HCM', provinceCodes: ['79'], isRemote: false, slaHours: 4 },
        { code: 'REMOTE', provinceCodes: ['52'], isRemote: true, slaHours: 120 },
      ]);
      mockRuleRepo.find.mockResolvedValue([]);

      const result = await service.calculate({
        originProvinceCode: '79', destinationProvinceCode: '52',
        weightKg: 1, serviceType: 'STANDARD' as any,
      }, 'org-1');

      expect(result.totalSurcharges).toBe(15000); // remote area flat fee
      expect(result.totalPrice).toBeGreaterThan(result.basePrice);
    });

    it('should use fallback pricing when no rule matches', async () => {
      mockZoneRepo.find.mockResolvedValue([]);
      mockRuleRepo.find.mockResolvedValue([]);

      const result = await service.calculate({
        originProvinceCode: '79', destinationProvinceCode: '48',
        weightKg: 2, serviceType: 'STANDARD' as any,
      }, 'org-1');

      expect(result.basePrice).toBe(30000); // 20000 + ceil(2)*5000
      expect(result.rule).toBeNull();
    });

    it('should calculate FLAT_RATE pricing', async () => {
      mockZoneRepo.find.mockResolvedValue([
        { code: 'A', provinceCodes: ['01'], isRemote: false, slaHours: 24 },
      ]);
      mockRuleRepo.find.mockResolvedValue([{
        method: 'FLAT_RATE', conditions: {},
        rates: { baseRate: 15000 },
      }]);

      const result = await service.calculate({
        originProvinceCode: '01', destinationProvinceCode: '01',
        weightKg: 5, serviceType: 'STANDARD' as any,
      }, 'org-1');

      expect(result.basePrice).toBe(15000);
    });
  });
});
