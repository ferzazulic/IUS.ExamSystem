-- Database initialization script for IUS Exam System
-- This script runs when the MSSQL container starts for the first time

USE master;
GO

IF NOT EXISTS (SELECT name FROM sys.databases WHERE name = 'IUS_ExamSystem')
BEGIN
    CREATE DATABASE IUS_ExamSystem;
END
GO

USE IUS_ExamSystem;
GO

-- The Entity Framework migrations will handle the table creation
-- This file can be used for any additional database setup if needed

-- Example: Create any additional users or permissions if required
-- GRANT ALL PRIVILEGES ON IUS_ExamSystem.* TO 'sa';
-- GO