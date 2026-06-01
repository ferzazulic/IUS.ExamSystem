namespace IUS.ExamSystem.Domain.Entities;

public class Course
{
    public int Id { get; set; }
    public string Code { get; set; }
    public string Name { get; set; }
    public string Type { get; set; }
    public string Professor { get; set; }

    // Navigation: students enrolled in this course
    public ICollection<CourseEnrollment> Enrollments { get; set; } = new List<CourseEnrollment>();

    public override string ToString() => $"Course {{ Id = {Id}, Code = {Code}, Name = {Name} }}";
}
