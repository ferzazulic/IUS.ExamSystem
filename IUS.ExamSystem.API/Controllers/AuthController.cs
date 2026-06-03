using IUS.ExamSystem.Application.DTOs;
using IUS.ExamSystem.Application.Interfaces;
using IUS.ExamSystem.Domain.Enums;
using Microsoft.AspNetCore.Mvc;
using System.IdentityModel.Tokens.Jwt;

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

    [HttpPost("azure-login")]
    public async Task<IActionResult> AzureLogin([FromBody] AzureLoginRequest request)
    {
        try
        {
            if (string.IsNullOrWhiteSpace(request.Token))
            {
                return BadRequest(new { message = "Token is required" });
            }

            var handler = new JwtSecurityTokenHandler();
            if (handler.ReadToken(request.Token) is not JwtSecurityToken token)
            {
                return BadRequest(new { message = "Invalid token format" });
            }

            var email = token.Claims
                .FirstOrDefault(c => c.Type is "preferred_username" or "email" or "upn")
                ?.Value;
            var fullName = token.Claims
                .FirstOrDefault(c => c.Type is "name" or "given_name")
                ?.Value;
            var azureId = token.Claims.FirstOrDefault(c => c.Type == "oid")?.Value;

            if (string.IsNullOrWhiteSpace(email) || string.IsNullOrWhiteSpace(azureId))
            {
                return BadRequest(new { message = "Token does not contain required claims" });
            }

            var appToken = await _userService.AzureLogin(email, fullName ?? email, azureId);
            return Ok(new { token = appToken });
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }
}

public class AzureLoginRequest
{
    public string Token { get; set; } = "";
}
