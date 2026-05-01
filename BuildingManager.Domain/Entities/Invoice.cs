using BuildingManager.Domain.Enums;

namespace BuildingManager.Domain.Entities;

public class Invoice
{
    public int Id { get; set; }
    public int ContractId { get; set; }
    public int InvoiceYear { get; set; }
    public int InvoiceMonth { get; set; }
    public decimal RentAmount { get; set; }
    public decimal ElectricityAmount { get; set; }
    public decimal WaterAmount { get; set; }
    public decimal ServiceFee { get; set; }
    public decimal TotalAmount { get; set; }
    public DateTime DueDate { get; set; }
    public DateTime? PaidDate { get; set; }
    public InvoiceStatus Status { get; set; } = InvoiceStatus.Pending;
    public string? Notes { get; set; }

    public Contract Contract { get; set; } = null!;
}
