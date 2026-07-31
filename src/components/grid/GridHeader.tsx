import React from 'react';
import { Calendar, Download, Copy, Check, Printer } from 'lucide-react';
import { DayOfWeek } from '../../types';

interface GridHeaderProps {
  baseSection: string;
  selectedDayFilter: string;
  setSelectedDayFilter: (day: string) => void;
  DAYS: DayOfWeek[];
  downloadICSFile: () => void;
  handleCopySummary: () => void;
  copiedSummary: boolean;
  onNavigateToPrint: () => void;
  style: any;
}

export const GridHeader: React.FC<GridHeaderProps> = ({
  baseSection,
  selectedDayFilter,
  setSelectedDayFilter,
  DAYS,
  downloadICSFile,
  handleCopySummary,
  copiedSummary,
  onNavigateToPrint,
  style
}) => {
  return (
    <div className={`flex flex-wrap items-center justify-between gap-3 border-b ${style.gridBorder} pb-3`}>
      <div>
        <div className="flex items-center space-x-2">
          <Calendar className={`w-4 h-4 ${style.accentText}`} />
          <h3 className={`font-black ${style.textPrimary} text-sm uppercase tracking-tight`}>Schedule Grid</h3>
        </div>
        <p className={`text-[11px] ${style.textSecondary} mt-0.5 font-bold`}>
          Base section <span className={`${style.accentText}`}>{baseSection}</span> with selected repeat courses.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <div className={`flex items-center space-x-0.5 ${style.bgMuted} p-0.5 rounded-lg border ${style.gridBorder} text-[11px] shadow-inner`}>
          <button
            onClick={() => setSelectedDayFilter('ALL')}
            className={`px-2 py-0.5 rounded transition ${
              selectedDayFilter === 'ALL' ? style.pillActive : `${style.textSecondary} hover:text-slate-900 font-extrabold`
            }`}
          >
            All
          </button>
          {DAYS.map(d => (
            <button
              key={d}
              onClick={() => setSelectedDayFilter(d)}
              className={`px-2 py-0.5 rounded transition ${
                selectedDayFilter === d ? style.pillActive : `${style.textSecondary} hover:text-slate-900 font-extrabold`
              }`}
            >
              {d.slice(0, 3)}
            </button>
          ))}
        </div>

        <button
          onClick={downloadICSFile}
          className="flex items-center space-x-1 px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black transition shadow-md active:scale-95"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Export .ICS</span>
        </button>

        <button
          onClick={handleCopySummary}
          className={`flex items-center space-x-1 px-2.5 py-1.5 rounded-lg ${style.bgMuted} border ${style.gridBorder} ${style.textPrimary} text-xs font-black transition active:scale-95 shadow-sm`}
        >
          {copiedSummary ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
          <span>{copiedSummary ? 'Copied!' : 'Copy Text'}</span>
        </button>

        <button
          onClick={onNavigateToPrint}
          className={`flex items-center space-x-1 px-2.5 py-1.5 rounded-lg ${style.btnClass} text-xs font-black transition shadow-md active:scale-95`}
        >
          <Printer className="w-3.5 h-3.5" />
          <span>Print Slip</span>
        </button>
      </div>
    </div>
  );
};
