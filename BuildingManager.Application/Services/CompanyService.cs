using BuildingManager.Application.DTOs;
using BuildingManager.Application.Interfaces;
using BuildingManager.Domain.Entities;
using BuildingManager.Domain.Enums;
using BuildingManager.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace BuildingManager.Application.Services;

public class CompanyService : ICompanyService
{
    private readonly AppDbContext _db;

    public CompanyService(AppDbContext db) => _db = db;

    public async Task<IEnumerable<CompanyDto>> GetAllAsync()
    {
        return await _db.Companies
            .Include(c => c.Contracts)
            .Select(c => new CompanyDto
            {
                Id = c.Id,
                Name = c.Name,
                TaxAddress = c.TaxAddress,
                TaxCode = c.TaxCode,
                ContactPerson = c.ContactPerson,
                ContactPhone = c.ContactPhone,
                ContactEmail = c.ContactEmail,
                CreatedAt = c.CreatedAt,
                ActiveContractsCount = c.Contracts.Count(x => x.Status == ContractStatus.Active)
            })
            .ToListAsync();
    }

    public async Task<CompanyDto?> GetByIdAsync(int id)
    {
        var c = await _db.Companies.Include(x => x.Contracts).FirstOrDefaultAsync(x => x.Id == id);
        if (c == null) return null;
        return MapToDto(c);
    }

    public async Task<CompanyDto> CreateAsync(CreateCompanyDto dto)
    {
        var company = new Company
        {
            Name = dto.Name,
            TaxAddress = dto.TaxAddress,
            TaxCode = dto.TaxCode,
            ContactPerson = dto.ContactPerson,
            ContactPhone = dto.ContactPhone,
            ContactEmail = dto.ContactEmail
        };
        _db.Companies.Add(company);
        await _db.SaveChangesAsync();
        return MapToDto(company);
    }

    public async Task<CompanyDto?> UpdateAsync(int id, UpdateCompanyDto dto)
    {
        var company = await _db.Companies.FindAsync(id);
        if (company == null) return null;

        company.Name = dto.Name;
        company.TaxAddress = dto.TaxAddress;
        company.TaxCode = dto.TaxCode;
        company.ContactPerson = dto.ContactPerson;
        company.ContactPhone = dto.ContactPhone;
        company.ContactEmail = dto.ContactEmail;

        await _db.SaveChangesAsync();
        return MapToDto(company);
    }

    public async Task<bool> DeleteAsync(int id)
    {
        var company = await _db.Companies.FindAsync(id);
        if (company == null) return false;
        _db.Companies.Remove(company);
        await _db.SaveChangesAsync();
        return true;
    }

    private static CompanyDto MapToDto(Company c) => new()
    {
        Id = c.Id,
        Name = c.Name,
        TaxAddress = c.TaxAddress,
        TaxCode = c.TaxCode,
        ContactPerson = c.ContactPerson,
        ContactPhone = c.ContactPhone,
        ContactEmail = c.ContactEmail,
        CreatedAt = c.CreatedAt,
        ActiveContractsCount = c.Contracts?.Count(x => x.Status == ContractStatus.Active) ?? 0
    };
}
