import React, { useState, useEffect } from 'react';
import { CourseRegistration, StudentProfile, TimetableSlot, AdminNotification, UserFeedback, UserRole, AdvisorProfile } from '../types';
import { 
  ShieldCheck, MessageSquarePlus, Shield, FileSignature, Key, Users 
} from 'lucide-react';
import { SlotManagementPanel } from './admin/SlotManagementPanel';
import { NotificationPanel } from './admin/NotificationPanel';
import { FeedbackPanel } from './admin/FeedbackPanel';
import { PolicyPanel } from './admin/PolicyPanel';
import { EndorsementPanel } from './admin/EndorsementPanel';
import { RegistrationManager } from './admin/RegistrationManager';

interface AdminDashboardProps {
  masterSlots: TimetableSlot[];
  onAddMasterSlot?: (slot: TimetableSlot) => void;
  onDeleteMasterSlot?: (id: string) => void;
  notifications: AdminNotification[];
  onAddNotification?: (message: string, type: AdminNotification['type']) => void;
  onToggleNotification?: (id: string, active: boolean) => void;
  onDeleteNotification?: (id: string) => void;
  registrations: CourseRegistration[];
  onUpdateRegistrationStatus?: (id: string, status: 'APPROVED' | 'REJECTED', notes: string) => void;
  userRole: UserRole;
  studentProfile: StudentProfile;
  advisorProfile?: AdvisorProfile | null;
  selectedRepeatCourses: string[];
  selectedAddons: Record<string, string>;
  paEndorsement: { endorsed: boolean; notes: string; date: string; signatureCode: string } | null;
  onEndorse: (notes: string) => void;
  onResetEndorsement: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  masterSlots,
  onAddMasterSlot,
  onDeleteMasterSlot,
  notifications,
  onAddNotification,
  onToggleNotification,
  onDeleteNotification,
  registrations,
  onUpdateRegistrationStatus,
  userRole,
  studentProfile,
  advisorProfile,
  selectedRepeatCourses,
  selectedAddons,
  paEndorsement,
  onEndorse,
  onResetEndorsement
}) => {
  const [activeTab, setActiveTab] = useState<'slots' | 'notifs' | 'feedback' | 'policies' | 'endorse' | 'registrations'>(
    userRole === 'ADVISOR' ? 'registrations' : 'slots'
  );
  const [userFeedback, setUserFeedback] = useState<UserFeedback[]>([]);
  const [advisorNotesText, setAdvisorNotesText] = useState('');

  useEffect(() => {
    if (paEndorsement) {
      setAdvisorNotesText(paEndorsement.notes);
    }
  }, [paEndorsement]);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('jkm_user_feedback');
      if (saved) {
        setUserFeedback(JSON.parse(saved) as UserFeedback[]);
      }
    } catch (e) {
      console.error(e);
    }
  }, [activeTab]);

  return (
    <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-lg space-y-4 no-print">

      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-slate-100 pb-3 gap-3">
        <div className="flex items-center space-x-2.5">
          <div className={`p-1.5 rounded-lg border shadow-sm ${
            userRole === 'ADMIN'
              ? 'bg-amber-100 text-amber-700 border-amber-300'
              : 'bg-purple-100 text-purple-700 border-purple-300'
          }`}>
            {userRole === 'ADMIN' ? <ShieldCheck className="w-5 h-5" /> : <Shield className="w-5 h-5" />}
          </div>
          <div>
            <h3 className="font-black text-slate-900 text-sm">
              {userRole === 'ADMIN' ? 'Academic Administrator Portal' : 'Academic Advisor Control Panel'}
            </h3>
            <p className="text-[11px] text-slate-500 font-bold">
              {userRole === 'ADMIN'
                ? 'Manage master timetable database, broadcast registration deadlines, and review student feedback.'
                : `Review student repeat selections for ${advisorProfile?.assignedSection || 'assigned sections'}, check class collision status, and endorse registration slips.`}
            </p>
          </div>
        </div>

        {/* TABS */}
        <div className="flex flex-wrap gap-1 bg-slate-50 p-1 rounded-lg border border-slate-200 text-[11px] shadow-inner">
          <button
            onClick={() => setActiveTab('registrations')}
            className={`px-2.5 py-1 rounded transition flex items-center space-x-1 border ${
              activeTab === 'registrations' ? 'bg-cyan-600 text-white border-cyan-700 font-black shadow-sm' : 'text-slate-500 hover:text-slate-900 border-transparent font-extrabold'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Registrations ({registrations.filter(r => r.status === 'PENDING').length})</span>
          </button>

          <button
            onClick={() => setActiveTab('endorse')}
            className={`px-2.5 py-1 rounded transition flex items-center space-x-1 border ${
              activeTab === 'endorse' ? 'bg-cyan-600 text-white border-cyan-700 font-black shadow-sm' : 'text-slate-500 hover:text-slate-900 border-transparent font-extrabold'
            }`}
          >
            <FileSignature className="w-3.5 h-3.5" />
            <span>PA Endorsements</span>
          </button>

          {userRole === 'ADMIN' && (
            <button
              onClick={() => setActiveTab('policies')}
              className={`px-2.5 py-1 rounded transition flex items-center space-x-1 border ${
                activeTab === 'policies' ? 'bg-purple-600 text-white border-purple-700 font-black shadow-sm' : 'text-slate-500 hover:text-slate-900 border-transparent font-extrabold'
              }`}
            >
              <Key className="w-3.5 h-3.5" />
              <span>Security Policies (PBAC)</span>
            </button>
          )}

          {userRole === 'ADMIN' && (
            <button
              onClick={() => setActiveTab('slots')}
              className={`px-2.5 py-1 rounded transition border ${
                activeTab === 'slots'
                  ? 'bg-amber-600 text-white border-amber-700 font-black shadow-sm'
                  : 'text-slate-500 hover:text-slate-900 border-transparent font-extrabold'
              }`}
            >
              Manage Slots
            </button>
          )}

          {userRole === 'ADMIN' && (
            <button
              onClick={() => setActiveTab('notifs')}
              className={`px-2.5 py-1 rounded transition border ${
                activeTab === 'notifs'
                  ? 'bg-amber-600 text-white border-amber-700 font-black shadow-sm'
                  : 'text-slate-500 hover:text-slate-900 border-transparent font-extrabold'
              }`}
            >
              Broadcast Notices
            </button>
          )}

          <button
            onClick={() => setActiveTab('feedback')}
            className={`px-2.5 py-1 rounded transition flex items-center space-x-1 border ${
              activeTab === 'feedback'
                ? userRole === 'ADMIN'
                  ? 'bg-amber-600 text-white border-amber-700 font-black shadow-sm'
                  : 'bg-white text-slate-900 border-slate-300 font-black shadow-sm'
                : 'text-slate-500 hover:text-slate-900 border-transparent font-extrabold'
            }`}
          >
            <MessageSquarePlus className="w-3.5 h-3.5" />
            <span>Feedback ({userFeedback.length})</span>
          </button>
        </div>
      </div>

      {/* CONTENT AREA */}
      <div className="mt-4">
        {activeTab === 'registrations' && (
          <RegistrationManager 
            registrations={registrations}
            onUpdateStatus={onUpdateRegistrationStatus || (() => {})}
            userRole={userRole}
            advisorSection={advisorProfile?.assignedSection}
          />
        )}

        {activeTab === 'slots' && (
          <SlotManagementPanel 
            masterSlots={masterSlots} 
            onAddSlot={onAddMasterSlot}
            onDeleteSlot={onDeleteMasterSlot}
            userRole={userRole} 
          />
        )}
        
        {activeTab === 'notifs' && (
          <NotificationPanel 
            notifications={notifications} 
            onAddNotification={onAddNotification}
            onToggleNotification={onToggleNotification}
            onDeleteNotification={onDeleteNotification}
            userRole={userRole} 
          />
        )}
        
        {activeTab === 'feedback' && (
          <FeedbackPanel 
            userFeedback={userFeedback} 
            setUserFeedback={setUserFeedback} 
          />
        )}
        
        {activeTab === 'policies' && (
          <PolicyPanel userRole={userRole} />
        )}
        
        {activeTab === 'endorse' && (
          <EndorsementPanel 
            studentProfile={studentProfile}
            selectedRepeatCourses={selectedRepeatCourses}
            selectedAddons={selectedAddons}
            paEndorsement={paEndorsement}
            advisorNotesText={advisorNotesText}
            setAdvisorNotesText={setAdvisorNotesText}
            onEndorse={onEndorse}
            onResetEndorsement={onResetEndorsement}
            userRole={userRole}
          />
        )}
      </div>

    </div>
  );
};
