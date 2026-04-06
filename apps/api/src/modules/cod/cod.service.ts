import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { CodStatus, CodTransferStatus, VN_LOGISTICS_CONFIG } from '@vttm/shared';
import { CodCollection } from './entities/cod-collection.entity';
import { Shipment } from '../shipments/entities/shipment.entity';

@Injectable()
export class CodService {
  constructor(
    @InjectRepository(CodCollection)
    private readonly codRepo: Repository<CodCollection>,
    @InjectRepository(Shipment)
    private readonly shipmentRepo: Repository<Shipment>,
  ) {}

  /**
   * Create a COD collection record when a shipment is delivered with COD.
   */
  async createCollection(
    shipment: Shipment,
    driverId: string,
    collectedAmount: number,
  ) {
    const codAmount = Number(shipment.codAmount);
    const codFeePercent = VN_LOGISTICS_CONFIG.cod.feePercent;
    const codMinFee = VN_LOGISTICS_CONFIG.cod.minFee;
    const codFee = Math.max(Math.round(codAmount * codFeePercent / 100), codMinFee);
    const shippingFee = Number(shipment.shippingCost);
    const netTransferAmount = collectedAmount - codFee - shippingFee;

    const collection = this.codRepo.create({
      organizationId: shipment.organizationId,
      shipmentId: shipment.id,
      driverId,
      senderId: null as any,
      expectedAmount: codAmount,
      collectedAmount,
      codFee,
      shippingFee,
      netTransferAmount: Math.max(0, netTransferAmount),
      collectedDate: new Date().toISOString().split('T')[0],
      status: collectedAmount === codAmount ? CodStatus.COLLECTED : CodStatus.DISCREPANCY,
      discrepancyNote: collectedAmount !== codAmount
        ? `Expected ${codAmount}, collected ${collectedAmount}`
        : null as any,
    });

    return this.codRepo.save(collection);
  }

  /**
   * Daily COD summary by driver.
   */
  async getDailySummary(organizationId: string, date?: string) {
    const targetDate = date || new Date().toISOString().split('T')[0];

    const collections = await this.codRepo.find({
      where: { organizationId, collectedDate: targetDate },
      relations: ['shipment'],
    });

    // Group by driver
    const byDriver = new Map<string, CodCollection[]>();
    for (const c of collections) {
      if (!byDriver.has(c.driverId)) byDriver.set(c.driverId, []);
      byDriver.get(c.driverId)!.push(c);
    }

    const summary = Array.from(byDriver.entries()).map(([driverId, items]) => ({
      driverId,
      date: targetDate,
      shipmentCount: items.length,
      expectedTotal: items.reduce((s, c) => s + Number(c.expectedAmount), 0),
      collectedTotal: items.reduce((s, c) => s + Number(c.collectedAmount), 0),
      codFeeTotal: items.reduce((s, c) => s + Number(c.codFee), 0),
      netTransferTotal: items.reduce((s, c) => s + Number(c.netTransferAmount), 0),
      discrepancies: items.filter((c) => c.status === CodStatus.DISCREPANCY).length,
    }));

    return {
      date: targetDate,
      drivers: summary,
      totals: {
        shipmentCount: collections.length,
        expectedTotal: collections.reduce((s, c) => s + Number(c.expectedAmount), 0),
        collectedTotal: collections.reduce((s, c) => s + Number(c.collectedAmount), 0),
      },
    };
  }

  /**
   * Verify a driver's daily COD collection (cashier verification).
   */
  async verifyDriverCod(organizationId: string, driverId: string, date: string, actualTotal: number) {
    const collections = await this.codRepo.find({
      where: { organizationId, driverId, collectedDate: date },
    });

    if (collections.length === 0) {
      throw new NotFoundException('No COD collections found for this driver on this date');
    }

    const expectedTotal = collections.reduce((s, c) => s + Number(c.collectedAmount), 0);

    if (Math.abs(actualTotal - expectedTotal) > 0) {
      // Flag discrepancy
      for (const c of collections) {
        c.status = CodStatus.DISCREPANCY;
        c.discrepancyNote = `Cashier verified: ${actualTotal}₫ vs system: ${expectedTotal}₫`;
        await this.codRepo.save(c);
      }
      return { verified: false, expected: expectedTotal, actual: actualTotal, difference: actualTotal - expectedTotal };
    }

    // Mark all as verified
    for (const c of collections) {
      c.status = CodStatus.VERIFIED;
      await this.codRepo.save(c);
    }

    return { verified: true, expected: expectedTotal, actual: actualTotal, count: collections.length };
  }

