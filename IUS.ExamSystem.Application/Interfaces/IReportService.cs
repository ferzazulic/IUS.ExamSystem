using IUS.ExamSystem.Application.DTOs;
using IUS.ExamSystem.Domain.Entities;

namespace IUS.ExamSystem.Application.Interfaces;

/// <summary>
/// Provides reporting operations such as generating exam and student reports.
/// </summary>
public interface IReportService
{
    Task<ExamReportDto> GetExamReport(int examId);

    Task<StudentReportDto> GetStudentReport(int studentId);

    Task<List<ExamReportDto>> GetAllExamReports();

    Task<List<StudentReportDto>> GetAllStudentReports();

    Task<bool> SubmitExamScore(int assignmentId, decimal score, decimal grade);
}
