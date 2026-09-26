import { Controller, Get, Post, Body, Param, Query, UseGuards } from '@nestjs/common';
import { RestaurantsService } from './restaurants.service';
import { TableReservationsService, CreateTableReservationDto } from './table-reservations.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Prisma } from '@prisma/client';

@Controller('restaurants')
export class RestaurantsController {
  constructor(
    private readonly restaurantsService: RestaurantsService,
    private readonly reservationsService: TableReservationsService,
  ) {}

  @Get()
  async findAll(
    @Query('city') city?: string,
    @Query('cuisine') cuisine?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const pageNum = page ? parseInt(page, 10) : 1;
    const limitNum = limit ? parseInt(limit, 10) : 10;
    return this.restaurantsService.findAll(city, cuisine, pageNum, limitNum);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.restaurantsService.findOne(id);
  }

  @Post(':id/reservations')
  @UseGuards(JwtAuthGuard)
  async createReservation(
    @Param('id') id: string,
    @CurrentUser() user: any,
    @Body() dto: CreateTableReservationDto,
  ) {
    return this.reservationsService.createReservation(id, user.userId, dto);
  }
}
