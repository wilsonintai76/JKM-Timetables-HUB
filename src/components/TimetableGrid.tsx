import React, { useState } from 'react';
import { TimetableSlot, DayOfWeek, ThemePreferences } from '../types';
import { timeToDecimal } from '../utils/timeUtils';
import { downloadICSFile } from '../utils/calendarExport';
import { GridHeader } from './grid/GridHeader';
import { GridCell } from './grid/GridCell';

interface TimetableGridProps {
  baseSection: string;
  combinedSlots: TimetableSlot[];
  studentName: string;
  onNavigateToPrint: () => void;
  themePrefs?: ThemePreferences;
}

const DAYS: DayOfWeek[] = ['ISNIN', 'SELASA', 'RABU', 'KHAMIS', 'JUMAAT'];
const TIME_SLOTS = [
  '08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00'
];

export const TimetableGrid: React.FC<TimetableGridProps> = ({
  baseSection,
  combinedSlots,
  studentName,
  onNavigateToPrint,
  themePrefs = { palette: 'cyber', font: 'sans' }
}) => {
  const [selectedDayFilter, setSelectedDayFilter] = useState<string>('ALL');
  const [copiedSummary, setCopiedSummary] = useState(false);

  const fontClass = themePrefs.font === 'mono' ? 'font-mono' : themePrefs.font === 'serif' ? 'font-serif' : 'font-sans';

  // Theme palettes styling definition
  const PALETTE_STYLES: Record<string, any> = {
    cyber: {
      accentText: 'text-cyan-600',
      accentBg: 'bg-cyan-600',
      gridBg: 'bg-white border-slate-200',
      gridBorder: 'border-slate-200',
      baseSlotClass: 'bg-blue-50 border-blue-200 text-blue-900 hover:border-blue-400 font-bold',
      legendBaseBg: 'bg-blue-500 border-blue-400',
      pillActive: 'bg-cyan-600 text-white font-black shadow-sm',
      btnClass: 'bg-cyan-600 hover:bg-cyan-500 text-white shadow-sm',
      textPrimary: 'text-slate-900',
      textSecondary: 'text-slate-500',
      bgMuted: 'bg-slate-50 border border-slate-100',
    },
    emerald: {
      accentText: 'text-emerald-700',
      accentBg: 'bg-emerald-600',
      gridBg: 'bg-white border-emerald-100',
      gridBorder: 'border-emerald-100',
      baseSlotClass: 'bg-teal-50 border-teal-200 text-teal-900 hover:border-teal-400 font-bold',
      legendBaseBg: 'bg-teal-500 border-teal-400',
      pillActive: 'bg-emerald-600 text-white font-black shadow-sm',
      btnClass: 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm',
      textPrimary: 'text-slate-900',
      textSecondary: 'text-slate-500',
      bgMuted: 'bg-emerald-50/50 border border-emerald-100/40',
    },
    midnight: {
      accentText: 'text-violet-700',
      accentBg: 'bg-violet-600',
      gridBg: 'bg-white border-indigo-100',
      gridBorder: 'border-indigo-100',
      baseSlotClass: 'bg-indigo-50 border-indigo-200 text-indigo-900 hover:border-indigo-400 font-bold',
      legendBaseBg: 'bg-indigo-500 border-indigo-400',
      pillActive: 'bg-violet-600 text-white font-black shadow-sm',
      btnClass: 'bg-violet-600 hover:bg-violet-500 text-white shadow-sm',
      textPrimary: 'text-slate-900',
      textSecondary: 'text-slate-500',
      bgMuted: 'bg-indigo-50/40 border border-indigo-100/40',
    },
    amber: {
      accentText: 'text-amber-700',
      accentBg: 'bg-amber-600',
      gridBg: 'bg-white border-stone-200',
      gridBorder: 'border-stone-200',
      baseSlotClass: 'bg-stone-50 border-stone-300 text-stone-900 hover:border-stone-400 font-bold',
      legendBaseBg: 'bg-stone-500 border-stone-400',
      pillActive: 'bg-amber-600 text-stone-950 font-black shadow-sm',
      btnClass: 'bg-amber-600 hover:bg-amber-500 text-stone-950 font-black shadow-sm',
      textPrimary: 'text-stone-900',
      textSecondary: 'text-stone-500',
      bgMuted: 'bg-stone-100/60 border border-stone-200/40',
    },
    contrast: {
      accentText: 'text-black font-black',
      accentBg: 'bg-black',
      gridBg: 'bg-white border-2 border-black',
      gridBorder: 'border-black',
      baseSlotClass: 'bg-white border-2 border-zinc-800 text-zinc-950 hover:border-black font-black',
      legendBaseBg: 'bg-zinc-900 border-black',
      pillActive: 'bg-black text-white font-black shadow-sm',
      btnClass: 'bg-black hover:bg-zinc-800 text-white font-black shadow-sm',
      textPrimary: 'text-black',
      textSecondary: 'text-zinc-700',
      bgMuted: 'bg-zinc-50 border border-zinc-200',
    }
  };

  const style = PALETTE_STYLES[themePrefs.palette] || PALETTE_STYLES.cyber;

  // Detect time clashes in combined slots
  const clashSlotsMap = new Map<string, boolean>();
  for (let i = 0; i < combinedSlots.length; i++) {
    for (let j = i + 1; j < combinedSlots.length; j++) {
      const s1 = combinedSlots[i];
      const s2 = combinedSlots[j];
      if (s1.day === s2.day) {
        const start1 = timeToDecimal(s1.startTime);
        const end1 = timeToDecimal(s1.endTime);
        const start2 = timeToDecimal(s2.startTime);
        const end2 = timeToDecimal(s2.endTime);
        if (start1 < end2 && end1 > start2) {
          clashSlotsMap.set(s1.id, true);
          clashSlotsMap.set(s2.id, true);
        }
      }
    }
  }

  const handleCopySummary = () => {
    let summaryText = `*JADUAL WAKTU POLITEKNIK JKM*\nNama: ${studentName}\nKumpulan Asal: ${baseSection}\n\n`;
    DAYS.forEach(day => {
      const daySlots = combinedSlots.filter(s => s.day === day);
      if (daySlots.length > 0) {
        summaryText += `*${day}*:\n`;
        daySlots.sort((a, b) => timeToDecimal(a.startTime) - timeToDecimal(b.startTime));
        daySlots.forEach(s => {
          summaryText += `• ${s.startTime}-${s.endTime}: ${s.courseCode} ${s.courseName} (${s.section}) @ ${s.venue}${s.isRepeat ? ' [KURSUS MENGULANG]' : ''}\n`;
        });
        summaryText += `\n`;
      }
    });
    navigator.clipboard.writeText(summaryText);
    setCopiedSummary(true);
    setTimeout(() => setCopiedSummary(false), 3000);
  };

  const visibleDays = selectedDayFilter === 'ALL' ? DAYS : [selectedDayFilter as DayOfWeek];

  return (
    <div className={`${style.gridBg} rounded-xl p-4 border shadow-lg space-y-3.5 no-print ${fontClass}`}>

      <GridHeader 
        baseSection={baseSection}
        selectedDayFilter={selectedDayFilter}
        setSelectedDayFilter={setSelectedDayFilter}
        DAYS={DAYS}
        downloadICSFile={() => downloadICSFile(combinedSlots, studentName)}
        handleCopySummary={handleCopySummary}
        copiedSummary={copiedSummary}
        onNavigateToPrint={onNavigateToPrint}
        style={style}
      />

      {/* COLOR LEGEND BANNER */}
      <div className={`flex flex-wrap items-center justify-between text-[11px] ${style.bgMuted} p-2.5 rounded-lg border ${style.gridBorder} gap-2 shadow-inner`}>
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center space-x-1.5">
            <span className={`w-3 h-3 rounded ${style.legendBaseBg} inline-block shadow-sm`}></span>
            <span className={`${style.textSecondary} font-black uppercase tracking-tight`}>Base ({baseSection})</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="w-3 h-3 rounded bg-amber-500 border border-amber-300 inline-block shadow-sm"></span>
            <span className={`${style.textSecondary} font-black uppercase tracking-tight`}>Repeat Module</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="w-3 h-3 rounded bg-rose-500 border border-rose-300 inline-block shadow-sm animate-pulse"></span>
            <span className="text-rose-600 font-black uppercase tracking-tight">Time Clash</span>
          </div>
        </div>

        <div className={`${style.textSecondary} text-[10px] font-black`}>
          REGISTERED: <strong className={`${style.accentText} font-mono`}>{combinedSlots.length * 2}H/WK</strong>
        </div>
      </div>

      {/* TIMETABLE GRID MATRIX */}
      <div className={`overflow-x-auto rounded-lg border ${style.gridBorder} shadow-sm`}>
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className={`bg-slate-100 ${style.textSecondary} font-mono border-b ${style.gridBorder} text-[11px]`}>
              <th className={`p-2 border-r ${style.gridBorder} w-20 text-center font-black bg-slate-50 uppercase`}>Hari</th>
              {TIME_SLOTS.map(t => (
                <th key={t} className={`p-1.5 border-r ${style.gridBorder} text-center font-black min-w-[95px] uppercase`}>
                  {t}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className={`divide-y-0 ${style.gridBorder} font-mono bg-white`}>
            {visibleDays.map(day => (
              <tr key={day} className={`hover:bg-slate-50/40 border-b ${style.gridBorder}`}>
                <td className={`p-2 font-black ${style.textPrimary} border-r ${style.gridBorder} font-mono bg-slate-50/80 text-center text-xs align-middle uppercase tracking-tighter`}>
                  {day}
                </td>

                {TIME_SLOTS.map(timeStr => {
                  const currentDec = timeToDecimal(timeStr);
                  const activeSlots = combinedSlots.filter(s => {
                    if (s.day !== day) return false;
                    const startDec = timeToDecimal(s.startTime);
                    const endDec = timeToDecimal(s.endTime);
                    return currentDec >= startDec && currentDec < endDec;
                  });

                  return (
                    <td key={timeStr} className={`p-1 border-r ${style.gridBorder} align-top min-w-[105px] h-full`}>
                      <GridCell 
                        activeSlots={activeSlots}
                        clashSlotsMap={clashSlotsMap}
                        style={style}
                      />
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
