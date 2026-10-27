import React from 'react';
import {
  FileCheck2,
  Download,
  Printer,
  X,
  Users,
  DollarSign,
  TrendingUp,
  Calendar,
  CheckCircle2,
  Building
} from 'lucide-react';
import { useHR } from '../context/HRContext';

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ReportModal: React.FC<ReportModalProps> = ({ isOpen, onClose }) => {
  const {
    employees,
    leaveRequests,
    performanceReviews,
    payrollRecords,
    mobilityRecords,
  } = useHR();

  if (!isOpen) return null;

  // Computations
  const totalEmployees = employees.length;
  const activeCount = employees.filter(e => e.status === 'active').length;
  const onboardingCount = employees.filter(e => e.status === 'onboarding').length;

  const totalMonthlyPayroll = payrollRecords
    .filter(p => p.period === 'March 2026')
    .reduce((acc, p) => acc + p.netSalary, 0);

  const totalAnnualizedSpend = employees.reduce((acc, e) => acc + e.salary, 0);

  const completedReviews = performanceReviews.filter(r => r.status === 'finalized').length;
  const reviewCompletionRate = performanceReviews.length > 0
    ? Math.round((completedReviews / performanceReviews.length) * 100)
    : 100;

  const approvedLeaves = leaveRequests.filter(l => l.status === 'approved');
  const totalDaysTaken = approvedLeaves.reduce((acc, l) => acc + l.totalDays, 0);

  // Export CSV
  const handleExportCSV = () => {
    const headers = [
      'ID',
      'Name',
      'Email',
      'Department',
      'Job Title',
      'Level',
      'Role',
      'Status',
      'Salary',
      'Hire Date',
      'Annual Leave Balance Remaining',
    ];

    const rows = employees.map(e => [
      e.id,
      `"${e.name}"`,
      e.email,
      `"${e.department}"`,
      `"${e.jobTitle}"`,
      e.level,
      e.role,
      e.status,
      e.salary,
      e.hireDate,
      e.leaveBalance.annual - e.leaveBalance.annualUsed,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map(r => r.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `NexusHR_Executive_Report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center space-x-2">
            <div className="p-2 rounded-lg bg-indigo-100 text-indigo-700">
              <FileCheck2 className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Executive HR Oversight & Analytics</h3>
              <p className="text-xs text-slate-500">Comprehensive enterprise reporting & workforce compliance</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Report Content */}
        <div className="mt-4 space-y-5">
          
          {/* Executive Overview Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Total Headcount</span>
              <span className="text-xl font-bold font-mono text-slate-900 block mt-1">{totalEmployees}</span>
              <span className="text-[10px] text-emerald-600 font-medium">{activeCount} active &bull; {onboardingCount} new</span>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Annualized Payroll</span>
              <span className="text-xl font-bold font-mono text-emerald-600 block mt-1">
                ${(totalAnnualizedSpend / 1000).toFixed(0)}k
              </span>
              <span className="text-[10px] text-slate-400">Total wage allocation</span>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Review Completion</span>
              <span className="text-xl font-bold font-mono text-purple-600 block mt-1">
                {reviewCompletionRate}%
              </span>
              <span className="text-[10px] text-slate-400">{completedReviews} finalized</span>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Approved PTO Taken</span>
              <span className="text-xl font-bold font-mono text-amber-600 block mt-1">
                {totalDaysTaken} Days
              </span>
              <span className="text-[10px] text-slate-400">YTD absence coverage</span>
            </div>
          </div>

          {/* Department Breakdown Table */}
          <div className="border border-slate-200 rounded-xl overflow-hidden">
            <div className="bg-slate-50 px-4 py-2.5 text-xs font-bold text-slate-800 flex items-center justify-between border-b border-slate-200">
              <span>Departmental Headcount & Compensation Allocation</span>
              <span className="text-[11px] text-slate-400 font-normal">Active Payroll</span>
            </div>
            <div className="divide-y divide-slate-100 text-xs">
              {['Engineering', 'Product & Design', 'People & HR', 'Sales & Marketing', 'Finance & Operations'].map(dept => {
                const deptEmps = employees.filter(e => e.department === dept);
                const deptSpend = deptEmps.reduce((acc, e) => acc + e.salary, 0);
                const pct = Math.round((deptSpend / (totalAnnualizedSpend || 1)) * 100);

                return (
                  <div key={dept} className="px-4 py-2.5 flex items-center justify-between hover:bg-slate-50/50">
                    <div>
                      <span className="font-semibold text-slate-800">{dept}</span>
                      <span className="text-[11px] text-slate-400 block">{deptEmps.length} staff member(s)</span>
                    </div>
                    <div className="text-right">
                      <span className="font-mono font-bold text-slate-900">${(deptSpend / 1000).toFixed(0)}k / yr</span>
                      <span className="text-[10px] text-slate-400 block">{pct}% of company spend</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Career Mobility & Progression Status */}
          <div className="p-4 rounded-xl border border-indigo-100 bg-indigo-50/30">
            <h4 className="text-xs font-bold text-indigo-900 uppercase tracking-wider mb-2">
              Internal Mobility & Advancement Health
            </h4>
            <div className="flex items-center justify-between text-xs text-slate-700">
              <span>Total Promotions / Transfers Logged:</span>
              <span className="font-mono font-bold text-indigo-700">{mobilityRecords.length} nominations</span>
            </div>
            <div className="flex items-center justify-between text-xs text-slate-700 mt-1">
              <span>Approved & Executed:</span>
              <span className="font-mono font-bold text-emerald-600">
                {mobilityRecords.filter(m => m.status === 'approved').length}
              </span>
            </div>
          </div>

        </div>

        {/* Modal Actions */}
        <div className="flex items-center justify-between pt-4 mt-5 border-t border-slate-100">
          <div className="flex items-center space-x-2">
            <button
              onClick={handleExportCSV}
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-100 border border-slate-200 transition-colors"
            >
              <Download className="h-3.5 w-3.5 text-indigo-600" />
              <span>Export CSV</span>
            </button>
            <button
              onClick={() => window.print()}
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-100 border border-slate-200 transition-colors"
            >
              <Printer className="h-3.5 w-3.5" />
              <span>Print Briefing</span>
            </button>
          </div>

          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 transition-colors"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};
