using BuildingManager.Application.DTOs;
using BuildingManager.Application.Interfaces;
using BuildingManager.Domain.Entities;
using BuildingManager.Domain.Enums;
using BuildingManager.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace BuildingManager.Application.Services;

public class InvoiceService : IInvoiceService
{
    private readonly AppDbContext _db;

    public InvoiceService(AppDbContext db) => _db = db;

    public async Task<IEnumerable<InvoiceDto>> GetAllAsync(int? year = null, int? month = null)
    {
        var query = _db.Invoices
            .Include(i => i.Contract).ThenInclude(c => c.Company)
            .Include(i => i.Contract).ThenInclude(c => c.Office)
            .Include(i => i.Company)
            .AsQueryable();

        if (year.HasValue) query = query.Where(i => i.InvoiceYear == year.Value);
        if (month.HasValue) query = query.Where(i => i.InvoiceMonth == month.Value);

        return await query.OrderByDescending(i => i.InvoiceYear)
            .ThenByDescending(i => i.InvoiceMonth)
            .Select(i => MapToDto(i))
            .ToListAsync();
    }

    public async Task<InvoiceDto?> GetByIdAsync(int id)
    {
        var i = await _db.Invoices
            .Include(x => x.Contract).ThenInclude(c => c.Company)
            .Include(x => x.Contract).ThenInclude(c => c.Office)
            .Include(x => x.Company)
            .FirstOrDefaultAsync(x => x.Id == id);
        return i == null ? null : MapToDto(i);
    }

    public async Task<IEnumerable<InvoiceDto>> GetByContractAsync(int contractId)
    {
        return await _db.Invoices
            .Include(i => i.Contract).ThenInclude(c => c.Company)
            .Include(i => i.Contract).ThenInclude(c => c.Office)
            .Where(i => i.ContractId == contractId)
            .OrderByDescending(i => i.InvoiceYear).ThenByDescending(i => i.InvoiceMonth)
            .Select(i => MapToDto(i))
            .ToListAsync();
    }

    public async Task<InvoiceDto> CreateFromPdfAsync(CreateInvoiceFromPdfDto dto)
    {
        // upsert company by taxcode
        var company = await _db.Companies.FirstOrDefaultAsync(c => c.TaxCode == dto.TaxCode);
        if (company == null)
        {
            company = new Company
            {
                Name = dto.CompanyName,
                TaxCode = dto.TaxCode,
                TaxAddress = dto.TaxAddress,
                CreatedAt = DateTime.UtcNow,
            };
            _db.Companies.Add(company);
            await _db.SaveChangesAsync();
        }

        var invoice = new Invoice
        {
            CompanyId = company.Id,
            InvoiceYear = dto.InvoiceYear,
            InvoiceMonth = dto.InvoiceMonth,
            RentAmount = dto.RentAmount,
            TotalAmount = dto.RentAmount,
            DueDate = new DateTime(dto.InvoiceYear, dto.InvoiceMonth,
                DateTime.DaysInMonth(dto.InvoiceYear, dto.InvoiceMonth)),
            Status = InvoiceStatus.Pending,
        };
        _db.Invoices.Add(invoice);
        await _db.SaveChangesAsync();
        return (await GetByIdAsync(invoice.Id))!;
    }

    public async Task<InvoiceDto> CreateAsync(CreateInvoiceDto dto)
    {
        var total = dto.RentAmount + dto.ElectricityAmount + dto.WaterAmount + dto.ServiceFee;
        var invoice = new Invoice
        {
            ContractId = dto.ContractId,
            InvoiceYear = dto.InvoiceYear,
            InvoiceMonth = dto.InvoiceMonth,
            RentAmount = dto.RentAmount,
            ElectricityAmount = dto.ElectricityAmount,
            WaterAmount = dto.WaterAmount,
            ServiceFee = dto.ServiceFee,
            TotalAmount = total,
            DueDate = dto.DueDate,
            Notes = dto.Notes,
            Status = InvoiceStatus.Pending
        };

        _db.Invoices.Add(invoice);
        await _db.SaveChangesAsync();
        return (await GetByIdAsync(invoice.Id))!;
    }

    public async Task<InvoiceDto?> MarkAsPaidAsync(int id, PayInvoiceDto dto)
    {
        var invoice = await _db.Invoices.FindAsync(id);
        if (invoice == null) return null;

        invoice.Status = InvoiceStatus.Paid;
        invoice.PaidDate = DateTime.SpecifyKind(dto.PaidDate, DateTimeKind.Utc);
        await _db.SaveChangesAsync();
        return await GetByIdAsync(id);
    }

