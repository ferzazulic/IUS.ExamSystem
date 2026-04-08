public interface IUserService
{
    Task<User> Register(string fullName, string email, string password, Role role);
    Task<string> Login(string email, string password);
    Task<List<User>> GetAllUsers();
}