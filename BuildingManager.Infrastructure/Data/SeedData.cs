using BuildingManager.Domain.Entities;
using BuildingManager.Domain.Enums;
using Microsoft.EntityFrameworkCore;

namespace BuildingManager.Infrastructure.Data;

public static class SeedData
{
    public static async Task SeedAsync(AppDbContext db)
    {
        // Data is inserted manually from real invoices - skip auto seed if data exists
        if (await db.Companies.AnyAsync()) return;
        if (await db.Buildings.AnyAsync()) return;

        var building = new Building
        {
            Name = "Tòa nhà ABC Tower",
            Address = "123 Nguyễn Huệ, Quận 1, TP.HCM",
            TotalFloors = 10,
            TotalArea = 5000,
            Description = "Tòa nhà văn phòng hạng A"
        };
        db.Buildings.Add(building);
        await db.SaveChangesAsync();

        var floors = Enumerable.Range(1, 5).Select(i => new Floor
        {
            BuildingId = building.Id,
            FloorNumber = i,
            TotalArea = 500
        }).ToList();
        db.Floors.AddRange(floors);
        await db.SaveChangesAsync();

        var offices = new List<Office>();
        foreach (var floor in floors)
        {
            for (int j = 1; j <= 4; j++)
            {
                offices.Add(new Office
                {
                    FloorId = floor.Id,
                    OfficeName = $"P{floor.FloorNumber}{j:D2}",
                    Area = 80 + j * 10,
                    PricePerM2 = 350000,
                    Status = OfficeStatus.Available
                });
            }
        }
        db.Offices.AddRange(offices);
        await db.SaveChangesAsync();

        var companies = new List<Company>
        {
            new() { Name = "Công ty TNHH Tech Solutions", TaxAddress = "45 Lê Lợi, Q1, HCM", TaxCode = "0123456789", ContactPerson = "Nguyễn Văn A", ContactPhone = "0901234567", ContactEmail = "contact@techsol.vn" },
            new() { Name = "Công ty CP Sáng Tạo Việt", TaxAddress = "78 Đinh Tiên Hoàng, Q1, HCM", TaxCode = "0987654321", ContactPerson = "Trần Thị B", ContactPhone = "0912345678", ContactEmail = "info@sangtaoviet.vn" },
            new() { Name = "TNHH Dịch Vụ Toàn Cầu", TaxAddress = "15 Phạm Ngọc Thạch, Q3, HCM", TaxCode = "0345678901", ContactPerson = "Lê Văn C", ContactPhone = "0923456789", ContactEmail = "hello@toancau.com" }
        };
        db.Companies.AddRange(companies);
        await db.SaveChangesAsync();

        var contracts = new List<Contract>
        {
            new() { CompanyId = companies[0].Id, OfficeId = offices[0].Id, StartDate = new DateTime(2024,1,1), EndDate = new DateTime(2025,12,31), MonthlyRent = 28000000, Deposit = 56000000, Status = ContractStatus.Active },
            new() { CompanyId = companies[1].Id, OfficeId = offices[1].Id, StartDate = new DateTime(2024,3,1), EndDate = new DateTime(2026,2,28), MonthlyRent = 31500000, Deposit = 63000000, Status = ContractStatus.Active },
            new() { CompanyId = companies[2].Id, OfficeId = offices[4].Id, StartDate = new DateTime(2024,6,1), EndDate = new DateTime(2026,5,31), MonthlyRent = 35000000, Deposit = 70000000, Status = ContractStatus.Active }
        };

        offices[0].Status = OfficeStatus.Rented;
        offices[1].Status = OfficeStatus.Rented;
        offices[4].Status = OfficeStatus.Rented;

        db.Contracts.AddRange(contracts);
        await db.SaveChangesAsync();

        var invoices = new List<Invoice>();
        var random = new Random(42);
        foreach (var contract in contracts)
        {
            for (int m = 1; m <= 4; m++)
            {
                var electricity = random.Next(2, 8) * 1000000m;
                var water = random.Next(200, 800) * 1000m;
                var service = contract.MonthlyRent * 0.05m;
                var total = contract.MonthlyRent + electricity + water + service;
                invoices.Add(new Invoice
                {
                    ContractId = contract.Id,
                    InvoiceYear = 2025,
                    InvoiceMonth = m,
                    RentAmount = contract.MonthlyRent,
                    ElectricityAmount = electricity,
                    WaterAmount = water,
                    ServiceFee = service,
                    TotalAmount = total,
                    DueDate = new DateTime(2025, m, 15),
                    PaidDate = m < 4 ? new DateTime(2025, m, 10) : null,
                    Status = m < 4 ? InvoiceStatus.Paid : InvoiceStatus.Pending
                });
            }
        }
        db.Invoices.AddRange(invoices);
        await db.SaveChangesAsync();
    }
}
