using BuildingManager.Application.DTOs;
using BuildingManager.Domain.Entities;
using BuildingManager.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace BuildingManager.Application.Services;

public class BuildingService
{
    private readonly AppDbContext _db;
    public BuildingService(AppDbContext db) => _db = db;

    public async Task<IEnumerable<BuildingDto>> GetAllAsync()
    {
        return await _db.Buildings
            .Include(b => b.Floors).ThenInclude(f => f.Offices)
            .OrderBy(b => b.Name)
            .Select(b => MapToDto(b))
            .ToListAsync();
    }

    public async Task<BuildingDto?> GetByIdAsync(int id)
    {
        var b = await _db.Buildings
            .Include(b => b.Floors).ThenInclude(f => f.Offices)
            .FirstOrDefaultAsync(b => b.Id == id);
        return b == null ? null : MapToDto(b);
    }

    public async Task<BuildingDto> CreateAsync(CreateBuildingDto dto)
    {
        var building = new Building
        {
            Name = dto.Name,
            Address = dto.Address,
            TotalArea = dto.TotalArea,
            Description = dto.Description,
            TotalFloors = 0,
        };
        _db.Buildings.Add(building);
        await _db.SaveChangesAsync();
        return (await GetByIdAsync(building.Id))!;
    }

    public async Task<BuildingDto?> UpdateAsync(int id, UpdateBuildingDto dto)
    {
        var b = await _db.Buildings.FindAsync(id);
        if (b == null) return null;
        b.Name = dto.Name;
        b.Address = dto.Address;
        b.TotalArea = dto.TotalArea;
        b.Description = dto.Description;
        await _db.SaveChangesAsync();
        return await GetByIdAsync(id);
    }

    public async Task<bool> DeleteAsync(int id)
    {
        var b = await _db.Buildings.FindAsync(id);
        if (b == null) return false;
        _db.Buildings.Remove(b);
        await _db.SaveChangesAsync();
        return true;
    }

    // Floor methods
    public async Task<IEnumerable<FloorDto>> GetFloorsAsync(int buildingId)
    {
        return await _db.Floors
            .Include(f => f.Building)
            .Include(f => f.Offices)
            .Where(f => f.BuildingId == buildingId)
            .OrderBy(f => f.FloorNumber)
            .Select(f => MapFloorToDto(f))
            .ToListAsync();
    }

    public async Task<FloorDto> CreateFloorAsync(CreateFloorDto dto)
    {
        var floor = new Floor
        {
            BuildingId = dto.BuildingId,
            FloorNumber = dto.FloorNumber,
            TotalArea = dto.TotalArea,
        };
        _db.Floors.Add(floor);

        var building = await _db.Buildings.FindAsync(dto.BuildingId);
        if (building != null)
            building.TotalFloors = await _db.Floors.CountAsync(f => f.BuildingId == dto.BuildingId) + 1;

        await _db.SaveChangesAsync();

        var saved = await _db.Floors.Include(f => f.Building).Include(f => f.Offices)
            .FirstAsync(f => f.Id == floor.Id);
        return MapFloorToDto(saved);
    }

    public async Task<bool> DeleteFloorAsync(int floorId)
    {
        var floor = await _db.Floors.FindAsync(floorId);
        if (floor == null) return false;
        _db.Floors.Remove(floor);

        var building = await _db.Buildings.FindAsync(floor.BuildingId);
        if (building != null && building.TotalFloors > 0)
            building.TotalFloors--;

        await _db.SaveChangesAsync();
        return true;
    }

    private static BuildingDto MapToDto(Building b) => new()
    {
        Id = b.Id,
        Name = b.Name,
        Address = b.Address,
        TotalFloors = b.TotalFloors,
        TotalArea = b.TotalArea,
        Description = b.Description,
        Floors = b.Floors.OrderBy(f => f.FloorNumber).Select(MapFloorToDto).ToList(),
    };

    private static FloorDto MapFloorToDto(Floor f) => new()
    {
        Id = f.Id,
        BuildingId = f.BuildingId,
        BuildingName = f.Building?.Name ?? string.Empty,
        FloorNumber = f.FloorNumber,
        TotalArea = f.TotalArea,
        OfficeCount = f.Offices?.Count ?? 0,
    };
}
