import { TimetableSlot } from '../types';

// Map day string to next upcoming date (or reference week)
const DAY_TO_OFFSET: Record<string, number> = {
  'ISNIN': 1,
  'SELASA': 2,
  'RABU': 3,
  'KHAMIS': 4,
  'JUMAAT': 5,
  'SABTU': 6
};

// Base Monday reference date for the current semester (e.g., 2026-08-03 is a Monday)
const BASE_MONDAY = new Date(2026, 7, 3); // August 3, 2026

export const generateGoogleCalendarUrl = (slot: TimetableSlot): string => {
  const dayOffset = (DAY_TO_OFFSET[slot.day] || 1) - 1;
  const eventDate = new Date(BASE_MONDAY);
  eventDate.setDate(eventDate.getDate() + dayOffset);

  const [sH, sM] = slot.startTime.split(':').map(Number);
  const [eH, eM] = slot.endTime.split(':').map(Number);

  const startUtc = new Date(eventDate);
  startUtc.setHours(sH, sM, 0);

  const endUtc = new Date(eventDate);
  endUtc.setHours(eH, eM, 0);

  const formatIso = (d: Date) => d.toISOString().replace(/-|:|\.\d+/g, '');

  const title = encodeURIComponent(`${slot.courseCode} ${slot.courseName} (${slot.section})`);
  const details = encodeURIComponent(`Politeknik JKM Class.\nLecturer: ${slot.lecturer || 'N/A'}\nSection: ${slot.section}`);
  const location = encodeURIComponent(slot.venue || 'JKM');

  const dates = `${formatIso(startUtc)}/${formatIso(endUtc)}`;

  return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${dates}&details=${details}&location=${location}&recur=RRULE:FREQ=WEEKLY;UNTIL=20261215T235959Z`;
};

export const generateICSContent = (slots: TimetableSlot[], studentName: string): string => {
  let ics = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Politeknik JKM//Smart Timetable Resolver//MY',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    `X-WR-CALNAME:JKM Schedule - ${studentName}`
  ];

  slots.forEach((slot, idx) => {
    const dayOffset = (DAY_TO_OFFSET[slot.day] || 1) - 1;
    const eventDate = new Date(BASE_MONDAY);
    eventDate.setDate(eventDate.getDate() + dayOffset);

    const [sH, sM] = slot.startTime.split(':').map(Number);
    const [eH, eM] = slot.endTime.split(':').map(Number);

    const startDate = new Date(eventDate);
    startDate.setHours(sH, sM, 0);

    const endDate = new Date(eventDate);
    endDate.setHours(eH, eM, 0);

    const formatICSDate = (d: Date) => {
      const pad = (n: number) => (n < 10 ? '0' + n : '' + n);
      return (
        d.getFullYear().toString() +
        pad(d.getMonth() + 1) +
        pad(d.getDate()) +
        'T' +
        pad(d.getHours()) +
        pad(d.getMinutes()) +
        '00'
      );
    };

    ics.push('BEGIN:VEVENT');
    ics.push(`UID:jkm_slot_${idx}_${Date.now()}@politeknik.edu.my`);
    ics.push(`DTSTAMP:${formatICSDate(new Date())}`);
    ics.push(`DTSTART:${formatICSDate(startDate)}`);
    ics.push(`DTEND:${formatICSDate(endDate)}`);
    ics.push(`RRULE:FREQ=WEEKLY;UNTIL=20261215T235959Z`);
    ics.push(`SUMMARY:${slot.courseCode} - ${slot.courseName} (${slot.section})`);
    ics.push(`LOCATION:${slot.venue || 'JKM'}`);
    ics.push(`DESCRIPTION:Lecturer: ${slot.lecturer || 'N/A'}\\nSection: ${slot.section}\\nType: ${slot.isRepeat ? 'Repeat Course' : 'Base Class'}`);
    ics.push('END:VEVENT');
  });

  ics.push('END:VCALENDAR');
  return ics.join('\r\n');
};

export const downloadICSFile = (slots: TimetableSlot[], studentName: string) => {
  const content = generateICSContent(slots, studentName);
  const blob = new Blob([content], { type: 'text/calendar;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `JKM_Jadual_${studentName.replace(/\s+/g, '_')}.ics`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
