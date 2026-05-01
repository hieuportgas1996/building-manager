import { useEffect, useState } from 'react';
import { Table, Button, Modal, Form, Input, Space, Popconfirm, message, Tag, Grid } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { companyService } from '../../services/companyService';
import { Company } from '../../types';
import { formatDate } from '../../utils/format';

const { useBreakpoint } = Grid;

export default function CompaniesPage() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Company | null>(null);
  const [form] = Form.useForm();
  const screens = useBreakpoint();
  const isMobile = !screens.sm;

  const load = () => {
    setLoading(true);
    companyService.getAll().then(setCompanies).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const openCreate = () => { setEditing(null); form.resetFields(); setModalOpen(true); };
  const openEdit = (c: Company) => { setEditing(c); form.setFieldsValue(c); setModalOpen(true); };

  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      if (editing) {
        await companyService.update(editing.id, values);
        message.success('Cập nhật thành công');
      } else {
        await companyService.create(values);
        message.success('Thêm mới thành công');
      }
      setModalOpen(false);
      load();
    } catch {}
  };

  const handleDelete = async (id: number) => {
    try {
      await companyService.delete(id);
      message.success('Đã xóa');
      load();
    } catch {
      message.error('Không thể xóa, công ty có hợp đồng liên quan');
    }
  };

  const mobileColumns = [
    {
      title: 'Công ty',
      render: (_: unknown, r: Company) => (
        <div>
          <div style={{ fontWeight: 600, fontSize: 13 }}>{r.name}</div>
          <div style={{ color: '#888', fontSize: 12 }}>{r.taxCode}</div>
          <Tag color={r.activeContractsCount > 0 ? 'green' : 'default'} style={{ marginTop: 4 }}>
            {r.activeContractsCount} HĐ
          </Tag>
        </div>
      ),
    },
    {
      title: '',
      width: 72,
      render: (_: unknown, record: Company) => (
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
    { title: 'Tên công ty', dataIndex: 'name', width: 200, ellipsis: true },
    { title: 'Mã số thuế', dataIndex: 'taxCode', width: 140 },
    { title: 'Địa chỉ thuế', dataIndex: 'taxAddress', ellipsis: true },
    { title: 'Liên hệ', dataIndex: 'contactPerson', width: 130, ellipsis: true },
    { title: 'SĐT', dataIndex: 'contactPhone', width: 130 },
    {
      title: 'HĐ hiệu lực', dataIndex: 'activeContractsCount', width: 110,
      render: (v: number) => <Tag color={v > 0 ? 'green' : 'default'}>{v} hợp đồng</Tag>,
    },
    { title: 'Ngày tạo', dataIndex: 'createdAt', width: 110, render: formatDate },
    {
      title: 'Thao tác', width: 90,
      render: (_: unknown, record: Company) => (
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
        <h2 style={{ margin: 0 }}>Quản lý Công ty</h2>
        <Button type="primary" icon={<PlusOutlined />} onClick={openCreate} size={isMobile ? 'middle' : 'middle'}>
          {isMobile ? 'Thêm' : 'Thêm công ty'}
        </Button>
      </div>

      <Table
        dataSource={companies}
        columns={isMobile ? mobileColumns : desktopColumns}
        rowKey="id"
        loading={loading}
        scroll={{ x: isMobile ? undefined : 900 }}
        size="small"
      />

      <Modal
        title={editing ? 'Chỉnh sửa công ty' : 'Thêm công ty mới'}
        open={modalOpen}
        onOk={handleSave}
        onCancel={() => setModalOpen(false)}
        okText="Lưu"
        cancelText="Hủy"
        width={isMobile ? '100%' : 600}
        style={isMobile ? { top: 0, margin: 0, padding: 0 } : {}}
        styles={isMobile ? { body: { maxHeight: 'calc(100dvh - 110px)', overflowY: 'auto' } } : {}}
      >
        <Form form={form} layout="vertical">
          <Form.Item name="name" label="Tên công ty" rules={[{ required: true, message: 'Nhập tên công ty' }]}>
            <Input />
          </Form.Item>
          <Form.Item name="taxCode" label="Mã số thuế" rules={[{ required: true, message: 'Nhập MST' }]}>
            <Input />
          </Form.Item>
          <Form.Item name="taxAddress" label="Địa chỉ thuế" rules={[{ required: true, message: 'Nhập địa chỉ thuế' }]}>
            <Input />
          </Form.Item>
          <Form.Item name="contactPerson" label="Người liên hệ">
            <Input />
          </Form.Item>
          <Form.Item name="contactPhone" label="Số điện thoại">
            <Input inputMode="tel" />
          </Form.Item>
          <Form.Item name="contactEmail" label="Email">
            <Input type="email" inputMode="email" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
