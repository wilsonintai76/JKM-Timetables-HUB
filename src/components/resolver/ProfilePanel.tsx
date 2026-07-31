import React from 'react';
import { StudentProfile, TimetableSlot, JKM_PROGRAMMES } from '../../types';
import { UserCheck } from 'lucide-react';

interface ProfilePanelProps {
  studentProfile: StudentProfile;
  setStudentProfile: React.Dispatch<React.SetStateAction<StudentProfile>>;
  isEditingProfile: boolean;
  setIsEditingProfile: (val: boolean) => void;
  availableSections: string[];
  baseClassSlots: TimetableSlot[];
  style: any;
}

export const ProfilePanel: React.FC<ProfilePanelProps> = ({
  studentProfile,
  setStudentProfile,
  isEditingProfile,
  setIsEditingProfile,
  availableSections,
  baseClassSlots,
  style
}) => {
  return (
    <div className={`${style.cardBgClass} rounded-xl p-4 border shadow-sm space-y-3`}>
      <div className={`flex items-center justify-between border-b ${style.borderColor} pb-2.5`}>
        <div className="flex items-center space-x-2">
          <UserCheck className={`w-4 h-4 ${style.accentText}`} />
          <h3 className={`font-bold ${style.textPrimary} text-xs tracking-tight`}>Student Profile & Base Section</h3>
        </div>
        <button
          onClick={() => setIsEditingProfile(!isEditingProfile)}
          className={`text-[11px] ${style.accentText} hover:underline font-semibold`}
        >
          {isEditingProfile ? 'Done' : 'Edit Profile'}
        </button>
      </div>

      <div className="space-y-2.5">
        {isEditingProfile ? (
          <div className="space-y-2 text-xs">
            <div>
              <label className={`${style.textSecondary} block mb-0.5 text-[11px]`}>Program JKM / Program Akademik</label>
              <select
                value={studentProfile.program}
                onChange={e => setStudentProfile({ ...studentProfile, program: e.target.value })}
                className={`w-full ${style.inputClass} rounded-lg p-1.5 font-bold text-xs`}
              >
                {JKM_PROGRAMMES.map(prog => (
                  <option key={prog} value={prog}>{prog}</option>
                ))}
                <option value="Diploma Kejuruteraan Mekanikal (Lain-lain)">Program Lain-Lain</option>
              </select>
            </div>
            <div>
              <label className={`${style.textSecondary} block mb-0.5 text-[11px]`}>Nama Pelajar</label>
              <input
                type="text"
                value={studentProfile.name}
                onChange={e => setStudentProfile({ ...studentProfile, name: e.target.value })}
                className={`w-full ${style.inputClass} rounded-lg p-1.5 text-xs`}
              />
            </div>
            <div>
              <label className={`${style.textSecondary} block mb-0.5 text-[11px]`}>No. Matrik</label>
              <input
                type="text"
                value={studentProfile.matrixNo}
                onChange={e => setStudentProfile({ ...studentProfile, matrixNo: e.target.value })}
                className={`w-full ${style.inputClass} rounded-lg p-1.5 font-mono text-xs`}
              />
            </div>
            <div>
              <label className={`${style.textSecondary} block mb-0.5 text-[11px]`}>Nama PA (Penasihat Akademik)</label>
              <input
                type="text"
                value={studentProfile.paName}
                onChange={e => setStudentProfile({ ...studentProfile, paName: e.target.value })}
                className={`w-full ${style.inputClass} rounded-lg p-1.5 text-xs`}
              />
            </div>
          </div>
        ) : (
          <div className={`${style.bgMuted} p-2.5 rounded-lg border ${style.borderColor} space-y-1 text-xs shadow-inner`}>
            <div className={`flex justify-between items-center pb-1 border-b ${style.borderColor}`}>
              <span className={`${style.textSecondary} text-[11px]`}>Program:</span>
              <span className={`font-bold text-[11px] ${style.badgeClass} px-2 py-0.5 rounded shadow-sm`}>
                {studentProfile.program}
              </span>
            </div>
            <div className="flex justify-between pt-0.5">
              <span className={`${style.textSecondary} text-[11px]`}>Student:</span>
              <span className={`font-bold ${style.textPrimary}`}>{studentProfile.name}</span>
            </div>
            <div className="flex justify-between font-mono">
              <span className={`${style.textSecondary} text-[11px]`}>Matric No:</span>
              <span className={`${style.accentText} font-bold`}>{studentProfile.matrixNo}</span>
            </div>
            <div className="flex justify-between">
              <span className={`${style.textSecondary} text-[11px]`}>Advisor (PA):</span>
              <span className={`${style.textPrimary} font-medium`}>{studentProfile.paName}</span>
            </div>
          </div>
        )}

        <div>
          <label className={`block text-[11px] font-semibold ${style.textPrimary} mb-1 uppercase tracking-tight`}>
            Select Base Section (Regular Timetable)
          </label>
          <select
            value={studentProfile.baseSection}
            onChange={e => setStudentProfile({ ...studentProfile, baseSection: e.target.value })}
            className={`w-full ${style.inputClass} rounded-lg p-2 text-xs font-bold focus:outline-none shadow-sm transition-all focus:ring-2 focus:ring-cyan-500/20`}
          >
            {availableSections.map(sec => (
              <option key={sec} value={sec}>
                Kumpulan {sec} ({baseClassSlots.length} Regular Slots)
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
};
