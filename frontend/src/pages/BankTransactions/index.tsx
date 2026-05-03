import { useEffect, useState } from 'react';
import {
  Table, Tag, Typography, Alert, Button, Modal, Select, message, Grid, Space,
} from 'antd';
import { CheckCircleOutlined, LinkOutlined } from '@ant-design/icons';
import { bankTransactionService, BankTransaction } from '../../services/bankTransactionService';
import { invoiceService } from '../../services/invoiceService';
import { Invoice, InvoiceStatus } from '../../types';
import { formatCurrency } from '../../utils/format';

const { Title, Text } = Typography;
const { useBreakpoint } = Grid;

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

  const pendingInvoices = invoices.filter(i => i.status !== InvoiceStatus.Paid);

  const columns = [
    {
      title: 'STT',
      width: 60,
      align: 'center' as const,
      render: (_: unknown, __: BankTransaction, idx: number) => idx + 1,
    },
    {
      title: 'Thời gian',
      dataIndex: 'transactionDate',
      width: 140,
      render: (v: string) => new Date(v).toLocaleString('vi-VN'),
    },
    {
      title: 'Ngân hàng',
      dataIndex: 'gateway',
      width: 90,
      render: (v: string) => <Tag color="blue">{v}</Tag>,
    },
    {
      title: 'Số tiền',
      dataIndex: 'transferAmount',
      width: 130,
      render: (v: number) => <Text strong style={{ color: '#52c41a' }}>+{formatCurrency(v)}</Text>,
    },
    {
      title: 'Nội dung',
      dataIndex: 'content',
      ellipsis: true,
      render: (v: string) => <Text style={{ fontSize: 12 }}>{v}</Text>,
    },
    {
      title: 'Hóa đơn',
      width: 200,
      render: (_: unknown, t: BankTransaction) => t.matchedInvoiceId ? (
        <Tag color="green" icon={<CheckCircleOutlined />}>
          Đã gắn — {t.matchedCompanyName ?? `HD #${t.matchedInvoiceId}`}
        </Tag>
      ) : (
        <Tag color="orange">Chưa gắn</Tag>
      ),
    },
    {
      title: '',
      width: 90,
      render: (_: unknown, t: BankTransaction) => !t.matchedInvoiceId && (
        <Button size="small" icon={<LinkOutlined />} onClick={() => setMatchModal(t)}>
          Gắn
        </Button>
      ),
    },
  ];

  const mobileColumns = [
    {
      title: 'STT',
      width: 40,
      align: 'center' as const,
      render: (_: unknown, __: BankTransaction, idx: number) => idx + 1,
    },
    {
      title: 'Giao dịch',
      render: (_: unknown, t: BankTransaction) => (
        <div>
          <div><Text strong style={{ color: '#52c41a' }}>+{formatCurrency(t.transferAmount)}</Text> <Tag color="blue" style={{ marginLeft: 4 }}>{t.gateway}</Tag></div>
          <div style={{ fontSize: 11, color: '#888' }}>{new Date(t.transactionDate).toLocaleString('vi-VN')}</div>
          <div style={{ fontSize: 12, marginTop: 4 }}>{t.content}</div>
          <div style={{ marginTop: 6 }}>
            {t.matchedInvoiceId
              ? <Tag color="green" icon={<CheckCircleOutlined />}>Đã gắn{t.matchedCompanyName ? ` — ${t.matchedCompanyName}` : ''}</Tag>
              : <Space>
                  <Tag color="orange">Chưa gắn</Tag>
                  <Button size="small" icon={<LinkOutlined />} onClick={() => setMatchModal(t)}>Gắn</Button>
                </Space>
            }
          </div>
        </div>
      ),
    },
  ];

  return (
    <div>
      <Title level={4} style={{ marginBottom: 16 }}>Lịch sử giao dịch ngân hàng</Title>

      <Alert
        type="info" showIcon style={{ marginBottom: 16 }}
        message="Hệ thống tự động nhận giao dịch từ SePay khi công ty chuyển tiền vào tài khoản ACB / Vietcombank, sau đó match với hóa đơn dựa trên số tiền + nội dung chuyển khoản."
      />

      <Table
        dataSource={txs}
        columns={isMobile ? mobileColumns : columns}
        rowKey="id"
        loading={loading}
        size="small"
        scroll={{ x: isMobile ? undefined : 800 }}
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
