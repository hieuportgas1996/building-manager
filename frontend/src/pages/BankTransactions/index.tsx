import { useEffect, useState } from 'react';
import {
  Table, Tag, Typography, Alert, Button, Modal, Select, message, Grid, Space, Popconfirm,
} from 'antd';
import {
  CheckCircleOutlined, LinkOutlined, DisconnectOutlined, DeleteOutlined,
} from '@ant-design/icons';
import { bankTransactionService, BankTransaction } from '../../services/bankTransactionService';
import { invoiceService } from '../../services/invoiceService';
import { Invoice, InvoiceStatus } from '../../types';
import { formatCurrency } from '../../utils/format';

const { Title, Text } = Typography;
const { useBreakpoint } = Grid;

const VN_TZ = 'Asia/Ho_Chi_Minh';
function formatVNDate(iso: string) {
  return new Date(iso).toLocaleString('vi-VN', {
    timeZone: VN_TZ,
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function BankTransactionsPage() {
  const [txs, setTxs] = useState<BankTransaction[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [matchModal, setMatchModal] = useState<BankTransaction | null>(null);
  const [selectedInvoiceId, setSelectedInvoiceId] = useState<number | null>(null);
  const screens = useBreakpoint();
  const isMobile = !screens.md;

  const load = () => {
    setLoading(true);
    Promise.all([bankTransactionService.getAll(), invoiceService.getAll()])
      .then(([t, i]) => { setTxs(t); setInvoices(i); })
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleMatch = async () => {
    if (!matchModal || !selectedInvoiceId) return;
    try {
      await bankTransactionService.manualMatch(matchModal.id, selectedInvoiceId);
      message.success('Đã gắn giao dịch với hóa đơn');
      setMatchModal(null);
      setSelectedInvoiceId(null);
      load();
    } catch {
      message.error('Lỗi khi gắn giao dịch');
    }
  };

  const handleUnmatch = async (t: BankTransaction, revertInvoice: boolean) => {
    try {
      await bankTransactionService.unmatch(t.id, revertInvoice);
      message.success(revertInvoice ? 'Đã gỡ và đặt hóa đơn về Chờ thanh toán' : 'Đã gỡ giao dịch khỏi hóa đơn');
      load();
    } catch {
      message.error('Lỗi khi gỡ giao dịch');
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await bankTransactionService.delete(id);
      message.success('Đã xóa giao dịch');
      load();
    } catch {
      message.error('Không thể xóa');
    }
  };

  const pendingInvoices = invoices.filter(i => i.status !== InvoiceStatus.Paid);

  const renderActions = (t: BankTransaction) => (
    <Space size={4}>
      {t.matchedInvoiceId ? (
        <Popconfirm
          title="Gỡ giao dịch khỏi hóa đơn?"
          description="Hóa đơn sẽ chuyển về 'Chờ thanh toán'."
          onConfirm={() => handleUnmatch(t, true)}
          onCancel={() => handleUnmatch(t, false)}
          okText="Gỡ + đặt lại HĐ"
          cancelText="Chỉ gỡ"
        >
          <Button size="small" icon={<DisconnectOutlined />}>Gỡ</Button>
        </Popconfirm>
      ) : (
        <Button size="small" type="primary" icon={<LinkOutlined />} onClick={() => setMatchModal(t)}>
          Gắn
        </Button>
      )}
      <Popconfirm title="Xóa giao dịch?" onConfirm={() => handleDelete(t.id)} okText="Xóa" cancelText="Hủy">
        <Button size="small" danger icon={<DeleteOutlined />} />
      </Popconfirm>
    </Space>
  );

  const columns = [
    {
      title: 'STT', width: 60, align: 'center' as const,
      render: (_: unknown, __: BankTransaction, idx: number) => idx + 1,
    },
    {
      title: 'Thời gian', dataIndex: 'transactionDate', width: 150,
      render: (v: string) => formatVNDate(v),
    },
    {
      title: 'Ngân hàng', dataIndex: 'gateway', width: 100,
      render: (v: string) => <Tag color="blue">{v}</Tag>,
    },
    {
      title: 'Số tiền', dataIndex: 'transferAmount', width: 140,
      render: (v: number) => <Text strong style={{ color: '#10b981' }}>+{formatCurrency(v)}</Text>,
    },
    {
      title: 'Nội dung', dataIndex: 'content', ellipsis: true,
      render: (v: string) => <Text style={{ fontSize: 12 }}>{v}</Text>,
    },
    {
      title: 'Hóa đơn', width: 240,
      render: (_: unknown, t: BankTransaction) => t.matchedInvoiceId ? (
        <Tag color="green" icon={<CheckCircleOutlined />} style={{ whiteSpace: 'normal' }}>
          {t.matchedCompanyName ?? `HD #${t.matchedInvoiceId}`}
        </Tag>
      ) : (
        <Tag color="orange">Chưa gắn</Tag>
      ),
    },
    {
      title: 'Thao tác', width: 150, align: 'center' as const,
      render: (_: unknown, t: BankTransaction) => renderActions(t),
    },
  ];

  const mobileColumns = [
    {
      title: 'STT', width: 40, align: 'center' as const,
      render: (_: unknown, __: BankTransaction, idx: number) => idx + 1,
    },
    {
      title: 'Giao dịch',
      render: (_: unknown, t: BankTransaction) => (
        <div>
          <div>
            <Text strong style={{ color: '#10b981' }}>+{formatCurrency(t.transferAmount)}</Text>
            <Tag color="blue" style={{ marginLeft: 4 }}>{t.gateway}</Tag>
          </div>
          <div style={{ fontSize: 11, color: '#888' }}>{formatVNDate(t.transactionDate)}</div>
          <div style={{ fontSize: 12, marginTop: 4 }}>{t.content}</div>
          <div style={{ marginTop: 6, marginBottom: 6 }}>
            {t.matchedInvoiceId
              ? <Tag color="green" icon={<CheckCircleOutlined />}>{t.matchedCompanyName ?? `HD #${t.matchedInvoiceId}`}</Tag>
              : <Tag color="orange">Chưa gắn</Tag>
            }
          </div>
          {renderActions(t)}
        </div>
      ),
    },
  ];

  return (
    <div>
      <Title level={4} style={{ marginBottom: 16 }}>Lịch sử giao dịch ngân hàng</Title>

      <Alert
        type="info" showIcon style={{ marginBottom: 16 }}
        message="Hệ thống tự động nhận giao dịch từ SePay/Casso khi công ty chuyển khoản, sau đó match với hóa đơn dựa trên số tiền + nội dung."
      />

      <Table
        dataSource={txs}
        columns={isMobile ? mobileColumns : columns}
        rowKey="id"
        loading={loading}
        size="small"
        scroll={{ x: isMobile ? undefined : 1000 }}
        locale={{ emptyText: 'Chưa có giao dịch nào' }}
      />

      <Modal
        title="Gắn giao dịch với hóa đơn"
        open={!!matchModal}
        onOk={handleMatch}
        onCancel={() => { setMatchModal(null); setSelectedInvoiceId(null); }}
        okText="Xác nhận thanh toán"
        cancelText="Hủy"
        okButtonProps={{ disabled: !selectedInvoiceId }}
      >
        {matchModal && (
          <>
            <Alert
              type="warning" showIcon style={{ marginBottom: 12 }}
              message={`Số tiền: ${formatCurrency(matchModal.transferAmount)}`}
              description={matchModal.content}
            />
            <div style={{ marginBottom: 8 }}>Chọn hóa đơn:</div>
            <Select
              style={{ width: '100%' }}
              placeholder="Tìm hóa đơn..."
              showSearch
              optionFilterProp="label"
              value={selectedInvoiceId}
              onChange={v => setSelectedInvoiceId(v)}
              options={pendingInvoices.map(i => ({
                value: i.id,
                label: `${i.companyName} — T${i.invoiceMonth}/${i.invoiceYear} — ${formatCurrency(i.totalAmount)}`,
              }))}
            />
          </>
        )}
      </Modal>
    </div>
  );
}
