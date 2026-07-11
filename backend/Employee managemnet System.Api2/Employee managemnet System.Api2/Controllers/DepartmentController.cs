using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Data.SqlClient;
using System.Data;
using EmployeeManagement.API.Data;
using EmployeeManagement.API.Models;
using EmployeeManagement.API.Models.DTOs;

namespace EmployeeManagement.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class DepartmentController : ControllerBase
    {
        private readonly DatabaseHelper _dbHelper;

        public DepartmentController(DatabaseHelper dbHelper)
        {
            _dbHelper = dbHelper;
        }

        // ============================================================
        // GET: api/Department
        // Gets all departments (including inactive ones)
        // ============================================================
        [HttpGet]
        public async Task<ActionResult<ApiResponse<List<Department>>>> GetDepartments()
        {
            try
            {
                var sql = "SELECT * FROM Departments ORDER BY DepartmentName";
                var dataTable = await _dbHelper.ExecuteQueryAsync(sql);

                var departments = new List<Department>();

                foreach (DataRow row in dataTable.Rows)
                {
                    departments.Add(new Department
                    {
                        DepartmentID = Convert.ToInt32(row["DepartmentID"]),
                        DepartmentName = row["DepartmentName"].ToString(),
                        Description = row["Description"]?.ToString(),
                        CreatedDate = Convert.ToDateTime(row["CreatedDate"]),
                        IsActive = Convert.ToBoolean(row["IsActive"])
                    });
                }

                return Ok(ApiResponse<List<Department>>.SuccessResponse(departments, "Departments retrieved successfully"));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<List<Department>>.ErrorResponse(ex.Message));
            }
        }

        // ============================================================
        // GET: api/Department/active
        // Gets only active departments (IsActive = 1)
        // ============================================================
        [HttpGet("active")]
        public async Task<ActionResult<ApiResponse<List<Department>>>> GetActiveDepartments()
        {
            try
            {
                var sql = "SELECT * FROM Departments WHERE IsActive = 1 ORDER BY DepartmentName";
                var dataTable = await _dbHelper.ExecuteQueryAsync(sql);

                var departments = new List<Department>();

                foreach (DataRow row in dataTable.Rows)
                {
                    departments.Add(new Department
                    {
                        DepartmentID = Convert.ToInt32(row["DepartmentID"]),
                        DepartmentName = row["DepartmentName"].ToString(),
                        Description = row["Description"]?.ToString(),
                        CreatedDate = Convert.ToDateTime(row["CreatedDate"]),
                        IsActive = Convert.ToBoolean(row["IsActive"])
                    });
                }

                return Ok(ApiResponse<List<Department>>.SuccessResponse(departments));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<List<Department>>.ErrorResponse(ex.Message));
            }
        }

        // ============================================================
        // POST: api/Department
        // Creates a new department
        // ============================================================
        [HttpPost]
        public async Task<ActionResult<ApiResponse<int>>> CreateDepartment([FromBody] Department department)
        {
            try
            {
                var sql = @"
                    INSERT INTO Departments (DepartmentName, Description)
                    VALUES (@DepartmentName, @Description);
                    SELECT CAST(SCOPE_IDENTITY() AS INT)";

                var parameters = new[]
                {
                    new SqlParameter("@DepartmentName", department.DepartmentName),
                    new SqlParameter("@Description", (object?)department.Description ?? DBNull.Value)
                };

                var newId = Convert.ToInt32(await _dbHelper.ExecuteScalarAsync(sql, parameters));

                return Ok(ApiResponse<int>.SuccessResponse(newId, "Department created successfully"));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<int>.ErrorResponse(ex.Message));
            }
        }

        // ============================================================
        // PUT: api/Department/{id}
        // Updates an existing department
        // ============================================================
        [HttpPut("{id}")]
        public async Task<ActionResult<ApiResponse<bool>>> UpdateDepartment(int id, [FromBody] Department department)
        {
            try
            {
                var sql = @"
                    UPDATE Departments 
                    SET DepartmentName = @DepartmentName,
                        Description = @Description
                    WHERE DepartmentID = @DepartmentID";

                var parameters = new[]
                {
                    new SqlParameter("@DepartmentID", id),
                    new SqlParameter("@DepartmentName", department.DepartmentName),
                    new SqlParameter("@Description", (object?)department.Description ?? DBNull.Value)
                };

                var rows = await _dbHelper.ExecuteNonQueryAsync(sql, parameters);

                return rows > 0
                    ? Ok(ApiResponse<bool>.SuccessResponse(true, "Department updated successfully"))
                    : NotFound(ApiResponse<bool>.ErrorResponse("Department not found"));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<bool>.ErrorResponse(ex.Message));
            }
        }

        // ============================================================
        // PUT: api/Department/activate/{id}
        // Activates a department (sets IsActive = 1)
        // ============================================================
        [HttpPut("activate/{id}")]
        public async Task<ActionResult<ApiResponse<bool>>> ActivateDepartment(int id)
        {
            try
            {
                var sql = "UPDATE Departments SET IsActive = 1 WHERE DepartmentID = @DepartmentID";
                var parameters = new[] { new SqlParameter("@DepartmentID", id) };
                var rows = await _dbHelper.ExecuteNonQueryAsync(sql, parameters);

                return rows > 0
                    ? Ok(ApiResponse<bool>.SuccessResponse(true, "Department activated successfully"))
                    : NotFound(ApiResponse<bool>.ErrorResponse("Department not found"));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<bool>.ErrorResponse(ex.Message));
            }
        }

        // ============================================================
        // PUT: api/Department/deactivate/{id}
        // Deactivates a department (sets IsActive = 0)
        // ============================================================
        [HttpPut("deactivate/{id}")]
        public async Task<ActionResult<ApiResponse<bool>>> DeactivateDepartment(int id)
        {
            try
            {
                var sql = "UPDATE Departments SET IsActive = 0 WHERE DepartmentID = @DepartmentID";
                var parameters = new[] { new SqlParameter("@DepartmentID", id) };
                var rows = await _dbHelper.ExecuteNonQueryAsync(sql, parameters);

                if (rows > 0)
                {
                    return Ok(ApiResponse<bool>.SuccessResponse(true, "Department deactivated successfully"));
                }
                else
                {
                    return NotFound(ApiResponse<bool>.ErrorResponse("Department not found"));
                }
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<bool>.ErrorResponse(ex.Message));
            }
        }

        // ============================================================
        // PUT: api/Department/toggle/{id}
        // Toggles department status (Active ↔ Inactive)
        // ============================================================
        [HttpPut("toggle/{id}")]
        public async Task<ActionResult<ApiResponse<bool>>> ToggleDepartmentStatus(int id)
        {
            try
            {
                // First check current status
                var checkSql = "SELECT IsActive FROM Departments WHERE DepartmentID = @DepartmentID";
                var checkParams = new[] { new SqlParameter("@DepartmentID", id) };
                var currentStatus = await _dbHelper.ExecuteScalarAsync(checkSql, checkParams);

                if (currentStatus == null)
                {
                    return NotFound(ApiResponse<bool>.ErrorResponse("Department not found"));
                }

                var isActive = Convert.ToBoolean(currentStatus);
                var newStatus = !isActive;

                // Update to the opposite status
                var sql = "UPDATE Departments SET IsActive = @IsActive WHERE DepartmentID = @DepartmentID";
                var parameters = new[]
                {
                    new SqlParameter("@IsActive", newStatus),
                    new SqlParameter("@DepartmentID", id)
                };

                var rows = await _dbHelper.ExecuteNonQueryAsync(sql, parameters);

                return rows > 0
                    ? Ok(ApiResponse<bool>.SuccessResponse(newStatus, $"Department {(newStatus ? "activated" : "deactivated")} successfully"))
                    : NotFound(ApiResponse<bool>.ErrorResponse("Department not found"));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<bool>.ErrorResponse(ex.Message));
            }
        }

        // ============================================================
        // DELETE: api/Department/{id}
        // Permanently deletes a department (only if inactive)
        // ============================================================
        [HttpDelete("{id}")]
        public async Task<ActionResult<ApiResponse<bool>>> DeleteDepartment(int id)
        {
            try
            {
                // Check if department is inactive first
                var checkSql = "SELECT IsActive FROM Departments WHERE DepartmentID = @DepartmentID";
                var checkParams = new[] { new SqlParameter("@DepartmentID", id) };
                var currentStatus = await _dbHelper.ExecuteScalarAsync(checkSql, checkParams);

                if (currentStatus == null)
                {
                    return NotFound(ApiResponse<bool>.ErrorResponse("Department not found"));
                }

                var isActive = Convert.ToBoolean(currentStatus);
                if (isActive)
                {
                    return BadRequest(ApiResponse<bool>.ErrorResponse("Cannot delete active department. Deactivate it first."));
                }

                // Check if department has employees
                var empSql = "SELECT COUNT(*) FROM Employees WHERE DepartmentID = @DepartmentID";
                var empParams = new[] { new SqlParameter("@DepartmentID", id) };
                var empCount = Convert.ToInt32(await _dbHelper.ExecuteScalarAsync(empSql, empParams));

                if (empCount > 0)
                {
                    return BadRequest(ApiResponse<bool>.ErrorResponse($"Cannot delete department with {empCount} employees. Reassign them first."));
                }

                // Delete the department
                var sql = "DELETE FROM Departments WHERE DepartmentID = @DepartmentID";
                var parameters = new[] { new SqlParameter("@DepartmentID", id) };
                var rows = await _dbHelper.ExecuteNonQueryAsync(sql, parameters);

                return rows > 0
                    ? Ok(ApiResponse<bool>.SuccessResponse(true, "Department permanently deleted"))
                    : NotFound(ApiResponse<bool>.ErrorResponse("Department not found"));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<bool>.ErrorResponse(ex.Message));
            }
        }
    }
}