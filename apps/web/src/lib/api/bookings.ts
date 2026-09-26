import http from '../http';
import type { Booking, CreateBookingPayload } from '@/types/booking';

export const createBooking = async (payload: CreateBookingPayload): Promise<Booking> => {
  const { data } = await http.post('/bookings', payload);
  return data;
};

import { PaginatedResponse } from '@/types/pagination';

export const fetchMyBookings = async (page = 1, limit = 10): Promise<PaginatedResponse<Booking>> => {
  const { data } = await http.get('/bookings/my-bookings', { params: { page, limit } });
  return data;
};

export const submitReview = async (
  bookingId: string,
  payload: { rating: number; comment?: string }
): Promise<any> => {
  const { data } = await http.post(`/bookings/${bookingId}/review`, payload);
  return data;
};
