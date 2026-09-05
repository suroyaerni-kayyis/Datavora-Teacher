import { createClient, SupabaseClient } from '@supabase/supabase-js';

const STORAGE_URL_KEY = 'walikelas_supabase_url';
const STORAGE_KEY_KEY = 'walikelas_supabase_anon_key';

// Default Supabase project URL or fallback
const metaEnv = typeof import.meta !== 'undefined' ? (import.meta as any).env : {};
const procEnv = typeof process !== 'undefined' ? process.env : {};

const DEFAULT_SUPABASE_URL = 
  metaEnv?.VITE_SUPABASE_URL || 
  procEnv?.SUPABASE_URL || 
  'https://mock-app.supabase.co';

const DEFAULT_SUPABASE_ANON_KEY = 
  metaEnv?.VITE_SUPABASE_ANON_KEY || 
  procEnv?.SUPABASE_ANON_KEY || 
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.mock-key';

export function getSupabaseCredentials(): { url: string; anonKey: string; isCustom: boolean } {
  const savedUrl = typeof window !== 'undefined' ? localStorage.getItem(STORAGE_URL_KEY) : null;
  const savedKey = typeof window !== 'undefined' ? localStorage.getItem(STORAGE_KEY_KEY) : null;

  if (savedUrl && savedKey) {
    return { url: savedUrl, anonKey: savedKey, isCustom: true };
  }

  const envUrl = metaEnv?.VITE_SUPABASE_URL || '';
  const envKey = metaEnv?.VITE_SUPABASE_ANON_KEY || '';

  if (envUrl && envKey) {
    return { url: envUrl, anonKey: envKey, isCustom: true };
  }

  return { url: DEFAULT_SUPABASE_URL, anonKey: DEFAULT_SUPABASE_ANON_KEY, isCustom: false };
}

export function saveSupabaseCredentials(url: string, anonKey: string): void {
  if (typeof window !== 'undefined') {
    if (url.trim() && anonKey.trim()) {
      localStorage.setItem(STORAGE_URL_KEY, url.trim());
      localStorage.setItem(STORAGE_KEY_KEY, anonKey.trim());
    } else {
      localStorage.removeItem(STORAGE_URL_KEY);
      localStorage.removeItem(STORAGE_KEY_KEY);
    }
    // Reinitialize client
    reinitializeSupabase();
  }
}

let supabaseInstance: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient {
  if (!supabaseInstance) {
    const { url, anonKey } = getSupabaseCredentials();
    supabaseInstance = createClient(url, anonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
    });
  }
  return supabaseInstance;
}

export function reinitializeSupabase(): SupabaseClient {
  const { url, anonKey } = getSupabaseCredentials();
  supabaseInstance = createClient(url, anonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
    },
  });
  return supabaseInstance;
}

export const supabase = getSupabase();

// Test connection to Supabase
export async function testSupabaseConnection(url?: string, anonKey?: string): Promise<{ success: boolean; message: string }> {
  try {
    const client = url && anonKey 
      ? createClient(url, anonKey)
      : getSupabase();

    // Check auth endpoint or health query
    const { data, error } = await client.auth.getSession();
    if (error && !error.message.includes('Auth session missing')) {
      return { success: false, message: error.message };
    }
    return { success: true, message: 'Berhasil terhubung ke Supabase!' };
  } catch (err: any) {
    return { success: false, message: err.message || 'Gagal terhubung ke URL Supabase' };
  }
}

