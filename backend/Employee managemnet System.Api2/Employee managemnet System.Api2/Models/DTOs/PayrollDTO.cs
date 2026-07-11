namespace EmployeeManagement.API.Models.DTOs
{
    public class PayrollDTO
    {
        public int PayrollID { get; set; }
        public int EmployeeID { get; set; }
        public string EmployeeName { get; set; }
        public string FirstName { get; set; }
        public string LastName { get; set; }
        public string DepartmentName { get; set; }
        public decimal BasicSalary { get; set; }
        public decimal Bonus { get; set; }
        public decimal Deductions { get; set; }
        public decimal NetSalary { get; set; }
        public DateTime PaymentMonth { get; set; }
        public string PaymentStatus { get; set; }
    }
}