import React, { useState, useEffect, useMemo } from 'react';
import {
  TimetableSlot,
  StudentProfile,
  AdminNotification,
  SavedDraft,
  CourseClashAnalysis,
  ThemePreferences,
  DepartmentCode,
  PriorityLevel,
  TimePreference,
  CourseRegistration,
  UserRole,
  UserAccount,
  AdvisorProfile
} from './types';
import {
  INITIAL_STUDENT_PROFILE
} from './data/sampleData';
import {
  analyzeCourseClashes,
  autoSolveAllClashes
} from './utils/timeUtils';
import { parseMasterScheduleFile } from './utils/excelParser';
import { checkPolicy } from './utils/pbac';
import { getThemePalette } from './utils/theme';

import { Header } from './components/Header';
import { NotificationBanner } from './components/NotificationBanner';
import { ClashResolver } from './components/ClashResolver';
import { TimetableGrid } from './components/TimetableGrid';
import { MasterDatabaseView } from './components/MasterDatabaseView';
import { PASlipGenerator } from './components/PASlipGenerator';
import { AdminDashboard } from './components/AdminDashboard';
import { SavedSchedulesModal } from './components/SavedSchedulesModal';
import { ThemeCustomizer } from './components/ThemeCustomizer';
import { FormatGuideModal } from './components/FormatGuideModal';
import { FeedbackModal } from './components/FeedbackModal';
import { LoginView } from './components/auth/LoginView';

import {
  getToken,
  getStoredUser,
  apiLogin,
  apiRegister,
  apiGetMe,
  apiLogout,
  apiGetSchedules,
  apiGetNotifications,
  apiGetRegistrations,
  apiSubmitRegistration,
  apiUpdateRegistration,
  apiGetVersion,
  getStoredVersion,
  setStoredVersion,
} from './lib/api';