// SQL Schema for Supabase SQL Editor
export const SUPABASE_SQL_SCHEMA = `-- ==========================================
-- DATAVORA TEACHER - SKEMA DATABASE SUPABASE
-- Salin dan jalankan di Supabase SQL Editor:
-- ==========================================

-- 1. Tabel Siswa
CREATE TABLE IF NOT EXISTS students (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  gender TEXT NOT NULL,
  nis TEXT,
  nisn TEXT,
  parent_name TEXT,
  parent_phone TEXT,
  address TEXT,
  status TEXT NOT NULL DEFAULT 'Aktif',
  avatar TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Tabel Presensi / Absensi
CREATE TABLE IF NOT EXISTS attendance (
  id TEXT PRIMARY KEY,
  student_id TEXT NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  date TEXT NOT NULL,
  status TEXT NOT NULL,
  time TEXT,
  note TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Tabel Nilai Siswa
CREATE TABLE IF NOT EXISTS grades (
  id TEXT PRIMARY KEY,
  student_id TEXT NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  subject TEXT NOT NULL,
  assessment_type TEXT NOT NULL,
  assessment_name TEXT NOT NULL,
  score NUMERIC NOT NULL,
  date TEXT NOT NULL,
  note TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Tabel Jadwal Pelajaran
CREATE TABLE IF NOT EXISTS schedules (
  id TEXT PRIMARY KEY,
  day TEXT NOT NULL,
  subject TEXT NOT NULL,
  time_start TEXT NOT NULL,
  time_end TEXT NOT NULL,
  teacher_name TEXT NOT NULL,
  room TEXT,
  color TEXT
);

-- 5. Tabel Jadwal Piket
CREATE TABLE IF NOT EXISTS duty_schedules (
  id TEXT PRIMARY KEY,
  day TEXT NOT NULL,
  group_name TEXT NOT NULL,
  member_student_ids JSONB NOT NULL DEFAULT '[]'::jsonb
);

-- 6. Tabel Transaksi Kas Kelas
CREATE TABLE IF NOT EXISTS cash_transactions (
  id TEXT PRIMARY KEY,
  type TEXT NOT NULL,
  amount NUMERIC NOT NULL,
  description TEXT NOT NULL,
  date TEXT NOT NULL,
  category TEXT NOT NULL,
  recorded_by TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. Tabel Tagihan & Iuran Siswa
CREATE TABLE IF NOT EXISTS payments (
  id TEXT PRIMARY KEY,
  student_id TEXT NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  fee_name TEXT NOT NULL,
  amount NUMERIC NOT NULL,
  status TEXT NOT NULL DEFAULT 'Belum Bayar',
  date TEXT,
  note TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 8. Tabel Catatan Siswa
CREATE TABLE IF NOT EXISTS student_notes (
  id TEXT PRIMARY KEY,
  student_id TEXT NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  date TEXT NOT NULL,
  category TEXT NOT NULL,
  content TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'Catatan Biasa',
  follow_up TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 9. Tabel Informasi Kelas & Sekolah
CREATE TABLE IF NOT EXISTS class_info (
  id TEXT PRIMARY KEY,
  class_name TEXT NOT NULL,
  academic_year TEXT NOT NULL,
  semester TEXT NOT NULL,
  homeroom_teacher_name TEXT NOT NULL,
  homeroom_teacher_nip TEXT,
  school_name TEXT NOT NULL,
  school_logo TEXT,
  headmaster_name TEXT,
  headmaster_nip TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 10. Enable Row Level Security (RLS) & Public Access Policy
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE grades ENABLE ROW LEVEL SECURITY;
ALTER TABLE schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE duty_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE cash_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE class_info ENABLE ROW LEVEL SECURITY;

-- Buat Policy Akses untuk Anon/Authenticated Users
CREATE POLICY "Allow public all on students" ON students FOR ALL USING (true);
CREATE POLICY "Allow public all on attendance" ON attendance FOR ALL USING (true);
CREATE POLICY "Allow public all on grades" ON grades FOR ALL USING (true);
CREATE POLICY "Allow public all on schedules" ON schedules FOR ALL USING (true);
CREATE POLICY "Allow public all on duty_schedules" ON duty_schedules FOR ALL USING (true);
CREATE POLICY "Allow public all on cash_transactions" ON cash_transactions FOR ALL USING (true);
CREATE POLICY "Allow public all on payments" ON payments FOR ALL USING (true);
CREATE POLICY "Allow public all on student_notes" ON student_notes FOR ALL USING (true);
CREATE POLICY "Allow public all on class_info" ON class_info FOR ALL USING (true);
`;
