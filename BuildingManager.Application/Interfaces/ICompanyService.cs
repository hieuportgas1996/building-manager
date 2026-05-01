using BuildingManager.Application.DTOs;

namespace BuildingManager.Application.Interfaces;

public interface ICompanyService
{
    Task<IEnumerable<CompanyDto>> GetAllAsync();
    Task<CompanyDto?> GetByIdAsync(int id);
    Task<CompanyDto> CreateAsync(CreateCompanyDto dto);
    Task<CompanyDto?> UpdateAsync(int id, UpdateCompanyDto dto);
    Task<bool> DeleteAsync(int id);
}
