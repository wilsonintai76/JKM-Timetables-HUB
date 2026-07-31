import React from 'react';
import { CourseClashAnalysis, PriorityLevel } from '../../types';
import { Flame, Star, CheckCircle2, XCircle, Clock, AlertTriangle, Check } from 'lucide-react';

interface ResultCardProps {
  analysis: CourseClashAnalysis;
  selectedSection: string | undefined;
  priority: PriorityLevel;
  onSelectSection: (code: string, sec: string) => void;
  style: any;
}

export const ResultCard: React.FC<ResultCardProps> = ({
  analysis,
  selectedSection,
  priority,
  onSelectSection,
  style
}) => {
  return (
    <div className={`${style.cardBgClass} rounded-xl p-4 border shadow-sm space-y-3`}>
      {/* COURSE HEADING */}
      <div className={`flex flex-wrap items-center justify-between gap-2 border-b ${style.borderColor} pb-2.5`}>
        <div>
          <div className="flex items-center space-x-2">
            <span className={`font-black ${style.accentText} text-sm font-mono`}>{analysis.courseCode}</span>
            <span className={`${style.textPrimary} text-xs font-black`}>{analysis.courseName}</span>
            <span className={`text-[11px] ${style.textSecondary}`}>({analysis.creditHours} Cr)</span>
          </div>
          <div className="flex items-center space-x-2 mt-1">
            <span className={`text-[10px] font-black px-1.5 py-0.2 rounded flex items-center space-x-1 shadow-sm ${
              priority === 'HIGH' ? 'bg-rose-50 text-rose-700 border border-rose-200' : 'bg-amber-50 text-amber-700 border border-amber-200'
            }`}>
              {priority === 'HIGH' ? <Flame className="w-3 h-3 text-rose-600" /> : <Star className="w-3 h-3 text-amber-600" />}
              <span>PRIORITY: {priority}</span>
            </span>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <span className={`text-[11px] font-black px-2.5 py-0.5 rounded-md ${style.bgMuted} border ${style.borderColor} ${style.textPrimary} shadow-sm`}>
            {analysis.sections.filter(s => s.isClashFree).length} / {analysis.sections.length} SAFE SECTIONS
          </span>
        </div>
      </div>

      {/* SECTION OPTIONS LIST */}
      <div className="space-y-2">
        {analysis.sections.map(secOpt => {
          const isSelected = selectedSection === secOpt.section;

          return (
            <div
              key={secOpt.section}
              className={`p-3 rounded-lg border transition flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm ${
                secOpt.isClashFree
                  ? isSelected
                    ? 'bg-emerald-50 border-emerald-500 text-emerald-950 ring-1 ring-emerald-500'
                    : `bg-white ${style.borderColor} hover:border-emerald-500`
                  : 'bg-rose-50/50 border-rose-300'
              }`}
            >
              <div className="space-y-1.5 flex-1">
                <div className="flex items-center space-x-2">
                  <span className={`font-black text-xs ${isSelected ? 'text-emerald-900' : style.textPrimary} font-mono`}>
                    SEC {secOpt.section}
                  </span>

                  {secOpt.isClashFree ? (
                    <span className="inline-flex items-center space-x-1 px-2 py-0.2 rounded text-[10px] font-black bg-emerald-100 text-emerald-900 border border-emerald-300 shadow-sm">
                      <CheckCircle2 className="w-3 h-3 text-emerald-700" />
                      <span>CLASH-FREE</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center space-x-1 px-2 py-0.2 rounded text-[10px] font-black bg-rose-100 text-rose-900 border border-rose-300 shadow-sm">
                      <XCircle className="w-3 h-3 text-rose-700" />
                      <span>CLASH ({secOpt.clashes.length})</span>
                    </span>
                  )}
                </div>

                {/* SLOTS DISPLAY */}
                <div className="flex flex-wrap items-center gap-1.5 text-xs">
                  {secOpt.slots.map((s, idx) => (
                    <span
                      key={idx}
                      className={`bg-slate-50 px-2 py-0.5 rounded border border-slate-200 flex items-center space-x-1 font-mono text-[10px] text-slate-600 shadow-inner`}
                    >
                      <Clock className={`w-3 h-3 text-cyan-600`} />
                      <span className="font-bold">{s.day} {s.startTime}-{s.endTime}</span>
                      <span className="opacity-40">|</span>
                      <span className="opacity-80 truncate max-w-[100px]">{s.venue}</span>
                    </span>
                  ))}
                </div>

                {/* CLASH BREAKDOWN */}
                {!secOpt.isClashFree && (
                  <div className="mt-1.5 text-xs bg-rose-50 border border-rose-200 rounded-md p-2 text-rose-700 space-y-0.5 shadow-inner">
                    {secOpt.clashes.map((c, idx) => (
                      <p key={idx} className="flex items-center space-x-1 text-[10px] font-bold">
                        <AlertTriangle className="w-3 h-3 text-rose-500 flex-shrink-0" />
                        <span>
                          Overlaps {c.clashedWith.courseCode} ({c.clashedWith.day} {c.clashedWith.startTime})
                        </span>
                      </p>
                    ))}
                  </div>
                )}
              </div>

              {/* SELECT ACTION BUTTON */}
              <div className="flex-shrink-0">
                <button
                  onClick={() => onSelectSection(analysis.courseCode, secOpt.section)}
                  className={`w-full sm:w-auto px-4 py-1.5 rounded-lg text-[11px] font-black uppercase tracking-tight transition flex items-center justify-center space-x-1 active:scale-95 shadow-md ${
                    isSelected
                      ? 'bg-emerald-600 text-white border border-emerald-700'
                      : secOpt.isClashFree
                      ? 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-50'
                      : 'bg-rose-100 hover:bg-rose-200 text-rose-700 border border-rose-300'
                  }`}
                >
                  {isSelected && <Check className="w-3.5 h-3.5 text-white" />}
                  <span>
                    {isSelected
                      ? 'Selected'
                      : secOpt.isClashFree
                      ? 'Select Section'
                      : 'Force Override'}
                  </span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
