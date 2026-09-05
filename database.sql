-- Users table (Firebase Auth UID / Supabase Auth)
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  uid TEXT NOT NULL UNIQUE,
  email TEXT NOT NULL,
  name TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Class Info metadata
CREATE TABLE IF NOT EXISTS class_info (
  id TEXT PRIMARY KEY,
  user_id TEXT,
  class_name TEXT NOT NULL,
  academic_year TEXT NOT NULL,
  semester TEXT NOT NULL,
  homeroom_teacher TEXT NOT NULL,
  homeroom_teacher_nip TEXT,
  school_name TEXT NOT NULL,
  school_logo TEXT,
  headmaster_name TEXT,
  headmaster_nip TEXT,
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Students
CREATE TABLE IF NOT EXISTS students (
  id TEXT PRIMARY KEY,
  user_id TEXT,
  name TEXT NOT NULL,
  nis TEXT NOT NULL,
  nisn TEXT NOT NULL,
  gender TEXT NOT NULL,
  class_name TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'Aktif',
  avatar_url TEXT,
  birth_place TEXT,
  birth_date TEXT,
  address TEXT,
  phone TEXT,
  parent_name TEXT,
  parent_mother_name TEXT,
  parent_phone TEXT,
  parent_job TEXT,
  blood_type TEXT,
  health_notes TEXT,
  special_notes TEXT,
  created_at TEXT NOT NULL
);

-- Attendance records
CREATE TABLE IF NOT EXISTS attendance (
  id TEXT PRIMARY KEY,
  student_id TEXT NOT NULL,
  date TEXT NOT NULL,
  time TEXT,
  status TEXT NOT NULL,
  note TEXT,
  created_at TEXT NOT NULL
);

-- Grades
CREATE TABLE IF NOT EXISTS grades (
  id TEXT PRIMARY KEY,
  student_id TEXT NOT NULL,
  subject TEXT NOT NULL,
  assessment_type TEXT NOT NULL,
  score INTEGER NOT NULL,
  date TEXT NOT NULL,
  notes TEXT,
  created_at TEXT NOT NULL
);

-- Lesson Schedule
CREATE TABLE IF NOT EXISTS schedules (
  id TEXT PRIMARY KEY,
  day TEXT NOT NULL,
  subject TEXT NOT NULL,
  teacher TEXT NOT NULL,
  start_time TEXT NOT NULL,
  end_time TEXT NOT NULL,
  room TEXT NOT NULL
);

-- Duty Schedule
CREATE TABLE IF NOT EXISTS duty_schedules (
  id TEXT PRIMARY KEY,
  group_name TEXT NOT NULL,
  day TEXT NOT NULL,
  member_student_ids TEXT NOT NULL,
  tasks TEXT NOT NULL
);

-- Cash Transactions
CREATE TABLE IF NOT EXISTS cash_transactions (
  id TEXT PRIMARY KEY,
  type TEXT NOT NULL,
  amount INTEGER NOT NULL,
  date TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT,
  created_at TEXT NOT NULL
);

-- Student Payments
CREATE TABLE IF NOT EXISTS payments (
  id TEXT PRIMARY KEY,
  student_id TEXT NOT NULL,
  fee_name TEXT NOT NULL,
  amount INTEGER NOT NULL,
  status TEXT NOT NULL,
  date TEXT,
  note TEXT,
  created_at TEXT NOT NULL
);

-- Student Notes & Counseling
CREATE TABLE IF NOT EXISTS student_notes (
  id TEXT PRIMARY KEY,
  student_id TEXT NOT NULL,
  category TEXT NOT NULL,
  note TEXT NOT NULL,
  status TEXT NOT NULL,
  date TEXT NOT NULL,
  follow_up_plan TEXT,
  created_at TEXT NOT NULL
);
