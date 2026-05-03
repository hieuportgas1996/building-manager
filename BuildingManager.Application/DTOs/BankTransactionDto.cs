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

public class CassoWebhookDto
{
    public string Error { get; set; } = string.Empty;
    public List<CassoTransactionData> Data { get; set; } = new();
}

public class CassoTransactionData
{
    public long Id { get; set; }
    public string Tid { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public decimal Amount { get; set; }
    public decimal Cusum_balance { get; set; }
    public string When { get; set; } = string.Empty;
    public string BookingDate { get; set; } = string.Empty;
    public string BankSubAccId { get; set; } = string.Empty;
    public int SubAccId { get; set; }
    public string BankName { get; set; } = string.Empty;
    public string BankAbbreviation { get; set; } = string.Empty;
    public string VirtualAccount { get; set; } = string.Empty;
    public string VirtualAccountName { get; set; } = string.Empty;
    public string CorresponsiveName { get; set; } = string.Empty;
    public string CorresponsiveAccount { get; set; } = string.Empty;
    public string CorresponsiveBankId { get; set; } = string.Empty;
    public string CorresponsiveBankName { get; set; } = string.Empty;
}
