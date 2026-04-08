using IUS.ExamSystem.Application.Interfaces;
using IUS.ExamSystem.Domain.Entities;
using IUS.ExamSystem.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace IUS.ExamSystem.Application.Services;

public class ConflictDetectionService : IConflictDetectionService
{
    private readonly AppDbContext _context;

    public ConflictDetectionService(AppDbContext context)
    {
        _context = context;
    }

    /// <summary>
    /// Detects if a student has a scheduling conflict with another exam at the same time.
    /// Returns true if there is a conflict, false otherwise.
    /// </summary>
    public async Task<bool> HasExamConflict(int studentId, int examId)
    {
        var newExam = await _context.Exams
            .FirstOrDefaultAsync(e => e.Id == examId);

        if (newExam == null)
            return false;

        // Check if student is already assigned to an exam that overlaps with the new exam time
        var conflictingAssignments = await _context.ExamAssignments
            .Include(ea => ea.Exam)
            .Where(ea => ea.UserId == studentId &&
                         ea.Exam.StartTime < newExam.EndTime &&
                         ea.Exam.EndTime > newExam.StartTime)
            .ToListAsync();

        return conflictingAssignments.Any();
    }

    /// <summary>
    /// Gets all exams that conflict with the specified exam for a student
    /// </summary>
    public async Task<List<Exam>> GetConflictingExams(int studentId, int examId)
    {
        var newExam = await _context.Exams
            .FirstOrDefaultAsync(e => e.Id == examId);

        if (newExam == null)
            return new List<Exam>();

        var conflicts = await _context.ExamAssignments
            .Include(ea => ea.Exam)
            .Where(ea => ea.UserId == studentId &&
                         ea.Exam.StartTime < newExam.EndTime &&
                         ea.Exam.EndTime > newExam.StartTime)
            .Select(ea => ea.Exam)
            .ToListAsync();

        return conflicts;
    }

    /// <summary>
    /// Checks if there are students with exam conflicts in a batch of assignments
    /// Returns list of student IDs that have conflicts
    /// </summary>
    public async Task<List<int>> FindStudentsWithConflicts(int examId)
    {
        var exam = await _context.Exams.FirstOrDefaultAsync(e => e.Id == examId);
        if (exam == null)
            return new List<int>();

        var studentsWithConflicts = await _context.ExamAssignments
            .Include(ea => ea.Exam)
            .Where(ea => ea.ExamId != examId &&
                         ea.Exam.StartTime < exam.EndTime &&
                         ea.Exam.EndTime > exam.StartTime)
            .Select(ea => ea.UserId)
            .Distinct()
            .ToListAsync();

        return studentsWithConflicts;
    }
}