    public async Task<InvoiceDto?> UpdateStatusAsync(int id, InvoiceStatus status)
    {
        var invoice = await _db.Invoices.FindAsync(id);
        if (invoice == null) return null;

        invoice.Status = status;
        if (status == InvoiceStatus.Paid)
        {
            invoice.PaidDate ??= DateTime.UtcNow;
        }
        else
        {
            invoice.PaidDate = null;
        }
        await _db.SaveChangesAsync();
        return await GetByIdAsync(id);
    }

    public async Task<bool> DeleteAsync(int id)
    {
        var invoice = await _db.Invoices.FindAsync(id);
        if (invoice == null) return false;
        _db.Invoices.Remove(invoice);
        await _db.SaveChangesAsync();
        return true;
    }

    public async Task<DashboardDto> GetDashboardAsync()
    {
        var now = DateTime.UtcNow;

        await UpdateOverdueInvoices();

        var totalCompanies = await _db.Companies.CountAsync();
        var activeContracts = await _db.Contracts.CountAsync(c => c.Status == ContractStatus.Active);
        var totalOffices = await _db.Offices.CountAsync();
        var occupiedOffices = await _db.Offices.CountAsync(o => o.Status == OfficeStatus.Rented);

        var monthlyRevenue = await _db.Invoices
            .Where(i => i.InvoiceYear == now.Year && i.InvoiceMonth == now.Month && i.Status == InvoiceStatus.Paid)
            .SumAsync(i => i.TotalAmount);

        var yearlyRevenue = await _db.Invoices
            .Where(i => i.InvoiceYear == now.Year && i.Status == InvoiceStatus.Paid)
            .SumAsync(i => i.TotalAmount);

        var pendingAmount = await _db.Invoices
            .Where(i => i.Status == InvoiceStatus.Pending)
            .SumAsync(i => i.TotalAmount);

        var overdueCount = await _db.Invoices.CountAsync(i => i.Status == InvoiceStatus.Overdue);

        var revenueChart = await _db.Invoices
            .Where(i => i.InvoiceYear == now.Year)
            .GroupBy(i => new { i.InvoiceYear, i.InvoiceMonth })
            .Select(g => new MonthlyRevenueDto
            {
                Year = g.Key.InvoiceYear,
                Month = g.Key.InvoiceMonth,
                PaidAmount = g.Where(i => i.Status == InvoiceStatus.Paid).Sum(i => i.TotalAmount),
                PendingAmount = g.Where(i => i.Status != InvoiceStatus.Paid).Sum(i => i.TotalAmount)
            })
            .OrderBy(x => x.Month)
            .ToListAsync();

        var recentInvoices = await _db.Invoices
            .Include(i => i.Contract).ThenInclude(c => c.Company)
            .Include(i => i.Contract).ThenInclude(c => c.Office)
            .Include(i => i.Company)
            .OrderByDescending(i => i.Id)
            .Take(5)
            .Select(i => MapToDto(i))
            .ToListAsync();

        return new DashboardDto
        {
            TotalCompanies = totalCompanies,
            ActiveContracts = activeContracts,
            TotalOffices = totalOffices,
            OccupiedOffices = occupiedOffices,
            OccupancyRate = totalOffices > 0 ? Math.Round((decimal)occupiedOffices / totalOffices * 100, 1) : 0,
            MonthlyRevenue = monthlyRevenue,
            YearlyRevenue = yearlyRevenue,
            PendingInvoicesAmount = pendingAmount,
            OverdueInvoicesCount = overdueCount,
            RevenueChart = revenueChart,
            RecentInvoices = recentInvoices
        };
    }

    private async Task UpdateOverdueInvoices()
    {
        var overdue = await _db.Invoices
            .Where(i => i.Status == InvoiceStatus.Pending && i.DueDate < DateTime.UtcNow)
            .ToListAsync();

        foreach (var inv in overdue)
            inv.Status = InvoiceStatus.Overdue;

        if (overdue.Any())
            await _db.SaveChangesAsync();
    }

    private static InvoiceDto MapToDto(Invoice i) => new()
    {
        Id = i.Id,
        ContractId = i.ContractId,
        CompanyId = i.CompanyId,
        CompanyName = i.Contract?.Company?.Name ?? i.Company?.Name ?? string.Empty,
        OfficeName = i.Contract?.Office?.OfficeName ?? string.Empty,
        InvoiceYear = i.InvoiceYear,
        InvoiceMonth = i.InvoiceMonth,
        RentAmount = i.RentAmount,
        ElectricityAmount = i.ElectricityAmount,
        WaterAmount = i.WaterAmount,
        ServiceFee = i.ServiceFee,
        TotalAmount = i.TotalAmount,
        DueDate = i.DueDate,
        PaidDate = i.PaidDate,
        Status = i.Status,
        Notes = i.Notes
    };
}
