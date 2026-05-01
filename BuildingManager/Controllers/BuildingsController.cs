using BuildingManager.Application.DTOs;
using BuildingManager.Application.Services;
using Microsoft.AspNetCore.Mvc;

namespace BuildingManager.Controllers;

[ApiController]
[Route("api/[controller]")]
public class BuildingsController : ControllerBase
{
    private readonly BuildingService _service;
    public BuildingsController(BuildingService service) => _service = service;

    [HttpGet]
    public async Task<IActionResult> GetAll() => Ok(await _service.GetAllAsync());

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(int id)
    {
        var result = await _service.GetByIdAsync(id);
        return result == null ? NotFound() : Ok(result);
    }

    [HttpPost]
    public async Task<IActionResult> Create(CreateBuildingDto dto)
    {
        var result = await _service.CreateAsync(dto);
        return CreatedAtAction(nameof(GetById), new { id = result.Id }, result);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, UpdateBuildingDto dto)
    {
        var result = await _service.UpdateAsync(id, dto);
        return result == null ? NotFound() : Ok(result);
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var success = await _service.DeleteAsync(id);
        return success ? NoContent() : NotFound();
    }

    [HttpGet("{id}/floors")]
    public async Task<IActionResult> GetFloors(int id) =>
        Ok(await _service.GetFloorsAsync(id));

    [HttpPost("{id}/floors")]
    public async Task<IActionResult> CreateFloor(int id, [FromBody] CreateFloorDto dto)
    {
        dto.BuildingId = id;
        var result = await _service.CreateFloorAsync(dto);
        return Ok(result);
    }

    [HttpDelete("floors/{floorId}")]
    public async Task<IActionResult> DeleteFloor(int floorId)
    {
        var success = await _service.DeleteFloorAsync(floorId);
        return success ? NoContent() : NotFound();
    }
}
