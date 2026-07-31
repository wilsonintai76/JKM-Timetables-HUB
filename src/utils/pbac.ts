import { UserRole } from '../types';

export type PBACAction = 
  | 'VIEW_WEEKLY_GRID' 
  | 'CHOOSE_REPEAT_COURSES' 
  | 'SOLVE_CLASHES' 
  | 'VIEW_MASTER_DB' 
  | 'UPLOAD_MASTER_FILE' 
  | 'SIGN_ADVISOR_SLIP' 
  | 'ADD_ANNOUNCEMENTS' 
  | 'EDIT_STUDENT_PROFILE' 
  | 'SAVE_TIMETABLE_DRAFTS'
  | 'OVERRIDE_CLASH_RULES'
  | 'SUBMIT_REGISTRATION'
  | 'MANAGE_REGISTRATIONS';

export interface PBACPolicy {
  id: string;
  name: string;
  description: string;
  action: PBACAction;
  effect: 'ALLOW' | 'DENY';
  roles: UserRole[];
}

export const PBAC_POLICIES: PBACPolicy[] = [
  {
    id: 'POL-01',
    name: 'Allow Timetable Grid View',
    description: 'Allows users to view the combined weekly schedule grid and active sections.',
    action: 'VIEW_WEEKLY_GRID',
    effect: 'ALLOW',
    roles: ['STUDENT', 'ADVISOR', 'ADMIN'],
  },
  {
    id: 'POL-02',
    name: 'Allow Carry Course Selection',
    description: 'Allows selecting which repeat/carry modules to fit into the timetable.',
    action: 'CHOOSE_REPEAT_COURSES',
    effect: 'ALLOW',
    roles: ['STUDENT', 'ADVISOR', 'ADMIN'],
  },
  {
    id: 'POL-03',
    name: 'Allow Clash Resolution',
    description: 'Allows using the solver engine to find conflict-free class slots.',
    action: 'SOLVE_CLASHES',
    effect: 'ALLOW',
    roles: ['STUDENT', 'ADVISOR', 'ADMIN'],
  },
  {
    id: 'POL-04',
    name: 'Allow Timetable Drafts',
    description: 'Allows saving, modifying and loading alternative draft schedules.',
    action: 'SAVE_TIMETABLE_DRAFTS',
    effect: 'ALLOW',
    roles: ['STUDENT', 'ADVISOR', 'ADMIN'],
  },
  {
    id: 'POL-05',
    name: 'Allow Profile Modifications',
    description: 'Allows editing the primary student details, matrix no, and IC cards.',
    action: 'EDIT_STUDENT_PROFILE',
    effect: 'ALLOW',
    roles: ['STUDENT', 'ADMIN'],
  },
  {
    id: 'POL-06',
    name: 'Allow Master Timetable View',
    description: 'Allows examining the entire department-wide master schedule spreadsheet dataset.',
    action: 'VIEW_MASTER_DB',
    effect: 'ALLOW',
    roles: ['ADVISOR', 'ADMIN'],
  },
  {
    id: 'POL-07',
    name: 'Allow Advisor Slip Signatures',
    description: 'Allows academic advisor endorsement, digital signing, and locking of Borang PA.',
    action: 'SIGN_ADVISOR_SLIP',
    effect: 'ALLOW',
    roles: ['ADVISOR', 'ADMIN'],
  },
  {
    id: 'POL-08',
    name: 'Allow Master Schedule Uploads',
    description: 'Allows importing new XLSX/XLS master spreadsheets to override existing sessions.',
    action: 'UPLOAD_MASTER_FILE',
    effect: 'ALLOW',
    roles: ['ADMIN'],
  },
  {
    id: 'POL-09',
    name: 'Allow Announcement Broadcasts',
    description: 'Allows managing critical banner alerts, registration deadlines, and system notifications.',
    action: 'ADD_ANNOUNCEMENTS',
    effect: 'ALLOW',
    roles: ['ADMIN'],
  },
  {
    id: 'POL-10',
    name: 'Allow Rule Overrides',
    description: 'Allows modifying strict collision flags, bypassing locking state, and setting priority overrides.',
    action: 'OVERRIDE_CLASH_RULES',
    effect: 'ALLOW',
    roles: ['ADMIN'],
  },
  {
    id: 'POL-11',
    name: 'Allow Course Registration Submission',
    description: 'Allows students to submit their finalized timetable for academic advisor approval.',
    action: 'SUBMIT_REGISTRATION',
    effect: 'ALLOW',
    roles: ['STUDENT', 'ADVISOR', 'ADMIN'],
  },
  {
    id: 'POL-12',
    name: 'Allow Registration Management',
    description: 'Allows advisors and admins to review, approve, or reject student course registrations.',
    action: 'MANAGE_REGISTRATIONS',
    effect: 'ALLOW',
    roles: ['ADVISOR', 'ADMIN'],
  }
];

export function checkPolicy(role: UserRole, action: PBACAction): boolean {
  const policy = PBAC_POLICIES.find(p => p.action === action);
  if (!policy) return false;
  return policy.roles.includes(role);
}
