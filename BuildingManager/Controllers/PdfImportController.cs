using BuildingManager.Application.DTOs;
using BuildingManager.Application.Services;
using Microsoft.AspNetCore.Mvc;

namespace BuildingManager.Controllers;

[ApiController]
[Route("api/[controller]")]
public class PdfImportController : ControllerBase
{
    private readonly PdfParserService _parser;

    public PdfImportController(PdfParserService parser)
    {
        _parser = parser;
    }

    [HttpPost("parse")]
    public ActionResult<PdfImportResultDto> Parse(IFormFile file)
    {
        if (file == null || file.Length == 0)
            return BadRequest("No file uploaded");

        if (!file.FileName.EndsWith(".pdf", StringComparison.OrdinalIgnoreCase))
            return BadRequest("Only PDF files are supported");

        using var stream = file.OpenReadStream();
        var result = _parser.Parse(stream);
        return Ok(result);
    }

    [HttpPost("parse-multiple")]
    public ActionResult<List<PdfImportResultDto>> ParseMultiple(List<IFormFile> files)
    {
        if (files == null || files.Count == 0)
            return BadRequest("No files uploaded");

        var results = new List<PdfImportResultDto>();
        foreach (var file in files)
        {
            if (!file.FileName.EndsWith(".pdf", StringComparison.OrdinalIgnoreCase))
                continue;
            using var stream = file.OpenReadStream();
            var result = _parser.Parse(stream);
            result.RawText = string.Empty; // don't send raw text for bulk
            results.Add(result);
        }
        return Ok(results);
    }
}
