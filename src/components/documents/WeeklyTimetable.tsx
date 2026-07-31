import React from 'react';
import { StudentProfile, TimetableSlot } from '../../types';

interface WeeklyTimetableProps {
  studentProfile: StudentProfile;
  timetableMode: 'prefilled' | 'empty';
  days: string[];
  timeColumns: Array<{ label: string; start: string; end: string }>;
  getSlotForGrid: (dayName: string, colStart: string) => (TimetableSlot & { isBase?: boolean; isRepeat?: boolean }) | null;
}

export const WeeklyTimetable: React.FC<WeeklyTimetableProps> = ({
  studentProfile,
  timetableMode,
  days,
  timeColumns,
  getSlotForGrid
}) => {
  return (
    <div className="bg-white text-slate-900 p-6 sm:p-8 rounded-2xl shadow-xl border border-slate-300 max-w-5xl mx-auto space-y-5 font-sans print:p-0 print:shadow-none print:border-none print:max-w-none">
      
      {/* HEADER BRANDING */}
      <div className="text-center space-y-1 border-b-2 border-slate-900 pb-3">
        <div className="flex items-center justify-center space-x-3">
          <div className="w-10 h-10 rounded bg-red-700 text-white font-extrabold flex items-center justify-center text-xs tracking-tighter">
            POLI
          </div>
          <div>
            <h2 className="text-lg font-extrabold tracking-wider uppercase text-slate-900 leading-tight">
              POLITEKNIK MALAYSIA
            </h2>
            <h3 className="text-xs font-bold text-slate-700 uppercase">KUCHING SARAWAK</h3>
          </div>
        </div>
        <h1 className="text-base font-extrabold tracking-wider uppercase text-slate-900 pt-2">
          JADUAL WAKTU KULIAH
        </h1>
      </div>

      {/* HEADER METADATA FIELDS */}
      <div className="grid grid-cols-2 gap-y-1.5 gap-x-6 text-xs font-mono border-b border-slate-400 pb-3">
        <div className="flex space-x-2">
          <span className="font-bold text-slate-700 w-36">JABATAN :</span>
          <span className="border-b border-slate-900 flex-1">{studentProfile.department || 'JABATAN KEJURUTERAAN MEKANIKAL'}</span>
        </div>
        <div className="flex space-x-2">
          <span className="font-bold text-slate-700 w-24">SESI :</span>
          <span className="border-b border-slate-900 flex-1">{studentProfile.session || 'SESI I: 2026/2027'}</span>
        </div>
        <div className="flex space-x-2 col-span-2">
          <span className="font-bold text-slate-700 w-36">Nama :</span>
          <span className="border-b border-slate-900 flex-1 font-bold">{timetableMode === 'empty' ? '' : studentProfile.name?.toUpperCase()}</span>
        </div>
        <div className="flex space-x-2 col-span-2">
          <span className="font-bold text-slate-700 w-36">Program :</span>
          <span className="border-b border-slate-900 flex-1">{timetableMode === 'empty' ? '' : `${studentProfile.program} (${studentProfile.baseSection})`}</span>
        </div>
        <div className="flex space-x-2 col-span-2">
          <span className="font-bold text-slate-700 w-36">Penasihat Akademik :</span>
          <span className="border-b border-slate-900 flex-1">{timetableMode === 'empty' ? '' : studentProfile.paName}</span>
        </div>
      </div>

      {/* TIMETABLE GRID MATRIX TABLE */}
      <div className="overflow-x-auto">
        <table className="w-full text-center border-collapse border-2 border-slate-900 text-xs">
          <thead className="bg-slate-200 border-b-2 border-slate-900 font-bold">
            <tr>
              <th className="p-2 border-r-2 border-slate-900 w-24 bg-slate-300">HARI/MASA</th>
              {timeColumns.map((col, idx) => (
                <th key={idx} className="p-1.5 border-r border-slate-900 font-mono text-[10px] w-24">
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y border-slate-900">
            {days.map(day => (
              <tr key={day} className="border-b border-slate-900">
                <td className="p-2 border-r-2 border-slate-900 font-bold bg-slate-100 font-mono align-middle">
                  {day}
                </td>
                {timeColumns.map((col, colIdx) => {
                  const slot = getSlotForGrid(day, col.start);
                  return (
                    <td key={colIdx} className="p-1 border-r border-slate-900 align-top text-[10px] font-mono hover:bg-slate-50 transition min-w-[80px]">
                      <div className="min-h-[64px] flex flex-col justify-center">
                        {slot ? (
                          <div className={`p-1 rounded text-center space-y-0.5 ${
                            slot.isRepeat
                              ? 'bg-amber-100 text-amber-950 border border-amber-400 font-bold'
                              : 'bg-slate-100 text-slate-900 border border-slate-300'
                          }`}>
                            <strong className="block text-[11px] font-extrabold text-blue-900">{slot.courseCode}</strong>
                            <span className="block text-[9px] text-slate-700">{slot.section}</span>
                            <span className="block text-[8px] text-slate-500 truncate">{slot.venue}</span>
                          </div>
                        ) : (
                          <span className="text-slate-300 font-light"></span>
                        )}
                      </div>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex justify-between items-center text-[10px] text-slate-500 font-mono pt-2">
        <span>Politeknik Kuching Sarawak — Official Timetable Sheet</span>
        <span>Mode: {timetableMode === 'empty' ? 'Blank Manual Form' : 'Auto-Populated Resolved Schedule'}</span>
      </div>
    </div>
  );
};
