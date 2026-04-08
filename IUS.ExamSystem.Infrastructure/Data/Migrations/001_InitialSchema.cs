using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace IUS.ExamSystem.Infrastructure.Data.Migrations;

/// <summary>
/// Migration 001: Initial schema creation with core tables
/// Tables: Users, Exams, Rooms, Seats, ExamAssignments
/// </summary>
public partial class InitialSchema : Migration
{
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        // Create Users table
        migrationBuilder.CreateTable(
            name: "Users",
            columns: table => new
            {
                Id = table.Column<int>(type: "int", nullable: false)
                    .Annotation("SqlServer:Identity", "1, 1"),
                FullName = table.Column<string>(type: "nvarchar(max)", nullable: false),
                Email = table.Column<string>(type: "nvarchar(max)", nullable: false),
                PasswordHash = table.Column<string>(type: "nvarchar(max)", nullable: false),
                Role = table.Column<int>(type: "int", nullable: false)
            },
            constraints: table =>
            {
                table.PrimaryKey("PK_Users", x => x.Id);
            });

        // Create Rooms table
        migrationBuilder.CreateTable(
            name: "Rooms",
            columns: table => new
            {
                Id = table.Column<int>(type: "int", nullable: false)
                    .Annotation("SqlServer:Identity", "1, 1"),
                Name = table.Column<string>(type: "nvarchar(max)", nullable: false),
                Capacity = table.Column<int>(type: "int", nullable: false)
            },
            constraints: table =>
            {
                table.PrimaryKey("PK_Rooms", x => x.Id);
            });

        // Create Exams table
        migrationBuilder.CreateTable(
            name: "Exams",
            columns: table => new
            {
                Id = table.Column<int>(type: "int", nullable: false)
                    .Annotation("SqlServer:Identity", "1, 1"),
                Subject = table.Column<string>(type: "nvarchar(max)", nullable: false),
                Date = table.Column<DateTime>(type: "datetime2", nullable: false),
                RoomId = table.Column<int>(type: "int", nullable: false)
            },
            constraints: table =>
            {
                table.PrimaryKey("PK_Exams", x => x.Id);
                table.ForeignKey(
                    name: "FK_Exams_Rooms_RoomId",
                    column: x => x.RoomId,
                    principalTable: "Rooms",
                    principalColumn: "Id",
                    onDelete: ReferentialAction.Cascade);
            });

        // Create Seats table
        migrationBuilder.CreateTable(
            name: "Seats",
            columns: table => new
            {
                Id = table.Column<int>(type: "int", nullable: false)
                    .Annotation("SqlServer:Identity", "1, 1"),
                Number = table.Column<int>(type: "int", nullable: false),
                RoomId = table.Column<int>(type: "int", nullable: false)
            },
            constraints: table =>
            {
                table.PrimaryKey("PK_Seats", x => x.Id);
                table.ForeignKey(
                    name: "FK_Seats_Rooms_RoomId",
                    column: x => x.RoomId,
                    principalTable: "Rooms",
                    principalColumn: "Id",
                    onDelete: ReferentialAction.Cascade);
            });

        // Create ExamAssignments table
        migrationBuilder.CreateTable(
            name: "ExamAssignments",
            columns: table => new
            {
                Id = table.Column<int>(type: "int", nullable: false)
                    .Annotation("SqlServer:Identity", "1, 1"),
                UserId = table.Column<int>(type: "int", nullable: false),
                ExamId = table.Column<int>(type: "int", nullable: false),
                SeatId = table.Column<int>(type: "int", nullable: false)
            },
            constraints: table =>
            {
                table.PrimaryKey("PK_ExamAssignments", x => x.Id);
                table.ForeignKey(
                    name: "FK_ExamAssignments_Users_UserId",
                    column: x => x.UserId,
                    principalTable: "Users",
                    principalColumn: "Id",
                    onDelete: ReferentialAction.Cascade);
                table.ForeignKey(
                    name: "FK_ExamAssignments_Exams_ExamId",
                    column: x => x.ExamId,
                    principalTable: "Exams",
                    principalColumn: "Id",
                    onDelete: ReferentialAction.Cascade);
                table.ForeignKey(
                    name: "FK_ExamAssignments_Seats_SeatId",
                    column: x => x.SeatId,
                    principalTable: "Seats",
                    principalColumn: "Id",
                    onDelete: ReferentialAction.Cascade);
            });

        // Create indexes
        migrationBuilder.CreateIndex(
            name: "IX_Exams_RoomId",
            table: "Exams",
            column: "RoomId");

        migrationBuilder.CreateIndex(
            name: "IX_ExamAssignments_ExamId",
            table: "ExamAssignments",
            column: "ExamId");

        migrationBuilder.CreateIndex(
            name: "IX_ExamAssignments_SeatId",
            table: "ExamAssignments",
            column: "SeatId");

        migrationBuilder.CreateIndex(
            name: "IX_ExamAssignments_UserId",
            table: "ExamAssignments",
            column: "UserId");

        migrationBuilder.CreateIndex(
            name: "IX_Seats_RoomId",
            table: "Seats",
            column: "RoomId");
    }

    protected override void Down(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.DropTable(name: "ExamAssignments");
        migrationBuilder.DropTable(name: "Seats");
        migrationBuilder.DropTable(name: "Exams");
        migrationBuilder.DropTable(name: "Users");
        migrationBuilder.DropTable(name: "Rooms");
    }
}
