import { useEffect, useState } from 'react';
import { Table, Button, Modal, Form, Select, InputNumber, DatePicker, Input, Space, Popconfirm, message, Grid } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { contractService } from '../../services/contractService';
import { companyService } from '../../services/companyService';
import { officeService } from '../../services/officeService';
import { Contract, ContractStatus, Company, Office, OfficeStatus } from '../../types';
import { formatCurrency, formatDate } from '../../utils/format';
import { ContractStatusTag } from '../../components/StatusTag';

const { useBreakpoint } = Grid;

export default function ContractsPage() {
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [offices, setOffices] = useState<Office[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Contract | null>(null);
  const [form] = Form.useForm();
  const screens = useBreakpoint();
  const isMobile = !screens.sm;

  const load = () => {
    setLoading(true);
    Promise.all([contractService.getAll(), companyService.getAll(), officeService.getAll()])
      .then(([c, comp, off]) => { setContracts(c); setCompanies(comp); setOffices(off); })
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const availableOffices = offices.filter(o =>
    o.status === OfficeStatus.Available || (editing && o.id === editing.officeId)
  );

  const openCreate = () => { setEditing(null); form.resetFields(); setModalOpen(true); };
  const openEdit = (c: Contract) => {
    setEditing(c);
    form.setFieldsValue({ ...c, startDate: dayjs(c.startDate), endDate: dayjs(c.endDate) });
    setModalOpen(true);
  };

  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      const payload = { ...values, startDate: values.startDate.toISOString(), endDate: values.endDate.toISOString() };
      if (editing) {
        await contractService.update(editing.id, payload);
        message.success('Cập nhật thành công');
      } else {
        await contractService.create(payload);
        message.success('Tạo hợp đồng thành công');
      }
      setModalOpen(false);
      load();
    } catch {}
  };

  const handleDelete = async (id: number) => {
    try {
      await contractService.delete(id);
      message.success('Đã xóa');
      load();
    } catch {
      message.error('Không thể xóa hợp đồng có hóa đơn liên quan');
    }
  };

  const mobileColumns = [
    {
      title: 'Hợp đồng',
      render: (_: unknown, r: Contract) => (
        <div>
          <div style={{ fontWeight: 600, fontSize: 13 }}>{r.companyName}</div>
          <div style={{ color: '#888', fontSize: 12 }}>{r.officeName} · {formatCurrency(r.monthlyRent)}/tháng</div>
          <div style={{ fontSize: 12, marginTop: 2 }}>
            {formatDate(r.startDate)} → {formatDate(r.endDate)}
          </div>
          <ContractStatusTag status={r.status} />
        </div>
      ),
    },
    {
      title: '',
      width: 72,
      render: (_: unknown, record: Contract) => (
        <Space size={4}>
          <Button size="small" icon={<EditOutlined />} onClick={() => openEdit(record)} />
          <Popconfirm title="Xóa?" onConfirm={() => handleDelete(record.id)} okText="Xóa" cancelText="Hủy">
            <Button size="small" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const desktopColumns = [
    { title: 'Công ty', dataIndex: 'companyName', width: 180, ellipsis: true },
    { title: 'VP', dataIndex: 'officeName', width: 80 },
    { title: 'Tầng', dataIndex: 'floorInfo', width: 80 },
    { title: 'Tiền thuê/tháng', dataIndex: 'monthlyRent', width: 150, render: formatCurrency },
    { title: 'Tiền cọc', dataIndex: 'deposit', width: 140, render: formatCurrency },
    { title: 'Bắt đầu', dataIndex: 'startDate', width: 100, render: formatDate },
    { title: 'Kết thúc', dataIndex: 'endDate', width: 100, render: formatDate },
    { title: 'Trạng thái', dataIndex: 'status', width: 140, render: (s: ContractStatus) => <ContractStatusTag status={s} /> },
    {
      title: 'Thao tác', width: 90,
      render: (_: unknown, record: Contract) => (
        <Space>
          <Button size="small" icon={<EditOutlined />} onClick={() => openEdit(record)} />
          <Popconfirm title="Xác nhận xóa?" onConfirm={() => handleDelete(record.id)} okText="Xóa" cancelText="Hủy">
            <Button size="small" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 8 }}>
        <h2 style={{ margin: 0 }}>Quản lý Hợp đồng</h2>
        <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>
          {isMobile ? 'Thêm' : 'Thêm hợp đồng'}
        </Button>
      </div>

      <Table
        dataSource={contracts}
        columns={isMobile ? mobileColumns : desktopColumns}
        rowKey="id"
        loading={loading}
        scroll={{ x: isMobile ? undefined : 1000 }}
        size="small"
      />

      <Modal
        title={editing ? 'Chỉnh sửa hợp đồng' : 'Thêm hợp đồng mới'}
        open={modalOpen}
        onOk={handleSave}
        onCancel={() => setModalOpen(false)}
        okText="Lưu"
        cancelText="Hủy"
        width={isMobile ? '100%' : 640}
        style={isMobile ? { top: 0, margin: 0 } : {}}
        styles={isMobile ? { body: { maxHeight: 'calc(100dvh - 110px)', overflowY: 'auto' } } : {}}
      >
        <Form form={form} layout="vertical">
          <Form.Item name="companyId" label="Công ty" rules={[{ required: true }]}>
            <Select showSearch optionFilterProp="label" options={companies.map(c => ({ value: c.id, label: c.name }))} />
          </Form.Item>
          <Form.Item name="officeId" label="Văn phòng" rules={[{ required: true }]}>
            <Select options={availableOffices.map(o => ({
              value: o.id,
              label: `${o.officeName} - Tầng ${o.floorNumber} (${formatCurrency(o.monthlyPrice)}/tháng)`
            }))} />
          </Form.Item>
          <Form.Item name="startDate" label="Ngày bắt đầu" rules={[{ required: true }]}>
            <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" inputReadOnly={isMobile} />
          </Form.Item>
          <Form.Item name="endDate" label="Ngày kết thúc" rules={[{ required: true }]}>
            <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" inputReadOnly={isMobile} />
          </Form.Item>
          <Form.Item name="monthlyRent" label="Tiền thuê/tháng (VND)" rules={[{ required: true }]}>
            <InputNumber style={{ width: '100%' }} min={0} step={1000000} inputMode="numeric" formatter={v => `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')} />
          </Form.Item>
          <Form.Item name="deposit" label="Tiền cọc (VND)" rules={[{ required: true }]}>
            <InputNumber style={{ width: '100%' }} min={0} step={1000000} inputMode="numeric" formatter={v => `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')} />
          </Form.Item>
          {editing && (
            <Form.Item name="status" label="Trạng thái">
              <Select options={[
                { value: ContractStatus.Active, label: 'Đang hiệu lực' },
                { value: ContractStatus.Expired, label: 'Hết hạn' },
                { value: ContractStatus.Terminated, label: 'Đã chấm dứt' },
              ]} />
            </Form.Item>
          )}
          <Form.Item name="notes" label="Ghi chú">
            <Input.TextArea rows={3} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
