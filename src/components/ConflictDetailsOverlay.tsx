import React, { useState, useMemo } from 'react';
import { TimetableSlot, DayOfWeek, CourseClashAnalysis, ThemePreferences } from '../types';
import { getThemePalette } from '../utils/theme';
import { timeToDecimal, decimalToTime, checkTimeOverlap } from '../utils/timeUtils';
import { AlertTriangle, Check, CheckCircle2, Clock, XCircle, ArrowRight, X, Sparkles, Filter, Layers, HelpCircle, RefreshCw } from 'lucide-react';

interface ConflictDetailsOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  baseClassSlots: TimetableSlot[];
  selectedRepeatCourses: string[];
  selectedAddons: Record<string, string>;
  clashAnalysis: CourseClashAnalysis[];
  masterSlots: TimetableSlot[];
  onSelectSection: (courseCode: string, section: string) => void;
  themePrefs?: ThemePreferences;
}

export interface DetailedClashRecord {
  id: string;
  day: DayOfWeek;
  overlapStart: string;
  overlapEnd: string;
  overlapStartDec: number;
  overlapEndDec: number;
  durationHours: number;
  slotA: TimetableSlot;
  slotB: TimetableSlot;
  isBaseClash: boolean; // whether one of the slots is a base section slot
}

export const ConflictDetailsOverlay: React.FC<ConflictDetailsOverlayProps> = ({
  isOpen,
  onClose,
  baseClassSlots,
  selectedRepeatCourses,
  selectedAddons,
  clashAnalysis,
  masterSlots,
  onSelectSection,
  themePrefs
}) => {
  const style = getThemePalette(themePrefs?.palette);
  if (!isOpen) return null;

  const [filterDay, setFilterDay] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // 1. Calculate all specific pairwise time-slot duration overlaps currently active
  const activeRepeatSlots = useMemo(() => {
    const slots: TimetableSlot[] = [];
    selectedRepeatCourses.forEach(code => {
      const sec = selectedAddons[code];
      if (sec) {
        const match = masterSlots.filter(
          s => s.courseCode.toUpperCase() === code.toUpperCase() && s.section === sec
        );
        slots.push(...match);
      }
    });
    return slots;
  }, [selectedRepeatCourses, selectedAddons, masterSlots]);

  const allActiveSlots = useMemo(() => {
    return [...baseClassSlots, ...activeRepeatSlots];
  }, [baseClassSlots, activeRepeatSlots]);

  const clashRecords = useMemo(() => {
    const records: DetailedClashRecord[] = [];
    const days: DayOfWeek[] = ['ISNIN', 'SELASA', 'RABU', 'KHAMIS', 'JUMAAT'];

    days.forEach(day => {
      const daySlots = allActiveSlots.filter(s => s.day === day);
      if (daySlots.length < 2) return;

      for (let i = 0; i < daySlots.length; i++) {
        for (let j = i + 1; j < daySlots.length; j++) {
          const s1 = daySlots[i];
          const s2 = daySlots[j];

          // Check if they are from different course codes OR different sections
          if (s1.courseCode === s2.courseCode && s1.section === s2.section) continue;

          if (checkTimeOverlap(s1.startTime, s1.endTime, s2.startTime, s2.endTime)) {
            const start1 = timeToDecimal(s1.startTime);
            const end1 = timeToDecimal(s1.endTime);
            const start2 = timeToDecimal(s2.startTime);
            const end2 = timeToDecimal(s2.endTime);

            const overlapStartDec = Math.max(start1, start2);
            const overlapEndDec = Math.min(end1, end2);

            if (overlapEndDec > overlapStartDec) {
              const overlapStart = decimalToTime(overlapStartDec);
              const overlapEnd = decimalToTime(overlapEndDec);
              const durationHours = overlapEndDec - overlapStartDec;

              const isBase = baseClassSlots.some(b => b.id === s1.id) || baseClassSlots.some(b => b.id === s2.id);

              records.push({
                id: `${s1.id}_${s2.id}_${day}_${overlapStart}_${overlapEnd}`,
                day,
                overlapStart,
                overlapEnd,
                overlapStartDec,
                overlapEndDec,
                durationHours,
                slotA: s1,
                slotB: s2,
                isBaseClash: isBase
              });
            }
          }
        }
      }
    });

    return records;
  }, [allActiveSlots, baseClassSlots]);

  // Total conflict stats
  const totalConflictHours = useMemo(() => {
    return clashRecords.reduce((sum, r) => sum + r.durationHours, 0);
  }, [clashRecords]);

  // Filtered records
  const filteredRecords = useMemo(() => {
    return clashRecords.filter(r => {
      if (filterDay !== 'ALL' && r.day !== filterDay) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const textA = `${r.slotA.courseCode} ${r.slotA.courseName} ${r.slotA.section} ${r.slotA.venue}`.toLowerCase();
        const textB = `${r.slotB.courseCode} ${r.slotB.courseName} ${r.slotB.section} ${r.slotB.venue}`.toLowerCase();
        if (!textA.includes(q) && !textB.includes(q)) return false;
      }
      return true;
    });
  }, [clashRecords, filterDay, searchQuery]);

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-y-auto animate-in fade-in duration-200">
      <div className={`${style.cardBgClass} border ${style.borderColor} rounded-2xl max-w-4xl w-full p-5 sm:p-6 shadow-2xl space-y-5 my-auto max-h-[90vh] flex flex-col`}>
        
        {/* OVERLAY HEADER */}
        <div className={`flex flex-wrap items-center justify-between gap-3 border-b ${style.borderColor} pb-4 flex-shrink-0`}>
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-600 shadow-inner">
              <AlertTriangle className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className={`font-bold ${style.textPrimary} text-base`}>Specific Time-Slot Duration Overlap Matrix</h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-rose-50 text-rose-700 border border-rose-200">
                  {clashRecords.length} Active Overlaps
                </span>
              </div>
              <p className={`text-xs ${style.textSecondary} mt-0.5`}>
                Exact duration overlaps, clashing venues, and recommended section switches for repeat courses.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className={`p-1.5 rounded-lg ${style.bgMuted} border ${style.borderColor} ${style.textPrimary} hover:brightness-95 transition`}
            title="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* SUMMARY STATS & FILTERS TOOLBAR */}
        <div className={`${style.bgMuted} p-3.5 rounded-xl border ${style.borderColor} flex flex-wrap items-center justify-between gap-3 flex-shrink-0`}>
          
          <div className="flex items-center space-x-4 text-xs">
            <div className="flex items-center space-x-2">
              <Clock className="w-4 h-4 text-amber-500" />
              <span className={style.textSecondary}>Total Clash Hours:</span>
              <span className="font-mono font-bold text-amber-700 text-sm">
                {totalConflictHours.toFixed(1)} Hours
              </span>
            </div>
            <div className={`h-4 w-px ${style.borderColor} hidden sm:block`}></div>
            <div className={`${style.textSecondary} text-[11px] hidden sm:block`}>
              Affected Courses: <strong className={style.textPrimary}>{new Set(clashRecords.flatMap(r => [r.slotA.courseCode, r.slotB.courseCode])).size}</strong>
            </div>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap items-center gap-2 text-xs">
            {/* Search */}
            <input
              type="text"
              placeholder="Filter course or section..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className={`${style.inputClass} text-xs focus:outline-none focus:ring-1 w-36 sm:w-48`}
            />

            {/* Day Filter */}
            <select
              value={filterDay}
              onChange={e => setFilterDay(e.target.value)}
              className={`${style.inputClass} text-xs font-mono focus:outline-none focus:ring-1`}
            >
              <option value="ALL">All Days</option>
              <option value="ISNIN">ISNIN</option>
              <option value="SELASA">SELASA</option>
              <option value="RABU">RABU</option>
              <option value="KHAMIS">KHAMIS</option>
              <option value="JUMAAT">JUMAAT</option>
            </select>
          </div>
        </div>

        {/* OVERLAP CARDS SCROLLABLE CONTAINER */}
        <div className="overflow-y-auto space-y-4 pr-1 flex-1 scrollbar-thin">
          {filteredRecords.length === 0 ? (
            <div className={`text-center py-12 ${style.bgMuted} rounded-xl border ${style.borderColor} space-y-2`}>
              <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto opacity-90" />
              <h4 className={`font-bold ${style.textPrimary} text-sm`}>No Time-Slot Overlaps Found!</h4>
              <p className={`text-xs ${style.textSecondary} max-w-sm mx-auto`}>
                {clashRecords.length === 0
                  ? 'All selected repeat course sections are 100% clash-free with your base timetable schedule.'
                  : 'No clashes match your current search and day filters.'}
              </p>
            </div>
          ) : (
            filteredRecords.map((record, index) => {
              const { slotA, slotB } = record;

              // Find candidate alternative sections for repeat courses involved
              const repeatCodeA = selectedRepeatCourses.includes(slotA.courseCode) ? slotA.courseCode : null;
              const repeatCodeB = selectedRepeatCourses.includes(slotB.courseCode) ? slotB.courseCode : null;

              const targetRepeatCode = repeatCodeB || repeatCodeA;

              // Alternatives for target repeat code that don't clash
              const analysisForTarget = clashAnalysis.find(a => a.courseCode === targetRepeatCode);
              const clashFreeAlternatives = analysisForTarget?.sections.filter(s => s.isClashFree) || [];

              return (
                <div
                  key={record.id}
                  className={`${style.bgMuted} border border-rose-300 rounded-xl p-4 space-y-3 shadow-md hover:border-rose-500 transition`}
                >
                  {/* RECORD BADGE & TIME OVERLAP HEADER */}
                  <div className={`flex flex-wrap items-center justify-between gap-2 border-b ${style.borderColor} pb-2.5`}>
                    <div className="flex items-center space-x-2">
                      <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-rose-50 text-rose-700 border border-rose-200">
                        Overlap #{index + 1}
                      </span>
                      <span className={`font-bold ${style.accentText} text-xs font-mono`}>{record.day}</span>
                      <span className={`${style.textSecondary} text-xs font-mono`}>
                        {record.overlapStart} - {record.overlapEnd}
                      </span>
                    </div>

                    <div className="flex items-center space-x-2">
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-amber-50 text-amber-700 border border-amber-200 flex items-center space-x-1">
                        <Clock className="w-3.5 h-3.5 text-amber-600" />
                        <span>{record.durationHours.toFixed(1)} Hour(s) Overlap</span>
                      </span>
                    </div>
                  </div>

                  {/* VISUAL OVERLAP DURATION PROGRESS BAR */}
                  <div className="space-y-1">
                    <div className={`flex justify-between text-[10px] ${style.textSecondary} font-mono`}>
                      <span>Conflict Span Ratio</span>
                      <span className="text-rose-600 font-bold">{record.durationHours.toFixed(1)} Hours Clashing</span>
                    </div>
                    <div className={`w-full ${style.cardBgClass} h-2 rounded-full overflow-hidden border ${style.borderColor} flex`}>
                      <div
                        className="bg-gradient-to-r from-rose-500 to-amber-500 h-full rounded-full transition-all duration-300"
                        style={{ width: `${Math.min(100, (record.durationHours / 3) * 100)}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* SIDE-BY-SIDE CLASHING COURSES CARD GRID */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                    
                    {/* COURSE A */}
                    <div className={`${style.cardBgClass} p-3 rounded-lg border ${style.borderColor} space-y-1.5 text-xs`}>
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-amber-700 font-mono">{slotA.courseCode}</span>
                        <span className="text-[10px] font-mono bg-cyan-50 text-cyan-700 px-2 py-0.5 rounded border border-cyan-200">
                          Kumpulan {slotA.section}
                        </span>
                      </div>
                      <p className={`font-semibold ${style.textPrimary} truncate`}>{slotA.courseName}</p>
                      <div className={`text-[11px] ${style.textSecondary} font-mono space-y-0.5 pt-1 border-t ${style.borderColor}`}>
                        <p>Time Slot: <strong className={style.textPrimary}>{slotA.startTime} - {slotA.endTime}</strong></p>
                        <p>Venue: <strong className={style.textPrimary}>{slotA.venue}</strong></p>
                        <p>Lecturer: <strong className={style.textPrimary}>{slotA.lecturer}</strong></p>
                      </div>
                    </div>

                    {/* COURSE B */}
                    <div className={`${style.cardBgClass} p-3 rounded-lg border ${style.borderColor} space-y-1.5 text-xs`}>
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-amber-700 font-mono">{slotB.courseCode}</span>
                        <span className="text-[10px] font-mono bg-amber-50 text-amber-700 px-2 py-0.5 rounded border border-amber-200">
                          Kumpulan {slotB.section}
                        </span>
                      </div>
                      <p className={`font-semibold ${style.textPrimary} truncate`}>{slotB.courseName}</p>
                      <div className={`text-[11px] ${style.textSecondary} font-mono space-y-0.5 pt-1 border-t ${style.borderColor}`}>
                        <p>Time Slot: <strong className={style.textPrimary}>{slotB.startTime} - {slotB.endTime}</strong></p>
                        <p>Venue: <strong className={style.textPrimary}>{slotB.venue}</strong></p>
                        <p>Lecturer: <strong className={style.textPrimary}>{slotB.lecturer}</strong></p>
                      </div>
                    </div>

                  </div>

                  {/* QUICK RESOLUTION RECOMMENDATION ACTIONS */}
                  {targetRepeatCode && (
                    <div className={`${style.cardBgClass} p-2.5 rounded-lg border ${style.borderColor} flex flex-wrap items-center justify-between gap-2 text-xs`}>
                      <div className={`flex items-center space-x-1.5 ${style.textPrimary} text-[11px]`}>
                        <Sparkles className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />
                        <span>
                          Recommended switch for <strong className="text-amber-700 font-mono">{targetRepeatCode}</strong>:
                        </span>
                      </div>

                      <div className="flex flex-wrap items-center gap-1.5">
                        {clashFreeAlternatives.length === 0 ? (
                          <span className="text-[10px] text-rose-600 italic">
                            No clash-free sections available for {targetRepeatCode}. Consider priority drop.
                          </span>
                        ) : (
                          clashFreeAlternatives.map(alt => (
                             <button
                              key={alt.section}
                              onClick={() => {
                                onSelectSection(targetRepeatCode, alt.section);
                              }}
                              className="px-2.5 py-1 rounded-md bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px] transition flex items-center space-x-1 shadow-sm"
                              title={`Switch ${targetRepeatCode} to section ${alt.section} (100% Clash-Free)`}
                            >
                              <RefreshCw className="w-3 h-3 text-white" />
                              <span>Switch to Kumpulan {alt.section}</span>
                            </button>
                          ))
                        )}
                      </div>
                    </div>
                  )}

                </div>
              );
            })
          )}
        </div>

        {/* OVERLAY FOOTER */}
        <div className={`border-t ${style.borderColor} pt-3 flex flex-wrap items-center justify-between gap-2 flex-shrink-0 text-xs`}>
          <p className={`${style.textSecondary} text-[11px]`}>
            Politeknik Timetable Engine • Real-time duration overlap detection algorithm
          </p>
          <button
            onClick={onClose}
            className={`px-4 py-1.5 rounded-lg ${style.bgMuted} border ${style.borderColor} ${style.textPrimary} hover:brightness-95 font-semibold transition`}
          >
            Close Details
          </button>
        </div>

      </div>
    </div>
  );
};
