import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ConfigProvider } from 'antd';
import viVN from 'antd/locale/vi_VN';
import AppLayout from './components/AppLayout';
import DashboardPage from './pages/Dashboard';
import CompaniesPage from './pages/Companies';
import OfficesPage from './pages/Offices';
import ContractsPage from './pages/Contracts';
import InvoicesPage from './pages/Invoices';

export default function App() {
  return (
    <ConfigProvider locale={viVN}>
      <BrowserRouter>
        <AppLayout>
          <Routes>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/companies" element={<CompaniesPage />} />
            <Route path="/offices" element={<OfficesPage />} />
            <Route path="/contracts" element={<ContractsPage />} />
            <Route path="/invoices" element={<InvoicesPage />} />
          </Routes>
        </AppLayout>
      </BrowserRouter>
    </ConfigProvider>
  );
}
