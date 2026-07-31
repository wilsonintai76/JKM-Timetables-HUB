import { TimetableSlot, StudentProfile, AdminNotification, DepartmentDataset } from '../types';

export const INITIAL_STUDENT_PROFILE: StudentProfile = {
  name: 'MUHAMMAD ADAM BIN ROSLI',
  matrixNo: '05DKM22F1042',
  icNo: '040512-08-5431',
  program: 'DIPLOMA IN MECHANICAL ENGINEERING (DKM)',
  session: 'Sesi 1 2026/2027',
  semester: 3,
  baseSection: 'DKM3A',
  paName: 'Ir. Dr. Tan Chee Keong',
  email: 'adam.rosli@student.politeknik.edu.my',
  phone: '017-8823910'
};

export const INITIAL_NOTIFICATIONS: AdminNotification[] = [
  {
    id: 'n1',
    title: 'Tarikh Akhir Pendaftaran Kursus Mengulang',
    message: 'Permohonan pendaftaran kursus mengulang (Borang PA JKM) hendaklah diserahkan sebelum 15 Ogos 2026 jam 5:00 PM ke Bilik Pensyarah JKM.',
    type: 'deadline',
    date: '15 Ogos 2026',
    active: true
  },
  {
    id: 'n2',
    title: 'Kemaskini Bilik Kuliah & Bengkel',
    message: 'Bengkel Pemesinan 2 dan Makmal CAD 1 telah dikemaskini lokasinya di Blok B. Sila semak jadual terbaharu.',
    type: 'update',
    date: '28 Julai 2026',
    active: true
  }
];

