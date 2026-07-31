import React, { useState } from 'react';
import { AdminNotification } from '../types';
import { AlertCircle, Calendar, X, ChevronRight, Bell } from 'lucide-react';

interface NotificationBannerProps {
  notifications: AdminNotification[];
}

export const NotificationBanner: React.FC<NotificationBannerProps> = ({ notifications }) => {
  const [dismissed, setDismissed] = useState<string[]>([]);

  const activeNotifs = notifications.filter(n => n.active && !dismissed.includes(n.id));

  if (activeNotifs.length === 0) return null;

  return (
    <div className="space-y-1.5 no-print">
      {activeNotifs.map(notif => (
        <div
          key={notif.id}
          className={`p-2.5 rounded-lg border flex items-start justify-between space-x-2 text-xs transition shadow-sm ${
            notif.type === 'deadline'
              ? 'bg-amber-100 border-amber-300 text-amber-900'
              : notif.type === 'warning'
              ? 'bg-rose-100 border-rose-300 text-rose-900'
              : 'bg-blue-100 border-blue-300 text-blue-900'
          }`}
        >
          <div className="flex items-start space-x-2">
            <div className={`p-1 rounded mt-0.5 ${
              notif.type === 'deadline' ? 'bg-amber-200 text-amber-700' : 'bg-blue-200 text-blue-700'
            }`}>
              <Bell className="w-3.5 h-3.5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-extrabold text-slate-900 text-xs">{notif.title}</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-white/80 border border-slate-300 font-mono text-slate-700 font-bold">
                  {notif.date}
                </span>
              </div>
              <p className="mt-0.5 text-slate-800 leading-tight text-[11px] font-medium">{notif.message}</p>
            </div>
          </div>

          <button
            onClick={() => setDismissed([...dismissed, notif.id])}
            className="p-1 rounded hover:bg-black/5 text-slate-500 hover:text-slate-900 transition"
            title="Dismiss notice"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      ))}
    </div>
  );
};
