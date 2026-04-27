using IUS.ExamSystem.Application.Interfaces;
using IUS.ExamSystem.Domain.Entities;
using IUS.ExamSystem.Domain.Enums;
using IUS.ExamSystem.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace IUS.ExamSystem.Application.Services;

public class ExamService : IExamService
{
    private readonly AppDbContext _context;
    private readonly IConflictDetectionService _conflictService;

    public ExamService(AppDbContext context, IConflictDetectionService conflictService)
    {
        _context = context;
        _conflictService = conflictService;
    }

    public async Task AllocateSeats(int examId)
    {
        var exam = await _context.Exams
            .Include(e => e.Room)
            .FirstOrDefaultAsync(e => e.Id == examId);

        if (exam == null)
            throw new ArgumentException($"Exam with ID {examId} not found");

        // Get all students who don't already have an assignment for this exam
        var assignedStudents = await _context.ExamAssignments
            .Where(ea => ea.ExamId == examId)
            .Select(ea => ea.UserId)
            .ToListAsync();

        var students = await _context.Users
            .Where(u => u.Role == Role.Student && !assignedStudents.Contains(u.Id))
            .OrderBy(u => u.FullName) // Smart allocation: alphabetical order
            .ToListAsync();

        // Get available seats (ordered by seat number for systematic allocation)
        var availableSeats = await _context.Seats
            .Where(s => s.RoomId == exam.RoomId)
            .OrderBy(s => s.Number)
            .ToListAsync();

        if (availableSeats.Count == 0)
            throw new InvalidOperationException("No available seats in the exam room");

        var assignments = new List<ExamAssignment>();
        var seatIndex = 0;

        foreach (var student in students)
        {
            // Check for scheduling conflicts before allocating
            if (await _conflictService.HasExamConflict(student.Id, examId))
                continue; // Skip students with conflicts

            var seat = availableSeats[seatIndex % availableSeats.Count];

            assignments.Add(new ExamAssignment
            {
                UserId = student.Id,
                ExamId = examId,
                SeatId = seat.Id
            });

            seatIndex++;
        }

        _context.ExamAssignments.AddRange(assignments);
        await _context.SaveChangesAsync();
    }

    /// <summary>
    /// Allocates seats for specific students only, with conflict detection
    /// </summary>
    public async Task AllocateSeatsForStudents(int examId, List<int> studentIds)
    {
        var exam = await _context.Exams
            .Include(e => e.Room)
            .FirstOrDefaultAsync(e => e.Id == examId);

        if (exam == null)
            throw new ArgumentException($"Exam with ID {examId} not found");

        var students = await _context.Users
            .Where(u => studentIds.Contains(u.Id) && u.Role == Role.Student)
            .OrderBy(u => u.FullName)
            .ToListAsync();

        var availableSeats = await _context.Seats
            .Where(s => s.RoomId == exam.RoomId)
            .OrderBy(s => s.Number)
            .ToListAsync();

        var assignments = new List<ExamAssignment>();
        var seatIndex = 0;

        foreach (var student in students)
        {
            // Check for scheduling conflicts
            if (await _conflictService.HasExamConflict(student.Id, examId))
                continue;

            var seat = availableSeats[seatIndex % availableSeats.Count];
            assignments.Add(new ExamAssignment
            {
                UserId = student.Id,
                ExamId = examId,
                SeatId = seat.Id
            });

            seatIndex++;
        }

        _context.ExamAssignments.AddRange(assignments);
        await _context.SaveChangesAsync();
    }

    public async Task<List<Exam>> GetAllExams()
    {
        return await _context.Exams
            .Include(e => e.Room)
            .Include(e => e.Assignments)
            .ToListAsync();
    }

    public async Task<Exam> GetExamById(int id)
    {
        return await _context.Exams
            .Include(e => e.Room)
            .Include(e => e.Assignments)
            .FirstOrDefaultAsync(e => e.Id == id);
    }

    public async Task<Exam> CreateExam(Exam exam)
    {
        _context.Exams.Add(exam);
        await _context.SaveChangesAsync();
        return exam;
    }

    public async Task<List<Seat>> GetAvailableSeats(int examId)
    {
        var exam = await _context.Exams
            .FirstOrDefaultAsync(e => e.Id == examId);

        if (exam == null)
            throw new ArgumentException($"Exam with ID {examId} not found");

        var assignedSeatIds = await _context.ExamAssignments
            .Where(ea => ea.ExamId == examId)
            .Select(ea => ea.SeatId)
            .ToListAsync();

        var availableSeats = await _context.Seats
            .Where(s => s.RoomId == exam.RoomId && !assignedSeatIds.Contains(s.Id))
            .OrderBy(s => s.Number)
            .ToListAsync();

        return availableSeats;
    }
}