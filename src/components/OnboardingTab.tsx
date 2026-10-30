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
  X,
  Edit2,
  FileText,
  Lock,
  Unlock,
  FolderCog,
  Paperclip,
  Check,
  AlertTriangle
} from 'lucide-react';
import { useHR } from '../context/HRContext';
import { Department, OnboardingTask, TaskDocument, UserRole } from '../types/hr';
import { EditEmployeeModal } from './EditEmployeeModal';
import { CategoryManagerModal } from './CategoryManagerModal';
import { DocumentComprehensionModal } from './DocumentComprehensionModal';

export const OnboardingTab: React.FC = () => {
  const {
    activeProfile,
    activeRole,
    employees,
    onboardingCategories,
    onboardingTasks,
    addEmployee,
    addOnboardingTask,
    updateOnboardingTask,
    updateOnboardingTaskStatus,
    confirmTaskComprehension,
  } = useHR();

  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string>(
    employees.find(e => e.status === 'onboarding')?.id || employees[0]?.id || ''
  );
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  
  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditEmpOpen, setIsEditEmpOpen] = useState(false);
  const [isCategoryManagerOpen, setIsCategoryManagerOpen] = useState(false);
  const [isAddTaskModalOpen, setIsAddTaskModalOpen] = useState(false);

  // Document Comprehension Reader state
  const [readingDoc, setReadingDoc] = useState<{ doc: TaskDocument; taskId: string } | null>(null);
  const [comprehensionWarning, setComprehensionWarning] = useState<string | null>(null);

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

  // New Task form state
  const [newTaskForm, setNewTaskForm] = useState({
    title: '',
    categoryId: onboardingCategories[0]?.id || '',
    dueDate: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
    assignedTo: 'People & HR',
    notes: '',
  });

  const selectedEmployee = employees.find(e => e.id === selectedEmployeeId) || employees[0];
  const empTasks = onboardingTasks.filter(t => t.employeeId === selectedEmployee?.id);

  const filteredTasks = categoryFilter === 'all'
    ? empTasks
    : empTasks.filter(t => t.category === categoryFilter || t.categoryId === categoryFilter);

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

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskForm.title.trim() || !selectedEmployee) return;

    const targetCat = onboardingCategories.find(c => c.id === newTaskForm.categoryId) || onboardingCategories[0];

    await addOnboardingTask({
      employeeId: selectedEmployee.id,
      employeeName: selectedEmployee.name,
      department: selectedEmployee.department,
      title: newTaskForm.title.trim(),
      category: targetCat ? targetCat.name : 'General',
      categoryId: targetCat ? targetCat.id : undefined,
      status: 'pending',
      dueDate: newTaskForm.dueDate,
      assignedTo: newTaskForm.assignedTo,
      notes: newTaskForm.notes.trim() || undefined,
      documents: targetCat?.attachedDocuments ? [...targetCat.attachedDocuments] : [],
      requiresComprehension: (targetCat?.attachedDocuments && targetCat.attachedDocuments.length > 0) || false,
      comprehensionConfirmed: false,
    });

    setNewTaskForm({
      title: '',
      categoryId: onboardingCategories[0]?.id || '',
      dueDate: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
      assignedTo: 'People & HR',
      notes: '',
    });
    setIsAddTaskModalOpen(false);
  };

  const handleTaskStatusToggle = async (task: OnboardingTask) => {
    if (task.status === 'completed') {
      // Toggle back to pending
      await updateOnboardingTaskStatus(task.id, 'pending');
      return;
    }

    // Check if task has attached documents requiring comprehension confirmation
    if (task.requiresComprehension && !task.comprehensionConfirmed) {
      const pendingDoc = task.documents?.find(d => d.requiredComprehension && !d.comprehensionConfirmed);
      if (pendingDoc) {
        setComprehensionWarning(`Comprehension required: "${pendingDoc.title}" must be read and confirmed before completing this milestone.`);
        setReadingDoc({ doc: pendingDoc, taskId: task.id });
        return;
      }
    }

    // Otherwise mark completed
    try {
      await updateOnboardingTaskStatus(task.id, 'completed');
      setComprehensionWarning(null);
    } catch (err: any) {
      setComprehensionWarning(err.message || 'Cannot mark task completed.');
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
            Dynamic customizable categories, required policy document reading with comprehension sign-offs, and progress tracking.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
          {/* Manage Categories Button */}
          <button
            onClick={() => setIsCategoryManagerOpen(true)}
            className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-semibold text-slate-700 border border-slate-300 transition-colors shadow-xs"
            title="Add or edit onboarding categories and attached policy documents"
          >
            <FolderCog className="h-4 w-4 text-indigo-600" />
            <span>Manage Categories & Documents</span>
          </button>

          {(activeRole === 'admin' || activeRole === 'manager') && (
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-xs font-semibold text-white shadow-xs transition-colors"
            >
              <Plus className="h-4 w-4" />
              <span>Onboard New Hire</span>
            </button>
          )}
        </div>
      </div>

      {/* Comprehension Alert Warning Banner */}
      {comprehensionWarning && (
        <div className="p-4 bg-amber-50 border border-amber-300 rounded-xl flex items-center justify-between text-xs text-amber-900 animate-in fade-in">
          <div className="flex items-center space-x-2.5">
            <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0" />
            <span>{comprehensionWarning}</span>
          </div>
          <button
            onClick={() => setComprehensionWarning(null)}
            className="text-amber-700 hover:text-amber-900 font-bold ml-2"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Main Content Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Team Directory / Onboarding Members */}
        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Staff Members ({employees.length})
              </h2>
              {employees.length === 1 && (
                <span className="text-[10px] text-emerald-600 font-semibold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  Blank Start Active
                </span>
              )}
            </div>

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
                      <div className="flex items-center space-x-2 mt-1.5">
                        <button
                          onClick={() => setIsEditEmpOpen(true)}
                          className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-lg text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 transition-colors"
                        >
                          <Edit2 className="h-3 w-3" />
                          <span>Edit Profile (Photo, Name, Function)</span>
                        </button>
                      </div>
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

                {/* Dynamic Categories Filter Bar */}
                <div className="flex flex-wrap items-center gap-1.5 mt-5 pt-4 border-t border-slate-100">
                  <span className="text-xs text-slate-400 font-medium mr-1 flex items-center">
                    <Filter className="h-3.5 w-3.5 mr-1" /> Category:
                  </span>
                  
                  <button
                    onClick={() => setCategoryFilter('all')}
                    className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${
                      categoryFilter === 'all'
                        ? 'bg-slate-900 text-white font-semibold'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    All Categories ({empTasks.length})
                  </button>

                  {onboardingCategories.map(cat => {
                    const count = empTasks.filter(t => t.category === cat.name || t.categoryId === cat.id).length;
                    const isSelected = categoryFilter === cat.name || categoryFilter === cat.id;

                    return (
                      <button
                        key={cat.id}
                        onClick={() => setCategoryFilter(cat.name)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors flex items-center space-x-1.5 ${
                          isSelected
                            ? 'bg-indigo-600 text-white font-semibold'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        <span className={`h-2 w-2 rounded-full ${
                          cat.color === 'blue' ? 'bg-blue-400' :
                          cat.color === 'purple' ? 'bg-purple-400' :
                          cat.color === 'emerald' ? 'bg-emerald-400' :
                          cat.color === 'amber' ? 'bg-amber-400' :
                          cat.color === 'rose' ? 'bg-rose-400' : 'bg-indigo-400'
                        }`} />
                        <span>{cat.name}</span>
                        <span className="text-[10px] opacity-75 font-mono">({count})</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Tasks Checklist */}
              <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">
                      Onboarding Milestones ({filteredTasks.length})
                    </h3>
                    <p className="text-xs text-slate-400">
                      Tasks with attached documents require employee comprehension confirmation before completion.
                    </p>
                  </div>

                  <button
                    onClick={() => setIsAddTaskModalOpen(true)}
                    className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-lg text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 transition-colors"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    <span>Add Task</span>
                  </button>
                </div>

                {filteredTasks.length === 0 ? (
                  <div className="py-10 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200">
                    <CheckCircle2 className="h-8 w-8 text-slate-300 mx-auto mb-2" />
                    <p className="text-xs font-semibold text-slate-700">No onboarding tasks in this category.</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">Click "Add Task" to assign a milestone to {selectedEmployee.name}.</p>
                    <button
                      onClick={() => setIsAddTaskModalOpen(true)}
                      className="mt-3 px-3 py-1.5 rounded-lg text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 transition-colors shadow-xs"
                    >
                      + Create First Task
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {filteredTasks.map(task => {
                      const isDone = task.status === 'completed';
                      const hasDocuments = task.documents && task.documents.length > 0;
                      const hasRequiredComprehension = task.requiresComprehension;
                      const isComprehensionConfirmed = task.comprehensionConfirmed;

                      return (
                        <div
                          key={task.id}
                          className={`p-4 rounded-xl border transition-all ${
                            isDone
                              ? 'bg-slate-50/60 border-slate-200 opacity-90'
                              : 'bg-white border-slate-200 hover:border-slate-300 shadow-xs'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex items-start space-x-3">
                              {/* Gated Completion Checkbox */}
                              <button
                                onClick={() => handleTaskStatusToggle(task)}
                                className={`mt-0.5 h-6 w-6 rounded-full flex items-center justify-center transition-all shrink-0 ${
                                  isDone
                                    ? 'bg-emerald-600 text-white shadow-xs'
                                    : hasRequiredComprehension && !isComprehensionConfirmed
                                    ? 'border-2 border-amber-400 bg-amber-50 text-amber-600 hover:bg-amber-100'
                                    : 'border-2 border-slate-300 hover:border-indigo-600'
                                }`}
                                title={
                                  isDone
                                    ? 'Mark incomplete'
                                    : hasRequiredComprehension && !isComprehensionConfirmed
                                    ? 'Gated: Document comprehension confirmation required before completing'
                                    : 'Mark completed'
                                }
                              >
                                {isDone && <CheckCircle2 className="h-4 w-4" />}
                                {!isDone && hasRequiredComprehension && !isComprehensionConfirmed && (
                                  <Lock className="h-3 w-3" />
                                )}
                              </button>

                              <div>
                                <div className="flex items-center space-x-2">
                                  <span className={`text-xs font-bold ${isDone ? 'line-through text-slate-400' : 'text-slate-900'}`}>
                                    {task.title}
                                  </span>
                                </div>

                                <div className="flex flex-wrap items-center gap-2 mt-1.5 text-[11px] text-slate-500">
                                  <span className="inline-flex items-center px-2 py-0.5 rounded font-semibold bg-slate-100 text-slate-700">
                                    {task.category}
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

                            <div className="shrink-0 text-right">
                              <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full uppercase ${
                                isDone
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : 'bg-amber-100 text-amber-800'
                              }`}>
                                {task.status.replace('_', ' ')}
                              </span>
                            </div>
                          </div>

                          {/* Attached Documents & Comprehension Section */}
                          {hasDocuments && (
                            <div className="mt-3 pt-3 border-t border-slate-100 space-y-2">
                              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider flex items-center space-x-1">
                                <Paperclip className="h-3 w-3" />
                                <span>Attached Reading Documents & Policy Approvals</span>
                              </span>

                              <div className="space-y-1.5">
                                {task.documents?.map(docItem => (
                                  <div
                                    key={docItem.id}
                                    className="p-2.5 bg-slate-50 rounded-lg border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                                  >
                                    <div className="flex items-center space-x-2 truncate">
                                      <FileText className="h-4 w-4 text-indigo-600 shrink-0" />
                                      <div className="truncate">
                                        <span className="text-xs font-semibold text-slate-800 truncate block">
                                          {docItem.title}
                                        </span>
                                        <span className="text-[10px] text-slate-400 block truncate">
                                          {docItem.fileName || 'policy_document.pdf'}
                                        </span>
                                      </div>
                                    </div>

                                    <div className="flex items-center space-x-2 shrink-0">
                                      {docItem.comprehensionConfirmed ? (
                                        <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-100 text-emerald-800">
                                          <Check className="h-3 w-3" />
                                          <span>Comprehension Signed</span>
                                        </span>
                                      ) : (
                                        <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800">
                                          <Lock className="h-3 w-3" />
                                          <span>Confirmation Required</span>
                                        </span>
                                      )}

                                      <button
                                        onClick={() => setReadingDoc({ doc: docItem, taskId: task.id })}
                                        className="px-2.5 py-1 rounded text-xs font-semibold text-indigo-700 bg-white hover:bg-indigo-50 border border-indigo-200 transition-colors shadow-xs"
                                      >
                                        {docItem.comprehensionConfirmed ? 'Review Document' : 'Open & Sign Document'}
                                      </button>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

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

      {/* Modal: Add New Task */}
      {isAddTaskModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center space-x-2">
                <div className="p-2 rounded-lg bg-indigo-100 text-indigo-700">
                  <Plus className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Add Onboarding Milestone</h3>
                  <p className="text-xs text-slate-500">Assign to {selectedEmployee?.name}</p>
                </div>
              </div>
              <button
                onClick={() => setIsAddTaskModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreateTask} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Task Title
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Complete Security & Data Privacy Training"
                  value={newTaskForm.title}
                  onChange={(e) => setNewTaskForm({ ...newTaskForm, title: e.target.value })}
                  className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {/* Dynamic Category Selector */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                    Onboarding Category (Selectable Dropdown)
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setIsAddTaskModalOpen(false);
                      setIsCategoryManagerOpen(true);
                    }}
                    className="text-[11px] text-indigo-600 hover:underline font-medium"
                  >
                    + Manage Categories
                  </button>
                </div>
                <select
                  value={newTaskForm.categoryId}
                  onChange={(e) => setNewTaskForm({ ...newTaskForm, categoryId: e.target.value })}
                  className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 font-semibold text-slate-900 bg-white"
                >
                  {onboardingCategories.map(cat => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name} ({cat.attachedDocuments?.length || 0} document(s))
                    </option>
                  ))}
                </select>
                <p className="text-[10px] text-slate-400 mt-1">
                  Selected category documents will be automatically inherited and require comprehension sign-off.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Due Date
                  </label>
                  <input
                    type="date"
                    required
                    value={newTaskForm.dueDate}
                    onChange={(e) => setNewTaskForm({ ...newTaskForm, dueDate: e.target.value })}
                    className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Assigned To
                  </label>
                  <input
                    type="text"
                    value={newTaskForm.assignedTo}
                    onChange={(e) => setNewTaskForm({ ...newTaskForm, assignedTo: e.target.value })}
                    className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Notes / Instructions (Optional)
                </label>
                <textarea
                  rows={2}
                  placeholder="Additional context or links..."
                  value={newTaskForm.notes}
                  onChange={(e) => setNewTaskForm({ ...newTaskForm, notes: e.target.value })}
                  className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="flex items-center justify-end space-x-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddTaskModalOpen(false)}
                  className="px-4 py-2 rounded-lg text-xs font-medium text-slate-700 hover:bg-slate-100 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 shadow-xs transition-colors"
                >
                  Create & Inherit Documents
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

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

      {/* Edit Employee Modal */}
      <EditEmployeeModal
        employee={selectedEmployee}
        isOpen={isEditEmpOpen}
        onClose={() => setIsEditEmpOpen(false)}
      />

      {/* Category Manager Modal */}
      <CategoryManagerModal
        isOpen={isCategoryManagerOpen}
        onClose={() => setIsCategoryManagerOpen(false)}
      />

      {/* Document Comprehension Reader Modal */}
      <DocumentComprehensionModal
        document={readingDoc?.doc || null}
        taskId={readingDoc?.taskId}
        isOpen={!!readingDoc}
        onClose={() => setReadingDoc(null)}
        onConfirmComprehension={confirmTaskComprehension}
        employeeName={selectedEmployee?.name || activeProfile.name}
      />

    </div>
  );
};
