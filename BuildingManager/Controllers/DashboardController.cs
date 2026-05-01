using BuildingManager.Application.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace BuildingManager.Controllers;

[ApiController]
[Route("api/[controller]")]
public class DashboardController : ControllerBase
{
    private readonly IInvoiceService _invoiceService;

    public DashboardController(IInvoiceService invoiceService) => _invoiceService = invoiceService;

    [HttpGet]
    public async Task<IActionResult> Get() => Ok(await _invoiceService.GetDashboardAsync());
}
