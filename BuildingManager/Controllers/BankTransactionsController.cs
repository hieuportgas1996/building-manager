using BuildingManager.Application.DTOs;
using BuildingManager.Application.Services;
using Microsoft.AspNetCore.Mvc;

namespace BuildingManager.Controllers;

[ApiController]
[Route("api/[controller]")]
public class BankTransactionsController : ControllerBase
{
    private readonly BankTransactionService _service;
    private readonly IConfiguration _config;

    public BankTransactionsController(BankTransactionService service, IConfiguration config)
    {
        _service = service;
        _config = config;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll() =>
        Ok(await _service.GetAllAsync());

    [HttpPost("webhook/sepay")]
    public async Task<IActionResult> SepayWebhook([FromBody] SepayWebhookDto dto)
    {
        var expectedToken = _config["Sepay:ApiKey"];
        if (!string.IsNullOrEmpty(expectedToken))
        {
            var auth = Request.Headers["Authorization"].ToString();
            if (!auth.StartsWith("Apikey ", StringComparison.OrdinalIgnoreCase) ||
                auth.Substring(7).Trim() != expectedToken)
            {
                return Unauthorized();
            }
        }

        try
        {
            var result = await _service.ProcessWebhookAsync(dto);
            return Ok(new { success = true, transactionId = result.Id, matched = result.MatchedInvoiceId });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { success = false, error = ex.Message, inner = ex.InnerException?.Message });
        }
    }

    [HttpPost("{transactionId}/match/{invoiceId}")]
    public async Task<IActionResult> ManualMatch(int transactionId, int invoiceId)
    {
        var result = await _service.ManualMatchAsync(transactionId, invoiceId);
        return result == null ? NotFound() : Ok(result);
    }
}
