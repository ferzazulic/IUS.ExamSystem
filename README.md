# IUS.ExamSystem

A campus exam management system with Azure AD authentication, role-based access, smart seat allocation, conflict detection, and grading/reporting endpoints.

## Features

- Azure AD authentication with `Admin`, `Staff`, and `Student` roles
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
- `frontend/` - React frontend with Vite

## Setup

1. Clone the repository:

```powershell
git clone https://github.com/ferzazulic/IUS.ExamSystem.git
cd IUS.ExamSystem
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

Note: For testing purposes, the application is configured to use an in-memory database. No actual database setup is required.

## Run

### Backend
```powershell
cd IUS.ExamSystem.API
dotnet run
```

The API runs at `http://localhost:5000` by default.

### Frontend
```powershell
cd frontend
npm install
npm run dev
```

The frontend runs at `http://localhost:5173` by default.

## Testing

### Backend Testing

1. **Start the backend** as described above.

2. **Access Swagger UI** at `http://localhost:5000/swagger` for API documentation and testing.

3. **Test unprotected endpoints** (if any) directly via Swagger or tools like Postman.

4. **Test authentication**:
   - The API now uses Azure AD for authentication.
   - To test protected endpoints, you need a valid Azure AD access token.
   - Obtain a token by logging in via the frontend or using Azure AD tools.
   - Include the token in the `Authorization` header as `Bearer {token}`.

5. **Database connectivity**:
   - Ensure SQL Server is running and the connection string in `appsettings.json` is correct.
   - The default connection uses a local SQL Server instance.

6. **User registration** (for testing purposes):
   - Use the `/api/auth/register` endpoint to create test users in the database.
   - Example request:
     ```json
     {
       "fullName": "Test Admin",
       "email": "admin@test.com",
       "password": "Password123!",
       "role": 0
     }
     ```
   - Note: Login via `/api/auth/login` is deprecated; use Azure AD for authentication.

### Frontend Testing

1. **Start the frontend** as described above.

2. **Azure AD Configuration**:
   - The frontend is configured with the following Azure AD settings:
     - Tenant ID: `2f2dcb5d-f3e1-4f33-8584-dcacd25d604d`
     - Client ID: `562c6df4-0ce8-4165-8969-f300f4c1842a`
     - Scope URL: `api://562c6df4-0ce8-4165-8969-f300f4c1842a/api_access`
     - Redirect URIs: `http://localhost:5173/auth`, `http://localhost:5173/`, `http://localhost:5173`
   - MSAL packages: `@azure/msal-react` and `@azure/msal-browser` are installed.
   - Configuration is in `frontend/src/msalConfig.js`.
   - The app is wrapped with `MsalProvider` in `main.jsx`.
   - Login uses Azure AD popup authentication.

3. **Login Flow**:
   - Navigate to the frontend.
   - Click "Log in with Azure AD" to authenticate via Azure AD.
   - Upon successful authentication, the app acquires an access token and stores it in localStorage.

4. **API Integration**:
   - Test that the frontend can call protected API endpoints using the obtained token.
   - Check browser console for any authentication or CORS errors.

### End-to-End Testing

1. Start both backend and frontend.
2. Log in via the frontend using Azure AD.
3. Perform actions like creating exams, allocating seats, etc.
4. Verify data persistence in the database.

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
