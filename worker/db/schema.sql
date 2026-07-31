-- ============================================================
-- JKM Timetables HUB - D1 Database Schema
-- ============================================================

-- Users table (replaces Firebase Auth + Firestore users)
CREATE TABLE IF NOT EXISTS users (
  id            TEXT PRIMARY KEY,
  email         TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  name          TEXT NOT NULL,
  matrix_no     TEXT,
  role          TEXT NOT NULL DEFAULT 'STUDENT', -- STUDENT, ADVISOR, ADMIN
  program       TEXT,
  session       TEXT,
  semester      INTEGER,
  base_section  TEXT,
  pa_name       TEXT,
  phone         TEXT,
  department    TEXT,
  office_location TEXT,
  assigned_section TEXT,
  consultation_hours TEXT, -- JSON array
  created_at    TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at    TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Master timetable slots
CREATE TABLE IF NOT EXISTS master_slots (
  id            TEXT PRIMARY KEY,
  section       TEXT NOT NULL,
  course_code   TEXT NOT NULL,
  course_name   TEXT NOT NULL,
  credit_hours  INTEGER DEFAULT 3,
  day           TEXT NOT NULL, -- ISNIN, SELASA, RABU, KHAMIS, JUMAAT, SABTU
  start_time    TEXT NOT NULL, -- HH:MM
  end_time      TEXT NOT NULL, -- HH:MM
  venue         TEXT NOT NULL,
  lecturer      TEXT,
  created_at    TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX idx_slots_section ON master_slots(section);
CREATE INDEX idx_slots_course ON master_slots(course_code);
CREATE INDEX idx_slots_day ON master_slots(day);

-- Admin notifications
CREATE TABLE IF NOT EXISTS notifications (
  id            TEXT PRIMARY KEY,
  title         TEXT NOT NULL,
  message       TEXT NOT NULL,
  type          TEXT NOT NULL DEFAULT 'info', -- deadline, update, warning, info
  date          TEXT NOT NULL,
  active        INTEGER NOT NULL DEFAULT 1,
  created_at    TEXT NOT NULL DEFAULT (datetime('now'))
);

-- User feedback
CREATE TABLE IF NOT EXISTS feedback (
  id            TEXT PRIMARY KEY,
  user_id       TEXT NOT NULL,
  name          TEXT NOT NULL,
  email         TEXT,
  category      TEXT NOT NULL, -- Data Inaccuracy, Resolver Bug, UI/UX Suggestion, Feature Request, General Comment
  course_code   TEXT,
  rating        INTEGER NOT NULL DEFAULT 3,
  message       TEXT NOT NULL,
  date          TEXT NOT NULL,
  status        TEXT NOT NULL DEFAULT 'New', -- New, Under Review, Resolved
  created_at    TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Course registrations (PA approval slips)
CREATE TABLE IF NOT EXISTS registrations (
  id            TEXT PRIMARY KEY,
  student_id    TEXT NOT NULL,
  student_name  TEXT NOT NULL,
  matrix_no     TEXT NOT NULL,
  base_section  TEXT NOT NULL,
  repeat_courses TEXT NOT NULL, -- JSON array
  selected_addons TEXT NOT NULL, -- JSON object: courseCode -> section
  total_credits INTEGER NOT NULL DEFAULT 0,
  status        TEXT NOT NULL DEFAULT 'PENDING', -- PENDING, APPROVED, REJECTED
  timestamp     TEXT NOT NULL,
  advisor_notes TEXT,
  advisor_name  TEXT,
  created_at    TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (student_id) REFERENCES users(id)
);

CREATE INDEX idx_reg_student ON registrations(student_id);
CREATE INDEX idx_reg_status ON registrations(status);

-- Saved drafts
CREATE TABLE IF NOT EXISTS saved_drafts (
  id            TEXT PRIMARY KEY,
  user_id       TEXT NOT NULL,
  title         TEXT NOT NULL,
  timestamp     TEXT NOT NULL,
  base_section  TEXT NOT NULL,
  repeat_courses TEXT NOT NULL, -- JSON array
  selected_addons TEXT NOT NULL, -- JSON object
  created_at    TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE INDEX idx_drafts_user ON saved_drafts(user_id);
