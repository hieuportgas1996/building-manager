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

    [HttpPost("webhook/casso")]
    public async Task<IActionResult> CassoWebhook([FromBody] CassoWebhookDto dto)
    {
        var expectedToken = _config["Casso:ApiKey"];
        if (!string.IsNullOrEmpty(expectedToken))
        {
            var auth = Request.Headers["Secure-Token"].ToString();
            if (string.IsNullOrEmpty(auth) || auth != expectedToken)
            {
                return Unauthorized();
            }
        }

        try
        {
            var results = await _service.ProcessCassoWebhookAsync(dto);
            return Ok(new { error = 0, message = "Success", count = results.Count });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { error = 1, message = ex.Message, inner = ex.InnerException?.Message });
        }
    }

    [HttpPost("{transactionId}/match/{invoiceId}")]
    public async Task<IActionResult> ManualMatch(int transactionId, int invoiceId)
    {
        var result = await _service.ManualMatchAsync(transactionId, invoiceId);
        return result == null ? NotFound() : Ok(result);
    }

    [HttpPost("{transactionId}/unmatch")]
    public async Task<IActionResult> Unmatch(int transactionId, [FromQuery] bool revertInvoice = true)
    {
        var result = await _service.UnmatchAsync(transactionId, revertInvoice);
        return result == null ? NotFound() : Ok(result);
    }

    [HttpDelete("{transactionId}")]
    public async Task<IActionResult> Delete(int transactionId)
    {
        var success = await _service.DeleteAsync(transactionId);
        return success ? NoContent() : NotFound();
    }
}
