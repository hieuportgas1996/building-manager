using BuildingManager.Domain.Enums;

namespace BuildingManager.Domain.Entities;

public class Office
{
    public int Id { get; set; }
    public int FloorId { get; set; }
    public string OfficeName { get; set; } = string.Empty;
    public decimal Area { get; set; }
    public decimal PricePerM2 { get; set; }
    public OfficeStatus Status { get; set; } = OfficeStatus.Available;

    public Floor Floor { get; set; } = null!;
    public ICollection<Contract> Contracts { get; set; } = new List<Contract>();
}
