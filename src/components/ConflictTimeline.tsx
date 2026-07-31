import React, { useState, useMemo } from 'react';
import { TimetableSlot, DayOfWeek, CourseClashAnalysis, ThemePreferences } from '../types';
import { getThemePalette } from '../utils/theme';
import { timeToDecimal, decimalToTime, checkTimeOverlap } from '../utils/timeUtils';
import { AlertTriangle, CheckCircle2, Clock, Layers, Filter, Eye, Sparkles, Info } from 'lucide-react';

interface ConflictTimelineProps {
  baseClassSlots: TimetableSlot[];
  selectedRepeatCourses: string[];
  selectedAddons: Record<string, string>; // courseCode -> section
  clashAnalysis: CourseClashAnalysis[];
  masterSlots: TimetableSlot[];
  onSelectSection?: (courseCode: string, section: string) => void;
  onOpenDetailsOverlay?: () => void;
  themePrefs?: ThemePreferences;
}

const DAYS: DayOfWeek[] = ['ISNIN', 'SELASA', 'RABU', 'KHAMIS', 'JUMAAT'];
const START_HOUR = 8; // 08:00 AM
const END_HOUR = 18; // 06:00 PM
const TOTAL_HOURS = END_HOUR - START_HOUR; // 10 hours

const HOUR_TICKS = Array.from({ length: TOTAL_HOURS + 1 }, (_, i) => START_HOUR + i);

interface ConflictInterval {
  day: DayOfWeek;
  startTime: string;
  endTime: string;
  startDec: number;
  endDec: number;
  durationHours: number;
  slotsInvolved: TimetableSlot[];
}

