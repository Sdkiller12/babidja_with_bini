import http from '../http'
import type { Tenant } from '@/types/catalog'

export interface AdminDashboardStats {
  totalTenants: number
  hotelsCount: number
  carRentalsCount: number
  totalUsers: number
  customersCount: number
  totalBookings: number
  pendingBookings: number
  confirmedBookings: number
  totalRevenue: number
}

export interface AdminTransaction {
  id: string
  bookingId: string
  provider: string
  method: string
  amount: string | number
  status: string
  createdAt: string
  booking?: {
    user?: {
      firstName: string
      lastName: string
      email: string
    }
    tenant?: {
      name: string
    }
  }
}

export const fetchAdminDashboard = async (): Promise<AdminDashboardStats> => {
  const { data } = await http.get('/admin/dashboard')
  return data
}

export const fetchAdminTenants = async (): Promise<Tenant[]> => {
  const { data } = await http.get('/admin/tenants')
  return data
}

export const fetchAdminTransactions = async (): Promise<AdminTransaction[]> => {
  const { data } = await http.get('/admin/transactions')
  return data
}

import { PartnerApplication } from './partners';

export const fetchAdminPartnerApplications = async (): Promise<PartnerApplication[]> => {
  const { data } = await http.get('/admin/partner-applications')
  return data
}

export const updateAdminPartnerApplicationStatus = async (
  id: string,
  status: string,
  reviewNotes?: string
): Promise<PartnerApplication> => {
  const { data } = await http.patch(`/admin/partner-applications/${id}`, { status, reviewNotes })
  return data
}

export interface Commission {
  id: string;
  tenantId: string;
  bookingType: string;
  bookingRef: string;
  grossAmount: string | number;
  commissionRate: string | number;
  commissionAmount: string | number;
  netAmount: string | number;
  payoutStatus: 'PENDING' | 'PAID';
  createdAt: string;
  tenant?: {
    name: string;
    type: string;
  };
}

export interface AdminCommissionsData {
  items: Commission[];
  totals: {
    totalGross: number;
    totalCommission: number;
    pendingCommission: number;
  };
}

export const fetchAdminCommissions = async (tenantId?: string): Promise<AdminCommissionsData> => {
  const params = tenantId ? { tenantId } : {};
  const { data } = await http.get('/admin/commissions', { params });
  return data;
}

export const deleteAdminTenant = async (id: string): Promise<void> => {
  const { data } = await http.delete(`/admin/tenants/${id}`);
  return data;
}