export const SAMPLE_JKM_DATA: TimetableSlot[] = [
  // --- DKM1A (Semester 1) ---
  { id: '1', section: 'DKM1A', courseCode: 'DJJ10013', courseName: 'Engineering Drawing', creditHours: 3, day: 'ISNIN', startTime: '08:00', endTime: '10:00', venue: 'Bengkel Lukisan 1', lecturer: 'En. Azman' },
  { id: '2', section: 'DKM1A', courseCode: 'DBM10013', courseName: 'Engineering Mathematics 1', creditHours: 3, day: 'ISNIN', startTime: '10:00', endTime: '12:00', venue: 'BK 01', lecturer: 'Pn. Rohana' },
  { id: '3', section: 'DKM1A', courseCode: 'DBS10012', courseName: 'Engineering Science', creditHours: 2, day: 'SELASA', startTime: '08:00', endTime: '10:00', venue: 'Makmal Sains 2', lecturer: 'Dr. Lim' },
  { id: '4', section: 'DKM1A', courseCode: 'DJJ10022', courseName: 'Mechanical Workshop Practice 1', creditHours: 2, day: 'SELASA', startTime: '10:00', endTime: '13:00', venue: 'Bengkel Pemesinan', lecturer: 'En. Fairuz' },
  { id: '5', section: 'DKM1A', courseCode: 'DUW10012', courseName: 'Occupational Safety & Health', creditHours: 2, day: 'RABU', startTime: '08:00', endTime: '10:00', venue: 'BK 02', lecturer: 'Pn. Siti' },
  { id: '6', section: 'DKM1A', courseCode: 'DJJ10033', courseName: 'Workshop Technology', creditHours: 3, day: 'KHAMIS', startTime: '08:00', endTime: '10:00', venue: 'BK 01', lecturer: 'En. Hafiz' },
  { id: '7', section: 'DKM1A', courseCode: 'MPU21032', courseName: 'Penghayatan Etika dan Peradaban', creditHours: 2, day: 'KHAMIS', startTime: '14:00', endTime: '16:00', venue: 'DK 02', lecturer: 'Ustaz Razak' },

  // --- DKM1B (Semester 1 Parallel) ---
  { id: '8', section: 'DKM1B', courseCode: 'DJJ10013', courseName: 'Engineering Drawing', creditHours: 3, day: 'ISNIN', startTime: '10:00', endTime: '12:00', venue: 'Bengkel Lukisan 2', lecturer: 'Pn. Farah' },
  { id: '9', section: 'DKM1B', courseCode: 'DBM10013', courseName: 'Engineering Mathematics 1', creditHours: 3, day: 'ISNIN', startTime: '14:00', endTime: '16:00', venue: 'BK 03', lecturer: 'Pn. Rohana' },
  { id: '10', section: 'DKM1B', courseCode: 'DBS10012', courseName: 'Engineering Science', creditHours: 2, day: 'SELASA', startTime: '14:00', endTime: '16:00', venue: 'Makmal Sains 1', lecturer: 'Dr. Lim' },
  { id: '11', section: 'DKM1B', courseCode: 'DJJ10022', courseName: 'Mechanical Workshop Practice 1', creditHours: 2, day: 'RABU', startTime: '09:00', endTime: '12:00', venue: 'Bengkel Pemesinan', lecturer: 'En. Fairuz' },
  { id: '12', section: 'DKM1B', courseCode: 'DJJ10033', courseName: 'Workshop Technology', creditHours: 3, day: 'RABU', startTime: '14:00', endTime: '16:00', venue: 'BK 01', lecturer: 'En. Hafiz' },
  { id: '13', section: 'DKM1B', courseCode: 'DUW10012', courseName: 'Occupational Safety & Health', creditHours: 2, day: 'JUMAAT', startTime: '08:30', endTime: '10:30', venue: 'BK 02', lecturer: 'Pn. Siti' },

  // --- DKM1C (Semester 1 Parallel) ---
  { id: '14', section: 'DKM1C', courseCode: 'DJJ10013', courseName: 'Engineering Drawing', creditHours: 3, day: 'SELASA', startTime: '11:00', endTime: '13:00', venue: 'Bengkel Lukisan 1', lecturer: 'En. Azman' },
  { id: '15', section: 'DKM1C', courseCode: 'DBM10013', courseName: 'Engineering Mathematics 1', creditHours: 3, day: 'RABU', startTime: '11:00', endTime: '13:00', venue: 'BK 04', lecturer: 'Pn. Zulaikha' },
  { id: '16', section: 'DKM1C', courseCode: 'DJJ10022', courseName: 'Mechanical Workshop Practice 1', creditHours: 2, day: 'KHAMIS', startTime: '09:00', endTime: '12:00', venue: 'Bengkel Pemesinan', lecturer: 'En. Fairuz' },
  { id: '17', section: 'DKM1C', courseCode: 'DBS10012', courseName: 'Engineering Science', creditHours: 2, day: 'KHAMIS', startTime: '14:00', endTime: '16:00', venue: 'Makmal Sains 2', lecturer: 'Dr. Lim' },
  { id: '18', section: 'DKM1C', courseCode: 'DJJ10033', courseName: 'Workshop Technology', creditHours: 3, day: 'JUMAAT', startTime: '08:00', endTime: '10:00', venue: 'BK 03', lecturer: 'En. Hafiz' },

  // --- DKM2A (Semester 2) ---
  { id: '19', section: 'DKM2A', courseCode: 'DJJ20053', courseName: 'Thermodynamics 1', creditHours: 3, day: 'ISNIN', startTime: '08:00', endTime: '10:00', venue: 'BK 05', lecturer: 'En. Kamaruzaman' },
  { id: '20', section: 'DKM2A', courseCode: 'DBM20023', courseName: 'Engineering Mathematics 2', creditHours: 3, day: 'SELASA', startTime: '08:00', endTime: '10:00', venue: 'BK 02', lecturer: 'Pn. Zulaikha' },
  { id: '21', section: 'DKM2A', courseCode: 'DJJ20063', courseName: 'Electrical Technology', creditHours: 3, day: 'RABU', startTime: '10:00', endTime: '12:00', venue: 'Makmal Elektrik', lecturer: 'En. Shahril' },
  { id: '22', section: 'DKM2A', courseCode: 'DJJ20072', courseName: 'Engineering Materials', creditHours: 2, day: 'KHAMIS', startTime: '11:00', endTime: '13:00', venue: 'BK 04', lecturer: 'Pn. Suhana' },

  // --- DKM2B (Semester 2 Parallel) ---
  { id: '23', section: 'DKM2B', courseCode: 'DJJ20053', courseName: 'Thermodynamics 1', creditHours: 3, day: 'SELASA', startTime: '14:00', endTime: '16:00', venue: 'BK 05', lecturer: 'En. Kamaruzaman' },
  { id: '24', section: 'DKM2B', courseCode: 'DBM20023', courseName: 'Engineering Mathematics 2', creditHours: 3, day: 'RABU', startTime: '08:00', endTime: '10:00', venue: 'BK 03', lecturer: 'Pn. Zulaikha' },

  // --- DKM3A (Student's Senior Base Schedule) ---
  { id: '25', section: 'DKM3A', courseCode: 'DJJ30083', courseName: 'Fluid Mechanics', creditHours: 3, day: 'ISNIN', startTime: '08:00', endTime: '10:00', venue: 'Makmal Bendalir', lecturer: 'Ir. Dr. Tan' },
  { id: '26', section: 'DKM3A', courseCode: 'DJJ30093', courseName: 'Thermodynamics 2', creditHours: 3, day: 'ISNIN', startTime: '10:00', endTime: '12:00', venue: 'BK 05', lecturer: 'Pn. Maznah' },
  { id: '27', section: 'DKM3A', courseCode: 'DBM30033', courseName: 'Engineering Mathematics 3', creditHours: 3, day: 'SELASA', startTime: '10:00', endTime: '12:00', venue: 'BK 04', lecturer: 'En. Khairul' },
  { id: '28', section: 'DKM3A', courseCode: 'DJJ30103', courseName: 'Strength of Materials', creditHours: 3, day: 'RABU', startTime: '08:00', endTime: '11:00', venue: 'Makmal Bahan', lecturer: 'Pn. Suhana' },
  { id: '29', section: 'DKM3A', courseCode: 'DJJ30112', courseName: 'CAD 1', creditHours: 2, day: 'RABU', startTime: '14:00', endTime: '17:00', venue: 'Makmal CAD 2', lecturer: 'En. Nizam' },
  { id: '30', section: 'DKM3A', courseCode: 'DJJ30122', courseName: 'Pneumatics & Hydraulics', creditHours: 2, day: 'KHAMIS', startTime: '09:00', endTime: '11:00', venue: 'Makmal Kawalan', lecturer: 'En. Razali' },

  // --- DKM4A (Semester 4) ---
  { id: '31', section: 'DKM4A', courseCode: 'DJJ40133', courseName: 'Project 1', creditHours: 3, day: 'SELASA', startTime: '08:00', endTime: '11:00', venue: 'Bilik Projek JKM', lecturer: 'Ir. Dr. Tan' },
  { id: '32', section: 'DKM4A', courseCode: 'DJJ40143', courseName: 'Pneumatic & Automation System', creditHours: 3, day: 'KHAMIS', startTime: '14:00', endTime: '16:00', venue: 'Makmal Automation', lecturer: 'En. Razali' },

  // --- DTP (Pembuatan - Manufacturing) ---
  { id: 'dtp_1', section: 'DTP1A', courseCode: 'DJJ10013', courseName: 'Engineering Drawing', creditHours: 3, day: 'ISNIN', startTime: '14:00', endTime: '16:00', venue: 'Bengkel Pembuatan 1', lecturer: 'En. Farhan' },
  { id: 'dtp_2', section: 'DTP1A', courseCode: 'DBM10013', courseName: 'Engineering Mathematics 1', creditHours: 3, day: 'SELASA', startTime: '08:00', endTime: '10:00', venue: 'BK 06', lecturer: 'Pn. Rohana' },
  { id: 'dtp_3', section: 'DTP2A', courseCode: 'DJJ20053', courseName: 'Manufacturing Technology', creditHours: 3, day: 'RABU', startTime: '10:00', endTime: '12:00', venue: 'Makmal CNC', lecturer: 'En. Zulkarnain' },
  { id: 'dtp_4', section: 'DTP3A', courseCode: 'DJJ30112', courseName: 'CAD / CAM 1', creditHours: 2, day: 'KHAMIS', startTime: '10:00', endTime: '12:00', venue: 'Makmal CAD 1', lecturer: 'Pn. Hanim' },

  // --- DAD (Automotif - Automotive) ---
  { id: 'dad_1', section: 'DAD1A', courseCode: 'DJJ10013', courseName: 'Engineering Drawing', creditHours: 3, day: 'SELASA', startTime: '08:00', endTime: '10:00', venue: 'Bengkel Automotif 1', lecturer: 'En. Syafiq' },
  { id: 'dad_2', section: 'DAD1A', courseCode: 'DBM10013', courseName: 'Engineering Mathematics 1', creditHours: 3, day: 'RABU', startTime: '08:00', endTime: '10:00', venue: 'BK 07', lecturer: 'Pn. Rohana' },
  { id: 'dad_3', section: 'DAD2A', courseCode: 'DJJ20053', courseName: 'Automotive Technology', creditHours: 3, day: 'KHAMIS', startTime: '08:00', endTime: '10:00', venue: 'Bengkel Enjin', lecturer: 'En. Hafizuddin' },
  { id: 'dad_4', section: 'DAD3A', courseCode: 'DJJ30083', courseName: 'Engine Management System', creditHours: 3, day: 'JUMAAT', startTime: '08:30', endTime: '10:30', venue: 'Makmal Dyno', lecturer: 'En. Syafiq' },

  // --- DPU (Penyamanan Udara - Refrigeration & Air Conditioning HVAC) ---
  { id: 'dpu_1', section: 'DPU1A', courseCode: 'DJJ10013', courseName: 'Engineering Drawing', creditHours: 3, day: 'RABU', startTime: '10:00', endTime: '12:00', venue: 'Bengkel HVAC', lecturer: 'En. Khairi' },
  { id: 'dpu_2', section: 'DPU1A', courseCode: 'DBM10013', courseName: 'Engineering Mathematics 1', creditHours: 3, day: 'KHAMIS', startTime: '14:00', endTime: '16:00', venue: 'BK 08', lecturer: 'Pn. Rohana' },
  { id: 'dpu_3', section: 'DPU2A', courseCode: 'DJJ20053', courseName: 'Refrigeration Fundamentals', creditHours: 3, day: 'ISNIN', startTime: '10:00', endTime: '12:00', venue: 'Makmal Penyejukan', lecturer: 'En. Amri' },
  { id: 'dpu_4', section: 'DPU3A', courseCode: 'DJJ30093', courseName: 'Air Conditioning System Design', creditHours: 3, day: 'SELASA', startTime: '14:00', endTime: '16:00', venue: 'Makmal HVAC 2', lecturer: 'En. Khairi' }
];

