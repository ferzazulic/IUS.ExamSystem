using IUS.ExamSystem.Domain.Enums;

namespace IUS.ExamSystem.Domain.Entities;

public class User
{
    public int Id { get; set; }
    public string FullName { get; set; }
    public string Email { get; set; }
    public string PasswordHash { get; set; }

    public Role Role { get; set; }

    // Navigation: assignments for exams
    public ICollection<ExamAssignment> ExamAssignments { get; set; } = new List<ExamAssignment>();

    public override string ToString() => $"User {{ Id = {Id}, FullName = {FullName}, Email = {Email} }}";
}