namespace IUS.ExamSystem.Domain.Entities;

public class Course
{
    public int Id { get; set; }
    public string Code { get; set; }
    public string Name { get; set; }
    public string Type { get; set; }
    public string Professor { get; set; }

    public ICollection<CourseEnrollment> Enrollments { get; set; }
}
