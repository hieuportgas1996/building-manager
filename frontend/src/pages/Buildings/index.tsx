import { useEffect, useState } from 'react';
import {
  Table, Button, Modal, Form, Input, InputNumber,
  Space, Popconfirm, message, Typography, Collapse, Tag, Grid,
} from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, AppstoreOutlined } from '@ant-design/icons';
import { buildingService, BuildingDto, FloorDto } from '../../services/buildingService';

const { Title } = Typography;
const { Panel } = Collapse;
const { useBreakpoint } = Grid;

export default function BuildingsPage() {
  const [buildings, setBuildings] = useState<BuildingDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [buildingModal, setBuildingModal] = useState(false);
  const [floorModal, setFloorModal] = useState(false);
  const [editing, setEditing] = useState<BuildingDto | null>(null);
  const [selectedBuilding, setSelectedBuilding] = useState<BuildingDto | null>(null);
  const [buildingForm] = Form.useForm();
  const [floorForm] = Form.useForm();
  const screens = useBreakpoint();
  const isMobile = !screens.md;

  const load = () => {
    setLoading(true);
    buildingService.getAll().then(setBuildings).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const openCreateBuilding = () => { setEditing(null); buildingForm.resetFields(); setBuildingModal(true); };
  const openEditBuilding = (b: BuildingDto) => { setEditing(b); buildingForm.setFieldsValue(b); setBuildingModal(true); };
  const openAddFloor = (b: BuildingDto) => { setSelectedBuilding(b); floorForm.resetFields(); setFloorModal(true); };

  const handleSaveBuilding = async () => {
    try {
      const values = await buildingForm.validateFields();
      if (editing) {
        await buildingService.update(editing.id, values);
        message.success('Cập nhật thành công');
      } else {
        await buildingService.create(values);
        message.success('Thêm tòa nhà thành công');
      }
      setBuildingModal(false);
      load();
    } catch {}
  };

  const handleDeleteBuilding = async (id: number) => {
    try {
      await buildingService.delete(id);
      message.success('Đã xóa');
      load();
    } catch {
      message.error('Không thể xóa — tòa nhà đang có tầng/văn phòng');
    }
  };

  const handleSaveFloor = async () => {
    try {
      const values = await floorForm.validateFields();
      await buildingService.createFloor(selectedBuilding!.id, values);
      message.success('Thêm tầng thành công');
      setFloorModal(false);
      load();
    } catch {}
  };

  const handleDeleteFloor = async (floorId: number) => {
    try {
      await buildingService.deleteFloor(floorId);
      message.success('Đã xóa tầng');
      load();
    } catch {
      message.error('Không thể xóa — tầng đang có văn phòng');
    }
  };

  const floorColumns = [
    {
      title: 'STT',
      width: 60,
      align: 'center' as const,
      render: (_: unknown, __: FloorDto, idx: number) => idx + 1,
    },
    { title: 'Tầng', dataIndex: 'floorNumber', width: 80, render: (v: number) => `Tầng ${v}` },
    { title: 'Diện tích', dataIndex: 'totalArea', width: 120, render: (v: number) => `${v} m²` },
    { title: 'Văn phòng', dataIndex: 'officeCount', width: 100, render: (v: number) => <Tag>{v} VP</Tag> },
    {
      title: '',
      width: 60,
      render: (_: unknown, f: FloorDto) => (
        <Popconfirm title="Xóa tầng?" onConfirm={() => handleDeleteFloor(f.id)} okText="Xóa" cancelText="Hủy">
          <Button size="small" danger icon={<DeleteOutlined />} />
        </Popconfirm>
      ),
    },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <Title level={4} style={{ margin: 0 }}>Quản lý Tòa nhà</Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={openCreateBuilding}>
          {isMobile ? 'Thêm' : 'Thêm tòa nhà'}
        </Button>
      </div>

      {loading ? null : buildings.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 40, color: '#888' }}>
          Chưa có tòa nhà nào. Bấm "Thêm tòa nhà" để bắt đầu.
        </div>
      ) : (
        <Collapse accordion>
          {buildings.map(b => (
            <Panel
              key={b.id}
              header={
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', paddingRight: 8 }}>
                  <Space>
                    <AppstoreOutlined />
                    <span style={{ fontWeight: 600 }}>{b.name}</span>
                    <Tag color="blue">{b.totalFloors} tầng</Tag>
                    <span style={{ color: '#888', fontSize: 12 }}>{b.address}</span>
                  </Space>
                  <Space onClick={e => e.stopPropagation()}>
                    <Button size="small" icon={<PlusOutlined />} onClick={() => openAddFloor(b)}>
                      {isMobile ? '' : 'Thêm tầng'}
                    </Button>
                    <Button size="small" icon={<EditOutlined />} onClick={() => openEditBuilding(b)} />
                    <Popconfirm title="Xóa tòa nhà?" onConfirm={() => handleDeleteBuilding(b.id)} okText="Xóa" cancelText="Hủy">
                      <Button size="small" danger icon={<DeleteOutlined />} />
                    </Popconfirm>
                  </Space>
                </div>
              }
            >
              <Table
                dataSource={b.floors}
                columns={floorColumns}
                rowKey="id"
                size="small"
                pagination={false}
                locale={{ emptyText: 'Chưa có tầng nào' }}
              />
            </Panel>
          ))}
        </Collapse>
      )}

      {/* Building Modal */}
      <Modal
        title={editing ? 'Chỉnh sửa tòa nhà' : 'Thêm tòa nhà mới'}
        open={buildingModal}
        onOk={handleSaveBuilding}
        onCancel={() => setBuildingModal(false)}
        okText="Lưu" cancelText="Hủy"
      >
        <Form form={buildingForm} layout="vertical">
          <Form.Item name="name" label="Tên tòa nhà" rules={[{ required: true }]}>
            <Input placeholder="VD: ABC Tower" />
          </Form.Item>
          <Form.Item name="address" label="Địa chỉ" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="totalArea" label="Tổng diện tích (m²)">
            <InputNumber min={0} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="description" label="Mô tả">
            <Input.TextArea rows={2} />
          </Form.Item>
        </Form>
      </Modal>

      {/* Floor Modal */}
      <Modal
        title={`Thêm tầng — ${selectedBuilding?.name}`}
        open={floorModal}
        onOk={handleSaveFloor}
        onCancel={() => setFloorModal(false)}
        okText="Lưu" cancelText="Hủy"
      >
        <Form form={floorForm} layout="vertical">
          <Form.Item name="floorNumber" label="Số tầng" rules={[{ required: true }]}>
            <InputNumber min={1} max={100} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="totalArea" label="Diện tích tầng (m²)" rules={[{ required: true }]}>
            <InputNumber min={0} style={{ width: '100%' }} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
