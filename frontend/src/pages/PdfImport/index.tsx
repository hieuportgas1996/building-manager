import { useState } from 'react';
import {
  Upload, Button, Table, Tag, Form, Input, InputNumber,
  Modal, message, Space, Typography, Alert, Grid, Result,
} from 'antd';
import {
  InboxOutlined, CheckCircleOutlined, CloseCircleOutlined,
  EditOutlined, ImportOutlined,
} from '@ant-design/icons';
import type { UploadFile } from 'antd';
import { pdfImportService } from '../../services/pdfImportService';
import { PdfImportResult } from '../../types';

const { Dragger } = Upload;
const { Title } = Typography;
const { useBreakpoint } = Grid;

interface ParsedRow extends PdfImportResult {
  key: string;
  fileName: string;
  imported?: boolean;
  importError?: string;
}

export default function PdfImportPage() {
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [rows, setRows] = useState<ParsedRow[]>([]);
  const [parsing, setParsing] = useState(false);
  const [importing, setImporting] = useState(false);
  const [editingRow, setEditingRow] = useState<ParsedRow | null>(null);
  const [done, setDone] = useState(false);
  const [form] = Form.useForm();
  const screens = useBreakpoint();
  const isMobile = !screens.md;

  const handleParse = async () => {
    const files = fileList.map(f => f.originFileObj as File).filter(Boolean);
    if (!files.length) { message.warning('Chưa chọn file PDF'); return; }
    setParsing(true);
    try {
      const results = await pdfImportService.parseMultiple(files);
      setRows(results.map((r, i) => ({
        ...r,
        key: String(i),
        fileName: fileList[i]?.name ?? `file_${i + 1}.pdf`,
      })));
      setDone(false);
    } catch {
      message.error('Lỗi khi đọc PDF');
    } finally {
      setParsing(false);
    }
  };

  const handleImportAll = async () => {
    const valid = rows.filter(r => r.parseSuccess && !r.imported);
    if (!valid.length) { message.info('Không có dữ liệu để import'); return; }
    setImporting(true);
    try {
      const results = await pdfImportService.importMultiple(valid);
      let successCount = 0;
      setRows(prev => prev.map(row => {
        const idx = valid.findIndex(v => v.key === row.key);
        if (idx === -1) return row;
        const r = results[idx];
        if (r.success) { successCount++; return { ...row, imported: true }; }
        return { ...row, importError: r.error };
      }));
      message.success(`Đã import ${successCount}/${valid.length} hóa đơn vào hệ thống`);
      if (successCount === valid.length) setDone(true);
    } catch {
      message.error('Lỗi khi import');
    } finally {
      setImporting(false);
    }
  };

  const handleEdit = (row: ParsedRow) => {
    setEditingRow(row);
    form.setFieldsValue({ ...row, monthlyRent: row.monthlyRent });
  };

  const handleModalOk = async () => {
    const values = await form.validateFields();
    if (!editingRow) return;
    setRows(prev => prev.map(r => r.key === editingRow.key ? { ...r, ...values } : r));
    setEditingRow(null);
  };

  const successCount = rows.filter(r => r.imported).length;
  const readyCount = rows.filter(r => r.parseSuccess && !r.imported).length;

  const columns = [
    {
      title: 'File',
      dataIndex: 'fileName',
      width: 130,
      ellipsis: true,
    },
    {
      title: 'Tên công ty',
      dataIndex: 'companyName',
      ellipsis: true,
      render: (v: string, row: ParsedRow) =>
        row.parseSuccess
          ? <span style={{ fontWeight: 500 }}>{v}</span>
          : <span style={{ color: '#ff4d4f' }}>{row.parseError ?? 'Parse thất bại'}</span>,
    },
    ...(!isMobile ? [
      { title: 'MST', dataIndex: 'taxCode', width: 120 },
      {
        title: 'Tháng',
        width: 80,
        render: (_: unknown, r: ParsedRow) => r.month ? `T${r.month}/${r.year}` : '-',
      },
      {
        title: 'Tiền thuê',
        dataIndex: 'monthlyRent',
        width: 130,
        render: (v: number) => v ? v.toLocaleString('vi-VN') + ' ₫' : '-',
      },
    ] : []),
    {
      title: 'Trạng thái',
      width: 110,
      render: (_: unknown, row: ParsedRow) => {
        if (row.imported) return <Tag color="green" icon={<CheckCircleOutlined />}>Đã import</Tag>;
        if (row.importError) return <Tag color="red" icon={<CloseCircleOutlined />}>Lỗi</Tag>;
        if (row.parseSuccess) return <Tag color="blue">Sẵn sàng</Tag>;
        return <Tag color="red" icon={<CloseCircleOutlined />}>Parse lỗi</Tag>;
      },
    },
    {
      title: '',
      width: 60,
      render: (_: unknown, row: ParsedRow) =>
        !row.imported && row.parseSuccess ? (
          <Button size="small" icon={<EditOutlined />} onClick={() => handleEdit(row)} />
        ) : null,
    },
  ];

  if (done && successCount > 0) {
    return (
      <Result
        status="success"
        title={`Import thành công ${successCount} hóa đơn!`}
        subTitle="Vào tab Hóa đơn để xem và tick thanh toán khi công ty đã trả tiền."
        extra={[
          <Button key="back" onClick={() => { setRows([]); setFileList([]); setDone(false); }}>
            Import thêm
          </Button>,
        ]}
      />
    );
  }

  return (
    <div>
      <Title level={4} style={{ marginBottom: 16 }}>Import hóa đơn từ PDF</Title>

      <Alert
        type="info" showIcon style={{ marginBottom: 16 }}
        message="Upload file PDF hóa đơn đỏ. Hệ thống tự đọc tên công ty, mã số thuế, tháng, tiền thuê và tạo hóa đơn vào hệ thống."
      />

      <Dragger
        multiple accept=".pdf"
        fileList={fileList}
        beforeUpload={() => false}
        onChange={({ fileList: fl }) => { setFileList(fl); setRows([]); }}
        style={{ marginBottom: 16 }}
      >
        <p className="ant-upload-drag-icon"><InboxOutlined /></p>
        <p className="ant-upload-text">Kéo thả hoặc click để chọn file PDF</p>
        <p className="ant-upload-hint">Hỗ trợ upload nhiều file cùng lúc</p>
      </Dragger>

      <Space style={{ marginBottom: 16 }} wrap>
        <Button type="primary" loading={parsing} onClick={handleParse} disabled={!fileList.length}>
          Đọc PDF ({fileList.length} file)
        </Button>
        {readyCount > 0 && (
          <Button
            type="primary" icon={<ImportOutlined />}
            loading={importing} onClick={handleImportAll}
            style={{ background: '#52c41a', borderColor: '#52c41a' }}
          >
            Import {readyCount} hóa đơn vào hệ thống
          </Button>
        )}
      </Space>

      {rows.length > 0 && (
        <Table
          dataSource={rows} columns={columns}
          pagination={false} size="small" scroll={{ x: true }}
          summary={() => (
            <Table.Summary>
              <Table.Summary.Row>
                <Table.Summary.Cell index={0} colSpan={isMobile ? 3 : 6}>
                  <Space>
                    <Tag color="green">{successCount} đã import</Tag>
                    <Tag color="blue">{readyCount} sẵn sàng</Tag>
                    <Tag color="red">{rows.filter(r => !r.parseSuccess).length} lỗi</Tag>
                  </Space>
                </Table.Summary.Cell>
              </Table.Summary.Row>
            </Table.Summary>
          )}
        />
      )}

      <Modal
        title="Chỉnh sửa thông tin"
        open={!!editingRow}
        onOk={handleModalOk}
        onCancel={() => setEditingRow(null)}
        okText="Lưu" cancelText="Hủy"
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
          <Form.Item name="month" label="Tháng" rules={[{ required: true }]}>
            <InputNumber min={1} max={12} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="year" label="Năm" rules={[{ required: true }]}>
            <InputNumber min={2020} max={2030} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="monthlyRent" label="Tiền thuê (VND)">
            <InputNumber
              min={0} style={{ width: '100%' }}
              formatter={v => `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
