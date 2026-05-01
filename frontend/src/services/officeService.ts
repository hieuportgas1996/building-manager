import api from './api';
import { Office } from '../types';

export const officeService = {
  getAll: () => api.get<Office[]>('/offices').then(r => r.data),
  getById: (id: number) => api.get<Office>(`/offices/${id}`).then(r => r.data),
  create: (data: object) => api.post<Office>('/offices', data).then(r => r.data),
  update: (id: number, data: object) => api.put<Office>(`/offices/${id}`, data).then(r => r.data),
  delete: (id: number) => api.delete(`/offices/${id}`),
};
