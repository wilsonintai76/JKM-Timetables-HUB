import React, { useState, useMemo } from 'react';
import {
  TimetableSlot,
  StudentProfile,
  CourseClashAnalysis,
  PriorityLevel,
  TimePreference,
  RankedScheduleOption,
  ThemePreferences
} from '../types';
import { getThemePalette } from '../utils/theme';
import { ConflictTimeline } from './ConflictTimeline';
import { ConflictDetailsOverlay } from './ConflictDetailsOverlay';
import { ClashAssistant } from './ClashAssistant';
import { CreditHourProgressBar } from './CreditHourProgressBar';
import { DepartmentConflictHeatmap } from './DepartmentConflictHeatmap';
import {
  Sparkles,
  Calendar,
  Zap,
  Award,
  ListOrdered,
  Eye,
  Sliders,
  BookOpen,
  CheckCircle2
} from 'lucide-react';
import { ProfilePanel } from './resolver/ProfilePanel';
import { CourseSelectionPanel } from './resolver/CourseSelectionPanel';
import { ResultCard } from './resolver/ResultCard';

interface ClashResolverProps {
  studentProfile: StudentProfile;
  setStudentProfile: React.Dispatch<React.SetStateAction<StudentProfile>>;
  availableSections: string[];
  availableCourses: { code: string; name: string; creditHours: number }[];
  baseClassSlots: TimetableSlot[];
  selectedRepeatCourses: string[];
  setSelectedRepeatCourses: (courses: string[]) => void;
  selectedAddons: Record<string, string>;
  setSelectedAddons: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  clashAnalysis: CourseClashAnalysis[];
  onAutoSolve: () => void;
  onNavigateToGrid: () => void;
  coursePriorities: Record<string, PriorityLevel>;
  setCoursePriorities: React.Dispatch<React.SetStateAction<Record<string, PriorityLevel>>>;
  optionalCourses: Record<string, boolean>;
  setOptionalCourses: React.Dispatch<React.SetStateAction<Record<string, boolean>>>;
  timePreference: TimePreference;
  setTimePreference: (pref: TimePreference) => void;
  masterSlots?: TimetableSlot[];
  themePrefs?: ThemePreferences;
  onSubmitRegistration?: () => void;
}

