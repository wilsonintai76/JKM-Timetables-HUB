import React from 'react';
import { BookOpen, Search, Info, Flame, Star, MinusCircle } from 'lucide-react';
import { TimetableSlot, PriorityLevel } from '../../types';

interface CourseSelectionPanelProps {
  filteredCourses: Array<{ code: string; name: string; creditHours: number }>;
  courseSearch: string;
  setCourseSearch: (val: string) => void;
  selectedRepeatCourses: string[];
  toggleRepeatCourse: (code: string) => void;
  baseCourseCodes: Set<string>;
  coursePriorities: Record<string, PriorityLevel>;
  setPriority: (code: string, level: PriorityLevel) => void;
  masterSlots: TimetableSlot[];
  studentProfile: { baseSection: string };
  style: any;
}

export const CourseSelectionPanel: React.FC<CourseSelectionPanelProps> = ({
  filteredCourses,
  courseSearch,
  setCourseSearch,
  selectedRepeatCourses,
  toggleRepeatCourse,
  baseCourseCodes,
  coursePriorities,
  setPriority,
  masterSlots,
  studentProfile,
  style
}) => {
  return (
    <div className={`${style.cardBgClass} rounded-xl p-4 border shadow-sm space-y-3`}>
      <div className={`flex items-center justify-between border-b ${style.borderColor} pb-2.5`}>
        <div className="flex items-center space-x-2">
          <BookOpen className={`w-4 h-4 ${style.accentText}`} />
          <h3 className={`font-bold ${style.textPrimary} text-xs tracking-tight uppercase`}>Repeat / Carry Selection</h3>
        </div>
        <span className={`text-[10px] ${style.badgeClass} px-1.5 py-0.5 rounded font-mono font-black shadow-sm`}>
          {selectedRepeatCourses.length} Selected
        </span>
      </div>

      <div className="bg-cyan-50 border border-cyan-200 rounded-lg p-2.5 text-[10px] text-cyan-800 flex flex-col space-y-1 shadow-sm">
        <div className="flex items-start space-x-1.5">
          <Info className="w-3.5 h-3.5 text-cyan-650 flex-shrink-0 mt-0.5" />
          <span className="leading-relaxed">
            <strong>Politeknik Policy:</strong> When you tumpang a course, all class hours for that module are taken together in <strong>one single section</strong>. Splitting hours is prohibited.
          </span>
        </div>
      </div>

      <div className="relative">
        <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2" />
        <input
          type="text"
          placeholder="Search code or course name..."
          value={courseSearch}
          onChange={e => setCourseSearch(e.target.value)}
          className={`w-full ${style.inputClass} rounded-lg pl-8 pr-2.5 py-1.5 text-xs focus:outline-none focus:border-cyan-500 shadow-inner`}
        />
      </div>

      <div className="max-h-[400px] overflow-y-auto space-y-2 pr-1 text-xs scrollbar-thin">
        {filteredCourses.length === 0 ? (
          <p className={`${style.textSecondary} text-center py-4 text-xs font-medium`}>No matching courses</p>
        ) : (
          filteredCourses.map(c => {
            const isBaseCourse = baseCourseCodes.has(c.code);
            const isChecked = selectedRepeatCourses.includes(c.code) || isBaseCourse;
            const currentPrio = coursePriorities[c.code] || 'HIGH';
            
            const offeringSections = Array.from(new Set(
              masterSlots
                .filter(s => s.courseCode === c.code)
                .map(s => s.section)
            )).sort();

            return (
              <div
                key={c.code}
                className={`p-2.5 rounded-lg border transition space-y-1.5 shadow-sm ${
                  isBaseCourse
                    ? 'bg-cyan-100 border-cyan-400 text-cyan-950'
                    : isChecked
                    ? 'bg-amber-100 border-amber-400 text-amber-950'
                    : 'bg-white border-slate-200 text-slate-800 hover:border-slate-300'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div
                    onClick={() => {
                      if (isBaseCourse) return;
                      toggleRepeatCourse(c.code);
                    }}
                    className={`flex items-start space-x-2 flex-1 ${isBaseCourse ? 'cursor-default' : 'cursor-pointer'}`}
                  >
                    <input
                      type="checkbox"
                      checked={isChecked}
                      readOnly
                      disabled={isBaseCourse}
                      className={`mt-0.5 rounded border-slate-300 focus:ring-0 w-3.5 h-3.5 ${
                        isBaseCourse 
                          ? 'text-cyan-600 opacity-60 cursor-default' 
                          : 'text-amber-600'
                      }`}
                    />
                    <div className="space-y-0.5">
                      <div className="flex items-center space-x-1.5 font-mono flex-wrap gap-1">
                        <span className={`font-black text-xs ${isBaseCourse ? 'text-cyan-800' : 'text-amber-800'}`}>{c.code}</span>
                        <span className="text-[10px] text-slate-500 font-bold">({c.creditHours} Cr)</span>
                        {isBaseCourse && (
                          <span className="text-[9px] font-black px-1.5 py-0.2 rounded bg-cyan-700 text-white border border-cyan-800 shadow-sm">
                            Base
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] text-slate-700 leading-tight font-bold">{c.name}</p>
                      
                      {offeringSections.length > 0 && (
                        <div className="flex flex-wrap items-center gap-1 pt-1">
                          {offeringSections.map(sec => (
                            <span 
                              key={sec} 
                              className={`text-[9px] font-mono font-black px-1.5 rounded border ${
                                sec === studentProfile.baseSection
                                  ? 'bg-cyan-100 border-cyan-400 text-cyan-900 shadow-sm'
                                  : 'bg-white border-slate-300 text-slate-600'
                              }`}
                            >
                              {sec}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {isChecked && !isBaseCourse && (
                  <div className="pt-1.5 border-t border-amber-300 flex items-center justify-between text-[10px]">
                    <span className="text-slate-600 font-bold">Set Priority:</span>
                    <div className="flex items-center space-x-1">
                      <button
                        onClick={() => setPriority(c.code, 'HIGH')}
                        className={`px-1.5 py-0.5 rounded flex items-center space-x-0.5 transition border ${
                          currentPrio === 'HIGH' ? 'bg-rose-700 text-white border-rose-800 font-bold shadow-sm' : 'bg-slate-100 border-slate-200 text-slate-500 hover:bg-slate-200'
                        }`}
                      >
                        <Flame className="w-2.5 h-2.5" />
                        <span>High</span>
                      </button>
                      <button
                        onClick={() => setPriority(c.code, 'MEDIUM')}
                        className={`px-1.5 py-0.5 rounded flex items-center space-x-0.5 transition border ${
                          currentPrio === 'MEDIUM' ? 'bg-amber-600 text-white border-amber-700 font-bold shadow-sm' : 'bg-slate-100 border-slate-200 text-slate-500 hover:bg-slate-200'
                        }`}
                      >
                        <Star className="w-2.5 h-2.5" />
                        <span>Med</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
