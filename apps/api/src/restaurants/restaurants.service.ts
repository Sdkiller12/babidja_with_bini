import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateMenuCategoryDto, CreateMenuItemDto, UpdateMenuCategoryDto, UpdateMenuItemDto } from './dto/menu.dto';
import { UpdateRestaurantSettingsDto } from './dto/restaurant.dto';

@Injectable()
export class RestaurantsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(city?: string, cuisine?: string, page = 1, limit = 10) {
    const where: any = { tenant: { isActive: true } };
    
    if (city) {
      where.tenant.city = { contains: city, mode: 'insensitive' };
    }
    
    if (cuisine) {
      where.cuisineType = { has: cuisine };
    }

    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.prisma.restaurant.findMany({
        where,
        skip,
        take: limit,
        include: {
          tenant: {
            select: {
              name: true,
              address: true,
              city: true,
              coverImageUrl: true,
              images: true,
              description: true,
            },
          },
        },
      }),
      this.prisma.restaurant.count({ where })
    ]);

    return {
      data,
      meta: { total, page, limit, lastPage: Math.ceil(total / limit) },
    };
  }

  async findOne(id: string) {
    const restaurant = await this.prisma.restaurant.findUnique({
      where: { id },
      include: {
        tenant: {
          include: {
            menuCategories: {
              include: {
                items: true,
              },
              orderBy: { order: 'asc' },
            },
          },
        },
      },
    });

    if (!restaurant) {
      throw new NotFoundException('Restaurant introuvable.');
    }

    return restaurant;
  }

  // --- MENU MANAGEMENT ---

  async createMenuCategory(tenantId: string, dto: CreateMenuCategoryDto) {
    return this.prisma.restaurantMenuCategory.create({
      data: {
        tenantId,
        name: dto.name,
        order: dto.order ?? 0,
      },
    });
  }

  async updateMenuCategory(tenantId: string, categoryId: string, dto: UpdateMenuCategoryDto) {
    const category = await this.prisma.restaurantMenuCategory.findUnique({ where: { id: categoryId } });
    if (!category || category.tenantId !== tenantId) {
      throw new NotFoundException('Catégorie introuvable.');
    }

    return this.prisma.restaurantMenuCategory.update({
      where: { id: categoryId },
      data: {
        ...(dto.name && { name: dto.name }),
        ...(dto.order !== undefined && { order: dto.order }),
      },
    });
  }

  async deleteMenuCategory(tenantId: string, categoryId: string) {
    const category = await this.prisma.restaurantMenuCategory.findUnique({ where: { id: categoryId } });
    if (!category || category.tenantId !== tenantId) {
      throw new NotFoundException('Catégorie introuvable.');
    }

    return this.prisma.restaurantMenuCategory.delete({
      where: { id: categoryId },
    });
  }

  async createMenuItem(tenantId: string, dto: CreateMenuItemDto) {
    const category = await this.prisma.restaurantMenuCategory.findUnique({ where: { id: dto.categoryId } });
    if (!category || category.tenantId !== tenantId) {
      throw new NotFoundException('Catégorie introuvable.');
    }

    return this.prisma.menuItem.create({
      data: {
        categoryId: dto.categoryId,
        name: dto.name,
        description: dto.description,
        price: dto.price,
        imageUrl: dto.imageUrl,
        isAvailable: dto.isAvailable ?? true,
      },
    });
  }

  async updateMenuItem(tenantId: string, itemId: string, dto: UpdateMenuItemDto) {
    const item = await this.prisma.menuItem.findUnique({
      where: { id: itemId },
      include: { category: true },
    });
    
    if (!item || item.category.tenantId !== tenantId) {
      throw new NotFoundException('Article introuvable.');
    }

    if (dto.categoryId) {
      const newCategory = await this.prisma.restaurantMenuCategory.findUnique({ where: { id: dto.categoryId } });
      if (!newCategory || newCategory.tenantId !== tenantId) {
        throw new NotFoundException('Nouvelle catégorie introuvable.');
      }
    }

    return this.prisma.menuItem.update({
      where: { id: itemId },
      data: {
        ...(dto.name && { name: dto.name }),
        ...(dto.description !== undefined && { description: dto.description }),
        ...(dto.price !== undefined && { price: dto.price }),
        ...(dto.imageUrl !== undefined && { imageUrl: dto.imageUrl }),
        ...(dto.isAvailable !== undefined && { isAvailable: dto.isAvailable }),
        ...(dto.categoryId && { categoryId: dto.categoryId }),
      },
    });
  }

  async deleteMenuItem(tenantId: string, itemId: string) {
    const item = await this.prisma.menuItem.findUnique({
      where: { id: itemId },
      include: { category: true },
    });
    
    if (!item || item.category.tenantId !== tenantId) {
      throw new NotFoundException('Article introuvable.');
    }

    return this.prisma.menuItem.delete({
      where: { id: itemId },
    });
  }

  // --- SETTINGS MANAGEMENT ---

  async updateSettings(tenantId: string, dto: UpdateRestaurantSettingsDto) {
    const restaurant = await this.prisma.restaurant.findUnique({ where: { tenantId } });
    if (!restaurant) {
      throw new NotFoundException('Restaurant introuvable.');
    }

    return this.prisma.restaurant.update({
      where: { tenantId },
      data: {
        ...(dto.cuisineType && { cuisineType: dto.cuisineType }),
        ...(dto.priceRange && { priceRange: dto.priceRange }),
        ...(dto.openingHours !== undefined && { openingHours: dto.openingHours }),
        ...(dto.capacity !== undefined && { capacity: dto.capacity }),
      },
    });
  }
}
