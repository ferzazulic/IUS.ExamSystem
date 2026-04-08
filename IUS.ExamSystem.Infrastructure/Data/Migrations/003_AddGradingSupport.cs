using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace IUS.ExamSystem.Infrastructure.Data.Migrations;

/// <summary>
/// Migration 003: Add grading and completion tracking to ExamAssignments
/// New columns: Score, Grade, CompletedAt
/// Purpose: Track exam results, grades, and completion status for reporting
/// </summary>
public partial class AddGradingSupport : Migration
{
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        // Add grading columns to ExamAssignments
        migrationBuilder.AddColumn<decimal>(
            name: "Score",
            table: "ExamAssignments",
            type: "decimal(18,2)",
            nullable: true,
            comment: "Exam score out of total points");

        migrationBuilder.AddColumn<decimal>(
            name: "Grade",
            table: "ExamAssignments",
            type: "decimal(18,2)",
            nullable: true,
            comment: "Letter grade equivalent (0.0-4.0 scale or percentage)");

        migrationBuilder.AddColumn<DateTime>(
            name: "CompletedAt",
            table: "ExamAssignments",
            type: "datetime2",
            nullable: true,
            comment: "Timestamp when exam was completed");

        // Create index for report filtering
        migrationBuilder.CreateIndex(
            name: "IX_ExamAssignments_CompletedAt",
            table: "ExamAssignments",
            column: "CompletedAt");

        // Create index for user exam history
        migrationBuilder.CreateIndex(
            name: "IX_ExamAssignments_UserId_CompletedAt",
            table: "ExamAssignments",
            columns: new[] { "UserId", "CompletedAt" });
    }

    protected override void Down(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.DropIndex(
            name: "IX_ExamAssignments_CompletedAt",
            table: "ExamAssignments");

        migrationBuilder.DropIndex(
            name: "IX_ExamAssignments_UserId_CompletedAt",
            table: "ExamAssignments");

        migrationBuilder.DropColumn(
            name: "Score",
            table: "ExamAssignments");

        migrationBuilder.DropColumn(
            name: "Grade",
            table: "ExamAssignments");

        migrationBuilder.DropColumn(
            name: "CompletedAt",
            table: "ExamAssignments");
    }
}
