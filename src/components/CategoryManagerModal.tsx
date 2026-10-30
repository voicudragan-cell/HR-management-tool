import React, { useState } from 'react';
import {
  X,
  Plus,
  Trash2,
  FileText,
  CheckCircle2,
  FolderPlus,
  Edit2,
  Paperclip,
  ShieldCheck,
  ChevronRight,
  Layers,
  Sparkles
} from 'lucide-react';
import { useHR } from '../context/HRContext';
import { OnboardingCategory, TaskDocument } from '../types/hr';

interface CategoryManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CategoryManagerModal: React.FC<CategoryManagerModalProps> = ({
  isOpen,
  onClose,
}) => {
  const {
    onboardingCategories,
    addOnboardingCategory,
    updateOnboardingCategory,
    deleteOnboardingCategory,
    attachDocumentToCategory,
  } = useHR();

  const [activeCategoryId, setActiveCategoryId] = useState<string>(
    onboardingCategories[0]?.id || ''
  );

  const [newCatName, setNewCatName] = useState('');
  const [newCatDesc, setNewCatDesc] = useState('');
  const [newCatColor, setNewCatColor] = useState('indigo');
  const [isAddingCategory, setIsAddingCategory] = useState(false);

  // New Document Attachment state
  const [isAttachingDoc, setIsAttachingDoc] = useState(false);
  const [docForm, setDocForm] = useState({
    title: '',
    fileName: '',
    description: '',
    content: '',
    requiredComprehension: true,
  });

  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');

  if (!isOpen) return null;

  const activeCategory = onboardingCategories.find(c => c.id === activeCategoryId) || onboardingCategories[0];

  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) return;

    setSaveStatus('saving');
    const newId = await addOnboardingCategory({
      name: newCatName.trim(),
      description: newCatDesc.trim() || undefined,
      color: newCatColor,
      attachedDocuments: [],
    });

    setNewCatName('');
    setNewCatDesc('');
    setIsAddingCategory(false);
    setActiveCategoryId(newId);
    setSaveStatus('saved');
    setTimeout(() => setSaveStatus('idle'), 2000);
  };

  const handleCategoryFieldChange = async (catId: string, updates: Partial<OnboardingCategory>) => {
    setSaveStatus('saving');
    await updateOnboardingCategory(catId, updates);
    setSaveStatus('saved');
    setTimeout(() => setSaveStatus('idle'), 2000);
  };

  const handleDeleteCategory = async (catId: string) => {
    if (onboardingCategories.length <= 1) {
      alert('You must keep at least one onboarding category.');
      return;
    }
    if (window.confirm('Delete this onboarding category?')) {
      await deleteOnboardingCategory(catId);
      const remaining = onboardingCategories.filter(c => c.id !== catId);
      if (remaining.length > 0) {
        setActiveCategoryId(remaining[0].id);
      }
    }
  };

  const handleAttachDocument = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!docForm.title.trim() || !activeCategory) return;

    setSaveStatus('saving');
    await attachDocumentToCategory(activeCategory.id, {
      title: docForm.title.trim(),
      fileName: docForm.fileName.trim() || `${docForm.title.replace(/\s+/g, '_')}.pdf`,
      description: docForm.description.trim() || undefined,
      content: docForm.content.trim() || 'Document text not specified.',
      requiredComprehension: docForm.requiredComprehension,
      comprehensionConfirmed: false,
    });

    setDocForm({
      title: '',
      fileName: '',
      description: '',
      content: '',
      requiredComprehension: true,
    });
    setIsAttachingDoc(false);
    setSaveStatus('saved');
    setTimeout(() => setSaveStatus('idle'), 2000);
  };

  const handleRemoveDocument = async (docId: string) => {
    if (!activeCategory) return;
    const updated = (activeCategory.attachedDocuments || []).filter(d => d.id !== docId);
    await updateOnboardingCategory(activeCategory.id, { attachedDocuments: updated });
  };

  const colorOptions = [
    { id: 'indigo', label: 'Indigo', bg: 'bg-indigo-100 text-indigo-800 border-indigo-200' },
    { id: 'blue', label: 'Blue', bg: 'bg-blue-100 text-blue-800 border-blue-200' },
    { id: 'purple', label: 'Purple', bg: 'bg-purple-100 text-purple-800 border-purple-200' },
    { id: 'emerald', label: 'Emerald', bg: 'bg-emerald-100 text-emerald-800 border-emerald-200' },
    { id: 'amber', label: 'Amber', bg: 'bg-amber-100 text-amber-800 border-amber-200' },
    { id: 'rose', label: 'Rose', bg: 'bg-rose-100 text-rose-800 border-rose-200' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-3xl w-full p-6 shadow-2xl border border-slate-200 max-h-[92vh] flex flex-col">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="text-base font-bold text-slate-900">
                Onboarding Categories & Document Policies
              </h3>
              {saveStatus === 'saving' && (
                <span className="inline-flex items-center space-x-1 text-[11px] text-amber-600 font-medium">
                  <span className="h-2 w-2 rounded-full bg-amber-500 animate-ping" />
                  <span>Saving...</span>
                </span>
              )}
              {saveStatus === 'saved' && (
                <span className="inline-flex items-center space-x-1 text-[11px] text-emerald-600 font-semibold">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                  <span>Saved automatically</span>
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Add or edit categories, attach mandatory compliance documents requiring employee comprehension signatures.
            </p>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content Body: Left Column Categories, Right Column Details & Documents */}
        <div className="flex-1 overflow-hidden grid grid-cols-1 md:grid-cols-3 gap-5 py-4">
          
          {/* Categories List */}
          <div className="md:col-span-1 border-r border-slate-200 pr-4 flex flex-col h-full space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Categories ({onboardingCategories.length})
              </span>
              <button
                onClick={() => setIsAddingCategory(true)}
                className="inline-flex items-center space-x-1 text-xs font-semibold text-indigo-600 hover:text-indigo-800"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Add</span>
              </button>
            </div>

            {/* Add Category Quick Form */}
            {isAddingCategory && (
              <form onSubmit={handleCreateCategory} className="p-3 bg-indigo-50/70 border border-indigo-200 rounded-xl space-y-2">
                <input
                  type="text"
                  required
                  placeholder="Category Name"
                  value={newCatName}
                  onChange={(e) => setNewCatName(e.target.value)}
                  className="w-full text-xs px-2.5 py-1.5 border border-indigo-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                  autoFocus
                />
                <input
                  type="text"
                  placeholder="Short description (optional)"
                  value={newCatDesc}
                  onChange={(e) => setNewCatDesc(e.target.value)}
                  className="w-full text-xs px-2.5 py-1.5 border border-indigo-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                />
                <div className="flex items-center justify-between pt-1">
                  <div className="flex items-center space-x-1">
                    {colorOptions.map(c => (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => setNewCatColor(c.id)}
                        className={`h-4 w-4 rounded-full ${
                          c.id === 'indigo' ? 'bg-indigo-600' :
                          c.id === 'blue' ? 'bg-blue-600' :
                          c.id === 'purple' ? 'bg-purple-600' :
                          c.id === 'emerald' ? 'bg-emerald-600' :
                          c.id === 'amber' ? 'bg-amber-600' : 'bg-rose-600'
                        } ${newCatColor === c.id ? 'ring-2 ring-slate-800 ring-offset-1' : ''}`}
                      />
                    ))}
                  </div>

                  <div className="flex items-center space-x-1">
                    <button
                      type="button"
                      onClick={() => setIsAddingCategory(false)}
                      className="px-2 py-1 text-xs text-slate-500 hover:bg-white rounded"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-2.5 py-1 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded shadow-xs"
                    >
                      Save
                    </button>
                  </div>
                </div>
              </form>
            )}

            {/* List */}
            <div className="flex-1 overflow-y-auto space-y-1.5 pr-1 max-h-[420px]">
              {onboardingCategories.map(cat => {
                const isSelected = cat.id === activeCategory?.id;
                const docCount = (cat.attachedDocuments || []).length;

                return (
                  <button
                    key={cat.id}
                    onClick={() => setActiveCategoryId(cat.id)}
                    className={`w-full text-left p-2.5 rounded-xl border transition-all flex items-center justify-between ${
                      isSelected
                        ? 'border-indigo-600 bg-indigo-50 text-indigo-950 font-semibold shadow-xs'
                        : 'border-slate-200 hover:border-slate-300 bg-white text-slate-700'
                    }`}
                  >
                    <div className="truncate">
                      <div className="text-xs font-semibold truncate flex items-center space-x-1.5">
                        <span className={`h-2 w-2 rounded-full shrink-0 ${
                          cat.color === 'blue' ? 'bg-blue-500' :
                          cat.color === 'purple' ? 'bg-purple-500' :
                          cat.color === 'emerald' ? 'bg-emerald-500' :
                          cat.color === 'amber' ? 'bg-amber-500' :
                          cat.color === 'rose' ? 'bg-rose-500' : 'bg-indigo-500'
                        }`} />
                        <span className="truncate">{cat.name}</span>
                      </div>
                      <span className="text-[10px] text-slate-400 block truncate mt-0.5">
                        {docCount} document(s) attached
                      </span>
                    </div>

                    <ChevronRight className={`h-4 w-4 shrink-0 ${isSelected ? 'text-indigo-600' : 'text-slate-300'}`} />
                  </button>
                );
              })}
            </div>
          </div>

          {/* Category Details & Attached Documents */}
          <div className="md:col-span-2 overflow-y-auto space-y-4 pr-1">
            {activeCategory ? (
              <>
                {/* Category Fields (Auto-save) */}
                <div className="p-4 bg-slate-50/80 rounded-xl border border-slate-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                      Edit Category Details (Auto-saves to Firestore)
                    </span>
                    <button
                      onClick={() => handleDeleteCategory(activeCategory.id)}
                      className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors"
                      title="Delete category"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>

                  <div>
                    <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">
                      Category Name
                    </label>
                    <input
                      type="text"
                      value={activeCategory.name}
                      onChange={(e) => handleCategoryFieldChange(activeCategory.id, { name: e.target.value })}
                      className="w-full text-xs px-3 py-1.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 font-semibold bg-white text-slate-900"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">
                      Description & Scope
                    </label>
                    <input
                      type="text"
                      value={activeCategory.description || ''}
                      onChange={(e) => handleCategoryFieldChange(activeCategory.id, { description: e.target.value })}
                      placeholder="e.g. IT credentials, VPN setup, and encryption verification"
                      className="w-full text-xs px-3 py-1.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white text-slate-700"
                    />
                  </div>
                </div>

                {/* Attached Documents Section */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center space-x-1.5">
                        <Paperclip className="h-3.5 w-3.5 text-indigo-600" />
                        <span>Attached Documents & Required Reading</span>
                      </h4>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        Employees assigned tasks in this category must open, read, and confirm comprehension before completing.
                      </p>
                    </div>

                    <button
                      onClick={() => setIsAttachingDoc(true)}
                      className="inline-flex items-center space-x-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 transition-colors"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      <span>Attach Document</span>
                    </button>
                  </div>

                  {/* Add Document Sub-form */}
                  {isAttachingDoc && (
                    <form onSubmit={handleAttachDocument} className="p-4 bg-indigo-50/50 border border-indigo-200 rounded-xl space-y-3 animate-in fade-in">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-indigo-950">Attach Policy / Document</span>
                        <button
                          type="button"
                          onClick={() => setIsAttachingDoc(false)}
                          className="text-slate-400 hover:text-slate-600"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <input
                          type="text"
                          required
                          placeholder="Document Title (e.g. Code of Conduct)"
                          value={docForm.title}
                          onChange={(e) => setDocForm({ ...docForm, title: e.target.value })}
                          className="text-xs px-3 py-1.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                        />
                        <input
                          type="text"
                          placeholder="File Name (e.g. Policy_v2.pdf)"
                          value={docForm.fileName}
                          onChange={(e) => setDocForm({ ...docForm, fileName: e.target.value })}
                          className="text-xs px-3 py-1.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                        />
                      </div>

                      <input
                        type="text"
                        placeholder="Brief summary / instructions for the employee..."
                        value={docForm.description}
                        onChange={(e) => setDocForm({ ...docForm, description: e.target.value })}
                        className="w-full text-xs px-3 py-1.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                      />

                      <textarea
                        rows={5}
                        required
                        placeholder="Paste document text, agreement clauses, or compliance terms for employee to review..."
                        value={docForm.content}
                        onChange={(e) => setDocForm({ ...docForm, content: e.target.value })}
                        className="w-full text-xs p-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white font-mono"
                      />

                      <div className="flex items-center justify-between pt-1">
                        <label className="flex items-center space-x-2 text-xs text-slate-700 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={docForm.requiredComprehension}
                            onChange={(e) => setDocForm({ ...docForm, requiredComprehension: e.target.checked })}
                            className="rounded text-indigo-600 focus:ring-indigo-500"
                          />
                          <span className="font-semibold">Require Employee Comprehension Signature</span>
                        </label>

                        <div className="flex items-center space-x-2">
                          <button
                            type="button"
                            onClick={() => setIsAttachingDoc(false)}
                            className="px-3 py-1 text-xs text-slate-600 hover:bg-slate-200 rounded"
                          >
                            Cancel
                          </button>
                          <button
                            type="submit"
                            className="px-3 py-1 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded shadow-xs"
                          >
                            Attach Document
                          </button>
                        </div>
                      </div>
                    </form>
                  )}

                  {/* List of Attached Documents */}
                  {(!activeCategory.attachedDocuments || activeCategory.attachedDocuments.length === 0) ? (
                    <div className="p-6 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200">
                      <FileText className="h-6 w-6 text-slate-300 mx-auto mb-1" />
                      <p className="text-xs text-slate-500">No documents attached to this category yet.</p>
                      <button
                        onClick={() => setIsAttachingDoc(true)}
                        className="mt-2 text-xs font-semibold text-indigo-600 hover:underline"
                      >
                        + Attach first document
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {activeCategory.attachedDocuments.map(docItem => (
                        <div
                          key={docItem.id}
                          className="p-3 bg-white rounded-xl border border-slate-200 shadow-xs flex items-center justify-between"
                        >
                          <div className="flex items-start space-x-2.5 truncate mr-2">
                            <div className="p-1.5 rounded-lg bg-indigo-50 text-indigo-600 shrink-0 mt-0.5">
                              <FileText className="h-4 w-4" />
                            </div>
                            <div className="truncate">
                              <div className="flex items-center space-x-1.5">
                                <span className="text-xs font-bold text-slate-900 truncate">
                                  {docItem.title}
                                </span>
                                {docItem.requiredComprehension && (
                                  <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-100 text-amber-800 uppercase">
                                    Sign Required
                                  </span>
                                )}
                              </div>
                              <span className="text-[10px] text-slate-400 block truncate mt-0.5">
                                {docItem.fileName || 'document.pdf'} &bull; {docItem.description || 'Mandatory policy review'}
                              </span>
                            </div>
                          </div>

                          <button
                            onClick={() => handleRemoveDocument(docItem.id)}
                            className="p-1 text-slate-400 hover:text-rose-600 rounded transition-colors shrink-0"
                            title="Remove document"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="p-8 text-center text-xs text-slate-400">
                Select or create a category to manage details.
              </div>
            )}
          </div>

        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
          <span className="text-xs text-slate-500">
            Categories immediately populate in all task creation and editing dropdowns.
          </span>
          <button
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
