import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ConfigProvider } from 'antd';
import viVN from 'antd/locale/vi_VN';
import AppLayout from './components/AppLayout';
import DashboardPage from './pages/Dashboard';
import CompaniesPage from './pages/Companies';
import InvoicesPage from './pages/Invoices';
import PdfImportPage from './pages/PdfImport';
import BankTransactionsPage from './pages/BankTransactions';

const theme = {
  token: {
    colorPrimary: '#3b6ef5',
    colorLink: '#3b6ef5',
    colorBgLayout: '#f5f7fb',
    borderRadius: 10,
    fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  },
  components: {
    Layout: {
      bodyBg: '#f5f7fb',
      siderBg: '#0d1b3d',
      headerBg: '#ffffff',
    },
    Menu: {
      darkItemBg: '#0d1b3d',
      darkSubMenuItemBg: '#0d1b3d',
      darkItemSelectedBg: '#3b6ef5',
      darkItemHoverBg: 'rgba(255,255,255,0.08)',
      darkItemColor: 'rgba(255,255,255,0.65)',
      darkItemSelectedColor: '#ffffff',
      itemHeight: 44,
      iconSize: 16,
    },
    Card: {
      borderRadiusLG: 12,
    },
    Button: {
      borderRadius: 8,
      controlHeight: 36,
    },
    Table: {
      borderRadius: 10,
      headerBg: '#fafbfd',
    },
    Modal: {
      borderRadiusLG: 12,
    },
    Tag: {
      borderRadiusSM: 6,
    },
  },
};

export default function App() {
  return (
    <ConfigProvider locale={viVN} theme={theme}>
      <BrowserRouter>
        <AppLayout>
          <Routes>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/companies" element={<CompaniesPage />} />
            <Route path="/invoices" element={<InvoicesPage />} />
            <Route path="/bank-transactions" element={<BankTransactionsPage />} />
            <Route path="/pdf-import" element={<PdfImportPage />} />
          </Routes>
        </AppLayout>
      </BrowserRouter>
    </ConfigProvider>
  );
}
