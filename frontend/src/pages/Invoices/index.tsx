import { useEffect, useState } from 'react';
import { Table, Button, Modal, Form, Select, InputNumber, DatePicker, Input, Space, Popconfirm, message, Grid, Tag } from 'antd';
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { invoiceService } from '../../services/invoiceService';
import { companyService } from '../../services/companyService';
import { Invoice, InvoiceStatus, Company } from '../../types';
import { formatCurrency, formatDate } from '../../utils/format';
import { defaultPagination } from '../../utils/tablePagination';

const { useBreakpoint } = Grid;

const MONTHS = Array.from({ length: 12 }, (_, i) => ({ value: i + 1, label: `T${i + 1}` }));
const MONTHS_FULL = Array.from({ length: 12 }, (_, i) => ({ value: i + 1, label: `Tháng ${i + 1}` }));
const currentYear = new Date().getFullYear();
const YEARS = [currentYear - 1, currentYear, currentYear + 1].map(y => ({ value: y, label: `${y}` }));

const STATUS_OPTIONS = [
  { value: InvoiceStatus.Pending, label: 'Chờ thanh toán', color: '#3b6ef5' },
  { value: InvoiceStatus.Paid, label: 'Đã thanh toán', color: '#10b981' },
  { value: InvoiceStatus.Overdue, label: 'Quá hạn', color: '#ef4444' },
];

