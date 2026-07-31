import React, { useState, useMemo } from 'react';
import { TimetableSlot, ThemePreferences } from '../types';
import { getThemePalette } from '../utils/theme';
import { Flame, Layers, ShieldCheck, AlertTriangle, Check, ArrowRight, Filter, Info, ChevronRight, Zap } from 'lucide-react';

interface DepartmentConflictHeatmapProps {
  baseClassSlots: TimetableSlot[];
  masterSlots: TimetableSlot[];
  availableSections: string[];
  selectedRepeatCourses: string[];
  selectedAddons: Record<string, string>;
  onSelectSectionForCourse: (courseCode: string, section: string) => void;
  themePrefs?: ThemePreferences;
}

export const DepartmentConflictHeatmap: React.FC<DepartmentConflictHeatmapProps> = ({
  baseClassSlots,
  masterSlots,
  availableSections,
  selectedRepeatCourses,
  selectedAddons,
  onSelectSectionForCourse,
  themePrefs
}) => {
  const style = getThemePalette(themePrefs?.palette);
  const [selectedDeptFilter, setSelectedDeptFilter] = useState<string>('ALL');
  const [activeCourseFilter, setActiveCourseFilter] = useState<string>('ALL');
  const [hoveredSection, setHoveredSection] = useState<string | null>(null);

  // Extract department prefixes (e.g., DKM, DAD, DKA, DTP, DPU, JKM)
  const departments = useMemo(() => {
    const set = new Set<string>();
    availableSections.forEach(sec => {
      const match = sec.match(/^([A-Z]+)/);
      if (match) set.add(match[1]);
    });
    return Array.from(set).sort();
  }, [availableSections]);

  // Compute collision stats per section
  const sectionStats = useMemo(() => {
    return availableSections.map(sec => {
      const secSlots = masterSlots.filter(s => s.section.toUpperCase() === sec.toUpperCase());
      const totalSlots = secSlots.length;

      let clashCount = 0;
      const clashingCourses = new Set<string>();

      secSlots.forEach(s => {
        const isClash = baseClassSlots.some(
          base => base.day.toUpperCase() === s.day.toUpperCase() && base.startTime === s.startTime
        );
        if (isClash) {
          clashCount++;
          clashingCourses.add(s.courseCode);
        }
      });

      const clashPercentage = totalSlots > 0 ? Math.round((clashCount / totalSlots) * 100) : 0;
      const dept = sec.match(/^([A-Z]+)/)?.[1] || 'OTHER';

      return {
        section: sec,
        department: dept,
        totalSlots,
        clashCount,
        clashPercentage,
        clashingCourses: Array.from(clashingCourses),
        isSafe: clashCount === 0 && totalSlots > 0
      };
    });
  }, [availableSections, masterSlots, baseClassSlots]);

  // Filtered sections based on department
  const filteredSections = useMemo(() => {
    let list = sectionStats;
    if (selectedDeptFilter !== 'ALL') {
      list = list.filter(s => s.department === selectedDeptFilter);
    }
    return list.sort((a, b) => a.clashPercentage - b.clashPercentage);
  }, [sectionStats, selectedDeptFilter]);

  // 5 Days x 9 Time slots Heatmap Grid matrix
  const days = ['ISNIN', 'SELASA', 'RABU', 'KHAMIS', 'JUMAAT'];
  const timeSlots = ['08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00'];

  // Calculate clash density map for the 5x9 grid
  const timeSlotDensity = useMemo(() => {
    const densityMap: Record<string, number> = {};

    days.forEach(day => {
      timeSlots.forEach(time => {
        const key = `${day}_${time}`;
        // Count how many sections in filtered list have a slot at this time
        let count = 0;
        const targetSecs = selectedDeptFilter === 'ALL'
          ? availableSections
          : availableSections.filter(s => s.startsWith(selectedDeptFilter));

        const isBaseSlot = baseClassSlots.some(b => b.day.toUpperCase() === day && b.startTime === time);

        if (isBaseSlot) {
          // If it's a base schedule slot, count how many sections also have class here
          masterSlots.forEach(ms => {
            if (targetSecs.includes(ms.section) && ms.day.toUpperCase() === day && ms.startTime === time) {
              count++;
            }
          });
        }

        densityMap[key] = count;
      });
    });

    return densityMap;
  }, [days, timeSlots, selectedDeptFilter, availableSections, baseClassSlots, masterSlots]);

  // Max density for color normalization
  const maxDensity = Math.max(1, ...Object.values(timeSlotDensity));

  return (
    <div className={`${style.cardBgClass} border rounded-2xl p-5 shadow-xl space-y-5`}>

      {/* HEADER BAR */}
      <div className={`flex flex-wrap items-center justify-between gap-3 border-b ${style.borderColor} pb-3.5`}>
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-xl bg-amber-50 text-amber-700 border border-amber-200">
            <Flame className="w-5 h-5 text-amber-600 animate-pulse" />
          </div>
          <div>
            <h3 className={`font-extrabold ${style.textPrimary} text-sm tracking-tight flex items-center space-x-2`}>
              <span>JKM Programme Conflict Heatmap</span>
              <span className={`text-[10px] font-mono ${style.badgeClass} px-2 py-0.5 rounded`}>
                Visual Swapping Intelligence
              </span>
            </h3>
            <p className={`text-[11px] ${style.textSecondary}`}>
              Analyze collision density across Mechanical programmes (DKM, DTP, DAD, DPU) to find 100% clash-free section swaps.
            </p>
          </div>
        </div>

        {/* PROGRAMME SELECTOR FILTER */}
        <div className={`flex items-center space-x-2 ${style.bgMuted} p-1.5 rounded-xl border ${style.borderColor} text-xs`}>
          <Filter className={`w-3.5 h-3.5 ${style.accentText} ml-1`} />
          <span className={`${style.textSecondary} font-medium`}>Programme:</span>
          <select
            value={selectedDeptFilter}
            onChange={e => setSelectedDeptFilter(e.target.value)}
            className={`${style.inputClass} font-bold rounded-lg px-2 py-1 text-xs`}
          >
            <option value="ALL">All JKM Programmes ({availableSections.length} Sections)</option>
            {departments.map(d => {
              const labelMap: Record<string, string> = {
                DKM: 'DKM - DIPLOMA IN MECHANICAL ENGINEERING',
                DAD: 'DAD - DIPLOMA IN MECHANICAL ENGINEERING (AUTOMOTIVE)',
                DPU: 'DPU - DIPLOMA IN MECHANICAL ENGINEERING (AIR CONDITIONING AND REFRIGERATION)',
                DTP: 'DTP - DIPLOMA IN MECHANICAL ENGINEERING (MANUFACTURING)'
              };
              const label = labelMap[d] || `Programme ${d}`;
              const count = availableSections.filter(s => s.startsWith(d)).length;
              return (
                <option key={d} value={d}>
                  {label} ({count} Sections)
                </option>
              );
            })}
          </select>
        </div>
      </div>

      {/* CROSS-PROGRAMME REGISTRATION NOTICE */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-2.5 text-xs text-blue-900 flex items-center justify-between gap-2 shadow-sm">
        <div className="flex items-center space-x-2">
          <Info className="w-4 h-4 text-blue-700 flex-shrink-0" />
          <span className="font-medium">
            <strong className="text-blue-900 font-extrabold">Cross-Programme Module Registration:</strong> JKM students can register for repeat modules offered by <em>any programme</em> (DKM, DTP, DAD, DPU) as long as the course code is identical (e.g. DJJ10013, DBM10013).
          </span>
        </div>
        <span className="text-[10px] bg-blue-100 text-blue-900 border border-blue-300 px-2.5 py-0.5 rounded font-mono font-extrabold whitespace-nowrap shadow-sm">
          Allowed
        </span>
      </div>

      {/* SECTION CONFLICT HEATMAP SPECTRUM GRID */}
      <div className="space-y-2">
        <div className="flex justify-between items-center text-xs">
          <span className={`font-bold ${style.textPrimary} flex items-center space-x-1.5`}>
            <Layers className={`w-4 h-4 ${style.accentText}`} />
            <span>Section Clash Density Matrix ({filteredSections.length} Sections)</span>
          </span>
          {/* LEGEND BADGES */}
          <div className="flex items-center space-x-3 text-[10px] font-mono">
            <span className="flex items-center space-x-1">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block shadow-sm"></span>
              <span className="text-emerald-700 font-bold">0% Safe</span>
            </span>
            <span className="flex items-center space-x-1">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400 inline-block"></span>
              <span className="text-amber-700 font-semibold">&lt;25% Low</span>
            </span>
            <span className="flex items-center space-x-1">
              <span className="w-2.5 h-2.5 rounded-full bg-orange-500 inline-block"></span>
              <span className="text-orange-700 font-semibold">25-50% Med</span>
            </span>
            <span className="flex items-center space-x-1">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-600 inline-block"></span>
              <span className="text-rose-700 font-bold">&gt;50% Heavy Clash</span>
            </span>
          </div>
        </div>

        {/* GRID OF SECTIONS WITH HEAT MAP COLORS */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
          {filteredSections.map(item => {
            let bgClass = 'bg-emerald-50 border-emerald-400 text-emerald-950 hover:bg-emerald-100';
            let badgeText = '100% Safe';
            let badgeBg = 'bg-emerald-100 text-emerald-900 border-emerald-300 font-extrabold';

            if (item.clashPercentage > 50) {
              bgClass = 'bg-rose-50 border-rose-400 text-rose-950 hover:bg-rose-100';
              badgeText = `${item.clashPercentage}% Clash`;
              badgeBg = 'bg-rose-100 text-rose-900 border-rose-300 font-extrabold';
            } else if (item.clashPercentage > 25) {
              bgClass = 'bg-orange-50 border-orange-400 text-orange-950 hover:bg-orange-100';
              badgeText = `${item.clashPercentage}% Clash`;
              badgeBg = 'bg-orange-100 text-orange-900 border-orange-300 font-extrabold';
            } else if (item.clashPercentage > 0) {
              bgClass = 'bg-amber-50 border-amber-400 text-amber-950 hover:bg-amber-100';
              badgeText = `${item.clashPercentage}% Clash`;
              badgeBg = 'bg-amber-100 text-amber-900 border-amber-300 font-extrabold';
            }

            return (
              <div
                key={item.section}
                onMouseEnter={() => setHoveredSection(item.section)}
                onMouseLeave={() => setHoveredSection(null)}
                className={`p-2.5 rounded-xl border transition-all cursor-pointer space-y-1.5 shadow-md ${bgClass} relative group`}
              >
                <div className="flex justify-between items-center">
                  <span className="font-black text-xs font-mono tracking-tight">{item.section}</span>
                  <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded border ${badgeBg}`}>
                    {badgeText}
                  </span>
                </div>

                <div className="text-[10px] font-mono flex justify-between font-bold">
                  <span>{item.totalSlots} Slots</span>
                  <span>{item.clashCount} Clashes</span>
                </div>

                {/* VISUAL MINI PROGRESS STRIP */}
                <div className="w-full h-1.5 bg-slate-300/50 rounded-full overflow-hidden border border-slate-300/30">
                  <div
                    style={{ width: `${item.clashPercentage}%` }}
                    className={`h-full ${
                      item.clashPercentage > 50
                        ? 'bg-rose-700'
                        : item.clashPercentage > 25
                        ? 'bg-orange-600'
                        : item.clashPercentage > 0
                        ? 'bg-amber-600'
                        : 'bg-emerald-600'
                    }`}
                  ></div>
                </div>

                {/* HOVER TOOLTIP DETAIL OVERLAY */}
                {hoveredSection === item.section && (
                  <div className="absolute z-30 bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-56 p-2.5 bg-white border border-slate-200 rounded-xl shadow-2xl text-[11px] space-y-1 text-slate-800 pointer-events-none">
                    <p className="font-bold text-cyan-700 border-b border-slate-100 pb-1">
                      Section {item.section} Overview
                    </p>
                    <p className="text-[10px] text-slate-500">
                      Total timetable slots: <strong className="text-slate-800">{item.totalSlots}</strong>
                    </p>
                    {item.clashCount > 0 ? (
                      <p className="text-[10px] text-rose-700">
                        Clashes with base schedule at <strong className="text-rose-700">{item.clashCount} timeslots</strong>.
                      </p>
                    ) : (
                      <p className="text-[10px] text-emerald-700 font-bold flex items-center space-x-1">
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Zero clashes with your base schedule!</span>
                      </p>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* QUICK ASSIGN FOR SELECTED REPEAT COURSES */}
      {selectedRepeatCourses.length > 0 && (
        <div className={`${style.bgMuted} p-4 rounded-xl border ${style.borderColor} space-y-3`}>
          <div className={`flex items-center justify-between border-b ${style.borderColor} pb-2`}>
            <h4 className="font-bold text-xs text-amber-600 flex items-center space-x-1.5">
              <Zap className="w-4 h-4 text-amber-500" />
              <span>Smart Section Assignment for Selected Carry Courses</span>
            </h4>
            <span className={`text-[10px] ${style.badgeClass} px-2 py-0.5 rounded`}>
              ✓ Atomic Section Rule: All hours assigned to selected section
            </span>
          </div>

          <div className="space-y-2">
            {selectedRepeatCourses.map(courseCode => {
              const currentSection = selectedAddons[courseCode];
              // Find all sections offering this course
              const offeringSlots = masterSlots.filter(s => s.courseCode.toUpperCase() === courseCode.toUpperCase());
              const offeringSecs = Array.from(new Set(offeringSlots.map(s => s.section))).sort();

              return (
                <div key={courseCode} className={`flex flex-wrap items-center justify-between gap-2 p-2 ${style.cardBgClass} rounded-lg border ${style.borderColor}`}>
                  <div>
                    <span className="font-bold font-mono text-cyan-700 text-xs mr-2">{courseCode}</span>
                    <span className={`text-[11px] ${style.textSecondary}`}>Current Section:</span>
                    <span className="ml-1.5 font-mono text-amber-800 font-bold text-xs bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                      {currentSection || 'None Selected'}
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-1.5">
                    {offeringSecs.map(sec => {
                      // Check if this section has clash for this course
                      const secSlots = offeringSlots.filter(s => s.section === sec);
                      const isClashing = secSlots.some(s =>
                        baseClassSlots.some(b => b.day.toUpperCase() === s.day.toUpperCase() && b.startTime === s.startTime)
                      );
                      const isSelected = currentSection === sec;

                      return (
                        <button
                          key={sec}
                          onClick={() => onSelectSectionForCourse(courseCode, sec)}
                          className={`px-2 py-1 rounded text-[10px] font-mono font-bold transition flex items-center space-x-1 border ${
                            isSelected
                              ? 'bg-cyan-600 text-white border-cyan-500 shadow-md'
                              : isClashing
                              ? 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100'
                              : 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                          }`}
                          title={isClashing ? `Clashes with base schedule` : `0 Clash Safe Section`}
                        >
                          <span>{sec}</span>
                          {isClashing ? (
                            <span className="text-rose-500 text-[9px]">⚠️</span>
                          ) : (
                            <Check className="w-3 h-3 text-emerald-600" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* WEEKLY TIME SLOT CLASH PRESSURE MATRIX */}
      <div className={`space-y-2 pt-1 border-t ${style.borderColor}`}>
        <div className="flex justify-between items-center text-xs">
          <span className={`font-bold ${style.textPrimary}`}>
            Weekly Schedule Conflict Pressure Map (Base Schedule vs Master Database)
          </span>
          <span className={`text-[10px] ${style.textSecondary} font-mono`}>
            Highlight = Base Class Active Slot
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className={`w-full text-center border-collapse border ${style.borderColor} text-[10px] font-mono`}>
            <thead>
              <tr className={`${style.bgMuted} ${style.textSecondary} border-b ${style.borderColor}`}>
                <th className={`p-1.5 border-r ${style.borderColor} w-16`}>HARI</th>
                {timeSlots.map(t => (
                  <th key={t} className={`p-1.5 border-r ${style.borderColor}`}>{t}</th>
                ))}
              </tr>
            </thead>
            <tbody className={`divide-y ${style.borderColor}`}>
              {days.map(day => (
                <tr key={day} className="h-8">
                  <td className={`p-1.5 border-r ${style.borderColor} font-bold ${style.bgMuted} ${style.textPrimary}`}>
                    {day.substring(0, 3)}
                  </td>
                  {timeSlots.map(time => {
                    const key = `${day}_${time}`;
                    const density = timeSlotDensity[key] || 0;
                    const isBaseSlot = baseClassSlots.some(b => b.day.toUpperCase() === day && b.startTime === time);
                    const baseSlotObj = baseClassSlots.find(b => b.day.toUpperCase() === day && b.startTime === time);

                    let cellBg = `${style.cardBgClass} ${style.textSecondary}`;
                    if (isBaseSlot) {
                      cellBg = 'bg-cyan-50 text-cyan-800 border border-cyan-300 font-extrabold';
                    } else if (density > 0) {
                      cellBg = `${style.bgMuted} ${style.textPrimary}`;
                    }

                    return (
                      <td
                        key={time}
                        className={`p-1 border-r ${style.borderColor} align-middle transition ${cellBg}`}
                        title={
                          isBaseSlot
                            ? `Base Class: ${baseSlotObj?.courseCode} (${baseSlotObj?.courseName})`
                            : `${density} department classes scheduled at this time`
                        }
                      >
                        {isBaseSlot ? (
                          <span className="text-[9px] text-cyan-700 font-extrabold">{baseSlotObj?.courseCode}</span>
                        ) : (
                          <span className="opacity-40 text-[9px]">-</span>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
