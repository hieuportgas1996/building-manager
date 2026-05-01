namespace BuildingManager.Application.DTOs;

public class PdfImportResultDto
{
    public string CompanyName { get; set; } = string.Empty;
    public string TaxCode { get; set; } = string.Empty;
    public string TaxAddress { get; set; } = string.Empty;
    public int Month { get; set; }
    public int Year { get; set; }
    public decimal MonthlyRent { get; set; }
    public string RawText { get; set; } = string.Empty;
    public bool ParseSuccess { get; set; }
    public string? ParseError { get; set; }
}
