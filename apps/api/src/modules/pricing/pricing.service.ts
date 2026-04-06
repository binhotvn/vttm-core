import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ServiceType, VN_LOGISTICS_CONFIG } from '@vttm/shared';
import { PricingZone } from './entities/pricing-zone.entity';
import { PricingRule, PricingMethod } from './entities/pricing-rule.entity';
import { CalculatePriceDto } from './dto/calculate-price.dto';
import { PaginationDto } from '../../common/pipes/parse-pagination.pipe';

@Injectable()
export class PricingService {
  constructor(
    @InjectRepository(PricingZone)
    private readonly zoneRepo: Repository<PricingZone>,
    @InjectRepository(PricingRule)
    private readonly ruleRepo: Repository<PricingRule>,
  ) {}

  // --- Zones ---
  async findAllZones(organizationId: string) {
    return this.zoneRepo.find({ where: { organizationId }, order: { code: 'ASC' } });
  }

  async createZone(data: Partial<PricingZone>, organizationId: string) {
    const zone = this.zoneRepo.create({ ...data, organizationId });
    return this.zoneRepo.save(zone);
  }

  // --- Rules ---
  async findAllRules(pagination: PaginationDto, organizationId: string) {
    const [data, total] = await this.ruleRepo.findAndCount({
      where: { organizationId },
      order: { priority: 'DESC', createdAt: 'DESC' },
      skip: (pagination.page - 1) * pagination.limit,
      take: pagination.limit,
    });
    return {
      data,
      meta: { total, page: pagination.page, limit: pagination.limit, totalPages: Math.ceil(total / pagination.limit) },
    };
  }

  async createRule(data: Partial<PricingRule>, organizationId: string) {
    const rule = this.ruleRepo.create({ ...data, organizationId });
    return this.ruleRepo.save(rule);
  }

  async updateRule(id: string, data: Partial<PricingRule>) {
    const rule = await this.ruleRepo.findOne({ where: { id } });
    if (!rule) throw new NotFoundException('Pricing rule not found');
    Object.assign(rule, data);
    return this.ruleRepo.save(rule);
  }

  // --- Calculator ---
  async calculate(dto: CalculatePriceDto, organizationId: string) {
    // Find zones for origin and destination
    const originZone = await this.findZoneByProvince(organizationId, dto.originProvinceCode);
    const destZone = await this.findZoneByProvince(organizationId, dto.destinationProvinceCode);

    // Find matching pricing rule
    const rules = await this.ruleRepo.find({
      where: { organizationId, serviceType: dto.serviceType, isActive: true },
      order: { priority: 'DESC' },
    });

    let matchedRule: PricingRule | undefined;
    for (const rule of rules) {
      const cond = rule.conditions;
      if (cond.originZoneCode && cond.originZoneCode !== originZone?.code) continue;
      if (cond.destinationZoneCode && cond.destinationZoneCode !== destZone?.code) continue;
      if (cond.minWeightKg && dto.weightKg < cond.minWeightKg) continue;
      if (cond.maxWeightKg && dto.weightKg > cond.maxWeightKg) continue;
      matchedRule = rule;
      break;
    }

    // Calculate base price
    let basePrice = 0;
    if (matchedRule) {
      basePrice = this.calculateByMethod(matchedRule, dto.weightKg);
    } else {
      // Default fallback pricing
      basePrice = 20000 + Math.ceil(dto.weightKg) * 5000;
    }

    // Calculate surcharges
    const surcharges: Array<{ type: string; amount: number; vi: string; en: string }> = [];

    if (destZone?.isRemote) {
      const remoteSurcharge = VN_LOGISTICS_CONFIG.surcharges.find((s) => s.type === 'REMOTE_AREA');
      if (remoteSurcharge && 'flat' in remoteSurcharge) {
        surcharges.push({
          type: 'REMOTE_AREA',
          amount: remoteSurcharge.flat as number,
          vi: remoteSurcharge.vi,
          en: remoteSurcharge.en,
        });
      }
    }

    const totalSurcharges = surcharges.reduce((sum, s) => sum + s.amount, 0);
    const slaHours = destZone?.slaHours || 72;

    return {
      basePrice,
      surcharges,
      totalSurcharges,
      totalPrice: basePrice + totalSurcharges,
      originZone: originZone ? { code: originZone.code, name: originZone.name } : null,
      destinationZone: destZone ? { code: destZone.code, name: destZone.name } : null,
      estimatedSlaHours: slaHours,
      rule: matchedRule ? { id: matchedRule.id, name: matchedRule.name, method: matchedRule.method } : null,
    };
  }

  private calculateByMethod(rule: PricingRule, weightKg: number): number {
    const { rates, method } = rule;

    switch (method) {
      case PricingMethod.FLAT_RATE:
        return rates.baseRate;

      case PricingMethod.PER_KG:
        return rates.baseRate + Math.ceil(weightKg) * (rates.perKgRate || 0);

      case PricingMethod.TIERED:
        if (!rates.tiers?.length) return rates.baseRate;
        for (const tier of rates.tiers) {
          if (weightKg >= tier.minKg && weightKg <= tier.maxKg) {
            return tier.rate;
          }
        }
        return rates.baseRate;

      case PricingMethod.ZONE_MATRIX:
        return rates.baseRate;

      default:
        return rates.baseRate;
    }
  }

  private async findZoneByProvince(organizationId: string, provinceCode: string) {
    const zones = await this.zoneRepo.find({ where: { organizationId } });
    return zones.find((z) => z.provinceCodes.includes(provinceCode)) || null;
  }
}
