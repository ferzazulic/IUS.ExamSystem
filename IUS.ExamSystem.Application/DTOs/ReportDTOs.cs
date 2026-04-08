namespace IUS.ExamSystem.Application.DTOs;

public class ExamReportDto
{
    public int ExamId { get; set; }
    public string Subject { get; set; }
    public DateTime StartTime { get; set; }
    public DateTime EndTime { get; set; }
    public string RoomName { get; set; }
    public int TotalAssignments { get; set; }
    public int CompletedAssignments { get; set; }
    public decimal AverageScore { get; set; }
    public List<StudentExamResultDto> StudentResults { get; set; }
}

public class StudentExamResultDto
{
    public int AssignmentId { get; set; }
    public int StudentId { get; set; }
    public string StudentName { get; set; }
    public string StudentEmail { get; set; }
    public int SeatNumber { get; set; }
    public string RoomName { get; set; }
    public decimal? Score { get; set; }
    public decimal? Grade { get; set; }
    public DateTime? CompletedAt { get; set; }
    public bool IsCompleted { get; set; }
}

public class StudentReportDto
{
    public int StudentId { get; set; }
    public string FullName { get; set; }
    public string Email { get; set; }
    public List<ExamScoreDto> ExamScores { get; set; }
    public decimal AverageGrade { get; set; }
    public int TotalExamsTaken { get; set; }
}

public class ExamScoreDto
{
    public int ExamId { get; set; }
    public string Subject { get; set; }
    public DateTime ExamDate { get; set; }
    public decimal? Score { get; set; }
    public decimal? Grade { get; set; }
    public int SeatNumber { get; set; }
}

public class ReportFilterDto
{
    public int? ExamId { get; set; }
    public int? StudentId { get; set; }
    public DateTime? StartDate { get; set; }
    public DateTime? EndDate { get; set; }
}
