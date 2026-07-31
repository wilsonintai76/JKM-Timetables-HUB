import React, { useRef } from 'react';
import {
  GraduationCap,
  Upload,
  RefreshCw,
  Bookmark,
  ShieldCheck,
  User,
  Sparkles,
  Calendar,
  Layers,
  Printer,
  FileSpreadsheet,
  Palette,
  HelpCircle,
  MessageSquarePlus,
  Building,
  Cloud,
  LogOut
} from 'lucide-react';
import { DepartmentCode, ThemePreferences, UserRole } from '../types';
import { checkPolicy } from '../utils/pbac';
import { getThemePalette } from '../utils/theme';

interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  userRole: UserRole;
  onSelectRole: (role: UserRole) => void;
  fileName: string;
  isExcelLoaded: boolean;
  onFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onResetSample: () => void;
  onOpenDrafts: () => void;
  onOpenGoogleDrive: () => void;
  onOpenTheme: () => void;
  onOpenFormatGuide: () => void;
  onOpenFeedback: () => void;
  onLogout: () => void;
  selectedProgramme: string;
  onSelectProgramme: (prog: string) => void;
  masterCount: number;
  sectionCount: number;
  themePrefs?: ThemePreferences;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  userRole,
  onSelectRole,
  fileName,
  isExcelLoaded,
  onFileUpload,
  onResetSample,
  onOpenDrafts,
  onOpenGoogleDrive,
  onOpenTheme,
  onOpenFormatGuide,
  onOpenFeedback,
  onLogout,
  selectedProgramme,
  onSelectProgramme,
  masterCount,
  sectionCount,
  themePrefs
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const themeStyle = getThemePalette(themePrefs?.palette);

  return (
    <header className={`${themeStyle.cardBgClass} border-b sticky top-0 z-40 shadow-sm no-print`}>
      <div className="max-w-[1536px] mx-auto px-3 sm:px-4 lg:px-6">
        
        {/* TOP ROW */}
        <div className="h-14 py-2 flex items-center justify-between gap-2">
          <div className="flex items-center space-x-2.5">
            <div className={`w-8 h-8 rounded-lg bg-gradient-to-tr ${themeStyle.gradientClass} flex items-center justify-center shadow-sm`}>
              <GraduationCap className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className={`text-sm font-bold ${themeStyle.textPrimary} tracking-tight`}>Mechanical Engineering Timetable Hub</h1>
                <span className={`text-[10px] font-semibold px-1.5 py-0.2 rounded font-mono ${themeStyle.badgeClass}`}>
                  JKM Clash Engine
                </span>
              </div>
              <p className={`text-[11px] ${themeStyle.textSecondary} hidden sm:block leading-none mt-0.5`}>
                Mechanical Department (JKM) Academic Timetable Parser & Repeat Course Clash Engine
              </p>
            </div>
          </div>

          {/* PROGRAMME SELECTOR & ACTION BUTTONS */}
          <div className="flex items-center space-x-1.5 sm:space-x-2">
            
            {/* User Profile / Logout */}
            <div className="flex items-center space-x-2 mr-2 pr-2 border-r border-slate-200">
              <div className="text-right hidden md:block">
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">Access</p>
                <p className={`text-[10px] font-black ${themeStyle.textPrimary}`}>{userRole}</p>
              </div>
              <button
                onClick={onLogout}
                className="p-1.5 rounded-lg bg-slate-100 hover:bg-rose-50 text-slate-500 hover:text-rose-600 border border-slate-200 transition-all shadow-sm"
                title="Logout"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Programme Selector Dropdown */}
            <div className={`flex items-center space-x-1 ${themeStyle.bgMuted} p-1 rounded-md border ${themeStyle.borderColor} text-xs`} title="Filter JKM Programme">
              <Building className={`w-3.5 h-3.5 ${themeStyle.accentText} ml-1 hidden sm:inline`} />
              <select
                value={selectedProgramme}
                onChange={e => onSelectProgramme(e.target.value)}
                className={`bg-transparent ${themeStyle.accentText} font-bold focus:outline-none cursor-pointer text-xs`}
                title="Switch Programme Filter"
              >
                <option value="ALL">All Programmes (JKM)</option>
                <option value="DKM">DKM (Mechanical)</option>
                <option value="DTP">DTP (Manufacturing)</option>
                <option value="DAD">DAD (Automotive)</option>
                <option value="DPU">DPU (Air Conditioning / HVAC)</option>
              </select>
            </div>

            {/* Upload Master Schedule File */}
            {checkPolicy(userRole, 'UPLOAD_MASTER_FILE') && (
              <>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center space-x-1.5 px-2.5 py-1 rounded-md bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold transition shadow-sm"
                  title="Upload XLSX, XLS, CSV, or JSON Master Schedule File"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Upload Schedule</span>
                </button>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={onFileUpload}
                  accept=".xlsx, .xls, .csv, .json"
                  className="hidden"
                />
              </>
            )}

            {/* Format Guide */}
            <button
              onClick={onOpenFormatGuide}
              className={`p-1.5 sm:px-2 sm:py-1 rounded-md ${themeStyle.bgMuted} hover:border-slate-300 ${themeStyle.textPrimary} text-xs font-medium transition border flex items-center space-x-1`}
              title="File Structure & Format Guide"
            >
              <HelpCircle className={`w-3.5 h-3.5 ${themeStyle.accentText}`} />
              <span className="hidden md:inline">Format Guide</span>
            </button>

            {/* Theme Customizer */}
            <button
              onClick={onOpenTheme}
              className={`p-1.5 sm:px-2 sm:py-1 rounded-md ${themeStyle.bgMuted} hover:border-slate-300 ${themeStyle.textPrimary} text-xs font-medium transition border flex items-center space-x-1`}
              title="Visual Theme Customizer"
            >
              <Palette className={`w-3.5 h-3.5 ${themeStyle.accentText}`} />
              <span className="hidden md:inline">Theme</span>
            </button>

            {/* Feedback Hub */}
            <button
              onClick={onOpenFeedback}
              className={`p-1.5 sm:px-2 sm:py-1 rounded-md ${themeStyle.bgMuted} hover:border-slate-300 ${themeStyle.textPrimary} text-xs font-medium transition border flex items-center space-x-1`}
              title="Feedback & Bug Reporting"
            >
              <MessageSquarePlus className={`w-3.5 h-3.5 ${themeStyle.accentText}`} />
              <span className="hidden md:inline">Feedback</span>
            </button>

            {/* Saved Drafts */}
            <button
              onClick={onOpenDrafts}
              className={`flex items-center space-x-1 px-2.5 py-1 rounded-md ${themeStyle.bgMuted} hover:border-slate-300 ${themeStyle.textPrimary} text-xs font-medium transition border`}
            >
              <Bookmark className={`w-3.5 h-3.5 ${themeStyle.accentText}`} />
              <span className="hidden sm:inline">Drafts</span>
            </button>

            {/* Google Drive Cloud */}
            <button
              onClick={onOpenGoogleDrive}
              className="flex items-center space-x-1 px-2.5 py-1 rounded-md bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold transition shadow-sm"
              title="Google Drive Cloud Timetables & Backup"
            >
              <Cloud className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Drive Cloud</span>
            </button>

            {/* Role Switcher */}
            <div className={`flex items-center space-x-1 px-2 py-0.5 rounded-md ${themeStyle.bgMuted} border ${themeStyle.borderColor} text-xs`}>
              <span className="text-slate-500 font-medium px-1 hidden md:inline">Role:</span>
              <select
                value={userRole}
                onChange={e => onSelectRole(e.target.value as UserRole)}
                className={`bg-transparent font-bold focus:outline-none cursor-pointer text-xs ${
                  userRole === 'ADMIN'
                    ? 'text-amber-600'
                    : userRole === 'ADVISOR'
                    ? 'text-purple-600'
                    : themeStyle.accentText
                }`}
                title="Policy-Based Access Control Role Switcher"
              >
                <option value="STUDENT" className="bg-white text-slate-800 font-semibold">👨‍🎓 Student</option>
                <option value="ADVISOR" className="bg-white text-purple-700 font-semibold">👩‍🏫 Advisor</option>
                <option value="ADMIN" className="bg-white text-amber-700 font-semibold">🔑 Admin</option>
              </select>
            </div>
          </div>
        </div>

        {/* BOTTOM ROW: NAVIGATION TABS */}
        <div className={`flex items-center justify-between border-t ${themeStyle.borderColor} pt-0.5 pb-1`}>
          <nav className="flex space-x-1 overflow-x-auto py-0.5 scrollbar-none">
            <button
              onClick={() => setActiveTab('resolver')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 text-xs font-semibold rounded-md transition whitespace-nowrap ${
                activeTab === 'resolver'
                  ? themeStyle.tabActiveBg
                  : `${themeStyle.textSecondary} hover:text-slate-900 hover:bg-slate-100/70`
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>1. Clash Resolver Engine</span>
            </button>

            <button
              onClick={() => setActiveTab('grid')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 text-xs font-semibold rounded-md transition whitespace-nowrap ${
                activeTab === 'grid'
                  ? themeStyle.tabActiveBg
                  : `${themeStyle.textSecondary} hover:text-slate-900 hover:bg-slate-100/70`
              }`}
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>2. Combined Weekly Grid</span>
            </button>

            {checkPolicy(userRole, 'VIEW_MASTER_DB') && (
              <button
                onClick={() => setActiveTab('master')}
                className={`flex items-center space-x-1.5 px-3 py-1.5 text-xs font-semibold rounded-md transition whitespace-nowrap ${
                  activeTab === 'master'
                    ? themeStyle.tabActiveBg
                    : `${themeStyle.textSecondary} hover:text-slate-900 hover:bg-slate-100/70`
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>3. Master Database View</span>
              </button>
            )}

            <button
              onClick={() => setActiveTab('print')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 text-xs font-semibold rounded-md transition whitespace-nowrap ${
                activeTab === 'print'
                  ? themeStyle.tabActiveBg
                  : `${themeStyle.textSecondary} hover:text-slate-900 hover:bg-slate-100/70`
              }`}
            >
              <Printer className="w-3.5 h-3.5" />
              <span>4. Academic Advisor Slip (Borang PA)</span>
            </button>

            {(userRole === 'ADMIN' || userRole === 'ADVISOR') && (
              <button
                onClick={() => setActiveTab('admin')}
                className={`flex items-center space-x-1.5 px-3 py-1.5 text-xs font-semibold rounded-md transition whitespace-nowrap ${
                  activeTab === 'admin'
                    ? userRole === 'ADMIN'
                      ? 'bg-amber-100 text-amber-800 border border-amber-300/80 font-bold'
                      : 'bg-purple-100 text-purple-800 border border-purple-300/80 font-bold'
                    : userRole === 'ADMIN'
                    ? 'text-amber-600 hover:text-amber-800 hover:bg-amber-50'
                    : 'text-purple-600 hover:text-purple-800 hover:bg-purple-50'
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>5. {userRole === 'ADMIN' ? 'Admin Board' : 'Advisor Panel'}</span>
              </button>
            )}
          </nav>

          <div className="hidden lg:flex items-center space-x-1.5 text-[11px] text-slate-400 py-0.5">
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
            <span className={`truncate max-w-[180px] font-mono ${themeStyle.textSecondary}`}>{fileName}</span>
            <span className={`${themeStyle.textSecondary}`}>({masterCount} slots across {sectionCount} sections)</span>
          </div>
        </div>

      </div>
    </header>
  );
};
