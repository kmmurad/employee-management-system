namespace EmployeeManagement.API.Models.DTOs
{
    public class AttendanceDTO
    {
        public int EmployeeID { get; set; }
        public int? AttendanceID { get; set; }
        public string EmployeeName { get; set; }
        public string FirstName { get; set; }
        public string LastName { get; set; }
        public string DepartmentName { get; set; }
        public DateTime AttendanceDate { get; set; }
        public string Status { get; set; }
        public string? Remarks { get; set; }
    }
}