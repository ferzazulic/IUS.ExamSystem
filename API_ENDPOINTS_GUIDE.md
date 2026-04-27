# API Endpoints Guide - New Features

This document describes all new API endpoints added for conflict detection, smart seat allocation, and reporting.

---

## 1. CONFLICT DETECTION API

### Check for Exam Conflicts
**Endpoint:** `POST /api/exam/check-conflicts`  
**Auth:** Admin, Staff  
**Description:** Verify if a student has scheduling conflicts before assigning to an exam

```json
Request Body:
{
  "studentId": 5,
  "examId": 12
}

Response (No Conflicts):
{
  "hasConflict": false,
  "conflictingExams": []
}

Response (With Conflicts):
{
  "hasConflict": true,
  "conflictingExams": [
    {
      "examId": 8,
      "subject": "Mathematics",
      "startTime": "2026-04-15T09:00:00Z",
      "endTime": "2026-04-15T11:00:00Z"
    }
  ]
}
```

---

## 2. SMART SEAT ALLOCATION

### Allocate Seats (All Students)
**Endpoint:** `POST /api/exam/allocate/{examId}`  
**Auth:** Admin, Staff  
**Description:** Intelligently allocate seats with automatic conflict detection

```
POST /api/exam/allocate/12

Response:
{
  "success": true,
  "message": "Seats allocated successfully",
  "allocatedCount": 45,
  "skippedCount": 2,
  "skippedReason": "Scheduling conflicts detected"
}
```

### Allocate Seats (Specific Students)
**Endpoint:** `POST /api/exam/allocate-selected/{examId}`  
**Auth:** Admin, Staff  
**Description:** Allocate seats for specific students only

```json
Request Body:
{
  "studentIds": [5, 12, 23, 34]
}

Response:
{
  "success": true,
  "message": "Seats allocated for selected students",
  "allocatedCount": 4,
  "failedCount": 0
}
```

### Get Available Seats
**Endpoint:** `GET /api/exam/{examId}/available-seats`  
**Auth:** Admin, Staff  
**Description:** Get list of unassigned seats for an exam

```
Response:
{
  "examId": 12,
  "roomName": "Room 101",
  "totalCapacity": 50,
  "occupiedSeats": 5,
  "availableSeats": [
    {"seatId": 1, "seatNumber": 1, "roomId": 5},
    {"seatId": 3, "seatNumber": 3, "roomId": 5},
    // ... more available seats
  ]
}
```

---

## 3. REPORT & GRADING API

### Get Exam Report (All Student Results)
**Endpoint:** `GET /api/report/exam/{examId}`  
**Auth:** Admin, Staff  
**Description:** Comprehensive exam report with all student results and statistics

```
GET /api/report/exam/12

Response:
{
  "examId": 12,
  "subject": "Advanced Mathematics",
  "startTime": "2026-04-15T09:00:00Z",
  "endTime": "2026-04-15T11:00:00Z",
  "roomName": "Room 101",
  "totalAssignments": 47,
  "completedAssignments": 42,
  "averageScore": 78.5,
  "studentResults": [
    {
      "assignmentId": 156,
      "studentId": 5,
      "studentName": "Ahmed Hassan",
      "studentEmail": "ahmed@university.edu",
      "seatNumber": 12,
      "roomName": "Room 101",
      "score": 85.5,
      "grade": 3.8,
      "completedAt": "2026-04-15T10:58:00Z",
      "isCompleted": true
    },
    // ... more student results
  ]
}
```

### Get Student Academic Report
**Endpoint:** `GET /api/report/student/{studentId}`  
**Auth:** Admin, Staff, Student (self only)  
**Description:** Individual student's exam history and academic performance

```
GET /api/report/student/5

Response:
{
  "studentId": 5,
  "fullName": "Ahmed Hassan",
  "email": "ahmed@university.edu",
  "totalExamsTaken": 6,
  "averageGrade": 3.7,
  "examScores": [
    {
      "examId": 12,
      "subject": "Advanced Mathematics",
      "examDate": "2026-04-15T09:00:00Z",
      "score": 85.5,
      "grade": 3.8,
      "seatNumber": 12
    },
    {
      "examId": 8,
      "subject": "Physics",
      "examDate": "2026-04-10T14:00:00Z",
      "score": 78.0,
      "grade": 3.5,
      "seatNumber": 8
    },
    // ... more exam scores
  ]
}
```

