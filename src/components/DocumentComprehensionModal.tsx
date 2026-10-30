import React, { useState } from 'react';
import {
  FileText,
  CheckCircle2,
  AlertCircle,
  X,
  ShieldCheck,
  Calendar,
  UserCheck,
  Download,
  Printer,
  Lock
} from 'lucide-react';
import { TaskDocument } from '../types/hr';

interface DocumentComprehensionModalProps {
  document: TaskDocument | null;
  taskId?: string;
  isOpen: boolean;
  onClose: () => void;
  onConfirmComprehension?: (taskId: string, documentId: string) => Promise<void>;
  employeeName: string;
}

export const DocumentComprehensionModal: React.FC<DocumentComprehensionModalProps> = ({
  document,
  taskId,
  isOpen,
  onClose,
  onConfirmComprehension,
  employeeName,
}) => {
  const [hasAgreed, setHasAgreed] = useState(false);
  const [signatureName, setSignatureName] = useState(employeeName || '');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen || !document) return null;

  const isAlreadyConfirmed = document.comprehensionConfirmed;

  const handleConfirm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!hasAgreed || !taskId || !onConfirmComprehension) return;

    setIsSubmitting(true);
    try {
      await onConfirmComprehension(taskId, document.id);
      setIsSubmitting(false);
      onClose();
    } catch (err) {
      console.error('Error confirming comprehension:', err);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 max-h-[92vh] flex flex-col animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-indigo-100 text-indigo-700 shrink-0">
              <FileText className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-base font-bold text-slate-900 line-clamp-1">
                  {document.title}
                </h3>
                {document.requiredComprehension && (
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 uppercase shrink-0">
                    Comprehension Required
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                {document.fileName || 'Attached Onboarding Document'} &bull; Please review thoroughly before signing
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Document Content Reader Body */}
        <div className="flex-1 overflow-y-auto my-4 p-5 bg-slate-50/75 rounded-xl border border-slate-200 text-slate-800 space-y-3 font-sans">
          <div className="flex items-center justify-between text-xs text-slate-400 pb-2 border-b border-slate-200">
            <span>Official NexusHR Document &bull; Internal Compliance</span>
            <span className="flex items-center space-x-1">
              <Lock className="h-3 w-3 text-slate-400" />
              <span>Verified Authenticity</span>
            </span>
          </div>

          {document.description && (
            <p className="text-xs font-semibold text-indigo-900 bg-indigo-50/70 p-2.5 rounded-lg border border-indigo-100">
              Summary: {document.description}
            </p>
          )}

          <div className="text-xs leading-relaxed whitespace-pre-wrap font-mono text-slate-800 bg-white p-4 rounded-lg border border-slate-200 shadow-xs max-h-72 overflow-y-auto">
            {document.content || 'Document content not specified.'}
          </div>
        </div>

        {/* Comprehension Confirmation Section */}
        {isAlreadyConfirmed ? (
          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between text-xs">
            <div className="flex items-center space-x-2.5">
              <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
              <div>
                <span className="font-bold text-emerald-950 block">Comprehension Verified & Signed</span>
                <span className="text-[11px] text-emerald-800">
                  Confirmed by <strong>{document.confirmedBy || employeeName}</strong> on {document.confirmedAt}
                </span>
              </div>
            </div>
            <button
              onClick={onClose}
              className="px-4 py-1.5 rounded-lg text-xs font-semibold text-emerald-900 bg-emerald-100 hover:bg-emerald-200 transition-colors"
            >
              Close
            </button>
          </div>
        ) : (
          <form onSubmit={handleConfirm} className="space-y-4 pt-2 border-t border-slate-100">
            <div className="p-3.5 bg-amber-50/60 border border-amber-200 rounded-xl space-y-2">
              <div className="flex items-start space-x-2.5">
                <input
                  type="checkbox"
                  id="confirm-chk"
                  required
                  checked={hasAgreed}
                  onChange={(e) => setHasAgreed(e.target.checked)}
                  className="mt-0.5 h-4 w-4 rounded text-indigo-600 focus:ring-indigo-500 border-slate-300"
                />
                <label htmlFor="confirm-chk" className="text-xs text-amber-950 font-medium leading-normal cursor-pointer">
                  I hereby certify that I have read in full, understand, and agree to the policies, obligations, and standards detailed in <strong>{document.title}</strong>.
                </label>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2">
                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-500 mb-0.5">
                    Electronic Signature
                  </label>
                  <input
                    type="text"
                    required
                    value={signatureName}
                    onChange={(e) => setSignatureName(e.target.value)}
                    placeholder="Type your full legal name"
                    className="w-full text-xs px-3 py-1.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-500 mb-0.5">
                    Timestamp
                  </label>
                  <input
                    type="text"
                    disabled
                    value={new Date().toLocaleDateString() + ' ' + new Date().toLocaleTimeString()}
                    className="w-full text-xs px-3 py-1.5 border border-slate-200 rounded-lg bg-slate-100 text-slate-500 font-mono"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-1">
              <button
                type="button"
                onClick={() => window.print()}
                className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-100 border border-slate-200 transition-colors"
              >
                <Printer className="h-3.5 w-3.5" />
                <span>Print Copy</span>
              </button>

              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-lg text-xs font-medium text-slate-600 hover:bg-slate-100 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!hasAgreed || isSubmitting}
                  className={`inline-flex items-center space-x-1.5 px-4 py-2 rounded-lg text-xs font-bold text-white transition-all shadow-xs ${
                    hasAgreed && !isSubmitting
                      ? 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/20'
                      : 'bg-slate-400 cursor-not-allowed opacity-60'
                  }`}
                >
                  <ShieldCheck className="h-4 w-4" />
                  <span>{isSubmitting ? 'Recording Signature...' : 'Confirm Comprehension & Sign'}</span>
                </button>
              </div>
            </div>
          </form>
        )}

      </div>
    </div>
  );
};
