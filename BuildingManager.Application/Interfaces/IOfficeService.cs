using BuildingManager.Application.DTOs;

namespace BuildingManager.Application.Interfaces;

public interface IOfficeService
{
    Task<IEnumerable<OfficeDto>> GetAllAsync();
    Task<OfficeDto?> GetByIdAsync(int id);
    Task<OfficeDto> CreateAsync(CreateOfficeDto dto);
    Task<OfficeDto?> UpdateAsync(int id, UpdateOfficeDto dto);
    Task<bool> DeleteAsync(int id);
}
