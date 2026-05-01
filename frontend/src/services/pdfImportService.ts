import api from './api';
import { PdfImportResult } from '../types';

export const pdfImportService = {
  parseMultiple: (files: File[]) => {
    const form = new FormData();
    files.forEach(f => form.append('files', f));
    return api.post<PdfImportResult[]>('/pdfimport/parse-multiple', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }).then(r => r.data);
  },
  importMultiple: (items: PdfImportResult[]) => {
    const dtos = items.map(i => ({
      companyName: i.companyName,
      taxCode: i.taxCode,
      taxAddress: i.taxAddress,
      invoiceMonth: i.month,
      invoiceYear: i.year,
      rentAmount: i.monthlyRent,
    }));
    return api.post<{ success: boolean; invoiceId?: number; companyName: string; error?: string }[]>(
      '/pdfimport/import-multiple', dtos
    ).then(r => r.data);
  },
};
