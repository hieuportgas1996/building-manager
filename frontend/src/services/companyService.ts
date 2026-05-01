import api from './api';
import { Company } from '../types';

export const companyService = {
  getAll: () => api.get<Company[]>('/companies').then(r => r.data),
  getById: (id: number) => api.get<Company>(`/companies/${id}`).then(r => r.data),
  create: (data: Omit<Company, 'id' | 'createdAt' | 'activeContractsCount'>) =>
    api.post<Company>('/companies', data).then(r => r.data),
  update: (id: number, data: Omit<Company, 'id' | 'createdAt' | 'activeContractsCount'>) =>
    api.put<Company>(`/companies/${id}`, data).then(r => r.data),
  delete: (id: number) => api.delete(`/companies/${id}`),
};
