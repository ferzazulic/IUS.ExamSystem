using Microsoft.EntityFrameworkCore;
using System.Security.Cryptography;
using System.Text;

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
        var user = await _context.Users
            .FirstOrDefaultAsync(u => u.Email == email);

        if (user == null || user.PasswordHash != HashPassword(password))
            throw new Exception("Invalid credentials");

        return _jwtService.GenerateToken(user);
    }

    public async Task<List<User>> GetAllUsers()
    {
        return await _context.Users.ToListAsync();
    }

    private string HashPassword(string password)
    {
        using var sha256 = SHA256.Create();
        var bytes = sha256.ComputeHash(Encoding.UTF8.GetBytes(password));
        return Convert.ToBase64String(bytes);
    }
}