using FluentAssertions;
  using IUS.ExamSystem.Application.Services;
  using IUS.ExamSystem.Domain.Entities;
  using IUS.ExamSystem.Infrastructure.Data;
  using Microsoft.EntityFrameworkCore;

  namespace IUS.ExamSystem.Tests;

  public class ConflictDetectionServiceTests
  {
      private AppDbContext CreateContext() =>
          new AppDbContext(new DbContextOptionsBuilder<AppDbContext>()
              .UseInMemoryDatabase(Guid.NewGuid().ToString())
              .Options);

      [Fact]
      public async Task HasExamConflict_ExamNotFound_ReturnsFalse()
      {
          var context = CreateContext();
          var service = new ConflictDetectionService(context);

          var result = await service.HasExamConflict(1, 999);

          result.Should().BeFalse();
      }

      [Fact]
      public async Task HasExamConflict_NoOverlap_ReturnsFalse()
      {
          var context = CreateContext();
          var room = new Room { Name = "R1", Capacity = 30 };
          context.Rooms.Add(room);
          await context.SaveChangesAsync();

          var exam1 = new Exam { Subject = "Math", StartTime = DateTime.Today.AddHours(8), EndTime =
  DateTime.Today.AddHours(10), RoomId = room.Id };
          var exam2 = new Exam { Subject = "Physics", StartTime = DateTime.Today.AddHours(11), EndTime =
  DateTime.Today.AddHours(13), RoomId = room.Id };
          context.Exams.AddRange(exam1, exam2);
          await context.SaveChangesAsync();

          context.ExamAssignments.Add(new ExamAssignment { UserId = 1, ExamId = exam1.Id });
          await context.SaveChangesAsync();

          var service = new ConflictDetectionService(context);
          var result = await service.HasExamConflict(1, exam2.Id);

          result.Should().BeFalse();
      }

      [Fact]
      public async Task HasExamConflict_WithOverlap_ReturnsTrue()
      {
          var context = CreateContext();
          var room = new Room { Name = "R1", Capacity = 30 };
          context.Rooms.Add(room);
          await context.SaveChangesAsync();

          var exam1 = new Exam { Subject = "Math", StartTime = DateTime.Today.AddHours(8), EndTime =
  DateTime.Today.AddHours(10), RoomId = room.Id };
          var exam2 = new Exam { Subject = "Physics", StartTime = DateTime.Today.AddHours(9), EndTime =
  DateTime.Today.AddHours(11), RoomId = room.Id };
          context.Exams.AddRange(exam1, exam2);
          await context.SaveChangesAsync();

          context.ExamAssignments.Add(new ExamAssignment { UserId = 1, ExamId = exam1.Id });
          await context.SaveChangesAsync();

          var service = new ConflictDetectionService(context);
          var result = await service.HasExamConflict(1, exam2.Id);

          result.Should().BeTrue();
      }

      [Fact]
      public async Task GetConflictingExams_ReturnsOverlappingExams()
      {
          var context = CreateContext();
          var room = new Room { Name = "R1", Capacity = 30 };
          context.Rooms.Add(room);
          await context.SaveChangesAsync();

          var exam1 = new Exam { Subject = "Math", StartTime = DateTime.Today.AddHours(8), EndTime =
  DateTime.Today.AddHours(10), RoomId = room.Id };
          var exam2 = new Exam { Subject = "Physics", StartTime = DateTime.Today.AddHours(9), EndTime =
  DateTime.Today.AddHours(11), RoomId = room.Id };
          context.Exams.AddRange(exam1, exam2);
          await context.SaveChangesAsync();

          context.ExamAssignments.Add(new ExamAssignment { UserId = 1, ExamId = exam1.Id });
          await context.SaveChangesAsync();

          var service = new ConflictDetectionService(context);
          var result = await service.GetConflictingExams(1, exam2.Id);

          result.Should().HaveCount(1);
          result[0].Subject.Should().Be("Math");
      }

      [Fact]
      public async Task FindStudentsWithConflicts_ReturnsStudentIds()
      {
          var context = CreateContext();
          var room = new Room { Name = "R1", Capacity = 30 };
          context.Rooms.Add(room);
          await context.SaveChangesAsync();

          var exam1 = new Exam { Subject = "Math", StartTime = DateTime.Today.AddHours(8), EndTime =
  DateTime.Today.AddHours(10), RoomId = room.Id };
          var exam2 = new Exam { Subject = "Physics", StartTime = DateTime.Today.AddHours(9), EndTime =
  DateTime.Today.AddHours(11), RoomId = room.Id };
          context.Exams.AddRange(exam1, exam2);
          await context.SaveChangesAsync();

          context.ExamAssignments.Add(new ExamAssignment { UserId = 1, ExamId = exam1.Id });
          await context.SaveChangesAsync();

          var service = new ConflictDetectionService(context);
          var result = await service.FindStudentsWithConflicts(exam2.Id);

          result.Should().Contain(1);
      }
  }