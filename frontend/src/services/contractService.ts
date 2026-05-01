import api from './api';
import { Contract } from '../types';

export const contractService = {
  getAll: () => api.get<Contract[]>('/contracts').then(r => r.data),
  getById: (id: number) => api.get<Contract>(`/contracts/${id}`).then(r => r.data),
  getByCompany: (companyId: number) => api.get<Contract[]>(`/contracts/company/${companyId}`).then(r => r.data),
  create: (data: object) => api.post<Contract>('/contracts', data).then(r => r.data),
  update: (id: number, data: object) => api.put<Contract>(`/contracts/${id}`, data).then(r => r.data),
  delete: (id: number) => api.delete(`/contracts/${id}`),
};
