namespace IUS.ExamSystem.Domain.Entities;

public class ExamAssignment
{
    public int Id { get; set; }

    public int UserId { get; set; }
    public User Student { get; set; }

    public int ExamId { get; set; }
    public Exam Exam { get; set; }

    public int? SeatId { get; set; }
    public Seat Seat { get; set; }

    public decimal? Score { get; set; }
    public decimal? Grade { get; set; }
    public string? Feedback { get; set; }
    public DateTime? FeedbackSubmittedAt { get; set; }
    public DateTime? CompletedAt { get; set; }
}