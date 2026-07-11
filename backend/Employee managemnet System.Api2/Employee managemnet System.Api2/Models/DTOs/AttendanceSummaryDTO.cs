namespace EmployeeManagement.API.Models.DTOs
{
    public class AttendanceSummaryDTO
    {
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        public int TotalEmployees { get; set; }
        public int TotalPresent { get; set; }
        public int TotalAbsent { get; set; }
        public int TotalLeave { get; set; }
        public int TotalLate { get; set; }
        public int TotalDays { get; set; }
        public List<EmployeeAttendanceSummaryDTO> EmployeeSummaries { get; set; }
    }

    public class EmployeeAttendanceSummaryDTO
    {
        public int EmployeeID { get; set; }
        public string EmployeeName { get; set; }
        public string DepartmentName { get; set; }
        public int TotalDays { get; set; }
        public int PresentDays { get; set; }
        public int AbsentDays { get; set; }
        public int LeaveDays { get; set; }
        public int LateDays { get; set; }
        public decimal AttendancePercentage { get; set; }
    }
}