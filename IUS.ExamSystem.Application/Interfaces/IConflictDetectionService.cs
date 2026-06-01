using IUS.ExamSystem.Domain.Entities;

namespace IUS.ExamSystem.Application.Interfaces;

/// <summary>
/// Service responsible for detecting scheduling conflicts for exams.
/// </summary>
public interface IConflictDetectionService
{
    /// <summary>
    /// Returns <c>true</c> when the specified student has a scheduling conflict with the given exam.
    /// </summary>
    Task<bool> HasExamConflict(int studentId, int examId);

    /// <summary>
    /// Returns the list of exams that conflict for the specified student and exam.
    /// </summary>
    Task<List<Exam>> GetConflictingExams(int studentId, int examId);

    /// <summary>
    /// Finds student ids that have conflicts for the given exam.
    /// </summary>
    Task<List<int>> FindStudentsWithConflicts(int examId);
}
