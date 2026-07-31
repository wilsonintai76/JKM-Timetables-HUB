export type DayOfWeek = 'ISNIN' | 'SELASA' | 'RABU' | 'KHAMIS' | 'JUMAAT' | 'SABTU';

export type PriorityLevel = 'HIGH' | 'MEDIUM' | 'LOW';
export type TimePreference = 'ALL' | 'MORNING' | 'AFTERNOON' | 'NO_FRIDAY';

export type DepartmentCode = 'JKM' | 'JTMK' | 'JP' | 'JKE';

export type ThemePalette = 'cyber' | 'emerald' | 'midnight' | 'amber' | 'contrast';

export type ThemeFont = 'sans' | 'mono' | 'serif';

export interface UserAccount {
  id: string;
  email: string;
  name: string;
  matrixNo?: string;
  role: UserRole;
  profile?: StudentProfile | AdvisorProfile;
}

export interface AdvisorProfile {
  department: string;
  officeLocation: string;
  assignedSection: string;
  consultationHours: string[];
}

export type UserRole = 'STUDENT' | 'ADVISOR' | 'ADMIN';

export interface ThemePreferences {
  palette: ThemePalette;
  font: ThemeFont;
}

export interface TimetableSlot {
  id: string;
  section: string; // e.g., 'DKM1A', 'DKM3A'
  courseCode: string; // e.g., 'DJJ10013'
  courseName: string; // e.g., 'Engineering Drawing'
  creditHours?: number; // e.g., 3
  day: DayOfWeek;
  startTime: string; // e.g., '08:00'
  endTime: string; // e.g., '10:00'
  venue: string; // e.g., 'Bengkel Lukisan 1'
  lecturer?: string; // e.g., 'En. Azman'
  isBase?: boolean;
  isRepeat?: boolean;
  isClash?: boolean;
}

export interface CourseInfo {
  code: string;
  name: string;
  creditHours: number;
  sections: string[];
  priority?: PriorityLevel;
  isOptional?: boolean;
}

export interface ClashDetail {
  repeatSlot: TimetableSlot;
  clashedWith: TimetableSlot;
}

export interface SectionOption {
  section: string;
  slots: TimetableSlot[];
  isClashFree: boolean;
  clashes: ClashDetail[];
  score?: number; // Advanced rating score
}

export interface CourseClashAnalysis {
  courseCode: string;
  courseName: string;
  creditHours: number;
  priority: PriorityLevel;
  isOptional: boolean;
  sections: SectionOption[];
}

export interface RankedScheduleOption {
  id: string;
  rank: number;
  title: string;
  matchScore: number; // 0 - 100%
  selectedAddons: Record<string, string>; // courseCode -> section
  totalClashes: number;
  satisfiedPreferences: string[];
  totalCredits: number;
}

export interface StudentProfile {
  name: string;
  matrixNo: string;
  icNo: string;
  program: string; // e.g., 'Diploma Kejuruteraan Mekanikal (DKM)'
  session: string; // e.g., 'Sesi 1 2026/2027'
  semester: number;
  baseSection: string; // e.g., 'DKM3A'
  paName: string;
  email: string;
  phone: string;
  department?: string;
}

export interface SavedDraft {
  id: string;
  title: string;
  timestamp: string;
  baseSection: string;
  repeatCourses: string[];
  selectedAddons: Record<string, string>; // courseCode -> selectedSection
}

export interface AdminNotification {
  id: string;
  title: string;
  message: string;
  type: 'deadline' | 'update' | 'warning' | 'info';
  date: string;
  active: boolean;
}

export interface UserFeedback {
  id: string;
  name: string;
  email?: string;
  category: 'Data Inaccuracy' | 'Resolver Bug' | 'UI/UX Suggestion' | 'Feature Request' | 'General Comment';
  courseCode?: string;
  rating: number; // 1 to 5
  message: string;
  date: string;
  status: 'New' | 'Under Review' | 'Resolved';
}

export interface CourseRegistration {
  id: string;
  studentId: string;
  studentName: string;
  matrixNo: string;
  baseSection: string;
  repeatCourses: string[];
  selectedAddons: Record<string, string>; // courseCode -> section
  totalCredits: number;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  timestamp: string;
  advisorNotes?: string;
  advisorName?: string;
}

export interface DepartmentDataset {
  id: string;
  name: string;
  code: string; // e.g. JKM, JTMK, JP, JKE
  description: string;
  studentProfile: StudentProfile;
  slots: TimetableSlot[];
}

export const JKM_PROGRAMMES = [
  'DIPLOMA IN MECHANICAL ENGINEERING (DKM)',
  'DIPLOMA IN MECHANICAL ENGINEERING (MANUFACTURING) (DTP)',
  'DIPLOMA IN MECHANICAL ENGINEERING (AUTOMOTIVE) (DAD)',
  'DIPLOMA IN MECHANICAL ENGINEERING (AIR CONDITIONING AND REFRIGERATION) (DPU)'
];
