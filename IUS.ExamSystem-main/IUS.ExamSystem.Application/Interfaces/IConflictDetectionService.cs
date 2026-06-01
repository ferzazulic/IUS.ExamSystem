using IUS.ExamSystem.Domain.Entities;

namespace IUS.ExamSystem.Application.Interfaces;

public interface IConflictDetectionService
{
    Task<bool> HasExamConflict(int studentId, int examId);
    Task<List<Exam>> GetConflictingExams(int studentId, int examId);
    Task<List<int>> FindStudentsWithConflicts(int examId);
}
