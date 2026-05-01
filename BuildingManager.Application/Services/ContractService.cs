using BuildingManager.Application.DTOs;
using BuildingManager.Application.Interfaces;
using BuildingManager.Domain.Entities;
using BuildingManager.Domain.Enums;
using BuildingManager.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace BuildingManager.Application.Services;

public class ContractService : IContractService
{
    private readonly AppDbContext _db;

    public ContractService(AppDbContext db) => _db = db;

    public async Task<IEnumerable<ContractDto>> GetAllAsync()
    {
        return await _db.Contracts
            .Include(c => c.Company)
            .Include(c => c.Office).ThenInclude(o => o.Floor)
            .Select(c => MapToDto(c))
            .ToListAsync();
    }

    public async Task<ContractDto?> GetByIdAsync(int id)
    {
        var c = await _db.Contracts
            .Include(x => x.Company)
            .Include(x => x.Office).ThenInclude(o => o.Floor)
            .FirstOrDefaultAsync(x => x.Id == id);
        return c == null ? null : MapToDto(c);
    }

    public async Task<IEnumerable<ContractDto>> GetByCompanyAsync(int companyId)
    {
        return await _db.Contracts
            .Include(c => c.Company)
            .Include(c => c.Office).ThenInclude(o => o.Floor)
            .Where(c => c.CompanyId == companyId)
            .Select(c => MapToDto(c))
            .ToListAsync();
    }

    public async Task<ContractDto> CreateAsync(CreateContractDto dto)
    {
        var contract = new Contract
        {
            CompanyId = dto.CompanyId,
            OfficeId = dto.OfficeId,
            StartDate = dto.StartDate,
            EndDate = dto.EndDate,
            MonthlyRent = dto.MonthlyRent,
            Deposit = dto.Deposit,
            Notes = dto.Notes,
            Status = ContractStatus.Active
        };

        var office = await _db.Offices.FindAsync(dto.OfficeId);
        if (office != null) office.Status = OfficeStatus.Rented;

        _db.Contracts.Add(contract);
        await _db.SaveChangesAsync();

        return (await GetByIdAsync(contract.Id))!;
    }

    public async Task<ContractDto?> UpdateAsync(int id, UpdateContractDto dto)
    {
        var contract = await _db.Contracts.FindAsync(id);
        if (contract == null) return null;

        contract.CompanyId = dto.CompanyId;
        contract.OfficeId = dto.OfficeId;
        contract.StartDate = dto.StartDate;
        contract.EndDate = dto.EndDate;
        contract.MonthlyRent = dto.MonthlyRent;
        contract.Deposit = dto.Deposit;
        contract.Notes = dto.Notes;
        contract.Status = dto.Status;

        if (dto.Status != ContractStatus.Active)
        {
            var office = await _db.Offices.FindAsync(dto.OfficeId);
            if (office != null) office.Status = OfficeStatus.Available;
        }

        await _db.SaveChangesAsync();
        return await GetByIdAsync(id);
    }

    public async Task<bool> DeleteAsync(int id)
    {
        var contract = await _db.Contracts.FindAsync(id);
        if (contract == null) return false;
        _db.Contracts.Remove(contract);
        await _db.SaveChangesAsync();
        return true;
    }

    private static ContractDto MapToDto(Contract c) => new()
    {
        Id = c.Id,
        CompanyId = c.CompanyId,
        CompanyName = c.Company?.Name ?? string.Empty,
        OfficeId = c.OfficeId,
        OfficeName = c.Office?.OfficeName ?? string.Empty,
        FloorInfo = c.Office?.Floor != null ? $"Tầng {c.Office.Floor.FloorNumber}" : string.Empty,
        StartDate = c.StartDate,
        EndDate = c.EndDate,
        MonthlyRent = c.MonthlyRent,
        Deposit = c.Deposit,
        Status = c.Status,
        Notes = c.Notes,
        CreatedAt = c.CreatedAt
    };
}