export default function App() {
  // --- STATE ---
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [appVersion, setAppVersion] = useState<string>('...');
  const [dataLoaded, setDataLoaded] = useState(false);

  const [selectedProgramme, setSelectedProgramme] = useState<string>(() => {
    try { return localStorage.getItem('jkm_selected_programme') || 'ALL'; }
    catch { return 'ALL'; }
  });

  const [masterSlots, setMasterSlots] = useState<TimetableSlot[]>([]);

  const [studentProfile, setStudentProfile] = useState<StudentProfile>(INITIAL_STUDENT_PROFILE);

  const [advisorProfile, setAdvisorProfile] = useState<AdvisorProfile | null>(null);

  const [themePrefs, setThemePrefs] = useState<ThemePreferences>(() => {
    try {
      const saved = localStorage.getItem('jkm_timetable_theme_prefs');
      return saved ? JSON.parse(saved) : { palette: 'cyber', font: 'sans' };
    } catch { return { palette: 'cyber', font: 'sans' }; }
  });

  const [notifications, setNotifications] = useState<AdminNotification[]>([]);
  const [selectedRepeatCourses, setSelectedRepeatCourses] = useState<string[]>(['DJJ10013']);
  const [selectedAddons, setSelectedAddons] = useState<Record<string, string>>({});
  const [coursePriorities, setCoursePriorities] = useState<Record<string, PriorityLevel>>({});
  const [optionalCourses, setOptionalCourses] = useState<Record<string, boolean>>({});
  const [timePreference, setTimePreference] = useState<TimePreference>('ALL');
  
  const [activeTab, setActiveTab] = useState<string>('resolver'); // 'resolver' | 'grid' | 'master' | 'print' | 'admin'
  
  const [userRole, setUserRole] = useState<UserRole>(() => {
    try {
      const saved = localStorage.getItem('jkm_user_role');
      return (saved as UserRole) || 'STUDENT';
    } catch (e) {
      return 'STUDENT';
    }
  });

  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);

  const [registrations, setRegistrations] = useState<CourseRegistration[]>([]);

  const isAdmin = userRole === 'ADMIN';

  const [paEndorsement, setPaEndorsement] = useState<{ endorsed: boolean; notes: string; date: string; signatureCode: string } | null>(null);

  const [fileName, setFileName] = useState<string>('Jadual_Master_JKM_Sesi_1.xlsx (Built-in)');
  const [isExcelLoaded, setIsExcelLoaded] = useState<boolean>(false);
  
  // MODALS STATE
  const [isSavedModalOpen, setIsSavedModalOpen] = useState<boolean>(false);
  const [isThemeModalOpen, setIsThemeModalOpen] = useState<boolean>(false);
  const [isFormatGuideModalOpen, setIsFormatGuideModalOpen] = useState<boolean>(false);
  const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState<boolean>(false);
  
  const [parsingError, setParsingError] = useState<string | null>(null);

  // --- AUTH: Restore session from stored token ---
  useEffect(() => {
    const initAuth = async () => {
      const token = getToken();
      const storedUser = getStoredUser();

      if (token && storedUser) {
        try {
          // Validate token is still good
          const freshUser = await apiGetMe();
          setUser(freshUser);
          setUserRole(freshUser.role);
          if (freshUser.baseSection) {
            setStudentProfile(prev => ({ ...prev, baseSection: freshUser.baseSection, name: freshUser.name, matrixNo: freshUser.matrixNo || prev.matrixNo }));
          }
        } catch {
          // Token expired, clear
          apiLogout();
          setIsLoggedIn(false);
        }
      }
      setLoading(false);
    };
    initAuth();
  }, []);

  // --- VERSION CHECK (auto-updater) ---
  useEffect(() => {
    const checkVersion = async () => {
      try {
        const v = await apiGetVersion();
        setAppVersion(v.version);
        const stored = getStoredVersion();
        if (stored && stored !== v.version) {
          // Version changed: force logout + clear cache
          console.log(`[Updater] Version changed: ${stored} → ${v.version}. Clearing session.`);
          apiLogout();
          setUser(null);
          setIsLoggedIn(false);
          setDataLoaded(false);
        }
        setStoredVersion(v.version);
      } catch {
        // offline, keep current
      }
    };
    checkVersion();
  }, []);

  // --- DATA LOADING: Fetch live data when logged in ---
  useEffect(() => {
    if (!user) return;

    const loadData = async () => {
      try {
        const [slots, notifs, regs] = await Promise.all([
          apiGetSchedules(),
          apiGetNotifications(),
          apiGetRegistrations(),
        ]);

        if (slots.length > 0) {
          setMasterSlots(slots);
          setIsExcelLoaded(true);
          setFileName('Cloudflare D1 (Live)');
        }
        setNotifications(notifs);
        setRegistrations(regs);
        setDataLoaded(true);
      } catch (err) {
        console.error('Failed to load data:', err);
      }
    };
    loadData();
  }, [user]);

  // Save to LocalStorage whenever themePrefs changes
  useEffect(() => {
    localStorage.setItem('jkm_timetable_theme_prefs', JSON.stringify(themePrefs));
  }, [themePrefs]);

  useEffect(() => {
    localStorage.setItem('jkm_selected_programme', selectedProgramme);
  }, [selectedProgramme]);

  // Handle JKM Programme selection
  const handleSelectProgramme = (prog: string) => {
    setSelectedProgramme(prog);
    
    if (prog !== 'ALL') {
      const programNames: Record<string, string> = {
        DKM: 'DIPLOMA IN MECHANICAL ENGINEERING (DKM)',
        DTP: 'DIPLOMA IN MECHANICAL ENGINEERING (MANUFACTURING) (DTP)',
        DAD: 'DIPLOMA IN MECHANICAL ENGINEERING (AUTOMOTIVE) (DAD)',
        DPU: 'DIPLOMA IN MECHANICAL ENGINEERING (AIR CONDITIONING AND REFRIGERATION) (DPU)'
      };
      const defaultSections: Record<string, string> = {
        DKM: 'DKM3A',
        DTP: 'DTP1A',
        DAD: 'DAD1A',
        DPU: 'DPU1A'
      };
      
      setStudentProfile(prev => ({
        ...prev,
        program: programNames[prog] || prev.program,
        baseSection: defaultSections[prog] || prev.baseSection
      }));
    }
  };

  // DERIVED DATA
  const availableSections = useMemo(() => {
    const set = new Set(masterSlots.map(s => s.section));
    return Array.from(set).sort();
  }, [masterSlots]);

  const availableCourses = useMemo(() => {
    const map = new Map<string, { code: string; name: string; creditHours: number }>();
    masterSlots.forEach(s => {
      if (!map.has(s.courseCode)) {
        map.set(s.courseCode, {
          code: s.courseCode,
          name: s.courseName,
          creditHours: s.creditHours || 3
        });
      }
    });
    return Array.from(map.values()).sort((a, b) => a.code.localeCompare(b.code));
  }, [masterSlots]);

  const baseClassSlots = useMemo(() => {
    return masterSlots.filter(s => s.section === studentProfile.baseSection);
  }, [masterSlots, studentProfile.baseSection]);

  // Clash Analysis for every selected repeat course against baseClassSlots
  const clashAnalysis = useMemo<CourseClashAnalysis[]>(() => {
    return selectedRepeatCourses.map(code =>
      analyzeCourseClashes(code, masterSlots, baseClassSlots)
    );
  }, [selectedRepeatCourses, masterSlots, baseClassSlots]);

  // Combined Schedule Slots (Base Class + Selected Addon Sections)
  const combinedSlots = useMemo<TimetableSlot[]>(() => {
    const result: TimetableSlot[] = [
      ...baseClassSlots.map(s => ({ ...s, isBase: true, isRepeat: false }))
    ];

    Object.entries(selectedAddons).forEach(([courseCode, sectionCode]) => {
      if (sectionCode) {
        const addonSlots = masterSlots.filter(
          s => s.courseCode === courseCode && s.section === sectionCode
        );
        addonSlots.forEach(s => {
          result.push({ ...s, isBase: false, isRepeat: true });
        });
      }
    });

    return result;
  }, [baseClassSlots, selectedAddons, masterSlots]);

  // Auto-set default clash-free section when a repeat course is checked
  useEffect(() => {
    const newAddons = { ...selectedAddons };
    let updated = false;

    clashAnalysis.forEach(item => {
      if (!newAddons[item.courseCode]) {
        const bestFreeOption = item.sections.find(s => s.isClashFree) || item.sections[0];
        if (bestFreeOption) {
          newAddons[item.courseCode] = bestFreeOption.section;
          updated = true;
        }
      }
    });

    if (updated) {
      setSelectedAddons(newAddons);
    }
  }, [clashAnalysis]);

  // SMART AUTO-SOLVER ACTION
  const handleAutoSolveAllClashes = () => {
    const solution = autoSolveAllClashes(selectedRepeatCourses, masterSlots, baseClassSlots);
    if (solution) {
      setSelectedAddons(solution);
      alert('⚡ Auto-Solver successfully assigned 100% clash-free sections for all repeat courses!');
    } else {
      alert('Notice: Could not find a 100% zero-clash combination for all courses simultaneously. Please inspect individual section breakdown.');
    }
  };

  // MULTI-FORMAT FILE UPLOAD HANDLER (XLSX, XLS, CSV, JSON)
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setParsingError(null);
    try {
      const result = await parseMasterScheduleFile(file);
      setMasterSlots(result.slots);
      setFileName(file.name);
      setIsExcelLoaded(true);
      alert(`Success! Parsed ${result.slots.length} timetable entries from ${file.name} (${result.format.toUpperCase()} format).`);
    } catch (err: any) {
      console.error(err);
      setParsingError(err.toString() || 'Failed to parse timetable file.');
    }
  };

  const handleResetSample = async () => {
    try {
      const slots = await apiGetSchedules();
      if (slots.length > 0) {
        setMasterSlots(slots);
        setFileName('Cloudflare D1 (Live)');
        setIsExcelLoaded(true);
      }
    } catch { /* keep current */ }
    setParsingError(null);
  };

  const handleEndorsePA = (notes: string) => {
    setPaEndorsement({
      endorsed: true,
      notes: notes || 'All repeat sections checked. 100% collision-free. Highly recommended.',
      date: new Date().toLocaleDateString('ms-MY') + ' ' + new Date().toLocaleTimeString('ms-MY', { hour: '2-digit', minute: '2-digit' }),
      signatureCode: 'SIG-PA-JKM-' + Math.floor(1000 + Math.random() * 9000)
    });
  };

  const handleResetEndorsement = () => {
    setPaEndorsement(null);
  };

  const handleLogin = async (email: string, pass: string) => {
    try {
      const data = await apiLogin(email, pass);
      setUser(data.user);
      setUserRole(data.user.role);
      setIsLoggedIn(true);
      if (data.user.baseSection) {
        setStudentProfile(prev => ({ ...prev, baseSection: data.user.baseSection, name: data.user.name, matrixNo: data.user.matrixNo || prev.matrixNo }));
      }
    } catch (error: any) {
      alert('Login failed: ' + error.message);
    }
  };

  const handleSignUp = async (email: string, pass: string, name: string, _role: 'STUDENT' | 'ADVISOR', _section?: string) => {
    try {
      const data = await apiRegister(email, pass, name);
      setUser(data.user);
      setUserRole('STUDENT');
      setIsLoggedIn(true);
    } catch (error: any) {
      alert('Sign up failed: ' + error.message);
    }
  };

  const handleLogout = () => {
    apiLogout();
    setUser(null);
    setIsLoggedIn(false);
    setDataLoaded(false);
    setMasterSlots([]);
    setNotifications([]);
    setRegistrations([]);
  };

  const handleSubmitRegistration = async () => {
    if (!user) return;

    const existing = registrations.find(r => r.status === 'PENDING');
    if (existing) {
      alert('You already have a pending registration. Please wait for advisor approval.');
      return;
    }

    try {
      await apiSubmitRegistration({
        baseSection: studentProfile.baseSection,
        repeatCourses: selectedRepeatCourses,
        selectedAddons,
        totalCredits: combinedSlots.reduce((acc, s) => acc + (s.creditHours || 3), 0),
      });
      alert('Timetable submitted successfully for advisor endorsement!');
      // Refresh registrations
      const regs = await apiGetRegistrations();
      setRegistrations(regs);
      setActiveTab('grid');
    } catch (error: any) {
      alert('Submission failed: ' + error.message);
    }
  };

  const handleUpdateRegistrationStatus = async (id: string, status: 'APPROVED' | 'REJECTED', notes: string) => {
    try {
      await apiUpdateRegistration(id, status, notes);
      const regs = await apiGetRegistrations();
      setRegistrations(regs);
    } catch (error: any) {
      alert('Update failed: ' + error.message);
    }
  };

  const handleAddNotification = async (_message: string, _type: AdminNotification['type'], _title: string = 'Notice') => {
    // Admin-only: would require admin API endpoint - skip for now (use D1 directly)
    alert('Admin notification management coming soon.');
  };

  const handleToggleNotification = async (_id: string, _active: boolean) => {
    alert('Admin notification management coming soon.');
  };

  const handleDeleteNotification = async (_id: string) => {
    alert('Admin notification management coming soon.');
  };

  const handleAddMasterSlot = async (_slot: TimetableSlot) => {
    alert('Admin slot management coming soon.');
  };

  const handleDeleteMasterSlot = async (_id: string) => {
    alert('Admin slot management coming soon.');
  };

  const handleLoadDraft = (draft: SavedDraft) => {
    setStudentProfile(prev => ({ ...prev, baseSection: draft.baseSection }));
    setSelectedRepeatCourses(draft.repeatCourses);
    setSelectedAddons(draft.selectedAddons);
  };

  const fontClass = themePrefs.font === 'mono' ? 'font-mono' : themePrefs.font === 'serif' ? 'font-serif' : 'font-sans';
  const themeStyle = getThemePalette(themePrefs.palette);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-700"></div>
      </div>
    );
  }

  if (!user || !isLoggedIn) {
    return <LoginView onLogin={handleLogin} onSignUp={handleSignUp} />;
  }

  return (
    <div className={`min-h-screen ${themeStyle.bgClass} flex flex-col ${themeStyle.selectionBg} antialiased ${fontClass}`}>

      {/* HEADER NAVBAR */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        userRole={userRole}
        fileName={fileName}
        isExcelLoaded={isExcelLoaded}
        onFileUpload={handleFileUpload}
        onResetSample={handleResetSample}
        onOpenDrafts={() => setIsSavedModalOpen(true)}

        onOpenTheme={() => setIsThemeModalOpen(true)}
        onOpenFormatGuide={() => setIsFormatGuideModalOpen(true)}
        onOpenFeedback={() => setIsFeedbackModalOpen(true)}
        onLogout={handleLogout}
        selectedProgramme={selectedProgramme}
        onSelectProgramme={handleSelectProgramme}
        masterCount={masterSlots.length}
        sectionCount={availableSections.length}
        themePrefs={themePrefs}
        appVersion={appVersion}
      />

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 max-w-[1536px] w-full mx-auto px-3 sm:px-4 lg:px-6 py-3.5 space-y-3.5">

        {/* NOTIFICATIONS & DEADLINE BANNER */}
        <NotificationBanner notifications={notifications} />

        {/* PARSING ERROR ALERT */}
        {parsingError && (
          <div className="p-3 rounded-lg bg-rose-100 border border-rose-300 text-rose-900 text-xs no-print flex items-center justify-between shadow-sm">
            <span className="font-bold">⚠️ Error: {parsingError}</span>
            <button onClick={() => setParsingError(null)} className="underline font-black hover:text-rose-700">Dismiss</button>
          </div>
        )}

        {/* TAB 1: CLASH RESOLVER ENGINE */}
        {activeTab === 'resolver' && (
          <ClashResolver
            studentProfile={studentProfile}
            setStudentProfile={setStudentProfile}
            availableSections={availableSections}
            availableCourses={availableCourses}
            baseClassSlots={baseClassSlots}
            selectedRepeatCourses={selectedRepeatCourses}
            setSelectedRepeatCourses={setSelectedRepeatCourses}
            selectedAddons={selectedAddons}
            setSelectedAddons={setSelectedAddons}
            clashAnalysis={clashAnalysis}
            onAutoSolve={handleAutoSolveAllClashes}
            onNavigateToGrid={() => setActiveTab('grid')}
            coursePriorities={coursePriorities}
            setCoursePriorities={setCoursePriorities}
            optionalCourses={optionalCourses}
            setOptionalCourses={setOptionalCourses}
            timePreference={timePreference}
            setTimePreference={setTimePreference}
            masterSlots={masterSlots}
            themePrefs={themePrefs}
            onSubmitRegistration={handleSubmitRegistration}
          />
        )}

        {/* TAB 2: COMBINED WEEKLY GRID */}
        {activeTab === 'grid' && (
          <TimetableGrid
            baseSection={studentProfile.baseSection}
            combinedSlots={combinedSlots}
            studentName={studentProfile.name}
            onNavigateToPrint={() => setActiveTab('print')}
            themePrefs={themePrefs}
          />
        )}

        {/* TAB 3: MASTER DATABASE VIEW */}
        {checkPolicy(userRole, 'VIEW_MASTER_DB') && activeTab === 'master' && (
          <MasterDatabaseView
            masterSlots={masterSlots}
            onExportExcel={() => {}}
          />
        )}

        {/* TAB 4: ACADEMIC ADVISOR (PA) SLIP */}
        {activeTab === 'print' && (
          <PASlipGenerator
            studentProfile={studentProfile}
            selectedRepeatCourses={selectedRepeatCourses}
            selectedAddons={selectedAddons}
            masterSlots={masterSlots}
            baseClassSlots={baseClassSlots}
            userRole={userRole}
            paEndorsement={paEndorsement}
            onEndorse={handleEndorsePA}
            onResetEndorsement={handleResetEndorsement}
          />
        )}

        {/* TAB 5: ADMIN DASHBOARD */}
        {activeTab === 'admin' && (userRole === 'ADMIN' || userRole === 'ADVISOR') && (
          <AdminDashboard
            masterSlots={masterSlots}
            onAddMasterSlot={handleAddMasterSlot}
            onDeleteMasterSlot={handleDeleteMasterSlot}
            notifications={notifications}
            onAddNotification={handleAddNotification}
            onToggleNotification={handleToggleNotification}
            onDeleteNotification={handleDeleteNotification}
            registrations={registrations}
            onUpdateRegistrationStatus={handleUpdateRegistrationStatus}
            userRole={userRole}
            studentProfile={studentProfile}
            advisorProfile={advisorProfile}
            selectedRepeatCourses={selectedRepeatCourses}
            selectedAddons={selectedAddons}
            paEndorsement={paEndorsement}
            onEndorse={handleEndorsePA}
            onResetEndorsement={handleResetEndorsement}
          />
        )}

      </main>

      {/* SAVED SCHEDULE DRAFTS MODAL */}
      <SavedSchedulesModal
        isOpen={isSavedModalOpen}
        onClose={() => setIsSavedModalOpen(false)}
        currentDraft={{
          baseSection: studentProfile.baseSection,
          repeatCourses: selectedRepeatCourses,
          selectedAddons: selectedAddons
        }}
        onLoadDraft={handleLoadDraft}
      />

      {/* THEME CUSTOMIZER MODAL */}
      {isThemeModalOpen && (
        <ThemeCustomizer
          isOpen={isThemeModalOpen}
          onClose={() => setIsThemeModalOpen(false)}
          themePrefs={themePrefs}
          setThemePrefs={setThemePrefs}
        />
      )}

      {/* FORMAT GUIDE MODAL */}
      {isFormatGuideModalOpen && (
        <FormatGuideModal
          isOpen={isFormatGuideModalOpen}
          onClose={() => setIsFormatGuideModalOpen(false)}
        />
      )}

      {/* USER FEEDBACK MODAL */}
      {isFeedbackModalOpen && (
        <FeedbackModal
          isOpen={isFeedbackModalOpen}
          onClose={() => setIsFeedbackModalOpen(false)}
          availableCourses={availableCourses.map(c => c.code)}
        />
      )}

      {/* FOOTER */}
      <footer className={`${themeStyle.cardBgClass} border-t py-4 text-center text-xs ${themeStyle.textSecondary} mt-auto no-print`}>
        <p>Politeknik Timetable Master — XLSX / XLS / CSV / JSON Multi-Format Schedule Parser & Clash Resolver Engine</p>
      </footer>

    </div>
  );
}