export const SAMPLE_JTMK_DATA: TimetableSlot[] = [
  // --- DIT1A (Semester 1 IT) ---
  { id: 'jtmk_1', section: 'DIT1A', courseCode: 'DFC10033', courseName: 'Problem Solving & Algorithm', creditHours: 3, day: 'ISNIN', startTime: '08:00', endTime: '10:00', venue: 'Makmal Komputer 1', lecturer: 'Pn. Normala' },
  { id: 'jtmk_2', section: 'DIT1A', courseCode: 'DFC10022', courseName: 'Computer Hardware Practice', creditHours: 2, day: 'ISNIN', startTime: '10:00', endTime: '12:00', venue: 'Makmal Hardware', lecturer: 'En. Syahrul' },
  { id: 'jtmk_3', section: 'DIT1A', courseCode: 'DBM10013', courseName: 'Engineering Mathematics 1', creditHours: 3, day: 'SELASA', startTime: '08:00', endTime: '10:00', venue: 'BK 08', lecturer: 'Pn. Rohana' },
  { id: 'jtmk_4', section: 'DIT1A', courseCode: 'DFC20043', courseName: 'Object Oriented Programming (Java)', creditHours: 3, day: 'RABU', startTime: '08:00', endTime: '11:00', venue: 'Makmal Komputer 2', lecturer: 'Dr. Farid' },
  { id: 'jtmk_5', section: 'DIT1A', courseCode: 'DFC10012', courseName: 'Operating Systems', creditHours: 2, day: 'KHAMIS', startTime: '11:00', endTime: '13:00', venue: 'Makmal Komputer 3', lecturer: 'En. Nordin' },

  // --- DIT1B (Semester 1 IT Parallel) ---
  { id: 'jtmk_6', section: 'DIT1B', courseCode: 'DFC10033', courseName: 'Problem Solving & Algorithm', creditHours: 3, day: 'SELASA', startTime: '11:00', endTime: '13:00', venue: 'Makmal Komputer 1', lecturer: 'Pn. Normala' },
  { id: 'jtmk_7', section: 'DIT1B', courseCode: 'DFC20043', courseName: 'Object Oriented Programming (Java)', creditHours: 3, day: 'RABU', startTime: '14:00', endTime: '17:00', venue: 'Makmal Komputer 2', lecturer: 'Dr. Farid' },
  { id: 'jtmk_8', section: 'DIT1B', courseCode: 'DFC10022', courseName: 'Computer Hardware Practice', creditHours: 2, day: 'KHAMIS', startTime: '08:00', endTime: '10:00', venue: 'Makmal Hardware', lecturer: 'En. Syahrul' },

  // --- DIT3A (Semester 3 Base Schedule IT) ---
  { id: 'jtmk_9', section: 'DIT3A', courseCode: 'DFC30053', courseName: 'Web Development Technology', creditHours: 3, day: 'ISNIN', startTime: '08:00', endTime: '11:00', venue: 'Makmal Web 1', lecturer: 'Pn. Faizah' },
  { id: 'jtmk_10', section: 'DIT3A', courseCode: 'DFC30063', courseName: 'Database Management System', creditHours: 3, day: 'ISNIN', startTime: '11:00', endTime: '13:00', venue: 'Makmal DBMS', lecturer: 'En. Amran' },
  { id: 'jtmk_11', section: 'DIT3A', courseCode: 'DFC30073', courseName: 'Data Communications & Networking', creditHours: 3, day: 'SELASA', startTime: '10:00', endTime: '12:00', venue: 'Makmal Rangkaian', lecturer: 'Pn. Halimah' },
  { id: 'jtmk_12', section: 'DIT3A', courseCode: 'DFC30082', courseName: 'System Analysis & Design', creditHours: 2, day: 'RABU', startTime: '08:00', endTime: '10:00', venue: 'BK 09', lecturer: 'Pn. Normala' },
  { id: 'jtmk_13', section: 'DIT3A', courseCode: 'DFC30092', courseName: 'Discrete Mathematics', creditHours: 2, day: 'KHAMIS', startTime: '09:00', endTime: '11:00', venue: 'BK 08', lecturer: 'Pn. Rohana' },

  // --- DIT4A (Semester 4 IT) ---
  { id: 'jtmk_14', section: 'DIT4A', courseCode: 'DFC40073', courseName: 'Cyber Security Essentials', creditHours: 3, day: 'SELASA', startTime: '14:00', endTime: '17:00', venue: 'Makmal Cyber', lecturer: 'En. Nordin' },
  { id: 'jtmk_15', section: 'DIT4A', courseCode: 'DFC40083', courseName: 'Mobile Application Development', creditHours: 3, day: 'KHAMIS', startTime: '14:00', endTime: '17:00', venue: 'Makmal Web 2', lecturer: 'Pn. Faizah' }
];

