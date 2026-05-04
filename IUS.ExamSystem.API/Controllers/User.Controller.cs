using IUS.ExamSystem.Application.Interfaces;
  using IUS.ExamSystem.Domain.Enums;
  using Microsoft.AspNetCore.Authorization;
  using Microsoft.AspNetCore.Mvc;

  namespace IUS.ExamSystem.API.Controllers;

  [ApiController]
  [Route("api/[controller]")]
  [Authorize(Roles = "Admin,Staff")]
  public class UserController : ControllerBase
  {
      private readonly IUserService _userService;

      public UserController(IUserService userService)
      {
          _userService = userService;
      }

      [HttpGet]
      public async Task<IActionResult> GetAllUsers()
      {
          var users = await _userService.GetAllUsers();
          return Ok(users.Select(u => new
          {
              u.Id,
              u.FullName,
              u.Email,
              Role = u.Role.ToString()
          }));
      }

      [HttpDelete("{id}")]
      public async Task<IActionResult> DeleteUser(int id)
      {
          var result = await _userService.DeleteUser(id);
          if (!result) return NotFound(new { message = "User not found" });
          return Ok(new { message = "User deleted" });
      }

      [HttpPut("{id}/role")]
      public async Task<IActionResult> ChangeRole(int id, [FromBody] ChangeRoleRequest request)
      {
          if (!Enum.TryParse<Role>(request.Role, out var role))
              return BadRequest(new { message = "Invalid role" });

          var result = await _userService.ChangeUserRole(id, role);
          if (!result) return NotFound(new { message = "User not found" });
          return Ok(new { message = "Role updated" });
      }
  }

  public class ChangeRoleRequest
  {
      public string Role { get; set; }
  }