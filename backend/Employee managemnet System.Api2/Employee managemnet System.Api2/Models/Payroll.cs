namespace EmployeeManagement.API.Models
{
    public class Payroll
    {
        public int PayrollID { get; set; }
        public int EmployeeID { get; set; }
        public decimal BasicSalary { get; set; }
        public decimal Bonus { get; set; }
        public decimal Deductions { get; set; }
        // NetSalary is COMPUTED in database - DO NOT include here
        public DateTime PaymentMonth { get; set; }
        public string PaymentStatus { get; set; } = "Pending";
    }
}