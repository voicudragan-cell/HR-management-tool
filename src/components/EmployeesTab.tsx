import React, { useState } from 'react';
import {
  Users,
  Search,
  Filter,
  Mail,
  Phone,
  MapPin,
  Calendar,
  DollarSign,
  Shield,
  ArrowRight,
  X,
  Award,
  Clock
} from 'lucide-react';
import { useHR } from '../context/HRContext';
import { Department, Employee, UserRole } from '../types/hr';

export const EmployeesTab: React.FC = () => {
  const {
    activeProfile,
    activeRole,
    employees,
    leaveRequests,
    performanceReviews,
  } = useHR();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDept, setSelectedDept] = useState<string>('all');
  const [inspectEmployee, setInspectEmployee] = useState<Employee | null>(null);

  const filteredEmployees = employees.filter(emp => {
    const matchesSearch =
      emp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      emp.jobTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      emp.email.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesDept = selectedDept === 'all' || emp.department === selectedDept;

    return matchesSearch && matchesDept;
  });

  const getRoleBadge = (role: UserRole) => {
    switch (role) {
      case 'admin':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-100 text-indigo-800 uppercase">Admin</span>;
      case 'manager':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 uppercase">Manager</span>;
      default:
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700 uppercase">Employee</span>;
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center space-x-2">
            <Users className="h-5 w-5 text-indigo-600" />
            <span>Employee Directory & Organization</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Complete staff roster, organizational departments, reporting hierarchies, and profile data.
          </p>
        </div>

        <span className="text-xs font-mono font-semibold text-slate-600 bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200 self-start sm:self-auto">
          {filteredEmployees.length} of {employees.length} Staff Members
        </span>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by name, title, or email..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div className="flex items-center space-x-2 w-full sm:w-auto">
          <Filter className="h-4 w-4 text-slate-400 shrink-0" />
          <select
            value={selectedDept}
            onChange={e => setSelectedDept(e.target.value)}
            className="w-full sm:w-auto text-xs bg-white border border-slate-300 text-slate-800 rounded-lg px-2.5 py-1.5 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="all">All Departments</option>
            <option value="Engineering">Engineering</option>
            <option value="Product & Design">Product & Design</option>
            <option value="People & HR">People & HR</option>
            <option value="Sales & Marketing">Sales & Marketing</option>
            <option value="Finance & Operations">Finance & Operations</option>
          </select>
        </div>
      </div>

      {/* Directory Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredEmployees.map(emp => (
          <div
            key={emp.id}
            onClick={() => setInspectEmployee(emp)}
            className="bg-white p-5 rounded-xl border border-slate-200 hover:border-indigo-300 hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between mb-3">
                <img
                  src={emp.avatarUrl}
                  alt={emp.name}
                  className="h-12 w-12 rounded-full object-cover ring-2 ring-slate-100 group-hover:ring-indigo-200 transition-all"
                />
                <div className="flex flex-col items-end space-y-1">
                  {getRoleBadge(emp.role)}
                  <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${
                    emp.status === 'onboarding'
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-emerald-100 text-emerald-800'
                  }`}>
                    {emp.status}
                  </span>
                </div>
              </div>

              <h3 className="text-sm font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                {emp.name}
              </h3>
              <p className="text-xs text-slate-600 font-medium">{emp.jobTitle}</p>
              <p className="text-[11px] text-slate-400 mt-0.5">{emp.department} &bull; {emp.level}</p>

              <div className="mt-4 pt-3 border-t border-slate-100 space-y-1.5 text-[11px] text-slate-500">
                <div className="flex items-center space-x-2 truncate">
                  <Mail className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                  <span className="truncate">{emp.email}</span>
                </div>
                <div className="flex items-center space-x-2 truncate">
                  <MapPin className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                  <span className="truncate">{emp.location}</span>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-indigo-600 font-semibold">
              <span>View Employee Dossier</span>
              <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        ))}
      </div>

      {/* Employee Dossier Drawer Modal */}
      {inspectEmployee && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto">
            
            {/* Header */}
            <div className="flex items-start justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center space-x-3.5">
                <img
                  src={inspectEmployee.avatarUrl}
                  alt={inspectEmployee.name}
                  className="h-14 w-14 rounded-full object-cover ring-2 ring-indigo-200"
                />
                <div>
                  <div className="flex items-center space-x-2">
                    <h2 className="text-lg font-bold text-slate-900">{inspectEmployee.name}</h2>
                    {getRoleBadge(inspectEmployee.role)}
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {inspectEmployee.jobTitle} &bull; {inspectEmployee.department}
                  </p>
                  <span className="text-[11px] text-slate-400 font-mono">
                    ID: {inspectEmployee.id}
                  </span>
                </div>
              </div>

              <button
                onClick={() => setInspectEmployee(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Employment Details */}
            <div className="mt-4 space-y-4">
              
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Seniority Level</span>
                  <span className="font-bold text-slate-800">{inspectEmployee.level}</span>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Hire Date</span>
                  <span className="font-mono font-semibold text-slate-800">{inspectEmployee.hireDate}</span>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Office Location</span>
                  <span className="font-semibold text-slate-800">{inspectEmployee.location}</span>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Reports To</span>
                  <span className="font-semibold text-slate-800">{inspectEmployee.managerName || 'Board of Directors'}</span>
                </div>
              </div>

              {/* Salary details: ONLY visible to Admin or the employee themselves */}
              {(activeRole === 'admin' || activeProfile.id === inspectEmployee.id) && (
                <div className="p-3.5 bg-emerald-50/70 border border-emerald-200 rounded-xl flex items-center justify-between text-xs">
                  <div className="flex items-center space-x-2">
                    <DollarSign className="h-4 w-4 text-emerald-600" />
                    <div>
                      <span className="font-bold text-emerald-950 block">Annual Compensation</span>
                      <span className="text-[10px] text-emerald-800">RBAC Secured: Confidential Executive Access</span>
                    </div>
                  </div>
                  <span className="text-base font-extrabold font-mono text-emerald-700">
                    ${inspectEmployee.salary.toLocaleString()} / yr
                  </span>
                </div>
              )}

              {/* Leave Balances Breakdown */}
              <div className="border border-slate-200 rounded-xl p-3.5 space-y-2">
                <span className="text-xs font-bold text-slate-900 block">Current PTO & Leave Balances</span>
                <div className="grid grid-cols-3 gap-2 text-center text-xs">
                  <div className="p-2 bg-slate-50 rounded-lg">
                    <span className="text-[10px] text-slate-400 block uppercase">Annual</span>
                    <span className="font-mono font-bold text-slate-800">
                      {inspectEmployee.leaveBalance.annual - inspectEmployee.leaveBalance.annualUsed}d
                    </span>
                  </div>
                  <div className="p-2 bg-slate-50 rounded-lg">
                    <span className="text-[10px] text-slate-400 block uppercase">Sick</span>
                    <span className="font-mono font-bold text-slate-800">
                      {inspectEmployee.leaveBalance.sick - inspectEmployee.leaveBalance.sickUsed}d
                    </span>
                  </div>
                  <div className="p-2 bg-slate-50 rounded-lg">
                    <span className="text-[10px] text-slate-400 block uppercase">Remote YTD</span>
                    <span className="font-mono font-bold text-slate-800">
                      {inspectEmployee.leaveBalance.remoteUsed}d
                    </span>
                  </div>
                </div>
              </div>

            </div>

            <div className="mt-5 pt-4 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setInspectEmployee(null)}
                className="px-4 py-2 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-100 border border-slate-200 transition-colors"
              >
                Close Dossier
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
