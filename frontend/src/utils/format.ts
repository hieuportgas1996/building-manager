export const formatCurrency = (value: number) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);

export const formatDate = (date: string) =>
  new Date(date).toLocaleDateString('vi-VN');
