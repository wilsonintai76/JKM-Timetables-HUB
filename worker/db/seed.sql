-- ============================================================
-- JKM Timetables HUB - Seed Data (Optimized v2)
-- ============================================================

-- Reference: Course catalog
INSERT INTO courses (code, name, credit_hours) VALUES
('DJJ10013', 'Engineering Drawing', 3),
('DBM10013', 'Engineering Mathematics 1', 3),
('DBS10012', 'Engineering Science', 2),
('DJJ10022', 'Mechanical Workshop Practice 1', 2),
('DUW10012', 'Occupational Safety & Health', 2),
('DJJ10033', 'Workshop Technology', 3),
('MPU21032', 'Penghayatan Etika dan Peradaban', 2);

-- Reference: Sections
INSERT INTO sections (code, department, semester) VALUES
('DKM1A', 'JKM', 1),
('DKM1B', 'JKM', 1),
('DKM3A', 'JKM', 3);

-- Admin user
INSERT INTO users (id, email, password_hash, name, role) VALUES
('admin-001', 'admin@jkm.politeknik.edu.my', 'PLACEHOLDER_HASH_ADMIN', 'JKM Administrator', 'ADMIN');

-- Advisor
INSERT INTO users (id, email, password_hash, name, role, phone) VALUES
('advisor-001', 'tan.ckeong@jkm.politeknik.edu.my', 'PLACEHOLDER_HASH_ADVISOR', 'Ir. Dr. Tan Chee Keong', 'ADVISOR', '012-3456789');

INSERT INTO advisors (user_id, department, office_location, assigned_section, consultation_hours) VALUES
('advisor-001', 'JKM', 'Bilik Pensyarah JKM, Aras 2', 'DKM3A', '["ISNIN 10:00-12:00","RABU 14:00-16:00"]');

-- Student
INSERT INTO users (id, email, password_hash, name, role, phone) VALUES
('student-001', 'adam.rosli@student.politeknik.edu.my', 'PLACEHOLDER_HASH_STUDENT', 'MUHAMMAD ADAM BIN ROSLI', 'STUDENT', '017-8823910');

INSERT INTO students (user_id, matrix_no, program, session, semester, base_section, pa_name) VALUES
('student-001', '05DKM22F1042', 'DIPLOMA IN MECHANICAL ENGINEERING (DKM)', 'Sesi 1 2026/2027', 3, 'DKM3A', 'Ir. Dr. Tan Chee Keong');

-- Notifications
INSERT INTO notifications (id, title, message, type, date, active) VALUES
('n1', 'Tarikh Akhir Pendaftaran Kursus Mengulang', 'Permohonan pendaftaran kursus mengulang (Borang PA JKM) hendaklah diserahkan sebelum 15 Ogos 2026 jam 5:00 PM ke Bilik Pensyarah JKM.', 'deadline', '15 Ogos 2026', 1),
('n2', 'Kemaskini Bilik Kuliah & Bengkel', 'Bengkel Pemesinan 2 dan Makmal CAD 1 telah dikemaskini lokasinya di Blok B. Sila semak jadual terbaharu.', 'update', '28 Julai 2026', 1);

-- Timetable slots (day: 0=ISNIN, 1=SELASA, 2=RABU, 3=KHAMIS, 4=JUMAAT, 5=SABTU)
INSERT INTO master_slots (id, section, course_code, day, start_time, end_time, venue, lecturer) VALUES
-- DKM1A
('s1',  'DKM1A', 'DJJ10013', 0, '08:00', '10:00', 'Bengkel Lukisan 1', 'En. Azman'),
('s2',  'DKM1A', 'DBM10013', 0, '10:00', '12:00', 'BK 01', 'Pn. Rohana'),
('s3',  'DKM1A', 'DBS10012', 1, '08:00', '10:00', 'Makmal Sains 2', 'Dr. Lim'),
('s4',  'DKM1A', 'DJJ10022', 1, '10:00', '13:00', 'Bengkel Pemesinan', 'En. Fairuz'),
('s5',  'DKM1A', 'DUW10012', 2, '08:00', '10:00', 'BK 02', 'Pn. Siti'),
('s6',  'DKM1A', 'DJJ10033', 3, '08:00', '10:00', 'BK 01', 'En. Hafiz'),
('s7',  'DKM1A', 'MPU21032', 3, '14:00', '16:00', 'DK 02', 'Ustaz Razak'),
-- DKM1B
('s8',  'DKM1B', 'DJJ10013', 0, '10:00', '12:00', 'Bengkel Lukisan 2', 'Pn. Farah'),
('s9',  'DKM1B', 'DBM10013', 0, '14:00', '16:00', 'BK 03', 'Pn. Rohana'),
('s10', 'DKM1B', 'DBS10012', 1, '14:00', '16:00', 'Makmal Sains 1', 'Dr. Lim'),
('s11', 'DKM1B', 'DJJ10022', 2, '09:00', '12:00', 'Bengkel Pemesinan', 'En. Fairuz'),
('s12', 'DKM1B', 'DJJ10033', 2, '14:00', '16:00', 'BK 01', 'En. Hafiz');