### Get All Exam Reports
**Endpoint:** `GET /api/report/exams/all`  
**Auth:** Admin, Staff  
**Description:** Summary reports for all exams

```
Response:
[
  {
    "examId": 12,
    "subject": "Advanced Mathematics",
    "startTime": "2026-04-15T09:00:00Z",
    "endTime": "2026-04-15T11:00:00Z",
    "roomName": "Room 101",
    "totalAssignments": 47,
    "completedAssignments": 42,
    "averageScore": 78.5,
    "studentResults": [ /* ... */ ]
  },
  // ... more exams
]
```

### Get All Student Reports
**Endpoint:** `GET /api/report/students/all`  
**Auth:** Admin, Staff  
**Description:** Academic reports for all students

```
Response:
[
  {
    "studentId": 5,
    "fullName": "Ahmed Hassan",
    "email": "ahmed@university.edu",
    "totalExamsTaken": 6,
    "averageGrade": 3.7,
    "examScores": [ /* ... */ ]
  },
  // ... more students
]
```

### Submit Exam Score
**Endpoint:** `POST /api/report/submit-score`  
**Auth:** Admin, Staff  
**Description:** Record a student's exam score and grade

```json
Request Body:
{
  "assignmentId": 156,
  "score": 85.5,
  "grade": 3.8
}

Response:
{
  "success": true,
  "message": "Score submitted successfully",
  "assignmentId": 156,
  "score": 85.5,
  "grade": 3.8,
  "submittedAt": "2026-04-15T11:30:00Z"
}
```

---

## 4. EXAM MANAGEMENT

### Get All Exams
**Endpoint:** `GET /api/exam`  
**Auth:** Any authenticated user  
**Description:** List all exams with assignments

```
Response:
{
  "exams": [
    {
      "id": 12,
      "subject": "Advanced Mathematics",
      "startTime": "2026-04-15T09:00:00Z",
      "endTime": "2026-04-15T11:00:00Z",
      "roomId": 5,
      "roomName": "Room 101",
      "assignments": 47
    },
    // ... more exams
  ]
}
```

### Get Exam Details
**Endpoint:** `GET /api/exam/{examId}`  
**Auth:** Any authenticated user

```
Response:
{
  "id": 12,
  "subject": "Advanced Mathematics",
  "startTime": "2026-04-15T09:00:00Z",
  "endTime": "2026-04-15T11:00:00Z",
  "roomId": 5,
  "roomName": "Room 101",
  "capacity": 50,
  "assignments": [
    {
      "assignmentId": 156,
      "studentId": 5,
      "studentName": "Ahmed Hassan",
      "seatNumber": 12,
      "score": 85.5,
      "grade": 3.8
    },
    // ... more assignments
  ]
}
```

### Create New Exam
**Endpoint:** `POST /api/exam`  
**Auth:** Admin, Staff  
**Description:** Create a new exam

```json
Request Body:
{
  "subject": "Advanced Mathematics",
  "startTime": "2026-04-15T09:00:00Z",
  "endTime": "2026-04-15T11:00:00Z",
  "roomId": 5
}

Response:
{
  "id": 12,
  "subject": "Advanced Mathematics",
  "startTime": "2026-04-15T09:00:00Z",
  "endTime": "2026-04-15T11:00:00Z",
  "roomId": 5,
  "created": true
}
```

---

## 5. ROOM MANAGEMENT

### Get All Rooms
**Endpoint:** `GET /api/room`  
**Auth:** Admin, Staff  
**Description:** List all exam rooms with their details

```
Response:
[
  {
    "id": 1,
    "name": "Room 101",
    "capacity": 50,
    "seats": [
      {"id": 1, "number": 1, "roomId": 1},
      {"id": 2, "number": 2, "roomId": 1},
      // ... up to capacity
    ]
  },
  // ... more rooms
]
```

