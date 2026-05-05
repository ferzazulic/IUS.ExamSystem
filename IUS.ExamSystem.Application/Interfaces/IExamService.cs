using IUS.ExamSystem.Domain.Entities;

namespace IUS.ExamSystem.Application.Interfaces;

public interface IExamService
{
    Task AllocateSeats(int examId);
    Task AllocateSeatsForStudents(int examId, List<int> studentIds);
    Task<List<Exam>> GetAllExams();
    Task<Exam> GetExamById(int id);
    Task<Exam> CreateExam(Exam exam);
    Task<List<Seat>> GetAvailableSeats(int examId);
    Task<bool> DeleteExam(int id);
    Task EnrollStudent(int examId, int studentId, int? seatId = null);
    Task UnenrollStudent(int examId, int studentId);
    Task SubmitExamFeedback(int examId, int studentId, string feedback);
    Task<List<ExamAssignment>> GetStudentAssignments(int studentId);
}