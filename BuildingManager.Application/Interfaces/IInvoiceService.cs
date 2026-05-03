using BuildingManager.Application.DTOs;
using BuildingManager.Domain.Enums;

namespace BuildingManager.Application.Interfaces;

public interface IInvoiceService
{
    Task<IEnumerable<InvoiceDto>> GetAllAsync(int? year = null, int? month = null);
    Task<InvoiceDto?> GetByIdAsync(int id);
    Task<IEnumerable<InvoiceDto>> GetByContractAsync(int contractId);
    Task<InvoiceDto> CreateAsync(CreateInvoiceDto dto);
    Task<InvoiceDto> CreateFromPdfAsync(CreateInvoiceFromPdfDto dto);
    Task<InvoiceDto?> MarkAsPaidAsync(int id, PayInvoiceDto dto);
    Task<InvoiceDto?> UpdateStatusAsync(int id, InvoiceStatus status);
    Task<bool> DeleteAsync(int id);
    Task<DashboardDto> GetDashboardAsync();
}
