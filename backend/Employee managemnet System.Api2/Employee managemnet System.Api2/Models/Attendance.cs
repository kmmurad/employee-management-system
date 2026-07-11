namespace EmployeeManagement.API.Models
{
    public class Attendance
    {
        public int AttendanceID { get; set; }
        public int EmployeeID { get; set; }  // 🔥 Must match database column name
        public DateTime AttendanceDate { get; set; }
        public string Status { get; set; } // Present, Absent, Leave, Late
        public string? Remarks { get; set; }
    }
}