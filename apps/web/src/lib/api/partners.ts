import http from '../http'

export interface PartnerApplication {
  id: string;
  businessName: string;
  serviceType: string;
  registryNumber: string;
  contactPhone: string;
  contactEmail: string;
  legalDocUrl: string;
  idDocUrl: string;
  status: 'PENDING' | 'UNDER_REVIEW' | 'APPROVED' | 'REJECTED' | 'NEEDS_INFO';
  createdAt: string;
  applicant?: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
  };
}

export const applyForPartnership = async (formData: FormData): Promise<PartnerApplication> => {
  const { data } = await http.post('/partners/apply', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return data;
}

export const fetchMyApplicationStatus = async (): Promise<PartnerApplication[]> => {
  const { data } = await http.get('/partners/me/application-status');
  return data;
}
