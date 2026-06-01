using IUS.ExamSystem.Application.DTOs;
using IUS.ExamSystem.Application.Interfaces;
using IUS.ExamSystem.Domain.Enums;
using Microsoft.AspNetCore.Mvc;

namespace IUS.ExamSystem.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly IUserService _userService;

    public AuthController(IUserService userService)
    {
        _userService = userService;
    }

    // ✅ LOGIN
    [HttpPost("login")]
    public async Task<IActionResult> Login(LoginRequest request)
    {
        try
        {
            var token = await _userService.Login(request.Email, request.Password);
            return Ok(new { token });
        }
        catch
        {
            return Unauthorized(new { error = "Invalid email or password" });
        }
    }
}