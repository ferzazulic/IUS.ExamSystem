using IUS.ExamSystem.Application.Interfaces;
using IUS.ExamSystem.Domain.Entities;
using IUS.ExamSystem.Domain.Enums;
using IUS.ExamSystem.Infrastructure.Auth;
using IUS.ExamSystem.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
using System.Security.Cryptography;
using System.Text;

namespace IUS.ExamSystem.Application.Services;

public class UserService : IUserService
{
    private readonly AppDbContext _context;
    private readonly JwtService _jwtService;

    public UserService(AppDbContext context, JwtService jwtService)
    {
        _context = context;
        _jwtService = jwtService;
    }

    public async Task<User> Register(string fullName, string email, string password, Role role)
    {
        var user = new User
        {
            FullName = fullName,
            Email = email,
            PasswordHash = HashPassword(password),
            Role = role
        };

        _context.Users.Add(user);
        await _context.SaveChangesAsync();

        return user;
    }

    public async Task<string> Login(string email, string password)
    {
        Console.WriteLine($"LOGIN ATTEMPT: {email}");

        var user = await _context.Users
            .FirstOrDefaultAsync(u => u.Email == email);

        if (user == null)
        {
            Console.WriteLine("USER NOT FOUND");
            throw new Exception("Invalid credentials");
        }

        Console.WriteLine($"FOUND USER: {user.Email}");
        Console.WriteLine($"STORED HASH: {user.PasswordHash}");
        Console.WriteLine($"ENTERED HASH: {HashPassword(password)}");

        if (user.PasswordHash != HashPassword(password))
        {
            Console.WriteLine("PASSWORD DOES NOT MATCH");
            throw new Exception("Invalid credentials");
        }

        return _jwtService.GenerateToken(user);
    }

    public async Task<List<User>> GetAllUsers()
    {
        return await _context.Users.ToListAsync();
    }
public async Task<bool> DeleteUser(int id)
  {
      var user = await _context.Users.FindAsync(id);
      if (user == null) return false;
      _context.Users.Remove(user);
      await _context.SaveChangesAsync();
      return true;
  }

  public async Task<bool> ChangeUserRole(int id, Role newRole)
  {
      var user = await _context.Users.FindAsync(id);
      if (user == null) return false;
      user.Role = newRole;
      await _context.SaveChangesAsync();
      return true;
  }

public async Task<bool> UpdateUser(int id, string fullName, string email)
{
    var user = await _context.Users.FindAsync(id);
    if (user == null) return false;

    user.FullName = fullName;
    user.Email = email;
    await _context.SaveChangesAsync();
    return true;
}
    private string HashPassword(string password)
    {
        using var sha256 = SHA256.Create();
        var bytes = sha256.ComputeHash(Encoding.UTF8.GetBytes(password));
        return Convert.ToBase64String(bytes);
    }
}