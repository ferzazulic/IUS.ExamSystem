namespace IUS.ExamSystem.Domain.Entities;

public class Room
{
    public int Id { get; set; }
    public string Name { get; set; }
    public int Capacity { get; set; }

    public ICollection<Seat> Seats { get; set; } = new List<Seat>();
}