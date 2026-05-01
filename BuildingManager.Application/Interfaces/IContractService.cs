using BuildingManager.Application.DTOs;

namespace BuildingManager.Application.Interfaces;

public interface IContractService
{
    Task<IEnumerable<ContractDto>> GetAllAsync();
    Task<ContractDto?> GetByIdAsync(int id);
    Task<IEnumerable<ContractDto>> GetByCompanyAsync(int companyId);
    Task<ContractDto> CreateAsync(CreateContractDto dto);
    Task<ContractDto?> UpdateAsync(int id, UpdateContractDto dto);
    Task<bool> DeleteAsync(int id);
}
