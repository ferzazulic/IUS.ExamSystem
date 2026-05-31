using IUS.ExamSystem.Application.Interfaces;
using IUS.ExamSystem.Domain.Enums;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace IUS.ExamSystem.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "Admin,Staff")]
public class UserController : ControllerBase
{
    private readonly IUserService _userService;

    public UserController(IUserService userService)
    {
        _userService = userService;
    }

    [HttpGet]
    public async Task<IActionResult> GetAllUsers()
    {
        var users = await _userService.GetAllUsers();
        return Ok(users.Select(u => new
        {
            u.Id,
            u.FullName,
            u.Email,
            Role = u.Role.ToString()
        }));
    }

    [HttpPost]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> CreateUser([FromBody] CreateUserRequest request)
    {
        if (string.IsNullOrWhiteSpace(request?.FullName) ||
            string.IsNullOrWhiteSpace(request?.Email) ||
            string.IsNullOrWhiteSpace(request?.Password))
            return BadRequest(new { message = "Full name, email and password are required" });

        if (!Enum.TryParse<Role>(request.Role ?? "Student", out var role))
            return BadRequest(new { message = "Invalid role" });

        try
        {
            var user = await _userService.Register(request.FullName, request.Email, request.Password, role);
            return Ok(new { user.Id, user.FullName, user.Email, Role = role.ToString() });
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpPut("{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> UpdateUser(int id, [FromBody] UpdateUserRequest request)
    {
        if (string.IsNullOrWhiteSpace(request?.FullName) ||
            string.IsNullOrWhiteSpace(request?.Email))
            return BadRequest(new { message = "Full name and email are required" });

        var result = await _userService.UpdateUser(id, request.FullName, request.Email);
        if (!result) return NotFound(new { message = "User not found" });
        return Ok(new { message = "User updated" });
    }

    [HttpPut("{id}/role")]
    [Authorize(Roles = "Admin,Staff")]
    public async Task<IActionResult> ChangeRole(int id, [FromBody] ChangeRoleRequest request)
    {
        if (!Enum.TryParse<Role>(request.Role, out var role))
            return BadRequest(new { message = "Invalid role" });

        var result = await _userService.ChangeUserRole(id, role);
        if (!result) return NotFound(new { message = "User not found" });
        return Ok(new { message = "Role updated" });
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteUser(int id)
    {
        var result = await _userService.DeleteUser(id);
        if (!result) return NotFound(new { message = "User not found" });
        return Ok(new { message = "User deleted" });
    }
}

public class CreateUserRequest
{
    public string FullName { get; set; }
    public string Email { get; set; }
    public string Password { get; set; }
    public string Role { get; set; }
}

public class ChangeRoleRequest
{
    public string Role { get; set; }
}

public class UpdateUserRequest
{
    public string FullName { get; set; }
    public string Email { get; set; }
}