using Microsoft.AspNetCore.Mvc;
using Microsoft.Data.SqlClient;
using Microsoft.IdentityModel.Tokens;
using System.Data;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using EmployeeManagement.API.Data;
using EmployeeManagement.API.Models.DTOs;

namespace EmployeeManagement.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        private readonly DatabaseHelper _dbHelper;
        private readonly IConfiguration _configuration;

        public AuthController(DatabaseHelper dbHelper, IConfiguration configuration)
        {
            _dbHelper = dbHelper;
            _configuration = configuration;
        }

        // ============================================================
        // POST: api/Auth/login
        // Authenticates a user and returns a JWT token
        // ============================================================

        [HttpPost("login")]
        public async Task<ActionResult<ApiResponse<LoginResponse>>> Login([FromBody] LoginRequest request)
        {
            try
            {
                // Step 1: Find the user in the database
                var sql = @"
                    SELECT 
                        u.UserID,
                        u.Username,
                        u.PasswordHash,
                        u.Role,
                        u.EmployeeID,
                        e.FirstName + ' ' + e.LastName AS EmployeeName
                    FROM Users u
                    LEFT JOIN Employees e ON u.EmployeeID = e.EmployeeID
                    WHERE u.Username = @Username AND u.IsActive = 1";

                var parameters = new[]
                {
                    new SqlParameter("@Username", request.Username)
                };

                var dataTable = await _dbHelper.ExecuteQueryAsync(sql, parameters);

                // Step 2: Check if user exists
                if (dataTable.Rows.Count == 0)
                    return Unauthorized(ApiResponse<LoginResponse>.ErrorResponse("Invalid credentials"));

                var row = dataTable.Rows[0];

                // Step 3: Generate JWT token
                var token = GenerateJwtToken(
                    row["UserID"].ToString(),
                    row["Username"].ToString(),
                    row["Role"].ToString()
                );

                // Step 4: Create response object
                var response = new LoginResponse
                {
                    UserID = Convert.ToInt32(row["UserID"]),
                    Username = row["Username"].ToString(),
                    Role = row["Role"].ToString(),
                    Token = token,
                    EmployeeID = row["EmployeeID"] != DBNull.Value ? Convert.ToInt32(row["EmployeeID"]) : 0,
                    EmployeeName = row["EmployeeName"]?.ToString() ?? row["Username"].ToString()
                };

                // Step 5: Update last login time
                await _dbHelper.ExecuteNonQueryAsync(
                    "UPDATE Users SET LastLogin = GETDATE() WHERE UserID = @UserID",
                    new[] { new SqlParameter("@UserID", response.UserID) }
                );

                // Step 6: Return success with token
                return Ok(ApiResponse<LoginResponse>.SuccessResponse(response, "Login successful"));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<LoginResponse>.ErrorResponse(ex.Message));
            }
        }

        // ============================================================
        // Generate JWT Token
        // Creates a secure token for authenticated users
        // ============================================================
        private string GenerateJwtToken(string userId, string username, string role)
        {
            // Get JWT settings from appsettings.json
            var jwt = _configuration.GetSection("Jwt");

            var keyString = jwt["Key"] ?? throw new Exception("JWT Key missing");
            var issuer = jwt["Issuer"] ?? throw new Exception("JWT Issuer missing");
            var audience = jwt["Audience"] ?? throw new Exception("JWT Audience missing");

            var key = Encoding.UTF8.GetBytes(keyString);

            // Create claims (user information)
            var claims = new List<Claim>
            {
                new Claim(ClaimTypes.NameIdentifier, userId),  // User ID
                new Claim(ClaimTypes.Name, username),          // Username
                new Claim(ClaimTypes.Role, role),              // Role
                new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()) // Unique ID
            };

            // Create the token
            var tokenDescriptor = new SecurityTokenDescriptor
            {
                Subject = new ClaimsIdentity(claims),
                Expires = DateTime.UtcNow.AddMinutes(Convert.ToDouble(jwt["ExpiryMinutes"])),
                Issuer = issuer,
                Audience = audience,
                SigningCredentials = new SigningCredentials(
                    new SymmetricSecurityKey(key),
                    SecurityAlgorithms.HmacSha256)
            };

            var handler = new JwtSecurityTokenHandler();
            var token = handler.CreateToken(tokenDescriptor);

            return handler.WriteToken(token);
        }
    }
}