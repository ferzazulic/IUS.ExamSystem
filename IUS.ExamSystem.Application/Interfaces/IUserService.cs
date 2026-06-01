using IUS.ExamSystem.Domain.Entities;
using IUS.ExamSystem.Domain.Enums;

namespace IUS.ExamSystem.Application.Interfaces;

/// <summary>
/// User management operations such as registration and role changes.
/// </summary>
public interface IUserService
{
    Task<User> Register(string fullName, string email, string password, Role role);

    Task<string> Login(string email, string password);

    Task<List<User>> GetAllUsers();

    Task<bool> DeleteUser(int id);

    Task<bool> ChangeUserRole(int id, Role newRole);

    Task<bool> UpdateUser(int id, string fullName, string email);
}