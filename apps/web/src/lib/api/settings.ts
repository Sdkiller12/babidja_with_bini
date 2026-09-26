import http from '../http';

export interface PlatformSetting {
  key: string;
  value: string;
  description?: string;
  updatedAt: string;
}

export const getSettings = async (): Promise<PlatformSetting[]> => {
  const { data } = await http.get('/admin/settings');
  return data;
};

export const updateSettings = async (settings: { key: string; value: string; description?: string }[]) => {
  const { data } = await http.patch('/admin/settings', settings);
  return data;
};
