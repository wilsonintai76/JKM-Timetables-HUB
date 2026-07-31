import { TimetableSlot, CourseClashAnalysis, SectionOption, ClashDetail } from '../types';

export const timeToDecimal = (timeStr: string): number => {
  if (!timeStr) return 0;
  const parts = timeStr.trim().split(':');
  const h = parseInt(parts[0], 10) || 0;
  const m = parseInt(parts[1], 10) || 0;
  return h + m / 60;
};

export const decimalToTime = (dec: number): string => {
  const h = Math.floor(dec);
  const m = Math.round((dec - h) * 60);
  const hStr = h < 10 ? `0${h}` : `${h}`;
  const mStr = m < 10 ? `0${m}` : `${m}`;
  return `${hStr}:${mStr}`;
};

export const checkTimeOverlap = (
  s1: string,
  e1: string,
  s2: string,
  e2: string
): boolean => {
  const start1 = timeToDecimal(s1);
  const end1 = timeToDecimal(e1);
  const start2 = timeToDecimal(s2);
  const end2 = timeToDecimal(e2);

  // Overlap condition: Start1 < End2 AND End1 > Start2
  return start1 < end2 && end1 > start2;
};

export const analyzeCourseClashes = (
  courseCode: string,
  masterSlots: TimetableSlot[],
  baseClassSlots: TimetableSlot[]
): CourseClashAnalysis => {
  // Find all slots for this course code
  const courseSlots = masterSlots.filter(s => s.courseCode.toUpperCase() === courseCode.toUpperCase());
  const firstSlot = courseSlots[0];
  const courseName = firstSlot ? firstSlot.courseName : courseCode;
  const creditHours = firstSlot?.creditHours || 3;

  // Group slots by section
  const sectionMap = new Map<string, TimetableSlot[]>();
  courseSlots.forEach(slot => {
    if (!sectionMap.has(slot.section)) {
      sectionMap.set(slot.section, []);
    }
    sectionMap.get(slot.section)!.push(slot);
  });

  const sectionOptions: SectionOption[] = [];

  sectionMap.forEach((slots, sectionCode) => {
    const clashes: ClashDetail[] = [];

    slots.forEach(rSlot => {
      baseClassSlots.forEach(bSlot => {
        if (rSlot.day === bSlot.day) {
          if (checkTimeOverlap(rSlot.startTime, rSlot.endTime, bSlot.startTime, bSlot.endTime)) {
            clashes.push({
              repeatSlot: rSlot,
              clashedWith: bSlot
            });
          }
        }
      });
    });

    sectionOptions.push({
      section: sectionCode,
      slots,
      isClashFree: clashes.length === 0,
      clashes
    });
  });

  // Sort section options: 100% clash-free sections first, then by section name
  sectionOptions.sort((a, b) => {
    if (a.isClashFree && !b.isClashFree) return -1;
    if (!a.isClashFree && b.isClashFree) return 1;
    return a.section.localeCompare(b.section);
  });

  return {
    courseCode,
    courseName,
    creditHours,
    priority: 'MEDIUM',
    isOptional: false,
    sections: sectionOptions
  };
};

/**
 * Smart Solver: Finds a conflict-free set of sections for ALL selected repeat courses simultaneously
 * taking into account potential overlaps between repeat courses themselves as well as base class slots.
 */
export const autoSolveAllClashes = (
  repeatCourseCodes: string[],
  masterSlots: TimetableSlot[],
  baseClassSlots: TimetableSlot[]
): Record<string, string> | null => {
  if (repeatCourseCodes.length === 0) return {};

  const solution: Record<string, string> = {};

  // For each course, gather all section options that are clash-free against baseClassSlots
  const courseOptionsMap: Record<string, SectionOption[]> = {};

  repeatCourseCodes.forEach(code => {
    const analysis = analyzeCourseClashes(code, masterSlots, baseClassSlots);
    const validSections = analysis.sections.filter(s => s.isClashFree);
    courseOptionsMap[code] = validSections.length > 0 ? validSections : analysis.sections;
  });

  // Backtracking algorithm to pick 1 section per course with zero internal repeat clashes
  const solve = (index: number, currentSelectedSlots: TimetableSlot[]): boolean => {
    if (index === repeatCourseCodes.length) {
      return true; // Found full solution!
    }

    const code = repeatCourseCodes[index];
    const options = courseOptionsMap[code] || [];

    for (const opt of options) {
      // Check if opt.slots clashes with currentSelectedSlots
      let hasConflict = false;
      for (const rSlot of opt.slots) {
        for (const existingSlot of currentSelectedSlots) {
          if (rSlot.day === existingSlot.day) {
            if (checkTimeOverlap(rSlot.startTime, rSlot.endTime, existingSlot.startTime, existingSlot.endTime)) {
              hasConflict = true;
              break;
            }
          }
        }
        if (hasConflict) break;
      }

      if (!hasConflict) {
        solution[code] = opt.section;
        if (solve(index + 1, [...currentSelectedSlots, ...opt.slots])) {
          return true;
        }
        delete solution[code];
      }
    }

    return false;
  };

  const success = solve(0, [...baseClassSlots]);
  return success ? solution : null;
};
