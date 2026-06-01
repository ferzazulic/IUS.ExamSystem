namespace IUS.ExamSystem.Domain.Entities;

public class Notification
{
    public int Id { get; set; }
    public string Title { get; set; }
    public string Body { get; set; }
    public string Type { get; set; } // "info" | "warning" | "exam"
    public bool IsImportant { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public int CreatedById { get; set; }
    public User CreatedBy { get; set; }

    public override string ToString() => $"Notification {{ Id = {Id}, Title = {Title}, Type = {Type} }}";
}
