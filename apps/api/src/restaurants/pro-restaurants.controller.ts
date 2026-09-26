import { Controller, Get, Patch, Body, Param, UseGuards } from '@nestjs/common';
import { TableReservationsService } from './table-reservations.service';
import { RestaurantsService } from './restaurants.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { TenantScopeGuard } from '../auth/guards/tenant-scope.guard';
import { TableReservationStatus } from '@prisma/client';
import { UpdateRestaurantSettingsDto } from './dto/restaurant.dto';

@Controller('tenant/:tenantId/restaurant')
@UseGuards(JwtAuthGuard, TenantScopeGuard)
export class ProRestaurantsController {
  constructor(
    private readonly reservationsService: TableReservationsService,
    private readonly restaurantsService: RestaurantsService,
  ) {}

  @Get('reservations')
  async getReservations(@Param('tenantId') tenantId: string) {
    return this.reservationsService.findTenantReservations(tenantId);
  }

  @Patch('reservations/:id/status')
  async updateReservationStatus(
    @Param('tenantId') tenantId: string,
    @Param('id') reservationId: string,
    @Body('status') status: TableReservationStatus,
  ) {
    return this.reservationsService.updateReservationStatus(tenantId, reservationId, status);
  }

  @Patch('settings')
  async updateSettings(
    @Param('tenantId') tenantId: string,
    @Body() dto: UpdateRestaurantSettingsDto,
  ) {
    return this.restaurantsService.updateSettings(tenantId, dto);
  }
}
