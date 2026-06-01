using IUS.ExamSystem.Application.DTOs;
using IUS.ExamSystem.Application.Interfaces;
using IUS.ExamSystem.Domain.Entities;
using IUS.ExamSystem.Domain.Enums;
using IUS.ExamSystem.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace IUS.ExamSystem.Application.Services;

public class ReportService : IReportService
{
    private readonly AppDbContext _context;

    public ReportService(AppDbContext context)
    {
        _context = context;
    }

    public async Task<ExamReportDto> GetExamReport(int examId)
    {
        var exam = await _context.Exams
            .Include(e => e.Room)
            .Include(e => e.Assignments)
                .ThenInclude(a => a.Student)
            .Include(e => e.Assignments)
                .ThenInclude(a => a.Seat)
            .FirstOrDefaultAsync(e => e.Id == examId);

        if (exam == null)
            throw new ArgumentException($"Exam with ID {examId} not found");

        var completedAssignments = exam.Assignments.Where(a => a.CompletedAt.HasValue).ToList();
        var averageScore = completedAssignments.Any()
            ? completedAssignments.Average(a => a.Score ?? 0)
            : 0;

        var studentResults = exam.Assignments.Select(a => new StudentExamResultDto
        {
            AssignmentId = a.Id,
            StudentId = a.UserId,
            StudentName = a.Student.FullName,
            StudentEmail = a.Student.Email,
            SeatNumber = a.Seat?.Number ?? 0,
            RoomName = exam.Room.Name,
            Score = a.Score,
            Grade = a.Grade,
            CompletedAt = a.CompletedAt,
            IsCompleted = a.CompletedAt.HasValue
        }).ToList();

        return new ExamReportDto
        {
            ExamId = exam.Id,
            Subject = exam.Subject,
            StartTime = exam.StartTime,
            EndTime = exam.EndTime,
            RoomName = exam.Room.Name,
            TotalAssignments = exam.Assignments.Count,
            CompletedAssignments = completedAssignments.Count,
            AverageScore = (decimal)averageScore,
            StudentResults = studentResults
        };
    }

    public async Task<StudentReportDto> GetStudentReport(int studentId)
    {
        var student = await _context.Users
            .FirstOrDefaultAsync(u => u.Id == studentId);

        if (student == null)
            throw new ArgumentException($"Student with ID {studentId} not found");

        var assignments = await _context.ExamAssignments
            .Include(a => a.Exam)
            .Include(a => a.Seat)
            .Where(a => a.UserId == studentId && a.CompletedAt.HasValue)
            .ToListAsync();

        var examScores = assignments.Select(a => new ExamScoreDto
        {
            ExamId = a.ExamId,
            Subject = a.Exam.Subject,
            ExamDate = a.Exam.StartTime,
            Score = a.Score,
            Grade = a.Grade,
            SeatNumber = a.Seat?.Number ?? 0
        }).ToList();

        var averageGrade = examScores.Any(es => es.Grade.HasValue)
            ? examScores.Where(es => es.Grade.HasValue).Average(es => es.Grade.Value)
            : 0;

        return new StudentReportDto
        {
            StudentId = student.Id,
            FullName = student.FullName,
            Email = student.Email,
            ExamScores = examScores,
            AverageGrade = (decimal)averageGrade,
            TotalExamsTaken = assignments.Count
        };
    }

    public async Task<List<ExamReportDto>> GetAllExamReports()
    {
        var exams = await _context.Exams
            .Include(e => e.Room)
            .Include(e => e.Assignments)
                .ThenInclude(a => a.Student)
            .Include(e => e.Assignments)
                .ThenInclude(a => a.Seat)
            .ToListAsync();

        var reports = new List<ExamReportDto>();
        foreach (var exam in exams)
        {
            var completedAssignments = exam.Assignments.Where(a => a.CompletedAt.HasValue).ToList();
            var averageScore = completedAssignments.Any()
                ? completedAssignments.Average(a => a.Score ?? 0)
                : 0;

            var studentResults = exam.Assignments.Select(a => new StudentExamResultDto
            {
                AssignmentId = a.Id,
                StudentId = a.UserId,
                StudentName = a.Student.FullName,
                StudentEmail = a.Student.Email,
                SeatNumber = a.Seat?.Number ?? 0,
                RoomName = exam.Room.Name,
                Score = a.Score,
                Grade = a.Grade,
                CompletedAt = a.CompletedAt,
                IsCompleted = a.CompletedAt.HasValue
            }).ToList();

            reports.Add(new ExamReportDto
            {
                ExamId = exam.Id,
                Subject = exam.Subject,
                StartTime = exam.StartTime,
                EndTime = exam.EndTime,
                RoomName = exam.Room.Name,
                TotalAssignments = exam.Assignments.Count,
                CompletedAssignments = completedAssignments.Count,
                AverageScore = (decimal)averageScore,
                StudentResults = studentResults
            });
        }

        return reports;
    }

    public async Task<List<StudentReportDto>> GetAllStudentReports()
    {
        var students = await _context.Users
            .Where(u => u.Role == Domain.Enums.Role.Student)
            .ToListAsync();

        var reports = new List<StudentReportDto>();
        foreach (var student in students)
        {
            var assignments = await _context.ExamAssignments
                .Include(a => a.Exam)
                .Include(a => a.Seat)
                .Where(a => a.UserId == student.Id && a.CompletedAt.HasValue)
                .ToListAsync();

            var examScores = assignments.Select(a => new ExamScoreDto
            {
                ExamId = a.ExamId,
                Subject = a.Exam.Subject,
                ExamDate = a.Exam.StartTime,
                Score = a.Score,
                Grade = a.Grade,
                SeatNumber = a.Seat?.Number ?? 0
            }).ToList();

            var averageGrade = examScores.Any(es => es.Grade.HasValue)
                ? examScores.Where(es => es.Grade.HasValue).Average(es => es.Grade.Value)
                : 0;

            reports.Add(new StudentReportDto
            {
                StudentId = student.Id,
                FullName = student.FullName,
                Email = student.Email,
                ExamScores = examScores,
                AverageGrade = (decimal)averageGrade,
                TotalExamsTaken = assignments.Count
            });
        }

        return reports;
    }

    public async Task<bool> SubmitExamScore(int assignmentId, decimal score, decimal grade)
    {
        var assignment = await _context.ExamAssignments
            .FirstOrDefaultAsync(a => a.Id == assignmentId);

        if (assignment == null)
            throw new ArgumentException($"Assignment with ID {assignmentId} not found");

        assignment.Score = score;
        assignment.Grade = grade;
        assignment.CompletedAt = DateTime.UtcNow;

        _context.ExamAssignments.Update(assignment);
        await _context.SaveChangesAsync();

        return true;
    }
}
