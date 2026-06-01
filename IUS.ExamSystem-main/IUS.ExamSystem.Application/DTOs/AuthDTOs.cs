using IUS.ExamSystem.Domain.Enums;

namespace IUS.ExamSystem.Application.DTOs;

public class RegisterRequest
{
    public string FullName { get; set; }
    public string Email { get; set; }
    public string Password { get; set; }
    public Role Role { get; set; }
}

public class LoginRequest
{
    public string Email { get; set; }
    public string Password { get; set; }
}