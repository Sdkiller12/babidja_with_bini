import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { CommissionsService } from './commissions.service';
import { PrismaService } from '../prisma/prisma.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '@prisma/client';

@Controller('admin/commissions')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.SUPER_ADMIN)
export class AdminCommissionsController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  async getCommissions(@Query('tenantId') tenantId?: string) {
    const where = tenantId ? { tenantId } : {};

    const commissions = await this.prisma.commission.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        tenant: {
          select: { name: true, type: true },
        },
      },
    });

    // Calculate totals
    const totalGross = commissions.reduce((sum, c) => sum + Number(c.grossAmount), 0);
    const totalCommission = commissions.reduce((sum, c) => sum + Number(c.commissionAmount), 0);
    const pendingCommission = commissions
      .filter((c) => c.payoutStatus === 'PENDING')
      .reduce((sum, c) => sum + Number(c.commissionAmount), 0);

    return {
      items: commissions,
      totals: {
        totalGross,
        totalCommission,
        pendingCommission,
      },
    };
  }
}
