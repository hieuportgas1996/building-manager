import { useEffect, useState } from 'react';
import { Row, Col, Card, Statistic, Table, Spin, Alert, Grid } from 'antd';
import {
  BankOutlined, FileTextOutlined, HomeOutlined, DollarOutlined,
  WarningOutlined, RiseOutlined,
} from '@ant-design/icons';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts';
import { invoiceService } from '../../services/invoiceService';
import { Dashboard } from '../../types';
import { formatCurrency, formatDate } from '../../utils/format';
import { InvoiceStatusTag } from '../../components/StatusTag';

const { useBreakpoint } = Grid;

export default function DashboardPage() {
  const [data, setData] = useState<Dashboard | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const screens = useBreakpoint();
  const isMobile = !screens.sm;

  useEffect(() => {
    invoiceService.getDashboard()
      .then(setData)
      .catch(() => setError('Không thể tải dữ liệu dashboard'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Spin size="large" style={{ display: 'block', marginTop: 60, textAlign: 'center' }} />;
  if (error) return <Alert type="error" message={error} />;
  if (!data) return null;

  const chartData = data.revenueChart.map(r => ({
    name: r.label,
    'Đã thu': Math.round(r.paidAmount / 1_000_000),
    'Chờ thu': Math.round(r.pendingAmount / 1_000_000),
  }));

  const recentColumns = isMobile
    ? [
        { title: 'Công ty', dataIndex: 'companyName', ellipsis: true },
        { title: 'Tổng tiền', dataIndex: 'totalAmount', render: formatCurrency },
        { title: 'TT', dataIndex: 'status', render: (s: number) => <InvoiceStatusTag status={s} /> },
      ]
    : [
        { title: 'Công ty', dataIndex: 'companyName', ellipsis: true },
        { title: 'Văn phòng', dataIndex: 'officeName', width: 90 },
        { title: 'Tháng', render: (_: unknown, r: { invoiceMonth: number; invoiceYear: number }) => `${r.invoiceMonth}/${r.invoiceYear}`, width: 80 },
        { title: 'Tổng tiền', dataIndex: 'totalAmount', render: formatCurrency },
        { title: 'Trạng thái', dataIndex: 'status', render: (s: number) => <InvoiceStatusTag status={s} /> },
        { title: 'Hạn TT', dataIndex: 'dueDate', render: formatDate, width: 100 },
      ];

  return (
    <div>
      <h2 style={{ marginBottom: 16 }}>Dashboard</h2>

      <Row gutter={[12, 12]}>
        <Col xs={12} sm={12} lg={6}>
          <Card size="small">
            <Statistic title="Công ty" value={data.totalCompanies} prefix={<BankOutlined />} valueStyle={{ color: '#1677ff', fontSize: isMobile ? 20 : 24 }} />
          </Card>
        </Col>
        <Col xs={12} sm={12} lg={6}>
          <Card size="small">
            <Statistic title="HĐ hiệu lực" value={data.activeContracts} prefix={<FileTextOutlined />} valueStyle={{ color: '#52c41a', fontSize: isMobile ? 20 : 24 }} />
          </Card>
        </Col>
        <Col xs={12} sm={12} lg={6}>
          <Card size="small">
            <Statistic
              title={`Lấp đầy (${data.occupiedOffices}/${data.totalOffices})`}
              value={data.occupancyRate}
              suffix="%"
              prefix={<HomeOutlined />}
              valueStyle={{ color: '#fa8c16', fontSize: isMobile ? 20 : 24 }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={12} lg={6}>
          <Card size="small">
            <Statistic
              title="DT tháng này"
              value={data.monthlyRevenue}
              formatter={v => isMobile
                ? `${Math.round(Number(v) / 1_000_000)}M`
                : formatCurrency(Number(v))}
              prefix={<DollarOutlined />}
              valueStyle={{ color: '#52c41a', fontSize: isMobile ? 18 : 24 }}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[12, 12]} style={{ marginTop: 12 }}>
        <Col xs={24} sm={12}>
          <Card size="small">
            <Statistic
              title="Doanh thu năm nay"
              value={data.yearlyRevenue}
              formatter={v => isMobile
                ? `${Math.round(Number(v) / 1_000_000)}M VND`
                : formatCurrency(Number(v))}
              prefix={<RiseOutlined />}
              valueStyle={{ color: '#1677ff', fontSize: isMobile ? 18 : 24 }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12}>
          <Card size="small">
            <Statistic
              title={`Chờ thanh toán (${data.overdueInvoicesCount} quá hạn)`}
              value={data.pendingInvoicesAmount}
              formatter={v => isMobile
                ? `${Math.round(Number(v) / 1_000_000)}M VND`
                : formatCurrency(Number(v))}
              prefix={<WarningOutlined />}
              valueStyle={{ color: data.overdueInvoicesCount > 0 ? '#ff4d4f' : '#52c41a', fontSize: isMobile ? 18 : 24 }}
            />
          </Card>
        </Col>
      </Row>

      <Card style={{ marginTop: 12 }} title="Doanh thu theo tháng (triệu VND)" size="small">
        <ResponsiveContainer width="100%" height={isMobile ? 200 : 300}>
          <BarChart data={chartData} margin={{ top: 0, right: 8, left: -16, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" tick={{ fontSize: isMobile ? 10 : 12 }} />
            <YAxis tick={{ fontSize: isMobile ? 10 : 12 }} />
            <Tooltip formatter={(v) => `${v}M VND`} />
            <Legend wrapperStyle={{ fontSize: isMobile ? 11 : 13 }} />
            <Bar dataKey="Đã thu" fill="#52c41a" />
            <Bar dataKey="Chờ thu" fill="#1677ff" />
          </BarChart>
        </ResponsiveContainer>
      </Card>

      <Card style={{ marginTop: 12 }} title="Hóa đơn gần đây" size="small">
        <Table
          dataSource={data.recentInvoices}
          columns={recentColumns}
          rowKey="id"
          pagination={false}
          size="small"
          scroll={{ x: isMobile ? undefined : 600 }}
        />
      </Card>
    </div>
  );
}
