namespace EmployeeManagement.API.Models.DTOs
{
    public class DashboardDTO
    {
        public int TotalEmployees { get; set; }
        public int TotalDepartments { get; set; }
        public int TodayPresent { get; set; }
        public int TodayAbsent { get; set; }
        public decimal MonthlyPayroll { get; set; }
    }
}