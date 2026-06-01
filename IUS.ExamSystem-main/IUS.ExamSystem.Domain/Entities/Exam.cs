namespace IUS.ExamSystem.Domain.Entities;

public class Exam
{
    public int Id { get; set; }
    public string Subject { get; set; }
    public DateTime StartTime { get; set; }
    public DateTime EndTime { get; set; }

    public int RoomId { get; set; }
    public Room Room { get; set; }

    public ICollection<ExamAssignment> Assignments { get; set; }
}