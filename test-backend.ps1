$baseUrl = "http://localhost:5000"
$timestamp = Get-Date -Format "yyyyMMddHHmmss"
$adminEmail = "admin$timestamp@example.com"
$adminPassword = "AdminPassword123!"

$ErrorActionPreference = "Stop"

# Skip SSL certificate validation (for development only)
[System.Net.ServicePointManager]::ServerCertificateValidationCallback = { $true }

function Invoke-JsonRequest {
    param(
        [string]$Method,
        [string]$Url,
        $Body = $null,
        $Headers = $null
    )

    if ($Body -ne $null) {
        return Invoke-RestMethod -Uri $Url -Method $Method -Body ($Body | ConvertTo-Json -Depth 5) -Headers $Headers -ContentType "application/json"
    }

    return Invoke-RestMethod -Uri $Url -Method $Method -Headers $Headers
}

# 1. Register Admin
$admin = @{ FullName = "Admin User"; Email = $adminEmail; Password = $adminPassword; Role = "Admin" }
Write-Host "[1/10] Registering Admin..." -ForegroundColor Green
$adminResp = Invoke-JsonRequest -Method POST -Url "$baseUrl/api/auth/register" -Body $admin
Write-Host "SUCCESS: Admin registered with ID: $($adminResp.id)" -ForegroundColor Green

# 2. Login
Write-Host "[2/10] Logging in..." -ForegroundColor Green
$login = @{ Email = $adminEmail; Password = $adminPassword }
$loginResp = Invoke-JsonRequest -Method POST -Url "$baseUrl/api/auth/login" -Body $login
$token = $loginResp.token
$headers = @{ Authorization = "Bearer $token"; ContentType = "application/json" }
Write-Host "SUCCESS: Logged in successfully" -ForegroundColor Green

# 3. Create Room
Write-Host "[3/10] Creating Room..." -ForegroundColor Green
$room = @{ Name = "Test Room"; Capacity = 30 }
$roomResp = Invoke-JsonRequest -Method POST -Url "$baseUrl/api/room" -Body $room -Headers $headers
$roomId = $roomResp.id
Write-Host "SUCCESS: Room created with ID: $roomId" -ForegroundColor Green

# 4. Register 3 Students
Write-Host "[4/10] Registering Students..." -ForegroundColor Green
$studentIds = @()
for ($i = 1; $i -le 3; $i++) {
    $student = @{ FullName = "Student $i"; Email = "student$i.$timestamp@example.com"; Password = "StudentPass123!"; Role = "Student" }
    $studentResp = Invoke-JsonRequest -Method POST -Url "$baseUrl/api/auth/register" -Body $student
    $studentIds += $studentResp.id
    Write-Host "  Registered Student $i with ID: $($studentResp.id)" -ForegroundColor Green
}
Write-Host "SUCCESS: 3 Students registered" -ForegroundColor Green

# 5. Create Exam
Write-Host "[5/10] Creating Exam..." -ForegroundColor Green
$startTime = (Get-Date).AddHours(2)
$endTime = (Get-Date).AddHours(3)
$exam = @{ Subject = "Mathematics"; StartTime = $startTime; EndTime = $endTime; RoomId = $roomId }
$examResp = Invoke-JsonRequest -Method POST -Url "$baseUrl/api/exam" -Body $exam -Headers $headers
$examId = $examResp.id
Write-Host "SUCCESS: Exam created with ID: $examId" -ForegroundColor Green

# 6. Check Conflicts
Write-Host "[6/10] Checking conflicts for student ID $($studentIds[1])..." -ForegroundColor Green
$conflict = @{ StudentId = $studentIds[1]; ExamId = $examId }
$conflictResp = Invoke-JsonRequest -Method POST -Url "$baseUrl/api/exam/check-conflicts" -Body $conflict -Headers $headers
Write-Host "SUCCESS: Conflict check - HasConflict: $($conflictResp.hasConflict)" -ForegroundColor Green

# 7. Allocate Seats
Write-Host "[7/10] Allocating seats..." -ForegroundColor Green
Invoke-JsonRequest -Method POST -Url "$baseUrl/api/exam/allocate/$examId" -Headers $headers
Write-Host "SUCCESS: Seats allocated successfully" -ForegroundColor Green

# 8. Get Available Seats
Write-Host "[8/10] Getting available seats..." -ForegroundColor Green
$seatsResp = Invoke-JsonRequest -Method GET -Url "$baseUrl/api/exam/$examId/available-seats" -Headers $headers
Write-Host "SUCCESS: Available seats count: $($seatsResp.availableSeats.Count)" -ForegroundColor Green

# 9. Get Exam Report
Write-Host "[9/10] Getting exam report..." -ForegroundColor Green
$reportResp = Invoke-JsonRequest -Method GET -Url "$baseUrl/api/report/exam/$examId" -Headers $headers
Write-Host "SUCCESS: Exam Report - Subject: $($reportResp.subject), Room: $($reportResp.roomName)" -ForegroundColor Green
Write-Host "         Students assigned: $($reportResp.studentResults.Count)" -ForegroundColor Green

# 10. Get Student Report
Write-Host "[10/10] Getting student report for student ID $($studentIds[1])..." -ForegroundColor Green
$studentReportResp = Invoke-JsonRequest -Method GET -Url "$baseUrl/api/report/student/$($studentIds[1])" -Headers $headers
Write-Host "SUCCESS: Student Report - Name: $($studentReportResp.fullName), Exams: $($studentReportResp.examScores.Count)" -ForegroundColor Green

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "ALL TESTS PASSED! BACKEND IS WORKING!" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan
