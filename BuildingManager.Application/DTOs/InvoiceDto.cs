using BuildingManager.Domain.Enums;

namespace BuildingManager.Application.DTOs;

public class InvoiceDto
{
    public int Id { get; set; }
    public int? ContractId { get; set; }
    public int? CompanyId { get; set; }
    public string CompanyName { get; set; } = string.Empty;
    public string OfficeName { get; set; } = string.Empty;
    public int InvoiceYear { get; set; }
    public int InvoiceMonth { get; set; }
    public decimal RentAmount { get; set; }
    public decimal ElectricityAmount { get; set; }
    public decimal WaterAmount { get; set; }
    public decimal ServiceFee { get; set; }
    public decimal TotalAmount { get; set; }
    public DateTime DueDate { get; set; }
    public DateTime? PaidDate { get; set; }
    public InvoiceStatus Status { get; set; }
    public string? Notes { get; set; }
}

public class CreateInvoiceDto
{
    public int ContractId { get; set; }
    public int InvoiceYear { get; set; }
    public int InvoiceMonth { get; set; }
    public decimal RentAmount { get; set; }
    public decimal ElectricityAmount { get; set; }
    public decimal WaterAmount { get; set; }
    public decimal ServiceFee { get; set; }
    public DateTime DueDate { get; set; }
    public string? Notes { get; set; }
}

public class PayInvoiceDto
{
    public DateTime PaidDate { get; set; } = DateTime.UtcNow;
}

public class CreateInvoiceFromPdfDto
{
    public string CompanyName { get; set; } = string.Empty;
    public string TaxCode { get; set; } = string.Empty;
    public string TaxAddress { get; set; } = string.Empty;
    public int InvoiceMonth { get; set; }
    public int InvoiceYear { get; set; }
    public decimal RentAmount { get; set; }
}