### Get Room Details
**Endpoint:** `GET /api/room/{id}`  
**Auth:** Admin, Staff  
**Description:** Get detailed information about a specific room

```
Response:
{
  "id": 1,
  "name": "Room 101",
  "capacity": 50,
  "seats": [
    {"id": 1, "number": 1, "roomId": 1},
    {"id": 2, "number": 2, "roomId": 1},
    // ... all seats
  ]
}
```

### Create New Room
**Endpoint:** `POST /api/room`  
**Auth:** Admin  
**Description:** Create a new exam room (automatically creates seats based on capacity)

```json
Request Body:
{
  "name": "Room 102",
  "capacity": 40
}

Response:
{
  "id": 2,
  "name": "Room 102",
  "capacity": 40,
  "seats": [
    {"id": 51, "number": 1, "roomId": 2},
    {"id": 52, "number": 2, "roomId": 2},
    // ... 40 seats total
  ]
}
```

### Update Room
**Endpoint:** `PUT /api/room/{id}`  
**Auth:** Admin  
**Description:** Update room information (adjusts seats if capacity changes)

```json
Request Body:
{
  "name": "Updated Room 101",
  "capacity": 60
}

Response:
{
  "id": 1,
  "name": "Updated Room 101",
  "capacity": 60,
  "seats": [
    // ... 60 seats
  ]
}
```

### Delete Room
**Endpoint:** `DELETE /api/room/{id}`  
**Auth:** Admin  
**Description:** Delete a room (only if no exams are assigned)

```
Response:
{
  "message": "Room deleted successfully"
}
```

---

## 6. ERROR HANDLING

All endpoints return appropriate HTTP status codes:

```
200 OK - Request successful
201 Created - Resource created successfully
400 Bad Request - Invalid input data
401 Unauthorized - Authentication required
403 Forbidden - Insufficient permissions
404 Not Found - Resource not found
500 Internal Server Error - Server error
```

### Error Response Format
```json
{
  "error": "Error title",
  "message": "Detailed error message",
  "statusCode": 400,
  "timestamp": "2026-04-15T11:30:00Z"
}
```

---

## 7. AUTHENTICATION

All endpoints (except `/api/auth/login` and `/api/auth/register`) require JWT token:

```
Authorization: Bearer <your_jwt_token>
```

### User Roles
- **Admin** - Full system access
- **Staff** - Can manage exams, allocate seats, grade exams, view reports
- **Student** - Can view own exam assignments and grades

---

## 8. EXAMPLE USE CASES

### Use Case 1: Creating an Exam and Allocating Seats

```bash
# 1. Create exam
POST /api/exam
{
  "subject": "Physics",
  "startTime": "2026-05-01T09:00:00Z",
  "endTime": "2026-05-01T11:00:00Z",
  "roomId": 3
}
# Returns: examId = 25

# 2. Allocate seats with conflict detection
POST /api/exam/allocate/25
# Automatically assigns seats, skipping students with conflicts

# 3. Check results
GET /api/exam/25
# Shows all assignments and any students skipped due to conflicts
```

### Use Case 2: Grading an Exam

```bash
# 1. Get exam report to see all assignments
GET /api/report/exam/25

# 2. Submit grades for each student
POST /api/report/submit-score
{
  "assignmentId": 156,
  "score": 92,
  "grade": 4.0
}

# 3. View graded exam report
GET /api/report/exam/25
# Shows all scores, grades, and statistics

# 4. Student views their result
GET /api/report/student/5
# Shows all their exams and grades
```

### Use Case 3: Conflict Detection

```bash
# 1. Check if student can take an exam
POST /api/exam/check-conflicts
{
  "studentId": 5,
  "examId": 25
}
# Returns: { "hasConflict": true, "conflictingExams": [...] }

# 2. If has conflict, view student's exam schedule
GET /api/report/student/5
# Shows all scheduled exams and their times
```

---

## Support & Troubleshooting

For API issues:
- Verify authentication token is valid
- Check user role has required permissions
- Review error messages in response
- Check database migration status (see MIGRATIONS_GUIDE.md)
