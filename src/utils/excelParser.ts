import * as XLSX from 'xlsx';
import { TimetableSlot, DayOfWeek } from '../types';

export const parseMasterScheduleFile = async (file: File): Promise<{ slots: TimetableSlot[]; sheetName: string; format: string }> => {
  const fileName = file.name.toLowerCase();

  // 1. JSON FILE PARSER
  if (fileName.endsWith('.json')) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const content = e.target?.result as string;
          const parsed = JSON.parse(content);
          let rawList: any[] = [];

          if (Array.isArray(parsed)) {
            rawList = parsed;
          } else if (parsed && Array.isArray(parsed.slots)) {
            rawList = parsed.slots;
          } else if (parsed && Array.isArray(parsed.data)) {
            rawList = parsed.data;
          } else {
            throw new Error('Invalid JSON structure. Expected an array of timetable slots or { slots: [...] } object.');
          }

          let idCounter = 1;
          const slots: TimetableSlot[] = rawList.map((item, idx) => {
            const section = String(item.section || item.kumpulan || item.seksyen || 'BASE').trim().toUpperCase();
            const courseCode = String(item.courseCode || item.code || item.kod || 'COURSE').trim().toUpperCase();
            const courseName = String(item.courseName || item.name || item.nama || courseCode).trim();
            const dayRaw = String(item.day || item.hari || 'ISNIN').trim().toUpperCase();

            let day: DayOfWeek = 'ISNIN';
            if (dayRaw.includes('SELASA') || dayRaw.includes('TUE')) day = 'SELASA';
            else if (dayRaw.includes('RABU') || dayRaw.includes('WED')) day = 'RABU';
            else if (dayRaw.includes('KHAMIS') || dayRaw.includes('THU')) day = 'KHAMIS';
            else if (dayRaw.includes('JUMAAT') || dayRaw.includes('FRI')) day = 'JUMAAT';
            else if (dayRaw.includes('SABTU') || dayRaw.includes('SAT')) day = 'SABTU';

            return {
              id: item.id || `json_${idCounter++}`,
              section,
              courseCode,
              courseName,
              creditHours: Number(item.creditHours || item.kredit || 3),
              day,
              startTime: formatTimeString(String(item.startTime || item.mula || '08:00')),
              endTime: formatTimeString(String(item.endTime || item.tamat || '10:00')),
              venue: String(item.venue || item.bilik || item.lokasi || 'Bilik Kuliah').trim(),
              lecturer: String(item.lecturer || item.pensyarah || 'Pensyarah').trim()
            };
          });

          if (slots.length === 0) {
            throw new Error('JSON file contained 0 valid schedule slots.');
          }

          resolve({ slots, sheetName: 'JSON Dataset', format: 'JSON' });
        } catch (err: any) {
          reject(err.message || 'Error parsing JSON schedule file');
        }
      };
      reader.onerror = () => reject('Failed to read JSON file from disk');
      reader.readAsText(file);
    });
  }

  // 2. CSV / EXCEL PARSER
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        let workbook: XLSX.WorkBook;
        let fileType = 'XLSX';

        if (fileName.endsWith('.csv')) {
          fileType = 'CSV';
          const csvText = e.target?.result as string;
          workbook = XLSX.read(csvText, { type: 'string' });
        } else {
          const data = new Uint8Array(e.target?.result as ArrayBuffer);
          workbook = XLSX.read(data, { type: 'array' });
        }

        if (!workbook.SheetNames || workbook.SheetNames.length === 0) {
          throw new Error('Workbook contains no readable sheets or data.');
        }

        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];

        // DYNAMIC UNMERGE: Fill values across merged cell ranges (e.g. multi-hour lab blocks)
        if (worksheet['!merges']) {
          worksheet['!merges'].forEach(range => {
            const topLeftAddress = XLSX.utils.encode_cell({ r: range.s.r, c: range.s.c });
            const topLeftCell = worksheet[topLeftAddress];

            if (topLeftCell && topLeftCell.v !== undefined) {
              for (let R = range.s.r; R <= range.e.r; ++R) {
                for (let C = range.s.c; C <= range.e.c; ++C) {
                  const cellAddress = XLSX.utils.encode_cell({ r: R, c: C });
                  if (!worksheet[cellAddress]) {
                    worksheet[cellAddress] = { ...topLeftCell };
                  } else if (worksheet[cellAddress].v === undefined) {
                    worksheet[cellAddress].v = topLeftCell.v;
                  }
                }
              }
            }
          });
        }

        // Convert sheet to JSON rows
        const rawRows: any[][] = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

        if (!rawRows || rawRows.length < 2) {
          throw new Error('Spreadsheet has no valid rows of data.');
        }

        const parsedSlots: TimetableSlot[] = [];
        let idCounter = 1;

        // Find header row
        let headerRowIndex = 0;
        for (let r = 0; r < Math.min(10, rawRows.length); r++) {
          const rowStr = rawRows[r].map(c => String(c || '').toUpperCase()).join(' ');
          if (
            rowStr.includes('CLASS') || rowStr.includes('KUMPULAN') || rowStr.includes('SEKSYEN') ||
            rowStr.includes('COURSE') || rowStr.includes('KURSUS') || rowStr.includes('KOD') ||
            rowStr.includes('DAY') || rowStr.includes('HARI')
          ) {
            headerRowIndex = r;
            break;
          }
        }

        const headerRow = (rawRows[headerRowIndex] || []).map(c => String(c || '').toUpperCase().trim());

        const findColIndex = (keywords: string[]): number => {
          return headerRow.findIndex(h => keywords.some(kw => h.includes(kw)));
        };

        const classIdx = findColIndex(['CLASS', 'KUMPULAN', 'SEKSYEN', 'SECTION', 'PROGRAM']);
        const codeIdx = findColIndex(['KOD', 'CODE', 'COURSE CODE', 'KOD KURSUS']);
        const nameIdx = findColIndex(['NAMA', 'NAME', 'COURSE NAME', 'NAMA KURSUS', 'TAJUK']);
        const dayIdx = findColIndex(['DAY', 'HARI']);
        const startIdx = findColIndex(['START', 'MULA', 'JAM MULA']);
        const endIdx = findColIndex(['END', 'TAMAT', 'JAM TAMAT']);
        const venueIdx = findColIndex(['VENUE', 'BILIK', 'LOKASI', 'BENGKEL', 'MAKMAL', 'ROOM']);
        const lecturerIdx = findColIndex(['LECTURER', 'PENSYARAH', 'NAMA PENSYARAH']);

        // Check if List Format
        if (classIdx !== -1 && (codeIdx !== -1 || nameIdx !== -1)) {
          for (let r = headerRowIndex + 1; r < rawRows.length; r++) {
            const row = rawRows[r];
            if (!row || row.length === 0) continue;

            const section = String(row[classIdx] || '').trim().toUpperCase();
            const courseCode = codeIdx !== -1 && row[codeIdx] ? String(row[codeIdx]).trim().toUpperCase() : 'COURSE';
            if (!section || !courseCode || section === 'UNDEFINED' || courseCode === 'UNDEFINED') continue;

            const courseName = nameIdx !== -1 && row[nameIdx] ? String(row[nameIdx]).trim() : courseCode;
            const dayRaw = dayIdx !== -1 && row[dayIdx] ? String(row[dayIdx]).trim().toUpperCase() : 'ISNIN';
            
            let day: DayOfWeek = 'ISNIN';
            if (dayRaw.includes('SELASA') || dayRaw.includes('TUE')) day = 'SELASA';
            else if (dayRaw.includes('RABU') || dayRaw.includes('WED')) day = 'RABU';
            else if (dayRaw.includes('KHAMIS') || dayRaw.includes('THU')) day = 'KHAMIS';
            else if (dayRaw.includes('JUMAAT') || dayRaw.includes('FRI')) day = 'JUMAAT';
            else if (dayRaw.includes('SABTU') || dayRaw.includes('SAT')) day = 'SABTU';

            const startTime = startIdx !== -1 && row[startIdx] ? formatTimeString(String(row[startIdx])) : '08:00';
            const endTime = endIdx !== -1 && row[endIdx] ? formatTimeString(String(row[endIdx])) : '10:00';
            const venue = venueIdx !== -1 && row[venueIdx] ? String(row[venueIdx]).trim() : 'Bilik Kuliah';
            const lecturer = lecturerIdx !== -1 && row[lecturerIdx] ? String(row[lecturerIdx]).trim() : 'Pensyarah';

            parsedSlots.push({
              id: `${fileType.toLowerCase()}_${idCounter++}`,
              section,
              courseCode,
              courseName,
              creditHours: 3,
              day,
              startTime,
              endTime,
              venue,
              lecturer
            });
          }
        } else {
          // Matrix Format Fallback
          for (let r = 1; r < rawRows.length; r++) {
            const row = rawRows[r];
            if (!row || row.length < 2) continue;

            const label = String(row[0] || '').trim().toUpperCase();
            if (label.length >= 3) {
              for (let c = 1; c < row.length; c++) {
                const cellText = String(row[c] || '').trim();
                if (cellText && cellText.length > 2) {
                  const headerText = String(rawRows[0][c] || '08:00-10:00');
                  const times = headerText.split('-');
                  const startTime = times[0] ? formatTimeString(times[0]) : '08:00';
                  const endTime = times[1] ? formatTimeString(times[1]) : '10:00';

                  const codeMatch = cellText.match(/([A-Z]{3}\d{5})/i);
                  const code = codeMatch ? codeMatch[1].toUpperCase() : cellText.substring(0, 8);

                  parsedSlots.push({
                    id: `matrix_${idCounter++}`,
                    section: label,
                    courseCode: code,
                    courseName: cellText,
                    creditHours: 3,
                    day: 'ISNIN',
                    startTime,
                    endTime,
                    venue: 'Bilik Kuliah',
                    lecturer: 'Pensyarah'
                  });
                }
              }
            }
          }
        }

        if (parsedSlots.length === 0) {
          throw new Error('No valid timetable slots could be extracted. Please ensure column headers exist (Seksyen, Kod Kursus, Hari, Masa Mula, Masa Tamat).');
        }

        resolve({ slots: parsedSlots, sheetName, format: fileType });
      } catch (err: any) {
        reject(err.message || 'Error processing spreadsheet file');
      }
    };

    reader.onerror = () => reject('Failed to read file from disk');

    if (fileName.endsWith('.csv')) {
      reader.readAsText(file);
    } else {
      reader.readAsArrayBuffer(file);
    }
  });
};