export const SAMPLE_JP_DATA: TimetableSlot[] = [
  // --- DAT1A (Semester 1 Business) ---
  { id: 'jp_1', section: 'DAT1A', courseCode: 'DPB10013', courseName: 'Financial Accounting 1', creditHours: 3, day: 'ISNIN', startTime: '08:00', endTime: '10:00', venue: 'Bilik Kuliah JP 1', lecturer: 'Pn. Sharifah' },
  { id: 'jp_2', section: 'DAT1A', courseCode: 'DPB10022', courseName: 'Commercial Law', creditHours: 2, day: 'ISNIN', startTime: '10:00', endTime: '12:00', venue: 'BK JP 2', lecturer: 'En. Latif' },
  { id: 'jp_3', section: 'DAT1A', courseCode: 'DPB20023', courseName: 'Business Mathematics', creditHours: 3, day: 'SELASA', startTime: '08:00', endTime: '10:00', venue: 'BK JP 1', lecturer: 'Pn. Haslinda' },
  { id: 'jp_4', section: 'DAT1A', courseCode: 'DPB20033', courseName: 'Microeconomics', creditHours: 3, day: 'RABU', startTime: '08:00', endTime: '10:00', venue: 'Dewan Kuliah JP', lecturer: 'Dr. Rahim' },

  // --- DAT1B (Semester 1 Business Parallel) ---
  { id: 'jp_5', section: 'DAT1B', courseCode: 'DPB10013', courseName: 'Financial Accounting 1', creditHours: 3, day: 'SELASA', startTime: '11:00', endTime: '13:00', venue: 'BK JP 2', lecturer: 'Pn. Sharifah' },
  { id: 'jp_6', section: 'DAT1B', courseCode: 'DPB20023', courseName: 'Business Mathematics', creditHours: 3, day: 'RABU', startTime: '14:00', endTime: '16:00', venue: 'BK JP 1', lecturer: 'Pn. Haslinda' },

  // --- DAT3A (Semester 3 Base Schedule Business) ---
  { id: 'jp_7', section: 'DAT3A', courseCode: 'DPB30033', courseName: 'Macroeconomics', creditHours: 3, day: 'ISNIN', startTime: '08:00', endTime: '10:00', venue: 'Dewan Kuliah JP', lecturer: 'Dr. Rahim' },
  { id: 'jp_8', section: 'DAT3A', courseCode: 'DPB30043', courseName: 'Company Law & Practice', creditHours: 3, day: 'ISNIN', startTime: '10:00', endTime: '12:00', venue: 'BK JP 3', lecturer: 'En. Latif' },
  { id: 'jp_9', section: 'DAT3A', courseCode: 'DPB30053', courseName: 'Management Accounting 1', creditHours: 3, day: 'SELASA', startTime: '10:00', endTime: '12:00', venue: 'BK JP 1', lecturer: 'Pn. Sharifah' },
  { id: 'jp_10', section: 'DAT3A', courseCode: 'DPB30062', courseName: 'Business Taxation 1', creditHours: 2, day: 'RABU', startTime: '10:00', endTime: '12:00', venue: 'BK JP 2', lecturer: 'Pn. Azlina' },
  { id: 'jp_11', section: 'DAT3A', courseCode: 'DPB30072', courseName: 'Auditing 1', creditHours: 2, day: 'KHAMIS', startTime: '09:00', endTime: '11:00', venue: 'BK JP 3', lecturer: 'En. Zulkifli' }
];

