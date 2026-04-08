using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace IUS.ExamSystem.Infrastructure.Data.Migrations;

/// <summary>
/// Migration 002: Update Exam table for time-range support
/// Changes: Replace 'Date' column with 'StartTime' and 'EndTime' columns
/// Purpose: Enable conflict detection and precise scheduling
/// </summary>
public partial class UpdateExamTimeRange : Migration
{
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        // Drop the old Date column and add new time columns
        migrationBuilder.DropColumn(
            name: "Date",
            table: "Exams");

        migrationBuilder.AddColumn<DateTime>(
            name: "StartTime",
            table: "Exams",
            type: "datetime2",
            nullable: false,
            defaultValue: new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc));

        migrationBuilder.AddColumn<DateTime>(
            name: "EndTime",
            table: "Exams",
            type: "datetime2",
            nullable: false,
            defaultValue: new DateTime(2026, 1, 1, 2, 0, 0, 0, DateTimeKind.Utc));

        // Create indexes for time-based queries (conflict detection)
        migrationBuilder.CreateIndex(
            name: "IX_Exams_StartTime_EndTime",
            table: "Exams",
            columns: new[] { "StartTime", "EndTime" });
    }

    protected override void Down(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.DropIndex(
            name: "IX_Exams_StartTime_EndTime",
            table: "Exams");

        migrationBuilder.DropColumn(
            name: "StartTime",
            table: "Exams");

        migrationBuilder.DropColumn(
            name: "EndTime",
            table: "Exams");

        migrationBuilder.AddColumn<DateTime>(
            name: "Date",
            table: "Exams",
            type: "datetime2",
            nullable: false,
            defaultValue: new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc));
    }
}
