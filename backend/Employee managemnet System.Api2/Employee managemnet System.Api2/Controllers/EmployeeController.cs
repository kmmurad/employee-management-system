using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Data.SqlClient;
using System;
using System.Collections.Generic;
using System.Data;
using System.Threading.Tasks;
using EmployeeManagement.API.Data;
using EmployeeManagement.API.Models;
using EmployeeManagement.API.Models.DTOs;

namespace EmployeeManagement.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class EmployeeController : ControllerBase
    {
        private readonly DatabaseHelper _dbHelper;

        public EmployeeController(DatabaseHelper dbHelper)
        {
            _dbHelper = dbHelper;
        }

        // ============================================================
        // GET: api/Employee
        // Gets all employees from the database
        // ============================================================
        [HttpGet]
        public async Task<ActionResult<ApiResponse<List<EmployeeDTO>>>> GetEmployees()
        {
            try
            {
                // SQL query to get all active employees with their departments
                var sql = @"
                    SELECT 
                        e.EmployeeID,
                        e.FirstName,
                        e.LastName,
                        e.FirstName + ' ' + e.LastName AS FullName,
                        e.Gender,
                        e.Email,
                        e.Phone,
                        e.Address,
                        e.HireDate,
                        e.Salary,
                        e.DepartmentID,
                        d.DepartmentName,
                        e.Status
                    FROM Employees e
                    INNER JOIN Departments d ON e.DepartmentID = d.DepartmentID
                    WHERE e.Status != 'Inactive'
                    ORDER BY e.FirstName, e.LastName";

                // Execute the query
                var dataTable = await _dbHelper.ExecuteQueryAsync(sql);
                var employees = new List<EmployeeDTO>();

                // Convert each row to an EmployeeDTO object
                foreach (DataRow row in dataTable.Rows)
                {
                    employees.Add(new EmployeeDTO
                    {
                        EmployeeID = Convert.ToInt32(row["EmployeeID"]),
                        FullName = row["FullName"].ToString(),
                        FirstName = row["FirstName"].ToString(),
                        LastName = row["LastName"].ToString(),
                        Gender = row["Gender"].ToString(),
                        Email = row["Email"].ToString(),
                        Phone = row["Phone"]?.ToString(),
                        Address = row["Address"]?.ToString(),
                        HireDate = Convert.ToDateTime(row["HireDate"]),
                        Salary = Convert.ToDecimal(row["Salary"]),
                        DepartmentID = Convert.ToInt32(row["DepartmentID"]),
                        DepartmentName = row["DepartmentName"].ToString(),
                        Status = row["Status"].ToString()
                    });
                }

                // Return success response with the list
                return Ok(ApiResponse<List<EmployeeDTO>>.SuccessResponse(employees));
            }
            catch (Exception ex)
            {
                // Return error response
                return StatusCode(500, ApiResponse<List<EmployeeDTO>>.ErrorResponse(ex.Message));
            }
        }

        // ============================================================
        // GET: api/Employee/{id}
        // Gets a single employee by ID
        // ============================================================
        [HttpGet("{id}")]
        public async Task<ActionResult<ApiResponse<EmployeeDTO>>> GetEmployee(int id)
        {
            try
            {
                // SQL query to get employee by ID
                var sql = @"
                    SELECT 
                        e.EmployeeID,
                        e.FirstName,
                        e.LastName,
                        e.FirstName + ' ' + e.LastName AS FullName,
                        e.Gender,
                        e.Email,
                        e.Phone,
                        e.Address,
                        e.HireDate,
                        e.Salary,
                        e.DepartmentID,
                        d.DepartmentName,
                        e.Status
                    FROM Employees e
                    INNER JOIN Departments d ON e.DepartmentID = d.DepartmentID
                    WHERE e.EmployeeID = @EmployeeID";

                var parameters = new[]
                {
                    new SqlParameter("@EmployeeID", id)
                };

                var dataTable = await _dbHelper.ExecuteQueryAsync(sql, parameters);

                // Check if employee exists
                if (dataTable.Rows.Count == 0)
                {
                    return NotFound(ApiResponse<EmployeeDTO>.ErrorResponse("Employee not found"));
                }

                var row = dataTable.Rows[0];

                // Create EmployeeDTO from the row
                var employee = new EmployeeDTO
                {
                    EmployeeID = Convert.ToInt32(row["EmployeeID"]),
                    FullName = row["FullName"].ToString(),
                    FirstName = row["FirstName"].ToString(),
                    LastName = row["LastName"].ToString(),
                    Gender = row["Gender"].ToString(),
                    Email = row["Email"].ToString(),
                    Phone = row["Phone"]?.ToString(),
                    Address = row["Address"]?.ToString(),
                    HireDate = Convert.ToDateTime(row["HireDate"]),
                    Salary = Convert.ToDecimal(row["Salary"]),
                    DepartmentID = Convert.ToInt32(row["DepartmentID"]),
                    DepartmentName = row["DepartmentName"].ToString(),
                    Status = row["Status"].ToString()
                };

                // Return success response
                return Ok(ApiResponse<EmployeeDTO>.SuccessResponse(employee));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<EmployeeDTO>.ErrorResponse(ex.Message));
            }
        }

        // ============================================================
        // POST: api/Employee
        // Adds a new employee to the database
        // ============================================================
        [HttpPost]
        public async Task<ActionResult<ApiResponse<int>>> CreateEmployee([FromBody] Employee employee)
        {
            try
            {
                // Check if email already exists
                var checkSql = "SELECT COUNT(*) FROM Employees WHERE Email = @Email";

                var checkParams = new[]
                {
                    new SqlParameter("@Email", employee.Email)
                };

                var count = Convert.ToInt32(await _dbHelper.ExecuteScalarAsync(checkSql, checkParams));

                if (count > 0)
                    return BadRequest(ApiResponse<int>.ErrorResponse("Email already exists"));

                // SQL to insert new employee
                var sql = @"
                    INSERT INTO Employees 
                    (FirstName, LastName, Gender, Email, Phone, Address, HireDate, Salary, DepartmentID, Status)
                    VALUES 
                    (@FirstName, @LastName, @Gender, @Email, @Phone, @Address, @HireDate, @Salary, @DepartmentID, @Status);
                    SELECT CAST(SCOPE_IDENTITY() AS INT)";

                var parameters = new[]
                {
                    new SqlParameter("@FirstName", employee.FirstName),
                    new SqlParameter("@LastName", employee.LastName),
                    new SqlParameter("@Gender", employee.Gender),
                    new SqlParameter("@Email", employee.Email),
                    new SqlParameter("@Phone", (object?)employee.Phone ?? DBNull.Value),
                    new SqlParameter("@Address", (object?)employee.Address ?? DBNull.Value),
                    new SqlParameter("@HireDate", employee.HireDate),
                    new SqlParameter("@Salary", employee.Salary),
                    new SqlParameter("@DepartmentID", employee.DepartmentID),
                    new SqlParameter("@Status", employee.Status ?? "Active")
                };

                // Execute insert and get new ID
                var newId = Convert.ToInt32(await _dbHelper.ExecuteScalarAsync(sql, parameters));

                return Ok(ApiResponse<int>.SuccessResponse(newId, "Employee created successfully"));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<int>.ErrorResponse(ex.Message));
            }
        }

        // ============================================================
        // PUT: api/Employee/{id}
        // Updates an existing employee
        // ============================================================
        [HttpPut("{id}")]
        public async Task<ActionResult<ApiResponse<bool>>> UpdateEmployee(int id, [FromBody] Employee employee)
        {
            try
            {
                // SQL to update employee
                var sql = @"
                    UPDATE Employees
                    SET FirstName = @FirstName,
                        LastName = @LastName,
                        Gender = @Gender,
                        Email = @Email,
                        Phone = @Phone,
                        Address = @Address,
                        HireDate = @HireDate,
                        Salary = @Salary,
                        DepartmentID = @DepartmentID,
                        Status = @Status
                    WHERE EmployeeID = @EmployeeID";

                var parameters = new[]
                {
                    new SqlParameter("@EmployeeID", id),
                    new SqlParameter("@FirstName", employee.FirstName),
                    new SqlParameter("@LastName", employee.LastName),
                    new SqlParameter("@Gender", employee.Gender),
                    new SqlParameter("@Email", employee.Email),
                    new SqlParameter("@Phone", (object?)employee.Phone ?? DBNull.Value),
                    new SqlParameter("@Address", (object?)employee.Address ?? DBNull.Value),
                    new SqlParameter("@HireDate", employee.HireDate),
                    new SqlParameter("@Salary", employee.Salary),
                    new SqlParameter("@DepartmentID", employee.DepartmentID),
                    new SqlParameter("@Status", employee.Status ?? "Active")
                };

                var rows = await _dbHelper.ExecuteNonQueryAsync(sql, parameters);

                if (rows > 0)
                    return Ok(ApiResponse<bool>.SuccessResponse(true, "Employee updated"));

                return NotFound(ApiResponse<bool>.ErrorResponse("Employee not found"));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<bool>.ErrorResponse(ex.Message));
            }
        }

        // ============================================================
        // DELETE: api/Employee/{id}
        // Deletes an employee and all related records
        // ============================================================
        [HttpDelete("{id}")]
        public async Task<ActionResult<ApiResponse<bool>>> DeleteEmployee(int id)
        {
            try
            {
                // Delete attendance records first
                await _dbHelper.ExecuteNonQueryAsync(
                    "DELETE FROM Attendance WHERE EmployeeID = @EmployeeID",
                    new[] { new SqlParameter("@EmployeeID", id) }
                );

                // Delete payroll records
                await _dbHelper.ExecuteNonQueryAsync(
                    "DELETE FROM Payroll WHERE EmployeeID = @EmployeeID",
                    new[] { new SqlParameter("@EmployeeID", id) }
                );

                // Delete user login
                await _dbHelper.ExecuteNonQueryAsync(
                    "DELETE FROM Users WHERE EmployeeID = @EmployeeID",
                    new[] { new SqlParameter("@EmployeeID", id) }
                );

                // Finally delete the employee
                var rows = await _dbHelper.ExecuteNonQueryAsync(
                    "DELETE FROM Employees WHERE EmployeeID = @EmployeeID",
                    new[] { new SqlParameter("@EmployeeID", id) }
                );

                if (rows > 0)
                    return Ok(ApiResponse<bool>.SuccessResponse(true, "Deleted successfully"));

                return NotFound(ApiResponse<bool>.ErrorResponse("Employee not found"));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<bool>.ErrorResponse(ex.Message));
            }
        }

        // ============================================================
        // GET: api/Employee/search?query=John
        // Searches employees by name or email
        // ============================================================
        [HttpGet("search")]
        public async Task<ActionResult<ApiResponse<List<EmployeeDTO>>>> SearchEmployees(string query)
        {
            try
            {
                // SQL to search employees
                var sql = @"
                    SELECT 
                        e.EmployeeID,
                        e.FirstName,
                        e.LastName,
                        e.FirstName + ' ' + e.LastName AS FullName,
                        e.Gender,
                        e.Email,
                        e.Phone,
                        e.Address,
                        e.HireDate,
                        e.Salary,
                        e.DepartmentID,
                        d.DepartmentName,
                        e.Status
                    FROM Employees e
                    INNER JOIN Departments d ON e.DepartmentID = d.DepartmentID
                    WHERE e.FirstName LIKE @Query 
                       OR e.LastName LIKE @Query 
                       OR e.Email LIKE @Query";

                var parameters = new[]
                {
                    new SqlParameter("@Query", "%" + query + "%")
                };

                var dt = await _dbHelper.ExecuteQueryAsync(sql, parameters);
                var list = new List<EmployeeDTO>();

                foreach (DataRow row in dt.Rows)
                {
                    list.Add(new EmployeeDTO
                    {
                        EmployeeID = Convert.ToInt32(row["EmployeeID"]),
                        FullName = row["FullName"].ToString(),
                        FirstName = row["FirstName"].ToString(),
                        LastName = row["LastName"].ToString(),
                        Gender = row["Gender"].ToString(),
                        Email = row["Email"].ToString(),
                        Phone = row["Phone"]?.ToString(),
                        Address = row["Address"]?.ToString(),
                        HireDate = Convert.ToDateTime(row["HireDate"]),
                        Salary = Convert.ToDecimal(row["Salary"]),
                        DepartmentID = Convert.ToInt32(row["DepartmentID"]),
                        DepartmentName = row["DepartmentName"].ToString(),
                        Status = row["Status"].ToString()
                    });
                }

                return Ok(ApiResponse<List<EmployeeDTO>>.SuccessResponse(list));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<List<EmployeeDTO>>.ErrorResponse(ex.Message));
            }
        }
    }
}