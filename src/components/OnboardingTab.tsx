import React, { useState } from 'react';
import {
  UserCheck,
  Plus,
  CheckCircle2,
  Clock,
  Laptop,
  FileCheck,
  ShieldCheck,
  Users2,
  Calendar,
  AlertCircle,
  Filter,
  X
} from 'lucide-react';
import { useHR } from '../context/HRContext';
import { Department, OnboardingTask, UserRole } from '../types/hr';

export const OnboardingTab: React.FC = () => {
  const {
    activeRole,
    employees,
    onboardingTasks,
    addEmployee,
    addOnboardingTask,
    updateOnboardingTaskStatus,
  } = useHR();

  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string>(
    employees.find(e => e.status === 'onboarding')?.id || employees[0]?.id || ''
  );
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // New employee form state
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    department: 'Engineering' as Department,
    jobTitle: '',
    role: 'employee' as UserRole,
    level: 'L2 - Specialist',
    salary: 95000,
    location: 'San Francisco, CA',
    avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=256&q=80',
    hireDate: new Date().toISOString().split('T')[0],
  });

  const selectedEmployee = employees.find(e => e.id === selectedEmployeeId) || employees[0];
  const empTasks = onboardingTasks.filter(t => t.employeeId === selectedEmployee?.id);

  const filteredTasks = categoryFilter === 'all'
    ? empTasks
    : empTasks.filter(t => t.category === categoryFilter);

  const completedCount = empTasks.filter(t => t.status === 'completed').length;
  const progressPercent = empTasks.length > 0 ? Math.round((completedCount / empTasks.length) * 100) : 0;

  const handleCreateEmployee = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.jobTitle) return;

    const newId = await addEmployee({
      ...formData,
      status: 'onboarding',
      leaveBalance: {
        annual: 20,
        annualUsed: 0,
        sick: 10,
        sickUsed: 0,
        personal: 5,
        personalUsed: 0,
        remoteUsed: 0,
      },
    });

    setSelectedEmployeeId(newId);
    setIsAddModalOpen(false);
  };

  const getCategoryIcon = (category: OnboardingTask['category']) => {
    switch (category) {
      case 'documentation':
        return <FileCheck className="h-4 w-4 text-blue-600" />;
      case 'it_setup':
        return <Laptop className="h-4 w-4 text-purple-600" />;
      case 'compliance':
        return <ShieldCheck className="h-4 w-4 text-emerald-600" />;
      case 'meet_team':
        return <Users2 className="h-4 w-4 text-amber-600" />;
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center space-x-2">
            <UserCheck className="h-5 w-5 text-indigo-600" />
            <span>New Hire Onboarding Hub</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Structured roadmap guiding new recruits through documentation, hardware provisioning, and team integration.
          </p>
        </div>

        {(activeRole === 'admin' || activeRole === 'manager') && (
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="inline-flex items-center space-x-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-xs font-semibold text-white shadow-xs transition-colors self-start sm:self-auto"
          >
            <Plus className="h-4 w-4" />
            <span>Onboard New Hire</span>
          </button>
        )}
      </div>

      {/* Main Content Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: New Hires List */}
        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
              Team Members in Onboarding & Directory
            </h2>

            <div className="space-y-2 max-h-[600px] overflow-y-auto">
              {employees.map(emp => {
                const isSelected = emp.id === selectedEmployee?.id;
                const empT = onboardingTasks.filter(t => t.employeeId === emp.id);
                const comp = empT.filter(t => t.status === 'completed').length;
                const pct = empT.length > 0 ? Math.round((comp / empT.length) * 100) : 0;

                return (
                  <button
                    key={emp.id}
                    onClick={() => setSelectedEmployeeId(emp.id)}
                    className={`w-full text-left p-3 rounded-xl border transition-all ${
                      isSelected
                        ? 'border-indigo-600 bg-indigo-50/50 shadow-xs'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <img
                        src={emp.avatarUrl}
                        alt={emp.name}
                        className="h-10 w-10 rounded-full object-cover ring-1 ring-slate-200 shrink-0"
                      />
                      <div className="truncate flex-1">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-slate-900 truncate">{emp.name}</span>
                          <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${
                            emp.status === 'onboarding'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-emerald-100 text-emerald-800'
                          }`}>
                            {emp.status}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 truncate">{emp.jobTitle}</p>
                        <div className="mt-2 flex items-center justify-between text-[10px] text-slate-500">
                          <span>{comp}/{empT.length} Tasks</span>
                          <span className="font-mono font-semibold text-slate-700">{pct}%</span>
                        </div>
                        <div className="mt-1 w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                          <div
                            className="bg-indigo-600 h-1.5 rounded-full"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column (2 Cols): Onboarding Details & Checklist */}
        <div className="lg:col-span-2 space-y-4">
          {selectedEmployee ? (
            <>
              {/* Employee Header Card */}
              <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center space-x-3.5">
                    <img
                      src={selectedEmployee.avatarUrl}
                      alt={selectedEmployee.name}
                      className="h-14 w-14 rounded-full object-cover ring-2 ring-indigo-100"
                    />
                    <div>
                      <div className="flex items-center space-x-2">
                        <h2 className="text-lg font-bold text-slate-900">{selectedEmployee.name}</h2>
                        <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                          {selectedEmployee.level}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {selectedEmployee.jobTitle} &bull; {selectedEmployee.department}
                      </p>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        Hire Date: {selectedEmployee.hireDate} &bull; Location: {selectedEmployee.location}
                      </p>
                    </div>
                  </div>

                  <div className="bg-slate-50 px-4 py-3 rounded-xl border border-slate-200 text-right sm:min-w-[140px]">
                    <span className="text-[11px] text-slate-500 font-medium uppercase tracking-wider block">
                      Overall Progress
                    </span>
                    <span className="text-2xl font-bold font-mono text-indigo-600">
                      {progressPercent}%
                    </span>
                    <span className="text-[10px] text-slate-400 block mt-0.5">
                      {completedCount} of {empTasks.length} Completed
                    </span>
                  </div>
                </div>

                {/* Categories Filter Bar */}
                <div className="flex flex-wrap items-center gap-1.5 mt-5 pt-4 border-t border-slate-100">
                  <span className="text-xs text-slate-400 font-medium mr-1 flex items-center">
                    <Filter className="h-3.5 w-3.5 mr-1" /> Category:
                  </span>
                  {[
                    { id: 'all', label: 'All Tasks' },
                    { id: 'documentation', label: 'Documentation' },
                    { id: 'it_setup', label: 'IT & Hardware' },
                    { id: 'compliance', label: 'Compliance' },
                    { id: 'meet_team', label: 'Team & Culture' },
                  ].map(cat => (
                    <button
                      key={cat.id}
                      onClick={() => setCategoryFilter(cat.id)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${
                        categoryFilter === cat.id
                          ? 'bg-indigo-600 text-white font-semibold'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Tasks Checklist */}
              <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-bold text-slate-900">
                    Integration Checklist ({filteredTasks.length})
                  </h3>
                  <span className="text-xs text-slate-400">Click circle to toggle status</span>
                </div>

                {filteredTasks.length === 0 ? (
                  <div className="py-8 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200">
                    <CheckCircle2 className="h-6 w-6 text-slate-300 mx-auto mb-1" />
                    <p className="text-xs text-slate-500">No tasks in this category.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {filteredTasks.map(task => {
                      const isDone = task.status === 'completed';
                      const isInProgress = task.status === 'in_progress';

                      return (
                        <div
                          key={task.id}
                          className={`flex items-start justify-between p-3.5 rounded-xl border transition-all ${
                            isDone
                              ? 'bg-slate-50/60 border-slate-200 opacity-90'
                              : 'bg-white border-slate-200 hover:border-slate-300 shadow-xs'
                          }`}
                        >
                          <div className="flex items-start space-x-3">
                            <button
                              onClick={() => {
                                const nextStatus = isDone ? 'pending' : isInProgress ? 'completed' : 'completed';
                                updateOnboardingTaskStatus(task.id, nextStatus);
                              }}
                              className={`mt-0.5 h-5 w-5 rounded-full flex items-center justify-center transition-all ${
                                isDone
                                  ? 'bg-emerald-600 text-white'
                                  : isInProgress
                                  ? 'border-2 border-amber-500 bg-amber-50 text-amber-600'
                                  : 'border-2 border-slate-300 hover:border-indigo-600'
                              }`}
                              title={isDone ? 'Mark as incomplete' : 'Mark as completed'}
                            >
                              {isDone && <CheckCircle2 className="h-3.5 w-3.5" />}
                              {isInProgress && <Clock className="h-3 w-3" />}
                            </button>

                            <div>
                              <div className="flex items-center space-x-2">
                                <span className={`text-xs font-semibold ${isDone ? 'line-through text-slate-400' : 'text-slate-900'}`}>
                                  {task.title}
                                </span>
                              </div>
                              <div className="flex flex-wrap items-center gap-2 mt-1.5 text-[11px] text-slate-500">
                                <span className="inline-flex items-center space-x-1 px-1.5 py-0.5 rounded bg-slate-100 text-slate-700">
                                  {getCategoryIcon(task.category)}
                                  <span className="capitalize">{task.category.replace('_', ' ')}</span>
                                </span>
                                <span>Due: {task.dueDate}</span>
                                <span>&bull; Assigned to: {task.assignedTo}</span>
                              </div>
                              {task.notes && (
                                <p className="text-[11px] text-slate-500 mt-1 italic">
                                  Note: {task.notes}
                                </p>
                              )}
                            </div>
                          </div>

                          <div className="shrink-0 ml-3">
                            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full uppercase ${
                              isDone
                                ? 'bg-emerald-100 text-emerald-800'
                                : isInProgress
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-slate-100 text-slate-600'
                            }`}>
                              {task.status.replace('_', ' ')}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="p-8 text-center bg-white rounded-xl border border-slate-200">
              <p className="text-sm text-slate-500">Select an employee from the list to view their onboarding checklist.</p>
            </div>
          )}
        </div>

      </div>

      {/* Modal: Onboard New Hire */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center space-x-2">
                <div className="p-2 rounded-lg bg-indigo-100 text-indigo-700">
                  <UserCheck className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Onboard New Team Member</h3>
                  <p className="text-xs text-slate-500">Creates profile and provisions onboarding checklist</p>
                </div>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreateEmployee} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Jordan Hayes"
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Corporate Email
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="jordan.hayes@nexushr.corp"
                    value={formData.email}
                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Department
                  </label>
                  <select
                    value={formData.department}
                    onChange={e => setFormData({ ...formData, department: e.target.value as Department })}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="Engineering">Engineering</option>
                    <option value="Product & Design">Product & Design</option>
                    <option value="People & HR">People & HR</option>
                    <option value="Sales & Marketing">Sales & Marketing</option>
                    <option value="Finance & Operations">Finance & Operations</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Job Title
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Fullstack Engineer"
                    value={formData.jobTitle}
                    onChange={e => setFormData({ ...formData, jobTitle: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Career Level
                  </label>
                  <select
                    value={formData.level}
                    onChange={e => setFormData({ ...formData, level: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="L1 - Associate">L1 - Associate</option>
                    <option value="L2 - Specialist">L2 - Specialist</option>
                    <option value="L3 - Senior">L3 - Senior</option>
                    <option value="L4 - Staff/Lead">L4 - Staff/Lead</option>
                    <option value="L5 - Director">L5 - Director</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Annual Base Salary ($)
                  </label>
                  <input
                    type="number"
                    min="40000"
                    step="5000"
                    value={formData.salary}
                    onChange={e => setFormData({ ...formData, salary: Number(e.target.value) })}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    System Role / Access
                  </label>
                  <select
                    value={formData.role}
                    onChange={e => setFormData({ ...formData, role: e.target.value as UserRole })}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="employee">Employee</option>
                    <option value="manager">Department Manager</option>
                    <option value="admin">Administrator</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Location / Office
                </label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={e => setFormData({ ...formData, location: e.target.value })}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="flex items-center justify-end space-x-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-lg text-xs font-medium text-slate-700 hover:bg-slate-100 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 shadow-xs transition-colors"
                >
                  Confirm & Initialize Onboarding
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
