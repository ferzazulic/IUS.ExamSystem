using IUS.ExamSystem.Application.Interfaces;
using IUS.ExamSystem.Domain.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace IUS.ExamSystem.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ExamController : ControllerBase
{
    private readonly IExamService _service;
    private readonly IConflictDetectionService _conflictService;

    public ExamController(IExamService service, IConflictDetectionService conflictService)
    {
        _service = service;
        _conflictService = conflictService;
    }

    [HttpPost("allocate/{examId}")]
    [Authorize(Roles = "Admin,Staff")]
    public async Task<IActionResult> AllocateSeats(int examId)
    {
        try
        {
            await _service.AllocateSeats(examId);
            return Ok(new { message = "Seats allocated successfully", examId });
        }
        catch (Exception ex)
        {
            return BadRequest(new { error = ex.Message });
        }
    }

    [HttpPost("allocate-selected/{examId}")]
    [Authorize(Roles = "Admin,Staff")]
    public async Task<IActionResult> AllocateSeatsForStudents(int examId, [FromBody] AllocateSeatsRequest request)
    {
        if (request?.StudentIds == null || !request.StudentIds.Any())
            return BadRequest(new { error = "Student IDs list cannot be empty" });

        try
        {
            await _service.AllocateSeatsForStudents(examId, request.StudentIds);
            return Ok(new { message = "Seats allocated for selected students", examId, studentCount = request.StudentIds.Count });
        }
        catch (Exception ex)
        {
            return BadRequest(new { error = ex.Message });
        }
    }

    [HttpPost("check-conflicts")]
    [Authorize(Roles = "Admin,Staff")]
    public async Task<IActionResult> CheckConflicts([FromBody] ConflictCheckRequest request)
    {
        if (request?.StudentId <= 0 || request?.ExamId <= 0)
            return BadRequest(new { error = "Invalid student ID or exam ID" });

        try
        {
            var hasConflict = await _conflictService.HasExamConflict(request.StudentId, request.ExamId);
            var conflictingExams = hasConflict
                ? await _conflictService.GetConflictingExams(request.StudentId, request.ExamId)
                : new List<Exam>();

            return Ok(new
            {
                hasConflict,
                conflictingExams = conflictingExams.Select(e => new
                {
                    examId = e.Id,
                    subject = e.Subject,
                    startTime = e.StartTime,
                    endTime = e.EndTime
                }).ToList()
            });
        }
        catch (Exception ex)
        {
            return BadRequest(new { error = ex.Message });
        }
    }

    [HttpGet("{examId}")]
    [Authorize]
    public async Task<IActionResult> GetExamById(int examId)
    {
        var exam = await _service.GetExamById(examId);
        if (exam == null)
            return NotFound(new { error = "Exam not found" });

        return Ok(exam);
    }

    [HttpGet]
    [Authorize]
    public async Task<IActionResult> GetAllExams()
    {
        var exams = await _service.GetAllExams();
        return Ok(exams);
    }

    [HttpPost]
    [Authorize(Roles = "Admin,Staff")]
    public async Task<IActionResult> CreateExam([FromBody] CreateExamRequest request)
    {
        if (string.IsNullOrWhiteSpace(request?.Subject) || request.RoomId <= 0)
            return BadRequest(new { error = "Invalid exam data" });

        if (request.EndTime <= request.StartTime)
            return BadRequest(new { error = "End time must be after start time" });

        try
        {
            var exam = new Exam
            {
                Subject = request.Subject,
                StartTime = request.StartTime,
                EndTime = request.EndTime,
                RoomId = request.RoomId
            };

            var created = await _service.CreateExam(exam);
            return CreatedAtAction(nameof(GetExamById), new { examId = created.Id }, created);
        }
        catch (Exception ex)
        {
            return BadRequest(new { error = ex.Message });
        }
    }
}

public class AllocateSeatsRequest
{
    public List<int> StudentIds { get; set; }
}

public class ConflictCheckRequest
{
    public int StudentId { get; set; }
    public int ExamId { get; set; }
}

public class CreateExamRequest
{
    public string Subject { get; set; }
    public DateTime StartTime { get; set; }
    public DateTime EndTime { get; set; }
    public int RoomId { get; set; }
}