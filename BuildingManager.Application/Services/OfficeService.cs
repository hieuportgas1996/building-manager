using BuildingManager.Application.DTOs;
using BuildingManager.Application.Interfaces;
using BuildingManager.Domain.Entities;
using BuildingManager.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace BuildingManager.Application.Services;

public class OfficeService : IOfficeService
{
    private readonly AppDbContext _db;

    public OfficeService(AppDbContext db) => _db = db;

    public async Task<IEnumerable<OfficeDto>> GetAllAsync()
    {
        return await _db.Offices
            .Include(o => o.Floor).ThenInclude(f => f.Building)
            .Select(o => MapToDto(o))
            .ToListAsync();
    }

    public async Task<OfficeDto?> GetByIdAsync(int id)
    {
        var o = await _db.Offices
            .Include(x => x.Floor).ThenInclude(f => f.Building)
            .FirstOrDefaultAsync(x => x.Id == id);
        return o == null ? null : MapToDto(o);
    }

    public async Task<OfficeDto> CreateAsync(CreateOfficeDto dto)
    {
        var office = new Office
        {
            FloorId = dto.FloorId,
            OfficeName = dto.OfficeName,
            Area = dto.Area,
            PricePerM2 = dto.PricePerM2
        };
        _db.Offices.Add(office);
        await _db.SaveChangesAsync();
        return (await GetByIdAsync(office.Id))!;
    }

    public async Task<OfficeDto?> UpdateAsync(int id, UpdateOfficeDto dto)
    {
        var office = await _db.Offices.FindAsync(id);
        if (office == null) return null;

        office.FloorId = dto.FloorId;
        office.OfficeName = dto.OfficeName;
        office.Area = dto.Area;
        office.PricePerM2 = dto.PricePerM2;
        office.Status = dto.Status;

        await _db.SaveChangesAsync();
        return await GetByIdAsync(id);
    }

    public async Task<bool> DeleteAsync(int id)
    {
        var office = await _db.Offices.FindAsync(id);
        if (office == null) return false;
        _db.Offices.Remove(office);
        await _db.SaveChangesAsync();
        return true;
    }

    private static OfficeDto MapToDto(Office o) => new()
    {
        Id = o.Id,
        FloorId = o.FloorId,
        FloorNumber = o.Floor?.FloorNumber ?? 0,
        BuildingName = o.Floor?.Building?.Name ?? string.Empty,
        OfficeName = o.OfficeName,
        Area = o.Area,
        PricePerM2 = o.PricePerM2,
        Status = o.Status
    };
}
