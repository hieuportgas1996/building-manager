using BuildingManager.Domain.Enums;

namespace BuildingManager.Application.DTOs;

public class OfficeDto
{
    public int Id { get; set; }
    public int FloorId { get; set; }
    public int FloorNumber { get; set; }
    public string BuildingName { get; set; } = string.Empty;
    public string OfficeName { get; set; } = string.Empty;
    public decimal Area { get; set; }
    public decimal PricePerM2 { get; set; }
    public decimal MonthlyPrice => Area * PricePerM2;
    public OfficeStatus Status { get; set; }
}

public class CreateOfficeDto
{
    public int FloorId { get; set; }
    public string OfficeName { get; set; } = string.Empty;
    public decimal Area { get; set; }
    public decimal PricePerM2 { get; set; }
}

public class UpdateOfficeDto : CreateOfficeDto
{
    public OfficeStatus Status { get; set; }
}
