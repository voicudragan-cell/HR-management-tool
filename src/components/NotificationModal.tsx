import React, { useState } from 'react';
import {
  Bell,
  CheckCheck,
  Clock,
  Sparkles,
  Calendar,
  UserCheck,
  DollarSign,
  X,
  Scan,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { useHR } from '../context/HRContext';
import { AppNotification } from '../types/hr';

interface NotificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateTab: (tab: string) => void;
}

export const NotificationModal: React.FC<NotificationModalProps> = ({
  isOpen,
  onClose,
  onNavigateTab,
}) => {
  const {
    notifications,
    markNotificationRead,
    markAllNotificationsRead,
    triggerAutomatedAlerts,
  } = useHR();

  const [filterType, setFilterType] = useState<string>('all');
  const [isScanning, setIsScanning] = useState(false);

  if (!isOpen) return null;

  const filteredNotifs = filterType === 'all'
    ? notifications
    : notifications.filter(n => n.type === filterType);

  const unreadCount = notifications.filter(n => !n.read).length;

  const handleScanDeadlines = async () => {
    setIsScanning(true);
    await triggerAutomatedAlerts();
    setTimeout(() => setIsScanning(false), 600);
  };

  const getIcon = (type: AppNotification['type']) => {
    switch (type) {
      case 'approval':
        return <Calendar className="h-4 w-4 text-amber-500" />;
      case 'deadline':
        return <Clock className="h-4 w-4 text-rose-500" />;
      case 'promotion':
        return <Sparkles className="h-4 w-4 text-purple-500" />;
      case 'onboarding':
        return <UserCheck className="h-4 w-4 text-blue-500" />;
      case 'payroll':
        return <DollarSign className="h-4 w-4 text-emerald-500" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 max-h-[90vh] flex flex-col">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center space-x-2">
            <div className="p-2 rounded-lg bg-indigo-100 text-indigo-700">
              <Bell className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-base font-bold text-slate-900">Automated Notification System</h3>
                {unreadCount > 0 && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800">
                    {unreadCount} Unread
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500">Live alerts for pending approvals and review deadlines</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Action Controls & Filter */}
        <div className="py-3 flex flex-wrap items-center justify-between gap-2 border-b border-slate-100">
          <div className="flex items-center space-x-1 overflow-x-auto no-scrollbar">
            {['all', 'approval', 'deadline', 'promotion', 'onboarding'].map(t => (
              <button
                key={t}
                onClick={() => setFilterType(t)}
                className={`px-2.5 py-1 rounded-lg text-xs capitalize transition-colors ${
                  filterType === t
                    ? 'bg-indigo-600 text-white font-semibold'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {t}
              </button>
            ))}
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handleScanDeadlines}
              disabled={isScanning}
              className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-lg text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 transition-colors"
              title="Scan database for approaching deadlines and pending approvals"
            >
              <Scan className={`h-3.5 w-3.5 ${isScanning ? 'animate-spin' : ''}`} />
              <span>{isScanning ? 'Scanning...' : 'Trigger Scan'}</span>
            </button>

            <button
              onClick={markAllNotificationsRead}
              className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-lg text-xs font-medium text-slate-600 hover:bg-slate-100 transition-colors"
            >
              <CheckCheck className="h-3.5 w-3.5" />
              <span>Mark all read</span>
            </button>
          </div>
        </div>

        {/* Notifications List */}
        <div className="flex-1 overflow-y-auto py-3 space-y-2.5 max-h-[460px]">
          {filteredNotifs.length === 0 ? (
            <div className="py-12 text-center">
              <CheckCircle2 className="h-8 w-8 text-emerald-500 mx-auto mb-2" />
              <p className="text-xs font-semibold text-slate-700">All caught up!</p>
              <p className="text-[11px] text-slate-400 mt-0.5">No notifications in this filter view.</p>
            </div>
          ) : (
            filteredNotifs.map(notif => (
              <div
                key={notif.id}
                onClick={() => {
                  if (!notif.read) markNotificationRead(notif.id);
                  if (notif.relatedTab) {
                    onNavigateTab(notif.relatedTab);
                    onClose();
                  }
                }}
                className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-start space-x-3 ${
                  notif.read
                    ? 'bg-white border-slate-200 opacity-75 hover:opacity-100'
                    : 'bg-indigo-50/40 border-indigo-200 hover:border-indigo-300 shadow-xs'
                }`}
              >
                <div className="p-2 rounded-lg bg-white border border-slate-200 shrink-0 mt-0.5">
                  {getIcon(notif.type)}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h4 className={`text-xs font-bold truncate ${notif.read ? 'text-slate-800' : 'text-indigo-950'}`}>
                      {notif.title}
                    </h4>
                    {!notif.read && (
                      <span className="h-2 w-2 rounded-full bg-indigo-600 shrink-0" />
                    )}
                  </div>
                  <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">
                    {notif.message}
                  </p>
                  <div className="flex items-center justify-between text-[10px] text-slate-400 mt-2">
                    <span>{notif.createdAt}</span>
                    {notif.relatedTab && (
                      <span className="text-indigo-600 font-semibold hover:underline">
                        Go to {notif.relatedTab} &rarr;
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-slate-100 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-colors"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};
