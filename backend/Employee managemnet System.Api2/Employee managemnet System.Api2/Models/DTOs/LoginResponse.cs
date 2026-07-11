namespace EmployeeManagement.API.Models.DTOs
{
    public class LoginResponse
    {
        public int UserID { get; set; }
        public string Username { get; set; }
        public string Role { get; set; }
        public string Token { get; set; }
        public int EmployeeID { get; set; }

        // FIX: missing property
        public string EmployeeName { get; set; }
    }
}