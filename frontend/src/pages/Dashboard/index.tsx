import { useEffect, useState } from 'react';
import { Row, Col, Card, Table, Spin, Alert, Grid, Typography } from 'antd';
import {
  BankOutlined, FileTextOutlined, HomeOutlined, DollarOutlined,
  WarningOutlined, RiseOutlined, ArrowUpOutlined,
} from '@ant-design/icons';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts';
import { invoiceService } from '../../services/invoiceService';
import { Dashboard } from '../../types';
import { formatCurrency, formatDate } from '../../utils/format';
import { InvoiceStatusTag } from '../../components/StatusTag';

const { useBreakpoint } = Grid;
const { Text } = Typography;

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  gradient: string;
  trend?: string;
  isMobile: boolean;
}

function StatCard({ title, value, icon, gradient, trend, isMobile }: StatCardProps) {
  return (
    <Card
      bordered={false}
      style={{
        boxShadow: '0 1px 3px rgba(15,23,42,0.04)',
        height: '100%',
        background: '#fff',
      }}
      bodyStyle={{ padding: isMobile ? 14 : 20 }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 10 }}>
        <Text type="secondary" style={{ fontSize: 12, fontWeight: 500 }}>{title}</Text>
        <div style={{
          width: 36, height: 36, borderRadius: 10,
          background: gradient,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: '#fff', fontSize: 16,
        }}>
          {icon}
        </div>
      </div>
      <div style={{ fontSize: isMobile ? 20 : 24, fontWeight: 700, color: '#0f172a', lineHeight: 1.2 }}>
        {value}
      </div>
      {trend && (
        <div style={{ marginTop: 8, display: 'flex', alignItems: 'center', gap: 4, color: '#10b981', fontSize: 12, fontWeight: 500 }}>
          <ArrowUpOutlined /> {trend}
        </div>
      )}
    </Card>
  );
}

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

  const fmtMoney = (v: number) => isMobile
    ? `${Math.round(v / 1_000_000)}M`
    : formatCurrency(v);

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
      <Row gutter={[16, 16]}>
        <Col xs={12} sm={12} lg={6}>
          <StatCard
            title="Công ty thuê"
            value={data.totalCompanies}
            icon={<BankOutlined />}
            gradient="linear-gradient(135deg, #3b6ef5 0%, #5e8bff 100%)"
            isMobile={isMobile}
          />
        </Col>
        <Col xs={12} sm={12} lg={6}>
          <StatCard
            title="Hợp đồng hiệu lực"
            value={data.activeContracts}
            icon={<FileTextOutlined />}
            gradient="linear-gradient(135deg, #10b981 0%, #34d399 100%)"
            isMobile={isMobile}
          />
        </Col>
        <Col xs={12} sm={12} lg={6}>
          <StatCard
            title={`Tỷ lệ lấp đầy (${data.occupiedOffices}/${data.totalOffices})`}
            value={`${data.occupancyRate}%`}
            icon={<HomeOutlined />}
            gradient="linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%)"
            isMobile={isMobile}
          />
        </Col>
        <Col xs={12} sm={12} lg={6}>
          <StatCard
            title="Doanh thu tháng này"
            value={fmtMoney(data.monthlyRevenue)}
            icon={<DollarOutlined />}
            gradient="linear-gradient(135deg, #8b5cf6 0%, #a78bfa 100%)"
            isMobile={isMobile}
          />
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col xs={24} sm={12}>
          <StatCard
            title="Doanh thu năm nay"
            value={fmtMoney(data.yearlyRevenue)}
            icon={<RiseOutlined />}
            gradient="linear-gradient(135deg, #3b6ef5 0%, #6366f1 100%)"
            isMobile={isMobile}
          />
        </Col>
        <Col xs={24} sm={12}>
          <StatCard
            title={`Chờ thanh toán (${data.overdueInvoicesCount} quá hạn)`}
            value={fmtMoney(data.pendingInvoicesAmount)}
            icon={<WarningOutlined />}
            gradient={data.overdueInvoicesCount > 0
              ? 'linear-gradient(135deg, #ef4444 0%, #f87171 100%)'
              : 'linear-gradient(135deg, #10b981 0%, #34d399 100%)'}
            isMobile={isMobile}
          />
        </Col>
      </Row>

      <Card
        title={<span style={{ fontSize: 15, fontWeight: 600 }}>Doanh thu theo tháng (triệu VND)</span>}
        bordered={false}
        style={{ marginTop: 16, boxShadow: '0 1px 3px rgba(15,23,42,0.04)' }}
        bodyStyle={{ paddingTop: 8 }}
      >
        <ResponsiveContainer width="100%" height={isMobile ? 220 : 320}>
          <BarChart data={chartData} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#eef0f5" />
            <XAxis dataKey="name" tick={{ fontSize: isMobile ? 10 : 12, fill: '#64748b' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: isMobile ? 10 : 12, fill: '#64748b' }} axisLine={false} tickLine={false} />
            <Tooltip
              formatter={(v) => `${v}M VND`}
              contentStyle={{ borderRadius: 8, border: '1px solid #eef0f5', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}
            />
            <Legend wrapperStyle={{ fontSize: isMobile ? 11 : 13, paddingTop: 8 }} />
            <Bar dataKey="Đã thu" fill="#10b981" radius={[6, 6, 0, 0]} />
            <Bar dataKey="Chờ thu" fill="#3b6ef5" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </Card>

      <Card
        title={<span style={{ fontSize: 15, fontWeight: 600 }}>Hóa đơn gần đây</span>}
        bordered={false}
        style={{ marginTop: 16, boxShadow: '0 1px 3px rgba(15,23,42,0.04)' }}
      >
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
