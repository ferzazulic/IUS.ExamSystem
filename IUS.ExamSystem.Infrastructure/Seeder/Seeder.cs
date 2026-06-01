using IUS.ExamSystem.Domain.Entities;
using IUS.ExamSystem.Domain.Enums;
using IUS.ExamSystem.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
using System.Security.Cryptography;
using System.Text;

namespace IUS.ExamSystem.Infrastructure.Seeder;

public static class DbSeeder
{
    public static async Task SeedAsync(AppDbContext context)
    {
        var admin = await EnsureUserAsync(
            context,
            "System Administrator",
            "admin@ius.edu.ba",
            "Admin123!",
            Role.Admin);

        var staff = await EnsureUserAsync(
            context,
            "Exam Office Staff",
            "staff@ius.edu.ba",
            "Staff123!",
            Role.Staff);

        var students = new[]
        {
            await EnsureUserAsync(context, "Amina Hadzic", "amina.hadzic@stu.ius.edu.ba", "Student123!", Role.Student),
            await EnsureUserAsync(context, "Tarik Kovacevic", "tarik.kovacevic@stu.ius.edu.ba", "Student123!", Role.Student),
            await EnsureUserAsync(context, "Lejla Basic", "lejla.basic@stu.ius.edu.ba", "Student123!", Role.Student)
        };

        await context.SaveChangesAsync();

        var amphitheater = await EnsureRoomAsync(context, "Amphitheater A", 30);
        var lab = await EnsureRoomAsync(context, "Computer Lab 2", 20);

        var programming = await EnsureCourseAsync(
            context,
            "CS101",
            "Introduction to Programming",
            "Required",
            "Dr. Emir Music");

        var databases = await EnsureCourseAsync(
            context,
            "CS305",
            "Database Systems",
            "Required",
            "Dr. Selma Karic");

        await context.SaveChangesAsync();

        foreach (var student in students)
        {
            await EnsureEnrollmentAsync(context, student.Id, programming.Id);
        }

        await EnsureEnrollmentAsync(context, students[0].Id, databases.Id);
        await EnsureEnrollmentAsync(context, students[1].Id, databases.Id);

        var firstExamStart = DateTime.UtcNow.Date.AddDays(7).AddHours(9);
        var secondExamStart = DateTime.UtcNow.Date.AddDays(10).AddHours(13);

        var programmingExam = await EnsureExamAsync(
            context,
            "CS101 Midterm Exam",
            firstExamStart,
            firstExamStart.AddHours(2),
            amphitheater.Id);

        var databaseExam = await EnsureExamAsync(
            context,
            "CS305 Final Exam",
            secondExamStart,
            secondExamStart.AddHours(2),
            lab.Id);

        await context.SaveChangesAsync();

        await EnsureAssignmentAsync(context, programmingExam.Id, students[0].Id, amphitheater.Seats.OrderBy(s => s.Number).ElementAtOrDefault(0)?.Id);
        await EnsureAssignmentAsync(context, programmingExam.Id, students[1].Id, amphitheater.Seats.OrderBy(s => s.Number).ElementAtOrDefault(1)?.Id);
        await EnsureAssignmentAsync(context, programmingExam.Id, students[2].Id, amphitheater.Seats.OrderBy(s => s.Number).ElementAtOrDefault(2)?.Id);
        await EnsureAssignmentAsync(context, databaseExam.Id, students[0].Id, lab.Seats.OrderBy(s => s.Number).ElementAtOrDefault(0)?.Id);
        await EnsureAssignmentAsync(context, databaseExam.Id, students[1].Id, lab.Seats.OrderBy(s => s.Number).ElementAtOrDefault(1)?.Id);

        await EnsureNotificationAsync(
            context,
            "Exam Schedule Published",
            "The first exam schedule is available in the student dashboard.",
            "exam",
            true,
            staff.Id);

        await EnsureNotificationAsync(
            context,
            "Bring Student ID",
            "Students must bring their ID cards to all scheduled exams.",
            "info",
            false,
            admin.Id);

        await context.SaveChangesAsync();
    }

