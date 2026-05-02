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
        // Bearer token auth (configure SePay to send same token)
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

        var result = await _service.ProcessWebhookAsync(dto);
        return Ok(new { success = true, transactionId = result.Id, matched = result.MatchedInvoiceId });
    }

    [HttpPost("{transactionId}/match/{invoiceId}")]
    public async Task<IActionResult> ManualMatch(int transactionId, int invoiceId)
    {
        var result = await _service.ManualMatchAsync(transactionId, invoiceId);
        return result == null ? NotFound() : Ok(result);
    }
}
