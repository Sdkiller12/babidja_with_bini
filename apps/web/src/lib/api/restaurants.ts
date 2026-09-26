import http from '../http';

export interface MenuItem {
  id: string;
  name: string;
  description?: string;
  price: string | number;
  isAvailable: boolean;
}

export interface MenuCategory {
  id: string;
  name: string;
  items: MenuItem[];
}

export interface Restaurant {
  id: string;
  tenantId: string;
  cuisineType: string[];
  priceRange: string;
  openingHours: Record<string, unknown>;
  capacity: number;
  tenant?: {
    name: string;
    address: string;
    city: string;
    coverImageUrl?: string;
    images: string[];
    description?: string;
    menuCategories?: MenuCategory[];
  };
}

export interface CreateTableReservationDto {
  reservationDate: string;
  reservationTime: string;
  partySize: number;
  specialRequests?: string;
}

import { PaginatedResponse } from '@/types/pagination';

export const getRestaurants = async (params?: { city?: string; cuisine?: string; page?: number; limit?: number }): Promise<PaginatedResponse<Restaurant>> => {
  const { data } = await http.get('/restaurants', { params });
  return data;
};

export const getRestaurant = async (id: string): Promise<Restaurant> => {
  const { data } = await http.get(`/restaurants/${id}`);
  return data;
};

export const createReservation = async (id: string, dto: CreateTableReservationDto) => {
  const { data } = await http.post(`/restaurants/${id}/reservations`, dto);
  return data;
};

export const getTenantReservations = async (tenantId: string) => {
  const { data } = await http.get(`/tenant/${tenantId}/restaurant/reservations`);
  return data;
};

export const updateTenantReservationStatus = async (tenantId: string, reservationId: string, status: string) => {
  const { data } = await http.patch(`/tenant/${tenantId}/restaurant/reservations/${reservationId}/status`, { status });
  return data;
};
