namespace IUS.ExamSystem.Domain.Entities;

/// <summary>
/// Represents the association between a <see cref="User"/> (student) and a <see cref="Course"/>.
/// This is a simple join entity and contains only the foreign keys and navigation properties.
/// </summary>
public class CourseEnrollment
{
    public int Id { get; set; }

    // Foreign key to the student (User)
    public int StudentId { get; set; }
    public User Student { get; set; }

    // Foreign key to the course
    public int CourseId { get; set; }
    public Course Course { get; set; }

    public override string ToString()
        => $"CourseEnrollment {{ Id = {Id}, StudentId = {StudentId}, CourseId = {CourseId} }}";
}
