namespace IUS.ExamSystem.Domain.Entities;

public class Exam
{
    public int Id { get; set; }
    public string Subject { get; set; }
    public DateTime StartTime { get; set; }
    public DateTime EndTime { get; set; }

    public int RoomId { get; set; }
    public Room Room { get; set; }

    // Student assignments for this exam
    public ICollection<ExamAssignment> Assignments { get; set; } = new List<ExamAssignment>();

    public override string ToString() => $"Exam {{ Id = {Id}, Subject = {Subject}, Start = {StartTime} }}";
}