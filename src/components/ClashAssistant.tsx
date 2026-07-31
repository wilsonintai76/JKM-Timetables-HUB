import React, { useState } from 'react';
import { TimetableSlot, StudentProfile, CourseClashAnalysis, ThemePreferences } from '../types';
import { getThemePalette } from '../utils/theme';
import { Bot, Sparkles, Send, RefreshCw, CheckCircle2, AlertTriangle, ArrowRight, Target, Award, ShieldAlert, Zap, BookOpen } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

import { client } from '../lib/api';

interface ClashAssistantProps {
  studentProfile: StudentProfile;
  baseClassSlots: TimetableSlot[];
  selectedRepeatCourses: string[];
  selectedAddons: Record<string, string>;
  setSelectedAddons: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  clashAnalysis: CourseClashAnalysis[];
  masterSlots: TimetableSlot[];
  themePrefs?: ThemePreferences;
}

export const ClashAssistant: React.FC<ClashAssistantProps> = ({
  studentProfile,
  baseClassSlots,
  selectedRepeatCourses,
  selectedAddons,
  setSelectedAddons,
  clashAnalysis,
  masterSlots,
  themePrefs
}) => {
  const style = getThemePalette(themePrefs?.palette);
  const [creditGoal, setCreditGoal] = useState<number>(20);
  const [userQuery, setUserQuery] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [assistantOutput, setAssistantOutput] = useState<string | null>(null);
  const [recommendedActions, setRecommendedActions] = useState<
    { courseCode: string; currentSection: string; recommendedSection: string; reason: string }[]
  >([]);
  const [appliedCount, setAppliedCount] = useState<number>(0);

  // Calculate current credit hours
  const baseCredits = baseClassSlots.reduce((acc, s) => {
    // Only count unique course codes for base
    return acc;
  }, 0);

  // Unique base courses credit sum
  const baseUniqueCourses = Array.from(new Set(baseClassSlots.map(s => s.courseCode)));
  const calculatedBaseCredits = baseUniqueCourses.reduce((sum, code) => {
    const slot = baseClassSlots.find(s => s.courseCode === code);
    return sum + (slot?.creditHours || 3);
  }, 0);

  const repeatCredits = selectedRepeatCourses.reduce((sum, code) => {
    const slot = masterSlots.find(s => s.courseCode.toUpperCase() === code.toUpperCase());
    return sum + (slot?.creditHours || 3);
  }, 0);

  const totalCurrentCredits = calculatedBaseCredits + repeatCredits;

  const handleAskAssistant = async (customPrompt?: string) => {
    const promptToSend = customPrompt || userQuery;
    setLoading(true);
    setAssistantOutput(null);

    try {
      const res = await client.api['clash-assistant'].$post({
        json: {
          studentProfile,
          baseSection: studentProfile.baseSection,
          selectedRepeatCourses,
          selectedAddons,
          clashAnalysis,
          masterSlots,
          creditGoal,
          userQuery: promptToSend
        }
      });

      const data = await res.json();
      if ('success' in data && data.success) {
        // @ts-ignore - Handle RPC union type
        setAssistantOutput(data.advice);
        // @ts-ignore
        if (data.recommendations) {
          // @ts-ignore
          setRecommendedActions(data.recommendations);
        }
      } else {
        // @ts-ignore
        setAssistantOutput(`⚠️ Error: ${data.error || 'Failed to connect to Clash Assistant.'}`);
      }
    } catch (err: any) {
      setAssistantOutput(`⚠️ Connection Error: ${err.message || 'Server request failed.'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleApplySingleAction = (courseCode: string, recommendedSection: string) => {
    setSelectedAddons(prev => ({
      ...prev,
      [courseCode]: recommendedSection
    }));
    setAppliedCount(c => c + 1);
  };

  const handleApplyAllRecommended = () => {
    const newAddons = { ...selectedAddons };
    recommendedActions.forEach(action => {
      newAddons[action.courseCode] = action.recommendedSection;
    });
    setSelectedAddons(newAddons);
    setAppliedCount(c => c + recommendedActions.length);
  };

  return (
    <div className={`${style.cardBgClass} rounded-2xl p-5 border shadow-xl space-y-5 relative overflow-hidden`}>
      
      {/* GLOW DECORATION BACKGROUND */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none"></div>

      {/* HEADER BAR */}
      <div className={`flex flex-wrap items-center justify-between gap-3 border-b ${style.borderColor} pb-4 relative z-10`}>
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-600 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-cyan-950/20">
            <Bot className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h3 className={`font-extrabold ${style.textPrimary} text-base tracking-wide`}>
                AI Clash Resolution Assistant
              </h3>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${style.badgeClass} flex items-center space-x-1`}>
                <Sparkles className="w-3 h-3 text-cyan-500" />
                <span>Powered by Gemini 3.6 Flash</span>
              </span>
            </div>
            <p className={`text-xs ${style.textSecondary} mt-0.5`}>
              Intelligent academic optimization for section switches, department section fitting & credit targets.
            </p>
          </div>
        </div>

        {/* CREDIT GOAL TRACKER BADGE */}
        <div className={`flex items-center space-x-3 ${style.bgMuted} p-2 rounded-xl border ${style.borderColor} text-xs font-mono`}>
          <div className={`flex items-center space-x-1.5 ${style.textPrimary}`}>
            <Target className="w-4 h-4 text-amber-500" />
            <span>Target:</span>
            <strong className="text-amber-700 font-bold">{creditGoal} Cr</strong>
          </div>
          <div className={`h-4 w-px ${style.borderColor}`}></div>
          <div className={`flex items-center space-x-1.5 ${style.textPrimary}`}>
            <BookOpen className="w-4 h-4 text-cyan-600" />
            <span>Current:</span>
            <strong className={`font-bold ${
              totalCurrentCredits > 22
                ? 'text-rose-600'
                : totalCurrentCredits >= creditGoal
                ? 'text-emerald-600'
                : 'text-cyan-600'
            }`}>
              {totalCurrentCredits} Cr
            </strong>
          </div>
        </div>
      </div>

      {/* CONTROLS & QUERY INPUT PANEL */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 relative z-10">
        
        {/* CREDIT HOUR GOAL SLIDER */}
        <div className={`${style.bgMuted} p-3.5 rounded-xl border ${style.borderColor} space-y-2`}>
          <div className="flex justify-between items-center text-xs">
            <label className={`font-bold ${style.textPrimary} flex items-center space-x-1`}>
              <Award className="w-3.5 h-3.5 text-amber-500" />
              <span>Credit Hour Goal</span>
            </label>
            <span className="font-mono text-cyan-700 font-bold text-xs">
              {creditGoal} Cr {creditGoal > 20 ? '(HOD Approval Needed)' : ''}
            </span>
          </div>
          <input
            type="range"
            min={12}
            max={26}
            step={1}
            value={creditGoal}
            onChange={e => setCreditGoal(Number(e.target.value))}
            className="w-full accent-cyan-600 bg-slate-200 h-2 rounded-lg cursor-pointer"
          />
          <div className={`flex justify-between text-[10px] ${style.textSecondary} font-mono`}>
            <span>Min (12 Cr)</span>
            <span className="text-emerald-600 font-bold">Std Max (20 Cr)</span>
            <span className="text-amber-600 font-bold">HOD Approval (&gt;20 Cr)</span>
          </div>
          <div className="text-[10px] text-amber-800 font-mono bg-amber-50 p-1.5 rounded border border-amber-200">
            <strong>Priority:</strong> Carry/Repeat modules (Kursus Mengulang) take priority in schedule planning.
          </div>
        </div>

        {/* CUSTOM QUERY INPUT */}
        <div className={`md:col-span-2 ${style.bgMuted} p-3.5 rounded-xl border ${style.borderColor} flex flex-col justify-between space-y-2`}>
          <div className="flex items-center justify-between text-xs">
            <label className={`font-bold ${style.textPrimary} flex items-center space-x-1`}>
              <Sparkles className="w-3.5 h-3.5 text-cyan-600" />
              <span>Ask Advisor / Prompt Options</span>
            </label>
            <span className={`text-[10px] ${style.textSecondary}`}>Optional custom question</span>
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="text"
              placeholder="e.g. Which department section switch gives me a clash-free Friday?"
              value={userQuery}
              onChange={e => setUserQuery(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleAskAssistant()}
              className={`${style.inputClass} flex-1 font-mono`}
            />
            <button
              onClick={() => handleAskAssistant()}
              disabled={loading}
              className="px-4 py-1.5 rounded-lg bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold text-xs transition flex items-center space-x-1.5 shadow-md disabled:opacity-50 active:scale-95"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Analyzing...</span>
                </>
              ) : (
                <>
                  <Send className="w-3.5 h-3.5" />
                  <span>Ask AI</span>
                </>
              )}
            </button>
          </div>
        </div>

      </div>

      {/* QUICK PRESET PROMPT CHIPS */}
      <div className="flex flex-wrap items-gap-2 gap-2 text-[11px] relative z-10">
        <span className={`text-slate-500 font-semibold text-[10px]`}>Quick Presets:</span>
        <button
          onClick={() => handleAskAssistant('Suggest optimal section switches to resolve all clashes and hit 20 credit hours.')}
          className={`px-2.5 py-1 rounded-full ${style.bgMuted} hover:brightness-95 ${style.textPrimary} border ${style.borderColor} transition`}
        >
          ⚡ Resolve All Clashes (20 Cr Target)
        </button>
        <button
          onClick={() => handleAskAssistant('What department section alternatives (e.g. DKM3B, DKM3C, DEM3A) solve repeat course conflicts?')}
          className={`px-2.5 py-1 rounded-full ${style.bgMuted} hover:brightness-95 ${style.textPrimary} border ${style.borderColor} transition`}
        >
          🔄 Department Section Switches
        </button>
        <button
          onClick={() => handleAskAssistant('Suggest sections that minimize study days or free up Friday.')}
          className={`px-2.5 py-1 rounded-full ${style.bgMuted} hover:brightness-95 ${style.textPrimary} border ${style.borderColor} transition`}
        >
          📅 Free Friday Schedule
        </button>
      </div>

      {/* AI ADVICE & ACTIONABLE RECOMMENDATIONS OUTPUT */}
      {(loading || assistantOutput || recommendedActions.length > 0) && (
        <div className={`${style.bgMuted} p-4 rounded-xl border ${style.borderColor} space-y-4 relative z-10 animate-in fade-in duration-200`}>
          
          {loading ? (
            <div className="py-8 text-center space-y-3">
              <RefreshCw className="w-8 h-8 text-cyan-600 animate-spin mx-auto" />
              <p className={`text-xs ${style.textPrimary} font-mono animate-pulse`}>
                Consulting Gemini 3.6 Flash schedule optimization engine...
              </p>
            </div>
          ) : (
            <>
              {/* ACTIONABLE ONE-CLICK RECOMMENDATIONS BAR */}
              {recommendedActions.length > 0 && (
                <div className={`${style.cardBgClass} p-3 rounded-lg border border-cyan-500/40 space-y-2`}>
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center space-x-2">
                      <Zap className="w-4 h-4 text-amber-500 animate-bounce" />
                      <h4 className={`font-bold ${style.textPrimary} text-xs`}>
                        Suggested One-Click Section Adjustments ({recommendedActions.length})
                      </h4>
                    </div>

                    <button
                      onClick={handleApplyAllRecommended}
                      className="px-3 py-1 rounded-md bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-[11px] transition flex items-center space-x-1 shadow active:scale-95"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                      <span>Apply All ({recommendedActions.length}) Switches</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                    {recommendedActions.map((act, i) => (
                      <div key={i} className={`${style.bgMuted} p-2.5 rounded border ${style.borderColor} text-xs flex items-center justify-between`}>
                        <div className="space-y-0.5">
                          <span className="font-bold text-amber-700 font-mono">{act.courseCode}</span>
                          <p className={`text-[10px] ${style.textSecondary} font-mono`}>
                            Switch from <strong className="text-rose-600">{act.currentSection}</strong> ➔ <strong className="text-emerald-600">Kumpulan {act.recommendedSection}</strong>
                          </p>
                        </div>
                        <button
                          onClick={() => handleApplySingleAction(act.courseCode, act.recommendedSection)}
                          className="px-2.5 py-1 rounded bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-[10px] transition font-mono"
                        >
                          Switch Now
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* MARKDOWN ANALYSIS TEXT */}
              {assistantOutput && (
                <div className={`markdown-body text-xs ${style.textPrimary} leading-relaxed font-sans space-y-2 border-t ${style.borderColor} pt-3`}>
                  <ReactMarkdown>{assistantOutput}</ReactMarkdown>
                </div>
              )}
            </>
          )}

        </div>
      )}

    </div>
  );
};
