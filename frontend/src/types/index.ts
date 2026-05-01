export enum ContractStatus {
  Active = 1,
  Expired = 2,
  Terminated = 3,
}

export enum InvoiceStatus {
  Pending = 1,
  Paid = 2,
  Overdue = 3,
}

export enum OfficeStatus {
  Available = 1,
  Rented = 2,
  Maintenance = 3,
}

export interface Company {
  id: number;
  name: string;
  taxAddress: string;
  taxCode: string;
  contactPerson?: string;
  contactPhone?: string;
  contactEmail?: string;
  createdAt: string;
  activeContractsCount: number;
}

export interface Office {
  id: number;
  floorId: number;
  floorNumber: number;
  buildingName: string;
  officeName: string;
  area: number;
  pricePerM2: number;
  monthlyPrice: number;
  status: OfficeStatus;
}

export interface Contract {
  id: number;
  companyId: number;
  companyName: string;
  officeId: number;
  officeName: string;
  floorInfo: string;
  startDate: string;
  endDate: string;
  monthlyRent: number;
  deposit: number;
  status: ContractStatus;
  notes?: string;
  createdAt: string;
}

export interface Invoice {
  id: number;
  contractId: number;
  companyName: string;
  officeName: string;
  invoiceYear: number;
  invoiceMonth: number;
  rentAmount: number;
  electricityAmount: number;
  waterAmount: number;
  serviceFee: number;
  totalAmount: number;
  dueDate: string;
  paidDate?: string;
  status: InvoiceStatus;
  notes?: string;
}

export interface PdfImportResult {
  companyName: string;
  taxCode: string;
  taxAddress: string;
  month: number;
  year: number;
  monthlyRent: number;
  parseSuccess: boolean;
  parseError?: string;
}

export interface MonthlyRevenue {
  year: number;
  month: number;
  label: string;
  paidAmount: number;
  pendingAmount: number;
}

export interface Dashboard {
  totalCompanies: number;
  activeContracts: number;
  totalOffices: number;
  occupiedOffices: number;
  occupancyRate: number;
  monthlyRevenue: number;
  yearlyRevenue: number;
  pendingInvoicesAmount: number;
  overdueInvoicesCount: number;
  revenueChart: MonthlyRevenue[];
  recentInvoices: Invoice[];
}
