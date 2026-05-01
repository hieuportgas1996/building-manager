import { useState } from 'react';
import {
  Upload, Button, Table, Tag, Form, Input, InputNumber,
  Modal, message, Space, Typography, Alert, Grid,
} from 'antd';
import { InboxOutlined, CheckCircleOutlined, CloseCircleOutlined, SaveOutlined } from '@ant-design/icons';
import type { UploadFile } from 'antd';
import { pdfImportService } from '../../services/pdfImportService';
import { companyService } from '../../services/companyService';
import { PdfImportResult } from '../../types';

const { Dragger } = Upload;
const { Title, Text } = Typography;
const { useBreakpoint } = Grid;

interface ParsedRow extends PdfImportResult {
  key: string;
  fileName: string;
  editing?: boolean;
  saved?: boolean;
}

export default function PdfImportPage() {
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [rows, setRows] = useState<ParsedRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingRow, setEditingRow] = useState<ParsedRow | null>(null);
  const [form] = Form.useForm();
  const screens = useBreakpoint();
  const isMobile = !screens.md;

  const handleParse = async () => {
    const files = fileList.map(f => f.originFileObj as File).filter(Boolean);
    if (!files.length) { message.warning('Chưa chọn file PDF'); return; }
    setLoading(true);
    try {
      const results = await pdfImportService.parseMultiple(files);
      const parsed: ParsedRow[] = results.map((r, i) => ({
        ...r,
        key: String(i),
        fileName: fileList[i]?.name ?? `file_${i + 1}.pdf`,
      }));
      setRows(parsed);
    } catch {
      message.error('Lỗi khi parse PDF');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (row: ParsedRow) => {
    setEditingRow(row);
    form.setFieldsValue(row);
  };

  const handleSaveOne = async (row: ParsedRow) => {
    try {
      await companyService.create({
        name: row.companyName,
        taxCode: row.taxCode,
        taxAddress: row.taxAddress,
        contactPerson: undefined,
        contactPhone: undefined,
        contactEmail: undefined,
      });
      setRows(prev => prev.map(r => r.key === row.key ? { ...r, saved: true } : r));
      message.success(`Đã lưu: ${row.companyName}`);
    } catch (e: any) {
      message.error(e?.response?.data?.message ?? 'Lỗi khi lưu công ty');
    }
  };

  const handleSaveAll = async () => {
    const unsaved = rows.filter(r => r.parseSuccess && !r.saved);
    if (!unsaved.length) { message.info('Không có dữ liệu mới để lưu'); return; }
    let success = 0;
    for (const row of unsaved) {
      try {
        await companyService.create({
          name: row.companyName,
          taxCode: row.taxCode,
          taxAddress: row.taxAddress,
          contactPerson: undefined,
          contactPhone: undefined,
          contactEmail: undefined,
        });
        setRows(prev => prev.map(r => r.key === row.key ? { ...r, saved: true } : r));
        success++;
      } catch { /* skip duplicates */ }
    }
    message.success(`Đã lưu ${success}/${unsaved.length} công ty`);
  };

  const handleModalOk = async () => {
    const values = await form.validateFields();
    if (!editingRow) return;
    const updated = { ...editingRow, ...values };
    setRows(prev => prev.map(r => r.key === editingRow.key ? updated : r));
    setEditingRow(null);
  };

  const columns = [
    {
      title: 'File',
      dataIndex: 'fileName',
      width: 140,
      ellipsis: true,
      render: (v: string) => <Text style={{ fontSize: 12 }}>{v}</Text>,
    },
    {
      title: 'Tên công ty',
      dataIndex: 'companyName',
      ellipsis: true,
      render: (v: string, row: ParsedRow) => (
        <span style={{ color: row.parseSuccess ? undefined : '#ff4d4f' }}>
          {v || row.parseError || 'Parse thất bại'}
        </span>
      ),
    },
    ...(!isMobile ? [
      { title: 'Mã số thuế', dataIndex: 'taxCode', width: 130 },
      { title: 'Tháng', dataIndex: 'month', width: 70, render: (v: number, r: ParsedRow) => v ? `T${v}/${r.year}` : '-' },
      { title: 'Tiền thuê', dataIndex: 'monthlyRent', width: 120, render: (v: number) => v ? v.toLocaleString('vi-VN') + ' ₫' : '-' },
    ] : []),
    {
      title: 'Trạng thái',
      width: 100,
      render: (_: unknown, row: ParsedRow) => (
        row.saved
          ? <Tag color="green" icon={<CheckCircleOutlined />}>Đã lưu</Tag>
          : row.parseSuccess
            ? <Tag color="blue">Sẵn sàng</Tag>
            : <Tag color="red" icon={<CloseCircleOutlined />}>Lỗi</Tag>
      ),
    },
    {
      title: '',
      width: isMobile ? 80 : 140,
      render: (_: unknown, row: ParsedRow) => (
        <Space size={4}>
          {!row.saved && (
            <Button size="small" onClick={() => handleEdit(row)}>Sửa</Button>
          )}
          {row.parseSuccess && !row.saved && (
            <Button size="small" type="primary" icon={<SaveOutlined />} onClick={() => handleSaveOne(row)}>
              {isMobile ? '' : 'Lưu'}
            </Button>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div>
      <Title level={4} style={{ marginBottom: 16 }}>Import công ty từ PDF hóa đơn</Title>

      <Alert
        type="info"
        showIcon
        style={{ marginBottom: 16 }}
        message="Upload nhiều file PDF hóa đơn đỏ cùng lúc. Hệ thống sẽ tự động đọc tên công ty, mã số thuế, địa chỉ."
      />

      <Dragger
        multiple
        accept=".pdf"
        fileList={fileList}
        beforeUpload={() => false}
        onChange={({ fileList: fl }) => setFileList(fl)}
        style={{ marginBottom: 16 }}
      >
        <p className="ant-upload-drag-icon"><InboxOutlined /></p>
        <p className="ant-upload-text">Kéo thả hoặc click để chọn file PDF</p>
        <p className="ant-upload-hint">Hỗ trợ upload nhiều file cùng lúc</p>
      </Dragger>

      <Space style={{ marginBottom: 16 }}>
        <Button type="primary" loading={loading} onClick={handleParse} disabled={!fileList.length}>
          Đọc PDF ({fileList.length} file)
        </Button>
        {rows.length > 0 && (
          <Button onClick={handleSaveAll}>
            Lưu tất cả
          </Button>
        )}
      </Space>

      {rows.length > 0 && (
        <Table
          dataSource={rows}
          columns={columns}
          pagination={false}
          size="small"
          scroll={{ x: true }}
        />
      )}

      <Modal
        title="Chỉnh sửa thông tin công ty"
        open={!!editingRow}
        onOk={handleModalOk}
        onCancel={() => setEditingRow(null)}
        okText="Lưu"
        cancelText="Hủy"
      >
        <Form form={form} layout="vertical">
          <Form.Item name="companyName" label="Tên công ty" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="taxCode" label="Mã số thuế" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="taxAddress" label="Địa chỉ">
            <Input.TextArea rows={2} />
          </Form.Item>
          <Form.Item name="month" label="Tháng">
            <InputNumber min={1} max={12} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="monthlyRent" label="Tiền thuê (VND)">
            <InputNumber min={0} style={{ width: '100%' }} formatter={v => `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
