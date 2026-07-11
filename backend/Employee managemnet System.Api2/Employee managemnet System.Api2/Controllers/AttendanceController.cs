using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Data.SqlClient;
using System.Data;
using EmployeeManagement.API.Data;
using EmployeeManagement.API.Models;
using EmployeeManagement.API.Models.DTOs;

namespace EmployeeManagement.API.Controllers
{
    // This controller handles all attendance-related actions
    // Only authenticated users can access these endpoints
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class AttendanceController : ControllerBase
    {
        // Database helper - this is how we talk to SQL Server
        private readonly DatabaseHelper _db;

        // Constructor - gives us the database helper when this controller is created
        public AttendanceController(DatabaseHelper db)
        {
            _db = db;
        }

        // ================================================================
        // 1. MARK ATTENDANCE - For a single employee
        // ================================================================
        // This runs when frontend sends: POST /api/Attendance
        // Purpose: Mark an employee as Present, Absent, or Leave for a specific date

        [HttpPost]
        public async Task<ActionResult<ApiResponse<bool>>> MarkAttendance([FromBody] Attendance attendance)
        {
            try
            {
                // First, check if this employee already has attendance for this date
                var checkSql = @"
                    SELECT COUNT(*) FROM Attendance 
                    WHERE EmployeeID = @EmployeeID AND AttendanceDate = @AttendanceDate";

                var checkParams = new[]
                {
                    new SqlParameter("@EmployeeID", attendance.EmployeeID),
                    new SqlParameter("@AttendanceDate", attendance.AttendanceDate)
                };

                var count = Convert.ToInt32(await _db.ExecuteScalarAsync(checkSql, checkParams));

                if (count > 0)
                {
                    // If attendance exists, UPDATE it (e.g., change from Present to Leave)
                    var updateSql = @"
                        UPDATE Attendance 
                        SET Status = @Status, Remarks = @Remarks
                        WHERE EmployeeID = @EmployeeID AND AttendanceDate = @AttendanceDate";

                    var updateParams = new[]
                    {
                        new SqlParameter("@EmployeeID", attendance.EmployeeID),
                        new SqlParameter("@AttendanceDate", attendance.AttendanceDate),
                        new SqlParameter("@Status", attendance.Status),
                        new SqlParameter("@Remarks", (object?)attendance.Remarks ?? DBNull.Value)
                    };

                    await _db.ExecuteNonQueryAsync(updateSql, updateParams);
                    return Ok(ApiResponse<bool>.SuccessResponse(true, "Attendance updated"));
                }
                else
                {
                    // If attendance does NOT exist, INSERT a new record
                    var sql = @"
                        INSERT INTO Attendance (EmployeeID, AttendanceDate, Status, Remarks)
                        VALUES (@EmployeeID, @AttendanceDate, @Status, @Remarks)";

                    var parameters = new[]
                    {
                        new SqlParameter("@EmployeeID", attendance.EmployeeID),
                        new SqlParameter("@AttendanceDate", attendance.AttendanceDate),
                        new SqlParameter("@Status", attendance.Status),
                        new SqlParameter("@Remarks", (object?)attendance.Remarks ?? DBNull.Value)
                    };

                    await _db.ExecuteNonQueryAsync(sql, parameters);
                    return Ok(ApiResponse<bool>.SuccessResponse(true, "Attendance marked"));
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"MarkAttendance Error: {ex.Message}");
                return StatusCode(500, ApiResponse<bool>.ErrorResponse(ex.Message));
            }
        }

        // ================================================================
        // 2. SAVE ALL ATTENDANCE - For a whole day
        // ================================================================
        // This runs when frontend sends: POST /api/Attendance/save-all
        // Purpose: Save attendance for ALL employees in one go

        [HttpPost("save-all")]
        public async Task<ActionResult<ApiResponse<bool>>> SaveAllAttendance([FromBody] List<Attendance> attendanceList)
        {
            try
            {
                // Make sure we got some data
                if (attendanceList == null || attendanceList.Count == 0)
                {
                    return BadRequest(ApiResponse<bool>.ErrorResponse("No attendance data provided"));
                }

                var date = attendanceList.First().AttendanceDate;

                // Loop through each employee's attendance
                foreach (var attendance in attendanceList)
                {
                    var checkSql = @"
                        SELECT COUNT(*) FROM Attendance 
                        WHERE EmployeeID = @EmployeeID AND AttendanceDate = @AttendanceDate";

                    var checkParams = new[]
                    {
                        new SqlParameter("@EmployeeID", attendance.EmployeeID),
                        new SqlParameter("@AttendanceDate", attendance.AttendanceDate)
                    };

                    var count = Convert.ToInt32(await _db.ExecuteScalarAsync(checkSql, checkParams));

                    if (count > 0)
                    {
                        // Update existing record
                        var updateSql = @"
                            UPDATE Attendance 
                            SET Status = @Status, Remarks = @Remarks
                            WHERE EmployeeID = @EmployeeID AND AttendanceDate = @AttendanceDate";

                        var updateParams = new[]
                        {
                            new SqlParameter("@EmployeeID", attendance.EmployeeID),
                            new SqlParameter("@AttendanceDate", attendance.AttendanceDate),
                            new SqlParameter("@Status", attendance.Status),
                            new SqlParameter("@Remarks", (object?)attendance.Remarks ?? DBNull.Value)
                        };

                        await _db.ExecuteNonQueryAsync(updateSql, updateParams);
                    }
                    else
                    {
                        // Insert new record
                        var sql = @"
                            INSERT INTO Attendance (EmployeeID, AttendanceDate, Status, Remarks)
                            VALUES (@EmployeeID, @AttendanceDate, @Status, @Remarks)";

                        var parameters = new[]
                        {
                            new SqlParameter("@EmployeeID", attendance.EmployeeID),
                            new SqlParameter("@AttendanceDate", attendance.AttendanceDate),
                            new SqlParameter("@Status", attendance.Status),
                            new SqlParameter("@Remarks", (object?)attendance.Remarks ?? DBNull.Value)
                        };

                        await _db.ExecuteNonQueryAsync(sql, parameters);
                    }
                }

                return Ok(ApiResponse<bool>.SuccessResponse(true, $"All attendance saved for {date:yyyy-MM-dd}"));
            }
            catch (Exception ex)
            {
                Console.WriteLine($"SaveAllAttendance Error: {ex.Message}");
                return StatusCode(500, ApiResponse<bool>.ErrorResponse(ex.Message));
            }
        }

        // ================================================================
        // 3. GET ATTENDANCE BY DATE - For a specific day
        // ================================================================
        // This runs when frontend sends: GET /api/Attendance/date?date=2026-07-04
        // Purpose: Show all employees and their attendance for a specific date

        [HttpGet("date")]
        public async Task<ActionResult<ApiResponse<List<AttendanceDTO>>>> GetByDate([FromQuery] string date)
        {
            try
            {
                // If no date provided, use today
                DateTime attendanceDate;
                if (string.IsNullOrEmpty(date))
                {
                    attendanceDate = DateTime.Now.Date;
                }
                else
                {
                    attendanceDate = Convert.ToDateTime(date).Date;
                }

                // Get ALL active employees
                // LEFT JOIN = show employees even if they don't have attendance yet
                // ISNULL = if no record, show "Absent" as default
                var sql = @"
                    SELECT 
                        e.EmployeeID,
                        e.FirstName,
                        e.LastName,
                        e.FirstName + ' ' + e.LastName AS EmployeeName,
                        d.DepartmentName,
                        ISNULL(a.Status, 'Absent') AS Status,
                        a.Remarks,
                        a.AttendanceID
                    FROM Employees e
                    LEFT JOIN Departments d ON e.DepartmentID = d.DepartmentID
                    LEFT JOIN Attendance a ON e.EmployeeID = a.EmployeeID AND a.AttendanceDate = @AttendanceDate
                    WHERE e.Status = 'Active'
                    ORDER BY e.FirstName";

                var parameters = new[]
                {
                    new SqlParameter("@AttendanceDate", attendanceDate)
                };

                var dt = await _db.ExecuteQueryAsync(sql, parameters);

                // Convert database rows to a list
                var list = new List<AttendanceDTO>();

                foreach (DataRow row in dt.Rows)
                {
                    list.Add(new AttendanceDTO
                    {
                        EmployeeID = Convert.ToInt32(row["EmployeeID"]),
                        EmployeeName = row["EmployeeName"]?.ToString() ?? "Unknown",
                        FirstName = row["FirstName"]?.ToString() ?? "",
                        LastName = row["LastName"]?.ToString() ?? "",
                        DepartmentName = row["DepartmentName"]?.ToString() ?? "No Department",
                        AttendanceDate = attendanceDate,
                        Status = row["Status"]?.ToString() ?? "Absent",
                        Remarks = row["Remarks"]?.ToString(),
                        AttendanceID = row["AttendanceID"] != DBNull.Value ? Convert.ToInt32(row["AttendanceID"]) : (int?)null
                    });
                }

                return Ok(ApiResponse<List<AttendanceDTO>>.SuccessResponse(list, "Attendance retrieved successfully"));
            }
            catch (Exception ex)
            {
                Console.WriteLine($"GetByDate Attendance Error: {ex.Message}");
                return StatusCode(500, ApiResponse<List<AttendanceDTO>>.ErrorResponse(ex.Message));
            }
        }

        // ================================================================
        // 4. GET ATTENDANCE HISTORY - For reports between two dates
        // ================================================================
        // This runs when frontend sends: GET /api/Attendance/history?startDate=2026-06-01&endDate=2026-07-04
        // Purpose: Get all attendance records between two dates for reports

        [HttpGet("history")]
        public async Task<ActionResult<ApiResponse<List<AttendanceDTO>>>> GetHistory(
            [FromQuery] string startDate,
            [FromQuery] string endDate)
        {
            try
            {
                // Parse dates or use default (last 30 days)
                DateTime start;
                DateTime end;

                if (string.IsNullOrEmpty(startDate) || string.IsNullOrEmpty(endDate))
                {
                    start = DateTime.Now.AddDays(-30);
                    end = DateTime.Now;
                }
                else
                {
                    start = Convert.ToDateTime(startDate);
                    end = Convert.ToDateTime(endDate);
                }

                Console.WriteLine($"Fetching attendance history from {start:yyyy-MM-dd} to {end:yyyy-MM-dd}");

                // Get all attendance records between the two dates
                var sql = @"
                    SELECT 
                        a.AttendanceID,
                        a.EmployeeID,
                        e.FirstName + ' ' + e.LastName AS EmployeeName,
                        e.FirstName,
                        e.LastName,
                        d.DepartmentName,
                        a.AttendanceDate,
                        a.Status,
                        a.Remarks
                    FROM Attendance a
                    INNER JOIN Employees e ON a.EmployeeID = e.EmployeeID
                    LEFT JOIN Departments d ON e.DepartmentID = d.DepartmentID
                    WHERE a.AttendanceDate BETWEEN @StartDate AND @EndDate
                    ORDER BY a.AttendanceDate DESC, e.FirstName";

                var parameters = new[]
                {
                    new SqlParameter("@StartDate", start),
                    new SqlParameter("@EndDate", end)
                };

                var dt = await _db.ExecuteQueryAsync(sql, parameters);

                // Convert to list
                var list = new List<AttendanceDTO>();

                foreach (DataRow row in dt.Rows)
                {
                    list.Add(new AttendanceDTO
                    {
                        AttendanceID = row["AttendanceID"] != DBNull.Value ? Convert.ToInt32(row["AttendanceID"]) : (int?)null,
                        EmployeeID = Convert.ToInt32(row["EmployeeID"]),
                        EmployeeName = row["EmployeeName"]?.ToString() ?? "Unknown",
                        FirstName = row["FirstName"]?.ToString() ?? "",
                        LastName = row["LastName"]?.ToString() ?? "",
                        DepartmentName = row["DepartmentName"]?.ToString() ?? "No Department",
                        AttendanceDate = Convert.ToDateTime(row["AttendanceDate"]),
                        Status = row["Status"]?.ToString() ?? "Absent",
                        Remarks = row["Remarks"]?.ToString()
                    });
                }

                return Ok(ApiResponse<List<AttendanceDTO>>.SuccessResponse(list, "Attendance history retrieved successfully"));
            }
            catch (Exception ex)
            {
                Console.WriteLine($"GetHistory Attendance Error: {ex.Message}");
                Console.WriteLine($"Stack Trace: {ex.StackTrace}");
                return StatusCode(500, ApiResponse<List<AttendanceDTO>>.ErrorResponse(ex.Message));
            }
        }

        // ================================================================
        // 5. GET ATTENDANCE SUMMARY - For reports with stats
        // ================================================================
        // This runs when frontend sends: GET /api/Attendance/summary?startDate=2026-06-01&endDate=2026-07-04
        // Purpose: Get attendance stats for each employee (Present, Absent, Leave, Late counts)

        [HttpGet("summary")]
        public async Task<ActionResult<ApiResponse<AttendanceSummaryDTO>>> GetAttendanceSummary(
            [FromQuery] string startDate,
            [FromQuery] string endDate)
        {
            try
            {
                // Parse dates or use default (last 30 days)
                DateTime start;
                DateTime end;

                if (string.IsNullOrEmpty(startDate) || string.IsNullOrEmpty(endDate))
                {
                    start = DateTime.Now.AddDays(-30);
                    end = DateTime.Now;
                }
                else
                {
                    start = Convert.ToDateTime(startDate);
                    end = Convert.ToDateTime(endDate);
                }

                Console.WriteLine($"Fetching attendance summary from {start:yyyy-MM-dd} to {end:yyyy-MM-dd}");

                // Get attendance counts for each employee
                // Uses CASE statements to count each status separately
                // Calculates attendance percentage
                var sql = @"
                    SELECT 
                        e.EmployeeID,
                        e.FirstName,
                        e.LastName,
                        e.FirstName + ' ' + e.LastName AS EmployeeName,
                        d.DepartmentName,
                        COUNT(a.AttendanceID) AS TotalDays,
                        SUM(CASE WHEN a.Status = 'Present' THEN 1 ELSE 0 END) AS PresentDays,
                        SUM(CASE WHEN a.Status = 'Absent' THEN 1 ELSE 0 END) AS AbsentDays,
                        SUM(CASE WHEN a.Status = 'Leave' THEN 1 ELSE 0 END) AS LeaveDays,
                        SUM(CASE WHEN a.Status = 'Late' THEN 1 ELSE 0 END) AS LateDays,
                        CAST(
                            (SUM(CASE WHEN a.Status = 'Present' THEN 1 ELSE 0 END) * 100.0) / 
                            NULLIF(COUNT(a.AttendanceID), 0) 
                            AS DECIMAL(5,2)
                        ) AS AttendancePercentage
                    FROM Employees e
                    LEFT JOIN Departments d ON e.DepartmentID = d.DepartmentID
                    LEFT JOIN Attendance a ON e.EmployeeID = a.EmployeeID 
                        AND a.AttendanceDate BETWEEN @StartDate AND @EndDate
                    WHERE e.Status = 'Active'
                    GROUP BY e.EmployeeID, e.FirstName, e.LastName, d.DepartmentName
                    ORDER BY AttendancePercentage DESC, e.FirstName";

                var parameters = new[]
                {
                    new SqlParameter("@StartDate", start),
                    new SqlParameter("@EndDate", end)
                };

                var dt = await _db.ExecuteQueryAsync(sql, parameters);

                var employeeSummaries = new List<EmployeeAttendanceSummaryDTO>();
                int totalPresent = 0;
                int totalAbsent = 0;
                int totalLeave = 0;
                int totalLate = 0;
                int totalDays = 0;

                // Loop through results and build summary
                foreach (DataRow row in dt.Rows)
                {
                    var present = Convert.ToInt32(row["PresentDays"]);
                    var absent = Convert.ToInt32(row["AbsentDays"]);
                    var leave = Convert.ToInt32(row["LeaveDays"]);
                    var late = Convert.ToInt32(row["LateDays"]);
                    var total = Convert.ToInt32(row["TotalDays"]);

                    totalPresent += present;
                    totalAbsent += absent;
                    totalLeave += leave;
                    totalLate += late;
                    totalDays += total;

                    employeeSummaries.Add(new EmployeeAttendanceSummaryDTO
                    {
                        EmployeeID = Convert.ToInt32(row["EmployeeID"]),
                        EmployeeName = row["EmployeeName"]?.ToString() ?? "Unknown",
                        DepartmentName = row["DepartmentName"]?.ToString() ?? "No Department",
                        TotalDays = total,
                        PresentDays = present,
                        AbsentDays = absent,
                        LeaveDays = leave,
                        LateDays = late,
                        AttendancePercentage = row["AttendancePercentage"] != DBNull.Value
                            ? Convert.ToDecimal(row["AttendancePercentage"])
                            : 0
                    });
                }

                // Create the final response with totals
                var response = new AttendanceSummaryDTO
                {
                    StartDate = start,
                    EndDate = end,
                    TotalEmployees = employeeSummaries.Count,
                    TotalPresent = totalPresent,
                    TotalAbsent = totalAbsent,
                    TotalLeave = totalLeave,
                    TotalLate = totalLate,
                    TotalDays = totalDays,
                    EmployeeSummaries = employeeSummaries
                };

                return Ok(ApiResponse<AttendanceSummaryDTO>.SuccessResponse(response, "Attendance summary retrieved successfully"));
            }
            catch (Exception ex)
            {
                Console.WriteLine($"GetAttendanceSummary Error: {ex.Message}");
                Console.WriteLine($"Stack Trace: {ex.StackTrace}");
                return StatusCode(500, ApiResponse<AttendanceSummaryDTO>.ErrorResponse(ex.Message));
            }
        }
    }
}