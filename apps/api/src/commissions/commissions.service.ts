import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ConfigService } from '@nestjs/config';
import { Prisma, TenantType } from '@prisma/client';

@Injectable()
export class CommissionsService {
  private readonly logger = new Logger(CommissionsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
  ) {}

  /**
   * Calcule et enregistre une commission pour une réservation confirmée.
   * Ne s'applique que si le Tenant appartient à un partenaire externe (isPlatformOwned === false).
   */
  async calculateAndRecord(bookingId: string) {
    const booking = await this.prisma.booking.findUnique({
      where: { id: bookingId },
      include: { tenant: true },
    });

    if (!booking) {
      this.logger.error(`Booking ${bookingId} not found`);
      return null;
    }

    if (booking.tenant.isPlatformOwned) {
      this.logger.debug(`Tenant ${booking.tenantId} is platform owned. No commission needed.`);
      return null;
    }

    // Check if commission already exists for this booking to be idempotent
    const existing = await this.prisma.commission.findFirst({
      where: { bookingRef: booking.bookingRef },
    });

    if (existing) {
      this.logger.debug(`Commission for booking ${booking.bookingRef} already exists.`);
      return existing;
    }

    let commissionRate = new Prisma.Decimal(0);
    let isFlatRate = false;

    switch (booking.tenant.type) {
      case TenantType.HOTEL:
        commissionRate = new Prisma.Decimal(this.config.get<number>('commissions.hotelRate') ?? 0);
        break;
      case TenantType.CAR_RENTAL:
        commissionRate = new Prisma.Decimal(this.config.get<number>('commissions.carRentalRate') ?? 0);
        break;
      case TenantType.RESTAURANT:
        commissionRate = new Prisma.Decimal(this.config.get<number>('commissions.restaurantRate') ?? 0);
        break;
      case TenantType.AGENCY:
        // Flat rate for flights (agency)
        commissionRate = new Prisma.Decimal(this.config.get<number>('commissions.flightFlat') ?? 0);
        isFlatRate = true;
        break;
    }

    let commissionAmount = new Prisma.Decimal(0);
    const grossAmount = booking.totalAmount;

    if (isFlatRate) {
      commissionAmount = commissionRate; // Flat fee
    } else {
      // Percentage fee: grossAmount * (commissionRate / 100)
      commissionAmount = grossAmount.mul(commissionRate.div(100)).toDecimalPlaces(0);
    }

    const netAmount = grossAmount.sub(commissionAmount);

    const commission = await this.prisma.commission.create({
      data: {
        tenantId: booking.tenantId,
        bookingType: booking.resourceType.toString(), // e.g., 'ROOM', 'VEHICLE'
        bookingRef: booking.bookingRef,
        grossAmount,
        commissionRate,
        commissionAmount,
        netAmount,
        payoutStatus: 'PENDING',
      },
    });

    this.logger.log(`Commission created for booking ${booking.bookingRef}: ${commissionAmount} (Rate: ${commissionRate})`);
    return commission;
  }
  /**
   * Calcule et enregistre une commission pour une réservation de table confirmée.
   */
  async calculateAndRecordRestaurant(reservationId: string) {
    const reservation = await this.prisma.tableReservation.findUnique({
      where: { id: reservationId },
      include: { restaurant: { include: { tenant: true } } },
    });

    if (!reservation) {
      this.logger.error(`Table Reservation ${reservationId} not found`);
      return null;
    }

    if (reservation.restaurant.tenant.isPlatformOwned) {
      return null;
    }

    // Since there's no unique reference in TableReservation, we use the ID
    const bookingRef = `RES_${reservation.id.substring(0, 8).toUpperCase()}`;

    const existing = await this.prisma.commission.findFirst({
      where: { bookingRef },
    });

    if (existing) {
      return existing;
    }

    // For now, as agreed with user, amount is 0
    const commissionRate = new Prisma.Decimal(0);
    const grossAmount = new Prisma.Decimal(0);
    const commissionAmount = new Prisma.Decimal(0);
    const netAmount = new Prisma.Decimal(0);

    const commission = await this.prisma.commission.create({
      data: {
        tenantId: reservation.restaurant.tenantId,
        bookingType: 'TABLE',
        bookingRef,
        grossAmount,
        commissionRate,
        commissionAmount,
        netAmount,
        payoutStatus: 'PENDING',
      },
    });

    this.logger.log(`Commission created for table reservation ${reservationId}`);
    return commission;
  }
}
