import { useState, useEffect } from 'react';
import { Layout, Menu, Drawer, Button, Avatar, Badge } from 'antd';
import {
  DashboardOutlined, BankOutlined,
  DollarOutlined, MenuOutlined, FilePdfOutlined,
  TransactionOutlined, BellOutlined, SearchOutlined,
} from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';

const { Header, Sider, Content } = Layout;

const menuGroups = [
  {
    label: 'TỔNG QUAN',
    items: [
      { key: '/', icon: <DashboardOutlined />, label: 'Dashboard' },
    ],
  },
  {
    label: 'QUẢN LÝ',
    items: [
      { key: '/companies', icon: <BankOutlined />, label: 'Công ty' },
      { key: '/invoices', icon: <DollarOutlined />, label: 'Hóa đơn' },
    ],
  },
  {
    label: 'NGÂN HÀNG & PDF',
    items: [
      { key: '/bank-transactions', icon: <TransactionOutlined />, label: 'Giao dịch NH' },
      { key: '/pdf-import', icon: <FilePdfOutlined />, label: 'Import PDF' },
    ],
  },
];

const flatItems = menuGroups.flatMap(g => g.items);

function PageTitle({ pathname }: { pathname: string }) {
  const item = flatItems.find(i => i.key === pathname);
  return <span style={{ fontSize: 18, fontWeight: 600 }}>{item?.label ?? 'Dashboard'}</span>;
}

const Logo = ({ collapsed = false }: { collapsed?: boolean }) => (
  <div style={{
    padding: '20px 16px',
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    borderBottom: '1px solid rgba(255,255,255,0.06)',
  }}>
    <div style={{
      width: 36, height: 36, borderRadius: 10,
      background: 'linear-gradient(135deg, #3b6ef5 0%, #5e8bff 100%)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: 18, fontWeight: 800, color: '#fff',
      boxShadow: '0 4px 12px rgba(59,110,245,0.4)',
    }}>
      🏢
    </div>
    {!collapsed && (
      <div>
        <div style={{ color: '#fff', fontSize: 15, fontWeight: 700, lineHeight: 1.2 }}>
          Building
        </div>
        <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: 11 }}>Trung Hiếu</div>
      </div>
    )}
  </div>
);

function SidebarMenu({ pathname, onNav }: { pathname: string; onNav: (k: string) => void }) {
  return (
    <div style={{ padding: '12px 0' }}>
      {menuGroups.map((group, gi) => (
        <div key={gi} style={{ marginBottom: 8 }}>
          <div style={{
            color: 'rgba(255,255,255,0.4)',
            fontSize: 10.5,
            fontWeight: 700,
            letterSpacing: 0.8,
            padding: '12px 20px 6px',
          }}>
            {group.label}
          </div>
          <Menu
            theme="dark"
            mode="inline"
            selectedKeys={[pathname]}
            items={group.items}
            onClick={({ key }) => onNav(key)}
            style={{ background: 'transparent', borderRight: 0 }}
          />
        </div>
      ))}
    </div>
  );
}

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const handleNav = (key: string) => {
    navigate(key);
    setDrawerOpen(false);
  };

  const SIDEBAR_WIDTH = 240;

  return (
    <Layout style={{ minHeight: '100vh', background: '#f5f7fb' }}>
      {/* Desktop sidebar */}
      {!isMobile && (
        <Sider
          width={SIDEBAR_WIDTH}
          style={{
            position: 'fixed', height: '100vh', left: 0, top: 0, zIndex: 100,
            background: '#0d1b3d',
            overflow: 'auto',
          }}
        >
          <Logo />
          <SidebarMenu pathname={location.pathname} onNav={handleNav} />
        </Sider>
      )}

      {/* Mobile drawer */}
      <Drawer
        placement="left"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        styles={{ body: { padding: 0, background: '#0d1b3d' }, header: { display: 'none' } }}
        width={260}
      >
        <Logo />
        <SidebarMenu pathname={location.pathname} onNav={handleNav} />
      </Drawer>

      <Layout style={{ marginLeft: isMobile ? 0 : SIDEBAR_WIDTH, background: '#f5f7fb' }}>
        <Header style={{
          background: '#fff',
          padding: isMobile ? '0 12px' : '0 24px',
          borderBottom: '1px solid #eef0f5',
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          position: 'sticky',
          top: 0,
          zIndex: 99,
          height: 64,
        }}>
          {isMobile && (
            <Button
              type="text"
              icon={<MenuOutlined />}
              onClick={() => setDrawerOpen(true)}
              style={{ fontSize: 18 }}
            />
          )}
          <div style={{ flex: 1 }}>
            <PageTitle pathname={location.pathname} />
          </div>
          {!isMobile && (
            <Button type="text" icon={<SearchOutlined />} style={{ fontSize: 16 }} />
          )}
          <Badge count={0} dot>
            <Button type="text" icon={<BellOutlined />} style={{ fontSize: 16 }} />
          </Badge>
          <Avatar
            style={{ background: 'linear-gradient(135deg, #3b6ef5 0%, #5e8bff 100%)', fontWeight: 600 }}
          >
            TH
          </Avatar>
        </Header>

        <Content style={{
          margin: isMobile ? 12 : 24,
          padding: isMobile ? 16 : 24,
          background: '#fff',
          borderRadius: 12,
          minHeight: 360,
          boxShadow: '0 1px 3px rgba(15,23,42,0.04)',
        }}>
          {children}
        </Content>
      </Layout>
    </Layout>
  );
}
