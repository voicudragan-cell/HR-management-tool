import React, { useState } from 'react';
import {
  Sparkles,
  TrendingUp,
  Award,
  Plus,
  CheckCircle2,
  XCircle,
  Clock,
  Briefcase,
  ArrowRight,
  Shield,
  Send,
  Building,
  Check,
  X
} from 'lucide-react';
import { useHR } from '../context/HRContext';
import { Department, MobilityRecord } from '../types/hr';

export const MobilityTab: React.FC = () => {
  const {
    activeProfile,
    activeRole,
    employees,
    mobilityRecords,
    jobOpenings,
    nominatePromotion,
    reviewPromotion,
  } = useHR();

  const [activeSubTab, setActiveSubTab] = useState<'pipeline' | 'matrix' | 'openings'>('pipeline');
  const [isNominateModalOpen, setIsNominateModalOpen] = useState(false);

  // Form State
  const [nominateForm, setNominateForm] = useState({
    employeeId: employees.find(e => e.role === 'employee')?.id || employees[0]?.id || '',
    proposedTitle: '',
    targetDepartment: 'Engineering' as Department,
    type: 'promotion' as MobilityRecord['type'],
    salaryAdjustmentPercent: 12,
    justification: '',
    effectiveDate: new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
  });

  const selectedCandidate = employees.find(e => e.id === nominateForm.employeeId) || employees[0];

  const handleNominateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nominateForm.proposedTitle || !nominateForm.justification) return;

    await nominatePromotion({
      employeeId: selectedCandidate.id,
      employeeName: selectedCandidate.name,
      currentTitle: selectedCandidate.jobTitle,
      proposedTitle: nominateForm.proposedTitle,
      currentDepartment: selectedCandidate.department,
      targetDepartment: nominateForm.targetDepartment,
      type: nominateForm.type,
      salaryAdjustmentPercent: Number(nominateForm.salaryAdjustmentPercent),
      justification: nominateForm.justification,
      effectiveDate: nominateForm.effectiveDate,
    });

    setIsNominateModalOpen(false);
    setNominateForm({
      employeeId: employees[0]?.id || '',
      proposedTitle: '',
      targetDepartment: 'Engineering',
      type: 'promotion',
      salaryAdjustmentPercent: 12,
      justification: '',
      effectiveDate: new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
    });
  };

  const careerLevels = [
    {
      level: 'L1',
      title: 'Associate / Entry',
      scope: 'Individual Contributor executing defined tasks under mentorship with high attention to code/quality standards.',
      promotionCriteria: 'Consistent sprint delivery, SOC2 compliance adherence, and solid domain basics.',
      salaryBand: '$80,000 - $105,000',
    },
    {
      level: 'L2',
      title: 'Specialist / Intermediate',
      scope: 'Autonomous execution of complex functional deliverables, independently scoping features and unit testing.',
      promotionCriteria: 'Delivering end-to-end features without continuous supervision, participating in peer code reviews.',
      salaryBand: '$105,000 - $135,000',
    },
    {
      level: 'L3',
      title: 'Senior Practitioner',
      scope: 'Subject matter expert driving architecture, unblocking junior peers, and collaborating across squads.',
      promotionCriteria: 'Cross-functional technical influence, proven mentorship of at least 2 team members, flawless production quality.',
      salaryBand: '$135,000 - $165,000',
    },
    {
      level: 'L4',
      title: 'Staff / Practice Lead',
      scope: 'Strategic organizational pillar leading design systems, high-scale infrastructure, or department revenue targets.',
      promotionCriteria: 'Organizational-wide impact, executive alignment, driving standards adopted across entire engineering/sales.',
      salaryBand: '$165,000 - $205,000',
    },
    {
      level: 'L5',
      title: 'Director / Executive',
      scope: 'Strategic leadership, talent development, organizational budgets, and executive OKR accountability.',
      promotionCriteria: 'Demonstrated business growth, organizational culture leadership, and executive consensus building.',
      salaryBand: '$205,000 - $275,000+',
    },
  ];

  return (
    <div className="space-y-6">
      
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center space-x-2">
            <Sparkles className="h-5 w-5 text-indigo-600" />
            <span>Promotion & Internal Mobility Hub</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Transparent career progression ladders, nomination pipelines, and internal transfer pathways.
          </p>
        </div>

        {(activeRole === 'admin' || activeRole === 'manager') && (
          <button
            onClick={() => setIsNominateModalOpen(true)}
            className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-xs font-semibold text-white shadow-xs transition-colors self-start sm:self-auto"
          >
            <Plus className="h-4 w-4" />
            <span>Nominate for Promotion</span>
          </button>
        )}
      </div>

      {/* Sub Tabs */}
      <div className="flex items-center space-x-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveSubTab('pipeline')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
            activeSubTab === 'pipeline'
              ? 'bg-slate-900 text-white'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Mobility & Promotion Pipeline ({mobilityRecords.length})
        </button>
        <button
          onClick={() => setActiveSubTab('matrix')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
            activeSubTab === 'matrix'
              ? 'bg-slate-900 text-white'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Career Ladder Framework (L1 - L5)
        </button>
        <button
          onClick={() => setActiveSubTab('openings')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
            activeSubTab === 'openings'
              ? 'bg-slate-900 text-white'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Internal Job Openings ({jobOpenings.length})
        </button>
      </div>

      {/* View 1: Pipeline */}
      {activeSubTab === 'pipeline' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {mobilityRecords.map(rec => {
              const isNominated = rec.status === 'nominated';
              const isApproved = rec.status === 'approved';
              const isRejected = rec.status === 'rejected';

              return (
                <div
                  key={rec.id}
                  className={`p-5 rounded-xl border transition-all ${
                    isApproved
                      ? 'bg-emerald-50/40 border-emerald-200'
                      : isNominated
                      ? 'bg-indigo-50/40 border-indigo-200'
                      : 'bg-slate-50 border-slate-200'
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-bold text-slate-900">{rec.employeeName}</span>
                      <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-indigo-100 text-indigo-800">
                        {rec.type.replace('_', ' ')}
                      </span>
                    </div>

                    <span className={`inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                      isApproved
                        ? 'bg-emerald-100 text-emerald-800'
                        : isRejected
                        ? 'bg-rose-100 text-rose-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}>
                      {isApproved && <CheckCircle2 className="h-3 w-3" />}
                      {isNominated && <Clock className="h-3 w-3" />}
                      {isRejected && <XCircle className="h-3 w-3" />}
                      <span>{rec.status}</span>
                    </span>
                  </div>

                  <div className="p-3 bg-white rounded-lg border border-slate-200/80 mb-3 space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-500">Current Role:</span>
                      <span className="font-semibold text-slate-700">{rec.currentTitle}</span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-500">Proposed Advancement:</span>
                      <span className="font-bold text-indigo-700">{rec.proposedTitle}</span>
                    </div>
                    <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-100">
                      <span className="text-slate-500">Comp Adjustment:</span>
                      <span className="font-mono font-bold text-emerald-600">+{rec.salaryAdjustmentPercent}%</span>
                    </div>
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed italic mb-3">
                    "{rec.justification}"
                  </p>

                  <div className="flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-slate-200/60">
                    <span>Effective: {rec.effectiveDate}</span>
                    {rec.approvedBy && <span>Approved by: {rec.approvedBy}</span>}
                  </div>

                  {/* Admin Sign-Off Buttons */}
                  {activeRole === 'admin' && isNominated && (
                    <div className="mt-4 pt-3 border-t border-slate-200 flex items-center justify-end space-x-2">
                      <button
                        onClick={() => reviewPromotion(rec.id, 'rejected', 'Requires further tenure review')}
                        className="px-3 py-1.5 rounded-lg text-xs font-semibold text-rose-700 hover:bg-rose-50 border border-rose-200 transition-colors"
                      >
                        Decline
                      </button>
                      <button
                        onClick={() => reviewPromotion(rec.id, 'approved', 'Signed off by Executive HR')}
                        className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 shadow-xs transition-colors"
                      >
                        <Check className="h-3.5 w-3.5" />
                        <span>Approve & Apply Compensation</span>
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* View 2: Career Matrix */}
      {activeSubTab === 'matrix' && (
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div>
            <h2 className="text-base font-bold text-slate-900">Career Competency & Progression Matrix</h2>
            <p className="text-xs text-slate-500">
              NexusHR standardized promotion benchmarks across individual contributor and leadership paths.
            </p>
          </div>

          <div className="space-y-3">
            {careerLevels.map(lvl => (
              <div key={lvl.level} className="p-4 rounded-xl border border-slate-200 hover:border-indigo-300 transition-all bg-slate-50/50">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                  <div className="flex items-center space-x-2.5">
                    <span className="px-2.5 py-1 rounded-md text-xs font-bold font-mono bg-indigo-600 text-white">
                      {lvl.level}
                    </span>
                    <h3 className="text-sm font-bold text-slate-900">{lvl.title}</h3>
                  </div>
                  <span className="text-xs font-mono font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    Target Band: {lvl.salaryBand}
                  </span>
                </div>

                <p className="text-xs text-slate-700 mb-2">
                  <strong className="text-slate-900">Scope of Impact:</strong> {lvl.scope}
                </p>
                <p className="text-xs text-indigo-900 bg-indigo-50/60 p-2.5 rounded-lg border border-indigo-100">
                  <strong className="text-indigo-950">Promotion Benchmark:</strong> {lvl.promotionCriteria}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* View 3: Openings */}
      {activeSubTab === 'openings' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {jobOpenings.map(job => (
            <div key={job.id} className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-indigo-100 text-indigo-800">
                    {job.department}
                  </span>
                  <span className="text-xs font-mono text-slate-400">{job.level}</span>
                </div>
                <h3 className="text-sm font-bold text-slate-900">{job.title}</h3>
                <p className="text-[11px] text-slate-500 mt-1">
                  {job.location} &bull; {job.openings} opening(s)
                </p>
                <p className="text-xs text-slate-600 mt-3 line-clamp-3">
                  {job.description}
                </p>

                <div className="mt-3 pt-3 border-t border-slate-100">
                  <span className="text-[11px] font-bold text-slate-700 block mb-1">Key Requirements:</span>
                  <ul className="text-[11px] text-slate-500 space-y-1 list-disc list-inside">
                    {job.requirements.map((r, i) => (
                      <li key={i} className="line-clamp-1">{r}</li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="mt-5 pt-3 border-t border-slate-100">
                <button
                  onClick={() => {
                    setNominateForm({
                      ...nominateForm,
                      proposedTitle: job.title,
                      targetDepartment: job.department,
                      type: 'internal_transfer',
                      justification: `Application for internal opening: ${job.title}`,
                    });
                    setIsNominateModalOpen(true);
                  }}
                  className="w-full py-2 rounded-lg text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 transition-colors flex items-center justify-center space-x-1"
                >
                  <span>Apply for Transfer</span>
                  <ArrowRight className="h-3 w-3" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal: Nominate for Promotion */}
      {isNominateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center space-x-2">
                <div className="p-2 rounded-lg bg-indigo-100 text-indigo-700">
                  <Sparkles className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Career Progression Nomination</h3>
                  <p className="text-xs text-slate-500">Recommend team member for advancement or internal transfer</p>
                </div>
              </div>
              <button
                onClick={() => setIsNominateModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleNominateSubmit} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Candidate
                </label>
                <select
                  value={nominateForm.employeeId}
                  onChange={e => setNominateForm({ ...nominateForm, employeeId: e.target.value })}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  {employees.map(e => (
                    <option key={e.id} value={e.id}>
                      {e.name} — Current: {e.jobTitle} ({e.department})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Movement Type
                  </label>
                  <select
                    value={nominateForm.type}
                    onChange={e => setNominateForm({ ...nominateForm, type: e.target.value as MobilityRecord['type'] })}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="promotion">Vertical Promotion</option>
                    <option value="internal_transfer">Department Transfer</option>
                    <option value="lateral_mobility">Lateral Career Shift</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Proposed Comp Bump (%)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="50"
                    value={nominateForm.salaryAdjustmentPercent}
                    onChange={e => setNominateForm({ ...nominateForm, salaryAdjustmentPercent: Number(e.target.value) })}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Proposed New Title
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Staff Frontend Architect"
                  value={nominateForm.proposedTitle}
                  onChange={e => setNominateForm({ ...nominateForm, proposedTitle: e.target.value })}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Target Department
                  </label>
                  <select
                    value={nominateForm.targetDepartment}
                    onChange={e => setNominateForm({ ...nominateForm, targetDepartment: e.target.value as Department })}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="Engineering">Engineering</option>
                    <option value="Product & Design">Product & Design</option>
                    <option value="People & HR">People & HR</option>
                    <option value="Sales & Marketing">Sales & Marketing</option>
                    <option value="Finance & Operations">Finance & Operations</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Effective Date
                  </label>
                  <input
                    type="date"
                    required
                    value={nominateForm.effectiveDate}
                    onChange={e => setNominateForm({ ...nominateForm, effectiveDate: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Business Justification & Impact Case
                </label>
                <textarea
                  rows={4}
                  required
                  placeholder="Detail candidate's leadership achievements, metric results, and demonstrated readiness for higher responsibilities..."
                  value={nominateForm.justification}
                  onChange={e => setNominateForm({ ...nominateForm, justification: e.target.value })}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="flex items-center justify-end space-x-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsNominateModalOpen(false)}
                  className="px-4 py-2 rounded-lg text-xs font-medium text-slate-700 hover:bg-slate-100 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 shadow-xs transition-colors"
                >
                  Submit Nomination
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
