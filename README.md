# IUS.ExamSystem

A campus exam management system with JWT authentication, role-based access, smart seat allocation, conflict detection, and grading/reporting endpoints.

## Features

- JWT authentication with `Admin`, `Staff`, and `Student` roles
- Exam scheduling with start/end time conflict detection
- Smart seat allocation for students based on seat order and conflict checks
- Exam reporting and grading endpoints
- Entity Framework Core migrations for database schema
- Swagger API documentation

## Repository Structure

- `IUS.ExamSystem.API/` - ASP.NET Core Web API project
- `IUS.ExamSystem.Application/` - Application services and interfaces
- `IUS.ExamSystem.Domain/` - Domain entities and enums
- `IUS.ExamSystem.Infrastructure/` - EF Core DbContext, auth, data migrations

## Setup

1. Clone the repository:

```powershell
git clone https://github.com/ferzazulic/IUS.ExamSystem.git
cd "c:\Users\Ferzudin\Documents\DIW Project\IUS.Campus.ExamSystem"
```

2. Restore packages:

```powershell
dotnet restore
```

3. Build the solution:

```powershell
dotnet build
```

4. Update the database:

```powershell
cd IUS.ExamSystem.API
dotnet ef database update
```

## Run

```powershell
cd IUS.ExamSystem.API
dotnet run
```

The API runs at `http://localhost:5000` by default.

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register a user
- `POST /api/auth/login` - Sign in and receive JWT

### Exam Management
- `POST /api/exam` - Create a new exam
- `GET /api/exam` - List all exams
- `GET /api/exam/{examId}` - Get exam details
- `POST /api/exam/allocate/{examId}` - Allocate seats for an exam
- `POST /api/exam/allocate-selected/{examId}` - Allocate seats for specified students
- `POST /api/exam/check-conflicts` - Check student schedule conflicts

### Reporting
- `GET /api/report/exam/{examId}` - Exam report with student results
- `GET /api/report/student/{studentId}` - Student academic report
- `GET /api/report/exams/all` - All exam reports
- `GET /api/report/students/all` - All student reports
- `POST /api/report/submit-score` - Submit a score and grade for an assignment

## Example Requests

### Register
```http
POST /api/auth/register
Content-Type: application/json

{
  "fullName": "Ahmed Hassan",
  "email": "ahmed@university.edu",
  "password": "Password123!",
  "role": 2
}
```

### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "ahmed@university.edu",
  "password": "Password123!"
}
```

### Create Exam
```http
POST /api/exam
Authorization: Bearer <token>
Content-Type: application/json

{
  "subject": "Advanced Mathematics",
  "startTime": "2026-04-15T09:00:00Z",
  "endTime": "2026-04-15T11:00:00Z",
  "roomId": 1
}
```

### Allocate Seats
```http
POST /api/exam/allocate/1
Authorization: Bearer <token>
```

### Allocate Selected Students
```http
POST /api/exam/allocate-selected/1
Authorization: Bearer <token>
Content-Type: application/json

{
  "studentIds": [5, 12, 23]
}
```

### Check Conflicts
```http
POST /api/exam/check-conflicts
Authorization: Bearer <token>
Content-Type: application/json

{
  "studentId": 5,
  "examId": 1
}
```

### Submit Score
```http
POST /api/report/submit-score
Authorization: Bearer <token>
Content-Type: application/json

{
  "assignmentId": 1,
  "score": 85.5,
  "grade": 3.8
}
```

## Swagger

When running locally, browse API docs at:

`http://localhost:5000/swagger/index.html`

## Notes

- Use the `Authorization: Bearer <token>` header for protected endpoints.
- If your SQL Server connection string needs updating, edit `IUS.ExamSystem.API/appsettings.json`.

## Git

This repository is connected to:

`https://github.com/ferzazulic/IUS.ExamSystem.git`
