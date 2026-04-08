public class AppDbContext : DbContext
{
    public DbSet<User> Users { get; set; }
    public DbSet<Exam> Exams { get; set; }
    public DbSet<Room> Rooms { get; set; }
    public DbSet<Seat> Seats { get; set; }
    public DbSet<ExamAssignment> ExamAssignments { get; set; }

    public AppDbContext(DbContextOptions<AppDbContext> options)
        : base(options) { }
}