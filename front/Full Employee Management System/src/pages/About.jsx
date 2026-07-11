// ============================================================
// ABOUT PAGE
// Displays information about the Employee Management System
// ============================================================

import { FaUsers, FaBuilding, FaCalendarCheck, FaMoneyBillWave } from 'react-icons/fa';
import Card from '../components/common/Card';

export default function About() {
  
  // ============================================================
  // SYSTEM FEATURES
  // The main modules of the application
  // ============================================================
  const modules = [
    { 
      icon: FaUsers, 
      label: 'Employee Management', 
      description: 'Add, view, edit, and delete employee records' 
    },
    { 
      icon: FaBuilding, 
      label: 'Department Management', 
      description: 'Organize employees by department' 
    },
    { 
      icon: FaCalendarCheck, 
      label: 'Attendance Tracking', 
      description: 'Mark daily attendance for employees' 
    },
    { 
      icon: FaMoneyBillWave, 
      label: 'Payroll System', 
      description: 'Calculate and manage employee salaries' 
    },
  ];

  // ============================================================
  // TECHNOLOGIES USED
  // The tools and frameworks used to build this application
  // ============================================================
  const technologies = [
    { name: 'React', emoji: '⚛️' },
    { name: 'Tailwind CSS', emoji: '🎨' },
    { name: 'ASP.NET Core', emoji: '🚀' },
    { name: 'SQL Server', emoji: '🗄️' },
    { name: 'JWT Authentication', emoji: '🔐' },
  ];

  // ============================================================
  // RENDER ABOUT PAGE
  // ============================================================
  return (
    <div>
      
      {/* PAGE HEADER */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800">About</h1>
        <p className="text-slate-500 mt-1">Learn more about this application</p>
      </div>

      <div className="space-y-6">
        
        {/* SECTION 1: APPLICATION OVERVIEW */}
        <Card>
          <div className="text-center py-4">
            
            {/* Logo */}
            <div className="w-20 h-20 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-blue-100">
              <span className="text-white font-bold text-2xl">EMS</span>
            </div>
            
            {/* Title */}
            <h2 className="text-2xl font-bold text-slate-800">Employee Management System</h2>
            
            {/* Description */}
            <p className="text-slate-500 mt-2 max-w-2xl mx-auto">
              A complete web application for managing employees, departments, 
              attendance, and payroll with a clean, modern interface.
            </p>
          </div>
        </Card>

        {/* SECTION 2: KEY FEATURES */}
        <Card title="Key Features">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {modules.map((module, index) => (
              <div 
                key={index} 
                className="flex items-start gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors"
              >
                {/* Icon */}
                <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center flex-shrink-0">
                  <module.icon className="text-blue-600 text-lg" />
                </div>
                
                {/* Text */}
                <div>
                  <h4 className="font-medium text-slate-800">{module.label}</h4>
                  <p className="text-sm text-slate-500">{module.description}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* SECTION 3: TECHNOLOGIES USED */}
        <Card title="Technologies Used">
          <div className="flex flex-wrap gap-3">
            {technologies.map((tech, index) => (
              <div 
                key={index} 
                className="flex items-center gap-2 px-4 py-2 bg-slate-50 rounded-xl border border-slate-200"
              >
                <span className="text-xl">{tech.emoji}</span>
                <span className="text-sm font-medium text-slate-700">{tech.name}</span>
              </div>
            ))}
          </div>
        </Card>

        {/* SECTION 4: VERSION INFO */}
        <Card title="Version">
          <div className="flex items-center justify-between">
            <span className="text-slate-600">Current Version</span>
            <span className="font-semibold text-slate-800">v1.0.0</span>
          </div>
          <div className="flex items-center justify-between mt-2">
            <span className="text-slate-600">Released</span>
            <span className="text-slate-600">July 2026</span>
          </div>
        </Card>
      </div>
    </div>
  );
}