    private static async Task<User> EnsureUserAsync(
        AppDbContext context,
        string fullName,
        string email,
        string password,
        Role role)
    {
        var user = await context.Users.FirstOrDefaultAsync(u => u.Email == email);

        if (user is not null)
        {
            user.FullName = fullName;
            user.PasswordHash = HashPassword(password);
            user.Role = role;
            return user;
        }

        user = new User
        {
            FullName = fullName,
            Email = email,
            PasswordHash = HashPassword(password),
            Role = role
        };

        context.Users.Add(user);
        return user;
    }

    private static async Task<Room> EnsureRoomAsync(AppDbContext context, string name, int capacity)
    {
        var room = await context.Rooms
            .Include(r => r.Seats)
            .FirstOrDefaultAsync(r => r.Name == name);

        if (room is null)
        {
            room = new Room
            {
                Name = name,
                Capacity = capacity,
                Seats = Enumerable.Range(1, capacity)
                    .Select(number => new Seat { Number = number })
                    .ToList()
            };

            context.Rooms.Add(room);
            return room;
        }

        room.Capacity = Math.Max(room.Capacity, capacity);

        var existingSeatNumbers = room.Seats.Select(s => s.Number).ToHashSet();
        foreach (var seatNumber in Enumerable.Range(1, capacity).Where(number => !existingSeatNumbers.Contains(number)))
        {
            room.Seats.Add(new Seat { Number = seatNumber, RoomId = room.Id });
        }

        return room;
    }

    private static async Task<Course> EnsureCourseAsync(
        AppDbContext context,
        string code,
        string name,
        string type,
        string professor)
    {
        var course = await context.Courses.FirstOrDefaultAsync(c => c.Code == code);

        if (course is not null)
        {
            return course;
        }

        course = new Course
        {
            Code = code,
            Name = name,
            Type = type,
            Professor = professor
        };

        context.Courses.Add(course);
        return course;
    }

    private static async Task EnsureEnrollmentAsync(AppDbContext context, int studentId, int courseId)
    {
        if (await context.CourseEnrollments.AnyAsync(e => e.StudentId == studentId && e.CourseId == courseId))
        {
            return;
        }

        context.CourseEnrollments.Add(new CourseEnrollment
        {
            StudentId = studentId,
            CourseId = courseId
        });
    }

    private static async Task<Exam> EnsureExamAsync(
        AppDbContext context,
        string subject,
        DateTime startTime,
        DateTime endTime,
        int roomId)
    {
        var exam = await context.Exams.FirstOrDefaultAsync(e => e.Subject == subject);

        if (exam is not null)
        {
            return exam;
        }

        exam = new Exam
        {
            Subject = subject,
            StartTime = startTime,
            EndTime = endTime,
            RoomId = roomId
        };

        context.Exams.Add(exam);
        return exam;
    }

    private static async Task EnsureAssignmentAsync(AppDbContext context, int examId, int studentId, int? seatId)
    {
        if (await context.ExamAssignments.AnyAsync(a => a.ExamId == examId && a.UserId == studentId))
        {
            return;
        }

        context.ExamAssignments.Add(new ExamAssignment
        {
            ExamId = examId,
            UserId = studentId,
            SeatId = seatId
        });
    }

    private static async Task EnsureNotificationAsync(
        AppDbContext context,
        string title,
        string body,
        string type,
        bool isImportant,
        int createdById)
    {
        if (await context.Notifications.AnyAsync(n => n.Title == title))
        {
            return;
        }

        context.Notifications.Add(new Notification
        {
            Title = title,
            Body = body,
            Type = type,
            IsImportant = isImportant,
            CreatedById = createdById
        });
    }

    private static string HashPassword(string password)
    {
        using var sha256 = SHA256.Create();
        var bytes = sha256.ComputeHash(Encoding.UTF8.GetBytes(password));
        return Convert.ToBase64String(bytes);
    }
}
