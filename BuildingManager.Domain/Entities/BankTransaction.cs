namespace BuildingManager.Domain.Entities;

public class BankTransaction
{
    public int Id { get; set; }
    public string Gateway { get; set; } = string.Empty;
    public DateTime TransactionDate { get; set; }
    public string AccountNumber { get; set; } = string.Empty;
    public decimal TransferAmount { get; set; }
    public string TransferType { get; set; } = "in";
    public string Content { get; set; } = string.Empty;
    public string? ReferenceCode { get; set; }
    public string? RawData { get; set; }
    public int? MatchedInvoiceId { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public Invoice? MatchedInvoice { get; set; }
}
