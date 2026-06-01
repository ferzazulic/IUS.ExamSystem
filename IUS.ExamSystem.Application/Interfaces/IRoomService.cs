using IUS.ExamSystem.Domain.Entities;

namespace IUS.ExamSystem.Application.Interfaces;

/// <summary>
/// CRUD operations for rooms and their seats.
/// </summary>
public interface IRoomService
{
    Task<List<Room>> GetAllRooms();

    Task<Room> GetRoomById(int id);

    Task<Room> CreateRoom(Room room);

    Task<Room> UpdateRoom(int id, Room room);

    Task<bool> DeleteRoom(int id);
}