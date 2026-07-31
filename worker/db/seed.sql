-- Seed data for JKM Timetables
-- Run after schema.sql

-- Admin user (password: admin123)
INSERT INTO users (id, email, password_hash, name, role, department, created_at, updated_at)
VALUES ('admin-001', 'admin@jkm.politeknik.edu.my', '$2a$10$placeholder_hash_admin', 'JKM Administrator', 'ADMIN', 'JKM', datetime('now'), datetime('now'));

-- Sample advisor
INSERT INTO users (id, email, password_hash, name, role, department, office_location, assigned_section, consultation_hours, created_at, updated_at)
VALUES ('advisor-001', 'tan.ckeong@jkm.politeknik.edu.my', '$2a$10$placeholder_hash_advisor', 'Ir. Dr. Tan Chee Keong', 'ADVISOR', 'JKM', 'Bilik Pensyarah JKM, Aras 2', 'DKM3A', '["ISNIN 10:00-12:00","RABU 14:00-16:00"]', datetime('now'), datetime('now'));

-- Sample student
INSERT INTO users (id, email, password_hash, name, matrix_no, role, program, session, semester, base_section, pa_name, phone, created_at, updated_at)
VALUES ('student-001', 'adam.rosli@student.politeknik.edu.my', '$2a$10$placeholder_hash_student', 'MUHAMMAD ADAM BIN ROSLI', '05DKM22F1042', 'STUDENT', 'DIPLOMA IN MECHANICAL ENGINEERING (DKM)', 'Sesi 1 2026/2027', 3, 'DKM3A', 'Ir. Dr. Tan Chee Keong', '017-8823910', datetime('now'), datetime('now'));

-- Sample notifications
INSERT INTO notifications (id, title, message, type, date, active, created_at) VALUES
('n1', 'Tarikh Akhir Pendaftaran Kursus Mengulang', 'Permohonan pendaftaran kursus mengulang (Borang PA JKM) hendaklah diserahkan sebelum 15 Ogos 2026 jam 5:00 PM ke Bilik Pensyarah JKM.', 'deadline', '15 Ogos 2026', 1, datetime('now')),
('n2', 'Kemaskini Bilik Kuliah & Bengkel', 'Bengkel Pemesinan 2 dan Makmal CAD 1 telah dikemaskini lokasinya di Blok B. Sila semak jadual terbaharu.', 'update', '28 Julai 2026', 1, datetime('now'));

-- Sample DKM1A slots
INSERT INTO master_slots (id, section, course_code, course_name, credit_hours, day, start_time, end_time, venue, lecturer, created_at) VALUES
('s1',  'DKM1A', 'DJJ10013', 'Engineering Drawing', 3, 'ISNIN',  '08:00', '10:00', 'Bengkel Lukisan 1', 'En. Azman', datetime('now')),
('s2',  'DKM1A', 'DBM10013', 'Engineering Mathematics 1', 3, 'ISNIN',  '10:00', '12:00', 'BK 01', 'Pn. Rohana', datetime('now')),
('s3',  'DKM1A', 'DBS10012', 'Engineering Science', 2, 'SELASA', '08:00', '10:00', 'Makmal Sains 2', 'Dr. Lim', datetime('now')),
('s4',  'DKM1A', 'DJJ10022', 'Mechanical Workshop Practice 1', 2, 'SELASA', '10:00', '13:00', 'Bengkel Pemesinan', 'En. Fairuz', datetime('now')),
('s5',  'DKM1A', 'DUW10012', 'Occupational Safety & Health', 2, 'RABU',   '08:00', '10:00', 'BK 02', 'Pn. Siti', datetime('now')),
('s6',  'DKM1A', 'DJJ10033', 'Workshop Technology', 3, 'KHAMIS', '08:00', '10:00', 'BK 01', 'En. Hafiz', datetime('now')),
('s7',  'DKM1A', 'MPU21032', 'Penghayatan Etika dan Peradaban', 2, 'KHAMIS', '14:00', '16:00', 'DK 02', 'Ustaz Razak', datetime('now')),
-- DKM1B
('s8',  'DKM1B', 'DJJ10013', 'Engineering Drawing', 3, 'ISNIN',  '10:00', '12:00', 'Bengkel Lukisan 2', 'Pn. Farah', datetime('now')),
('s9',  'DKM1B', 'DBM10013', 'Engineering Mathematics 1', 3, 'ISNIN',  '14:00', '16:00', 'BK 03', 'Pn. Rohana', datetime('now')),
('s10', 'DKM1B', 'DBS10012', 'Engineering Science', 2, 'SELASA', '14:00', '16:00', 'Makmal Sains 1', 'Dr. Lim', datetime('now')),
('s11', 'DKM1B', 'DJJ10022', 'Mechanical Workshop Practice 1', 2, 'RABU',   '09:00', '12:00', 'Bengkel Pemesinan', 'En. Fairuz', datetime('now')),
('s12', 'DKM1B', 'DJJ10033', 'Workshop Technology', 3, 'RABU',   '14:00', '16:00', 'BK 01', 'En. Hafiz', datetime('now'));
