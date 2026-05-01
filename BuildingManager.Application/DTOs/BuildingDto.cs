namespace BuildingManager.Application.DTOs;

public class BuildingDto
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Address { get; set; } = string.Empty;
    public int TotalFloors { get; set; }
    public decimal TotalArea { get; set; }
    public string? Description { get; set; }
    public List<FloorDto> Floors { get; set; } = new();
}

public class CreateBuildingDto
{
    public string Name { get; set; } = string.Empty;
    public string Address { get; set; } = string.Empty;
    public decimal TotalArea { get; set; }
    public string? Description { get; set; }
}

public class UpdateBuildingDto : CreateBuildingDto { }

public class FloorDto
{
    public int Id { get; set; }
    public int BuildingId { get; set; }
    public string BuildingName { get; set; } = string.Empty;
    public int FloorNumber { get; set; }
    public decimal TotalArea { get; set; }
    public int OfficeCount { get; set; }
}

public class CreateFloorDto
{
    public int BuildingId { get; set; }
    public int FloorNumber { get; set; }
    public decimal TotalArea { get; set; }
}

public class UpdateFloorDto : CreateFloorDto { }
