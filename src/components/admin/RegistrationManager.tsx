import React, { useState } from 'react';
import { CourseRegistration, ThemePreferences } from '../../types';
import { getThemePalette } from '../../utils/theme';
import { 
  Users, 
  Search, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  FileText, 
  Filter,
  MoreVertical,
  ExternalLink
} from 'lucide-react';

interface RegistrationManagerProps {
  registrations: CourseRegistration[];
  onUpdateStatus: (id: string, status: 'APPROVED' | 'REJECTED', notes: string) => void;
  themePrefs?: ThemePreferences;
  userRole?: string;
  advisorSection?: string;
}

export const RegistrationManager: React.FC<RegistrationManagerProps> = ({
  registrations,
  onUpdateStatus,
  themePrefs,
  userRole,
  advisorSection
}) => {
  const style = getThemePalette(themePrefs?.palette);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'PENDING' | 'APPROVED' | 'REJECTED'>('ALL');
  const [scopeFilter, setScopeFilter] = useState<'MY_SECTION' | 'ALL'>(userRole === 'ADVISOR' ? 'MY_SECTION' : 'ALL');
  const [selectedReg, setSelectedReg] = useState<CourseRegistration | null>(null);
  const [notes, setNotes] = useState('');

  const filtered = registrations.filter(r => {
    const matchesSearch = r.studentName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          r.matrixNo.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || r.status === statusFilter;
    const matchesScope = scopeFilter === 'ALL' || (userRole === 'ADVISOR' && r.baseSection === advisorSection);
    return matchesSearch && matchesStatus && matchesScope;
  });

  const handleAction = (status: 'APPROVED' | 'REJECTED') => {
    if (selectedReg) {
      onUpdateStatus(selectedReg.id, status, notes);
      setSelectedReg(null);
      setNotes('');
    }
  };

  return (
    <div className="space-y-4 font-sans">
      <div className={`${style.cardBgClass} rounded-xl p-4 border shadow-sm flex flex-wrap items-center justify-between gap-4`}>
        <div className="flex items-center space-x-3">
          <div className={`p-2 ${style.accentBg} bg-opacity-10 rounded-lg border ${style.borderColor}`}>
            <Users className={`w-5 h-5 ${style.accentText}`} />
          </div>
          <div>
            <h3 className={`font-black ${style.textPrimary} text-sm uppercase tracking-tight`}>Course Registration Manager</h3>
            <p className={`text-[11px] ${style.textSecondary} font-bold`}>Manage student timetable submissions and advisor endorsements.</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search student or matrix..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`pl-8 pr-4 py-1.5 rounded-lg border ${style.borderColor} ${style.bgMuted} text-xs font-bold w-48 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 transition-all`}
            />
          </div>

          <div className="flex items-center space-x-1 p-1 bg-slate-100 rounded-lg border border-slate-200">
            {userRole === 'ADVISOR' && (
              <>
                <button
                  onClick={() => setScopeFilter('MY_SECTION')}
                  className={`px-3 py-1 rounded text-[10px] font-black transition-all ${
                    scopeFilter === 'MY_SECTION' ? 'bg-cyan-600 text-white shadow-sm' : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  My Class ({advisorSection})
                </button>
                <button
                  onClick={() => setScopeFilter('ALL')}
                  className={`px-3 py-1 rounded text-[10px] font-black transition-all ${
                    scopeFilter === 'ALL' ? 'bg-slate-700 text-white shadow-sm' : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  All Classes
                </button>
                <div className="w-[1px] h-3 bg-slate-300 mx-1"></div>
              </>
            )}
            {(['ALL', 'PENDING', 'APPROVED', 'REJECTED'] as const).map(f => (
              <button
                key={f}
                onClick={() => setStatusFilter(f)}
                className={`px-3 py-1 rounded text-[10px] font-black transition-all ${
                  statusFilter === f ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3">
        {filtered.length === 0 ? (
          <div className={`${style.cardBgClass} rounded-xl p-12 text-center border dashed opacity-60 flex flex-col items-center gap-2`}>
            <Filter className="w-8 h-8 text-slate-300" />
            <p className="text-xs font-black text-slate-400 uppercase tracking-widest">No registrations found matching criteria</p>
          </div>
        ) : (
          filtered.map(reg => (
            <div key={reg.id} className={`${style.cardBgClass} rounded-xl p-4 border shadow-sm hover:shadow-md transition-all group border-l-4 ${
              reg.status === 'APPROVED' ? 'border-l-emerald-500' : 
              reg.status === 'REJECTED' ? 'border-l-rose-500' : 'border-l-amber-500'
            }`}>
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="flex items-start space-x-4">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-black text-xs border-2 shadow-inner ${
                    reg.status === 'APPROVED' ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 
                    reg.status === 'REJECTED' ? 'bg-rose-50 border-rose-200 text-rose-700' : 'bg-amber-50 border-amber-200 text-amber-700'
                  }`}>
                    {reg.studentName.charAt(0)}
                  </div>
                  <div className="space-y-0.5">
                    <div className="flex items-center space-x-2">
                      <h4 className={`font-black ${style.textPrimary} text-sm`}>{reg.studentName}</h4>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-black uppercase tracking-tighter ${
                        reg.status === 'APPROVED' ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' : 
                        reg.status === 'REJECTED' ? 'bg-rose-100 text-rose-800 border border-rose-200' : 'bg-amber-100 text-amber-800 border border-amber-200'
                      }`}>
                        {reg.status}
                      </span>
                    </div>
                    <div className="flex items-center space-x-3 text-[10px] text-slate-500 font-bold font-mono">
                      <span>{reg.matrixNo}</span>
                      <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                      <span>{reg.baseSection}</span>
                      <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                      <span>{reg.totalCredits} Credits</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <div className="text-right mr-2 hidden sm:block">
                    <p className="text-[10px] text-slate-400 font-black uppercase tracking-tighter">Submitted At</p>
                    <p className="text-[11px] text-slate-700 font-bold font-mono">{new Date(reg.timestamp).toLocaleString()}</p>
                  </div>
                  {reg.status === 'PENDING' && (
                    <button 
                      onClick={() => setSelectedReg(reg)}
                      className="px-4 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-[11px] font-black rounded-lg transition-all shadow-sm active:scale-95 flex items-center space-x-1.5"
                    >
                      <FileText className="w-3 h-3" />
                      <span>Review Details</span>
                    </button>
                  )}
                  <button className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-all">
                    <MoreVertical className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {reg.advisorNotes && (
                <div className="mt-3 p-3 bg-slate-50 rounded-lg border border-slate-200 border-dashed">
                  <div className="flex items-center space-x-1.5 mb-1">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-tighter">Endorsement Notes</span>
                  </div>
                  <p className="text-[11px] text-slate-700 font-bold italic">"{reg.advisorNotes}"</p>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* REVIEW MODAL */}
      {selectedReg && (
        <div className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full border border-slate-200 shadow-2xl overflow-hidden font-sans">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center space-x-3">
                <FileText className="w-5 h-5 text-cyan-700" />
                <div>
                  <h3 className="font-black text-slate-900 text-sm">Review Registration</h3>
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">{selectedReg.matrixNo}</p>
                </div>
              </div>
              <button onClick={() => setSelectedReg(null)} className="p-1 text-slate-400 hover:text-slate-900 transition-colors">✕</button>
            </div>

            <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">Student Name</p>
                  <p className="text-xs font-bold text-slate-900">{selectedReg.studentName}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">Base Section</p>
                  <p className="text-xs font-bold text-slate-900">{selectedReg.baseSection}</p>
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">Registered Repeat Modules</p>
                <div className="space-y-1.5">
                  {selectedReg.repeatCourses.length === 0 ? (
                    <p className="text-xs text-slate-500 italic">No repeat modules selected</p>
                  ) : (
                    selectedReg.repeatCourses.map(code => (
                      <div key={code} className="flex items-center justify-between p-2.5 rounded-lg border border-slate-100 bg-slate-50 shadow-sm">
                        <span className="text-xs font-black text-slate-800">{code}</span>
                        <span className="text-[10px] font-bold text-cyan-700 bg-cyan-50 px-2 py-0.5 rounded border border-cyan-100 shadow-inner">
                          Section: {selectedReg.selectedAddons[code] || 'N/A'}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">Endorsement Remarks</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Schedule approved. Advised to attend all sessions on time..."
                  className="w-full p-4 rounded-xl border border-slate-200 bg-slate-50 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 min-h-[100px] shadow-inner"
                />
              </div>
            </div>

            <div className="p-5 border-t border-slate-100 bg-slate-50/50 flex items-center justify-end space-x-3">
              <button 
                onClick={() => handleAction('REJECTED')}
                className="px-5 py-2 rounded-xl border border-rose-200 bg-rose-50 text-rose-700 text-xs font-black hover:bg-rose-100 transition-all flex items-center space-x-2"
              >
                <XCircle className="w-4 h-4" />
                <span>Reject Registration</span>
              </button>
              <button 
                onClick={() => handleAction('APPROVED')}
                className="px-5 py-2 rounded-xl bg-slate-900 text-white text-xs font-black hover:bg-slate-800 transition-all shadow-lg active:scale-95 flex items-center space-x-2"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Approve & Sign</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