export const ClashResolver: React.FC<ClashResolverProps> = ({
  studentProfile,
  setStudentProfile,
  availableSections,
  availableCourses,
  baseClassSlots,
  selectedRepeatCourses,
  setSelectedRepeatCourses,
  selectedAddons,
  setSelectedAddons,
  clashAnalysis,
  onAutoSolve,
  onNavigateToGrid,
  coursePriorities = {},
  setCoursePriorities = (_val: any) => {},
  optionalCourses = {},
  setOptionalCourses = (_val: any) => {},
  timePreference = 'ALL',
  setTimePreference = (_val: any) => {},
  masterSlots = [],
  themePrefs,
  onSubmitRegistration
}) => {
  const style = getThemePalette(themePrefs?.palette);
  const [courseSearch, setCourseSearch] = useState('');
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [showRankedModal, setShowRankedModal] = useState(false);
  const [showConflictOverlay, setShowConflictOverlay] = useState(false);

  const baseCourseCodes = useMemo(() => {
    return new Set((baseClassSlots || []).map(s => s.courseCode));
  }, [baseClassSlots]);

  const toggleRepeatCourse = (code: string) => {
    if (selectedRepeatCourses.includes(code)) {
      setSelectedRepeatCourses(selectedRepeatCourses.filter(c => c !== code));
      const nextAddons = { ...selectedAddons };
      delete nextAddons[code];
      setSelectedAddons(nextAddons);
    } else {
      setSelectedRepeatCourses([...selectedRepeatCourses, code]);
      if (!coursePriorities[code]) {
        setCoursePriorities(prev => ({ ...prev, [code]: 'HIGH' }));
      }
    }
  };

  const setPriority = (code: string, level: PriorityLevel) => {
    setCoursePriorities(prev => ({ ...prev, [code]: level }));
  };

  const filteredCourses = availableCourses.filter(
    c =>
      c.code.toLowerCase().includes(courseSearch.toLowerCase()) ||
      c.name.toLowerCase().includes(courseSearch.toLowerCase())
  );

  // ADVANCED CLASH RESOLVER COMBINATION GENERATOR
  const rankedOptions: RankedScheduleOption[] = useMemo(() => {
    if (selectedRepeatCourses.length === 0 || clashAnalysis.length === 0) return [];

    const sortedAnalysis = [...clashAnalysis].sort((a, b) => {
      const prioMap: Record<PriorityLevel, number> = { HIGH: 3, MEDIUM: 2, LOW: 1 };
      const pA = prioMap[coursePriorities[a.courseCode] || 'HIGH'];
      const pB = prioMap[coursePriorities[b.courseCode] || 'HIGH'];
      return pB - pA;
    });

    const combinations: { addons: Record<string, string>; score: number; clashes: number; prefsSatisfied: string[]; credits: number }[] = [];

    const generate = (index: number, currentAddons: Record<string, string>) => {
      if (index >= sortedAnalysis.length) {
        let score = 50; 
        let totalClashes = 0;
        const satisfied: string[] = [];
        let totalCredits = baseClassSlots.reduce((acc, s) => acc + (s.creditHours || 3), 0);

        sortedAnalysis.forEach(courseItem => {
          const secChoice = currentAddons[courseItem.courseCode];
          const secOpt = courseItem.sections.find(s => s.section === secChoice);
          if (secOpt) {
            totalCredits += courseItem.creditHours;
            if (secOpt.isClashFree) {
              const prio = coursePriorities[courseItem.courseCode] || 'HIGH';
              score += prio === 'HIGH' ? 25 : prio === 'MEDIUM' ? 15 : 10;
            } else {
              totalClashes += secOpt.clashes.length;
              score -= secOpt.clashes.length * 15;
            }

            if (timePreference === 'MORNING') {
              const allMorning = secOpt.slots.every(s => parseInt(s.startTime.split(':')[0], 10) < 12);
              if (allMorning) { score += 10; if (!satisfied.includes('Morning Slots')) satisfied.push('Morning Slots'); }
            } else if (timePreference === 'AFTERNOON') {
              const allAfternoon = secOpt.slots.every(s => parseInt(s.startTime.split(':')[0], 10) >= 12);
              if (allAfternoon) { score += 10; if (!satisfied.includes('Afternoon Slots')) satisfied.push('Afternoon Slots'); }
            } else if (timePreference === 'NO_FRIDAY') {
              const noFri = secOpt.slots.every(s => s.day !== 'JUMAAT');
              if (noFri) { score += 10; if (!satisfied.includes('No Friday Classes')) satisfied.push('No Friday Classes'); }
            }
          }
        });

        if (totalClashes === 0 && !satisfied.includes('100% Clash-Free')) {
          satisfied.unshift('100% Clash-Free');
        }

        const normalizedScore = Math.min(100, Math.max(10, score));
        combinations.push({
          addons: currentAddons,
          score: normalizedScore,
          clashes: totalClashes,
          prefsSatisfied: satisfied,
          credits: totalCredits
        });
        return;
      }

      const item = sortedAnalysis[index];
      const validSections = item.sections.length > 0 ? item.sections : [{ section: 'DEFAULT', slots: [], isClashFree: true, clashes: [] }];
      for (const secOpt of validSections.slice(0, 3)) {
        generate(index + 1, { ...currentAddons, [item.courseCode]: secOpt.section });
      }
    };

    generate(0, {});
    combinations.sort((a, b) => b.score - a.score);

    return combinations.slice(0, 4).map((comb, idx) => ({
      id: `opt_${idx + 1}`,
      rank: idx + 1,
      title: idx === 0 ? 'Optimal Clash-Free Match' : idx === 1 ? 'Balanced Preferred Schedule' : `Alternative Plan #${idx + 1}`,
      matchScore: comb.score,
      selectedAddons: comb.addons,
      totalClashes: comb.clashes,
      satisfiedPreferences: comb.prefsSatisfied,
      totalCredits: comb.credits
    }));
  }, [selectedRepeatCourses, clashAnalysis, coursePriorities, timePreference, baseClassSlots]);

  const applyRankedOption = (opt: RankedScheduleOption) => {
    setSelectedAddons(opt.selectedAddons);
    setShowRankedModal(false);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 no-print">

      {/* LEFT COLUMN */}
      <div className="lg:col-span-4 space-y-4">
        <ProfilePanel 
          studentProfile={studentProfile}
          setStudentProfile={setStudentProfile}
          isEditingProfile={isEditingProfile}
          setIsEditingProfile={setIsEditingProfile}
          availableSections={availableSections}
          baseClassSlots={baseClassSlots}
          style={style}
        />

        <CreditHourProgressBar
          baseClassSlots={baseClassSlots}
          selectedRepeatCourses={selectedRepeatCourses}
          masterSlots={masterSlots}
          maxCreditLimit={20}
          onRemoveCourse={(code) => toggleRepeatCourse(code)}
        />

        <div className={`${style.cardBgClass} rounded-xl p-4 border shadow-sm space-y-2.5`}>
          <div className={`flex items-center space-x-2 border-b ${style.borderColor} pb-2`}>
            <Sliders className={`w-4 h-4 ${style.accentText}`} />
            <h3 className={`font-bold ${style.textPrimary} text-xs tracking-tight uppercase`}>Time Window Filter</h3>
          </div>
          <div className="grid grid-cols-2 gap-1.5 text-[11px]">
            {[
              { id: 'ALL', label: 'No Preference' },
              { id: 'MORNING', label: 'Morning (8-12)' },
              { id: 'AFTERNOON', label: 'Afternoon (12-5)' },
              { id: 'NO_FRIDAY', label: 'Avoid Fridays' }
            ].map(p => (
              <button
                key={p.id}
                onClick={() => setTimePreference(p.id as TimePreference)}
                className={`p-1.5 rounded-lg font-black border text-center transition ${
                  timePreference === p.id
                    ? `${style.accentBg} font-black shadow-sm`
                    : `${style.bgMuted} ${style.borderColor} ${style.textSecondary} hover:text-slate-900`
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        <CourseSelectionPanel 
          filteredCourses={filteredCourses}
          courseSearch={courseSearch}
          setCourseSearch={setCourseSearch}
          selectedRepeatCourses={selectedRepeatCourses}
          toggleRepeatCourse={toggleRepeatCourse}
          baseCourseCodes={baseCourseCodes}
          coursePriorities={coursePriorities}
          setPriority={setPriority}
          masterSlots={masterSlots}
          studentProfile={studentProfile}
          style={style}
        />
      </div>

      {/* RIGHT COLUMN */}
      <div className="lg:col-span-8 space-y-4">
        <div className={`${style.cardBgClass} rounded-xl p-4 border shadow-sm flex flex-wrap items-center justify-between gap-3`}>
          <div>
            <div className="flex items-center space-x-2">
              <Sparkles className={`w-4 h-4 ${style.accentText} animate-pulse`} />
              <h3 className={`font-bold ${style.textPrimary} text-sm`}>Advanced Clash Resolution Engine</h3>
            </div>
            <p className={`text-[11px] ${style.textSecondary} mt-0.5 font-bold`}>
              Prioritizing <span className="text-amber-600">High Priority</span> modules against {timePreference} preferences.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {selectedRepeatCourses.length > 0 && (
              <>
                <button
                  onClick={() => setShowConflictOverlay(true)}
                  className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-rose-100 hover:bg-rose-200 text-rose-800 border border-rose-400 font-black text-xs shadow-sm transition active:scale-95"
                >
                  <Eye className="w-3.5 h-3.5 text-rose-700" />
                  <span>Conflict Analysis</span>
                </button>

                <button
                  onClick={() => setShowRankedModal(true)}
                  className="flex items-center space-x-1 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-black text-xs transition shadow-md active:scale-95"
                >
                  <ListOrdered className="w-3.5 h-3.5" />
                  <span>Ranked Plans ({rankedOptions.length})</span>
                </button>

                <button
                  onClick={onAutoSolve}
                  className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-amber-500 to-emerald-500 hover:from-amber-400 hover:to-emerald-400 text-slate-950 font-black text-xs shadow-md transition transform active:scale-95"
                >
                  <Zap className="w-3.5 h-3.5 fill-slate-950" />
                  <span>Auto-Solve Matrix</span>
                </button>

                {onSubmitRegistration && (
                  <button
                    onClick={onSubmitRegistration}
                    className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-cyan-700 hover:bg-cyan-600 text-white font-black text-xs shadow-lg transition transform active:scale-95 border border-cyan-600"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Submit for Registration</span>
                  </button>
                )}
              </>
            )}

            <button
              onClick={onNavigateToGrid}
              className={`flex items-center space-x-1 px-3 py-1.5 rounded-lg border ${style.borderColor} ${style.bgMuted} ${style.textPrimary} text-xs font-black transition active:scale-95 shadow-sm`}
            >
              <Calendar className={`w-3.5 h-3.5 ${style.accentText}`} />
              <span>Grid View</span>
            </button>
          </div>
        </div>

        {showRankedModal && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white border border-slate-200 rounded-xl max-w-2xl w-full p-5 shadow-2xl space-y-4 max-h-[85vh] overflow-y-auto">
              <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                <div className="flex items-center space-x-2">
                  <Award className="w-5 h-5 text-amber-500" />
                  <div>
                    <h3 className="font-black text-slate-900 text-sm">Ranked Timetable Combination Options</h3>
                    <p className="text-[11px] text-slate-500 font-bold">Generated based on priorities and {timePreference} window</p>
                  </div>
                </div>
                <button onClick={() => setShowRankedModal(false)} className="p-1 text-slate-400 hover:text-slate-800 font-bold">✕</button>
              </div>

              <div className="space-y-3">
                {rankedOptions.map(opt => (
                  <div key={opt.id} className="p-3.5 rounded-lg border border-slate-200 bg-slate-50/50 space-y-2 shadow-inner">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className="w-6 h-6 rounded-full bg-cyan-100 text-cyan-800 flex items-center justify-center font-black text-xs border border-cyan-200 shadow-sm">
                          #{opt.rank}
                        </span>
                        <span className="font-black text-slate-800 text-xs">{opt.title}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-xs font-mono font-black text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 shadow-sm">
                          {opt.matchScore}% Score
                        </span>
                        <button
                          onClick={() => applyRankedOption(opt)}
                          className="px-3 py-1 rounded bg-cyan-600 hover:bg-cyan-500 text-white font-black text-xs transition shadow-md active:scale-95"
                        >
                          Apply Combination
                        </button>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-1.5 text-[10px]">
                      {opt.satisfiedPreferences.map((pref, i) => (
                        <span key={i} className="bg-emerald-100 text-emerald-900 px-2 py-0.5 rounded border border-emerald-300 font-black">
                          ✓ {pref}
                        </span>
                      ))}
                      <span className="bg-slate-200 text-slate-700 px-2 py-0.5 rounded border border-slate-300 font-black">
                        {opt.totalCredits} Cr
                      </span>
                    </div>

                    <div className="text-[11px] text-slate-700 font-mono bg-white p-2 rounded border border-slate-200 flex flex-wrap gap-2 shadow-inner font-bold">
                      {Object.entries(opt.selectedAddons).map(([code, sec]) => (
                        <span key={code}><strong className="text-amber-700">{code}</strong>→{sec}</span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        <DepartmentConflictHeatmap
          baseClassSlots={baseClassSlots}
          masterSlots={masterSlots}
          availableSections={availableSections}
          selectedRepeatCourses={selectedRepeatCourses}
          selectedAddons={selectedAddons}
          onSelectSectionForCourse={(code, sec) => setSelectedAddons(prev => ({ ...prev, [code]: sec }))}
          themePrefs={themePrefs}
        />

        {selectedRepeatCourses.length > 0 && (
          <ClashAssistant
            studentProfile={studentProfile}
            baseClassSlots={baseClassSlots}
            selectedRepeatCourses={selectedRepeatCourses}
            selectedAddons={selectedAddons}
            setSelectedAddons={setSelectedAddons}
            clashAnalysis={clashAnalysis}
            masterSlots={masterSlots}
            themePrefs={themePrefs}
          />
        )}

        {selectedRepeatCourses.length > 0 && (
          <ConflictTimeline
            baseClassSlots={baseClassSlots}
            selectedRepeatCourses={selectedRepeatCourses}
            selectedAddons={selectedAddons}
            clashAnalysis={clashAnalysis}
            masterSlots={masterSlots}
            onSelectSection={(code, sec) => setSelectedAddons({ ...selectedAddons, [code]: sec })}
            onOpenDetailsOverlay={() => setShowConflictOverlay(true)}
            themePrefs={themePrefs}
          />
        )}

        {selectedRepeatCourses.length === 0 ? (
          <div className={`${style.cardBgClass} rounded-xl p-10 text-center border shadow-sm flex flex-col items-center justify-center space-y-2`}>
            <BookOpen className={`w-10 h-10 ${style.accentText} opacity-20`} />
            <h4 className={`font-black ${style.textPrimary} text-sm`}>No Courses Selected</h4>
            <p className={`text-xs ${style.textSecondary} max-w-xs font-bold`}>
              Select modules from the left panel to scan all available section timetables.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {clashAnalysis.map(analysis => (
              <ResultCard 
                key={analysis.courseCode}
                analysis={analysis}
                selectedSection={selectedAddons[analysis.courseCode]}
                priority={coursePriorities[analysis.courseCode] || 'HIGH'}
                onSelectSection={(code, sec) => setSelectedAddons({ ...selectedAddons, [code]: sec })}
                style={style}
              />
            ))}
          </div>
        )}
      </div>

      <ConflictDetailsOverlay
        isOpen={showConflictOverlay}
        onClose={() => setShowConflictOverlay(false)}
        baseClassSlots={baseClassSlots}
        selectedRepeatCourses={selectedRepeatCourses}
        selectedAddons={selectedAddons}
        clashAnalysis={clashAnalysis}
        masterSlots={masterSlots}
        onSelectSection={(code, sec) => setSelectedAddons({ ...selectedAddons, [code]: sec })}
        themePrefs={themePrefs}
      />
    </div>
  );
};