function StatusSelector({ value, onChange, size = 'small' }: { value: InvoiceStatus; onChange: (v: InvoiceStatus) => void; size?: 'small' | 'middle' }) {
  const opt = STATUS_OPTIONS.find(o => o.value === value);
  return (
    <Select
      size={size}
      value={value}
      onChange={onChange}
      style={{ width: 140 }}
      options={STATUS_OPTIONS.map(o => ({
        value: o.value,
        label: <Tag color={o.color} style={{ margin: 0 }}>{o.label}</Tag>,
      }))}
      suffixIcon={null}
      bordered={false}
      dropdownStyle={{ minWidth: 160 }}
    />
  );
}

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [filterYear, setFilterYear] = useState<number | undefined>(currentYear);
  const [filterMonth, setFilterMonth] = useState<number | undefined>();
  const [form] = Form.useForm();
  const screens = useBreakpoint();
  const isMobile = !screens.sm;

  const load = () => {
    setLoading(true);
    Promise.all([invoiceService.getAll(filterYear, filterMonth), companyService.getAll()])
      .then(([inv, com]) => { setInvoices(inv); setCompanies(com); })
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [filterYear, filterMonth]);

  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      await invoiceService.create({ ...values, dueDate: values.dueDate.toISOString() });
      message.success('Tạo hóa đơn thành công');
      setModalOpen(false);
      load();
    } catch {}
  };

  const handleStatusChange = async (id: number, status: InvoiceStatus) => {
    try {
      await invoiceService.updateStatus(id, status);
      message.success('Đã cập nhật trạng thái');
      load();
    } catch {
      message.error('Không thể cập nhật');
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await invoiceService.delete(id);
      message.success('Đã xóa');
      load();
    } catch {
      message.error('Không thể xóa');
    }
  };

  const mobileColumns = [
    {
      title: 'STT',
      width: 40,
      align: 'center' as const,
      render: (_: unknown, __: Invoice, idx: number) => idx + 1,
    },
    {
      title: 'Hóa đơn',
      render: (_: unknown, r: Invoice) => (
        <div>
          <div style={{ fontWeight: 600, fontSize: 13 }}>{r.companyName}</div>
          <div style={{ color: '#888', fontSize: 12 }}>{r.invoiceMonth}/{r.invoiceYear}</div>
          <div style={{ fontWeight: 700, color: '#3b6ef5', fontSize: 13, marginBottom: 4 }}>{formatCurrency(r.totalAmount)}</div>
          <StatusSelector value={r.status} onChange={s => handleStatusChange(r.id, s)} />
        </div>
      ),
    },
    {
      title: '',
      width: 40,
      render: (_: unknown, record: Invoice) => (
        <Popconfirm title="Xóa?" onConfirm={() => handleDelete(record.id)} okText="Xóa" cancelText="Hủy">
          <Button size="small" danger icon={<DeleteOutlined />} />
        </Popconfirm>
      ),
    },
  ];

  const desktopColumns = [
    {
      title: 'STT',
      width: 60,
      align: 'center' as const,
      render: (_: unknown, __: Invoice, idx: number) => idx + 1,
    },
    { title: 'Công ty', dataIndex: 'companyName', ellipsis: true },
    { title: 'Kỳ', width: 70, render: (_: unknown, r: Invoice) => `${r.invoiceMonth}/${r.invoiceYear}` },
    { title: 'Tiền thuê', dataIndex: 'rentAmount', width: 130, render: formatCurrency },
    { title: 'Điện', dataIndex: 'electricityAmount', width: 110, render: formatCurrency },
    { title: 'Tổng cộng', dataIndex: 'totalAmount', width: 140, render: (v: number) => <strong style={{ color: '#3b6ef5' }}>{formatCurrency(v)}</strong> },
    { title: 'Hạn TT', dataIndex: 'dueDate', width: 100, render: formatDate },
    { title: 'Ngày TT', dataIndex: 'paidDate', width: 100, render: (v?: string) => v ? formatDate(v) : '-' },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      width: 160,
      render: (s: InvoiceStatus, r: Invoice) => (
        <StatusSelector value={s} onChange={ns => handleStatusChange(r.id, ns)} />
      ),
    },
    {
      title: 'Thao tác', width: 80, align: 'center' as const,
      render: (_: unknown, record: Invoice) => (
        <Popconfirm title="Xác nhận xóa?" onConfirm={() => handleDelete(record.id)} okText="Xóa" cancelText="Hủy">
          <Button size="small" danger icon={<DeleteOutlined />} />
        </Popconfirm>
      ),
    },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12, flexWrap: 'wrap', gap: 8, alignItems: 'center' }}>
        <h2 style={{ margin: 0 }}>Quản lý Hóa đơn</h2>
        <Space wrap size={6}>
          <Select placeholder="Năm" options={YEARS} value={filterYear} onChange={setFilterYear} allowClear style={{ width: 90 }} />
          <Select placeholder="Tháng" options={isMobile ? MONTHS : MONTHS_FULL} value={filterMonth} onChange={setFilterMonth} allowClear style={{ width: isMobile ? 70 : 110 }} />
          <Button type="primary" icon={<PlusOutlined />} onClick={() => { form.resetFields(); setModalOpen(true); }}>
            {isMobile ? 'Tạo' : 'Tạo hóa đơn'}
          </Button>
        </Space>
      </div>

      <Table
        dataSource={invoices}
        columns={isMobile ? mobileColumns : desktopColumns}
        rowKey="id"
        loading={loading}
        scroll={{ x: isMobile ? undefined : 1300 }}
        size="small"
        pagination={defaultPagination}
      />

      <Modal
        title="Tạo hóa đơn mới"
        open={modalOpen}
        onOk={handleSave}
        onCancel={() => setModalOpen(false)}
        okText="Tạo"
        cancelText="Hủy"
        width={isMobile ? '100%' : 640}
        style={isMobile ? { top: 0, margin: 0 } : {}}
        styles={isMobile ? { body: { maxHeight: 'calc(100dvh - 110px)', overflowY: 'auto' } } : {}}
      >
        <Form form={form} layout="vertical">
          <Form.Item name="companyId" label="Công ty" rules={[{ required: true }]}>
            <Select
              showSearch
              optionFilterProp="label"
              options={companies.map(c => ({
                value: c.id,
                label: c.name,
              }))}
            />
          </Form.Item>
          <Space style={{ width: '100%', gap: 8 }}>
            <Form.Item name="invoiceYear" label="Năm" rules={[{ required: true }]} style={{ flex: 1 }}>
              <Select options={YEARS} />
            </Form.Item>
            <Form.Item name="invoiceMonth" label="Tháng" rules={[{ required: true }]} style={{ flex: 1 }}>
              <Select options={MONTHS_FULL} />
            </Form.Item>
          </Space>
          <Form.Item name="rentAmount" label="Tiền thuê (VND)" rules={[{ required: true }]}>
            <InputNumber style={{ width: '100%' }} min={0} step={1000000} inputMode="numeric" formatter={v => `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')} />
          </Form.Item>
          <Form.Item name="electricityAmount" label="Tiền điện (VND)" rules={[{ required: true }]}>
            <InputNumber style={{ width: '100%' }} min={0} step={100000} inputMode="numeric" formatter={v => `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')} />
          </Form.Item>
          <Form.Item name="dueDate" label="Hạn thanh toán" rules={[{ required: true }]}>
            <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" inputReadOnly={isMobile} defaultValue={dayjs().add(15, 'day')} />
          </Form.Item>
          <Form.Item name="notes" label="Ghi chú">
            <Input.TextArea rows={2} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
