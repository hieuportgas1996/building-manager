import { useState } from 'react';
import { Layout, Menu, Drawer, Button, theme } from 'antd';
import {
  DashboardOutlined, BankOutlined, FileTextOutlined,
  DollarOutlined, HomeOutlined, MenuOutlined, FilePdfOutlined, AppstoreOutlined,
} from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';

const { Header, Sider, Content } = Layout;

const menuItems = [
  { key: '/', icon: <DashboardOutlined />, label: 'Dashboard' },
  { key: '/companies', icon: <BankOutlined />, label: 'Công ty' },
  { key: '/buildings', icon: <HomeOutlined />, label: 'Tòa nhà' },
  { key: '/offices', icon: <AppstoreOutlined />, label: 'Văn phòng' },
  { key: '/contracts', icon: <FileTextOutlined />, label: 'Hợp đồng' },
  { key: '/invoices', icon: <DollarOutlined />, label: 'Hóa đơn' },
  { key: '/pdf-import', icon: <FilePdfOutlined />, label: 'Import PDF' },
];

const LOGO = (
  <div style={{ color: '#fff', padding: '16px', fontSize: 16, fontWeight: 700, textAlign: 'center', borderBottom: '1px solid #333' }}>
    🏢 Building Manager
  </div>
);

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const { token } = theme.useToken();

  const handleNav = (key: string) => {
    navigate(key);
    setDrawerOpen(false);
  };

  const isMobile = window.innerWidth < 768;

  return (
    <Layout style={{ minHeight: '100vh' }}>
      {/* Desktop sidebar */}
      {!isMobile && (
        <Sider theme="dark" breakpoint="md" collapsedWidth="0" style={{ position: 'fixed', height: '100vh', left: 0, top: 0, zIndex: 100 }}>
          {LOGO}
          <Menu
            theme="dark"
            mode="inline"
            selectedKeys={[location.pathname]}
            items={menuItems}
            onClick={({ key }) => handleNav(key)}
          />
        </Sider>
      )}

      {/* Mobile drawer */}
      <Drawer
        placement="left"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        styles={{ body: { padding: 0, background: '#001529' }, header: { display: 'none' } }}
        width={220}
      >
        {LOGO}
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[location.pathname]}
          items={menuItems}
          onClick={({ key }) => handleNav(key)}
          style={{ background: '#001529' }}
        />
      </Drawer>

      <Layout style={{ marginLeft: isMobile ? 0 : 200 }}>
        <Header style={{
          background: '#fff',
          padding: '0 16px',
          borderBottom: `1px solid ${token.colorBorderSecondary}`,
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          position: 'sticky',
          top: 0,
          zIndex: 99,
        }}>
          {isMobile && (
            <Button
              type="text"
              icon={<MenuOutlined />}
              onClick={() => setDrawerOpen(true)}
              style={{ fontSize: 18 }}
            />
          )}
          <span style={{ fontSize: isMobile ? 15 : 18, fontWeight: 600, flex: 1 }}>
            {isMobile ? '🏢 Building Manager' : 'Hệ thống Quản lý Tòa nhà'}
          </span>
        </Header>

        <Content style={{
          margin: isMobile ? 12 : 24,
          padding: isMobile ? 16 : 24,
          background: '#fff',
          borderRadius: 8,
          minHeight: 360,
        }}>
          {children}
        </Content>
      </Layout>
    </Layout>
  );
}
