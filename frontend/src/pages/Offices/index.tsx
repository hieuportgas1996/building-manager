import { useEffect, useState } from 'react';
import { Table, Button, Modal, Form, Input, InputNumber, Select, Space, Popconfirm, message, Grid } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { officeService } from '../../services/officeService';
import { buildingService, BuildingDto, FloorDto } from '../../services/buildingService';
import { Office, OfficeStatus } from '../../types';
import { formatCurrency } from '../../utils/format';
import { OfficeStatusTag } from '../../components/StatusTag';

const { useBreakpoint } = Grid;

export default function OfficesPage() {
  const [offices, setOffices] = useState<Office[]>([]);
  const [buildings, setBuildings] = useState<BuildingDto[]>([]);
  const [floors, setFloors] = useState<FloorDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Office | null>(null);
  const [form] = Form.useForm();
  const screens = useBreakpoint();
  const isMobile = !screens.sm;

  const load = () => {
    setLoading(true);
    Promise.all([officeService.getAll(), buildingService.getAll()])
      .then(([o, b]) => { setOffices(o); setBuildings(b); })
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const openCreate = () => {
    setEditing(null);
    form.resetFields();
    setFloors([]);
    setModalOpen(true);
  };

  const openEdit = (o: Office) => {
    setEditing(o);
    // load floors for the building of this office
    const building = buildings.find(b => b.floors.some(f => f.id === o.floorId));
    if (building) {
      form.setFieldsValue({ ...o, buildingId: building.id });
      setFloors(building.floors);
    } else {
      form.setFieldsValue(o);
    }
    setModalOpen(true);
  };

  const handleBuildingChange = (buildingId: number) => {
    const b = buildings.find(b => b.id === buildingId);
    setFloors(b?.floors ?? []);
    form.setFieldValue('floorId', undefined);
  };

  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      const { buildingId: _, ...dto } = values;
      if (editing) {
        await officeService.update(editing.id, dto);
        message.success('Cập nhật thành công');
      } else {
        await officeService.create(dto);
        message.success('Thêm mới thành công');
      }
      setModalOpen(false);
      load();
    } catch {}
  };

  const handleDelete = async (id: number) => {
    try {
      await officeService.delete(id);
      message.success('Đã xóa');
      load();
    } catch {
      message.error('Không thể xóa văn phòng đang có hợp đồng');
    }
  };

  const mobileColumns = [
    {
      title: 'Văn phòng',
      render: (_: unknown, r: Office) => (
        <div>
          <div style={{ fontWeight: 600 }}>{r.officeName} — {r.buildingName}</div>
          <div style={{ color: '#888', fontSize: 12 }}>Tầng {r.floorNumber} · {formatCurrency(r.monthlyPrice)}/tháng</div>
          <OfficeStatusTag status={r.status} />
        </div>
      ),
    },
    {
      title: '', width: 72,
      render: (_: unknown, record: Office) => (
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
    { title: 'Tên VP', dataIndex: 'officeName', width: 100 },
    { title: 'Tòa nhà', dataIndex: 'buildingName', ellipsis: true },
    { title: 'Tầng', dataIndex: 'floorNumber', width: 70 },
    { title: 'Diện tích', dataIndex: 'area', width: 110, render: (v: number) => `${v} m²` },
    { title: 'Giá/m²', dataIndex: 'pricePerM2', width: 130, render: formatCurrency },
    { title: 'Giá thuê/tháng', dataIndex: 'monthlyPrice', width: 150, render: formatCurrency },
    { title: 'Trạng thái', dataIndex: 'status', width: 120, render: (s: OfficeStatus) => <OfficeStatusTag status={s} /> },
    {
      title: 'Thao tác', width: 90,
      render: (_: unknown, record: Office) => (
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
        <h2 style={{ margin: 0 }}>Quản lý Văn phòng</h2>
        <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>
          {isMobile ? 'Thêm' : 'Thêm văn phòng'}
        </Button>
      </div>

      <Table
        dataSource={offices} columns={isMobile ? mobileColumns : desktopColumns}
        rowKey="id" loading={loading}
        scroll={{ x: isMobile ? undefined : 900 }} size="small"
      />

      <Modal
        title={editing ? 'Chỉnh sửa văn phòng' : 'Thêm văn phòng mới'}
        open={modalOpen} onOk={handleSave} onCancel={() => setModalOpen(false)}
        okText="Lưu" cancelText="Hủy"
        width={isMobile ? '100%' : 480}
        style={isMobile ? { top: 0, margin: 0 } : {}}
        styles={isMobile ? { body: { maxHeight: 'calc(100dvh - 110px)', overflowY: 'auto' } } : {}}
      >
        <Form form={form} layout="vertical">
          <Form.Item name="buildingId" label="Tòa nhà" rules={[{ required: true, message: 'Chọn tòa nhà' }]}>
            <Select
              placeholder="Chọn tòa nhà"
              options={buildings.map(b => ({ value: b.id, label: b.name }))}
              onChange={handleBuildingChange}
            />
          </Form.Item>
          <Form.Item name="floorId" label="Tầng" rules={[{ required: true, message: 'Chọn tầng' }]}>
            <Select
              placeholder={floors.length ? 'Chọn tầng' : 'Chọn tòa nhà trước'}
              disabled={!floors.length}
              options={floors.map(f => ({ value: f.id, label: `Tầng ${f.floorNumber}` }))}
            />
          </Form.Item>
          <Form.Item name="officeName" label="Tên văn phòng" rules={[{ required: true }]}>
            <Input placeholder="VD: P101" />
          </Form.Item>
          <Form.Item name="area" label="Diện tích (m²)" rules={[{ required: true }]}>
            <InputNumber style={{ width: '100%' }} min={1} inputMode="decimal" />
          </Form.Item>
          <Form.Item name="pricePerM2" label="Giá/m² (VND)" rules={[{ required: true }]}>
            <InputNumber
              style={{ width: '100%' }} min={0} step={10000} inputMode="numeric"
              formatter={v => `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
            />
          </Form.Item>
          {editing && (
            <Form.Item name="status" label="Trạng thái">
              <Select options={[
                { value: OfficeStatus.Available, label: 'Còn trống' },
                { value: OfficeStatus.Rented, label: 'Đang thuê' },
                { value: OfficeStatus.Maintenance, label: 'Bảo trì' },
              ]} />
            </Form.Item>
          )}
        </Form>
      </Modal>
    </div>
  );
}
