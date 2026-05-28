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

    // ✅ REGISTER
    [HttpPost("register")]
    public async Task<IActionResult> Register(RegisterRequest request)
    {
        try
        {
            var user = await _userService.Register(
                request.FullName,
                request.Email,
                request.Password,
                request.Role
            );

            return Ok(user);
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    // ✅ LOGIN
    [HttpPost("login")]
    public async Task<IActionResult> Login(LoginRequest request)
    {
        var token = await _userService.Login(request.Email, request.Password);
        return Ok(new { token });
    }

    // ✅ AZURE AD LOGIN
    [HttpPost("azure-login")]
    public async Task<IActionResult> AzureLogin([FromBody] AzureLoginRequest request)
    {
        try
        {
            if (string.IsNullOrEmpty(request.Token))
            {
                return BadRequest(new { message = "Token is required" });
            }

            // Decode the JWT token to extract claims
            var handler = new JwtSecurityTokenHandler();
            var token = handler.ReadToken(request.Token) as JwtSecurityToken;

            if (token == null)
            {
                return BadRequest(new { message = "Invalid token format" });
            }

            // Extract claims from Azure AD token
            var emailClaim = token.Claims.FirstOrDefault(c => c.Type == "preferred_username" || c.Type == "email" || c.Type == "upn")?.Value;
            var nameClaim = token.Claims.FirstOrDefault(c => c.Type == "name" || c.Type == "given_name")?.Value;
            var oidClaim = token.Claims.FirstOrDefault(c => c.Type == "oid")?.Value;

            if (string.IsNullOrEmpty(emailClaim) || string.IsNullOrEmpty(oidClaim))
            {
                return BadRequest(new { message = "Token does not contain required claims" });
            }

            var jwtToken = await _userService.AzureLogin(
                emailClaim,
                nameClaim ?? emailClaim,
                oidClaim
            );

            return Ok(new { token = jwtToken });
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }
}

public class AzureLoginRequest
{
    public string Token { get; set; }
}