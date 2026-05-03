import api from './api';
import { Dashboard, Invoice } from '../types';

export const invoiceService = {
  getAll: (year?: number, month?: number) => {
    const params = new URLSearchParams();
    if (year) params.append('year', String(year));
    if (month) params.append('month', String(month));
    return api.get<Invoice[]>(`/invoices?${params}`).then(r => r.data);
  },
  getById: (id: number) => api.get<Invoice>(`/invoices/${id}`).then(r => r.data),
  getByContract: (contractId: number) => api.get<Invoice[]>(`/invoices/contract/${contractId}`).then(r => r.data),
  create: (data: object) => api.post<Invoice>('/invoices', data).then(r => r.data),
  markAsPaid: (id: number, paidDate: string) =>
    api.patch<Invoice>(`/invoices/${id}/pay`, { paidDate }).then(r => r.data),
  updateStatus: (id: number, status: number) =>
    api.patch<Invoice>(`/invoices/${id}/status`, { status }).then(r => r.data),
  delete: (id: number) => api.delete(`/invoices/${id}`),
  getDashboard: () => api.get<Dashboard>('/dashboard').then(r => r.data),
};
