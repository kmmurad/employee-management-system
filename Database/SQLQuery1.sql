
CREATE DATABASE EmployeeManagementSystem;



USE EmployeeManagementSystem;


-- ============================================
-- STEP 2: CREATE TABLES
-- ============================================

-- TABLE 1: Departments (stores department information)
CREATE TABLE Departments (
    DepartmentID INT IDENTITY(1,1) PRIMARY KEY,
    DepartmentName NVARCHAR(100) NOT NULL,
    Description NVARCHAR(500),
    CreatedDate DATETIME DEFAULT GETDATE(),
    IsActive BIT DEFAULT 1
);



-- TABLE 2: Employees (stores employee information)
CREATE TABLE Employees (
    EmployeeID INT IDENTITY(1,1) PRIMARY KEY,
    FirstName NVARCHAR(50) NOT NULL,
    LastName NVARCHAR(50) NOT NULL,
    Gender NVARCHAR(10) CHECK (Gender IN ('Male', 'Female', 'Other')),
    Email NVARCHAR(100) UNIQUE NOT NULL,
    Phone NVARCHAR(20),
    Address NVARCHAR(200),
    HireDate DATE NOT NULL,
    Salary DECIMAL(18,2) CHECK (Salary >= 0),
    DepartmentID INT FOREIGN KEY REFERENCES Departments(DepartmentID),
    Status NVARCHAR(20) DEFAULT 'Active' CHECK (Status IN ('Active', 'Inactive', 'On Leave')),
    CreatedDate DATETIME DEFAULT GETDATE(),
    UpdatedDate DATETIME NULL
);



-- TABLE 3: Attendance (tracks employee attendance)
CREATE TABLE Attendance (
    AttendanceID INT IDENTITY(1,1) PRIMARY KEY,
    EmployeeID INT FOREIGN KEY REFERENCES Employees(EmployeeID),
    AttendanceDate DATE NOT NULL,
    Status NVARCHAR(20) CHECK (Status IN ('Present', 'Absent', 'Leave', 'Late')),
    CheckInTime TIME NULL,
    CheckOutTime TIME NULL,
    Remarks NVARCHAR(200),
    CreatedDate DATETIME DEFAULT GETDATE(),
    CONSTRAINT UQ_EmployeeDate UNIQUE (EmployeeID, AttendanceDate)
);



-- TABLE 4: Payroll (stores salary information)
CREATE TABLE Payroll (
    PayrollID INT IDENTITY(1,1) PRIMARY KEY,
    EmployeeID INT FOREIGN KEY REFERENCES Employees(EmployeeID),
    BasicSalary DECIMAL(18,2) NOT NULL,
    Bonus DECIMAL(18,2) DEFAULT 0,
    Deductions DECIMAL(18,2) DEFAULT 0,
    NetSalary AS (BasicSalary + Bonus - Deductions) PERSISTED,
    PaymentMonth DATE NOT NULL,
    PaymentDate DATETIME DEFAULT GETDATE(),
    PaymentStatus NVARCHAR(20) DEFAULT 'Pending' CHECK (PaymentStatus IN ('Pending', 'Paid', 'Cancelled'))
);
GO


-- TABLE 5: Users (for login authentication)
CREATE TABLE Users (
    UserID INT IDENTITY(1,1) PRIMARY KEY,
    Username NVARCHAR(50) UNIQUE NOT NULL,
    PasswordHash NVARCHAR(255) NOT NULL,
    EmployeeID INT FOREIGN KEY REFERENCES Employees(EmployeeID),
    Role NVARCHAR(20) CHECK (Role IN ('Admin', 'Manager', 'HR', 'Employee')),
    IsActive BIT DEFAULT 1,
    LastLogin DATETIME NULL,
    CreatedDate DATETIME DEFAULT GETDATE()
);




-- ============================================
-- STEP 3: INSERT SAMPLE DATA
-- ============================================

-- Insert Departments
INSERT INTO Departments (DepartmentName, Description) VALUES
('Engineering', 'Software development and technical operations'),
('Human Resources', 'Employee management and recruitment'),
('Finance', 'Financial operations and accounting'),
('Marketing', 'Brand promotion and market research'),
('Sales', 'Revenue generation and client management');
GO


