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

    [HttpPost("allocate/{examId:int}")]
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

    [HttpPost("allocate-selected/{examId:int}")]
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

    [HttpGet("{examId:int}")]
    [Authorize]
    public async Task<IActionResult> GetExamById(int examId)
    {
        var exam = await _service.GetExamById(examId);
        if (exam == null)
            return NotFound(new { error = "Exam not found" });

        return Ok(exam);
    }

    [HttpGet("{examId:int}/available-seats")]
    [Authorize]
    public async Task<IActionResult> GetAvailableSeats(int examId)
    {
        try
        {
            var availableSeats = await _service.GetAvailableSeats(examId);
            var exam = await _service.GetExamById(examId); // To get room info
            return Ok(new
            {
                examId,
                roomName = exam?.Room?.Name,
                totalCapacity = exam?.Room?.Capacity ?? 0,
                occupiedSeats = exam?.Assignments?.Count ?? 0,
                availableSeats = availableSeats.Select(s => new
                {
                    seatId = s.Id,
                    seatNumber = s.Number,
                    roomId = s.RoomId
                }).ToList()
            });
        }
        catch (Exception ex)
        {
            return BadRequest(new { error = ex.Message });
        }
    }

    [HttpGet]
    [Authorize]
    public async Task<IActionResult> GetAllExams()
    {
        var exams = await _service.GetAllExams();
        return Ok(new { exams });
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
    [HttpDelete("{examId:int}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> DeleteExam(int examId)
    {
        var result = await _service.DeleteExam(examId);
        if (!result) return NotFound(new { message = "Exam not found" });
        return Ok(new { message = "Exam deleted" });
    }

    [HttpGet("my-seats")]
    [Authorize(Roles = "Student")]
    public async Task<IActionResult> GetMySeats()
    {
        var userIdClaim = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
        if (userIdClaim == null) return Unauthorized();

        var assignments = await _service.GetStudentAssignments(int.Parse(userIdClaim));
        return Ok(assignments.Select(a => new
        {
            examId = a.ExamId,
            subject = a.Exam.Subject,
            examDate = a.Exam.StartTime,
            roomName = a.Exam.Room?.Name,
            seatNumber = a.SeatId.HasValue ? a.Seat?.Number : (int?)null,
            feedback = a.Feedback,
            feedbackSubmittedAt = a.FeedbackSubmittedAt
        }));
    }

    [HttpPost("{examId:int}/enroll")]
    [Authorize(Roles = "Student")]
    public async Task<IActionResult> Enroll(int examId, [FromBody] EnrollRequest request)
    {
        var userIdClaim = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
        if (userIdClaim == null) return Unauthorized();
        try
        {
            await _service.EnrollStudent(examId, int.Parse(userIdClaim), request?.SeatId);
            return Ok(new { message = "Enrolled successfully" });
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { error = ex.Message });
        }
    }

    [HttpDelete("{examId:int}/enroll")]
    [Authorize(Roles = "Student")]
    public async Task<IActionResult> Unenroll(int examId)
    {
        var userIdClaim = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
        if (userIdClaim == null) return Unauthorized();
        await _service.UnenrollStudent(examId, int.Parse(userIdClaim));
        return Ok(new { message = "Unenrolled successfully" });
    }

    [HttpPost("{examId:int}/feedback")]
    [Authorize(Roles = "Student")]
    public async Task<IActionResult> SubmitFeedback(int examId, [FromBody] SubmitExamFeedbackRequest request)
    {
        if (request == null || string.IsNullOrWhiteSpace(request.Feedback))
            return BadRequest(new { error = "Feedback text is required." });

        var userIdClaim = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
        if (userIdClaim == null) return Unauthorized();

        try
        {
            await _service.SubmitExamFeedback(examId, int.Parse(userIdClaim), request.Feedback);
            return Ok(new { message = "Feedback submitted successfully" });
        }
        catch (ArgumentException ex)
        {
            return NotFound(new { error = ex.Message });
        }
    }
}

public class SubmitExamFeedbackRequest
{
    public string Feedback { get; set; }
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

public class EnrollRequest
{
    public int? SeatId { get; set; }
}