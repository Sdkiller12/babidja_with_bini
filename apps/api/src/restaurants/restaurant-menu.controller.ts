import { Controller, Post, Patch, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { RestaurantsService } from './restaurants.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { TenantScopeGuard } from '../auth/guards/tenant-scope.guard';
import { CreateMenuCategoryDto, CreateMenuItemDto, UpdateMenuCategoryDto, UpdateMenuItemDto } from './dto/menu.dto';

@Controller('tenant/:tenantId/restaurant/menu')
@UseGuards(JwtAuthGuard, TenantScopeGuard)
export class RestaurantMenuController {
  constructor(private readonly restaurantsService: RestaurantsService) {}

  @Post('categories')
  async createCategory(
    @Param('tenantId') tenantId: string,
    @Body() dto: CreateMenuCategoryDto,
  ) {
    return this.restaurantsService.createMenuCategory(tenantId, dto);
  }

  @Patch('categories/:id')
  async updateCategory(
    @Param('tenantId') tenantId: string,
    @Param('id') id: string,
    @Body() dto: UpdateMenuCategoryDto,
  ) {
    return this.restaurantsService.updateMenuCategory(tenantId, id, dto);
  }

  @Delete('categories/:id')
  async deleteCategory(
    @Param('tenantId') tenantId: string,
    @Param('id') id: string,
  ) {
    return this.restaurantsService.deleteMenuCategory(tenantId, id);
  }

  @Post('items')
  async createItem(
    @Param('tenantId') tenantId: string,
    @Body() dto: CreateMenuItemDto,
  ) {
    return this.restaurantsService.createMenuItem(tenantId, dto);
  }

  @Patch('items/:id')
  async updateItem(
    @Param('tenantId') tenantId: string,
    @Param('id') id: string,
    @Body() dto: UpdateMenuItemDto,
  ) {
    return this.restaurantsService.updateMenuItem(tenantId, id, dto);
  }

  @Delete('items/:id')
  async deleteItem(
    @Param('tenantId') tenantId: string,
    @Param('id') id: string,
  ) {
    return this.restaurantsService.deleteMenuItem(tenantId, id);
  }
}
