  using FluentAssertions;
  using IUS.ExamSystem.Application.Services;
  using IUS.ExamSystem.Domain.Entities;
  using IUS.ExamSystem.Infrastructure.Data;
  using Microsoft.EntityFrameworkCore;

  namespace IUS.ExamSystem.Tests;

  public class RoomServiceTests
  {
      private AppDbContext CreateContext() =>
          new AppDbContext(new DbContextOptionsBuilder<AppDbContext>()
              .UseInMemoryDatabase(Guid.NewGuid().ToString())
              .Options);

      [Fact]
      public async Task CreateRoom_GeneratesCorrectNumberOfSeats()
      {
          var context = CreateContext();
          var service = new RoomService(context);

          var room = await service.CreateRoom(new Room { Name = "Lab A", Capacity = 5 });

          room.Seats.Should().HaveCount(5);
          room.Seats.Select(s => s.Number).Should().BeEquivalentTo(new[] { 1, 2, 3, 4, 5 });
      }

      [Fact]
      public async Task UpdateRoom_CapacityIncrease_AddsSeats()
      {
          var context = CreateContext();
          var service = new RoomService(context);
          var room = await service.CreateRoom(new Room { Name = "Lab B", Capacity = 3 });

          var updated = await service.UpdateRoom(room.Id, new Room { Name = "Lab B", Capacity = 5 });

          updated.Seats.Should().HaveCount(5);
      }

      [Fact]
      public async Task UpdateRoom_CapacityDecrease_RemovesSeats()
      {
          var context = CreateContext();
          var service = new RoomService(context);
          var room = await service.CreateRoom(new Room { Name = "Lab C", Capacity = 5 });

          var updated = await service.UpdateRoom(room.Id, new Room { Name = "Lab C", Capacity = 2 });

          updated.Seats.Should().HaveCount(2);
      }

      [Fact]
      public async Task DeleteRoom_HasExams_ThrowsInvalidOperationException()
      {
          var context = CreateContext();
          var service = new RoomService(context);
          var room = await service.CreateRoom(new Room { Name = "Lab D", Capacity = 30 });

          context.Exams.Add(new Exam
          {
              Subject = "Math",
              StartTime = DateTime.Today.AddHours(8),
              EndTime = DateTime.Today.AddHours(10),
              RoomId = room.Id
          });
          await context.SaveChangesAsync();

          await service.Invoking(s => s.DeleteRoom(room.Id))
              .Should().ThrowAsync<InvalidOperationException>()
              .WithMessage("*Cannot delete room*");
      }
  }
