using System.Text;
using System.Text.RegularExpressions;
using BuildingManager.Application.DTOs;
using UglyToad.PdfPig;

namespace BuildingManager.Application.Services;

public class PdfParserService
{
    public PdfImportResultDto Parse(Stream pdfStream)
    {
        var result = new PdfImportResultDto();
        try
        {
            using var pdf = PdfDocument.Open(pdfStream);
            var sb = new StringBuilder();
            foreach (var page in pdf.GetPages())
                sb.AppendLine(page.Text);

            var text = sb.ToString();
            result.RawText = text;

            result.CompanyName = ExtractAfterLabel(text,
                @"Tên đơn vị \(Company's name\)\s*:?\s*(.+?)(?=\r|\n|Mã số thuế)");

            result.TaxCode = ExtractAfterLabel(text,
                @"Mã số thuế \(Tax code\)\s*:?\s*(\d[\d\s]{8,12}\d)");
            result.TaxCode = Regex.Replace(result.TaxCode, @"\s", "");

            result.TaxAddress = ExtractAfterLabel(text,
                @"Địa chỉ \(Address\)\s*:?\s*(.+?)(?=\r|\n|Hình thức)");

            // Extract month/year from "tháng X" in invoice date line
            var dateMatch = Regex.Match(text,
                @"Ngày\s*\(Date\)\s*\d+\s*tháng\s*\(month\)\s*(\d+)\s*năm\s*\(year\)\s*(\d+)");
            if (dateMatch.Success)
            {
                result.Month = int.Parse(dateMatch.Groups[1].Value);
                result.Year = int.Parse(dateMatch.Groups[2].Value);
            }

            // Extract monthly rent from description line
            var rentMatch = Regex.Match(text,
                @"Tiền thuê văn phòng tháng\s+\d+\s+tháng\s+1\s+([\d\.]+)");
            if (rentMatch.Success)
            {
                var rentStr = rentMatch.Groups[1].Value.Replace(".", "");
                result.MonthlyRent = decimal.Parse(rentStr);
            }

            result.ParseSuccess = !string.IsNullOrEmpty(result.CompanyName)
                && !string.IsNullOrEmpty(result.TaxCode);
        }
        catch (Exception ex)
        {
            result.ParseSuccess = false;
            result.ParseError = ex.Message;
        }
        return result;
    }

    private string ExtractAfterLabel(string text, string pattern)
    {
        var match = Regex.Match(text, pattern, RegexOptions.IgnoreCase | RegexOptions.Singleline);
        return match.Success ? match.Groups[1].Value.Trim() : string.Empty;
    }
}
