-- ============================================================
-- JKM Timetables HUB - D1 Database Schema (Optimized v2)
-- Normalized, indexed, production-ready relational design
-- ============================================================

PRAGMA foreign_keys = ON;

-- ============================================================
-- 1. REFERENCE TABLES
-- ============================================================

-- Courses master list (normalized out of master_slots)
CREATE TABLE IF NOT EXISTS courses (
  code         TEXT PRIMARY KEY,
  name         TEXT NOT NULL,
  credit_hours INTEGER NOT NULL DEFAULT 3
);

-- Academic sections/groups
CREATE TABLE IF NOT EXISTS sections (
  code        TEXT PRIMARY KEY,              -- e.g. 'DKM3A'
  department  TEXT NOT NULL DEFAULT 'JKM',   -- JKM, JTMK, JP, JKE
  semester    INTEGER NOT NULL DEFAULT 1
);

-- ============================================================
-- 2. USERS & ROLES
-- ============================================================

-- Base user table (shared columns only)
CREATE TABLE IF NOT EXISTS users (
  id            TEXT PRIMARY KEY,
  email         TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  name          TEXT NOT NULL,
  role          TEXT NOT NULL DEFAULT 'STUDENT' CHECK(role IN ('STUDENT','ADVISOR','ADMIN')),
  phone         TEXT,
  created_at    INTEGER NOT NULL DEFAULT (unixepoch()),
  updated_at    INTEGER NOT NULL DEFAULT (unixepoch())
);

-- Student-specific profile
CREATE TABLE IF NOT EXISTS students (
  user_id      TEXT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  matrix_no    TEXT UNIQUE,
  program      TEXT NOT NULL DEFAULT 'DIPLOMA IN MECHANICAL ENGINEERING (DKM)',
  session      TEXT,
  semester     INTEGER NOT NULL DEFAULT 1,
  base_section TEXT REFERENCES sections(code),
  pa_name      TEXT
);

-- Advisor-specific profile
CREATE TABLE IF NOT EXISTS advisors (
  user_id             TEXT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  department          TEXT NOT NULL DEFAULT 'JKM',
  office_location     TEXT,
  assigned_section    TEXT REFERENCES sections(code),
  consultation_hours  TEXT  -- JSON array of strings
);

-- ============================================================
-- 3. TIMETABLE SLOTS
-- ============================================================

CREATE TABLE IF NOT EXISTS master_slots (
  id           TEXT PRIMARY KEY,
  section      TEXT NOT NULL REFERENCES sections(code),
  course_code  TEXT NOT NULL REFERENCES courses(code),
  day          INTEGER NOT NULL CHECK(day BETWEEN 0 AND 5),  -- 0=ISNIN..5=SABTU
  start_time   TEXT NOT NULL,    -- HH:MM
  end_time     TEXT NOT NULL,    -- HH:MM
  venue        TEXT NOT NULL,
  lecturer     TEXT,
  created_at   INTEGER NOT NULL DEFAULT (unixepoch())
);

-- Composite index: core clash-analysis query path
CREATE INDEX IF NOT EXISTS idx_slots_clash
  ON master_slots(section, day, start_time, end_time);

-- Lookup by course code across all sections
CREATE INDEX IF NOT EXISTS idx_slots_course
  ON master_slots(course_code);

-- ============================================================
-- 4. NOTIFICATIONS
-- ============================================================

CREATE TABLE IF NOT EXISTS notifications (
  id         TEXT PRIMARY KEY,
  title      TEXT NOT NULL,
  message    TEXT NOT NULL,
  type       TEXT NOT NULL DEFAULT 'info' CHECK(type IN ('deadline','update','warning','info')),
  date       TEXT NOT NULL,
  active     INTEGER NOT NULL DEFAULT 1,
  created_at INTEGER NOT NULL DEFAULT (unixepoch())
);

CREATE INDEX IF NOT EXISTS idx_notif_active ON notifications(active, created_at);

-- ============================================================
-- 5. FEEDBACK
-- ============================================================

CREATE TABLE IF NOT EXISTS feedback (
  id          TEXT PRIMARY KEY,
  user_id     TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  category    TEXT NOT NULL CHECK(category IN ('Data Inaccuracy','Resolver Bug','UI/UX Suggestion','Feature Request','General Comment')),
  course_code TEXT REFERENCES courses(code),
  rating      INTEGER NOT NULL DEFAULT 3 CHECK(rating BETWEEN 1 AND 5),
  message     TEXT NOT NULL,
  status      TEXT NOT NULL DEFAULT 'New' CHECK(status IN ('New','Under Review','Resolved')),
  created_at  INTEGER NOT NULL DEFAULT (unixepoch())
);

CREATE INDEX IF NOT EXISTS idx_feedback_user   ON feedback(user_id);
CREATE INDEX IF NOT EXISTS idx_feedback_status ON feedback(status);

-- ============================================================
-- 6. COURSE REGISTRATIONS (PA Approval Slips)
-- ============================================================

CREATE TABLE IF NOT EXISTS registrations (
  id            TEXT PRIMARY KEY,
  student_id    TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  base_section  TEXT NOT NULL REFERENCES sections(code),
  total_credits INTEGER NOT NULL DEFAULT 0,
  status        TEXT NOT NULL DEFAULT 'PENDING' CHECK(status IN ('PENDING','APPROVED','REJECTED')),
  advisor_notes TEXT,
  advisor_id    TEXT REFERENCES users(id),
  created_at    INTEGER NOT NULL DEFAULT (unixepoch())
);

CREATE INDEX IF NOT EXISTS idx_reg_student ON registrations(student_id);
CREATE INDEX IF NOT EXISTS idx_reg_status  ON registrations(status);
CREATE INDEX IF NOT EXISTS idx_reg_created ON registrations(created_at);

-- Junction table: repeat courses selected per registration
CREATE TABLE IF NOT EXISTS registration_items (
  id               TEXT PRIMARY KEY,
  registration_id  TEXT NOT NULL REFERENCES registrations(id) ON DELETE CASCADE,
  course_code      TEXT NOT NULL REFERENCES courses(code),
  selected_section TEXT NOT NULL REFERENCES sections(code),
  UNIQUE(registration_id, course_code)
);

CREATE INDEX IF NOT EXISTS idx_regitems_reg    ON registration_items(registration_id);
CREATE INDEX IF NOT EXISTS idx_regitems_course ON registration_items(course_code);

-- ============================================================
-- 7. SAVED DRAFTS
-- ============================================================

CREATE TABLE IF NOT EXISTS saved_drafts (
  id              TEXT PRIMARY KEY,
  user_id         TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title           TEXT NOT NULL,
  base_section    TEXT NOT NULL,
  repeat_courses  TEXT NOT NULL,   -- JSON array
  selected_addons TEXT NOT NULL,   -- JSON object
  created_at      INTEGER NOT NULL DEFAULT (unixepoch())
);

CREATE INDEX IF NOT EXISTS idx_drafts_user ON saved_drafts(user_id);
