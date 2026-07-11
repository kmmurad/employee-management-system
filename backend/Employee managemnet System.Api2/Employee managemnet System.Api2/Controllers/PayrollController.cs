using EmployeeManagement.API.Data;
using EmployeeManagement.API.Models;
using EmployeeManagement.API.Models.DTOs;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Data.SqlClient;
using System.Data;

namespace EmployeeManagement.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class PayrollController : ControllerBase
    {
        private readonly DatabaseHelper _db;

        public PayrollController(DatabaseHelper db)
        {
            _db = db;
        }

        // ============================================
        // CREATE PAYROLL - FIXED (No NetSalary in INSERT)
        // ============================================
        [HttpPost]
        public async Task<ActionResult<ApiResponse<bool>>> CreatePayroll([FromBody] Payroll payroll)
        {
            try
            {
                // Validate input
                if (payroll.EmployeeID <= 0)
                    return BadRequest(ApiResponse<bool>.ErrorResponse("Invalid Employee ID"));

                if (payroll.BasicSalary < 0)
                    return BadRequest(ApiResponse<bool>.ErrorResponse("Basic Salary cannot be negative"));

                if (payroll.PaymentMonth == DateTime.MinValue)
                {
                    payroll.PaymentMonth = DateTime.Now;
                }

                // 🔥 FIX: Do NOT include NetSalary in INSERT - it's computed by database
                var sql = @"
                    INSERT INTO Payroll
                    (EmployeeID, BasicSalary, Bonus, Deductions, PaymentMonth, PaymentStatus)
                    VALUES
                    (@EmployeeID, @BasicSalary, @Bonus, @Deductions, @PaymentMonth, @PaymentStatus);
                    SELECT CAST(SCOPE_IDENTITY() AS INT)";

                var parameters = new[]
                {
                    new SqlParameter("@EmployeeID", payroll.EmployeeID),
                    new SqlParameter("@BasicSalary", payroll.BasicSalary),
                    new SqlParameter("@Bonus", payroll.Bonus),
                    new SqlParameter("@Deductions", payroll.Deductions),
                    new SqlParameter("@PaymentMonth", payroll.PaymentMonth),
                    new SqlParameter("@PaymentStatus", payroll.PaymentStatus ?? "Pending")
                };

                var newId = Convert.ToInt32(await _db.ExecuteScalarAsync(sql, parameters));

                return Ok(ApiResponse<bool>.SuccessResponse(true, $"Payroll created successfully with ID: {newId}"));
            }
            catch (Exception ex)
            {
                Console.WriteLine($"CreatePayroll Error: {ex.Message}");
                Console.WriteLine($"Stack Trace: {ex.StackTrace}");
                return StatusCode(500, ApiResponse<bool>.ErrorResponse($"Error: {ex.Message}"));
            }
        }

        // ============================================
        // UPDATE PAYROLL - FIXED (No NetSalary in UPDATE)
        // ============================================
        [HttpPut("{id}")]
        public async Task<ActionResult<ApiResponse<bool>>> UpdatePayroll(int id, [FromBody] Payroll payroll)
        {
            try
            {
                // 🔥 FIX: Do NOT include NetSalary in UPDATE - it's computed by database
                var sql = @"
                    UPDATE Payroll
                    SET BasicSalary = @BasicSalary,
                        Bonus = @Bonus,
                        Deductions = @Deductions,
                        PaymentMonth = @PaymentMonth,
                        PaymentStatus = @PaymentStatus
                    WHERE PayrollID = @PayrollID";

                var parameters = new[]
                {
                    new SqlParameter("@PayrollID", id),
                    new SqlParameter("@BasicSalary", payroll.BasicSalary),
                    new SqlParameter("@Bonus", payroll.Bonus),
                    new SqlParameter("@Deductions", payroll.Deductions),
                    new SqlParameter("@PaymentMonth", payroll.PaymentMonth),
                    new SqlParameter("@PaymentStatus", payroll.PaymentStatus ?? "Pending")
                };

                var rows = await _db.ExecuteNonQueryAsync(sql, parameters);

                if (rows > 0)
                {
                    return Ok(ApiResponse<bool>.SuccessResponse(true, "Payroll updated successfully"));
                }
                else
                {
                    return NotFound(ApiResponse<bool>.ErrorResponse("Payroll record not found"));
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"UpdatePayroll Error: {ex.Message}");
                Console.WriteLine($"Stack Trace: {ex.StackTrace}");
                return StatusCode(500, ApiResponse<bool>.ErrorResponse($"Error: {ex.Message}"));
            }
        }

        // ============================================
        // GET ALL PAYROLL
        // ============================================
        [HttpGet]
        public async Task<ActionResult<ApiResponse<List<PayrollDTO>>>> GetAll()
        {
            try
            {
                var sql = @"
                    SELECT 
                        p.PayrollID,
                        p.EmployeeID,
                        e.FirstName + ' ' + e.LastName AS EmployeeName,
                        e.FirstName,
                        e.LastName,
                        d.DepartmentName,
                        p.BasicSalary,
                        p.Bonus,
                        p.Deductions,
                        p.NetSalary,
                        p.PaymentMonth,
                        p.PaymentStatus
                    FROM Payroll p
                    INNER JOIN Employees e ON p.EmployeeID = e.EmployeeID
                    LEFT JOIN Departments d ON e.DepartmentID = d.DepartmentID
                    ORDER BY p.PaymentMonth DESC, e.FirstName";

                var dt = await _db.ExecuteQueryAsync(sql);

                var list = new List<PayrollDTO>();

                foreach (DataRow row in dt.Rows)
                {
                    list.Add(new PayrollDTO
                    {
                        PayrollID = row["PayrollID"] != DBNull.Value ? Convert.ToInt32(row["PayrollID"]) : 0,
                        EmployeeID = Convert.ToInt32(row["EmployeeID"]),
                        EmployeeName = row["EmployeeName"]?.ToString() ?? "Unknown",
                        FirstName = row["FirstName"]?.ToString() ?? "",
                        LastName = row["LastName"]?.ToString() ?? "",
                        DepartmentName = row["DepartmentName"]?.ToString() ?? "No Department",
                        BasicSalary = row["BasicSalary"] != DBNull.Value ? Convert.ToDecimal(row["BasicSalary"]) : 0,
                        Bonus = row["Bonus"] != DBNull.Value ? Convert.ToDecimal(row["Bonus"]) : 0,
                        Deductions = row["Deductions"] != DBNull.Value ? Convert.ToDecimal(row["Deductions"]) : 0,
                        NetSalary = row["NetSalary"] != DBNull.Value ? Convert.ToDecimal(row["NetSalary"]) : 0,
                        PaymentMonth = row["PaymentMonth"] != DBNull.Value ? Convert.ToDateTime(row["PaymentMonth"]) : DateTime.Now,
                        PaymentStatus = row["PaymentStatus"]?.ToString() ?? "Pending"
                    });
                }

                return Ok(ApiResponse<List<PayrollDTO>>.SuccessResponse(list, "Payroll data retrieved successfully"));
            }
            catch (Exception ex)
            {
                Console.WriteLine($"GetAll Payroll Error: {ex.Message}");
                Console.WriteLine($"Stack Trace: {ex.StackTrace}");
                return StatusCode(500, ApiResponse<List<PayrollDTO>>.ErrorResponse($"Error: {ex.Message}"));
            }
        }

        // ============================================
        // GET PAYROLL BY EMPLOYEE
        // ============================================
        [HttpGet("employee/{id}")]
        public async Task<ActionResult<ApiResponse<List<PayrollDTO>>>> GetByEmployee(int id)
        {
            try
            {
                var sql = @"
                    SELECT 
                        p.PayrollID,
                        p.EmployeeID,
                        e.FirstName + ' ' + e.LastName AS EmployeeName,
                        e.FirstName,
                        e.LastName,
                        d.DepartmentName,
                        p.BasicSalary,
                        p.Bonus,
                        p.Deductions,
                        p.NetSalary,
                        p.PaymentMonth,
                        p.PaymentStatus
                    FROM Payroll p
                    INNER JOIN Employees e ON p.EmployeeID = e.EmployeeID
                    LEFT JOIN Departments d ON e.DepartmentID = d.DepartmentID
                    WHERE p.EmployeeID = @EmployeeID
                    ORDER BY p.PaymentMonth DESC";

                var parameters = new[]
                {
                    new SqlParameter("@EmployeeID", id)
                };

                var dt = await _db.ExecuteQueryAsync(sql, parameters);

                var list = new List<PayrollDTO>();

                foreach (DataRow row in dt.Rows)
                {
                    list.Add(new PayrollDTO
                    {
                        PayrollID = row["PayrollID"] != DBNull.Value ? Convert.ToInt32(row["PayrollID"]) : 0,
                        EmployeeID = Convert.ToInt32(row["EmployeeID"]),
                        EmployeeName = row["EmployeeName"]?.ToString() ?? "Unknown",
                        FirstName = row["FirstName"]?.ToString() ?? "",
                        LastName = row["LastName"]?.ToString() ?? "",
                        DepartmentName = row["DepartmentName"]?.ToString() ?? "No Department",
                        BasicSalary = row["BasicSalary"] != DBNull.Value ? Convert.ToDecimal(row["BasicSalary"]) : 0,
                        Bonus = row["Bonus"] != DBNull.Value ? Convert.ToDecimal(row["Bonus"]) : 0,
                        Deductions = row["Deductions"] != DBNull.Value ? Convert.ToDecimal(row["Deductions"]) : 0,
                        NetSalary = row["NetSalary"] != DBNull.Value ? Convert.ToDecimal(row["NetSalary"]) : 0,
                        PaymentMonth = row["PaymentMonth"] != DBNull.Value ? Convert.ToDateTime(row["PaymentMonth"]) : DateTime.Now,
                        PaymentStatus = row["PaymentStatus"]?.ToString() ?? "Pending"
                    });
                }

                return Ok(ApiResponse<List<PayrollDTO>>.SuccessResponse(list, "Payroll data retrieved successfully"));
            }
            catch (Exception ex)
            {
                Console.WriteLine($"GetByEmployee Payroll Error: {ex.Message}");
                Console.WriteLine($"Stack Trace: {ex.StackTrace}");
                return StatusCode(500, ApiResponse<List<PayrollDTO>>.ErrorResponse($"Error: {ex.Message}"));
            }
        }

        // ============================================
        // GET PAYROLL BY MONTH
        // ============================================
        [HttpGet("month")]
        public async Task<ActionResult<ApiResponse<List<PayrollDTO>>>> GetByMonth([FromQuery] string month)
        {
            try
            {
                DateTime startDate;
                DateTime endDate;

                if (string.IsNullOrEmpty(month))
                {
                    startDate = new DateTime(DateTime.Now.Year, DateTime.Now.Month, 1);
                    endDate = startDate.AddMonths(1).AddDays(-1);
                }
                else
                {
                    var parts = month.Split('-');
                    if (parts.Length == 2 && int.TryParse(parts[0], out int year) && int.TryParse(parts[1], out int monthNum))
                    {
                        startDate = new DateTime(year, monthNum, 1);
                        endDate = startDate.AddMonths(1).AddDays(-1);
                    }
                    else
                    {
                        startDate = new DateTime(DateTime.Now.Year, DateTime.Now.Month, 1);
                        endDate = startDate.AddMonths(1).AddDays(-1);
                    }
                }

                Console.WriteLine($"Fetching payroll for {startDate:yyyy-MM-dd} to {endDate:yyyy-MM-dd}");

                var sql = @"
                    SELECT 
                        p.PayrollID,
                        p.EmployeeID,
                        e.FirstName + ' ' + e.LastName AS EmployeeName,
                        e.FirstName,
                        e.LastName,
                        d.DepartmentName,
                        p.BasicSalary,
                        p.Bonus,
                        p.Deductions,
                        p.NetSalary,
                        p.PaymentMonth,
                        p.PaymentStatus
                    FROM Payroll p
                    INNER JOIN Employees e ON p.EmployeeID = e.EmployeeID
                    LEFT JOIN Departments d ON e.DepartmentID = d.DepartmentID
                    WHERE p.PaymentMonth BETWEEN @StartDate AND @EndDate
                    ORDER BY p.PaymentMonth DESC, e.FirstName";

                var parameters = new[]
                {
                    new SqlParameter("@StartDate", startDate),
                    new SqlParameter("@EndDate", endDate)
                };

                var dt = await _db.ExecuteQueryAsync(sql, parameters);

                var list = new List<PayrollDTO>();

                foreach (DataRow row in dt.Rows)
                {
                    list.Add(new PayrollDTO
                    {
                        PayrollID = row["PayrollID"] != DBNull.Value ? Convert.ToInt32(row["PayrollID"]) : 0,
                        EmployeeID = Convert.ToInt32(row["EmployeeID"]),
                        EmployeeName = row["EmployeeName"]?.ToString() ?? "Unknown",
                        FirstName = row["FirstName"]?.ToString() ?? "",
                        LastName = row["LastName"]?.ToString() ?? "",
                        DepartmentName = row["DepartmentName"]?.ToString() ?? "No Department",
                        BasicSalary = row["BasicSalary"] != DBNull.Value ? Convert.ToDecimal(row["BasicSalary"]) : 0,
                        Bonus = row["Bonus"] != DBNull.Value ? Convert.ToDecimal(row["Bonus"]) : 0,
                        Deductions = row["Deductions"] != DBNull.Value ? Convert.ToDecimal(row["Deductions"]) : 0,
                        NetSalary = row["NetSalary"] != DBNull.Value ? Convert.ToDecimal(row["NetSalary"]) : 0,
                        PaymentMonth = row["PaymentMonth"] != DBNull.Value ? Convert.ToDateTime(row["PaymentMonth"]) : DateTime.Now,
                        PaymentStatus = row["PaymentStatus"]?.ToString() ?? "Pending"
                    });
                }

                return Ok(ApiResponse<List<PayrollDTO>>.SuccessResponse(list, "Payroll data retrieved successfully"));
            }
            catch (Exception ex)
            {
                Console.WriteLine($"GetByMonth Payroll Error: {ex.Message}");
                Console.WriteLine($"Stack Trace: {ex.StackTrace}");
                return StatusCode(500, ApiResponse<List<PayrollDTO>>.ErrorResponse($"Error: {ex.Message}"));
            }
        }

        // ============================================
        // DELETE PAYROLL
        // ============================================
        [HttpDelete("{id}")]
        public async Task<ActionResult<ApiResponse<bool>>> DeletePayroll(int id)
        {
            try
            {
                var sql = "DELETE FROM Payroll WHERE PayrollID = @PayrollID";
                var parameters = new[]
                {
                    new SqlParameter("@PayrollID", id)
                };

                var rows = await _db.ExecuteNonQueryAsync(sql, parameters);

                if (rows > 0)
                {
                    return Ok(ApiResponse<bool>.SuccessResponse(true, "Payroll record deleted successfully"));
                }
                else
                {
                    return NotFound(ApiResponse<bool>.ErrorResponse("Payroll record not found"));
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"DeletePayroll Error: {ex.Message}");
                Console.WriteLine($"Stack Trace: {ex.StackTrace}");
                return StatusCode(500, ApiResponse<bool>.ErrorResponse($"Error: {ex.Message}"));
            }
        }

        // ============================================
        // GET PAYROLL STATISTICS
        // ============================================
        [HttpGet("stats")]
        public async Task<ActionResult<ApiResponse<object>>> GetStats()
        {
            try
            {
                var sql = @"
                    SELECT 
                        COUNT(*) AS TotalRecords,
                        SUM(BasicSalary) AS TotalBasicSalary,
                        SUM(Bonus) AS TotalBonus,
                        SUM(Deductions) AS TotalDeductions,
                        SUM(NetSalary) AS TotalNetSalary,
                        COUNT(CASE WHEN PaymentStatus = 'Paid' THEN 1 END) AS PaidCount,
                        COUNT(CASE WHEN PaymentStatus = 'Pending' THEN 1 END) AS PendingCount,
                        COUNT(CASE WHEN PaymentStatus = 'Cancelled' THEN 1 END) AS CancelledCount
                    FROM Payroll";

                var dt = await _db.ExecuteQueryAsync(sql);

                if (dt.Rows.Count > 0)
                {
                    var row = dt.Rows[0];
                    var stats = new
                    {
                        TotalRecords = row["TotalRecords"] != DBNull.Value ? Convert.ToInt32(row["TotalRecords"]) : 0,
                        TotalBasicSalary = row["TotalBasicSalary"] != DBNull.Value ? Convert.ToDecimal(row["TotalBasicSalary"]) : 0,
                        TotalBonus = row["TotalBonus"] != DBNull.Value ? Convert.ToDecimal(row["TotalBonus"]) : 0,
                        TotalDeductions = row["TotalDeductions"] != DBNull.Value ? Convert.ToDecimal(row["TotalDeductions"]) : 0,
                        TotalNetSalary = row["TotalNetSalary"] != DBNull.Value ? Convert.ToDecimal(row["TotalNetSalary"]) : 0,
                        PaidCount = row["PaidCount"] != DBNull.Value ? Convert.ToInt32(row["PaidCount"]) : 0,
                        PendingCount = row["PendingCount"] != DBNull.Value ? Convert.ToInt32(row["PendingCount"]) : 0,
                        CancelledCount = row["CancelledCount"] != DBNull.Value ? Convert.ToInt32(row["CancelledCount"]) : 0
                    };

                    return Ok(ApiResponse<object>.SuccessResponse(stats, "Payroll statistics retrieved successfully"));
                }

                return Ok(ApiResponse<object>.SuccessResponse(new { }, "No payroll data found"));
            }
            catch (Exception ex)
            {
                Console.WriteLine($"GetStats Payroll Error: {ex.Message}");
                Console.WriteLine($"Stack Trace: {ex.StackTrace}");
                return StatusCode(500, ApiResponse<object>.ErrorResponse($"Error: {ex.Message}"));
            }
        }
    }
}