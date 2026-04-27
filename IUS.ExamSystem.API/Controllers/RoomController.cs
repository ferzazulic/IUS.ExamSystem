using IUS.ExamSystem.Application.Interfaces;
using IUS.ExamSystem.Domain.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace IUS.ExamSystem.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class RoomController : ControllerBase
{
    private readonly IRoomService _service;

    public RoomController(IRoomService service)
    {
        _service = service;
    }

    [HttpGet]
    [Authorize(Roles = "Admin,Staff")]
    public async Task<IActionResult> GetAllRooms()
    {
        var rooms = await _service.GetAllRooms();
        return Ok(rooms);
    }

    [HttpGet("{id}")]
    [Authorize(Roles = "Admin,Staff")]
    public async Task<IActionResult> GetRoomById(int id)
    {
        var room = await _service.GetRoomById(id);
        if (room == null)
            return NotFound(new { error = "Room not found" });

        return Ok(room);
    }

    [HttpPost]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> CreateRoom([FromBody] CreateRoomRequest request)
    {
        if (string.IsNullOrWhiteSpace(request?.Name) || request.Capacity <= 0)
            return BadRequest(new { error = "Invalid room data" });

        try
        {
            var room = new Room
            {
                Name = request.Name,
                Capacity = request.Capacity
            };

            var created = await _service.CreateRoom(room);
            return CreatedAtAction(nameof(GetRoomById), new { id = created.Id }, new
            {
                created.Id,
                created.Name,
                created.Capacity,
                Seats = created.Seats.Select(s => new { s.Id, s.Number, s.RoomId })
            });
        }
        catch (Exception ex)
        {
            return BadRequest(new
            {
                error = ex.Message,
                details = ex.InnerException?.Message
            });
        }
    }

    [HttpPut("{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> UpdateRoom(int id, [FromBody] UpdateRoomRequest request)
    {
        if (string.IsNullOrWhiteSpace(request?.Name) || request.Capacity <= 0)
            return BadRequest(new { error = "Invalid room data" });

        try
        {
            var room = new Room
            {
                Name = request.Name,
                Capacity = request.Capacity
            };

            var updated = await _service.UpdateRoom(id, room);
            return Ok(updated);
        }
        catch (Exception ex)
        {
            return BadRequest(new { error = ex.Message });
        }
    }

    [HttpDelete("{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> DeleteRoom(int id)
    {
        try
        {
            var result = await _service.DeleteRoom(id);
            if (!result)
                return NotFound(new { error = "Room not found" });

            return Ok(new { message = "Room deleted successfully" });
        }
        catch (Exception ex)
        {
            return BadRequest(new { error = ex.Message });
        }
    }
}

public class CreateRoomRequest
{
    public string Name { get; set; }
    public int Capacity { get; set; }
}

public class UpdateRoomRequest
{
    public string Name { get; set; }
    public int Capacity { get; set; }
}