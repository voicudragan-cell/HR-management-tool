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
  Clock,
  Edit2,
  Camera,
  CheckCircle2,
  Sparkles,
  UserCheck,
  UserPlus
} from 'lucide-react';
import { useHR } from '../context/HRContext';
import { Department, Employee, UserRole } from '../types/hr';
import { EditEmployeeModal } from './EditEmployeeModal';
import { AddEmployeeModal } from './AddEmployeeModal';

export const EmployeesTab: React.FC = () => {
  const {
    activeProfile,
    activeRole,
    employees,
    updateEmployee,
  } = useHR();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDept, setSelectedDept] = useState<string>('all');
  const [inspectEmployee, setInspectEmployee] = useState<Employee | null>(null);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [inlineSaveStatus, setInlineSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');

  // Keep inspectEmployee updated with newest state from context
  const currentInspectEmployee = inspectEmployee
    ? employees.find(e => e.id === inspectEmployee.id) || inspectEmployee
    : null;

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

  const handleInlineUpdate = async (empId: string, updates: Partial<Employee>) => {
    setInlineSaveStatus('saving');
    try {
      await updateEmployee(empId, updates);
      setInlineSaveStatus('saved');
      setTimeout(() => setInlineSaveStatus('idle'), 2000);
    } catch (err) {
      console.error('Inline save error:', err);
      setInlineSaveStatus('idle');
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
            Full workforce roster. Click any employee to view, edit photos, change titles, departments, or compensation with automatic Firestore persistence.
          </p>
        </div>

        <div className="flex items-center space-x-3 self-start sm:self-auto">
          <span className="text-xs font-mono font-semibold text-slate-600 bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200">
            {filteredEmployees.length} of {employees.length} Staff Members
          </span>

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 transition-colors shadow-xs"
          >
            <UserPlus className="h-4 w-4" />
            <span>+ Add Employee</span>
          </button>
        </div>
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
            className="bg-white p-5 rounded-xl border border-slate-200 hover:border-indigo-300 hover:shadow-md transition-all flex flex-col justify-between group relative"
          >
            <div>
              <div className="flex items-start justify-between mb-3">
                <div className="relative group/avatar">
                  <img
                    src={emp.avatarUrl}
                    alt={emp.name}
                    className="h-12 w-12 rounded-full object-cover ring-2 ring-slate-100 group-hover:ring-indigo-200 transition-all"
                  />
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setEditingEmployee(emp);
                      setIsEditModalOpen(true);
                    }}
                    className="absolute -bottom-1 -right-1 p-1 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs opacity-0 group-hover/avatar:opacity-100 transition-opacity"
                    title="Change picture"
                  >
                    <Camera className="h-3 w-3" />
                  </button>
                </div>

                <div className="flex items-center space-x-1.5">
                  {getRoleBadge(emp.role)}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setEditingEmployee(emp);
                      setIsEditModalOpen(true);
                    }}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                    title="Edit profile & function"
                  >
                    <Edit2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>

              <div
                onClick={() => setInspectEmployee(emp)}
                className="cursor-pointer"
              >
                <div className="flex items-center space-x-2">
                  <h3 className="text-sm font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                    {emp.name}
                  </h3>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${
                    emp.status === 'onboarding'
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-emerald-100 text-emerald-800'
                  }`}>
                    {emp.status}
                  </span>
                </div>
                <p className="text-xs text-slate-600 font-semibold mt-0.5">{emp.jobTitle}</p>
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
                  {emp.directReportName && (
                    <div className="flex items-center space-x-1.5 text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md font-medium text-[10px] border border-indigo-100 truncate">
                      <UserCheck className="h-3 w-3 text-indigo-600 shrink-0" />
                      <span className="truncate">Direct Report: <strong className="text-indigo-900">{emp.directReportName}</strong></span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
              <button
                onClick={() => {
                  setEditingEmployee(emp);
                  setIsEditModalOpen(true);
                }}
                className="text-slate-600 hover:text-indigo-600 font-medium inline-flex items-center space-x-1"
              >
                <Edit2 className="h-3 w-3" />
                <span>Edit Fields</span>
              </button>

              <button
                onClick={() => setInspectEmployee(emp)}
                className="text-indigo-600 font-semibold inline-flex items-center space-x-1 group-hover:translate-x-0.5 transition-transform"
              >
                <span>View Dossier</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Employee Dossier Drawer Modal with Live Editable Fields */}
      {currentInspectEmployee && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto">
            
            {/* Header */}
            <div className="flex items-start justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center space-x-3.5">
                <div className="relative group">
                  <img
                    src={currentInspectEmployee.avatarUrl}
                    alt={currentInspectEmployee.name}
                    className="h-16 w-16 rounded-full object-cover ring-2 ring-indigo-200 shadow-md"
                  />
                  <button
                    onClick={() => {
                      setEditingEmployee(currentInspectEmployee);
                      setIsEditModalOpen(true);
                    }}
                    className="absolute -bottom-1 -right-1 p-1 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white shadow-md transition-colors"
                    title="Change picture"
                  >
                    <Camera className="h-3.5 w-3.5" />
                  </button>
                </div>

                <div>
                  <div className="flex items-center space-x-2">
                    <h2 className="text-lg font-bold text-slate-900">{currentInspectEmployee.name}</h2>
                    {getRoleBadge(currentInspectEmployee.role)}
                  </div>
                  <p className="text-xs text-slate-600 font-semibold mt-0.5">
                    {currentInspectEmployee.jobTitle}
                  </p>
                  <p className="text-[11px] text-slate-400">
                    {currentInspectEmployee.department} &bull; {currentInspectEmployee.level}
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-1">
                <button
                  onClick={() => {
                    setEditingEmployee(currentInspectEmployee);
                    setIsEditModalOpen(true);
                  }}
                  className="inline-flex items-center space-x-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 transition-colors"
                >
                  <Edit2 className="h-3.5 w-3.5" />
                  <span>Edit Profile</span>
                </button>

                <button
                  onClick={() => setInspectEmployee(null)}
                  className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Quick In-Place Editable Fields with Instant Auto-Save */}
            <div className="mt-4 space-y-4">
              
              {inlineSaveStatus === 'saving' && (
                <div className="p-2 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-800 flex items-center space-x-2 animate-pulse">
                  <span className="h-2 w-2 rounded-full bg-amber-500 animate-ping" />
                  <span>Saving changes to Firestore database automatically...</span>
                </div>
              )}
              {inlineSaveStatus === 'saved' && (
                <div className="p-2 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-800 flex items-center space-x-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                  <span>All changes saved automatically in Firestore!</span>
                </div>
              )}

              {/* Department & Function In-Place Selectors */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs bg-slate-50/70 p-3.5 rounded-xl border border-slate-200">
                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-500 tracking-wider mb-1">
                    Department (Auto-saved)
                  </label>
                  <select
                    value={currentInspectEmployee.department}
                    onChange={(e) => handleInlineUpdate(currentInspectEmployee.id, { department: e.target.value as Department })}
                    className="w-full text-xs font-semibold bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="Engineering">Engineering</option>
                    <option value="Product & Design">Product & Design</option>
                    <option value="People & HR">People & HR</option>
                    <option value="Sales & Marketing">Sales & Marketing</option>
                    <option value="Finance & Operations">Finance & Operations</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-500 tracking-wider mb-1">
                    Seniority Level (Auto-saved)
                  </label>
                  <select
                    value={currentInspectEmployee.level}
                    onChange={(e) => handleInlineUpdate(currentInspectEmployee.id, { level: e.target.value })}
                    className="w-full text-xs font-semibold bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="L1 - Associate">L1 - Associate</option>
                    <option value="L2 - Specialist">L2 - Specialist</option>
                    <option value="L3 - Senior">L3 - Senior</option>
                    <option value="L4 - Staff/Lead">L4 - Staff/Lead</option>
                    <option value="L5 - Director">L5 - Director</option>
                  </select>
                </div>
              </div>

              {/* General Employment Details */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 bg-white rounded-xl border border-slate-200">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Hire Date</span>
                  <span className="font-mono font-semibold text-slate-800">{currentInspectEmployee.hireDate}</span>
                </div>
                <div className="p-3 bg-white rounded-xl border border-slate-200">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Office Location</span>
                  <span className="font-semibold text-slate-800">{currentInspectEmployee.location}</span>
                </div>
                <div className="p-3 bg-white rounded-xl border border-slate-200">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Phone</span>
                  <span className="font-mono text-slate-800">{currentInspectEmployee.phone || 'N/A'}</span>
                </div>
                <div className="p-3 bg-white rounded-xl border border-slate-200">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Reports To</span>
                  <span className="font-semibold text-slate-800">{currentInspectEmployee.managerName || 'Board of Directors'}</span>
                </div>
              </div>

              {/* Direct Report Field (Dossier) */}
              <div className="p-3.5 bg-indigo-50/70 border border-indigo-200 rounded-xl space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase font-bold text-indigo-950 tracking-wider flex items-center space-x-1">
                    <UserCheck className="h-3.5 w-3.5 text-indigo-600" />
                    <span>Designated Direct Report (Auto-attached to all phases)</span>
                  </span>
                  <span className="text-[10px] font-semibold text-indigo-700 bg-white px-2 py-0.5 rounded-full border border-indigo-200 shadow-2xs">
                    Live Auto-Saved
                  </span>
                </div>
                <div className="flex flex-col sm:flex-row items-center gap-2 pt-1">
                  <input
                    type="text"
                    placeholder="Assign direct report full name..."
                    value={currentInspectEmployee.directReportName || ''}
                    onChange={(e) => handleInlineUpdate(currentInspectEmployee.id, { directReportName: e.target.value })}
                    className="flex-1 w-full text-xs font-semibold px-2.5 py-1.5 rounded-lg border border-indigo-200 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  {employees.length > 1 && (
                    <select
                      onChange={(e) => {
                        if (e.target.value) handleInlineUpdate(currentInspectEmployee.id, { directReportName: e.target.value });
                      }}
                      defaultValue=""
                      className="w-full sm:w-auto text-xs px-2 py-1.5 border border-indigo-200 rounded-lg bg-white text-indigo-800 font-medium focus:outline-none"
                    >
                      <option value="" disabled>Pick from roster...</option>
                      {employees
                        .filter(e => e.id !== currentInspectEmployee.id)
                        .map(e => (
                          <option key={e.id} value={e.name}>
                            {e.name}
                          </option>
                        ))}
                    </select>
                  )}
                </div>
                <p className="text-[10px] text-slate-500">
                  Automatically attached to this employee's evaluations, promotion proposals, leave requests, and payroll records.
                </p>
              </div>

              {/* Salary details: ONLY visible to Admin or the employee themselves */}
              {(activeRole === 'admin' || activeProfile.id === currentInspectEmployee.id) && (
                <div className="p-3.5 bg-emerald-50/70 border border-emerald-200 rounded-xl flex items-center justify-between text-xs">
                  <div className="flex items-center space-x-2">
                    <DollarSign className="h-4 w-4 text-emerald-600" />
                    <div>
                      <span className="font-bold text-emerald-950 block">Annual Compensation</span>
                      <span className="text-[10px] text-emerald-800">RBAC Secured: Confidential Executive Access</span>
                    </div>
                  </div>
                  <span className="text-base font-extrabold font-mono text-emerald-700">
                    ${currentInspectEmployee.salary.toLocaleString()} / yr
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
                      {currentInspectEmployee.leaveBalance.annual - currentInspectEmployee.leaveBalance.annualUsed}d
                    </span>
                  </div>
                  <div className="p-2 bg-slate-50 rounded-lg">
                    <span className="text-[10px] text-slate-400 block uppercase">Sick</span>
                    <span className="font-mono font-bold text-slate-800">
                      {currentInspectEmployee.leaveBalance.sick - currentInspectEmployee.leaveBalance.sickUsed}d
                    </span>
                  </div>
                  <div className="p-2 bg-slate-50 rounded-lg">
                    <span className="text-[10px] text-slate-400 block uppercase">Remote YTD</span>
                    <span className="font-mono font-bold text-slate-800">
                      {currentInspectEmployee.leaveBalance.remoteUsed}d
                    </span>
                  </div>
                </div>
              </div>

            </div>

            <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between">
              <button
                onClick={() => {
                  setEditingEmployee(currentInspectEmployee);
                  setIsEditModalOpen(true);
                }}
                className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 transition-colors"
              >
                <Edit2 className="h-3.5 w-3.5" />
                <span>Full Edit Form</span>
              </button>

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

      {/* Edit Employee Modal */}
      <EditEmployeeModal
        employee={editingEmployee}
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setEditingEmployee(null);
        }}
      />

      {/* Add Employee Modal */}
      <AddEmployeeModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
      />
    </div>
  );
};
