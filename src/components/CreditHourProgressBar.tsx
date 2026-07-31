import React from 'react';
import { TimetableSlot } from '../types';
import { Award, AlertTriangle, CheckCircle2, ShieldAlert, Sparkles, BookOpen, Layers, Info } from 'lucide-react';

interface CreditHourProgressBarProps {
  baseClassSlots: TimetableSlot[];
  selectedRepeatCourses: string[];
  masterSlots: TimetableSlot[];
  maxCreditLimit?: number; // default 20
  onRemoveCourse?: (courseCode: string) => void;
}

export const CreditHourProgressBar: React.FC<CreditHourProgressBarProps> = ({
  baseClassSlots,
  selectedRepeatCourses,
  masterSlots,
  maxCreditLimit = 20,
  onRemoveCourse
}) => {
  // Compute base class unique courses & total credits
  const baseCourseMap = new Map<string, { code: string; name: string; credits: number }>();
  baseClassSlots.forEach(slot => {
    if (!baseCourseMap.has(slot.courseCode)) {
      baseCourseMap.set(slot.courseCode, {
        code: slot.courseCode,
        name: slot.courseName,
        credits: slot.creditHours || 3
      });
    }
  });

  const baseCourses = Array.from(baseCourseMap.values());
  const baseCredits = baseCourses.reduce((sum, c) => sum + c.credits, 0);

  // Compute repeat/addon courses & total credits
  const repeatCourseMap = new Map<string, { code: string; name: string; credits: number }>();
  selectedRepeatCourses.forEach(code => {
    const slot = masterSlots.find(s => s.courseCode.toUpperCase() === code.toUpperCase());
    repeatCourseMap.set(code, {
      code,
      name: slot?.courseName || code,
      credits: slot?.creditHours || 3
    });
  });

  const repeatCourses = Array.from(repeatCourseMap.values());
  const repeatCredits = repeatCourses.reduce((sum, c) => sum + c.credits, 0);

  const totalCredits = baseCredits + repeatCredits;
  const isOverloaded = totalCredits > maxCreditLimit;
  const isHeavy = totalCredits >= maxCreditLimit - 2 && totalCredits <= maxCreditLimit;

  // Percentage calculations
  const basePct = Math.min(100, (baseCredits / maxCreditLimit) * 100);
  const repeatPct = Math.min(100 - basePct, (repeatCredits / maxCreditLimit) * 100);
  const totalPct = Math.min(100, (totalCredits / maxCreditLimit) * 100);

  return (
    <div className={`rounded-xl p-4 border transition-all shadow-md space-y-3 ${
      isOverloaded
        ? 'bg-rose-50 border-rose-300 shadow-rose-100'
        : isHeavy
        ? 'bg-amber-50 border-amber-300'
        : 'bg-slate-50 border-slate-200'
    }`}>
      {/* HEADER & TOTAL CREDITS COUNTER */}
      <div className={`flex flex-wrap items-center justify-between gap-2 border-b pb-2.5 ${
        isOverloaded ? 'border-rose-200' : isHeavy ? 'border-amber-200' : 'border-slate-200'
      }`}>
        <div className="flex items-center space-x-2">
          <div className={`p-1.5 rounded-lg border ${
            isOverloaded
              ? 'bg-rose-100 text-rose-700 border-rose-300 animate-pulse'
              : 'bg-cyan-100 text-cyan-700 border-cyan-300'
          }`}>
            <Award className="w-4 h-4" />
          </div>
          <div>
            <h3 className={`font-extrabold text-xs tracking-tight flex items-center space-x-1.5 ${
              isOverloaded ? 'text-rose-900' : isHeavy ? 'text-amber-900' : 'text-slate-900'
            }`}>
              <span>Credit Hour Workload Tracker</span>
            </h3>
            <p className={`text-[10px] ${
              isOverloaded ? 'text-rose-700' : isHeavy ? 'text-amber-700' : 'text-slate-500'
            }`}>
              Base class regular load + selected carry/repeat modules
            </p>
          </div>
        </div>

        {/* WORKLOAD BADGE */}
        <div className="flex items-center space-x-2">
          <div className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold flex items-center space-x-1.5 border ${
            isOverloaded
              ? 'bg-rose-600 text-white border-rose-500 animate-pulse shadow-sm shadow-rose-200'
              : isHeavy
              ? 'bg-amber-500 text-white border-amber-400'
              : 'bg-emerald-600 text-white border-emerald-500'
          }`}>
            {isOverloaded ? (
              <ShieldAlert className="w-3.5 h-3.5 text-white" />
            ) : isHeavy ? (
              <AlertTriangle className="w-3.5 h-3.5 text-white" />
            ) : (
              <CheckCircle2 className="w-3.5 h-3.5 text-white" />
            )}
            <span>
              {totalCredits} / {maxCreditLimit} Credits
            </span>
          </div>
        </div>
      </div>

      {/* DYNAMIC PROGRESS BAR STACK */}
      <div className="space-y-1.5">
        <div className="flex justify-between items-center text-[10px] font-mono">
          <span className="flex items-center space-x-2">
            <span className="text-cyan-700 font-extrabold">Base: {baseCredits} Cr</span>
            <span className="text-slate-400">+</span>
            <span className="text-amber-700 font-extrabold">Repeat: {repeatCredits} Cr</span>
          </span>
          <span className={`font-bold ${
            isOverloaded ? 'text-rose-600' : isHeavy ? 'text-amber-600' : 'text-emerald-600'
          }`}>
            {isOverloaded
              ? `OVER LIMIT BY +${totalCredits - maxCreditLimit} CR`
              : `${maxCreditLimit - totalCredits} Cr Available`}
          </span>
        </div>

        {/* VISUAL BAR GRAPH */}
        <div className="relative w-full h-3.5 bg-slate-200 rounded-full overflow-hidden border border-slate-300 p-0.5 flex">
          {/* Base Class Segment */}
          <div
            style={{ width: `${basePct}%` }}
            className="bg-gradient-to-r from-cyan-600 to-blue-500 h-full rounded-l-full transition-all duration-300 relative group"
            title={`Base Class: ${baseCredits} Credit Hours (${baseCourses.length} courses)`}
          ></div>

          {/* Repeat / Addon Courses Segment */}
          {repeatCredits > 0 && (
            <div
              style={{ width: `${repeatPct}%` }}
              className={`h-full transition-all duration-300 relative group ${
                isOverloaded
                  ? 'bg-gradient-to-r from-amber-500 via-rose-500 to-rose-600 animate-pulse'
                  : 'bg-gradient-to-r from-amber-500 to-amber-400'
              }`}
              title={`Repeat Courses: ${repeatCredits} Credit Hours (${repeatCourses.length} courses)`}
            ></div>
          )}

          {/* MAX LIMIT MARKER LINE */}
          <div
            className="absolute top-0 bottom-0 w-0.5 bg-rose-500 z-10 shadow-[0_0_8px_#f43f5e]"
            style={{ left: '100%' }}
            title={`Max Limit (${maxCreditLimit} Credits)`}
          ></div>
        </div>
      </div>

      {/* VISUAL OVERLOAD / UNDERLOAD WARNING ALERT BOX */}
      {isOverloaded && (
        <div className="bg-rose-100 border border-rose-300 rounded-lg p-3 text-xs space-y-2 text-rose-900 animate-in fade-in duration-200 shadow-sm">
          <div className="flex items-start space-x-2">
            <ShieldAlert className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
            <div className="space-y-1">
              <h4 className="font-extrabold text-rose-800 tracking-wide text-xs flex items-center justify-between">
                <span>⚠️ EXCEEDS STANDARD LIMIT (20 CREDIT HOURS)</span>
                <span className="text-[10px] font-mono px-2 py-0.5 bg-amber-500/20 text-amber-800 rounded border border-amber-300 font-bold">
                  Requires HOD Approval
                </span>
              </h4>
              <p className="text-[11px] text-rose-900 leading-normal">
                Total load is <strong className="text-rose-950 font-mono">{totalCredits} Credit Hours</strong> (+{totalCredits - 20} Cr over standard 20 Cr limit). Under JKM regulations, exceeding 20 Credit Hours is <strong>allowed only with Head of Department (Ketua Jabatan) permission</strong>. Priority must be given to <strong>Carry Modules (Kursus Mengulang)</strong>.
              </p>
            </div>
          </div>

          {/* QUICK DROP SUGGESTIONS FOR REPEAT COURSES */}
          {repeatCourses.length > 0 && onRemoveCourse && (
            <div className="pt-2 border-t border-rose-200 text-[11px] space-y-1">
              <span className="font-bold text-rose-800">Optionally adjust carry modules to remain under 20 Cr:</span>
              <div className="flex flex-wrap gap-1.5 pt-1">
                {repeatCourses.map(c => (
                  <button
                    key={c.code}
                    onClick={() => onRemoveCourse(c.code)}
                    className="px-2 py-0.5 rounded bg-rose-200 hover:bg-rose-300 text-rose-900 border border-rose-400 text-[10px] font-mono transition flex items-center space-x-1"
                    title={`Click to unselect ${c.code} (${c.credits} Credits)`}
                  >
                    <span>Remove {c.code} (-{c.credits} Cr)</span>
                    <span className="text-rose-600 font-bold">✕</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* UNDER MINIMUM LIMIT ALERT (Less than 12 Cr) */}
      {totalCredits < 12 && (
        <div className="bg-amber-100 border border-amber-300 rounded-lg p-3 text-xs space-y-1 text-amber-900 animate-in fade-in duration-200">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0" />
            <h4 className="font-extrabold text-amber-800 text-xs">
              ⚠️ Below Minimum Limit ({totalCredits} / 12 Credit Hours)
            </h4>
          </div>
          <p className="text-[11px] text-amber-900 leading-normal">
            Students must register a minimum of 12 Credit Hours unless special approval is obtained from the Head of Department (Ketua Jabatan).
          </p>
        </div>
      )}

      {/* FOOTER BREAKDOWN PILLS */}
      <div className="flex flex-wrap items-center justify-between text-[11px] pt-1 text-slate-500 border-t border-slate-200 gap-1.5">
        <div className="flex items-center space-x-3">
          <span className="flex items-center space-x-1">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-600 inline-block"></span>
            <span>Regular Base: <strong className="text-slate-900 font-mono">{baseCourses.length}</strong> modules</span>
          </span>
          <span className="flex items-center space-x-1">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block"></span>
            <span>Priority Carry/Repeats: <strong className="text-slate-900 font-mono">{repeatCourses.length}</strong> modules</span>
          </span>
        </div>

        <div className="text-[10px] text-slate-400 font-mono">
          JKM Policy: Min 12 Cr — Standard Max 20 Cr
        </div>
      </div>

    </div>
  );
};
