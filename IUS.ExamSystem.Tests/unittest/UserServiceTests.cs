
  using FluentAssertions;
  using IUS.ExamSystem.Application.Services;
  using IUS.ExamSystem.Domain.Enums;
  using IUS.ExamSystem.Infrastructure.Auth;
  using IUS.ExamSystem.Infrastructure.Data;
  using Microsoft.EntityFrameworkCore;
  using Microsoft.Extensions.Configuration;

  namespace IUS.ExamSystem.Tests;

  public class UserServiceTests
  {
      private AppDbContext CreateContext() =>
          new AppDbContext(new DbContextOptionsBuilder<AppDbContext>()
              .UseInMemoryDatabase(Guid.NewGuid().ToString())
              .Options);

      private JwtService CreateJwtService()
      {
          var config = new ConfigurationBuilder()
              .AddInMemoryCollection(new Dictionary<string, string?>
              {
                  { "Jwt:Key", "super-secret-key-for-testing-only-32chars!!" },
                  { "Jwt:Issuer", "TestIssuer" },
                  { "Jwt:Audience", "TestAudience" },
                  { "Jwt:DurationInMinutes", "60" }
              })
              .Build();
          return new JwtService(config);
      }

      [Fact]
      public async Task Login_InvalidEmail_ThrowsException()
      {
          var context = CreateContext();
          var service = new UserService(context, CreateJwtService());

          await service.Invoking(s => s.Login("nobody@test.com", "password"))
              .Should().ThrowAsync<Exception>()
              .WithMessage("Invalid credentials");
      }

      [Fact]
      public async Task Login_InvalidPassword_ThrowsException()
      {
          var context = CreateContext();
          var service = new UserService(context, CreateJwtService());
          await service.Register("Test User", "test@test.com", "correctpassword", Role.Student);

          await service.Invoking(s => s.Login("test@test.com", "wrongpassword"))
              .Should().ThrowAsync<Exception>()
              .WithMessage("Invalid credentials");
      }

      [Fact]
      public async Task Login_ValidCredentials_ReturnsToken()
      {
          var context = CreateContext();
          var service = new UserService(context, CreateJwtService());
          await service.Register("Test User", "test@test.com", "password123", Role.Student);

          var token = await service.Login("test@test.com", "password123");

          token.Should().NotBeNullOrEmpty();
      }

      [Fact]
      public async Task Register_ValidData_CreatesUserWithHashedPassword()
      {
          var context = CreateContext();
          var service = new UserService(context, CreateJwtService());

          var user = await service.Register("John Doe", "john@test.com", "password123", Role.Student);

          user.Id.Should().BeGreaterThan(0);
          user.Email.Should().Be("john@test.com");
          user.PasswordHash.Should().NotBe("password123");
      }

      [Fact]
      public async Task DeleteUser_NotFound_ReturnsFalse()
      {
          var context = CreateContext();
          var service = new UserService(context, CreateJwtService());

          var result = await service.DeleteUser(999);

          result.Should().BeFalse();
      }

      [Fact]
      public async Task ChangeUserRole_ValidId_UpdatesRole()
      {
          var context = CreateContext();
          var service = new UserService(context, CreateJwtService());
          var user = await service.Register("Jane Doe", "jane@test.com", "pass", Role.Student);

          var result = await service.ChangeUserRole(user.Id, Role.Staff);

          result.Should().BeTrue();
          var updated = await context.Users.FindAsync(user.Id);
          updated!.Role.Should().Be(Role.Staff);
      }
  }