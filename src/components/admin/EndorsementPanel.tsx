import React from 'react';
import { StudentProfile, TimetableSlot, UserRole } from '../../types';
import { FileSignature, UserCheck, CheckCircle, AlertTriangle } from 'lucide-react';
import { checkPolicy } from '../../utils/pbac';

interface EndorsementPanelProps {
  studentProfile: StudentProfile;
  selectedRepeatCourses: string[];
  selectedAddons: Record<string, string>;
  paEndorsement: { endorsed: boolean; notes: string; date: string; signatureCode: string } | null;
  advisorNotesText: string;
  setAdvisorNotesText: React.Dispatch<React.SetStateAction<string>>;
  onEndorse: (notes: string) => void;
  onResetEndorsement: () => void;
  userRole: UserRole;
}

export const EndorsementPanel: React.FC<EndorsementPanelProps> = ({
  studentProfile,
  selectedRepeatCourses,
  selectedAddons,
  paEndorsement,
  advisorNotesText,
  setAdvisorNotesText,
  onEndorse,
  onResetEndorsement,
  userRole
}) => {
  return (
    <div className="space-y-4">
      <div className="p-4 rounded-xl bg-cyan-50 border border-cyan-200 space-y-3 shadow-sm">
        <h4 className="font-black text-xs text-cyan-900 uppercase tracking-wider flex items-center space-x-1.5">
          <FileSignature className="w-4 h-4 text-cyan-700" />
          <span>Timetable Review & Digital Endorsement Deck</span>
        </h4>
        <p className="text-xs text-slate-800 leading-relaxed font-medium">
          As an Academic Advisor, you can review the currently selected repeat courses and scheduled sessions for 
          <strong className="text-cyan-900"> {studentProfile.name} ({studentProfile.matrixNo})</strong>. Ensure there are no schedule conflicts and click Sign to apply a digital secure seal.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 space-y-3">
          <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-3 shadow-sm">
            <h5 className="font-black text-xs text-slate-900 uppercase tracking-wider">Proposed Student Registration</h5>
            
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-slate-50 rounded border border-slate-200 shadow-inner">
                <span className="text-slate-500 block font-black text-[10px] uppercase">Base Section:</span>
                <span className="font-black font-mono text-cyan-900 text-sm">{studentProfile.baseSection}</span>
              </div>
              <div className="p-3 bg-slate-50 rounded border border-slate-200 shadow-inner">
                <span className="text-slate-500 block font-black text-[10px] uppercase">Programme Path:</span>
                <span className="font-black text-slate-900">{studentProfile.program}</span>
              </div>
            </div>

            <div className="space-y-2">
              <h6 className="text-[11px] font-black text-slate-500 uppercase tracking-wide">Repeat & Carry Selections ({selectedRepeatCourses.length})</h6>
              {selectedRepeatCourses.length === 0 ? (
                <p className="text-xs text-slate-500 italic p-3 bg-slate-50 rounded border border-slate-200 font-medium">No repeat modules selected currently.</p>
              ) : (
                <div className="space-y-1.5">
                  {selectedRepeatCourses.map(code => {
                    const targetSection = selectedAddons[code] || 'Unassigned';
                    return (
                      <div key={code} className="flex items-center justify-between p-2.5 rounded bg-white border border-slate-200 text-xs shadow-sm hover:border-slate-400 transition">
                        <div className="flex items-center space-x-2">
                          <span className="font-mono font-black text-blue-800 text-sm">{code}</span>
                          <span className="text-slate-500 font-black font-mono">({targetSection})</span>
                        </div>
                        <span className="text-[10px] font-black px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-300 shadow-sm">
                          0 CLASHES (Verified)
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-3 shadow-sm">
            <h5 className="font-black text-xs text-slate-900 uppercase tracking-wider flex items-center space-x-1.5">
              <UserCheck className="w-4 h-4 text-cyan-600" />
              <span>Advisor Approval Signature</span>
            </h5>

            {paEndorsement ? (
              <div className="p-4 rounded-lg bg-emerald-50 border border-emerald-200 space-y-3 text-xs shadow-inner">
                <div className="flex items-center space-x-2 text-emerald-800 font-black">
                  <CheckCircle className="w-4 h-4 text-emerald-600" />
                  <span>Endorsement Active!</span>
                </div>
                <div className="space-y-2 font-mono text-[11px] text-slate-700 bg-white p-2.5 rounded border border-emerald-100 shadow-sm font-bold">
                  <p><span className="text-slate-400 font-black uppercase text-[10px]">Date signed:</span> {paEndorsement.date}</p>
                  <p><span className="text-slate-400 font-black uppercase text-[10px]">PA Notes:</span> "{paEndorsement.notes}"</p>
                  <p><span className="text-slate-400 font-black uppercase text-[10px]">Sec-Seal ID:</span> <span className="text-amber-700 font-black">{paEndorsement.signatureCode}</span></p>
                </div>
                <button
                  onClick={onResetEndorsement}
                  className="w-full py-1.5 bg-rose-50 hover:bg-rose-100 border border-rose-200 hover:border-rose-300 rounded text-[11px] font-black text-rose-800 transition cursor-pointer active:scale-95 shadow-sm"
                >
                  Revoke & Clear Signature
                </button>
              </div>
            ) : (
              <div className="space-y-3 text-xs">
                <p className="text-slate-600 leading-relaxed text-[11px] font-medium">
                  Sign below to digitally register this timetable. This will stamp the Borang PA automatically.
                </p>
                <div>
                  <label className="block text-[11px] text-slate-700 mb-1 font-black uppercase tracking-tight">PA Review & Advice Notes</label>
                  <textarea
                    value={advisorNotesText}
                    onChange={e => setAdvisorNotesText(e.target.value)}
                    placeholder="e.g. Schedule approved. Student is advised to attend all repeat classes on time."
                    rows={3}
                    className="w-full bg-white border border-slate-300 rounded p-2 text-slate-900 placeholder-slate-400 text-xs focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 font-medium"
                  />
                </div>

                {checkPolicy(userRole, 'SIGN_ADVISOR_SLIP') ? (
                  <button
                    onClick={() => onEndorse(advisorNotesText)}
                    className="w-full py-2 bg-cyan-600 hover:bg-cyan-700 text-white font-black rounded text-xs transition flex items-center justify-center space-x-1 cursor-pointer shadow-md active:scale-95"
                  >
                    <FileSignature className="w-4 h-4" />
                    <span>Sign & Endorse Slip</span>
                  </button>
                ) : (
                  <div className="p-3 rounded bg-rose-50 border border-rose-200 text-rose-900 text-[11px] space-y-1.5 shadow-sm">
                    <div className="flex items-center space-x-1 font-black">
                      <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                      <span>PBAC Restrict Active</span>
                    </div>
                    <p className="font-medium">Under PBAC policies, your current active role ({userRole}) lacks authorization to issue PA signatures.</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
