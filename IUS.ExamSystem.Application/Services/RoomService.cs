using IUS.ExamSystem.Application.Interfaces;
using IUS.ExamSystem.Domain.Entities;
using IUS.ExamSystem.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace IUS.ExamSystem.Application.Services;

public class RoomService : IRoomService
{
    private readonly AppDbContext _context;

    public RoomService(AppDbContext context)
    {
        _context = context;
    }

    public async Task<List<Room>> GetAllRooms()
    {
        return await _context.Rooms
            .Include(r => r.Seats)
            .ToListAsync();
    }

    public async Task<Room> GetRoomById(int id)
    {
        return await _context.Rooms
            .Include(r => r.Seats)
            .FirstOrDefaultAsync(r => r.Id == id);
    }

    public async Task<Room> CreateRoom(Room room)
    {
        // Create seats for the room based on capacity
        for (int i = 1; i <= room.Capacity; i++)
        {
            room.Seats.Add(new Seat
            {
                Number = i,
                Room = room
            });
        }

        _context.Rooms.Add(room);
        await _context.SaveChangesAsync();

        // Reload room with seats
        return await GetRoomById(room.Id);
    }

    public async Task<Room> UpdateRoom(int id, Room room)
    {
        var existingRoom = await _context.Rooms.FindAsync(id);
        if (existingRoom == null)
            throw new ArgumentException($"Room with ID {id} not found");

        existingRoom.Name = room.Name;
        existingRoom.Capacity = room.Capacity;

        // If capacity changed, we need to adjust seats
        var currentSeats = await _context.Seats.Where(s => s.RoomId == id).ToListAsync();
        if (currentSeats.Count != room.Capacity)
        {
            // Remove extra seats
            if (currentSeats.Count > room.Capacity)
            {
                var seatsToRemove = currentSeats.Skip(room.Capacity).ToList();
                _context.Seats.RemoveRange(seatsToRemove);
            }
            // Add missing seats
            else
            {
                var seatsToAdd = new List<Seat>();
                for (int i = currentSeats.Count + 1; i <= room.Capacity; i++)
                {
                    seatsToAdd.Add(new Seat
                    {
                        Number = i,
                        RoomId = id
                    });
                }
                _context.Seats.AddRange(seatsToAdd);
            }
        }

        await _context.SaveChangesAsync();
        return await GetRoomById(id);
    }

public async Task<bool> DeleteRoom(int id)
{
    var room = await _context.Rooms
        .Include(r => r.Seats)
        .FirstOrDefaultAsync(r => r.Id == id);

    if (room == null) return false;


    var hasExams = await _context.Exams.AnyAsync(e => e.RoomId == id);
    if (hasExams)
        throw new InvalidOperationException("Cannot delete room that has exams assigned. Delete the exams first.");


    _context.Seats.RemoveRange(room.Seats);
    _context.Rooms.Remove(room);
    await _context.SaveChangesAsync();
    return true;
}
}