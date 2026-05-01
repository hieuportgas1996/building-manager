using BuildingManager.Domain.Enums;

namespace BuildingManager.Domain.Entities;

public class Contract
{
    public int Id { get; set; }
    public int CompanyId { get; set; }
    public int OfficeId { get; set; }
    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }
    public decimal MonthlyRent { get; set; }
    public decimal Deposit { get; set; }
    public ContractStatus Status { get; set; } = ContractStatus.Active;
    public string? Notes { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public Company Company { get; set; } = null!;
    public Office Office { get; set; } = null!;
    public ICollection<Invoice> Invoices { get; set; } = new List<Invoice>();
}
