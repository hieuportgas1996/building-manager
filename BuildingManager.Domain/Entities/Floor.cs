namespace BuildingManager.Domain.Entities;

public class Floor
{
    public int Id { get; set; }
    public int BuildingId { get; set; }
    public int FloorNumber { get; set; }
    public decimal TotalArea { get; set; }

    public Building Building { get; set; } = null!;
    public ICollection<Office> Offices { get; set; } = new List<Office>();
}
