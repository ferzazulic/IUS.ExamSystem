using IUS.ExamSystem.Domain.Entities;
using IUS.ExamSystem.Infrastructure.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace IUS.ExamSystem.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class NotificationController : ControllerBase
{
    private readonly AppDbContext _db;

    public NotificationController(AppDbContext db)
    {
        _db = db;
    }

    [HttpGet]
    [Authorize]
    public async Task<IActionResult> GetAll()
    {
        var notifications = await _db.Notifications
            .Include(n => n.CreatedBy)
            .OrderByDescending(n => n.CreatedAt)
            .Select(n => new
            {
                n.Id,
                n.Title,
                n.Body,
                n.Type,
                n.IsImportant,
                n.CreatedAt,
                createdBy = n.CreatedBy.FullName
            })
            .ToListAsync();

        return Ok(notifications);
    }

    [HttpPost]
    [Authorize(Roles = "Admin,Staff")]
    public async Task<IActionResult> Create([FromBody] CreateNotificationRequest request)
    {
        if (string.IsNullOrWhiteSpace(request?.Title) || string.IsNullOrWhiteSpace(request?.Body))
            return BadRequest(new { error = "Title and body are required" });

        var userIdClaim = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
        if (userIdClaim == null) return Unauthorized();

        var notification = new Notification
        {
            Title = request.Title,
            Body = request.Body,
            Type = request.Type ?? "info",
            IsImportant = request.IsImportant,
            CreatedById = int.Parse(userIdClaim),
            CreatedAt = DateTime.UtcNow
        };

        _db.Notifications.Add(notification);
        await _db.SaveChangesAsync();

        return Ok(new { notification.Id, notification.Title, notification.Body, notification.Type, notification.IsImportant, notification.CreatedAt });
    }

    [HttpDelete("{id:int}")]
    [Authorize(Roles = "Admin,Staff")]
    public async Task<IActionResult> Delete(int id)
    {
        var notification = await _db.Notifications.FindAsync(id);
        if (notification == null) return NotFound(new { error = "Notification not found" });
        _db.Notifications.Remove(notification);
        await _db.SaveChangesAsync();
        return Ok(new { message = "Notification deleted" });
    }
}

public class CreateNotificationRequest
{
    public string Title { get; set; }
    public string Body { get; set; }
    public string Type { get; set; }
    public bool IsImportant { get; set; }
}