  /**
   * Get pending transfers to senders.
   */
  async getPendingTransfers(organizationId: string) {
    const pending = await this.codRepo.find({
      where: { organizationId, status: CodStatus.VERIFIED, transferStatus: CodTransferStatus.PENDING },
      relations: ['shipment'],
    });

    // Group by sender
    const bySender = new Map<string, CodCollection[]>();
    for (const c of pending) {
      const key = c.senderId || 'unknown';
      if (!bySender.has(key)) bySender.set(key, []);
      bySender.get(key)!.push(c);
    }

    return Array.from(bySender.entries()).map(([senderId, items]) => ({
      senderId,
      shipmentCount: items.length,
      totalCodCollected: items.reduce((s, c) => s + Number(c.collectedAmount), 0),
      totalFees: items.reduce((s, c) => s + Number(c.codFee) + Number(c.shippingFee), 0),
      netTransferAmount: items.reduce((s, c) => s + Number(c.netTransferAmount), 0),
      collectionIds: items.map((c) => c.id),
    }));
  }

  /**
   * Process bank transfer to sender.
   */
  async processTransfer(organizationId: string, senderId: string, bankTransferRef?: string) {
    const collections = await this.codRepo.find({
      where: { organizationId, senderId, status: CodStatus.VERIFIED, transferStatus: CodTransferStatus.PENDING },
    });

    if (collections.length === 0) {
      throw new NotFoundException('No pending transfers for this sender');
    }

    for (const c of collections) {
      c.transferStatus = CodTransferStatus.TRANSFERRED;
      c.status = CodStatus.TRANSFERRED;
      c.bankTransferRef = bankTransferRef || null as any;
      c.transferredAt = new Date();
      await this.codRepo.save(c);
    }

    return {
      senderId,
      transferredCount: collections.length,
      totalTransferred: collections.reduce((s, c) => s + Number(c.netTransferAmount), 0),
      bankTransferRef,
    };
  }

  /**
   * Get discrepancies.
   */
  async getDiscrepancies(organizationId: string) {
    return this.codRepo.find({
      where: { organizationId, status: CodStatus.DISCREPANCY },
      relations: ['shipment'],
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * COD statement for a sender (bảng kê đối soát).
   */
  async getSenderStatement(organizationId: string, senderId: string) {
    const collections = await this.codRepo.find({
      where: { organizationId, senderId },
      relations: ['shipment'],
      order: { collectedDate: 'DESC' },
    });

    return {
      senderId,
      items: collections.map((c) => ({
        id: c.id,
        shipmentId: c.shipmentId,
        trackingNumber: (c.shipment as any)?.trackingNumber,
        collectedDate: c.collectedDate,
        codAmount: c.collectedAmount,
        codFee: c.codFee,
        shippingFee: c.shippingFee,
        netAmount: c.netTransferAmount,
        status: c.status,
        transferStatus: c.transferStatus,
        bankTransferRef: c.bankTransferRef,
      })),
      totals: {
        totalCollected: collections.reduce((s, c) => s + Number(c.collectedAmount), 0),
        totalFees: collections.reduce((s, c) => s + Number(c.codFee) + Number(c.shippingFee), 0),
        totalNet: collections.reduce((s, c) => s + Number(c.netTransferAmount), 0),
        totalTransferred: collections.filter((c) => c.transferStatus === CodTransferStatus.TRANSFERRED).reduce((s, c) => s + Number(c.netTransferAmount), 0),
      },
    };
  }
}
