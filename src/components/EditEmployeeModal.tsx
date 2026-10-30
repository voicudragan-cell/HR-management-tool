import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Camera,
  Upload,
  CheckCircle2,
  DollarSign,
  Briefcase,
  Building,
  User,
  Shield,
  Phone,
  Mail,
  MapPin,
  Sparkles,
  UserCheck,
  Image as ImageIcon
} from 'lucide-react';
import { useHR } from '../context/HRContext';
import { Department, Employee, UserRole } from '../types/hr';

export const AVATAR_PRESETS = [
  { label: 'Executive Woman', url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=256&q=80' },
  { label: 'Professional Man', url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80' },
  { label: 'Tech Lead Man', url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=256&q=80' },
  { label: 'Senior Engineer Woman', url: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=256&q=80' },
  { label: 'Cloud Engineer Man', url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=256&q=80' },
  { label: 'Product Designer Woman', url: 'https://images.unsplash.com/photo-1534751516642-a171ed28a0e5?auto=format&fit=crop&w=256&q=80' },
  { label: 'Finance Director Man', url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=256&q=80' },
  { label: 'Operations Lead Woman', url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=256&q=80' },
  { label: 'Architect Man', url: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=256&q=80' },
  { label: 'HR Partner Woman', url: 'https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?auto=format&fit=crop&w=256&q=80' },
  { label: 'Platform Engineer Man', url: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=256&q=80' },
  { label: 'Marketing Strategist Woman', url: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=256&q=80' },
];

interface EditEmployeeModalProps {
  employee: Employee | null;
  isOpen: boolean;
  onClose: () => void;
}

export const EditEmployeeModal: React.FC<EditEmployeeModalProps> = ({
  employee,
  isOpen,
  onClose,
}) => {
  const { updateEmployee, employees } = useHR();

  const [formData, setFormData] = useState<Partial<Employee>>({});
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
  const [lastSavedTime, setLastSavedTime] = useState<string>('');
  const [showAvatarPresets, setShowAvatarPresets] = useState(false);
  const [customAvatarUrl, setCustomAvatarUrl] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync state whenever selected employee changes
  useEffect(() => {
    if (employee) {
      setFormData({
        name: employee.name,
        jobTitle: employee.jobTitle,
        department: employee.department,
        role: employee.role,
        level: employee.level,
        status: employee.status,
        avatarUrl: employee.avatarUrl,
        salary: employee.salary,
        email: employee.email,
        phone: employee.phone || '',
        location: employee.location || '',
        directReportName: employee.directReportName || '',
      });
      setCustomAvatarUrl(employee.avatarUrl || '');
    }
  }, [employee]);

  if (!isOpen || !employee) return null;

  // Auto-save field update helper
  const handleFieldChange = async (field: keyof Employee, value: any) => {
    const updated = { ...formData, [field]: value };
    setFormData(updated);
    setSaveStatus('saving');

    try {
      await updateEmployee(employee.id, { [field]: value });
      setSaveStatus('saved');
      setLastSavedTime(new Date().toLocaleTimeString());
      setTimeout(() => setSaveStatus('idle'), 2500);
    } catch (err) {
      console.error('Auto-save error:', err);
      setSaveStatus('idle');
    }
  };

  // Image Upload handler (resizes image to safe dimensions < 120KB for Firestore)
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 300;
        const MAX_HEIGHT = 300;
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
        ctx?.drawImage(img, 0, 0, width, height);

        const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
        handleFieldChange('avatarUrl', dataUrl);
        setCustomAvatarUrl(dataUrl);
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 max-h-[92vh] flex flex-col">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="text-base font-bold text-slate-900">
                Edit Employee Profile & Information
              </h3>
              {saveStatus === 'saving' && (
                <span className="inline-flex items-center space-x-1 text-[11px] text-amber-600 font-medium">
                  <span className="h-2 w-2 rounded-full bg-amber-500 animate-ping" />
                  <span>Saving...</span>
                </span>
              )}
              {saveStatus === 'saved' && (
                <span className="inline-flex items-center space-x-1 text-[11px] text-emerald-600 font-semibold animate-in fade-in">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                  <span>Saved to Firestore ({lastSavedTime})</span>
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Change name, photo, function, department, and compensation. All edits auto-save immediately.
            </p>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <div className="flex-1 overflow-y-auto py-4 space-y-5 pr-1">
          
          {/* Avatar / Picture Section */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
              Profile Picture / Avatar
            </label>

            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
              <div className="relative group shrink-0">
                <img
                  src={formData.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80'}
                  alt={formData.name || 'Avatar'}
                  className="h-20 w-20 rounded-full object-cover ring-4 ring-white shadow-md"
                />
                <button
                  type="button"
                  onClick={() => setShowAvatarPresets(!showAvatarPresets)}
                  className="absolute bottom-0 right-0 p-1.5 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white shadow-md transition-colors"
                  title="Choose from preset gallery or upload"
                >
                  <Camera className="h-3.5 w-3.5" />
                </button>
              </div>

              <div className="flex-1 space-y-2">
                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={() => setShowAvatarPresets(!showAvatarPresets)}
                    className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-white border border-slate-300 text-slate-700 hover:bg-slate-100 transition-colors shadow-xs"
                  >
                    <Sparkles className="h-3.5 w-3.5 text-indigo-600" />
                    <span>{showAvatarPresets ? 'Hide Gallery' : 'Select from Photo Gallery'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-indigo-50 border border-indigo-200 text-indigo-700 hover:bg-indigo-100 transition-colors shadow-xs"
                  >
                    <Upload className="h-3.5 w-3.5" />
                    <span>Upload Picture</span>
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
                    type="text"
                    placeholder="Or paste any custom image URL..."
                    value={customAvatarUrl}
                    onChange={(e) => setCustomAvatarUrl(e.target.value)}
                    onBlur={() => {
                      if (customAvatarUrl && customAvatarUrl !== formData.avatarUrl) {
                        handleFieldChange('avatarUrl', customAvatarUrl);
                      }
                    }}
                    className="flex-1 text-xs px-3 py-1.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (customAvatarUrl) handleFieldChange('avatarUrl', customAvatarUrl);
                    }}
                    className="px-3 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs"
                  >
                    Apply URL
                  </button>
                </div>
              </div>
            </div>

            {/* Presets Gallery Drawer */}
            {showAvatarPresets && (
              <div className="mt-4 pt-3 border-t border-slate-200">
                <span className="text-[11px] font-semibold text-slate-500 block mb-2">
                  Choose a preset portrait:
                </span>
                <div className="grid grid-cols-6 gap-2">
                  {AVATAR_PRESETS.map((preset, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        handleFieldChange('avatarUrl', preset.url);
                        setCustomAvatarUrl(preset.url);
                        setShowAvatarPresets(false);
                      }}
                      className="group relative rounded-full overflow-hidden focus:outline-none ring-2 ring-transparent hover:ring-indigo-500 transition-all"
                      title={preset.label}
                    >
                      <img
                        src={preset.url}
                        alt={preset.label}
                        className="h-11 w-11 rounded-full object-cover group-hover:scale-110 transition-transform"
                      />
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Full Name & Job Title (Function) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1 flex items-center space-x-1">
                <User className="h-3.5 w-3.5 text-indigo-600" />
                <span>Full Name</span>
              </label>
              <input
                type="text"
                value={formData.name || ''}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                onBlur={(e) => handleFieldChange('name', e.target.value)}
                placeholder="e.g. Elena Rostova"
                className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 font-semibold text-slate-900 bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1 flex items-center space-x-1">
                <Briefcase className="h-3.5 w-3.5 text-indigo-600" />
                <span>Function / Job Title</span>
              </label>
              <input
                type="text"
                value={formData.jobTitle || ''}
                onChange={(e) => setFormData({ ...formData, jobTitle: e.target.value })}
                onBlur={(e) => handleFieldChange('jobTitle', e.target.value)}
                placeholder="e.g. Senior Frontend Architect"
                className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 font-semibold text-slate-900 bg-white"
              />
            </div>
          </div>

          {/* Department & Seniority Level */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1 flex items-center space-x-1">
                <Building className="h-3.5 w-3.5 text-indigo-600" />
                <span>Department</span>
              </label>
              <select
                value={formData.department || 'Engineering'}
                onChange={(e) => handleFieldChange('department', e.target.value as Department)}
                className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 font-semibold text-slate-900 bg-white"
              >
                <option value="Engineering">Engineering</option>
                <option value="Product & Design">Product & Design</option>
                <option value="People & HR">People & HR</option>
                <option value="Sales & Marketing">Sales & Marketing</option>
                <option value="Finance & Operations">Finance & Operations</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Seniority Level
              </label>
              <select
                value={formData.level || 'L3 - Senior'}
                onChange={(e) => handleFieldChange('level', e.target.value)}
                className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 font-semibold text-slate-900 bg-white"
              >
                <option value="L1 - Associate">L1 - Associate</option>
                <option value="L2 - Specialist">L2 - Specialist</option>
                <option value="L3 - Senior">L3 - Senior</option>
                <option value="L4 - Staff/Lead">L4 - Staff/Lead</option>
                <option value="L5 - Director">L5 - Director</option>
              </select>
            </div>
          </div>

          {/* Role & Employment Status */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1 flex items-center space-x-1">
                <Shield className="h-3.5 w-3.5 text-indigo-600" />
                <span>System Role / Permissions</span>
              </label>
              <select
                value={formData.role || 'employee'}
                onChange={(e) => handleFieldChange('role', e.target.value as UserRole)}
                className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 font-semibold text-slate-900 bg-white"
              >
                <option value="employee">Employee (Self-service)</option>
                <option value="manager">Department Manager (Team Approvals)</option>
                <option value="admin">Administrator (Global Access)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Employment Status
              </label>
              <select
                value={formData.status || 'active'}
                onChange={(e) => handleFieldChange('status', e.target.value as Employee['status'])}
                className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 font-semibold text-slate-900 bg-white"
              >
                <option value="active">Active Staff</option>
                <option value="onboarding">In Onboarding</option>
                <option value="probation">Probationary Period</option>
                <option value="offboarding">Offboarding</option>
              </select>
            </div>
          </div>

          {/* Base Annual Salary */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1 flex items-center space-x-1">
              <DollarSign className="h-3.5 w-3.5 text-emerald-600" />
              <span>Annual Base Salary ($ USD)</span>
            </label>
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-slate-400 font-mono text-xs">$</span>
              <input
                type="number"
                step="1000"
                min="30000"
                value={formData.salary || 0}
                onChange={(e) => setFormData({ ...formData, salary: Number(e.target.value) })}
                onBlur={(e) => handleFieldChange('salary', Number(e.target.value))}
                className="w-full text-xs pl-7 pr-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono font-bold text-slate-900 bg-white"
              />
            </div>
          </div>

          {/* Contact Details */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1 flex items-center space-x-1">
                <Mail className="h-3.5 w-3.5 text-slate-400" />
                <span>Email</span>
              </label>
              <input
                type="email"
                value={formData.email || ''}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                onBlur={(e) => handleFieldChange('email', e.target.value)}
                className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1 flex items-center space-x-1">
                <Phone className="h-3.5 w-3.5 text-slate-400" />
                <span>Phone</span>
              </label>
              <input
                type="text"
                value={formData.phone || ''}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                onBlur={(e) => handleFieldChange('phone', e.target.value)}
                placeholder="+1 (555) 000-0000"
                className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1 flex items-center space-x-1">
                <MapPin className="h-3.5 w-3.5 text-slate-400" />
                <span>Office Location</span>
              </label>
              <input
                type="text"
                value={formData.location || ''}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                onBlur={(e) => handleFieldChange('location', e.target.value)}
                placeholder="City, State"
                className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
              />
            </div>
          </div>

          {/* Direct Report Name (Personal Dossier Field) */}
          <div className="bg-indigo-50/70 p-4 rounded-xl border border-indigo-200/80 space-y-2.5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
              <label className="text-xs font-bold uppercase tracking-wider text-indigo-950 flex items-center space-x-1.5">
                <UserCheck className="h-4 w-4 text-indigo-600" />
                <span>Direct Report Name (Assigned Report)</span>
              </label>
              <span className="inline-flex items-center text-[10px] font-semibold text-indigo-700 bg-indigo-100/90 px-2 py-0.5 rounded-full border border-indigo-200">
                Auto-attached to all phases
              </span>
            </div>
            <p className="text-[11px] text-slate-600 leading-snug">
              This direct report is automatically attached to and notified during every phase: <strong>performance evaluation</strong>, <strong>promotion proposal</strong>, <strong>time-off request</strong>, and <strong>payroll confirmation</strong>.
            </p>

            <div className="flex flex-col sm:flex-row items-center gap-2 pt-1">
              <div className="relative flex-1 w-full">
                <input
                  type="text"
                  placeholder="Enter direct report full name (e.g. Alex Rivera)..."
                  value={formData.directReportName || ''}
                  onChange={(e) => setFormData({ ...formData, directReportName: e.target.value })}
                  onBlur={(e) => handleFieldChange('directReportName', e.target.value)}
                  className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 font-semibold text-slate-900 bg-white"
                />
              </div>

              {employees.length > 1 && (
                <div className="w-full sm:w-auto shrink-0">
                  <select
                    onChange={(e) => {
                      if (e.target.value) {
                        setFormData({ ...formData, directReportName: e.target.value });
                        handleFieldChange('directReportName', e.target.value);
                      }
                    }}
                    defaultValue=""
                    className="w-full text-xs px-2.5 py-2 border border-indigo-200 rounded-lg bg-white text-indigo-800 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="" disabled>Select from staff roster...</option>
                    {employees
                      .filter(e => e.id !== employee.id)
                      .map(e => (
                        <option key={e.id} value={e.name}>
                          {e.name} ({e.jobTitle})
                        </option>
                      ))}
                  </select>
                </div>
              )}
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
          <div className="flex items-center space-x-1.5 text-xs text-slate-500">
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
            <span>Changes are saved automatically to Firestore.</span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 transition-colors shadow-xs"
          >
            Done
          </button>
        </div>

      </div>
    </div>
  );
};