// Legacy alias compatibility
export const parseExcelFile = parseMasterScheduleFile;

const formatTimeString = (str: string): string => {
  if (!str) return '08:00';
  let clean = str.trim().toLowerCase().replace('am', '').replace('pm', '');
  if (clean.includes(':')) {
    const parts = clean.split(':');
    const h = parseInt(parts[0], 10);
    const m = parseInt(parts[1], 10);
    return `${h < 10 ? '0' + h : h}:${m < 10 ? '0' + m : m}`;
  }
  const val = parseFloat(clean);
  if (!isNaN(val)) {
    if (val < 1) {
      const totalMin = Math.round(val * 24 * 60);
      const h = Math.floor(totalMin / 60);
      const m = totalMin % 60;
      return `${h < 10 ? '0' + h : h}:${m < 10 ? '0' + m : m}`;
    }
    const h = Math.floor(val);
    return `${h < 10 ? '0' + h : h}:00`;
  }
  return '08:00';
};

export const exportMasterToExcel = (slots: TimetableSlot[], fileName = 'Master_Schedule_Exported.xlsx') => {
  const exportData = slots.map((s, idx) => ({
    'BIL': idx + 1,
    'SEKSYEN/KUMPULAN': s.section,
    'KOD KURSUS': s.courseCode,
    'NAMA KURSUS': s.courseName,
    'JAM KREDIT': s.creditHours || 3,
    'HARI': s.day,
    'MASA MULA': s.startTime,
    'MASA TAMAT': s.endTime,
    'LOKASI/BILIK': s.venue,
    'PENSYARAH': s.lecturer || 'N/A'
  }));

  const worksheet = XLSX.utils.json_to_sheet(exportData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Master Timetable');
  XLSX.writeFile(workbook, fileName);
};

