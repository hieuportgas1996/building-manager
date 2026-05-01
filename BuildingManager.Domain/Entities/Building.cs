namespace BuildingManager.Domain.Entities;

public class Building
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Address { get; set; } = string.Empty;
    public int TotalFloors { get; set; }
    public decimal TotalArea { get; set; }
    public string? Description { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public ICollection<Floor> Floors { get; set; } = new List<Floor>();
}
