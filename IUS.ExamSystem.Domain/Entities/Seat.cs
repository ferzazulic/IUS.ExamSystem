namespace IUS.ExamSystem.Domain.Entities;

public class Seat
{
    public int Id { get; set; }
    public int Number { get; set; }

    public int RoomId { get; set; }
    public Room Room { get; set; }

    public override string ToString() => $"Seat {{ Id = {Id}, Number = {Number}, RoomId = {RoomId} }}";
}