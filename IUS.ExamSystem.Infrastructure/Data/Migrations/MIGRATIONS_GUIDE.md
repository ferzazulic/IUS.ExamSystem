# Database Migrations Guide

This document outlines all database migrations for the IUS Exam System and how to apply them.

## Migration Overview

Migrations are applied in this order:

### 1. **001_InitialSchema** - Foundation Tables (Latest/Current)
**When to use:** Fresh database setup from scratch

**Creates:**
- `Users` table - Student, staff, and admin user accounts
- `Rooms` table - Exam rooms/venues
- `Seats` table - Individual seats within rooms
- `Exams` table - Exam definitions
- `ExamAssignments` table - Student-to-exam assignments and seat allocations

**Key Indexes:**
- `IX_Exams_RoomId` - Fast room lookups for exams
- `IX_ExamAssignments_UserId/ExamId/SeatId` - Relationship queries
- `IX_Seats_RoomId` - Room seat queries

---

### 2. **002_UpdateExamTimeRange** - Time-Based Scheduling
**When to apply:** After initial schema, when adding conflict detection

**Changes:**
- Removes `Date` column from Exams
- Adds `StartTime` column - exam start time (datetime2)
- Adds `EndTime` column - exam end time (datetime2)
- Creates composite index: `IX_Exams_StartTime_EndTime` for efficient time-range queries

**Purpose:** Enable precise scheduling and conflict detection
- Prevents students from being assigned to overlapping exams
- Allows flexible exam durations

---

### 3. **003_AddGradingSupport** - Grading & Reporting
**When to apply:** When implementing exam grading and academic reporting

**New Columns:**
- `Score` (decimal) - Raw exam score (NULL until graded)
- `Grade` (decimal) - Letter/percentage grade (NULL until graded)
- `CompletedAt` (datetime2) - When exam was submitted/completed

**New Indexes:**
- `IX_ExamAssignments_CompletedAt` - Filter completed exams
- `IX_ExamAssignments_UserId_CompletedAt` - Student exam history

**Purpose:** Track exam results and enable comprehensive reporting

---

## How to Apply Migrations

### Using Entity Framework CLI

```bash
# Navigate to your API project directory
cd IUS.ExamSystem.API

# Apply all pending migrations
dotnet ef database update

# Apply specific migration
dotnet ef database update 001_InitialSchema
dotnet ef database update 002_UpdateExamTimeRange
dotall ef database update 003_AddGradingSupport

# Revert to previous migration
dotnet ef database update 001_InitialSchema

# View migration history
dotnet ef migrations list

# Create new migration (automatic)
dotnet ef migrations add <MigrationName>
```

### Using SQL Server Management Studio (Manual)

If EF Core is not available, execute the migrations in order:

1. Run all SQL from Migration 001
2. Run all SQL from Migration 002
3. Run all SQL from Migration 003

---

## Migration Dependencies

```
301_AddGradingSupport
    ↓ (depends on)
002_UpdateExamTimeRange
    ↓ (depends on)
001_InitialSchema
```

**Applying migrations out of order will cause failures.**

---

## Rollback Strategy

To rollback to a previous state:

```bash
# Rollback to initial schema (removes time tracking and grading)
dotnet ef database update 001_InitialSchema

# Rollback to before grading (keeps time range)
dotnet ef database update 002_UpdateExamTimeRange
```

---

## Database Schema Diagram

```
[Rooms]
    ├→ [Seats]
    └→ [Exams]
         └→ [ExamAssignments]
              ├→ [Users]
              └→ [Seats]

Key Relationships:
- Room (1) ← → (M) Seats
- Room (1) ← → (M) Exams
- Exam (1) ← → (M) ExamAssignments
- User (1) ← → (M) ExamAssignments
- Seat (1) ← → (M) ExamAssignments
```

---

## Important Notes

1. **Conflict Detection** requires `StartTime` and `EndTime` columns (Migration 002)
   - Checks if student has exam scheduled during same time period
   - Only works after applying Migration 002

2. **Reporting Features** require grading columns (Migration 003)
   - Score, Grade, and CompletedAt tracking
   - Report endpoints cannot function without this migration

3. **Data Loss Warning**
   - Migration 002 drops the `Date` column (pre-migration backup recommended)
   - Always backup production database before applying migrations

4. **Production Deployment**
   - Test all migrations on staging environment first
   - Create database backups before applying to production
   - Have rollback plan ready

---

## Migration Status Check

```bash
# See current database state
dotnet ef migrations list

# See pending migrations
dotnet ef migrations list --no-build
```

---

## Contact & Support

For issues with migrations:
- Check migration files in `IUS.ExamSystem.Infrastructure/Data/Migrations/`
- Review ConflictDetectionService and ReportService implementations
- Ensure SQL Server version supports features used
