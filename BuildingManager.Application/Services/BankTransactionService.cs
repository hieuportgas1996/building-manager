using System.Text.RegularExpressions;
using BuildingManager.Application.DTOs;
using BuildingManager.Domain.Entities;
using BuildingManager.Domain.Enums;
using BuildingManager.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace BuildingManager.Application.Services;

public class BankTransactionService
{
    private readonly AppDbContext _db;
    public BankTransactionService(AppDbContext db) => _db = db;

    public async Task<IEnumerable<BankTransactionDto>> GetAllAsync()
    {
        return await _db.BankTransactions
            .Include(t => t.MatchedInvoice).ThenInclude(i => i!.Company)
            .Include(t => t.MatchedInvoice).ThenInclude(i => i!.Contract).ThenInclude(c => c!.Company)
            .OrderByDescending(t => t.TransactionDate)
            .Select(t => MapToDto(t))
            .ToListAsync();
    }

    public async Task<BankTransactionDto> ProcessWebhookAsync(SepayWebhookDto dto)
    {
        // skip if non-incoming
        if (!string.Equals(dto.TransferType, "in", StringComparison.OrdinalIgnoreCase))
        {
            var skip = new BankTransaction
            {
                Gateway = dto.Gateway,
                TransactionDate = ParseDate(dto.TransactionDate),
                AccountNumber = dto.AccountNumber,
                TransferAmount = dto.TransferAmount,
                TransferType = dto.TransferType,
                Content = dto.Content,
                ReferenceCode = dto.ReferenceCode,
            };
            _db.BankTransactions.Add(skip);
            await _db.SaveChangesAsync();
            return MapToDto(skip);
        }

        var tx = new BankTransaction
        {
            Gateway = dto.Gateway,
            TransactionDate = ParseDate(dto.TransactionDate),
            AccountNumber = dto.AccountNumber,
            TransferAmount = dto.TransferAmount,
            TransferType = dto.TransferType,
            Content = dto.Content ?? string.Empty,
            ReferenceCode = dto.ReferenceCode,
        };

        var matched = await TryMatchInvoiceAsync(tx);
        if (matched != null)
        {
            tx.MatchedInvoiceId = matched.Id;
            matched.Status = InvoiceStatus.Paid;
            matched.PaidDate = DateTime.SpecifyKind(tx.TransactionDate, DateTimeKind.Utc);
        }

        _db.BankTransactions.Add(tx);
        await _db.SaveChangesAsync();
        return MapToDto(tx);
    }

    public async Task<BankTransactionDto?> ManualMatchAsync(int transactionId, int invoiceId)
    {
        var tx = await _db.BankTransactions.FindAsync(transactionId);
        var inv = await _db.Invoices.FindAsync(invoiceId);
        if (tx == null || inv == null) return null;

        tx.MatchedInvoiceId = inv.Id;
        inv.Status = InvoiceStatus.Paid;
        inv.PaidDate = DateTime.SpecifyKind(tx.TransactionDate, DateTimeKind.Utc);
        await _db.SaveChangesAsync();

        return await _db.BankTransactions
            .Include(t => t.MatchedInvoice).ThenInclude(i => i!.Company)
            .Include(t => t.MatchedInvoice).ThenInclude(i => i!.Contract).ThenInclude(c => c!.Company)
            .Where(t => t.Id == tx.Id)
            .Select(t => MapToDto(t))
            .FirstAsync();
    }

