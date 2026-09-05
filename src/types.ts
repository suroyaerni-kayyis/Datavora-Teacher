export type Gender = 'L' | 'P'; // Laki-laki | Perempuan
export type StudentStatus = 'Aktif' | 'Mutasi' | 'Lulus' | 'Non-Aktif';
export type AttendanceStatus = 'Hadir' | 'Sakit' | 'Izin' | 'Alfa';

export interface Student {
  id: string;
  name: string;
  nis: string;
  nisn: string;
  gender: Gender;
  className: string;
  status: StudentStatus;
  avatarUrl?: string;
  birthPlace?: string;
  birthDate?: string;
  address?: string;
  phone?: string;
  parentName?: string;
  parentMotherName?: string;
  parentPhone?: string;
  parentJob?: string;
  bloodType?: string;
  healthNotes?: string;
  specialNotes?: string;
  createdAt: string;
}

export interface AttendanceRecord {
  id: string;
  studentId: string;
  date: string; // YYYY-MM-DD
  time?: string; // HH:mm
  status: AttendanceStatus;
  note?: string;
  createdAt: string;
}

export type AssessmentType = 'Tugas' | 'Kuis' | 'Ulangan Harian' | 'PTS' | 'PAS' | 'Praktik';

export interface GradeRecord {
  id: string;
  studentId: string;
  subject: string;
  assessmentType: AssessmentType;
  score: number; // 0 - 100
  date: string;
  notes?: string;
  createdAt: string;
}

export type DayOfWeek = 'Senin' | 'Selasa' | 'Rabu' | 'Kamis' | 'Jumat' | 'Sabtu';

export interface ScheduleItem {
  id: string;
  day: DayOfWeek;
  subject: string;
  teacher: string;
  startTime: string; // e.g., "07:30"
  endTime: string;   // e.g., "09:00"
  room: string;
}

export interface DutySchedule {
  id: string;
  groupName: string;
  day: DayOfWeek;
  memberStudentIds: string[];
  tasks: string[]; // e.g. ["Menyapu lantai", "Membersihkan papan tulis", "Menata meja"]
}

export type CashTransactionType = 'Pemasukan' | 'Pengeluaran';

export interface CashTransaction {
  id: string;
  type: CashTransactionType;
  amount: number;
  date: string;
  description: string;
  category?: string;
  createdAt: string;
}

export type PaymentStatus = 'Sudah Bayar' | 'Belum Bayar';

export interface PaymentItem {
  id: string;
  studentId: string;
  feeName: string; // e.g. "Kas Kelas Semester Ganjil", "Buku Lembar Kerja", dll.
  amount: number;
  status: PaymentStatus;
  date?: string;
  note?: string;
  createdAt: string;
}

export type NoteCategory = 
  | 'Akademik' 
  | 'Perilaku' 
  | 'Kedisiplinan' 
  | 'Sosial' 
  | 'Prestasi' 
  | 'Konseling' 
  | 'Lainnya';

export type NoteStatus = 'Positif' | 'Perlu Perhatian' | 'Perlu Tindak Lanjut';

export interface StudentNote {
  id: string;
  studentId: string;
  category: NoteCategory;
  note: string;
  status: NoteStatus;
  date: string;
  followUpPlan?: string;
  createdAt: string;
}

export interface ClassInfo {
  className: string;
  academicYear: string;
  semester: 'Ganjil' | 'Genap';
  homeroomTeacher: string;
  homeroomTeacherNip?: string;
  schoolName: string;
  schoolLogo?: string;
  headmasterName?: string;
  headmasterNip?: string;
}

export type SidebarColorTheme = 'plum' | 'maroon' | 'navy' | 'emerald' | 'rose';
export type AppColorTheme = SidebarColorTheme;

export type ActiveTab = 
  | 'dashboard'
  | 'siswa'
  | 'absensi'
  | 'nilai'
  | 'jadwal'
  | 'administrasi'
  | 'catatan'
  | 'laporan';

export type ThemeMode = 'light' | 'dark' | 'system';
