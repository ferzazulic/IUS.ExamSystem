using FluentAssertions;
  using IUS.ExamSystem.Application.Services;
  using IUS.ExamSystem.Domain.Entities;
  using IUS.ExamSystem.Infrastructure.Data;
  using Microsoft.EntityFrameworkCore;

  namespace IUS.ExamSystem.Tests;

  public class ExamServiceTests
  {
      private AppDbContext CreateContext() =>
          new AppDbContext(new DbContextOptionsBuilder<AppDbContext>()
              .UseInMemoryDatabase(Guid.NewGuid().ToString())
              .Options);

      private (ExamService service, AppDbContext context) CreateService()
      {
          var context = CreateContext();
          var conflictService = new ConflictDetectionService(context);
          var service = new ExamService(context, conflictService);
          return (service, context);
      }

      [Fact]
      public async Task CreateExam_RoomConflict_ThrowsInvalidOperationException()
      {
          var (service, context) = CreateService();
          var room = new Room { Name = "R1", Capacity = 30 };
          context.Rooms.Add(room);
          await context.SaveChangesAsync();

          var existing = new Exam { Subject = "Math", StartTime = DateTime.Today.AddHours(8), EndTime =
  DateTime.Today.AddHours(10), RoomId = room.Id };
          context.Exams.Add(existing);
          await context.SaveChangesAsync();

          var overlapping = new Exam { Subject = "Physics", StartTime = DateTime.Today.AddHours(9),
  EndTime = DateTime.Today.AddHours(11), RoomId = room.Id };

          await service.Invoking(s => s.CreateExam(overlapping))
              .Should().ThrowAsync<InvalidOperationException>()
              .WithMessage("*Room is already occupied*");
      }

      [Fact]
      public async Task CreateExam_ValidData_ReturnsCreatedExam()
      {
          var (service, context) = CreateService();
          var room = new Room { Name = "R1", Capacity = 30 };
          context.Rooms.Add(room);
          await context.SaveChangesAsync();

          var exam = new Exam { Subject = "Chemistry", StartTime = DateTime.Today.AddHours(8), EndTime =
  DateTime.Today.AddHours(10), RoomId = room.Id };

          var result = await service.CreateExam(exam);

          result.Id.Should().BeGreaterThan(0);
          result.Subject.Should().Be("Chemistry");
      }

      [Fact]
      public async Task EnrollStudent_AlreadyEnrolled_ThrowsInvalidOperationException()
      {
          var (service, context) = CreateService();
          var room = new Room { Name = "R1", Capacity = 30 };
          context.Rooms.Add(room);
          await context.SaveChangesAsync();

          var exam = new Exam { Subject = "Math", StartTime = DateTime.Today.AddHours(8), EndTime =
  DateTime.Today.AddHours(10), RoomId = room.Id };
          context.Exams.Add(exam);
          await context.SaveChangesAsync();

          context.ExamAssignments.Add(new ExamAssignment { UserId = 1, ExamId = exam.Id });
          await context.SaveChangesAsync();

          await service.Invoking(s => s.EnrollStudent(exam.Id, 1))
              .Should().ThrowAsync<InvalidOperationException>()
              .WithMessage("*Already enrolled*");
      }

      [Fact]
      public async Task EnrollStudent_TimeConflict_ThrowsInvalidOperationException()
      {
          var (service, context) = CreateService();
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

          await service.Invoking(s => s.EnrollStudent(exam2.Id, 1))
              .Should().ThrowAsync<InvalidOperationException>()
              .WithMessage("*already have an exam*");
      }

      [Fact]
      public async Task EnrollStudent_SeatTaken_ThrowsInvalidOperationException()
      {
          var (service, context) = CreateService();
          var room = new Room { Name = "R1", Capacity = 30 };
          context.Rooms.Add(room);
          await context.SaveChangesAsync();

          var seat = new Seat { Number = 1, RoomId = room.Id };
          context.Seats.Add(seat);
          await context.SaveChangesAsync();

          var exam = new Exam { Subject = "Math", StartTime = DateTime.Today.AddHours(8), EndTime =
  DateTime.Today.AddHours(10), RoomId = room.Id };
          context.Exams.Add(exam);
          await context.SaveChangesAsync();

          context.ExamAssignments.Add(new ExamAssignment { UserId = 2, ExamId = exam.Id, SeatId = seat.Id
  });
          await context.SaveChangesAsync();

          await service.Invoking(s => s.EnrollStudent(exam.Id, 1, seat.Id))
              .Should().ThrowAsync<InvalidOperationException>()
              .WithMessage("*seat is already taken*");
      }

      [Fact]
      public async Task EnrollStudent_ValidData_CreatesAssignment()
      {
          var (service, context) = CreateService();
          var room = new Room { Name = "R1", Capacity = 30 };
          context.Rooms.Add(room);
          await context.SaveChangesAsync();

          var exam = new Exam { Subject = "Math", StartTime = DateTime.Today.AddHours(8), EndTime =
  DateTime.Today.AddHours(10), RoomId = room.Id };
          context.Exams.Add(exam);
          await context.SaveChangesAsync();

          await service.EnrollStudent(exam.Id, 1);

          var assignment = await context.ExamAssignments.FirstOrDefaultAsync(a => a.ExamId == exam.Id &&
  a.UserId == 1);
          assignment.Should().NotBeNull();
      }

      [Fact]
      public async Task AllocateSeats_ExamNotFound_ThrowsArgumentException()
      {
          var (service, _) = CreateService();

          await service.Invoking(s => s.AllocateSeats(999))
              .Should().ThrowAsync<ArgumentException>()
              .WithMessage("*not found*");
      }

      [Fact]
      public async Task AllocateSeats_NoSeatsInRoom_ThrowsInvalidOperationException()
      {
          var (service, context) = CreateService();
          var room = new Room { Name = "R1", Capacity = 0 };
          context.Rooms.Add(room);
          await context.SaveChangesAsync();

          var exam = new Exam { Subject = "Math", StartTime = DateTime.Today.AddHours(8), EndTime =
  DateTime.Today.AddHours(10), RoomId = room.Id };
          context.Exams.Add(exam);
          await context.SaveChangesAsync();

          await service.Invoking(s => s.AllocateSeats(exam.Id))
              .Should().ThrowAsync<InvalidOperationException>()
              .WithMessage("*No available seats*");
      }

      [Fact]
      public async Task DeleteExam_NotFound_ReturnsFalse()
      {
          var (service, _) = CreateService();

          var result = await service.DeleteExam(999);

          result.Should().BeFalse();
      }

      [Fact]
      public async Task DeleteExam_ValidId_ReturnsTrueAndRemovesExam()
      {
          var (service, context) = CreateService();
          var room = new Room { Name = "R1", Capacity = 30 };
          context.Rooms.Add(room);
          await context.SaveChangesAsync();

          var exam = new Exam { Subject = "Math", StartTime = DateTime.Today.AddHours(8), EndTime =
  DateTime.Today.AddHours(10), RoomId = room.Id };
          context.Exams.Add(exam);
          await context.SaveChangesAsync();

          var result = await service.DeleteExam(exam.Id);

          result.Should().BeTrue();
          context.Exams.Should().BeEmpty();
      }

      [Fact]
      public async Task AssignSeat_SeatAlreadyTaken_ThrowsInvalidOperationException()
      {
          var (service, context) = CreateService();
          var room = new Room { Name = "R1", Capacity = 30 };
          context.Rooms.Add(room);
          await context.SaveChangesAsync();

          var seat = new Seat { Number = 1, RoomId = room.Id };
          context.Seats.Add(seat);
          await context.SaveChangesAsync();

          var exam = new Exam { Subject = "Math", StartTime = DateTime.Today.AddHours(8), EndTime =
  DateTime.Today.AddHours(10), RoomId = room.Id };
          context.Exams.Add(exam);
          await context.SaveChangesAsync();

          context.ExamAssignments.Add(new ExamAssignment { UserId = 2, ExamId = exam.Id, SeatId = seat.Id
  });
          await context.SaveChangesAsync();

          await service.Invoking(s => s.AssignSeat(exam.Id, 1, seat.Id))
              .Should().ThrowAsync<InvalidOperationException>()
              .WithMessage("*already taken*");
      }

      [Fact]
      public async Task GetAvailableSeats_ReturnsOnlyUnassignedSeats()
      {
          var (service, context) = CreateService();
          var room = new Room { Name = "R1", Capacity = 3 };
          context.Rooms.Add(room);
          await context.SaveChangesAsync();

          var seat1 = new Seat { Number = 1, RoomId = room.Id };
          var seat2 = new Seat { Number = 2, RoomId = room.Id };
          var seat3 = new Seat { Number = 3, RoomId = room.Id };
          context.Seats.AddRange(seat1, seat2, seat3);
          await context.SaveChangesAsync();

          var exam = new Exam { Subject = "Math", StartTime = DateTime.Today.AddHours(8), EndTime =
  DateTime.Today.AddHours(10), RoomId = room.Id };
          context.Exams.Add(exam);
          await context.SaveChangesAsync();

          context.ExamAssignments.Add(new ExamAssignment { UserId = 1, ExamId = exam.Id, SeatId = seat1.Id
   });
          await context.SaveChangesAsync();

          var result = await service.GetAvailableSeats(exam.Id);

          result.Should().HaveCount(2);
          result.Should().NotContain(s => s.Id == seat1.Id);
      }
  }