-- Insert Employees
INSERT INTO Employees (FirstName, LastName, Gender, Email, Phone, Address, HireDate, Salary, DepartmentID, Status) VALUES
('John', 'Smith', 'Male', 'john.smith@company.com', '123-456-7890', '123 Main St, NY', '2023-01-15', 75000, 1, 'Active'),
('Sarah', 'Johnson', 'Female', 'sarah.j@company.com', '098-765-4321', '456 Oak Ave, CA', '2023-03-20', 68000, 2, 'Active'),
('Michael', 'Brown', 'Male', 'michael.b@company.com', '555-123-4567', '789 Pine Rd, TX', '2023-06-10', 82000, 1, 'Active'),
('Emily', 'Davis', 'Female', 'emily.d@company.com', '444-987-6543', '321 Elm St, FL', '2023-09-05', 55000, 3, 'On Leave'),
('David', 'Wilson', 'Male', 'david.w@company.com', '777-555-8888', '654 Maple Dr, WA', '2024-01-02', 92000, 1, 'Active'),
('Lisa', 'Martinez', 'Female', 'lisa.m@company.com', '333-222-1111', '987 Cedar Ln, IL', '2024-02-14', 61000, 4, 'Active'),
('James', 'Anderson', 'Male', 'james.a@company.com', '888-444-7777', '147 Birch Blvd, GA', '2024-03-25', 48000, 5, 'Inactive'),
('Patricia', 'Thomas', 'Female', 'patricia.t@company.com', '222-666-9999', '258 Walnut St, CO', '2024-04-01', 72000, 2, 'Active');
GO


-- Insert Users (Password: Password123)
INSERT INTO Users (Username, PasswordHash, EmployeeID, Role) VALUES
('admin', '8c6976e5b5410415bde908bd4dee15dfb167a9c873fc4bb8a81f6f2ab448a918', 1, 'Admin'),
('hr_manager', '8c6976e5b5410415bde908bd4dee15dfb167a9c873fc4bb8a81f6f2ab448a918', 2, 'HR'),
('john.smith', '8c6976e5b5410415bde908bd4dee15dfb167a9c873fc4bb8a81f6f2ab448a918', 1, 'Employee');
GO


-- Insert Attendance
INSERT INTO Attendance (EmployeeID, AttendanceDate, Status, CheckInTime, CheckOutTime) VALUES
(1, '2026-07-01', 'Present', '09:00:00', '17:30:00'),
(2, '2026-07-01', 'Present', '08:45:00', '17:15:00'),
(3, '2026-07-01', 'Late', '09:30:00', '17:45:00'),
(4, '2026-07-01', 'Absent', NULL, NULL),
(5, '2026-07-01', 'Present', '08:30:00', '17:00:00');
GO

-- Insert Payroll
INSERT INTO Payroll (EmployeeID, BasicSalary, Bonus, Deductions, PaymentMonth, PaymentStatus) VALUES
(1, 75000, 5000, 2000, '2026-06-01', 'Paid'),
(2, 68000, 3000, 1500, '2026-06-01', 'Paid'),
(3, 82000, 7000, 2500, '2026-06-01', 'Paid'),
(4, 55000, 2000, 1000, '2026-06-01', 'Pending'),
(5, 92000, 8000, 3000, '2026-06-01', 'Paid');
GO



-- ============================================
-- STEP 4: CREATE STORED PROCEDURES
-- ============================================

-- Search employees by name or ID
CREATE PROCEDURE sp_SearchEmployees
    @SearchTerm NVARCHAR(100)
AS
BEGIN
    SELECT 
        e.EmployeeID,
        e.FirstName,
        e.LastName,
        e.Email,
        e.Phone,
        e.Salary,
        d.DepartmentName,
        e.Status
    FROM Employees e
    INNER JOIN Departments d ON e.DepartmentID = d.DepartmentID
    WHERE e.FirstName LIKE '%' + @SearchTerm + '%'
       OR e.LastName LIKE '%' + @SearchTerm + '%'
       OR CAST(e.EmployeeID AS NVARCHAR) LIKE '%' + @SearchTerm + '%'
       OR e.Email LIKE '%' + @SearchTerm + '%'
    ORDER BY e.FirstName;
END;
GO


-- Get attendance report for an employee
CREATE PROCEDURE sp_GetEmployeeAttendance
    @EmployeeID INT,
    @Month INT,
    @Year INT
AS
BEGIN
    SELECT 
        AttendanceDate,
        Status,
        CheckInTime,
        CheckOutTime,
        Remarks
    FROM Attendance
    WHERE EmployeeID = @EmployeeID
        AND MONTH(AttendanceDate) = @Month
        AND YEAR(AttendanceDate) = @Year
    ORDER BY AttendanceDate;
END;
GO


SELECT * FROM Users;
select * from Employees
select * from Departments