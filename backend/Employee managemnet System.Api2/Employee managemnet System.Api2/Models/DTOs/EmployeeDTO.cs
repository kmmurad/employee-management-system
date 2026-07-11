namespace EmployeeManagement.API.Models.DTOs
{
    public class EmployeeDTO
    {
        public int EmployeeID { get; set; }
        public string FullName { get; set; }
        public string FirstName { get; set; }
        public string LastName { get; set; }
        public string Gender { get; set; }
        public string Email { get; set; }
        public string Phone { get; set; }

        // THESE WERE MISSING (your errors)
        public string Address { get; set; }
        public DateTime HireDate { get; set; }
        public decimal Salary { get; set; }

        public int DepartmentID { get; set; }
        public string DepartmentName { get; set; }

        public string Status { get; set; }
    }
}