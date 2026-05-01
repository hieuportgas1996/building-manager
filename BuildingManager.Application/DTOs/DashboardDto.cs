namespace BuildingManager.Application.DTOs;

public class DashboardDto
{
    public int TotalCompanies { get; set; }
    public int ActiveContracts { get; set; }
    public int TotalOffices { get; set; }
    public int OccupiedOffices { get; set; }
    public decimal OccupancyRate { get; set; }
    public decimal MonthlyRevenue { get; set; }
    public decimal YearlyRevenue { get; set; }
    public decimal PendingInvoicesAmount { get; set; }
    public int OverdueInvoicesCount { get; set; }
    public List<MonthlyRevenueDto> RevenueChart { get; set; } = new();
    public List<InvoiceDto> RecentInvoices { get; set; } = new();
}

public class MonthlyRevenueDto
{
    public int Year { get; set; }
    public int Month { get; set; }
    public string Label => $"{Month:D2}/{Year}";
    public decimal PaidAmount { get; set; }
    public decimal PendingAmount { get; set; }
}
