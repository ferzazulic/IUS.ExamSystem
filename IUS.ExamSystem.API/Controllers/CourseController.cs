using IUS.ExamSystem.Domain.Entities;
using IUS.ExamSystem.Infrastructure.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace IUS.ExamSystem.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class CourseController : ControllerBase
{
    private readonly AppDbContext _db;

    public CourseController(AppDbContext db)
    {
        _db = db;
    }

    [HttpGet]
    [Authorize]
    public async Task<IActionResult> GetAll()
    {
        var courses = await _db.Courses
            .Select(c => new { c.Id, c.Code, c.Name, c.Type, c.Professor })
            .ToListAsync();
        return Ok(courses);
    }

    [HttpGet("my-courses")]
    [Authorize(Roles = "Student")]
    public async Task<IActionResult> GetMyCourses()
    {
        var userIdClaim = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
        if (userIdClaim == null) return Unauthorized();

        var courses = await _db.CourseEnrollments
            .Where(e => e.StudentId == int.Parse(userIdClaim))
            .Include(e => e.Course)
            .Select(e => new
            {
                e.Course.Id,
                e.Course.Code,
                e.Course.Name,
                e.Course.Type,
                e.Course.Professor
            })
            .ToListAsync();

        return Ok(courses);
    }

    [HttpPost]
    [Authorize(Roles = "Admin,Staff")]
    public async Task<IActionResult> Create([FromBody] CreateCourseRequest request)
    {
        if (string.IsNullOrWhiteSpace(request?.Code) || string.IsNullOrWhiteSpace(request?.Name))
            return BadRequest(new { error = "Code and Name are required" });

        var course = new Course
        {
            Code = request.Code,
            Name = request.Name,
            Type = request.Type ?? "",
            Professor = request.Professor ?? ""
        };

        _db.Courses.Add(course);
        await _db.SaveChangesAsync();
        return CreatedAtAction(nameof(GetAll), new { id = course.Id }, new
        {
            course.Id, course.Code, course.Name, course.Type, course.Professor
        });
    }

    [HttpDelete("{id:int}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Delete(int id)
    {
        var course = await _db.Courses.FindAsync(id);
        if (course == null) return NotFound(new { error = "Course not found" });
        _db.Courses.Remove(course);
        await _db.SaveChangesAsync();
        return Ok(new { message = "Course deleted" });
    }

    [HttpPost("{id:int}/enroll")]
    [Authorize(Roles = "Student")]
    public async Task<IActionResult> Enroll(int id)
    {
        var userIdClaim = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
        if (userIdClaim == null) return Unauthorized();
        int studentId = int.Parse(userIdClaim);

        if (!await _db.Courses.AnyAsync(c => c.Id == id))
            return NotFound(new { error = "Course not found" });

        if (await _db.CourseEnrollments.AnyAsync(e => e.StudentId == studentId && e.CourseId == id))
            return BadRequest(new { error = "Already enrolled in this course" });

        _db.CourseEnrollments.Add(new CourseEnrollment { StudentId = studentId, CourseId = id });
        await _db.SaveChangesAsync();
        return Ok(new { message = "Enrolled successfully" });
    }

    [HttpDelete("{id:int}/enroll")]
    [Authorize(Roles = "Student")]
    public async Task<IActionResult> Unenroll(int id)
    {
        var userIdClaim = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
        if (userIdClaim == null) return Unauthorized();
        int studentId = int.Parse(userIdClaim);

        var enrollment = await _db.CourseEnrollments
            .FirstOrDefaultAsync(e => e.StudentId == studentId && e.CourseId == id);
        if (enrollment == null) return NotFound(new { error = "Not enrolled in this course" });

        _db.CourseEnrollments.Remove(enrollment);
        await _db.SaveChangesAsync();
        return Ok(new { message = "Unenrolled successfully" });
    }

    [HttpPost("{id:int}/enroll/{studentId:int}")]
    [Authorize(Roles = "Admin,Staff")]
    public async Task<IActionResult> EnrollStudent(int id, int studentId)
    {
        if (!await _db.Courses.AnyAsync(c => c.Id == id))
            return NotFound(new { error = "Course not found" });

        if (await _db.CourseEnrollments.AnyAsync(e => e.StudentId == studentId && e.CourseId == id))
            return BadRequest(new { error = "Student already enrolled" });

        _db.CourseEnrollments.Add(new CourseEnrollment { StudentId = studentId, CourseId = id });
        await _db.SaveChangesAsync();
        return Ok(new { message = "Student enrolled" });
    }
}

public class CreateCourseRequest
{
    public string Code { get; set; }
    public string Name { get; set; }
    public string Type { get; set; }
    public string Professor { get; set; }
}
