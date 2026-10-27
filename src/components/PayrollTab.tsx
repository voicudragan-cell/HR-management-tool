import React, { useState } from 'react';
import {
  DollarSign,
  CheckCircle2,
  Clock,
  FileText,
  Printer,
  TrendingUp,
  CreditCard,
  Building2,
  Lock,
  X,
  Send,
  AlertCircle
} from 'lucide-react';
import { useHR } from '../context/HRContext';
import { PayrollRecord } from '../types/hr';

export const PayrollTab: React.FC = () => {
  const {
    activeProfile,
    activeRole,
    employees,
    payrollRecords,
    updatePayrollStatus,
    disburseAllPendingPayroll,
  } = useHR();

  const [selectedPeriod, setSelectedPeriod] = useState<string>('March 2026');
  const [selectedRecordForPayslip, setSelectedRecordForPayslip] = useState<PayrollRecord | null>(null);

  // Filter records based on role-based security:
  // Admin: Sees all records across all departments
  // Manager: Sees records for employees in their department
  // Employee: Sees strictly their own compensation records
  const visibleRecords = payrollRecords.filter(record => {
    if (record.period !== selectedPeriod) return false;
    if (activeRole === 'admin') return true;
    if (activeRole === 'manager') return record.department === activeProfile.department || record.employeeId === activeProfile.id;
    return record.employeeId === activeProfile.id;
  });

  const totalBase = visibleRecords.reduce((acc, r) => acc + r.baseSalary, 0);
  const totalBonus = visibleRecords.reduce((acc, r) => acc + r.bonus, 0);
  const totalTax = visibleRecords.reduce((acc, r) => acc + r.tax, 0);
  const totalNet = visibleRecords.reduce((acc, r) => acc + r.netSalary, 0);

  const pendingDisbursementCount = visibleRecords.filter(r => r.status !== 'paid').length;

  return (
    <div className="space-y-6">
      
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center space-x-2">
            <DollarSign className="h-5 w-5 text-emerald-600" />
            <span>Payroll Tracking & Compensation</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            {activeRole === 'admin'
              ? 'Organization-wide payroll ledger: Base salaries, bonuses, tax withholdings, and monthly batch disbursements.'
              : activeRole === 'manager'
              ? `Departmental compensation oversight for ${activeProfile.department}.`
              : 'Personal compensation history, tax withholding summaries, and digital payslips.'}
          </p>
        </div>

        {/* Admin Batch Action */}
        {activeRole === 'admin' && (
          <div className="flex items-center space-x-2 self-start sm:self-auto">
            <button
              onClick={() => disburseAllPendingPayroll(selectedPeriod)}
              disabled={pendingDisbursementCount === 0}
              className={`inline-flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-semibold text-white shadow-xs transition-colors ${
                pendingDisbursementCount > 0
                  ? 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/20'
                  : 'bg-slate-400 cursor-not-allowed opacity-70'
              }`}
            >
              <Send className="h-4 w-4" />
              <span>Disburse Batch ({pendingDisbursementCount} Pending)</span>
            </button>
          </div>
        )}
      </div>

      {/* Role Access Security Notice */}
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 flex items-center justify-between text-xs text-slate-600">
        <div className="flex items-center space-x-2">
          <Lock className="h-4 w-4 text-indigo-600 shrink-0" />
          <span>
            Role-Based Access: Logged in as <strong className="text-slate-900">{activeProfile.name}</strong> ({activeRole.toUpperCase()}). Showing {visibleRecords.length} authorized payroll record(s).
          </span>
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-xs text-slate-500">Period:</span>
          <select
            value={selectedPeriod}
            onChange={e => setSelectedPeriod(e.target.value)}
            className="text-xs bg-white border border-slate-300 text-slate-800 rounded-lg px-2 py-1 font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="March 2026">March 2026</option>
            <option value="February 2026">February 2026</option>
          </select>
        </div>
      </div>

      {/* Financial Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
            Net Monthly Payout
          </span>
          <div className="mt-2 text-2xl font-bold font-mono text-emerald-600">
            ${totalNet.toLocaleString()}
          </div>
          <span className="text-[10px] text-slate-400 mt-1 block">Total Disbursed or Scheduled</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
            Base Salary Commitments
          </span>
          <div className="mt-2 text-2xl font-bold font-mono text-slate-900">
            ${totalBase.toLocaleString()}
          </div>
          <span className="text-[10px] text-slate-400 mt-1 block">Monthly Recurring Fixed</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
            Variable Bonuses & Comm.
          </span>
          <div className="mt-2 text-2xl font-bold font-mono text-indigo-600">
            ${totalBonus.toLocaleString()}
          </div>
          <span className="text-[10px] text-slate-400 mt-1 block">Performance Incentives</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
            Tax Withholding
          </span>
          <div className="mt-2 text-2xl font-bold font-mono text-slate-700">
            ${totalTax.toLocaleString()}
          </div>
          <span className="text-[10px] text-slate-400 mt-1 block">Federal, State & FICA</span>
        </div>

      </div>

      {/* Payroll Ledger Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-900">
            {selectedPeriod} Compensation Ledger
          </h2>
          <span className="text-xs text-slate-500 font-mono">
            {visibleRecords.length} Item(s)
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-semibold">
              <tr>
                <th className="px-4 py-3">Employee</th>
                <th className="px-4 py-3">Department</th>
                <th className="px-4 py-3 font-mono text-right">Base ($)</th>
                <th className="px-4 py-3 font-mono text-right">Bonus ($)</th>
                <th className="px-4 py-3 font-mono text-right">Tax ($)</th>
                <th className="px-4 py-3 font-mono text-right">Net Payout ($)</th>
                <th className="px-4 py-3">Disbursement Status</th>
                <th className="px-4 py-3 text-right">Payslip</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {visibleRecords.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-8 text-center text-slate-400">
                    No payroll entries found for this cycle and user role.
                  </td>
                </tr>
              ) : (
                visibleRecords.map(item => {
                  const isPaid = item.status === 'paid';
                  const isPending = item.status === 'pending_approval';

                  return (
                    <tr key={item.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="px-4 py-3">
                        <span className="font-semibold text-slate-900 block">{item.employeeName}</span>
                        <span className="text-[10px] text-slate-400 font-mono truncate max-w-[140px] block">
                          {item.paymentMethod}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-slate-600">{item.department}</td>
                      <td className="px-4 py-3 font-mono text-right text-slate-800">
                        ${item.baseSalary.toLocaleString()}
                      </td>
                      <td className="px-4 py-3 font-mono text-right text-indigo-600">
                        ${item.bonus.toLocaleString()}
                      </td>
                      <td className="px-4 py-3 font-mono text-right text-slate-500">
                        ${item.tax.toLocaleString()}
                      </td>
                      <td className="px-4 py-3 font-mono text-right font-bold text-emerald-600">
                        ${item.netSalary.toLocaleString()}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                          isPaid
                            ? 'bg-emerald-100 text-emerald-800'
                            : isPending
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-indigo-100 text-indigo-800'
                        }`}>
                          {isPaid ? <CheckCircle2 className="h-3 w-3" /> : <Clock className="h-3 w-3" />}
                          <span>{item.status.replace('_', ' ')}</span>
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={() => setSelectedRecordForPayslip(item)}
                          className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-lg text-xs font-medium text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 transition-colors"
                        >
                          <FileText className="h-3.5 w-3.5" />
                          <span>View Slip</span>
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Interactive Digital Payslip */}
      {selectedRecordForPayslip && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center space-x-2">
                <div className="p-2 rounded-lg bg-emerald-100 text-emerald-800">
                  <CreditCard className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Official Earnings Statement</h3>
                  <p className="text-xs text-slate-500">NexusHR Global Payroll Operations</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedRecordForPayslip(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Payslip Content (Printable Layout) */}
            <div className="mt-4 space-y-4">
              
              <div className="flex justify-between items-start bg-slate-50 p-4 rounded-xl border border-slate-200">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Employee</span>
                  <span className="text-sm font-bold text-slate-900">{selectedRecordForPayslip.employeeName}</span>
                  <span className="text-xs text-slate-500 block">{selectedRecordForPayslip.department}</span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Pay Period</span>
                  <span className="text-sm font-bold font-mono text-slate-900">{selectedRecordForPayslip.period}</span>
                  <span className="text-xs text-emerald-600 font-semibold block">Disbursement Direct Deposit</span>
                </div>
              </div>

              {/* Earnings & Deductions Breakdown */}
              <div className="border border-slate-200 rounded-xl overflow-hidden">
                <div className="bg-slate-100 px-4 py-2 text-[11px] font-bold uppercase tracking-wider text-slate-600 flex justify-between">
                  <span>Earnings Breakdown</span>
                  <span>Amount ($)</span>
                </div>
                <div className="p-4 space-y-2 text-xs divide-y divide-slate-100">
                  <div className="flex justify-between py-1 text-slate-700">
                    <span>Base Regular Monthly Salary</span>
                    <span className="font-mono">${selectedRecordForPayslip.baseSalary.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between py-1 text-slate-700">
                    <span>Performance Incentive / Commission</span>
                    <span className="font-mono text-indigo-600">+${selectedRecordForPayslip.bonus.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between py-1 text-slate-700">
                    <span>Workplace Allowances (Tech/Wellness)</span>
                    <span className="font-mono">+${selectedRecordForPayslip.allowances.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between py-1 text-rose-600">
                    <span>Pre-tax Benefits & Deductions (401k/Health)</span>
                    <span className="font-mono">-${selectedRecordForPayslip.deductions.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between py-1 text-rose-600">
                    <span>Tax Withholdings (Federal + State + FICA)</span>
                    <span className="font-mono">-${selectedRecordForPayslip.tax.toLocaleString()}</span>
                  </div>
                </div>
                <div className="bg-emerald-50 px-4 py-3 border-t border-emerald-200 flex justify-between items-center text-sm font-bold text-emerald-950">
                  <span>Net Take-Home Pay</span>
                  <span className="font-mono text-lg text-emerald-700">
                    ${selectedRecordForPayslip.netSalary.toLocaleString()}
                  </span>
                </div>
              </div>

              <div className="text-[11px] text-slate-500 bg-slate-50 p-3 rounded-lg border border-slate-200">
                Payment Channel: <strong className="text-slate-800">{selectedRecordForPayslip.paymentMethod}</strong>
              </div>

            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-between pt-4 mt-4 border-t border-slate-100">
              <button
                onClick={() => window.print()}
                className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-100 border border-slate-200 transition-colors"
              >
                <Printer className="h-3.5 w-3.5" />
                <span>Print Payslip</span>
              </button>

              <button
                onClick={() => setSelectedRecordForPayslip(null)}
                className="px-4 py-1.5 rounded-lg text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 transition-colors"
              >
                Close
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
