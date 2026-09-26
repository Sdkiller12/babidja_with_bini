import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class MessagingService {
  constructor(private readonly prisma: PrismaService) {}

  async getThreads(userId: string, tenantId?: string) {
    if (tenantId) {
      // For pros: get bookings for their tenant
      return this.prisma.booking.findMany({
        where: { tenantId },
        include: { user: { select: { firstName: true, lastName: true, email: true, phone: true } }, messages: { orderBy: { createdAt: 'desc' }, take: 1 } },
        orderBy: { createdAt: 'desc' },
      });
    } else {
      // For customers: get their bookings
      return this.prisma.booking.findMany({
        where: { userId },
        include: { tenant: { select: { name: true, type: true } }, messages: { orderBy: { createdAt: 'desc' }, take: 1 } },
        orderBy: { createdAt: 'desc' },
      });
    }
  }

  async findByBooking(bookingId: string, userId: string, tenantId?: string) {
    await this.assertAccess(bookingId, userId, tenantId);
    return this.prisma.message.findMany({ where: { bookingId }, orderBy: { createdAt: 'asc' } });
  }

  async create(bookingId: string, senderId: string, senderType: string, content: string, tenantId?: string) {
    await this.assertAccess(bookingId, senderId, tenantId);
    return this.prisma.message.create({ data: { bookingId, senderId, senderType, content } });
  }

  /** Seuls le client propriétaire de la réservation ou un employé de l'établissement concerné peuvent accéder à la conversation. */
  private async assertAccess(bookingId: string, userId: string, tenantId?: string) {
    const booking = await this.prisma.booking.findUnique({ where: { id: bookingId } });
    if (!booking) throw new NotFoundException('Réservation introuvable.');
    const isOwner = booking.userId === userId;
    const isTenantStaff = !!tenantId && booking.tenantId === tenantId;
    if (!isOwner && !isTenantStaff) {
      throw new ForbiddenException("Vous n'avez pas accès à cette conversation.");
    }
  }
}
