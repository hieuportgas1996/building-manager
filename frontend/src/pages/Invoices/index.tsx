import { useEffect, useState } from 'react';
import { Table, Button, Modal, Form, Select, InputNumber, DatePicker, Input, Space, Popconfirm, message, Grid } from 'antd';
import { PlusOutlined, CheckOutlined, DeleteOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { invoiceService } from '../../services/invoiceService';
import { contractService } from '../../services/contractService';
import { Invoice, InvoiceStatus, Contract } from '../../types';
import { formatCurrency, formatDate } from '../../utils/format';
import { InvoiceStatusTag } from '../../components/StatusTag';

const { useBreakpoint } = Grid;

const MONTHS = Array.from({ length: 12 }, (_, i) => ({ value: i + 1, label: `T${i + 1}` }));
const MONTHS_FULL = Array.from({ length: 12 }, (_, i) => ({ value: i + 1, label: `Tháng ${i + 1}` }));
const currentYear = new Date().getFullYear();
const YEARS = [currentYear - 1, currentYear, currentYear + 1].map(y => ({ value: y, label: `${y}` }));

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [filterYear, setFilterYear] = useState<number | undefined>(currentYear);
  const [filterMonth, setFilterMonth] = useState<number | undefined>();
  const [form] = Form.useForm();
  const screens = useBreakpoint();
  const isMobile = !screens.sm;

  const load = () => {
    setLoading(true);
    Promise.all([invoiceService.getAll(filterYear, filterMonth), contractService.getAll()])
      .then(([inv, con]) => { setInvoices(inv); setContracts(con); })
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

  const handlePay = async (id: number) => {
    try {
      await invoiceService.markAsPaid(id, new Date().toISOString());
      message.success('Đã xác nhận thanh toán');
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
      title: 'Hóa đơn',
      render: (_: unknown, r: Invoice) => (
        <div>
          <div style={{ fontWeight: 600, fontSize: 13 }}>{r.companyName}</div>
          <div style={{ color: '#888', fontSize: 12 }}>{r.officeName} · {r.invoiceMonth}/{r.invoiceYear}</div>
          <div style={{ fontWeight: 700, color: '#1677ff', fontSize: 13 }}>{formatCurrency(r.totalAmount)}</div>
          <InvoiceStatusTag status={r.status} />
        </div>
      ),
    },
    {
      title: '',
      width: 90,
      render: (_: unknown, record: Invoice) => (
        <Space size={4} direction="vertical">
          {record.status !== InvoiceStatus.Paid && (
            <Button size="small" type="primary" icon={<CheckOutlined />} onClick={() => handlePay(record.id)} block>TT</Button>
          )}
          <Popconfirm title="Xóa?" onConfirm={() => handleDelete(record.id)} okText="Xóa" cancelText="Hủy">
            <Button size="small" danger icon={<DeleteOutlined />} block />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const desktopColumns = [
    { title: 'Công ty', dataIndex: 'companyName', ellipsis: true },
    { title: 'VP', dataIndex: 'officeName', width: 80 },
    { title: 'Kỳ', width: 70, render: (_: unknown, r: Invoice) => `${r.invoiceMonth}/${r.invoiceYear}` },
    { title: 'Tiền thuê', dataIndex: 'rentAmount', width: 130, render: formatCurrency },
    { title: 'Điện', dataIndex: 'electricityAmount', width: 110, render: formatCurrency },
    { title: 'Nước', dataIndex: 'waterAmount', width: 100, render: formatCurrency },
    { title: 'DV', dataIndex: 'serviceFee', width: 100, render: formatCurrency },
    { title: 'Tổng cộng', dataIndex: 'totalAmount', width: 140, render: (v: number) => <strong style={{ color: '#1677ff' }}>{formatCurrency(v)}</strong> },
    { title: 'Hạn TT', dataIndex: 'dueDate', width: 100, render: formatDate },
    { title: 'Ngày TT', dataIndex: 'paidDate', width: 100, render: (v?: string) => v ? formatDate(v) : '-' },
    { title: 'Trạng thái', dataIndex: 'status', width: 130, render: (s: InvoiceStatus) => <InvoiceStatusTag status={s} /> },
    {
      title: 'Thao tác', width: 120,
      render: (_: unknown, record: Invoice) => (
        <Space>
          {record.status !== InvoiceStatus.Paid && (
            <Button size="small" type="primary" icon={<CheckOutlined />} onClick={() => handlePay(record.id)}>TT</Button>
          )}
          <Popconfirm title="Xác nhận xóa?" onConfirm={() => handleDelete(record.id)} okText="Xóa" cancelText="Hủy">
            <Button size="small" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
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
        scroll={{ x: isMobile ? undefined : 1200 }}
        size="small"
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
          <Form.Item name="contractId" label="Hợp đồng" rules={[{ required: true }]}>
            <Select
              showSearch
              optionFilterProp="label"
              options={contracts.filter(c => c.status === 1).map(c => ({
                value: c.id,
                label: `${c.companyName} - ${c.officeName} (${formatCurrency(c.monthlyRent)}/tháng)`
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
          <Form.Item name="waterAmount" label="Tiền nước (VND)" rules={[{ required: true }]}>
            <InputNumber style={{ width: '100%' }} min={0} step={100000} inputMode="numeric" formatter={v => `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')} />
          </Form.Item>
          <Form.Item name="serviceFee" label="Phí dịch vụ (VND)" rules={[{ required: true }]}>
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
