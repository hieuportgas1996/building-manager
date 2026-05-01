import api from './api';
import { PdfImportResult } from '../types';

export const pdfImportService = {
  parseOne: (file: File) => {
    const form = new FormData();
    form.append('file', file);
    return api.post<PdfImportResult>('/pdfimport/parse', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }).then(r => r.data);
  },
  parseMultiple: (files: File[]) => {
    const form = new FormData();
    files.forEach(f => form.append('files', f));
    return api.post<PdfImportResult[]>('/pdfimport/parse-multiple', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }).then(r => r.data);
  },
};
