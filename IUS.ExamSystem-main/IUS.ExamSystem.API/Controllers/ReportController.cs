using IUS.ExamSystem.Application.DTOs;
using IUS.ExamSystem.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace IUS.ExamSystem.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class ReportController : ControllerBase
{
    private readonly IReportService _reportService;

    public ReportController(IReportService reportService)
    {
        _reportService = reportService;
    }

    /// <summary>
    /// Get comprehensive report for a specific exam including all student results
    /// </summary>
    [HttpGet("exam/{examId}")]
    [Authorize(Roles = "Admin,Staff")]
    public async Task<ActionResult<ExamReportDto>> GetExamReport(int examId)
    {
        try
        {
            var report = await _reportService.GetExamReport(examId);
            return Ok(report);
        }
        catch (ArgumentException ex)
        {
            return NotFound(new { message = ex.Message });
        }
    }

    /// <summary>
    /// Get academic report for a specific student including all their exam scores
    /// </summary>
    [HttpGet("student/{studentId}")]
    [Authorize(Roles = "Admin,Staff,Student")]
    public async Task<ActionResult<StudentReportDto>> GetStudentReport(int studentId)
    {
        try
        {
            var report = await _reportService.GetStudentReport(studentId);
            return Ok(report);
        }
        catch (ArgumentException ex)
        {
            return NotFound(new { message = ex.Message });
        }
    }

    /// <summary>
    /// Get all exam reports with aggregate statistics
    /// </summary>
    [HttpGet("exams/all")]
    [Authorize(Roles = "Admin,Staff")]
    public async Task<ActionResult<List<ExamReportDto>>> GetAllExamReports()
    {
        var reports = await _reportService.GetAllExamReports();
        return Ok(reports);
    }

    /// <summary>
    /// Get all student academic reports
    /// </summary>
    [HttpGet("students/all")]
    [Authorize(Roles = "Admin,Staff")]
    public async Task<ActionResult<List<StudentReportDto>>> GetAllStudentReports()
    {
        var reports = await _reportService.GetAllStudentReports();
        return Ok(reports);
    }

    /// <summary>
    /// Submit exam score and grade for a student assignment
    /// </summary>
    [HttpPost("submit-score")]
    [Authorize(Roles = "Admin,Staff")]
    public async Task<ActionResult<object>> SubmitExamScore([FromBody] SubmitScoreRequest request)
    {
        if (request == null || request.Score < 0 || request.Grade < 0)
            return BadRequest(new { message = "Invalid score or grade values" });

        try
        {
            var result = await _reportService.SubmitExamScore(request.AssignmentId, request.Score, request.Grade);
            return Ok(new { success = result, message = "Score submitted successfully" });
        }
        catch (ArgumentException ex)
        {
            return NotFound(new { message = ex.Message });
        }
    }
}

public class SubmitScoreRequest
{
    public int AssignmentId { get; set; }
    public decimal Score { get; set; }
    public decimal Grade { get; set; }
}
