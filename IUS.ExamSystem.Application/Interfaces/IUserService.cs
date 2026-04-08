using IUS.ExamSystem.Domain.Entities;
using IUS.ExamSystem.Domain.Enums;

namespace IUS.ExamSystem.Application.Interfaces;

public interface IUserService
{
    Task<User> Register(string fullName, string email, string password, Role role);
    Task<string> Login(string email, string password);
    Task<List<User>> GetAllUsers();
}