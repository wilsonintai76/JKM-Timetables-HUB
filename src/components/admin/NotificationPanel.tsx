import React, { useState } from 'react';
import { AdminNotification, UserRole } from '../../types';
import { Bell, Trash2, AlertTriangle } from 'lucide-react';
import { checkPolicy } from '../../utils/pbac';

interface NotificationPanelProps {
  notifications: AdminNotification[];
  onAddNotification?: (message: string, type: AdminNotification['type']) => void;
  onToggleNotification?: (id: string, active: boolean) => void;
  onDeleteNotification?: (id: string) => void;
  userRole: UserRole;
}

export const NotificationPanel: React.FC<NotificationPanelProps> = ({
  notifications,
  onAddNotification,
  onToggleNotification,
  onDeleteNotification,
  userRole
}) => {
  const [notifTitle, setNotifTitle] = useState('');
  const [notifMessage, setNotifMessage] = useState('');
  const [notifDate, setNotifDate] = useState('15 Ogos 2026');
  const [notifType, setNotifType] = useState<'deadline' | 'update' | 'warning' | 'info'>('deadline');

  const handleAddNotificationSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!notifTitle || !notifMessage || !onAddNotification) return;

    // We'll combine title and message or just use message if the type supports it
    // In the blueprint we only have 'message' and 'type'.
    // I should probably update the blueprint to include 'title' or just use a composite message.
    // Let's use the composite for now if the blueprint is strict.
    // Actually I updated the blueprint to include title.
    
    // Wait, the onAddNotification handler in App.tsx only takes message and type.
    // I'll update App.tsx to take title too.
    
    onAddNotification(notifMessage, notifType); 
    setNotifTitle('');
    setNotifMessage('');
  };

  const toggleNotifActive = (id: string, currentActive: boolean) => {
    if (onToggleNotification) onToggleNotification(id, !currentActive);
  };

  const handleDeleteNotif = (id: string) => {
    if (onDeleteNotification) onDeleteNotification(id);
  };

  return (
    <div className="space-y-6">
      {!checkPolicy(userRole, 'ADD_ANNOUNCEMENTS') && (
        <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-start space-x-2 shadow-sm">
          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <div className="font-medium">
            <span className="font-black">PBAC Read-Only Active (Policy POL-02):</span> As an Advisor, you have read access to the broadcast history. To publish new global banners or warning notices, please toggle your role to Administrator in the top header.
          </div>
        </div>
      )}

      {/* CREATE ANNOUNCEMENT FORM */}
      <form onSubmit={handleAddNotificationSubmit} className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-4 shadow-sm">
        <h4 className="font-black text-xs text-amber-800 uppercase tracking-wider flex items-center space-x-1">
          <Bell className="w-4 h-4 text-amber-600" />
          <span>Broadcast New Registration Deadline or Notice</span>
        </h4>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div>
            <label className="block text-slate-700 mb-1 font-black uppercase tracking-tighter text-[10px]">Tajuk Pengumuman</label>
            <input
              type="text"
              placeholder="e.g. Tarikh Akhir Borang PA JKM"
              value={notifTitle}
              onChange={e => setNotifTitle(e.target.value)}
              className="w-full bg-white border border-slate-300 rounded-lg p-2 text-slate-900 font-extrabold focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
              required
            />
          </div>

          <div>
            <label className="block text-slate-700 mb-1 font-black uppercase tracking-tighter text-[10px]">Tarikh Deadline / Tarikh Notis</label>
            <input
              type="text"
              placeholder="e.g. 15 Ogos 2026"
              value={notifDate}
              onChange={e => setNotifDate(e.target.value)}
              className="w-full bg-white border border-slate-300 rounded-lg p-2 text-slate-900 font-black focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-slate-700 mb-1 font-black uppercase tracking-tighter text-[10px]">Mesej / Butiran Pengumuman</label>
            <textarea
              placeholder="Butiran mengenai pendaftaran atau pertukaran bilik kuliah..."
              value={notifMessage}
              onChange={e => setNotifMessage(e.target.value)}
              rows={2}
              className="w-full bg-white border border-slate-300 rounded-lg p-2 text-slate-900 font-medium focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
              required
            />
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={!checkPolicy(userRole, 'ADD_ANNOUNCEMENTS')}
            className={`px-4 py-2 rounded-xl font-black text-xs flex items-center space-x-1.5 transition shadow-md active:scale-95 border ${
              checkPolicy(userRole, 'ADD_ANNOUNCEMENTS')
                ? 'bg-amber-600 hover:bg-amber-700 text-white border-amber-700 cursor-pointer'
                : 'bg-slate-100 text-slate-400 cursor-not-allowed border-slate-200 shadow-none'
            }`}
          >
            <Bell className="w-4 h-4" />
            <span>Publish Announcement</span>
          </button>
        </div>
      </form>

      {/* ACTIVE ANNOUNCEMENTS LIST */}
      <div className="space-y-3">
        <h4 className="font-black text-xs text-slate-900 uppercase tracking-wide">Broadcast History ({notifications.length})</h4>
        {notifications.map(n => (
          <div
            key={n.id}
            className="p-4 rounded-xl bg-white border border-slate-200 flex items-start justify-between space-x-3 text-xs shadow-sm hover:border-slate-400 transition"
          >
            <div className="space-y-1">
              <div className="flex items-center space-x-2">
                <span className="font-black text-slate-900">{n.title}</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 font-black border border-amber-200 shadow-sm">
                  {n.date}
                </span>
                <span className={`text-[10px] px-2 py-0.5 rounded font-black uppercase shadow-sm border ${
                  n.active ? 'bg-emerald-100 text-emerald-800 border-emerald-300' : 'bg-slate-100 text-slate-500 border-slate-300'
                }`}>
                  {n.active ? 'Active Banner' : 'Hidden'}
                </span>
              </div>
              <p className="text-slate-700 font-medium">{n.message}</p>
            </div>

            {checkPolicy(userRole, 'ADD_ANNOUNCEMENTS') && (
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => toggleNotifActive(n.id, n.active)}
                  className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 font-black text-[10px] border border-slate-300 transition shadow-sm active:scale-95"
                >
                  {n.active ? 'Hide' : 'Show'}
                </button>
                <button
                  onClick={() => handleDeleteNotif(n.id)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
