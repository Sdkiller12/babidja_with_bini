import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PaymentStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTenantDto } from './dto/create-tenant.dto';
import { UpdateTenantDto } from './dto/update-tenant.dto';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class AdminService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notificationsService: NotificationsService
  ) {}

  async dashboard() {
    const [tenantsByType, usersByRole, bookingsByStatus, revenue] = await Promise.all([
      this.prisma.tenant.groupBy({ by: ['type'], _count: { _all: true } }),
      this.prisma.user.groupBy({ by: ['role'], _count: { _all: true } }),
      this.prisma.booking.groupBy({ by: ['status'], _count: { _all: true } }),
      this.prisma.payment.aggregate({ where: { status: PaymentStatus.SUCCESS }, _sum: { amount: true } }),
    ]);

    const tenantCounts = Object.fromEntries(tenantsByType.map((row) => [row.type, row._count._all]));
    const userCounts = Object.fromEntries(usersByRole.map((row) => [row.role, row._count._all]));
    const bookingCounts = Object.fromEntries(bookingsByStatus.map((row) => [row.status, row._count._all]));

    return {
      totalTenants: tenantsByType.reduce((sum, row) => sum + row._count._all, 0),
      hotelsCount: tenantCounts.HOTEL ?? 0,
      carRentalsCount: tenantCounts.CAR_RENTAL ?? 0,
      totalUsers: usersByRole.reduce((sum, row) => sum + row._count._all, 0),
      customersCount: userCounts.CUSTOMER ?? 0,
      totalBookings: bookingsByStatus.reduce((sum, row) => sum + row._count._all, 0),
      pendingBookings: bookingCounts.PENDING ?? 0,
      confirmedBookings: bookingCounts.CONFIRMED ?? 0,
      totalRevenue: revenue._sum.amount ?? 0,
    };
  }

  listTenants() {
    return this.prisma.tenant.findMany();
  }

  createTenant(dto: CreateTenantDto) {
    return this.prisma.tenant.create({ data: dto });
  }

  async updateTenant(tenantId: string, dto: UpdateTenantDto) {
    const tenant = await this.prisma.tenant.findUnique({ where: { id: tenantId } });
    if (!tenant) throw new NotFoundException('Établissement introuvable.');
    return this.prisma.tenant.update({ where: { id: tenantId }, data: dto });
  }

  async deleteTenant(tenantId: string) {
    const tenant = await this.prisma.tenant.findUnique({ where: { id: tenantId } });
    if (!tenant) throw new NotFoundException('Établissement introuvable.');
    
    // In Prisma, assuming onDelete: Cascade is properly set up, this will delete related entities.
    // However, if we just want to deactivate it instead of hard delete, we could update isActive.
    // But the user requested "supprimé" (delete). So we'll perform a hard delete.
    return this.prisma.tenant.delete({ where: { id: tenantId } });
  }

  listTransactions() {
    return this.prisma.payment.findMany({ 
      orderBy: { createdAt: 'desc' },
      include: {
        booking: {
          include: {
            user: { select: { firstName: true, lastName: true, email: true } },
            tenant: { select: { name: true } }
          }
        }
      }
    });
  }

  listTenantRequests() {
    return this.prisma.tenantRequest.findMany({ orderBy: { createdAt: 'desc' } });
  }

  async processTenantRequest(id: string, status: 'APPROVED' | 'REJECTED') {
    const request = await this.prisma.tenantRequest.findUnique({ where: { id } });
    if (!request) throw new NotFoundException('Demande introuvable.');
    if (request.status !== 'PENDING') throw new BadRequestException('Cette demande a déjà été traitée.');

    return this.prisma.$transaction(async (tx) => {
      const updated = await tx.tenantRequest.update({ where: { id }, data: { status } });
      
      if (status === 'APPROVED') {
        const tenant = await tx.tenant.create({
          data: {
            name: request.companyName,
            type: request.type,
            city: request.city,
            address: request.address,
            isActive: true,
          }
        });

        // Handle User Creation / Linking
        let user = await tx.user.findUnique({ where: { email: request.contactEmail } });
        let generatedPassword = null;

        if (!user) {
          const bcrypt = require('bcrypt');
          generatedPassword = Math.random().toString(36).slice(-8);
          const passwordHash = await bcrypt.hash(generatedPassword, 12);
          
          user = await tx.user.create({
            data: {
              email: request.contactEmail,
              phone: request.contactPhone,
              firstName: request.contactName.split(' ')[0] || '',
              lastName: request.contactName.split(' ').slice(1).join(' ') || '',
              passwordHash,
              role: 'TENANT_ADMIN',
              referralCode: Math.random().toString(36).substring(2, 8).toUpperCase(),
            }
          });
        } else if (user.role !== 'TENANT_ADMIN') {
          user = await tx.user.update({
            where: { id: user.id },
            data: { role: 'TENANT_ADMIN' }
          });
        }

        await tx.tenantEmployee.create({
          data: {
            tenantId: tenant.id,
            userId: user.id,
            role: 'TENANT_ADMIN',
          }
        });

        // Send SMS notification
        // If it's a new user, they would get their `generatedPassword`.
        if (request.contactPhone) {
          await this.notificationsService.sendPartnerAccountCreatedSms(request.contactPhone);
        }
        
        console.log(`[Admin] Partner Approved. Email: ${user.email}, Password: ${generatedPassword ? generatedPassword : 'EXISTING'}`);
      }
      return updated;
    });
  }
}