export const ConflictTimeline: React.FC<ConflictTimelineProps> = ({
  baseClassSlots,
  selectedRepeatCourses,
  selectedAddons,
  clashAnalysis,
  masterSlots,
  onSelectSection,
  onOpenDetailsOverlay,
  themePrefs
}) => {
  const style = getThemePalette(themePrefs?.palette);
  const [viewMode, setViewMode] = useState<'selected' | 'all_candidates'>('selected');
  const [selectedDayFilter, setSelectedDayFilter] = useState<string>('ALL');
  const [hoveredSlot, setHoveredSlot] = useState<TimetableSlot | null>(null);
  const [hoveredConflict, setHoveredConflict] = useState<ConflictInterval | null>(null);

  // Collect active slots based on view mode
  const activeRepeatSlots = useMemo(() => {
    if (selectedRepeatCourses.length === 0) return [];

    if (viewMode === 'selected') {
      // Only slots from selected addons
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
    } else {
      // All slots for candidate repeat courses across all sections
      const slots: TimetableSlot[] = [];
      selectedRepeatCourses.forEach(code => {
        const match = masterSlots.filter(s => s.courseCode.toUpperCase() === code.toUpperCase());
        slots.push(...match);
      });
      return slots;
    }
  }, [selectedRepeatCourses, selectedAddons, viewMode, masterSlots]);

  // Combine base slots + repeat slots
  const allCurrentSlots = useMemo(() => {
    return [...baseClassSlots, ...activeRepeatSlots];
  }, [baseClassSlots, activeRepeatSlots]);

  // Compute exact overlapping conflict intervals per day
  const conflictIntervals = useMemo(() => {
    const conflicts: ConflictInterval[] = [];

    DAYS.forEach(day => {
      const daySlots = allCurrentSlots.filter(s => s.day === day);
      if (daySlots.length < 2) return;

      // Pairwise check for time overlap
      for (let i = 0; i < daySlots.length; i++) {
        for (let j = i + 1; j < daySlots.length; j++) {
          const s1 = daySlots[i];
          const s2 = daySlots[j];

          if (checkTimeOverlap(s1.startTime, s1.endTime, s2.startTime, s2.endTime)) {
            const start1 = timeToDecimal(s1.startTime);
            const end1 = timeToDecimal(s1.endTime);
            const start2 = timeToDecimal(s2.startTime);
            const end2 = timeToDecimal(s2.endTime);

            const overlapStart = Math.max(start1, start2);
            const overlapEnd = Math.min(end1, end2);

            if (overlapEnd > overlapStart) {
              const startStr = decimalToTime(overlapStart);
              const endStr = decimalToTime(overlapEnd);
              const duration = overlapEnd - overlapStart;

              // Check if we already recorded a similar interval for this day
              const existing = conflicts.find(
                c => c.day === day && c.startTime === startStr && c.endTime === endStr
              );

              if (existing) {
                if (!existing.slotsInvolved.some(s => s.id === s1.id)) existing.slotsInvolved.push(s1);
                if (!existing.slotsInvolved.some(s => s.id === s2.id)) existing.slotsInvolved.push(s2);
              } else {
                conflicts.push({
                  day,
                  startTime: startStr,
                  endTime: endStr,
                  startDec: overlapStart,
                  endDec: overlapEnd,
                  durationHours: duration,
                  slotsInvolved: [s1, s2]
                });
              }
            }
          }
        }
      }
    });

    return conflicts;
  }, [allCurrentSlots]);

  // Total conflict hours
  const totalConflictHours = useMemo(() => {
    return conflictIntervals.reduce((sum, c) => sum + c.durationHours, 0);
  }, [conflictIntervals]);

  const visibleDays = selectedDayFilter === 'ALL' ? DAYS : [selectedDayFilter as DayOfWeek];

  return (
    <div className={`${style.cardBgClass} rounded-xl p-4 border shadow-sm space-y-4`}>
      {/* TIMELINE HEADER TOOLBAR */}
      <div className={`flex flex-wrap items-center justify-between gap-3 border-b ${style.borderColor} pb-3`}>
        <div>
          <div className="flex items-center space-x-2">
            <Clock className="w-4 h-4 text-cyan-600" />
            <h3 className={`font-bold ${style.textPrimary} text-sm`}>Visual Conflict Timeline & Overlap Map</h3>
          </div>
          <p className={`text-[11px] ${style.textSecondary} mt-0.5`}>
            Color-coded time bar chart plotting base classes vs repeat course hours to pinpoint exact overlap zones.
          </p>
        </div>

        {/* CONTROLS & METRICS */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Total Conflict Hours Metric */}
          <div className={`px-3 py-1 rounded-lg border text-xs font-mono font-bold flex items-center space-x-1.5 ${
            totalConflictHours > 0
              ? 'bg-rose-50 border-rose-200 text-rose-700 animate-pulse'
              : 'bg-emerald-50 border-emerald-200 text-emerald-700'
          }`}>
            {totalConflictHours > 0 ? (
              <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
            ) : (
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            )}
            <span>
              {totalConflictHours > 0
                ? `${totalConflictHours.toFixed(1)} Hours Clash`
                : '100% Conflict-Free'}
            </span>
          </div>

          {/* View Mode Toggle */}
          <div className={`flex items-center ${style.bgMuted} p-1 rounded-lg border ${style.borderColor} text-[11px]`}>
            <button
              onClick={() => setViewMode('selected')}
              className={`px-2 py-0.5 rounded font-semibold transition ${
                viewMode === 'selected' ? 'bg-cyan-600 text-white font-bold' : `${style.textSecondary} hover:${style.textPrimary}`
              }`}
            >
              Selected Plan
            </button>
            <button
              onClick={() => setViewMode('all_candidates')}
              className={`px-2 py-0.5 rounded font-semibold transition ${
                viewMode === 'all_candidates' ? 'bg-amber-600 text-white font-bold' : `${style.textSecondary} hover:${style.textPrimary}`
              }`}
              title="Superimpose all section options for selected repeat courses"
            >
              All Sections Map
            </button>
          </div>

          {/* Day Filter */}
          <select
            value={selectedDayFilter}
            onChange={e => setSelectedDayFilter(e.target.value)}
            className={`${style.inputClass} text-xs font-mono focus:outline-none focus:ring-1`}
          >
            <option value="ALL">All Days (Mon-Fri)</option>
            {DAYS.map(d => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>

          {/* Show Conflict Details Button */}
          {onOpenDetailsOverlay && (
            <button
              onClick={onOpenDetailsOverlay}
              className="px-2.5 py-1 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-bold transition flex items-center space-x-1.5 shadow-sm active:scale-95"
            >
              <Eye className="w-3.5 h-3.5 text-rose-600" />
              <span>Show Conflict Details</span>
            </button>
          )}
        </div>
      </div>

      {/* COLOR-CODED LEGEND */}
      <div className={`flex flex-wrap items-center justify-between text-[11px] ${style.bgMuted} p-2.5 rounded-lg border ${style.borderColor} gap-2`}>
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center space-x-1.5">
            <span className="w-3.5 h-3.5 rounded bg-cyan-600/80 border border-cyan-500 inline-block"></span>
            <span className={`${style.textPrimary} font-medium`}>Base Section Class</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="w-3.5 h-3.5 rounded bg-amber-500/80 border border-amber-500 inline-block"></span>
            <span className={`${style.textPrimary} font-medium`}>Repeat Course Slot</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="w-3.5 h-3.5 rounded bg-rose-600 border border-rose-500 inline-block animate-pulse"></span>
            <span className="text-rose-700 font-bold">Conflict / Overlap Zone</span>
          </div>
        </div>

        <div className={`${style.textSecondary} text-[10px] flex items-center space-x-1`}>
          <Info className="w-3 h-3 text-cyan-600" />
          <span>Hover on any bar or clash zone for slot details</span>
        </div>
      </div>

      {/* TIMELINE CHART GRID CONTAINER */}
      <div className="overflow-x-auto scrollbar-thin pb-2">
        <div className="min-w-[700px] space-y-3">

          {/* TIME AXIS HEADER */}
          <div className={`grid grid-cols-12 items-center text-center text-[10px] font-mono ${style.textSecondary} border-b ${style.borderColor} pb-1`}>
            <div className={`col-span-2 text-left font-bold ${style.textPrimary} pl-2`}>DAY / TIME</div>
            <div className="col-span-10 grid grid-cols-10 relative">
              {HOUR_TICKS.slice(0, TOTAL_HOURS).map(hour => (
                <div key={hour} className="text-center font-bold">
                  {hour < 10 ? `0${hour}:00` : `${hour}:00`}
                </div>
              ))}
            </div>
          </div>

          {/* DAY ROWS */}
          {visibleDays.map(day => {
            const dayBaseSlots = baseClassSlots.filter(s => s.day === day);
            const dayRepeatSlots = activeRepeatSlots.filter(s => s.day === day);
            const dayConflicts = conflictIntervals.filter(c => c.day === day);

            return (
              <div key={day} className={`grid grid-cols-12 items-center ${style.bgMuted} rounded-lg p-2 border ${style.borderColor} relative hover:brightness-95 transition`}>
                
                {/* DAY LABEL */}
                <div className="col-span-2 pl-1">
                  <div className="flex items-center space-x-1.5">
                    <span className={`font-bold text-xs font-mono ${style.accentText}`}>{day}</span>
                    {dayConflicts.length > 0 && (
                      <span className="text-[9px] bg-rose-50 text-rose-700 border border-rose-200 px-1 rounded font-bold">
                        {dayConflicts.length} Clash
                      </span>
                    )}
                  </div>
                  <p className={`text-[9px] ${style.textSecondary}`}>
                    {dayBaseSlots.length + dayRepeatSlots.length} slot(s)
                  </p>
                </div>

                {/* TIMELINE BAR AREA (10 Hours Span) */}
                <div className={`col-span-10 relative h-16 ${style.cardBgClass} rounded border ${style.borderColor} overflow-hidden`}>
                  
                  {/* VERTICAL HOUR GUIDELINES */}
                  <div className="absolute inset-0 grid grid-cols-10 pointer-events-none">
                    {Array.from({ length: 10 }).map((_, i) => (
                      <div key={i} className="border-r border-slate-200/50 dark:border-slate-800/50 h-full"></div>
                    ))}
                  </div>

                  {/* 1. BASE CLASS SLOTS BARS */}
                  {dayBaseSlots.map(slot => {
                    const startDec = timeToDecimal(slot.startTime);
                    const endDec = timeToDecimal(slot.endTime);
                    const leftPct = Math.max(0, ((startDec - START_HOUR) / TOTAL_HOURS) * 100);
                    const widthPct = Math.min(100 - leftPct, ((endDec - startDec) / TOTAL_HOURS) * 100);

                    return (
                      <div
                        key={`base_${slot.id}`}
                        onMouseEnter={() => setHoveredSlot(slot)}
                        onMouseLeave={() => setHoveredSlot(null)}
                        style={{ left: `${leftPct}%`, width: `${widthPct}%` }}
                        className="absolute top-1 h-6 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 border border-cyan-400/60 rounded px-1.5 flex items-center justify-between text-[10px] text-white font-mono font-semibold shadow-sm cursor-pointer transition z-10 overflow-hidden truncate"
                        title={`${slot.courseCode} (${slot.courseName}) | ${slot.section} | ${slot.startTime}-${slot.endTime}`}
                      >
                        <span className="truncate font-bold">{slot.courseCode}</span>
                        <span className="text-[9px] text-cyan-100 hidden sm:inline">{slot.startTime}</span>
                      </div>
                    );
                  })}

                  {/* 2. REPEAT COURSE SLOTS BARS */}
                  {dayRepeatSlots.map((slot, idx) => {
                    const startDec = timeToDecimal(slot.startTime);
                    const endDec = timeToDecimal(slot.endTime);
                    const leftPct = Math.max(0, ((startDec - START_HOUR) / TOTAL_HOURS) * 100);
                    const widthPct = Math.min(100 - leftPct, ((endDec - startDec) / TOTAL_HOURS) * 100);

                    return (
                      <div
                        key={`repeat_${slot.id}_${idx}`}
                        onMouseEnter={() => setHoveredSlot(slot)}
                        onMouseLeave={() => setHoveredSlot(null)}
                        style={{ left: `${leftPct}%`, width: `${widthPct}%` }}
                        className="absolute bottom-1 h-6 bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 border border-amber-300 rounded px-1.5 flex items-center justify-between text-[10px] text-slate-950 font-mono font-bold shadow-sm cursor-pointer transition z-10 overflow-hidden truncate"
                        title={`[REPEAT] ${slot.courseCode} (${slot.courseName}) | Section ${slot.section} | ${slot.startTime}-${slot.endTime}`}
                      >
                        <span className="truncate">{slot.courseCode} ({slot.section})</span>
                        <span className="text-[9px] text-amber-950 hidden sm:inline">{slot.startTime}</span>
                      </div>
                    );
                  })}

                  {/* 3. OVERLAPPING CONFLICT ZONE BARS (PULSING HIGH-PRIORITY RED) */}
                  {dayConflicts.map((conf, idx) => {
                    const leftPct = Math.max(0, ((conf.startDec - START_HOUR) / TOTAL_HOURS) * 100);
                    const widthPct = Math.min(100 - leftPct, ((conf.endDec - conf.startDec) / TOTAL_HOURS) * 100);

                    return (
                      <div
                        key={`conf_${idx}`}
                        onMouseEnter={() => setHoveredConflict(conf)}
                        onMouseLeave={() => setHoveredConflict(null)}
                        style={{ left: `${leftPct}%`, width: `${widthPct}%` }}
                        className="absolute inset-y-0 bg-rose-600/40 border-2 border-rose-500 bg-[radial-gradient(#f43f5e_1px,transparent_1px)] [background-size:8px_8px] rounded z-20 flex items-center justify-center text-white font-mono font-extrabold text-[10px] cursor-pointer animate-pulse shadow-lg"
                        title={`CLASH DETECTED (${conf.startTime} - ${conf.endTime})! ${conf.slotsInvolved.map(s => s.courseCode).join(' vs ')}`}
                      >
                        <div className="bg-rose-950/90 px-1.5 py-0.5 rounded border border-rose-400 flex items-center space-x-1 shadow">
                          <AlertTriangle className="w-3 h-3 text-amber-300" />
                          <span className="text-amber-200 hidden sm:inline font-bold">CLASH {conf.startTime}-{conf.endTime}</span>
                        </div>
                      </div>
                    );
                  })}

                </div>

              </div>
            );
          })}

        </div>
      </div>

      {/* FLOATING INSPECTOR CARD ON HOVER */}
      {(hoveredSlot || hoveredConflict) && (
        <div className={`${style.cardBgClass} p-3 rounded-lg border ${style.borderColor} text-xs space-y-1.5 shadow-xl animate-in fade-in duration-150`}>
          {hoveredConflict ? (
            <div className="space-y-1 text-rose-700">
              <div className="flex items-center space-x-1.5 font-bold">
                <AlertTriangle className="w-4 h-4 text-rose-600" />
                <span>Overlapping Conflict Interval Details</span>
              </div>
              <p className={`text-[11px] ${style.textPrimary}`}>
                Time Interval: <strong className="font-mono">{hoveredConflict.day} {hoveredConflict.startTime} - {hoveredConflict.endTime}</strong> ({hoveredConflict.durationHours.toFixed(1)} Hours Overlap)
              </p>
              <div className="text-[11px] space-y-0.5 pt-1">
                <span className="block font-semibold text-rose-600">Conflicting Courses in this slot:</span>
                {hoveredConflict.slotsInvolved.map((s, i) => (
                  <div key={i} className={`flex items-center space-x-2 ${style.bgMuted} p-1.5 rounded border ${style.borderColor} font-mono`}>
                    <span className="text-amber-700 font-bold">{s.courseCode}</span>
                    <span className={`${style.textPrimary} text-[10px]`}>{s.courseName}</span>
                    <span className="text-cyan-600 text-[10px]">({s.section})</span>
                    <span className={`${style.textSecondary} text-[10px]`}>{s.venue}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : hoveredSlot ? (
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="space-y-0.5">
                <div className="flex items-center space-x-2">
                  <span className="font-bold text-amber-700 font-mono">{hoveredSlot.courseCode}</span>
                  <span className={`${style.textPrimary} font-semibold`}>{hoveredSlot.courseName}</span>
                  <span className={`${style.textSecondary} text-[10px]`}>({hoveredSlot.creditHours} Credits)</span>
                </div>
                <p className={`text-[11px] ${style.textSecondary}`}>
                  Section <strong className="text-cyan-600 font-mono">{hoveredSlot.section}</strong> • {hoveredSlot.day} {hoveredSlot.startTime} - {hoveredSlot.endTime} • Venue: <strong className={style.textPrimary}>{hoveredSlot.venue}</strong> • Lecturer: <strong className={style.textPrimary}>{hoveredSlot.lecturer}</strong>
                </p>
              </div>
            </div>
          ) : null}
        </div>
      )}

    </div>
  );
};