export const SAMPLE_JKE_DATA: TimetableSlot[] = [
  // --- DEP1A (Semester 1 Electrical) ---
  { id: 'jke_1', section: 'DEP1A', courseCode: 'DEE10013', courseName: 'Circuit Theory 1', creditHours: 3, day: 'ISNIN', startTime: '08:00', endTime: '10:00', venue: 'Makmal Elektrik 1', lecturer: 'Ir. Ahmad' },
  { id: 'jke_2', section: 'DEP1A', courseCode: 'DEE10022', courseName: 'Electrical Workshop Practice', creditHours: 2, day: 'ISNIN', startTime: '10:00', endTime: '13:00', venue: 'Bengkel Pendawaian', lecturer: 'En. Shah' },
  { id: 'jke_3', section: 'DEP1A', courseCode: 'DBM10013', courseName: 'Engineering Mathematics 1', creditHours: 3, day: 'SELASA', startTime: '08:00', endTime: '10:00', venue: 'BK JKE 1', lecturer: 'Pn. Rohana' },
  { id: 'jke_4', section: 'DEP1A', courseCode: 'DEE20023', courseName: 'Semiconductor Devices', creditHours: 3, day: 'RABU', startTime: '08:00', endTime: '10:00', venue: 'Makmal Elektronik', lecturer: 'Pn. Marlina' },

  // --- DEP1B (Semester 1 Electrical Parallel) ---
  { id: 'jke_5', section: 'DEP1B', courseCode: 'DEE10013', courseName: 'Circuit Theory 1', creditHours: 3, day: 'SELASA', startTime: '11:00', endTime: '13:00', venue: 'Makmal Elektrik 2', lecturer: 'Ir. Ahmad' },
  { id: 'jke_6', section: 'DEP1B', courseCode: 'DEE20023', courseName: 'Semiconductor Devices', creditHours: 3, day: 'RABU', startTime: '14:00', endTime: '16:00', venue: 'Makmal Elektronik', lecturer: 'Pn. Marlina' },

  // --- DEP3A (Semester 3 Base Schedule Electrical) ---
  { id: 'jke_7', section: 'DEP3A', courseCode: 'DEE30033', courseName: 'Microcontroller Systems', creditHours: 3, day: 'ISNIN', startTime: '08:00', endTime: '11:00', venue: 'Makmal Mikro', lecturer: 'Dr. Iskandar' },
  { id: 'jke_8', section: 'DEP3A', courseCode: 'DEE30043', courseName: 'Power Electronics', creditHours: 3, day: 'ISNIN', startTime: '11:00', endTime: '13:00', venue: 'Makmal Kuasa', lecturer: 'Pn. Noraini' },
  { id: 'jke_9', section: 'DEP3A', courseCode: 'DBM30033', courseName: 'Engineering Mathematics 3', creditHours: 3, day: 'SELASA', startTime: '10:00', endTime: '12:00', venue: 'BK JKE 2', lecturer: 'En. Khairul' },
  { id: 'jke_10', section: 'DEP3A', courseCode: 'DEE30052', courseName: 'Telecommunication Principles', creditHours: 2, day: 'RABU', startTime: '10:00', endTime: '12:00', venue: 'Makmal Telematrik', lecturer: 'En. Hisham' },
  { id: 'jke_11', section: 'DEP3A', courseCode: 'DEE30062', courseName: 'Control Engineering', creditHours: 2, day: 'KHAMIS', startTime: '09:00', endTime: '11:00', venue: 'Makmal Kawalan JKE', lecturer: 'Ir. Ahmad' }
];