    private async Task<Invoice?> TryMatchInvoiceAsync(BankTransaction tx)
    {
        var content = NormalizeText(tx.Content);

        // 1. Match by HD<id> code in content (best signal)
        var idMatch = Regex.Match(tx.Content, @"HD\s*(\d+)", RegexOptions.IgnoreCase);
        if (idMatch.Success && int.TryParse(idMatch.Groups[1].Value, out var hdId))
        {
            var inv = await _db.Invoices.FirstOrDefaultAsync(i =>
                i.Id == hdId && i.Status != InvoiceStatus.Paid);
            if (inv != null && inv.TotalAmount == tx.TransferAmount) return inv;
        }

        // 2. Match by amount + tax code in content
        var taxCodeMatch = Regex.Match(tx.Content, @"\b(\d{10,13})\b");
        if (taxCodeMatch.Success)
        {
            var taxCode = taxCodeMatch.Groups[1].Value;
            var company = await _db.Companies.FirstOrDefaultAsync(c => c.TaxCode == taxCode);
            if (company != null)
            {
                var inv = await _db.Invoices
                    .Where(i => i.Status != InvoiceStatus.Paid && i.TotalAmount == tx.TransferAmount
                        && (i.CompanyId == company.Id ||
                            (i.Contract != null && i.Contract.CompanyId == company.Id)))
                    .FirstOrDefaultAsync();
                if (inv != null) return inv;
            }
        }

        // 3. Match by amount + company name in content
        var pendingInvoices = await _db.Invoices
            .Include(i => i.Company)
            .Include(i => i.Contract).ThenInclude(c => c!.Company)
            .Where(i => i.Status != InvoiceStatus.Paid && i.TotalAmount == tx.TransferAmount)
            .ToListAsync();

        foreach (var inv in pendingInvoices)
        {
            var companyName = inv.Company?.Name ?? inv.Contract?.Company?.Name;
            if (string.IsNullOrEmpty(companyName)) continue;
            var keywords = ExtractCompanyKeywords(companyName);
            if (keywords.Any(k => content.Contains(k))) return inv;
        }

        return null;
    }

    private static string NormalizeText(string s)
    {
        if (string.IsNullOrEmpty(s)) return string.Empty;
        return RemoveDiacritics(s).ToUpperInvariant();
    }

    private static string RemoveDiacritics(string text)
    {
        var normalized = text.Normalize(System.Text.NormalizationForm.FormD);
        var sb = new System.Text.StringBuilder();
        foreach (var c in normalized)
        {
            var category = System.Globalization.CharUnicodeInfo.GetUnicodeCategory(c);
            if (category != System.Globalization.UnicodeCategory.NonSpacingMark)
                sb.Append(c);
        }
        return sb.ToString().Normalize(System.Text.NormalizationForm.FormC).Replace('đ', 'd').Replace('Đ', 'D');
    }

    private static IEnumerable<string> ExtractCompanyKeywords(string companyName)
    {
        var stop = new HashSet<string>(StringComparer.OrdinalIgnoreCase)
        {
            "CONG", "TY", "CTY", "TNHH", "CP", "CO", "PHAN", "TRACH", "NHIEM", "HUU", "HAN",
            "VIET", "NAM", "QUOC", "TE", "THUONG", "MAI", "DICH", "VU", "VAN", "TAI"
        };
        var normalized = NormalizeText(companyName);
        return normalized.Split(new[] { ' ', ',', '.', '-' }, StringSplitOptions.RemoveEmptyEntries)
            .Where(w => w.Length >= 3 && !stop.Contains(w))
            .Distinct()
            .ToList();
    }

    private static DateTime ParseDate(string s)
    {
        if (DateTime.TryParse(s, out var dt))
            return DateTime.SpecifyKind(dt, DateTimeKind.Utc);
        return DateTime.UtcNow;
    }

    private static BankTransactionDto MapToDto(BankTransaction t)
    {
        var companyName = t.MatchedInvoice?.Company?.Name
            ?? t.MatchedInvoice?.Contract?.Company?.Name;
        return new BankTransactionDto
        {
            Id = t.Id,
            Gateway = t.Gateway,
            TransactionDate = t.TransactionDate,
            TransferAmount = t.TransferAmount,
            Content = t.Content,
            ReferenceCode = t.ReferenceCode,
            MatchedInvoiceId = t.MatchedInvoiceId,
            MatchedCompanyName = companyName,
            CreatedAt = t.CreatedAt,
        };
    }
}
