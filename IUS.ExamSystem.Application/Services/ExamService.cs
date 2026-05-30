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

        var allSeats = await _context.Seats
            .Where(s => s.RoomId == exam.RoomId)
            .OrderBy(s => s.Number)
            .ToListAsync();

        if (allSeats.Count == 0)
            throw new InvalidOperationException("No available seats in the exam room");

        // Get all existing assignments for this exam (enrolled students waiting for a seat)
        var existingAssignments = await _context.ExamAssignments
            .Where(ea => ea.ExamId == examId)
            .ToListAsync();

        var enrolledStudentIds = existingAssignments.Select(ea => ea.UserId).ToHashSet();

        // Also get students not yet enrolled
        var allStudents = await _context.Users
            .Where(u => u.Role == Role.Student)
            .OrderBy(u => u.FullName)
            .ToListAsync();

        var seatIndex = 0;
        var newAssignments = new List<ExamAssignment>();

        foreach (var student in allStudents)
        {
            if (await _conflictService.HasExamConflict(student.Id, examId))
                continue;

            var seat = allSeats[seatIndex % allSeats.Count];
            seatIndex++;

            var existing = existingAssignments.FirstOrDefault(ea => ea.UserId == student.Id);
            if (existing != null)
                existing.SeatId = seat.Id; // Update enrolled student's seat
            else
                newAssignments.Add(new ExamAssignment { UserId = student.Id, ExamId = examId, SeatId = seat.Id });
        }

        _context.ExamAssignments.AddRange(newAssignments);
        await _context.SaveChangesAsync();
    }

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

        var allSeats = await _context.Seats
            .Where(s => s.RoomId == exam.RoomId)
            .OrderBy(s => s.Number)
            .ToListAsync();

        var existingAssignments = await _context.ExamAssignments
            .Where(ea => ea.ExamId == examId && studentIds.Contains(ea.UserId))
            .ToListAsync();

        var seatIndex = 0;
        var newAssignments = new List<ExamAssignment>();

        foreach (var student in students)
        {
            if (await _conflictService.HasExamConflict(student.Id, examId))
                continue;

            var seat = allSeats[seatIndex % allSeats.Count];
            seatIndex++;

            var existing = existingAssignments.FirstOrDefault(ea => ea.UserId == student.Id);
            if (existing != null)
                existing.SeatId = seat.Id;
            else
                newAssignments.Add(new ExamAssignment { UserId = student.Id, ExamId = examId, SeatId = seat.Id });
        }

        _context.ExamAssignments.AddRange(newAssignments);
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

       var conflict = await _context.Exams.AnyAsync(e =>
           e.RoomId == exam.RoomId &&
           e.StartTime < exam.EndTime &&
           e.EndTime > exam.StartTime
       );

       if (conflict)
       {
           throw new InvalidOperationException("Room is already occupied in this time range!");
       }

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
    public async Task<bool> DeleteExam(int id)
  {
      var exam = await _context.Exams.FindAsync(id);
      if (exam == null) return false;
      _context.Exams.Remove(exam);
      await _context.SaveChangesAsync();
      return true;
  }