export const DEPARTMENT_DATASETS: DepartmentDataset[] = [
  {
    id: 'dept_jkm',
    code: 'JKM',
    name: 'Jabatan Kejuruteraan Mekanikal',
    description: 'Mechanical Engineering (DKM) — Includes workshop labs, CAD, Thermodynamics, Fluid Mechanics & Workshop Technology.',
    studentProfile: {
      name: 'MUHAMMAD ADAM BIN ROSLI',
      matrixNo: '05DKM22F1042',
      icNo: '040512-08-5431',
      program: 'Diploma Kejuruteraan Mekanikal (DKM)',
      session: 'Sesi 1 2026/2027',
      semester: 3,
      baseSection: 'DKM3A',
      paName: 'Ir. Dr. Tan Chee Keong',
      email: 'adam.rosli@student.politeknik.edu.my',
      phone: '017-8823910'
    },
    slots: SAMPLE_JKM_DATA
  },
  {
    id: 'dept_jtmk',
    code: 'JTMK',
    name: 'Jabatan Teknologi Maklumat & Komunikasi',
    description: 'IT & Software Engineering (DIT) — Includes Web Dev, OOP Java, DBMS, Computer Hardware, System Analysis & Cyber Security.',
    studentProfile: {
      name: 'NUR AMIRA BINTI ISMAIL',
      matrixNo: '05DIT22F2018',
      icNo: '040819-03-6102',
      program: 'Diploma Teknologi Maklumat (DIT)',
      session: 'Sesi 1 2026/2027',
      semester: 3,
      baseSection: 'DIT3A',
      paName: 'Pn. Faizah Binti Mokhtar',
      email: 'amira.ismail@student.politeknik.edu.my',
      phone: '012-9981234'
    },
    slots: SAMPLE_JTMK_DATA
  },
  {
    id: 'dept_jp',
    code: 'JP',
    name: 'Jabatan Perdagangan (Business Studies)',
    description: 'Accountancy & Commerce (DAT) — Includes Financial Accounting, Business Law, Macroeconomics, Auditing & Taxation.',
    studentProfile: {
      name: 'CHENG WEI JIE',
      matrixNo: '05DAT22F3055',
      icNo: '040215-07-5519',
      program: 'Diploma Akauntansi (DAT)',
      session: 'Sesi 1 2026/2027',
      semester: 3,
      baseSection: 'DAT3A',
      paName: 'Pn. Sharifah Binti Ahmad',
      email: 'cheng.weijie@student.politeknik.edu.my',
      phone: '016-4432098'
    },
    slots: SAMPLE_JP_DATA
  },
  {
    id: 'dept_jke',
    code: 'JKE',
    name: 'Jabatan Kejuruteraan Elektrik',
    description: 'Electrical & Electronic Engineering (DEP) — Includes Microcontrollers, Circuit Theory, Power Electronics & Telecommunications.',
    studentProfile: {
      name: 'KAVIN A/L KUMARAN',
      matrixNo: '05DEP22F1090',
      icNo: '041103-10-5887',
      program: 'Diploma Kejuruteraan Elektrik (DEP)',
      session: 'Sesi 1 2026/2027',
      semester: 3,
      baseSection: 'DEP3A',
      paName: 'Ir. Ahmad Bin Mustafa',
      email: 'kavin.kumaran@student.politeknik.edu.my',
      phone: '013-7719023'
    },
    slots: SAMPLE_JKE_DATA
  }
];

export const SAMPLE_DEPARTMENT_DATASETS: Record<string, TimetableSlot[]> = {
  JKM: SAMPLE_JKM_DATA,
  JTMK: SAMPLE_JTMK_DATA,
  JP: SAMPLE_JP_DATA,
  JKE: SAMPLE_JKE_DATA
};

