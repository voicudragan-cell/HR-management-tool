import React, { useState } from 'react';
import {
  TrendingUp,
  Star,
  Plus,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Award,
  BookOpen,
  Target,
  Edit3,
  X,
  UserCheck,
  FileCheck
} from 'lucide-react';
import { useHR } from '../context/HRContext';
import { PerformanceReview } from '../types/hr';

export const PerformanceTab: React.FC = () => {
  const {
    activeProfile,
    activeRole,
    employees,
    performanceReviews,
    submitPerformanceReview,
    updatePerformanceReview,
    finalizePerformanceReview,
  } = useHR();

  const [selectedCycle, setSelectedCycle] = useState<string>('Q1 2026 Quarterly Performance Cycle');
  const [selectedReviewId, setSelectedReviewId] = useState<string>(
    performanceReviews[0]?.id || ''
  );
  const [isNewReviewModalOpen, setIsNewReviewModalOpen] = useState(false);
  const [isEditingSelf, setIsEditingSelf] = useState(false);
  const [selfReviewText, setSelfReviewText] = useState('');

  const cycles = [
    'Q1 2026 Quarterly Performance Cycle',
    '30-Day New Hire Progress Appraisal',
    '2025 Annual Performance Appraisal',
  ];

  const cycleReviews = performanceReviews.filter(r => r.cycle === selectedCycle);
  const selectedReview = performanceReviews.find(r => r.id === selectedReviewId) || cycleReviews[0];

  // New Review Form State
  const [newReviewForm, setNewReviewForm] = useState({
    employeeId: employees[1]?.id || '',
    cycle: 'Q1 2026 Quarterly Performance Cycle',
    overallRating: 4.5,
    competencies: {
      jobKnowledge: 5,
      communication: 4,
      collaboration: 5,
      problemSolving: 4,
      leadership: 4,
    },
    strengths: '',
    growthAreas: '',
    goals: '',
    selfReview: '',
    dueDate: '2026-03-28',
  });

  const handleCreateReview = async (e: React.FormEvent) => {
    e.preventDefault();
    const emp = employees.find(e => e.id === newReviewForm.employeeId);
    if (!emp) return;

    await submitPerformanceReview({
      employeeId: emp.id,
      employeeName: emp.name,
      directReportName: emp.directReportName || '',
      department: emp.department,
      jobTitle: emp.jobTitle,
      reviewerId: activeProfile.id,
      reviewerName: activeProfile.name,
      cycle: newReviewForm.cycle,
      overallRating: Number(newReviewForm.overallRating),
      competencies: newReviewForm.competencies,
      strengths: newReviewForm.strengths,
      growthAreas: newReviewForm.growthAreas,
      goals: newReviewForm.goals,
      selfReview: newReviewForm.selfReview,
      status: 'manager_reviewed',
      dueDate: newReviewForm.dueDate,
    });

    setIsNewReviewModalOpen(false);
  };

  const handleSaveSelfReview = async () => {
    if (!selectedReview) return;
    await updatePerformanceReview(selectedReview.id, {
      selfReview: selfReviewText,
      status: selectedReview.status === 'draft' ? 'self_submitted' : selectedReview.status,
    });
    setIsEditingSelf(false);
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center space-x-1">
        {[1, 2, 3, 4, 5].map(star => (
          <Star
            key={star}
            className={`h-4 w-4 ${
              star <= Math.round(rating)
                ? 'fill-amber-400 text-amber-400'
                : 'text-slate-300'
            }`}
          />
        ))}
        <span className="ml-1.5 text-xs font-mono font-bold text-slate-700">
          {rating.toFixed(1)}
        </span>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center space-x-2">
            <TrendingUp className="h-5 w-5 text-indigo-600" />
            <span>Performance Evaluations & OKRs</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Objective competency appraisals, manager feedback, OKRs, and employee self-reflections.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          {(activeRole === 'admin' || activeRole === 'manager') && (
            <button
              onClick={() => setIsNewReviewModalOpen(true)}
              className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-xs font-semibold text-white shadow-xs transition-colors"
            >
              <Plus className="h-4 w-4" />
              <span>Conduct New Appraisal</span>
            </button>
          )}
        </div>
      </div>

      {/* Cycle Selector & Deadline Alert Banner */}
      <div className="bg-amber-50/70 border border-amber-200 rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-start space-x-3">
          <Clock className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs font-bold text-amber-900">Current Review Cycle Deadline</span>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-200/80 text-amber-900 uppercase">
                Active
              </span>
            </div>
            <p className="text-xs text-amber-800 mt-0.5">
              Target completion date: <strong className="font-mono">March 28, 2026</strong> &bull; All self-reviews and manager evaluations must be finalized before company-wide calibration.
            </p>
          </div>
        </div>

        {/* Cycle Switcher */}
        <div className="flex items-center space-x-2 self-start md:self-auto">
          <span className="text-xs font-medium text-amber-900">Cycle:</span>
          <select
            value={selectedCycle}
            onChange={e => setSelectedCycle(e.target.value)}
            className="text-xs bg-white border border-amber-300 text-slate-800 rounded-lg px-2.5 py-1.5 font-medium focus:outline-none focus:ring-2 focus:ring-amber-500"
          >
            {cycles.map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Reviews Main View */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Appraisal Submissions in Cycle */}
        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
              Appraisals in this Cycle ({cycleReviews.length})
            </h2>

            {cycleReviews.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-500">
                No appraisals logged for this cycle yet.
              </div>
            ) : (
              <div className="space-y-2 max-h-[550px] overflow-y-auto">
                {cycleReviews.map(rev => {
                  const isSelected = rev.id === selectedReview?.id;
                  const emp = employees.find(e => e.id === rev.employeeId);

                  return (
                    <button
                      key={rev.id}
                      onClick={() => {
                        setSelectedReviewId(rev.id);
                        setSelfReviewText(rev.selfReview || '');
                      }}
                      className={`w-full text-left p-3 rounded-xl border transition-all ${
                        isSelected
                          ? 'border-indigo-600 bg-indigo-50/50 shadow-xs'
                          : 'border-slate-200 hover:border-slate-300 bg-white'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-900 truncate">
                          {rev.employeeName}
                        </span>
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full uppercase ${
                          rev.status === 'finalized'
                            ? 'bg-emerald-100 text-emerald-800'
                            : rev.status === 'manager_reviewed'
                            ? 'bg-indigo-100 text-indigo-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}>
                          {rev.status.replace('_', ' ')}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5 truncate">
                        {rev.jobTitle} &bull; {rev.department}
                      </p>
                      {(rev.directReportName || employees.find(e => e.id === rev.employeeId)?.directReportName) && (
                        <div className="mt-1.5 flex items-center space-x-1 text-[10px] text-indigo-700 bg-indigo-50 px-1.5 py-0.5 rounded border border-indigo-100 truncate">
                          <UserCheck className="h-3 w-3 text-indigo-600 shrink-0" />
                          <span className="truncate">Direct Report: <strong>{rev.directReportName || employees.find(e => e.id === rev.employeeId)?.directReportName}</strong></span>
                        </div>
                      )}
                      <div className="mt-2 flex items-center justify-between text-xs pt-1.5 border-t border-slate-100">
                        {renderStars(rev.overallRating)}
                        <span className="text-[10px] text-slate-400">By {rev.reviewerName}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right Column (2 Cols): Detailed Appraisal View */}
        <div className="lg:col-span-2 space-y-4">
          {selectedReview ? (
            <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-6">
              
              {/* Review Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-100">
                <div>
                  <div className="flex items-center space-x-2">
                    <h2 className="text-lg font-bold text-slate-900">{selectedReview.employeeName}</h2>
                    <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full uppercase ${
                      selectedReview.status === 'finalized'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-indigo-100 text-indigo-800'
                    }`}>
                      {selectedReview.status.replace('_', ' ')}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {selectedReview.jobTitle} &bull; {selectedReview.department}
                  </p>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Reviewed by <strong className="text-slate-600">{selectedReview.reviewerName}</strong> &bull; Due: {selectedReview.dueDate}
                  </p>
                  <div className="mt-2 inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-md bg-indigo-50 border border-indigo-200 text-xs text-indigo-900 font-medium">
                    <UserCheck className="h-3.5 w-3.5 text-indigo-600 shrink-0" />
                    <span>Direct Report Attached: <strong className="font-semibold text-indigo-950">{selectedReview.directReportName || employees.find(e => e.id === selectedReview.employeeId)?.directReportName || 'None designated in dossier'}</strong></span>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-indigo-50 to-purple-50 p-4 rounded-xl border border-indigo-100 text-center sm:text-right shrink-0">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-700 block">
                    Overall Performance Score
                  </span>
                  <div className="mt-1 flex items-center justify-center sm:justify-end space-x-2">
                    <span className="text-3xl font-extrabold text-slate-900 font-mono">
                      {selectedReview.overallRating.toFixed(1)}
                    </span>
                    <span className="text-xs font-medium text-slate-500">/ 5.0</span>
                  </div>
                  <div className="mt-1 flex justify-center sm:justify-end">
                    {renderStars(selectedReview.overallRating)}
                  </div>
                </div>
              </div>

              {/* Competencies Breakdown */}
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-3 flex items-center space-x-1.5">
                  <Award className="h-4 w-4 text-indigo-600" />
                  <span>Core Competency Evaluations</span>
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {[
                    { key: 'jobKnowledge', label: 'Technical Mastery & Role Knowledge', val: selectedReview.competencies.jobKnowledge },
                    { key: 'problemSolving', label: 'Critical Problem Solving & Delivery', val: selectedReview.competencies.problemSolving },
                    { key: 'collaboration', label: 'Teamwork & Cross-functional Trust', val: selectedReview.competencies.collaboration },
                    { key: 'communication', label: 'Clarity, Transparency & Listening', val: selectedReview.competencies.communication },
                    { key: 'leadership', label: 'Leadership, Ownership & Mentorship', val: selectedReview.competencies.leadership },
                  ].map(c => (
                    <div key={c.key} className="p-3 rounded-lg border border-slate-200 bg-slate-50/50">
                      <div className="flex items-center justify-between text-xs mb-1.5">
                        <span className="font-semibold text-slate-800">{c.label}</span>
                        <span className="font-mono font-bold text-indigo-600">{c.val} / 5</span>
                      </div>
                      <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                        <div
                          className="bg-indigo-600 h-1.5 rounded-full"
                          style={{ width: `${(c.val / 5) * 100}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Constructive Qualitative Feedback */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                <div className="p-4 rounded-xl border border-emerald-100 bg-emerald-50/40">
                  <h4 className="text-xs font-bold text-emerald-900 uppercase tracking-wider flex items-center space-x-1.5 mb-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                    <span>Key Strengths & Impact</span>
                  </h4>
                  <p className="text-xs text-slate-700 leading-relaxed">
                    {selectedReview.strengths || 'No strengths noted.'}
                  </p>
                </div>

                <div className="p-4 rounded-xl border border-amber-100 bg-amber-50/40">
                  <h4 className="text-xs font-bold text-amber-900 uppercase tracking-wider flex items-center space-x-1.5 mb-2">
                    <Target className="h-4 w-4 text-amber-600" />
                    <span>Growth Areas & Stretch Goals</span>
                  </h4>
                  <p className="text-xs text-slate-700 leading-relaxed">
                    {selectedReview.growthAreas || 'No growth areas noted.'}
                  </p>
                </div>

              </div>

              {/* Next Quarter OKRs / Goals */}
              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50">
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center space-x-1.5 mb-2">
                  <BookOpen className="h-4 w-4 text-indigo-600" />
                  <span>Target Objectives & Key Results (OKRs)</span>
                </h4>
                <p className="text-xs text-slate-700 leading-relaxed">
                  {selectedReview.goals}
                </p>
              </div>

              {/* Employee Self-Appraisal Section */}
              <div className="p-4 rounded-xl border border-indigo-100 bg-indigo-50/30">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-xs font-bold text-indigo-900 uppercase tracking-wider flex items-center space-x-1.5">
                    <Edit3 className="h-4 w-4 text-indigo-600" />
                    <span>Employee Self-Reflection</span>
                  </h4>

                  {/* Allow edit if active profile is employee or admin */}
                  {(activeProfile.id === selectedReview.employeeId || activeRole === 'admin') && (
                    <button
                      onClick={() => {
                        setSelfReviewText(selectedReview.selfReview || '');
                        setIsEditingSelf(!isEditingSelf);
                      }}
                      className="text-xs text-indigo-600 hover:text-indigo-800 font-semibold"
                    >
                      {isEditingSelf ? 'Cancel' : 'Edit Reflection'}
                    </button>
                  )}
                </div>

                {isEditingSelf ? (
                  <div className="space-y-3 mt-2">
                    <textarea
                      rows={4}
                      value={selfReviewText}
                      onChange={e => setSelfReviewText(e.target.value)}
                      placeholder="Share your quarterly highlights, obstacles overcome, and self-evaluation..."
                      className="w-full text-xs p-3 rounded-lg border border-indigo-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                    />
                    <div className="flex justify-end space-x-2">
                      <button
                        onClick={() => setIsEditingSelf(false)}
                        className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleSaveSelfReview}
                        className="px-3 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs"
                      >
                        Save Self-Reflection
                      </button>
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-slate-700 leading-relaxed italic">
                    "{selectedReview.selfReview || 'Self-reflection not submitted yet.'}"
                  </p>
                )}
              </div>

              {/* Admin Finalize Action */}
              {activeRole === 'admin' && selectedReview.status !== 'finalized' && (
                <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                  <span className="text-xs text-slate-500">
                    Once finalized, the appraisal is permanently sealed into employee records.
                  </span>
                  <button
                    onClick={() => finalizePerformanceReview(selectedReview.id)}
                    className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-xs font-semibold text-white shadow-xs transition-colors"
                  >
                    <FileCheck className="h-4 w-4" />
                    <span>Finalize & Sign Appraisal</span>
                  </button>
                </div>
              )}

            </div>
          ) : (
            <div className="p-8 text-center bg-white rounded-xl border border-slate-200">
              <p className="text-sm text-slate-500">Select an appraisal to view detailed scoring.</p>
            </div>
          )}
        </div>

      </div>

      {/* Modal: Conduct New Appraisal */}
      {isNewReviewModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center space-x-2">
                <div className="p-2 rounded-lg bg-indigo-100 text-indigo-700">
                  <TrendingUp className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Conduct Performance Appraisal</h3>
                  <p className="text-xs text-slate-500">Record ratings and goals for employee evaluation</p>
                </div>
              </div>
              <button
                onClick={() => setIsNewReviewModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreateReview} className="mt-4 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Employee Subject
                  </label>
                  <select
                    value={newReviewForm.employeeId}
                    onChange={e => setNewReviewForm({ ...newReviewForm, employeeId: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    {employees.map(e => (
                      <option key={e.id} value={e.id}>{e.name} ({e.jobTitle})</option>
                    ))}
                  </select>

                  {/* Auto-attached Direct Report indicator */}
                  {(() => {
                    const candidate = employees.find(e => e.id === newReviewForm.employeeId);
                    return (
                      <div className="mt-1.5 p-2 rounded-lg bg-indigo-50 border border-indigo-200 text-xs text-indigo-900 flex items-center space-x-1.5">
                        <UserCheck className="h-3.5 w-3.5 text-indigo-600 shrink-0" />
                        <span>
                          Direct Report (Auto-attached): <strong>{candidate?.directReportName || 'None designated in dossier'}</strong>
                        </span>
                      </div>
                    );
                  })()}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Review Cycle
                  </label>
                  <select
                    value={newReviewForm.cycle}
                    onChange={e => setNewReviewForm({ ...newReviewForm, cycle: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    {cycles.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Overall Rating (1.0 to 5.0)
                </label>
                <input
                  type="number"
                  min="1"
                  max="5"
                  step="0.1"
                  value={newReviewForm.overallRating}
                  onChange={e => setNewReviewForm({ ...newReviewForm, overallRating: Number(e.target.value) })}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Key Strengths
                </label>
                <textarea
                  rows={2}
                  required
                  placeholder="Summarize standout contributions and impact..."
                  value={newReviewForm.strengths}
                  onChange={e => setNewReviewForm({ ...newReviewForm, strengths: e.target.value })}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Growth Areas
                </label>
                <textarea
                  rows={2}
                  required
                  placeholder="Identify competencies for further refinement..."
                  value={newReviewForm.growthAreas}
                  onChange={e => setNewReviewForm({ ...newReviewForm, growthAreas: e.target.value })}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Goals & Upcoming OKRs
                </label>
                <textarea
                  rows={2}
                  required
                  placeholder="Defined deliverables and metrics for the next quarter..."
                  value={newReviewForm.goals}
                  onChange={e => setNewReviewForm({ ...newReviewForm, goals: e.target.value })}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="flex items-center justify-end space-x-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsNewReviewModalOpen(false)}
                  className="px-4 py-2 rounded-lg text-xs font-medium text-slate-700 hover:bg-slate-100 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 shadow-xs transition-colors"
                >
                  Submit Appraisal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
