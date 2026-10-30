import React, { useState } from 'react';
import {
  Users,
  Bell,
  ShieldCheck,
  UserCheck,
  Briefcase,
  ChevronDown,
  LogOut,
  LogIn,
  CheckCircle2,
  Calendar,
  DollarSign,
  TrendingUp,
  FileText,
  Activity,
  Layers,
  Sparkles,
  Menu,
  X,
  Edit2,
  UserPlus
} from 'lucide-react';
import { useHR } from '../context/HRContext';
import { UserRole } from '../types/hr';
import { EditEmployeeModal } from './EditEmployeeModal';
import { AddEmployeeModal } from './AddEmployeeModal';

interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenNotifications: () => void;
  onOpenReportModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  onOpenNotifications,
  onOpenReportModal,
}) => {
  const {
    activeProfile,
    allProfiles,
    setActiveProfileId,
    activeRole,
    notifications,
    firebaseUser,
    signInWithGoogle,
    logOut,
    isOnline,
  } = useHR();

  const [isPersonaMenuOpen, setIsPersonaMenuOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const unreadCount = notifications.filter(n => !n.read).length;

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Activity, roles: ['admin', 'manager', 'employee'] },
    { id: 'onboarding', label: 'Onboarding', icon: UserCheck, roles: ['admin', 'manager', 'employee'] },
    { id: 'performance', label: 'Performance', icon: TrendingUp, roles: ['admin', 'manager', 'employee'] },
    { id: 'leave', label: 'Leave & Time-Off', icon: Calendar, roles: ['admin', 'manager', 'employee'] },
    { id: 'payroll', label: 'Payroll', icon: DollarSign, roles: ['admin', 'manager', 'employee'] },
    { id: 'mobility', label: 'Mobility & Career', icon: Sparkles, roles: ['admin', 'manager', 'employee'] },
    { id: 'employees', label: 'Directory', icon: Users, roles: ['admin', 'manager', 'employee'] },
  ];

  const getRoleBadge = (role: UserRole) => {
    switch (role) {
      case 'admin':
        return <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-indigo-100 text-indigo-800 border border-indigo-200">Admin</span>;
      case 'manager':
        return <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">Manager</span>;
      default:
        return <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200">Employee</span>;
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-xs">
      {/* Top Banner / Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo & Brand */}
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-700 to-violet-600 flex items-center justify-center text-white shadow-md shadow-indigo-200">
              <Layers className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xl font-bold tracking-tight text-slate-900 font-sans">
                  Nexus<span className="text-indigo-600">HR</span>
                </span>
                <span className="hidden sm:inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-medium bg-slate-100 text-slate-600 border border-slate-200">
                  Cloud RBAC
                </span>
              </div>
              <p className="hidden md:block text-[11px] text-slate-500 font-medium">People &bull; Performance &bull; Progression</p>
            </div>
          </div>

          {/* Center Actions: Live Cloud Sync & Reports */}
          <div className="hidden lg:flex items-center space-x-3">
            <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-50 border border-slate-200 text-slate-600">
              <span className={`h-2 w-2 rounded-full ${isOnline ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
              <span>{isOnline ? 'Firestore Live Sync' : 'Offline Cached'}</span>
            </div>
            
            <button
              onClick={onOpenReportModal}
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors"
            >
              <FileText className="h-3.5 w-3.5 text-slate-500" />
              <span>Executive Reports</span>
            </button>
          </div>

          {/* Right Controls: Notifications, Role Switcher, Auth */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            
            {/* Notification Bell */}
            <button
              onClick={onOpenNotifications}
              className="relative p-2 rounded-lg text-slate-600 hover:text-indigo-600 hover:bg-slate-100 transition-colors"
              title="Automated notifications & pending approvals"
            >
              <Bell className="h-5 w-5" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white ring-2 ring-white">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>

            {/* Role & Persona Switcher */}
            <div className="relative">
              <button
                onClick={() => setIsPersonaMenuOpen(!isPersonaMenuOpen)}
                className="flex items-center space-x-2 px-2.5 py-1.5 rounded-lg border border-slate-200 hover:border-indigo-300 bg-white hover:bg-slate-50 text-left transition-all"
              >
                <img
                  src={activeProfile.avatarUrl}
                  alt={activeProfile.name}
                  className="h-7 w-7 rounded-full object-cover ring-1 ring-slate-200"
                />
                <div className="hidden sm:block text-left">
                  <div className="flex items-center space-x-1.5">
                    <span className="text-xs font-semibold text-slate-900 max-w-[110px] truncate">
                      {activeProfile.name}
                    </span>
                    {getRoleBadge(activeRole)}
                  </div>
                  <span className="text-[10px] text-slate-500 block truncate max-w-[130px]">
                    {activeProfile.department}
                  </span>
                </div>
                <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
              </button>

              {/* Persona Switcher Dropdown */}
              {isPersonaMenuOpen && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setIsPersonaMenuOpen(false)}
                  />
                  <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-slate-200 p-2 z-50 animate-in fade-in zoom-in-95 duration-100">
                    <div className="px-3 py-2 border-b border-slate-100 mb-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                          Active Persona & Permissions
                        </span>
                        <span className="text-[11px] text-indigo-600 font-medium">
                          Quick Switch
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5 mb-2.5">
                        Test and verify role-based access control (Admin, Manager, Employee).
                      </p>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            setIsAddModalOpen(true);
                            setIsPersonaMenuOpen(false);
                          }}
                          className="flex-1 flex items-center justify-center space-x-1.5 py-1.5 px-2.5 rounded-lg text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 transition-colors shadow-xs"
                          title="Add a new employee to roster and switch to them"
                        >
                          <UserPlus className="h-3.5 w-3.5" />
                          <span>+ Add Employee</span>
                        </button>

                        <button
                          onClick={() => {
                            setIsEditModalOpen(true);
                            setIsPersonaMenuOpen(false);
                          }}
                          className="flex-1 flex items-center justify-center space-x-1.5 py-1.5 px-2.5 rounded-lg text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200 transition-colors"
                          title="Edit active profile details"
                        >
                          <Edit2 className="h-3.5 w-3.5 text-slate-500" />
                          <span>Edit Active</span>
                        </button>
                      </div>
                    </div>

                    <div className="max-h-64 overflow-y-auto space-y-1">
                      {allProfiles.map((p) => {
                        const isSelected = p.id === activeProfile.id;
                        return (
                          <button
                            key={p.id}
                            onClick={() => {
                              setActiveProfileId(p.id);
                              setIsPersonaMenuOpen(false);
                            }}
                            className={`w-full flex items-center justify-between p-2 rounded-lg text-left transition-colors ${
                              isSelected
                                ? 'bg-indigo-50 border border-indigo-200 text-indigo-900'
                                : 'hover:bg-slate-50 text-slate-700'
                            }`}
                          >
                            <div className="flex items-center space-x-2.5 truncate">
                              <img
                                src={p.avatarUrl}
                                alt={p.name}
                                className="h-7 w-7 rounded-full object-cover shrink-0"
                              />
                              <div className="truncate">
                                <div className="text-xs font-semibold truncate flex items-center space-x-1.5">
                                  <span>{p.name}</span>
                                  {isSelected && <CheckCircle2 className="h-3 w-3 text-indigo-600" />}
                                </div>
                                <div className="text-[10px] text-slate-500 truncate">
                                  {p.jobTitle} &bull; {p.department}
                                </div>
                              </div>
                            </div>
                            <div className="shrink-0 ml-2">
                              {getRoleBadge(p.role)}
                            </div>
                          </button>
                        );
                      })}

                      {/* Add Employee Row in List */}
                      <button
                        onClick={() => {
                          setIsAddModalOpen(true);
                          setIsPersonaMenuOpen(false);
                        }}
                        className="w-full flex items-center justify-center space-x-2 p-2 mt-1 rounded-lg border border-dashed border-indigo-300 bg-indigo-50/50 hover:bg-indigo-50 text-indigo-700 text-xs font-semibold transition-all group"
                      >
                        <UserPlus className="h-3.5 w-3.5 text-indigo-600 group-hover:scale-110 transition-transform" />
                        <span>+ Add New Persona / Employee</span>
                      </button>
                    </div>

                    {/* Google Auth Option */}
                    <div className="mt-2 pt-2 border-t border-slate-100">
                      {firebaseUser ? (
                        <div className="px-2 py-1 flex items-center justify-between text-xs text-slate-600">
                          <span className="truncate max-w-[180px]">{firebaseUser.email}</span>
                          <button
                            onClick={logOut}
                            className="inline-flex items-center space-x-1 text-rose-600 hover:text-rose-700 font-medium"
                          >
                            <LogOut className="h-3 w-3" />
                            <span>Sign out</span>
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={signInWithGoogle}
                          className="w-full flex items-center justify-center space-x-2 py-1.5 px-3 rounded-lg text-xs font-medium text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 transition-colors"
                        >
                          <LogIn className="h-3.5 w-3.5 text-indigo-600" />
                          <span>Sign in with Google</span>
                        </button>
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100"
            >
              {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Primary Navigation Tabs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-t border-slate-100">
        <nav className="hidden lg:flex space-x-1 py-1.5 overflow-x-auto no-scrollbar">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`inline-flex items-center space-x-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-xs shadow-indigo-200'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Icon className={`h-4 w-4 ${isActive ? 'text-white' : 'text-slate-500'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Mobile Nav Drawer */}
        {isMobileMenuOpen && (
          <div className="lg:hidden py-2 space-y-1 border-t border-slate-100">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    setIsMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium ${
                    isActive
                      ? 'bg-indigo-50 text-indigo-700 font-semibold'
                      : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <Icon className="h-4 w-4 text-indigo-600" />
                  <span>{item.label}</span>
                </button>
              );
            })}
            <div className="pt-2 border-t border-slate-100 flex items-center justify-between px-3 text-xs text-slate-500">
              <span className="flex items-center space-x-1.5">
                <span className={`h-2 w-2 rounded-full ${isOnline ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                <span>{isOnline ? 'Firestore Live Sync' : 'Offline Mode'}</span>
              </span>
              <button
                onClick={() => {
                  onOpenReportModal();
                  setIsMobileMenuOpen(false);
                }}
                className="text-indigo-600 font-medium"
              >
                Executive Reports
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Edit Profile Modal */}
      <EditEmployeeModal
        employee={activeProfile}
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
      />

      {/* Add Employee Modal */}
      <AddEmployeeModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
      />
    </header>
  );
};
