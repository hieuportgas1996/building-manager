using BuildingManager.Application.DTOs;
using BuildingManager.Application.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace BuildingManager.Controllers;

[ApiController]
[Route("api/[controller]")]
public class InvoicesController : ControllerBase
{
    private readonly IInvoiceService _service;

    public InvoicesController(IInvoiceService service) => _service = service;

    [HttpGet]
    public async Task<IActionResult> GetAll([FromQuery] int? year, [FromQuery] int? month) =>
        Ok(await _service.GetAllAsync(year, month));

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(int id)
    {
        var result = await _service.GetByIdAsync(id);
        return result == null ? NotFound() : Ok(result);
    }

    [HttpGet("contract/{contractId}")]
    public async Task<IActionResult> GetByContract(int contractId) =>
        Ok(await _service.GetByContractAsync(contractId));

    [HttpPost]
    public async Task<IActionResult> Create(CreateInvoiceDto dto)
    {
        var result = await _service.CreateAsync(dto);
        return CreatedAtAction(nameof(GetById), new { id = result.Id }, result);
    }

    [HttpPatch("{id}/pay")]
    public async Task<IActionResult> MarkAsPaid(int id, PayInvoiceDto dto)
    {
        var result = await _service.MarkAsPaidAsync(id, dto);
        return result == null ? NotFound() : Ok(result);
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var success = await _service.DeleteAsync(id);
        return success ? NoContent() : NotFound();
    }
}
