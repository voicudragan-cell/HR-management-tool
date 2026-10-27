import React, { useState } from 'react';
import {
  Calendar,
  Plus,
  Clock,
  CheckCircle2,
  XCircle,
  Home,
  HeartPulse,
  Sun,
  User,
  Check,
  X,
  MessageSquare,
  AlertTriangle
} from 'lucide-react';
import { useHR } from '../context/HRContext';
import { LeaveRequest } from '../types/hr';

export const LeaveTab: React.FC = () => {
  const {
    activeProfile,
    activeRole,
    employees,
    leaveRequests,
    submitLeaveRequest,
    reviewLeaveRequest,
  } = useHR();

  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
  const [activeTabSubView, setActiveTabSubView] = useState<'requests' | 'schedule'>('requests');

  // Leave application state
  const [formData, setFormData] = useState({
    leaveType: 'annual' as LeaveRequest['leaveType'],
    startDate: new Date(Date.now() + 86400000).toISOString().split('T')[0],
    endDate: new Date(Date.now() + 5 * 86400000).toISOString().split('T')[0],
    totalDays: 4,
    reason: '',
  });

  const [reviewRemark, setReviewRemark] = useState<{ [id: string]: string }>({});

  const filteredRequests = statusFilter === 'all'
    ? leaveRequests
    : leaveRequests.filter(r => r.status === statusFilter);

  // Calculate days automatically when dates change
  const handleDateChange = (start: string, end: string) => {
    const s = new Date(start);
    const e = new Date(end);
    const diffTime = e.getTime() - s.getTime();
    const diffDays = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1);
    setFormData(prev => ({ ...prev, startDate: start, endDate: end, totalDays: diffDays }));
  };

  const handleApplyLeave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.reason) return;

    await submitLeaveRequest({
      employeeId: activeProfile.id,
      employeeName: activeProfile.name,
      department: activeProfile.department,
      leaveType: formData.leaveType,
      startDate: formData.startDate,
      endDate: formData.endDate,
      totalDays: formData.totalDays,
      reason: formData.reason,
    });

    setIsRequestModalOpen(false);
    setFormData({
      leaveType: 'annual',
      startDate: new Date(Date.now() + 86400000).toISOString().split('T')[0],
      endDate: new Date(Date.now() + 5 * 86400000).toISOString().split('T')[0],
      totalDays: 4,
      reason: '',
    });
  };

  // Leave balances for active profile
  const lb = activeProfile.leaveBalance;
  const annualRemaining = Math.max(0, lb.annual - lb.annualUsed);
  const sickRemaining = Math.max(0, lb.sick - lb.sickUsed);
  const personalRemaining = Math.max(0, lb.personal - lb.personalUsed);

  return (
    <div className="space-y-6">
      
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center space-x-2">
            <Calendar className="h-5 w-5 text-indigo-600" />
            <span>Leave & Absence Management</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Track vacation days, submit PTO requests, monitor team absence schedules, and review pending approvals.
          </p>
        </div>

        <button
          onClick={() => setIsRequestModalOpen(true)}
          className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-xs font-semibold text-white shadow-xs transition-colors self-start sm:self-auto"
        >
          <Plus className="h-4 w-4" />
          <span>Apply for Time-Off</span>
        </button>
      </div>

      {/* Leave Balances Cards (for Active User) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Annual Vacation</span>
            <Sun className="h-4 w-4 text-amber-500" />
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-2xl font-bold font-mono text-slate-900">{annualRemaining}</span>
            <span className="text-xs text-slate-400">/ {lb.annual} Days Left</span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-1.5 mt-3 overflow-hidden">
            <div
              className="bg-amber-500 h-1.5 rounded-full"
              style={{ width: `${(annualRemaining / lb.annual) * 100}%` }}
            />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Sick Leave</span>
            <HeartPulse className="h-4 w-4 text-rose-500" />
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-2xl font-bold font-mono text-slate-900">{sickRemaining}</span>
            <span className="text-xs text-slate-400">/ {lb.sick} Days Left</span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-1.5 mt-3 overflow-hidden">
            <div
              className="bg-rose-500 h-1.5 rounded-full"
              style={{ width: `${(sickRemaining / lb.sick) * 100}%` }}
            />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Personal Days</span>
            <User className="h-4 w-4 text-indigo-500" />
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-2xl font-bold font-mono text-slate-900">{personalRemaining}</span>
            <span className="text-xs text-slate-400">/ {lb.personal} Days Left</span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-1.5 mt-3 overflow-hidden">
            <div
              className="bg-indigo-500 h-1.5 rounded-full"
              style={{ width: `${(personalRemaining / lb.personal) * 100}%` }}
            />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Remote Days Logged</span>
            <Home className="h-4 w-4 text-emerald-500" />
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-2xl font-bold font-mono text-slate-900">{lb.remoteUsed}</span>
            <span className="text-xs text-slate-400">Days YTD</span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-1.5 mt-3 overflow-hidden">
            <div className="bg-emerald-500 h-1.5 rounded-full" style={{ width: '65%' }} />
          </div>
        </div>

      </div>

      {/* View Switcher: Requests Ledger vs Calendar Schedule */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-2">
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setActiveTabSubView('requests')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              activeTabSubView === 'requests'
                ? 'bg-slate-900 text-white'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Leave Requests Queue ({leaveRequests.length})
          </button>
          <button
            onClick={() => setActiveTabSubView('schedule')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              activeTabSubView === 'schedule'
                ? 'bg-slate-900 text-white'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Team Coverage Schedule
          </button>
        </div>

        {activeTabSubView === 'requests' && (
          <div className="flex items-center space-x-1.5">
            {(['all', 'pending', 'approved', 'rejected'] as const).map(f => (
              <button
                key={f}
                onClick={() => setStatusFilter(f)}
                className={`px-2.5 py-1 rounded-lg text-xs capitalize transition-colors ${
                  statusFilter === f
                    ? 'bg-indigo-600 text-white font-semibold'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Sub-view: Requests Ledger */}
      {activeTabSubView === 'requests' ? (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-semibold">
                <tr>
                  <th className="px-4 py-3">Employee</th>
                  <th className="px-4 py-3">Department</th>
                  <th className="px-4 py-3">Type</th>
                  <th className="px-4 py-3">Duration</th>
                  <th className="px-4 py-3">Reason & Notes</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredRequests.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-8 text-center text-slate-400">
                      No leave requests match the selected filter.
                    </td>
                  </tr>
                ) : (
                  filteredRequests.map(req => {
                    const isPending = req.status === 'pending';
                    const canReview = (activeRole === 'admin' || activeRole === 'manager') && isPending;

                    return (
                      <tr key={req.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="px-4 py-3 font-semibold text-slate-900">
                          {req.employeeName}
                        </td>
                        <td className="px-4 py-3 text-slate-600">
                          {req.department}
                        </td>
                        <td className="px-4 py-3">
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-indigo-50 text-indigo-700 capitalize">
                            {req.leaveType}
                          </span>
                        </td>
                        <td className="px-4 py-3 font-mono text-slate-700">
                          <div>{req.startDate} &rarr; {req.endDate}</div>
                          <div className="text-[10px] text-slate-400 font-sans">{req.totalDays} day(s)</div>
                        </td>
                        <td className="px-4 py-3 max-w-xs text-slate-600">
                          <p className="truncate italic">"{req.reason}"</p>
                          {req.comments && (
                            <p className="text-[10px] text-slate-400 mt-0.5 truncate">
                              Reviewer note: {req.comments}
                            </p>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                            req.status === 'approved'
                              ? 'bg-emerald-100 text-emerald-800'
                              : req.status === 'rejected'
                              ? 'bg-rose-100 text-rose-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}>
                            {req.status === 'approved' && <CheckCircle2 className="h-3 w-3" />}
                            {req.status === 'rejected' && <XCircle className="h-3 w-3" />}
                            {req.status === 'pending' && <Clock className="h-3 w-3" />}
                            <span>{req.status}</span>
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          {canReview ? (
                            <div className="flex items-center justify-end space-x-2">
                              <button
                                onClick={() => reviewLeaveRequest(req.id, 'rejected', reviewRemark[req.id] || 'Declined')}
                                className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50 border border-rose-200 transition-colors"
                                title="Decline request"
                              >
                                <X className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => reviewLeaveRequest(req.id, 'approved', reviewRemark[req.id] || 'Approved')}
                                className="p-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs transition-colors"
                                title="Approve request"
                              >
                                <Check className="h-4 w-4" />
                              </button>
                            </div>
                          ) : (
                            <span className="text-[11px] text-slate-400">
                              {req.reviewedByName ? `By ${req.reviewedByName}` : '—'}
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Sub-view: Team Absence Schedule View */
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900">
              Department Coverage & Absence Timeline (March - April 2026)
            </h3>
            <span className="text-xs text-slate-500">Live synchronization with approval state</span>
          </div>

          <div className="space-y-3">
            {leaveRequests.filter(r => r.status === 'approved').map(item => (
              <div
                key={item.id}
                className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/60 flex items-center justify-between"
              >
                <div className="flex items-center space-x-3">
                  <div className="p-2 rounded-lg bg-indigo-100 text-indigo-700">
                    <Calendar className="h-4 w-4" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-900">{item.employeeName}</span>
                    <span className="text-[11px] text-slate-500 block">
                      {item.department} &bull; {item.leaveType} leave ({item.totalDays} days)
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-xs font-mono font-semibold text-slate-800">
                    {item.startDate} &rarr; {item.endDate}
                  </span>
                  <span className="text-[10px] text-emerald-600 block font-medium">Coverage Confirmed</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modal: Submit Leave Request */}
      {isRequestModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center space-x-2">
                <div className="p-2 rounded-lg bg-indigo-100 text-indigo-700">
                  <Calendar className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Request Time Off</h3>
                  <p className="text-xs text-slate-500">Submit for manager approval</p>
                </div>
              </div>
              <button
                onClick={() => setIsRequestModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleApplyLeave} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Leave Category
                </label>
                <select
                  value={formData.leaveType}
                  onChange={e => setFormData({ ...formData, leaveType: e.target.value as LeaveRequest['leaveType'] })}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="annual">Annual Paid Vacation (Available: {annualRemaining} days)</option>
                  <option value="sick">Medical / Sick Leave (Available: {sickRemaining} days)</option>
                  <option value="personal">Personal Leave (Available: {personalRemaining} days)</option>
                  <option value="parental">Parental Leave</option>
                  <option value="remote">Remote Work from Alternate Location</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Start Date
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.startDate}
                    onChange={e => handleDateChange(e.target.value, formData.endDate)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    End Date
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.endDate}
                    onChange={e => handleDateChange(formData.startDate, e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
                  />
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded-lg flex items-center justify-between text-xs text-slate-600">
                <span>Requested Duration:</span>
                <span className="font-mono font-bold text-indigo-600">{formData.totalDays} business day(s)</span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Reason & Coverage Context
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="e.g. Annual family travel; project handover sync completed with team..."
                  value={formData.reason}
                  onChange={e => setFormData({ ...formData, reason: e.target.value })}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="flex items-center justify-end space-x-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsRequestModalOpen(false)}
                  className="px-4 py-2 rounded-lg text-xs font-medium text-slate-700 hover:bg-slate-100 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 shadow-xs transition-colors"
                >
                  Submit Application
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
