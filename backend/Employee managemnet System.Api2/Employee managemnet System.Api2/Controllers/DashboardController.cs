using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Data.SqlClient;
using System;
using System.Data;
using System.Threading.Tasks;
using EmployeeManagement.API.Data;
using EmployeeManagement.API.Models.DTOs;

namespace EmployeeManagement.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class DashboardController : ControllerBase
    {
        private readonly DatabaseHelper _db;

        public DashboardController(DatabaseHelper db)
        {
            _db = db;
        }

        // ============================================================
        // GET: api/Dashboard
        // Returns summary statistics for the dashboard
        // ============================================================
        [HttpGet]
        public async Task<ActionResult<ApiResponse<DashboardDTO>>> GetDashboard()
        {
            try
            {
                DashboardDTO dashboard = new DashboardDTO();

                // 1. Get Total Active Employees
                var empCount = await _db.ExecuteScalarAsync(
                    "SELECT COUNT(*) FROM Employees WHERE Status = 'Active'"
                );
                dashboard.TotalEmployees = Convert.ToInt32(empCount);

                // 2. Get Total Active Departments
                var deptCount = await _db.ExecuteScalarAsync(
                    "SELECT COUNT(*) FROM Departments WHERE IsActive = 1"
                );
                dashboard.TotalDepartments = Convert.ToInt32(deptCount);

                // 3. Get Today's Present Employees
                var present = await _db.ExecuteScalarAsync(@"
                    SELECT COUNT(*) 
                    FROM Attendance 
                    WHERE AttendanceDate = CAST(GETDATE() AS DATE) 
                    AND Status = 'Present'
                ");
                dashboard.TodayPresent = Convert.ToInt32(present);

                // 4. Get Today's Absent Employees
                var absent = await _db.ExecuteScalarAsync(@"
                    SELECT COUNT(*) 
                    FROM Attendance 
                    WHERE AttendanceDate = CAST(GETDATE() AS DATE) 
                    AND Status = 'Absent'
                ");
                dashboard.TodayAbsent = Convert.ToInt32(absent);

                // 5. Get Monthly Payroll Total
                var payroll = await _db.ExecuteScalarAsync(@"
                    SELECT ISNULL(SUM(NetSalary), 0)
                    FROM Payroll
                    WHERE MONTH(PaymentMonth) = MONTH(GETDATE())
                    AND YEAR(PaymentMonth) = YEAR(GETDATE())
                ");
                dashboard.MonthlyPayroll = Convert.ToDecimal(payroll);

                return Ok(ApiResponse<DashboardDTO>.SuccessResponse(dashboard));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<DashboardDTO>.ErrorResponse(ex.Message));
            }
        }
    }
}