import { Tag } from 'antd';
import { ContractStatus, InvoiceStatus, OfficeStatus } from '../types';

export function ContractStatusTag({ status }: { status: ContractStatus }) {
  const map: Record<ContractStatus, { color: string; label: string }> = {
    [ContractStatus.Active]: { color: 'green', label: 'Đang hiệu lực' },
    [ContractStatus.Expired]: { color: 'orange', label: 'Hết hạn' },
    [ContractStatus.Terminated]: { color: 'red', label: 'Đã chấm dứt' },
  };
  const { color, label } = map[status] ?? { color: 'default', label: 'Không xác định' };
  return <Tag color={color}>{label}</Tag>;
}

export function InvoiceStatusTag({ status }: { status: InvoiceStatus }) {
  const map: Record<InvoiceStatus, { color: string; label: string }> = {
    [InvoiceStatus.Pending]: { color: 'blue', label: 'Chờ thanh toán' },
    [InvoiceStatus.Paid]: { color: 'green', label: 'Đã thanh toán' },
    [InvoiceStatus.Overdue]: { color: 'red', label: 'Quá hạn' },
  };
  const { color, label } = map[status] ?? { color: 'default', label: 'Không xác định' };
  return <Tag color={color}>{label}</Tag>;
}

export function OfficeStatusTag({ status }: { status: OfficeStatus }) {
  const map: Record<OfficeStatus, { color: string; label: string }> = {
    [OfficeStatus.Available]: { color: 'green', label: 'Còn trống' },
    [OfficeStatus.Rented]: { color: 'blue', label: 'Đang thuê' },
    [OfficeStatus.Maintenance]: { color: 'orange', label: 'Bảo trì' },
  };
  const { color, label } = map[status] ?? { color: 'default', label: 'Không xác định' };
  return <Tag color={color}>{label}</Tag>;
}
