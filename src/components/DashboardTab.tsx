import React from 'react';
import {
  Users,
  Calendar,
  DollarSign,
  TrendingUp,
  UserCheck,
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  Clock,
  Sparkles,
  Shield,
  FileCheck2,
  PieChart,
  BellRing
} from 'lucide-react';
import { useHR } from '../context/HRContext';

interface DashboardTabProps {
  onNavigateTab: (tab: string) => void;
  onOpenReportModal: () => void;
}

export const DashboardTab: React.FC<DashboardTabProps> = ({
  onNavigateTab,
  onOpenReportModal,
}) => {
  const {
    activeProfile,
    activeRole,
    employees,
    onboardingTasks,
    leaveRequests,
    performanceReviews,
    payrollRecords,
    mobilityRecords,
    reviewLeaveRequest,
    triggerAutomatedAlerts,
  } = useHR();

  // Metrics calculations
  const totalEmployees = employees.length;
  const activeCount = employees.filter(e => e.status === 'active').length;
  const onboardingCount = employees.filter(e => e.status === 'onboarding').length;

  const pendingLeaves = leaveRequests.filter(l => l.status === 'pending');
  const pendingPromotions = mobilityRecords.filter(m => m.status === 'nominated');
  const totalPendingApprovals = pendingLeaves.length + pendingPromotions.length;

  const completedReviews = performanceReviews.filter(r => r.status === 'finalized').length;
  const reviewProgressPercent = performanceReviews.length > 0
    ? Math.round((completedReviews / performanceReviews.length) * 100)
    : 100;

  // Monthly payroll calculation
  const currentPeriodPayroll = payrollRecords.filter(p => p.period === 'March 2026');
  const totalMonthlyPayroll = currentPeriodPayroll.reduce((acc, p) => acc + p.netSalary, 0);
  const pendingPayrollCount = currentPeriodPayroll.filter(p => p.status !== 'paid').length;

  // Department distribution
  const deptCounts: Record<string, number> = {};
  employees.forEach(e => {
    deptCounts[e.department] = (deptCounts[e.department] || 0) + 1;
  });

  return (
    <div className="space-y-6">
      
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-2xl p-6 text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2 text-indigo-300 text-xs font-semibold tracking-wider uppercase mb-1">
              <Shield className="h-4 w-4" />
              <span>HR Centralized Command &bull; {activeRole.toUpperCase()} ACCESS</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Welcome back, {activeProfile.name}
            </h1>
            <p className="text-slate-300 text-sm mt-1 max-w-2xl">
              {activeRole === 'admin'
                ? 'Full organizational oversight: Monitor new hires, approve leave pipelines, inspect Q1 appraisals, and disburse company payroll.'
                : activeRole === 'manager'
                ? `Department management dashboard for ${activeProfile.department}: Review team leave requests, track career progression, and oversee evaluations.`
                : 'Employee self-service portal: Track your onboarding milestones, submit leave applications, view payslips, and check appraisal cycles.'}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => triggerAutomatedAlerts()}
              className="inline-flex items-center space-x-2 px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/15 backdrop-blur-xs text-xs font-semibold text-white border border-white/20 transition-all"
              title="Run rules engine for pending approvals and deadlines"
            >
              <BellRing className="h-4 w-4 text-amber-400" />
              <span>Scan Deadlines</span>
            </button>
            <button
              onClick={onOpenReportModal}
              className="inline-flex items-center space-x-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-semibold text-white shadow-md shadow-indigo-700/30 transition-all"
            >
              <FileCheck2 className="h-4 w-4" />
              <span>Full Executive Report</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Card 1: Headcount */}
        <div
          onClick={() => onNavigateTab('employees')}
          className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs hover:border-indigo-300 hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">Total Headcount</span>
            <div className="p-2 rounded-lg bg-indigo-50 text-indigo-600 group-hover:scale-110 transition-transform">
              <Users className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline space-x-2">
            <span className="text-3xl font-bold text-slate-900 font-mono">{totalEmployees}</span>
            <span className="text-xs text-emerald-600 font-medium font-sans">
              {activeCount} Active &bull; {onboardingCount} Onboarding
            </span>
          </div>
          <div className="mt-3 text-xs text-slate-500 flex items-center justify-between border-t border-slate-100 pt-2.5">
            <span>5 Departments</span>
            <span className="text-indigo-600 font-medium flex items-center">
              View Directory <ArrowRight className="h-3 w-3 ml-1" />
            </span>
          </div>
        </div>

        {/* Card 2: Pending Approvals */}
        <div
          onClick={() => onNavigateTab('leave')}
          className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs hover:border-amber-300 hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">Pending Approvals</span>
            <div className="p-2 rounded-lg bg-amber-50 text-amber-600 group-hover:scale-110 transition-transform">
              <Clock className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline space-x-2">
            <span className="text-3xl font-bold text-slate-900 font-mono">{totalPendingApprovals}</span>
            <span className={`text-xs font-medium font-sans ${totalPendingApprovals > 0 ? 'text-amber-600' : 'text-emerald-600'}`}>
              {totalPendingApprovals > 0 ? 'Action Required' : 'All clear'}
            </span>
          </div>
          <div className="mt-3 text-xs text-slate-500 flex items-center justify-between border-t border-slate-100 pt-2.5">
            <span>{pendingLeaves.length} Leaves &bull; {pendingPromotions.length} Mobility</span>
            <span className="text-amber-600 font-medium flex items-center">
              Review Queue <ArrowRight className="h-3 w-3 ml-1" />
            </span>
          </div>
        </div>

        {/* Card 3: Performance Review Cycle */}
        <div
          onClick={() => onNavigateTab('performance')}
          className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs hover:border-indigo-300 hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">Q1 Appraisals</span>
            <div className="p-2 rounded-lg bg-purple-50 text-purple-600 group-hover:scale-110 transition-transform">
              <TrendingUp className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline space-x-2">
            <span className="text-3xl font-bold text-slate-900 font-mono">{reviewProgressPercent}%</span>
            <span className="text-xs text-indigo-600 font-medium font-sans">
              Cycle Closes in 26d
            </span>
          </div>
          <div className="mt-3">
            <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
              <div
                className="bg-purple-600 h-1.5 rounded-full transition-all duration-500"
                style={{ width: `${reviewProgressPercent}%` }}
              />
            </div>
          </div>
        </div>

        {/* Card 4: Monthly Payroll Run */}
        <div
          onClick={() => onNavigateTab('payroll')}
          className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs hover:border-emerald-300 hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">March Payroll Run</span>
            <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600 group-hover:scale-110 transition-transform">
              <DollarSign className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline space-x-2">
            <span className="text-3xl font-bold text-slate-900 font-mono">
              ${(totalMonthlyPayroll / 1000).toFixed(1)}k
            </span>
            <span className="text-xs text-slate-500 font-medium font-sans">
              Net Monthly
            </span>
          </div>
          <div className="mt-3 text-xs text-slate-500 flex items-center justify-between border-t border-slate-100 pt-2.5">
            <span>{pendingPayrollCount} Records Pending Approval</span>
            <span className="text-emerald-600 font-medium flex items-center">
              Ledger <ArrowRight className="h-3 w-3 ml-1" />
            </span>
          </div>
        </div>

      </div>

      {/* Main Grid: Pending Action Items & Department Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column (2 Cols): Urgent Action Items */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Urgent Approvals Section */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-base font-bold text-slate-900 flex items-center space-x-2">
                  <AlertCircle className="h-4 w-4 text-amber-500" />
                  <span>Pending Management Approvals</span>
                </h2>
                <p className="text-xs text-slate-500">
                  Time-sensitive leave requests and promotion proposals requiring sign-off.
                </p>
              </div>
              <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800">
                {totalPendingApprovals} Waiting
              </span>
            </div>

            {totalPendingApprovals === 0 ? (
              <div className="py-8 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200">
                <CheckCircle2 className="h-8 w-8 text-emerald-500 mx-auto mb-2" />
                <p className="text-xs font-semibold text-slate-700">All approval queues are up to date!</p>
                <p className="text-[11px] text-slate-400 mt-0.5">No pending leave requests or promotion nominations at this moment.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {/* Pending Leaves */}
                {pendingLeaves.map(leave => (
                  <div
                    key={leave.id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-white hover:border-slate-300 transition-all gap-3"
                  >
                    <div className="flex items-start space-x-3">
                      <div className="p-2 rounded-lg bg-indigo-100 text-indigo-700 shrink-0 mt-0.5">
                        <Calendar className="h-4 w-4" />
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="text-xs font-bold text-slate-900">{leave.employeeName}</span>
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-indigo-100 text-indigo-700 uppercase">
                            {leave.leaveType}
                          </span>
                          <span className="text-[11px] text-slate-400 font-mono">
                            {leave.totalDays} day(s)
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 mt-0.5 italic">
                          "{leave.reason}"
                        </p>
                        <p className="text-[10px] text-slate-400 mt-1">
                          Period: {leave.startDate} &rarr; {leave.endDate} &bull; Dept: {leave.department}
                        </p>
                      </div>
                    </div>

                    {/* Action buttons (only for admin or manager) */}
                    {(activeRole === 'admin' || activeRole === 'manager') ? (
                      <div className="flex items-center space-x-2 shrink-0">
                        <button
                          onClick={() => reviewLeaveRequest(leave.id, 'rejected', 'Declined by reviewer')}
                          className="px-3 py-1.5 rounded-lg text-xs font-medium text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 transition-colors"
                        >
                          Decline
                        </button>
                        <button
                          onClick={() => reviewLeaveRequest(leave.id, 'approved', 'Approved from central dashboard')}
                          className="px-3 py-1.5 rounded-lg text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 shadow-xs transition-colors"
                        >
                          Approve
                        </button>
                      </div>
                    ) : (
                      <span className="text-[11px] text-amber-600 font-medium px-2 py-1 bg-amber-50 rounded">
                        Pending Manager Sign-off
                      </span>
                    )}
                  </div>
                ))}

                {/* Pending Promotions */}
                {pendingPromotions.map(promo => (
                  <div
                    key={promo.id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 rounded-xl border border-indigo-200 bg-indigo-50/40 hover:bg-indigo-50/70 transition-all gap-3"
                  >
                    <div className="flex items-start space-x-3">
                      <div className="p-2 rounded-lg bg-purple-100 text-purple-700 shrink-0 mt-0.5">
                        <Sparkles className="h-4 w-4" />
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="text-xs font-bold text-slate-900">{promo.employeeName}</span>
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-purple-100 text-purple-700">
                            Promotion (+{promo.salaryAdjustmentPercent}%)
                          </span>
                        </div>
                        <p className="text-xs text-slate-700 font-medium mt-0.5">
                          {promo.currentTitle} &rarr; <span className="text-indigo-700 font-bold">{promo.proposedTitle}</span>
                        </p>
                        <p className="text-[11px] text-slate-500 mt-1 line-clamp-1">
                          {promo.justification}
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={() => onNavigateTab('mobility')}
                      className="px-3 py-1.5 rounded-lg text-xs font-semibold text-indigo-700 bg-white hover:bg-indigo-50 border border-indigo-300 transition-colors shrink-0"
                    >
                      Review Nomination
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Onboarding & New Hire Velocity */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-base font-bold text-slate-900 flex items-center space-x-2">
                  <UserCheck className="h-4 w-4 text-indigo-600" />
                  <span>Active Onboarding Integrations</span>
                </h2>
                <p className="text-xs text-slate-500">
                  Tracking new team members from Day 1 to 30-day productivity milestone.
                </p>
              </div>
              <button
                onClick={() => onNavigateTab('onboarding')}
                className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center"
              >
                Onboarding Hub <ArrowRight className="h-3 w-3 ml-1" />
              </button>
            </div>

            <div className="space-y-3">
              {employees.filter(e => e.status === 'onboarding' || e.status === 'probation').length === 0 ? (
                <div className="py-8 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200">
                  <UserCheck className="h-6 w-6 text-slate-300 mx-auto mb-1.5" />
                  <p className="text-xs font-semibold text-slate-700">No active new hire onboarding in progress</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">Click Onboard New Hire in Onboarding Hub to initialize your first team member.</p>
                </div>
              ) : (
                employees.filter(e => e.status === 'onboarding' || e.status === 'probation').map(hire => {
                  const empTasks = onboardingTasks.filter(t => t.employeeId === hire.id);
                  const completedTasks = empTasks.filter(t => t.status === 'completed').length;
                  const progressPct = empTasks.length > 0 ? Math.round((completedTasks / empTasks.length) * 100) : 0;

                  return (
                    <div key={hire.id} className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/40">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2.5">
                          <img
                            src={hire.avatarUrl}
                            alt={hire.name}
                            className="h-8 w-8 rounded-full object-cover"
                          />
                          <div>
                            <span className="text-xs font-bold text-slate-900">{hire.name}</span>
                            <span className="text-[11px] text-slate-500 block">
                              {hire.jobTitle} &bull; {hire.department}
                            </span>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="text-xs font-mono font-bold text-slate-900">{progressPct}%</span>
                          <span className="text-[10px] text-slate-400 block">{completedTasks}/{empTasks.length} Milestones</span>
                        </div>
                      </div>
                      <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                        <div
                          className="bg-indigo-600 h-2 rounded-full transition-all duration-500"
                          style={{ width: `${progressPct}%` }}
                        />
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

        </div>

        {/* Right Column (1 Col): Department Distribution & Quick Actions */}
        <div className="space-y-6">
          
          {/* Department Breakdown */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
            <h2 className="text-sm font-bold text-slate-900 flex items-center space-x-2 mb-3">
              <PieChart className="h-4 w-4 text-indigo-600" />
              <span>Headcount by Department</span>
            </h2>
            <div className="space-y-2.5">
              {Object.entries(deptCounts).map(([dept, count]) => {
                const pct = Math.round((count / totalEmployees) * 100);
                return (
                  <div key={dept} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-medium text-slate-700 truncate">{dept}</span>
                      <span className="font-mono text-slate-500">{count} ({pct}%)</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                      <div
                        className="bg-indigo-500 h-1.5 rounded-full"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Quick Shortcuts */}
          <div className="bg-slate-900 text-white rounded-xl p-5 shadow-lg">
            <h2 className="text-xs font-bold uppercase tracking-wider text-indigo-400 mb-3">
              Fast Track Workflows
            </h2>
            <div className="space-y-2">
              <button
                onClick={() => onNavigateTab('leave')}
                className="w-full flex items-center justify-between p-2.5 rounded-lg bg-white/5 hover:bg-white/10 text-left text-xs font-medium text-slate-200 transition-colors border border-white/10"
              >
                <div className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4 text-indigo-400" />
                  <span>Submit Time-Off Request</span>
                </div>
                <ArrowRight className="h-3 w-3 text-slate-400" />
              </button>

              <button
                onClick={() => onNavigateTab('performance')}
                className="w-full flex items-center justify-between p-2.5 rounded-lg bg-white/5 hover:bg-white/10 text-left text-xs font-medium text-slate-200 transition-colors border border-white/10"
              >
                <div className="flex items-center space-x-2">
                  <TrendingUp className="h-4 w-4 text-emerald-400" />
                  <span>Start Q1 Self-Evaluation</span>
                </div>
                <ArrowRight className="h-3 w-3 text-slate-400" />
              </button>

              <button
                onClick={() => onNavigateTab('mobility')}
                className="w-full flex items-center justify-between p-2.5 rounded-lg bg-white/5 hover:bg-white/10 text-left text-xs font-medium text-slate-200 transition-colors border border-white/10"
              >
                <div className="flex items-center space-x-2">
                  <Sparkles className="h-4 w-4 text-amber-400" />
                  <span>Explore Internal Mobility Jobs</span>
                </div>
                <ArrowRight className="h-3 w-3 text-slate-400" />
              </button>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
