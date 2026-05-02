import api from './api';

export interface BankTransaction {
  id: number;
  gateway: string;
  transactionDate: string;
  transferAmount: number;
  content: string;
  referenceCode?: string;
  matchedInvoiceId?: number;
  matchedCompanyName?: string;
  createdAt: string;
}

export const bankTransactionService = {
  getAll: () => api.get<BankTransaction[]>('/banktransactions').then(r => r.data),
  manualMatch: (transactionId: number, invoiceId: number) =>
    api.post<BankTransaction>(`/banktransactions/${transactionId}/match/${invoiceId}`).then(r => r.data),
};
