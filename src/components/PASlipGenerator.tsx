import React, { useState } from 'react';
import { StudentProfile, TimetableSlot, UserRole } from '../types';
import { 
  Printer, FileText, Calendar, FileSignature, CheckCircle2 
} from 'lucide-react';
import { BorangPK01 } from './documents/BorangPK01';
import { WeeklyTimetable } from './documents/WeeklyTimetable';

interface PASlipGeneratorProps {
  studentProfile: StudentProfile;
  selectedRepeatCourses: string[];
  selectedAddons: Record<string, string>;
  masterSlots: TimetableSlot[];
  baseClassSlots: TimetableSlot[];
  userRole?: UserRole;
  paEndorsement?: { endorsed: boolean; notes: string; date: string; signatureCode: string } | null;
  onEndorse?: (notes: string) => void;
  onResetEndorsement?: () => void;
}

export const PASlipGenerator: React.FC<PASlipGeneratorProps> = ({
  studentProfile,
  selectedRepeatCourses,
  selectedAddons,
  masterSlots,
  baseClassSlots,
  userRole = 'STUDENT',
  paEndorsement = null,
  onEndorse,
  onResetEndorsement
}) => {
  // Active Form View: 'pk01' | 'timetable'
  const [activeForm, setActiveForm] = useState<'pk01' | 'timetable'>('pk01');

  // Timetable Mode: 'prefilled' | 'empty'
  const [timetableMode, setTimetableMode] = useState<'prefilled' | 'empty'>('prefilled');

  // Status mapping for repeat courses in Borang PK01 (default: MK1)
  const [courseStatuses, setCourseStatuses] = useState<Record<string, 'D' | 'MK1' | 'MK2'>>({});
  const [lecturerNotes, setLecturerNotes] = useState<Record<string, string>>({});
  const [phoneNo, setPhoneNo] = useState<string>('012-3456789');

  // Calculate base class unique courses for Section (A)
  const baseCourseMap = new Map<string, { code: string; name: string; credits: number; section: string }>();
  baseClassSlots.forEach(slot => {
    if (!baseCourseMap.has(slot.courseCode)) {
      baseCourseMap.set(slot.courseCode, {
        code: slot.courseCode,
        name: slot.courseName,
        credits: slot.creditHours || 3,
        section: slot.section
      });
    }
  });
  const baseCourses = Array.from(baseCourseMap.values());
  const totalBaseCredits = baseCourses.reduce((acc, c) => acc + c.credits, 0);

  // Calculate carry/repeat courses for Section (B)
  const repeatDetails = selectedRepeatCourses.map((code, idx) => {
    const sec = selectedAddons[code];
    const slots = masterSlots.filter(s => s.courseCode === code && s.section === sec);
    const courseName = slots[0]?.courseName || code;
    const creditHours = slots[0]?.creditHours || 3;

    return {
      bil: idx + 1,
      code,
      courseName,
      section: sec || 'N/A',
      creditHours,
      slots,
      lecturer: lecturerNotes[code] || slots[0]?.lecturer || 'Pensyarah Subjek'
    };
  });
  const totalRepeatCredits = repeatDetails.reduce((acc, d) => acc + d.creditHours, 0);
  const totalOverallCredits = totalBaseCredits + totalRepeatCredits;

  // Timetable slot mapping for Jadual Waktu Kuliah template
  const days = ['ISNIN', 'SELASA', 'RABU', 'KHAMIS', 'JUMAAT'];
  const timeColumns = [
    { label: '8.00 – 9.00am', start: '08:00', end: '09:00' },
    { label: '9.00 – 10.00am', start: '09:00', end: '10:00' },
    { label: '10.00 – 11.00am', start: '10:00', end: '11:00' },
    { label: '11.00am – 12.00pm', start: '11:00', end: '12:00' },
    { label: '12.00 – 1.00pm', start: '12:00', end: '13:00' },
    { label: '1.00 – 2.00pm', start: '13:00', end: '14:00' },
    { label: '2.00 – 3.00pm', start: '14:00', end: '15:00' },
    { label: '3.00 – 4.00pm', start: '15:00', end: '16:00' },
    { label: '4.00 – 5.00pm', start: '16:00', end: '17:00' }
  ];

  // Helper to find slot in timetable grid
  const getSlotForGrid = (dayName: string, colStart: string) => {
    if (timetableMode === 'empty') return null;

    // Search in baseClassSlots
    const base = baseClassSlots.find(s => s.day.toUpperCase() === dayName.toUpperCase() && s.startTime === colStart);
    if (base) return { ...base, isBase: true };

    // Search in repeat courses
    for (const item of repeatDetails) {
      const match = item.slots.find(s => s.day.toUpperCase() === dayName.toUpperCase() && s.startTime === colStart);
      if (match) return { ...match, isRepeat: true };
    }

    return null;
  };

  return (
    <div className="space-y-6">

      {/* TOP NAVIGATION & ACTION BAR (HIDDEN IN PRINT) */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-lg space-y-4 no-print">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="font-black text-slate-900 text-sm flex items-center space-x-2">
              <FileText className="w-4 h-4 text-cyan-600" />
              <span>Official Registration Forms & Timetable Generator</span>
            </h3>
            <p className="text-[11px] text-slate-600 font-bold">
              Generate & print official Politeknik Kuching Sarawak registration forms, empty/filled weekly schedules, and PA approval slips.
            </p>
          </div>

          <button
            onClick={() => window.print()}
            className="flex items-center space-x-1.5 px-4 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-700 text-white font-black text-xs transition shadow-md shadow-cyan-500/20 active:scale-95"
          >
            <Printer className="w-4 h-4" />
            <span>Cetak / Print Active Form</span>
          </button>
        </div>

        {/* FORM SELECTOR TABS */}
        <div className="flex flex-wrap gap-2 border-t border-slate-100 pt-3 text-xs font-semibold">
          <button
            onClick={() => setActiveForm('pk01')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg transition border shadow-sm ${
              activeForm === 'pk01'
                ? 'bg-cyan-600 text-white border-cyan-700 font-black'
                : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100 font-extrabold'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>1. Borang PK01 (Pendaftaran Kursus Tumpang)</span>
          </button>

          <button
            onClick={() => setActiveForm('timetable')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg transition border shadow-sm ${
              activeForm === 'timetable'
                ? 'bg-cyan-600 text-white border-cyan-700 font-black'
                : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100 font-extrabold'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>2. Jadual Waktu Kuliah (Official Template)</span>
          </button>
        </div>

        {/* TIMETABLE MODE SUB-TOGGLE */}
        {activeForm === 'timetable' && (
          <div className="flex items-center space-x-3 bg-slate-50 p-2 rounded-lg border border-slate-200 text-xs shadow-inner">
            <span className="text-slate-600 font-black ml-1 uppercase text-[10px]">Timetable Mode:</span>
            <button
              onClick={() => setTimetableMode('prefilled')}
              className={`px-3 py-1 rounded font-black text-xs transition border ${
                timetableMode === 'prefilled'
                  ? 'bg-emerald-600 text-white border-emerald-700 shadow-sm'
                  : 'bg-white text-slate-600 border-slate-200 hover:text-slate-900'
              }`}
            >
              Pre-Filled Schedule (Auto-Populated)
            </button>
            <button
              onClick={() => setTimetableMode('empty')}
              className={`px-3 py-1 rounded font-black text-xs transition border ${
                timetableMode === 'empty'
                  ? 'bg-amber-600 text-white border-amber-700 shadow-sm'
                  : 'bg-white text-slate-600 border-slate-200 hover:text-slate-900'
              }`}
            >
              Empty Template (Blank for Manual Filling)
            </button>
          </div>
        )}
      </div>

      {/* CONTENT AREA */}
      <div className="mt-4">
        {activeForm === 'pk01' && (
          <BorangPK01
            studentProfile={studentProfile}
            phoneNo={phoneNo}
            setPhoneNo={setPhoneNo}
            baseCourses={baseCourses}
            totalBaseCredits={totalBaseCredits}
            repeatDetails={repeatDetails}
            totalRepeatCredits={totalRepeatCredits}
            totalOverallCredits={totalOverallCredits}
            courseStatuses={courseStatuses}
            setCourseStatuses={setCourseStatuses}
            lecturerNotes={lecturerNotes}
            setLecturerNotes={setLecturerNotes}
          />
        )}
        
        {activeForm === 'timetable' && (
          <WeeklyTimetable
            studentProfile={studentProfile}
            timetableMode={timetableMode}
            days={days}
            timeColumns={timeColumns}
            getSlotForGrid={getSlotForGrid}
          />
        )}
      </div>
    </div>
  );
};
