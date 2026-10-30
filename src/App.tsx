import React, { useState } from 'react';
import { HRProvider, useHR } from './context/HRContext';
import { Header } from './components/Header';
import { DashboardTab } from './components/DashboardTab';
import { OnboardingTab } from './components/OnboardingTab';
import { PerformanceTab } from './components/PerformanceTab';
import { LeaveTab } from './components/LeaveTab';
import { PayrollTab } from './components/PayrollTab';
import { MobilityTab } from './components/MobilityTab';
import { EmployeesTab } from './components/EmployeesTab';
import { NotificationModal } from './components/NotificationModal';
import { ReportModal } from './components/ReportModal';
import {
  ShieldCheck,
  RotateCcw,
  Sparkles,
  CloudCheck,
  CheckCircle2,
  Lock,
  Layers
} from 'lucide-react';

const AppContent: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [isNotifOpen, setIsNotifOpen] = useState<boolean>(false);
  const [isReportOpen, setIsReportOpen] = useState<boolean>(false);

  const {
    activeProfile,
    activeRole,
    isOnline,
    isLoading,
    clearToBlankStart,
  } = useHR();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white">
        <div className="text-center space-y-3">
          <div className="h-12 w-12 rounded-xl bg-indigo-600 flex items-center justify-center text-white mx-auto animate-pulse">
            <Layers className="h-6 w-6" />
          </div>
          <p className="text-sm font-semibold tracking-wide text-slate-300">
            Initializing NexusHR Enterprise Cloud...
          </p>
          <span className="text-xs text-slate-500">Connecting to Firestore secure database</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/80 flex flex-col font-sans selection:bg-indigo-600 selection:text-white">
      {/* Top Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenNotifications={() => setIsNotifOpen(true)}
        onOpenReportModal={() => setIsReportOpen(true)}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'dashboard' && (
          <DashboardTab
            onNavigateTab={setActiveTab}
            onOpenReportModal={() => setIsReportOpen(true)}
          />
        )}
        {activeTab === 'onboarding' && <OnboardingTab />}
        {activeTab === 'performance' && <PerformanceTab />}
        {activeTab === 'leave' && <LeaveTab />}
        {activeTab === 'payroll' && <PayrollTab />}
        {activeTab === 'mobility' && <MobilityTab />}
        {activeTab === 'employees' && <EmployeesTab />}
      </main>

      {/* Footer Info & Auto-save Status */}
      <footer className="bg-white border-t border-slate-200 mt-auto py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <div className="flex items-center space-x-2">
            <ShieldCheck className="h-4 w-4 text-indigo-600" />
            <span>
              NexusHR &bull; Attribute-Based Access Control (ABAC) Active &bull;
              Session: <strong className="text-slate-800">{activeProfile.name}</strong> ({activeRole.toUpperCase()})
            </span>
          </div>

          <div className="flex items-center space-x-4">
            <span className="flex items-center space-x-1.5 text-emerald-600 font-medium">
              <CheckCircle2 className="h-3.5 w-3.5" />
              <span>All changes automatically saved to Firestore</span>
            </span>

            <button
              onClick={() => {
                if (window.confirm('Clean Slate: Purge any old test items and reset to blank start with only current employees?')) {
                  clearToBlankStart();
                }
              }}
              className="inline-flex items-center space-x-1 text-slate-400 hover:text-slate-600 transition-colors"
              title="Clean slate: only current employees, no open or old items"
            >
              <RotateCcw className="h-3 w-3" />
              <span>Blank Start Reset</span>
            </button>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <NotificationModal
        isOpen={isNotifOpen}
        onClose={() => setIsNotifOpen(false)}
        onNavigateTab={setActiveTab}
      />

      <ReportModal
        isOpen={isReportOpen}
        onClose={() => setIsReportOpen(false)}
      />
    </div>
  );
};

export default function App() {
  return (
    <HRProvider>
      <AppContent />
    </HRProvider>
  );
}
