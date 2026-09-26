import { Injectable, ConflictException, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { TableReservationStatus, Prisma } from '@prisma/client';
import { IsString, IsNumber, IsOptional, Min } from 'class-validator';
import { CommissionsService } from '../commissions/commissions.service';

export class CreateTableReservationDto {
  @IsString()
  reservationDate: string; // ISO format

  @IsString()
  reservationTime: string; // e.g., '19:30'

  @IsNumber()
  @Min(1)
  partySize: number;

  @IsOptional()
  @IsString()
  specialRequests?: string;
}

@Injectable()
export class TableReservationsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly commissionsService: CommissionsService,
  ) {}

  /**
   * Création de réservation de restaurant.
   * On utilise la vérification de capacité agrégée :
   * Somme des couverts (partySize) existants (CONFIRMED/PENDING) vs restaurant.capacity
   */
  async createReservation(restaurantId: string, userId: string, dto: CreateTableReservationDto) {
    const reservationDate = new Date(dto.reservationDate);
    reservationDate.setHours(0, 0, 0, 0); // Normalize to midnight

    if (dto.partySize <= 0) {
      throw new BadRequestException('Le nombre de couverts doit être supérieur à 0.');
    }

    const CONFLICT_MESSAGE = 'Capacité maximale atteinte pour ce créneau horaire.';

    try {
      return await this.prisma.$transaction(async (tx) => {
        // 1. Fetch the restaurant and its capacity
        const restaurant = await tx.restaurant.findUnique({
          where: { id: restaurantId },
        });

        if (!restaurant) {
          throw new NotFoundException('Restaurant introuvable.');
        }

        // 2. Lock the restaurant row for update to prevent race conditions on capacity
        await tx.$queryRaw`
          SELECT id FROM "Restaurant"
          WHERE id = ${restaurantId}
          FOR UPDATE
        `;

        // 3. Sum existing party sizes for the given date and time
        const existingReservations = await tx.tableReservation.aggregate({
          where: {
            restaurantId,
            reservationDate,
            reservationTime: dto.reservationTime,
            status: {
              in: [TableReservationStatus.PENDING, TableReservationStatus.CONFIRMED],
            },
          },
          _sum: {
            partySize: true,
          },
        });

        const currentOccupancy = existingReservations._sum.partySize || 0;

        // 4. Check if new party size exceeds capacity
        if (currentOccupancy + dto.partySize > restaurant.capacity) {
          throw new ConflictException(CONFLICT_MESSAGE);
        }

        // 5. Create reservation
        return tx.tableReservation.create({
          data: {
            userId,
            restaurantId,
            reservationDate,
            reservationTime: dto.reservationTime,
            partySize: dto.partySize,
            specialRequests: dto.specialRequests,
            status: TableReservationStatus.PENDING,
          },
        });
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        throw new ConflictException(CONFLICT_MESSAGE);
      }
      throw error;
    }
  }

  async updateReservationStatus(tenantId: string, reservationId: string, status: TableReservationStatus) {
    const reservation = await this.prisma.tableReservation.findUnique({
      where: { id: reservationId },
      include: { restaurant: true },
    });

    if (!reservation) {
      throw new NotFoundException('Réservation introuvable.');
    }

    if (reservation.restaurant.tenantId !== tenantId) {
      throw new ForbiddenException("Cette réservation n'appartient pas à votre établissement.");
    }

    const updated = await this.prisma.tableReservation.update({
      where: { id: reservationId },
      data: { status },
    });

    if (status === TableReservationStatus.CONFIRMED) {
      await this.commissionsService.calculateAndRecordRestaurant(reservationId);
    }

    return updated;
  }

  async findTenantReservations(tenantId: string) {
    return this.prisma.tableReservation.findMany({
      where: {
        restaurant: {
          tenantId,
        },
      },
      include: {
        user: {
          select: { firstName: true, lastName: true, phone: true, email: true },
        },
      },
      orderBy: [
        { reservationDate: 'asc' },
        { reservationTime: 'asc' },
      ],
    });
  }
}
