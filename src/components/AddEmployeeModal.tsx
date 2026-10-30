import React, { useState, useRef } from 'react';
import {
  X,
  Camera,
  Upload,
  UserPlus,
  DollarSign,
  Briefcase,
  Building,
  User,
  Shield,
  Phone,
  Mail,
  MapPin,
  Sparkles,
  CheckCircle2,
  UserCheck,
  Image as ImageIcon
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useHR } from '../context/HRContext';
import { Department, Employee, UserRole } from '../types/hr';
import { AVATAR_PRESETS } from './EditEmployeeModal';

interface AddEmployeeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated?: (newEmployeeId: string) => void;
}

const DEPARTMENTS: Department[] = [
  'Engineering',
  'Product & Design',
  'People & HR',
  'Sales & Marketing',
  'Finance & Operations',
];

const SENIORITY_LEVELS = [
  'L1 - Associate',
  'L2 - Specialist',
  'L3 - Senior',
  'L4 - Staff / Lead',
  'L5 - Director / Executive',
];

export const AddEmployeeModal: React.FC<AddEmployeeModalProps> = ({
  isOpen,
  onClose,
  onCreated,
}) => {
  const { addEmployee, setActiveProfileId, employees } = useHR();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  const [department, setDepartment] = useState<Department>('Engineering');
  const [role, setRole] = useState<UserRole>('employee');
  const [level, setLevel] = useState('L3 - Senior');
  const [salary, setSalary] = useState(125000);
  const [location, setLocation] = useState('San Francisco, CA (Hybrid)');
  const [phone, setPhone] = useState('+1 (555) 234-5678');
  const [directReportName, setDirectReportName] = useState('');
  const [avatarUrl, setAvatarUrl] = useState(AVATAR_PRESETS[0].url);
  const [switchToNewPersona, setSwitchToNewPersona] = useState(true);
  const [showAvatarPresets, setShowAvatarPresets] = useState(false);
  const [customAvatarInput, setCustomAvatarInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  // Auto-fill email suggestion when typing name
  const handleNameChange = (val: string) => {
    setName(val);
    if (!email || email.includes('@nexus-hr.internal') || email.includes('@company.com')) {
      const clean = val.toLowerCase().trim().replace(/[^a-z0-9]/g, '.');
      if (clean) {
        setEmail(`${clean}@nexus-hr.internal`);
      }
    }
  };

  // Image Upload handler (resizes image to safe dimensions < 100KB for Firestore)
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 256;
        const MAX_HEIGHT = 256;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.82);
          setAvatarUrl(compressedDataUrl);
          setShowAvatarPresets(false);
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setErrorMessage('Employee name is required.');
      return;
    }
    if (!jobTitle.trim()) {
      setErrorMessage('Job title / function is required.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage('');

    try {
      const newEmpData: Omit<Employee, 'id'> = {
        name: name.trim(),
        email: email.trim() || `${name.toLowerCase().replace(/\s+/g, '.')}@nexus-hr.internal`,
        role,
        department,
        jobTitle: jobTitle.trim(),
        level,
        avatarUrl: avatarUrl || AVATAR_PRESETS[0].url,
        hireDate: new Date().toISOString().split('T')[0],
        status: 'active',
        salary: Number(salary) || 95000,
        location: location.trim() || 'Headquarters',
        phone: phone.trim() || undefined,
        directReportName: directReportName.trim() || undefined,
        leaveBalance: {
          annual: 20,
          annualUsed: 0,
          sick: 10,
          sickUsed: 0,
          personal: 5,
          personalUsed: 0,
          remoteUsed: 0,
        },
        updatedAt: new Date().toISOString(),
      };

      const newId = await addEmployee(newEmpData);

      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.6 },
      });

      if (switchToNewPersona) {
        setActiveProfileId(newId);
      }

      if (onCreated) {
        onCreated(newId);
      }

      onClose();
    } catch (err: any) {
      console.error('Failed to add employee:', err);
      setErrorMessage(err.message || 'Failed to add employee. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div 
        className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden max-h-[92vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-gradient-to-r from-slate-50 via-white to-indigo-50/30 shrink-0">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-xl bg-indigo-600 text-white shadow-xs">
              <UserPlus className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">Add New Employee Persona</h2>
              <p className="text-xs text-slate-500">
                Create a new workforce member with live cloud persistence & RBAC persona switching
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="overflow-y-auto p-6 space-y-6 flex-1">
          {errorMessage && (
            <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">
              {errorMessage}
            </div>
          )}

          {/* Section 1: Avatar & Photo */}
          <div className="p-4 rounded-xl bg-slate-50/70 border border-slate-200/80">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-3">
              1. Profile Picture & Avatar
            </label>
            <div className="flex flex-col sm:flex-row items-center gap-5">
              <div className="relative group shrink-0">
                <img
                  src={avatarUrl}
                  alt="Avatar preview"
                  className="h-20 w-20 rounded-2xl object-cover ring-2 ring-indigo-500/30 shadow-md bg-white"
                />
                <button
                  type="button"
                  onClick={() => setShowAvatarPresets(!showAvatarPresets)}
                  className="absolute -bottom-2 -right-2 p-1.5 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 shadow-md transition-transform hover:scale-105"
                  title="Choose preset or upload"
                >
                  <Camera className="h-3.5 w-3.5" />
                </button>
              </div>

              <div className="flex-1 w-full space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setShowAvatarPresets(!showAvatarPresets)}
                    className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 transition-colors"
                  >
                    <Sparkles className="h-3.5 w-3.5" />
                    <span>{showAvatarPresets ? 'Close Presets' : 'Choose from 12 Presets'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 transition-colors"
                  >
                    <Upload className="h-3.5 w-3.5 text-slate-500" />
                    <span>Upload Photo</span>
                  </button>

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="url"
                    placeholder="Or paste external image URL..."
                    value={customAvatarInput}
                    onChange={(e) => setCustomAvatarInput(e.target.value)}
                    className="flex-1 text-xs px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
                  />
                  {customAvatarInput && (
                    <button
                      type="button"
                      onClick={() => {
                        setAvatarUrl(customAvatarInput);
                        setCustomAvatarInput('');
                      }}
                      className="px-2.5 py-1.5 rounded-lg text-xs font-medium bg-slate-800 text-white hover:bg-slate-900 transition-colors"
                    >
                      Apply
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Presets Grid */}
            {showAvatarPresets && (
              <div className="mt-4 pt-4 border-t border-slate-200">
                <span className="text-[11px] font-semibold text-slate-600 block mb-2">
                  Select a professional persona photo:
                </span>
                <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                  {AVATAR_PRESETS.map((p, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        setAvatarUrl(p.url);
                        setShowAvatarPresets(false);
                      }}
                      className={`group relative p-1 rounded-xl border transition-all text-left ${
                        avatarUrl === p.url
                          ? 'border-indigo-600 ring-2 ring-indigo-200 bg-indigo-50/50'
                          : 'border-slate-200 hover:border-slate-300 bg-white'
                      }`}
                    >
                      <img
                        src={p.url}
                        alt={p.label}
                        className="h-12 w-12 rounded-lg object-cover mx-auto"
                      />
                      <span className="block text-[9px] text-slate-500 truncate text-center mt-1">
                        {p.label}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Section 2: Core Details */}
          <div className="space-y-4">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
              2. Identity & Role Details
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Full Name <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => handleNameChange(e.target.value)}
                    placeholder="e.g. Elena Rostova"
                    className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 bg-white font-medium text-slate-900"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Corporate Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="elena.rostova@nexus-hr.internal"
                    className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 bg-white font-medium text-slate-900"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Job Title / Function <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Briefcase className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    required
                    value={jobTitle}
                    onChange={(e) => setJobTitle(e.target.value)}
                    placeholder="e.g. Senior Frontend Architect"
                    className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 bg-white font-medium text-slate-900"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Department
                </label>
                <div className="relative">
                  <Building className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                  <select
                    value={department}
                    onChange={(e) => setDepartment(e.target.value as Department)}
                    className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 bg-white font-medium text-slate-900"
                  >
                    {DEPARTMENTS.map((dept) => (
                      <option key={dept} value={dept}>
                        {dept}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Section 3: RBAC Role & Seniority */}
          <div className="space-y-3">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
              3. Permissions & System Role
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                {
                  id: 'admin' as UserRole,
                  title: 'Administrator',
                  desc: 'Full company oversight, payroll disburse, compensation edit',
                  badgeColor: 'border-indigo-300 bg-indigo-50/60 text-indigo-900',
                },
                {
                  id: 'manager' as UserRole,
                  title: 'Manager',
                  desc: 'Team approvals, performance evaluations, mobility nominations',
                  badgeColor: 'border-emerald-300 bg-emerald-50/60 text-emerald-900',
                },
                {
                  id: 'employee' as UserRole,
                  title: 'Employee',
                  desc: 'Personal dashboard, task completion, leave submissions',
                  badgeColor: 'border-slate-300 bg-slate-50/80 text-slate-800',
                },
              ].map((r) => {
                const isSelected = role === r.id;
                return (
                  <div
                    key={r.id}
                    onClick={() => setRole(r.id)}
                    className={`cursor-pointer p-3 rounded-xl border transition-all ${
                      isSelected
                        ? `${r.badgeColor} ring-2 ring-indigo-500/20 shadow-xs`
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold">{r.title}</span>
                      {isSelected && <CheckCircle2 className="h-4 w-4 text-indigo-600" />}
                    </div>
                    <p className="text-[11px] text-slate-500 leading-snug">{r.desc}</p>
                  </div>
                );
              })}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Seniority Level
                </label>
                <select
                  value={level}
                  onChange={(e) => setLevel(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 bg-white font-medium text-slate-900"
                >
                  {SENIORITY_LEVELS.map((lvl) => (
                    <option key={lvl} value={lvl}>
                      {lvl}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Annual Base Salary (USD)
                </label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                  <input
                    type="number"
                    min="30000"
                    step="1000"
                    value={salary}
                    onChange={(e) => setSalary(Number(e.target.value))}
                    className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 bg-white font-medium text-slate-900"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Section 4: Location & Contact */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Work Location
              </label>
              <div className="relative">
                <MapPin className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g. San Francisco, CA (Hybrid)"
                  className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 bg-white font-medium text-slate-900"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Phone Number
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+1 (555) 000-0000"
                  className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 bg-white font-medium text-slate-900"
                />
              </div>
            </div>
          </div>

          {/* Direct Report Name (Dossier Field) */}
          <div className="p-4 rounded-xl bg-indigo-50/70 border border-indigo-200/80 space-y-2">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
              <label className="text-xs font-bold uppercase tracking-wider text-indigo-950 flex items-center space-x-1.5">
                <UserCheck className="h-4 w-4 text-indigo-600" />
                <span>Direct Report Name (Assigned Report)</span>
              </label>
              <span className="text-[10px] font-semibold text-indigo-700 bg-indigo-100/90 px-2 py-0.5 rounded-full border border-indigo-200">
                Auto-attached to all phases
              </span>
            </div>
            <p className="text-[11px] text-slate-600">
              Assigned direct report is automatically attached to performance reviews, promotion proposals, leave requests, and payroll confirmations.
            </p>
            <div className="flex flex-col sm:flex-row items-center gap-2 pt-1">
              <div className="relative flex-1 w-full">
                <input
                  type="text"
                  value={directReportName}
                  onChange={(e) => setDirectReportName(e.target.value)}
                  placeholder="Enter direct report full name (e.g. Alex Rivera)..."
                  className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-indigo-500 font-semibold text-slate-900 bg-white"
                />
              </div>
              {employees.length > 0 && (
                <div className="w-full sm:w-auto shrink-0">
                  <select
                    onChange={(e) => {
                      if (e.target.value) setDirectReportName(e.target.value);
                    }}
                    defaultValue=""
                    className="w-full text-xs px-2.5 py-2 border border-indigo-200 rounded-lg bg-white text-indigo-800 font-medium focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="" disabled>Select from staff roster...</option>
                    {employees.map(e => (
                      <option key={e.id} value={e.name}>
                        {e.name} ({e.jobTitle})
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          </div>

          {/* Persona Switch Toggle */}
          <div className="p-3 rounded-xl bg-indigo-50/70 border border-indigo-100 flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-indigo-950 block">
                Set as Active Persona immediately
              </span>
              <span className="text-[11px] text-indigo-700">
                Instantly tests the app from this new employee's viewpoint and role permissions.
              </span>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={switchToNewPersona}
                onChange={(e) => setSwitchToNewPersona(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-10 h-5 bg-slate-300 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-600"></div>
            </label>
          </div>
        </form>

        {/* Footer Actions */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-200 bg-slate-50 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-700 hover:text-slate-900 hover:bg-slate-200/60 rounded-lg transition-colors"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting || !name.trim() || !jobTitle.trim()}
            className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-indigo-200 transition-all active:scale-95"
          >
            <UserPlus className="h-4 w-4" />
            <span>{isSubmitting ? 'Saving to Database...' : 'Add Employee & Save'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