public async Task EnrollStudent(int examId, int studentId, int? seatId = null)
{
    var exam = await _context.Exams.FindAsync(examId);

    if (exam == null)
        throw new InvalidOperationException("Exam not found");

    //  DUPLI ENROLL
    var already = await _context.ExamAssignments
        .AnyAsync(ea => ea.ExamId == examId && ea.UserId == studentId);

    if (already)
        throw new InvalidOperationException("Already enrolled in this exam!");

    //  STUDENT TIME CONFLICT
    var hasConflict = await _context.ExamAssignments
        .Include(a => a.Exam)
        .AnyAsync(a =>
            a.UserId == studentId &&
            a.Exam.StartTime < exam.EndTime &&
            a.Exam.EndTime > exam.StartTime
        );

    if (hasConflict)
        throw new InvalidOperationException("You already have an exam at this time!");

    //  SEAT VALIDATION
    if (seatId.HasValue)
    {
        var seatTaken = await _context.ExamAssignments
            .AnyAsync(ea => ea.ExamId == examId && ea.SeatId == seatId);

        if (seatTaken)
            throw new InvalidOperationException("That seat is already taken. Please choose another.");
    }

    _context.ExamAssignments.Add(new ExamAssignment
    {
        ExamId = examId,
        UserId = studentId,
        SeatId = seatId
    });

    await _context.SaveChangesAsync();
}

  public async Task UnenrollStudent(int examId, int studentId)
  {
      var assignment = await _context.ExamAssignments
          .FirstOrDefaultAsync(ea => ea.ExamId == examId && ea.UserId == studentId);
      if (assignment == null) return;
      _context.ExamAssignments.Remove(assignment);
      await _context.SaveChangesAsync();
  }

  public async Task<List<ExamAssignment>> GetStudentAssignments(int studentId)
  {
      return await _context.ExamAssignments
          .Include(a => a.Exam)
              .ThenInclude(e => e.Room)
          .Include(a => a.Seat)
          .Where(a => a.UserId == studentId)
          .ToListAsync();
  }

  public async Task<List<SeatMapEntry>> GetSeatMap(int examId)
  {
      var exam = await _context.Exams
          .Include(e => e.Room).ThenInclude(r => r.Seats)
          .Include(e => e.Assignments).ThenInclude(a => a.Student)
          .FirstOrDefaultAsync(e => e.Id == examId);

      if (exam == null) throw new InvalidOperationException("Exam not found");

      var assignmentBySeat = exam.Assignments
          .Where(a => a.SeatId.HasValue)
          .ToDictionary(a => a.SeatId!.Value, a => a);

      return exam.Room.Seats
          .OrderBy(s => s.Number)
          .Select(s => new SeatMapEntry(
              s.Id,
              s.Number,
              assignmentBySeat.ContainsKey(s.Id) ? assignmentBySeat[s.Id].UserId : null,
              assignmentBySeat.ContainsKey(s.Id) ? assignmentBySeat[s.Id].Student?.FullName : null
          ))
          .ToList();
  }

  public async Task AssignSeat(int examId, int studentId, int seatId)
  {
      var exam = await _context.Exams.Include(e => e.Room).FirstOrDefaultAsync(e => e.Id == examId);
      if (exam == null) throw new InvalidOperationException("Exam not found");

      var seat = await _context.Seats.FirstOrDefaultAsync(s => s.Id == seatId && s.RoomId == exam.RoomId);
      if (seat == null) throw new InvalidOperationException("Seat not found in this exam's room");

      var seatTaken = await _context.ExamAssignments
          .AnyAsync(ea => ea.ExamId == examId && ea.SeatId == seatId && ea.UserId != studentId);
      if (seatTaken) throw new InvalidOperationException("That seat is already taken by another student");

      var existing = await _context.ExamAssignments
          .FirstOrDefaultAsync(ea => ea.ExamId == examId && ea.UserId == studentId);

      if (existing != null)
          existing.SeatId = seatId;
      else
          _context.ExamAssignments.Add(new ExamAssignment { ExamId = examId, UserId = studentId, SeatId = seatId });

      await _context.SaveChangesAsync();
  }

  public async Task RemoveSeatAssignment(int examId, int seatId)
  {
      var assignment = await _context.ExamAssignments
          .FirstOrDefaultAsync(ea => ea.ExamId == examId && ea.SeatId == seatId);

      if (assignment != null)
      {
          _context.ExamAssignments.Remove(assignment);
          await _context.SaveChangesAsync();
      }
  }

  public async Task GradeStudent(int examId, int studentId, decimal score)
  {
      var assignment = await _context.ExamAssignments
          .FirstOrDefaultAsync(ea => ea.ExamId == examId && ea.UserId == studentId);

      if (assignment == null)
          throw new InvalidOperationException("Student is not enrolled in this exam");

      assignment.Score = score;
      assignment.Grade = score switch
      {
          >= 90 => 4.0m,
          >= 80 => 3.0m,
          >= 70 => 2.0m,
          >= 55 => 1.0m,
          _ => 0.0m
      };
      assignment.CompletedAt = DateTime.UtcNow;

      await _context.SaveChangesAsync();
  }

  public async Task<List<ExamAssignment>> GetExamStudents(int examId)
  {
      return await _context.ExamAssignments
          .Include(a => a.Student)
          .Include(a => a.Seat)
          .Where(a => a.ExamId == examId)
          .ToListAsync();
  }
}