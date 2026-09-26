import http from '../http';

export interface Employee {
  id: string;
  tenantId: string;
  userId: string;
  role: string;
  permissions: string[];
  isActive: boolean;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
  };
}

import { PaginatedResponse } from '@/types/pagination';

export const getTenantEmployees = async (tenantId: string, page = 1, limit = 10): Promise<PaginatedResponse<Employee>> => {
  const { data } = await http.get(`/tenant/${tenantId}/employees`, {
    params: { page, limit }
  });
  return data;
};

export const addTenantEmployee = async (tenantId: string, payload: any) => {
  const { data } = await http.post(`/tenant/${tenantId}/employees`, payload);
  return data;
};

export const updateTenantEmployee = async (tenantId: string, employeeId: string, payload: any) => {
  const { data } = await http.patch(`/tenant/${tenantId}/employees/${employeeId}`, payload);
  return data;
};
