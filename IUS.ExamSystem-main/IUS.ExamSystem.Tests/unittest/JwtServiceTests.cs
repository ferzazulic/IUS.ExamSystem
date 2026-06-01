using FluentAssertions;
  using IUS.ExamSystem.Domain.Entities;
  using IUS.ExamSystem.Domain.Enums;
  using IUS.ExamSystem.Infrastructure.Auth;
  using Microsoft.Extensions.Configuration;
  using System.IdentityModel.Tokens.Jwt;

  namespace IUS.ExamSystem.Tests;

  public class JwtServiceTests
  {
      private JwtService CreateService()
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
      public void GenerateToken_ContainsCorrectClaims()
      {
          var service = CreateService();
          var user = new User { Id = 42, FullName = "Alice", Email = "alice@test.com", Role = Role.Admin
  };

          var token = service.GenerateToken(user);

          token.Should().NotBeNullOrEmpty();

          var jwt = new JwtSecurityTokenHandler().ReadJwtToken(token);
          jwt.Claims.Should().Contain(c => c.Value == "42");
          jwt.Claims.Should().Contain(c => c.Value == "alice@test.com");
          jwt.Claims.Should().Contain(c => c.Value == "Admin");
      }
  }