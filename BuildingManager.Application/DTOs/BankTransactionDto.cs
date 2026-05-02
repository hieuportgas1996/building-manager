namespace BuildingManager.Application.DTOs;

public class BankTransactionDto
{
    public int Id { get; set; }
    public string Gateway { get; set; } = string.Empty;
    public DateTime TransactionDate { get; set; }
    public decimal TransferAmount { get; set; }
    public string Content { get; set; } = string.Empty;
    public string? ReferenceCode { get; set; }
    public int? MatchedInvoiceId { get; set; }
    public string? MatchedCompanyName { get; set; }
    public DateTime CreatedAt { get; set; }
}

public class SepayWebhookDto
{
    public long Id { get; set; }
    public string Gateway { get; set; } = string.Empty;
    public string TransactionDate { get; set; } = string.Empty;
    public string AccountNumber { get; set; } = string.Empty;
    public decimal TransferAmount { get; set; }
    public string TransferType { get; set; } = "in";
    public string Content { get; set; } = string.Empty;
    public string? ReferenceCode { get; set; }
    public string? Description { get; set; }
    public decimal Accumulated { get; set; }
    public string? Code { get; set; }
    public string? SubAccount { get; set; }
}
