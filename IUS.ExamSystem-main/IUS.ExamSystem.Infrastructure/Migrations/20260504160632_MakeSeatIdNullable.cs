using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace IUS.ExamSystem.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class MakeSeatIdNullable : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_ExamAssignments_Seats_SeatId",
                table: "ExamAssignments");

            migrationBuilder.AlterColumn<int>(
                name: "SeatId",
                table: "ExamAssignments",
                type: "int",
                nullable: true,
                oldClrType: typeof(int),
                oldType: "int");

            migrationBuilder.AddForeignKey(
                name: "FK_ExamAssignments_Seats_SeatId",
                table: "ExamAssignments",
                column: "SeatId",
                principalTable: "Seats",
                principalColumn: "Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_ExamAssignments_Seats_SeatId",
                table: "ExamAssignments");

            migrationBuilder.AlterColumn<int>(
                name: "SeatId",
                table: "ExamAssignments",
                type: "int",
                nullable: false,
                defaultValue: 0,
                oldClrType: typeof(int),
                oldType: "int",
                oldNullable: true);

            migrationBuilder.AddForeignKey(
                name: "FK_ExamAssignments_Seats_SeatId",
                table: "ExamAssignments",
                column: "SeatId",
                principalTable: "Seats",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
