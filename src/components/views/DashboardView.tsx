import React from 'react';
import { useClassData } from '../../context/ClassDataContext';
import { useTheme } from '../../context/ThemeContext';
import { 
  Users, 
  UserCheck, 
  AlertCircle, 
  Clock, 
  HelpCircle, 
  Award, 
  Wallet, 
  AlertTriangle,
  Plus, 
  CalendarCheck2, 
  UserPlus, 
  GraduationCap, 
  BookOpen, 
  TrendingUp, 
  ChevronRight, 
  ArrowUpRight,
  Calendar
} from 'lucide-react';
import { ActiveTab, Student } from '../../types';

interface DashboardViewProps {
  setActiveTab: (tab: ActiveTab) => void;
  onOpenAddStudent: () => void;
  onOpenAddGrade: () => void;
  onOpenAddNote: () => void;
  onSelectStudent: (student: Student) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  setActiveTab,
  onOpenAddStudent,
  onOpenAddGrade,
  onOpenAddNote,
  onSelectStudent,
}) => {
  const { 
    classInfo, 
    totalStudents, 
    todayAttendanceSummary, 
    overallAverageScore, 
    cashBalance, 
    studentsNeedingAttention,
    recentActivities,
    attendance,
    grades
  } = useClassData();
  const { themeConfig } = useTheme();

  // Weekly attendance data calculation (last 5 school days)
  const daysOfWeek = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat'];
  // We can calculate attendance rate for recent records
  const totalAttendanceRecorded = attendance.length;
  const totalHadirRecorded = attendance.filter(a => a.status === 'Hadir').length;
  const attendanceRate = totalAttendanceRecorded > 0 
    ? Math.round((totalHadirRecorded / totalAttendanceRecorded) * 100) 
    : 100;

  // Subjects performance breakdown
  const subjectAverages = React.useMemo(() => {
    const map: { [subject: string]: { sum: number; count: number } } = {};
    grades.forEach(g => {
      if (!map[g.subject]) map[g.subject] = { sum: 0, count: 0 };
      map[g.subject].sum += g.score;
      map[g.subject].count += 1;
    });
    return Object.entries(map).map(([subject, data]) => ({
      subject,
      avg: Math.round(data.sum / data.count),
    })).slice(0, 5);
  }, [grades]);

  return (
    <div className="space-y-3.5 pb-8">
      {/* Welcome Banner */}
      <div className={`relative overflow-hidden ${themeConfig.bannerGradient} rounded-xl p-4 sm:p-5 text-white shadow-xs transition-all duration-300`}>
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-white/20 backdrop-blur-md text-[11px] font-medium mb-2">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
            <span>Tahun Ajaran {classInfo.academicYear} • Semester {classInfo.semester}</span>
          </div>
          <h2 className="text-lg sm:text-xl font-bold tracking-tight">
            Selamat Bertugas, {classInfo.homeroomTeacher.split(',')[0]}!
          </h2>
          <p className={`${themeConfig.bannerSubtext} text-xs mt-1 leading-relaxed`}>
            Ringkasan kegiatan & administrasi kelas <strong>{classInfo.className}</strong> di {classInfo.schoolName}.
          </p>

          {/* Quick Action Buttons inside banner */}
          <div className="flex flex-wrap items-center gap-2 mt-3.5">
            <button
              onClick={() => setActiveTab('absensi')}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white ${themeConfig.bannerButtonText} font-semibold text-xs shadow-xs hover:bg-white/90 transition-colors active:scale-97 min-h-[36px]`}
            >
              <CalendarCheck2 className="w-3.5 h-3.5" />
              <span>Isi Absensi Hari Ini</span>
            </button>
            <button
              onClick={onOpenAddStudent}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/15 hover:bg-white/25 text-white font-medium text-xs backdrop-blur-md transition-colors active:scale-97 min-h-[36px]"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>+ Siswa</span>
            </button>
            <button
              onClick={onOpenAddGrade}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/15 hover:bg-white/25 text-white font-medium text-xs backdrop-blur-md transition-colors active:scale-97 min-h-[36px]"
            >
              <GraduationCap className="w-3.5 h-3.5" />
              <span>+ Nilai</span>
            </button>
            <button
              onClick={onOpenAddNote}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/15 hover:bg-white/25 text-white font-medium text-xs backdrop-blur-md transition-colors active:scale-97 min-h-[36px]"
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>+ Catatan</span>
            </button>
          </div>
        </div>

        {/* Decorative background shape */}
        <div className="absolute -right-10 -bottom-10 w-56 h-56 bg-white/10 rounded-full blur-2xl pointer-events-none" />
      </div>

      {/* Primary 8 Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-4 gap-2.5 sm:gap-3">
        {/* Total Siswa */}
        <div 
          onClick={() => setActiveTab('siswa')}
          className="p-3 bg-white rounded-xl border border-slate-200/90 shadow-xs hover:border-slate-300 hover:shadow-xs transition-all cursor-pointer group active:scale-98"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium text-slate-500">Total Siswa</span>
            <div className="w-7 h-7 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center group-hover:bg-[#D9468F]/10 group-hover:text-[#D9468F] transition-colors">
              <Users className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-1 flex items-baseline gap-1.5">
            <span className="text-xl font-bold text-slate-900">{totalStudents}</span>
            <span className="text-[11px] text-slate-500">Anak</span>
          </div>
          <div className="mt-0.5 flex items-center text-[10px] text-slate-400 group-hover:text-[#D9468F] transition-colors">
            <span>Daftar siswa</span>
            <ChevronRight className="w-3 h-3 ml-0.5" />
          </div>
        </div>

        {/* Hadir Hari Ini */}
        <div 
          onClick={() => setActiveTab('absensi')}
          className="p-3 bg-white rounded-xl border border-slate-200/90 shadow-xs hover:border-emerald-200 transition-all cursor-pointer group active:scale-98"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium text-slate-500">Hadir Hari Ini</span>
            <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <UserCheck className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-1 flex items-baseline gap-1.5">
            <span className="text-xl font-bold text-emerald-600">{todayAttendanceSummary.hadir}</span>
            <span className="text-[11px] text-slate-400">/ {totalStudents}</span>
          </div>
          <div className="mt-0.5 flex items-center text-[10px] text-emerald-600 font-medium">
            <span>{totalStudents > 0 ? Math.round((todayAttendanceSummary.hadir / totalStudents) * 100) : 0}% Kehadiran</span>
          </div>
        </div>

        {/* Sakit */}
        <div 
          onClick={() => setActiveTab('absensi')}
          className="p-3 bg-white rounded-xl border border-slate-200/90 shadow-xs hover:border-amber-200 transition-all cursor-pointer active:scale-98"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium text-slate-500">Sakit</span>
            <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <Clock className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-1 flex items-baseline gap-1.5">
            <span className="text-xl font-bold text-amber-600">{todayAttendanceSummary.sakit}</span>
            <span className="text-[11px] text-slate-500">Siswa</span>
          </div>
          <div className="mt-0.5 text-[10px] text-slate-400">Hari ini</div>
        </div>

        {/* Izin */}
        <div 
          onClick={() => setActiveTab('absensi')}
          className="p-3 bg-white rounded-xl border border-slate-200/90 shadow-xs hover:border-sky-200 transition-all cursor-pointer active:scale-98"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium text-slate-500">Izin</span>
            <div className="w-7 h-7 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center">
              <HelpCircle className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-1 flex items-baseline gap-1.5">
            <span className="text-xl font-bold text-sky-600">{todayAttendanceSummary.izin}</span>
            <span className="text-[11px] text-slate-500">Siswa</span>
          </div>
          <div className="mt-0.5 text-[10px] text-slate-400">Hari ini</div>
        </div>

        {/* Alfa */}
        <div 
          onClick={() => setActiveTab('absensi')}
          className="p-3 bg-white rounded-xl border border-slate-200/90 shadow-xs hover:border-rose-200 transition-all cursor-pointer active:scale-98"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium text-slate-500">Alfa</span>
            <div className="w-7 h-7 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
              <AlertCircle className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-1 flex items-baseline gap-1.5">
            <span className={`text-xl font-bold ${todayAttendanceSummary.alfa > 0 ? 'text-rose-600' : 'text-slate-800'}`}>
              {todayAttendanceSummary.alfa}
            </span>
            <span className="text-[11px] text-slate-500">Siswa</span>
          </div>
          <div className="mt-0.5 text-[10px] text-slate-400">
            {todayAttendanceSummary.alfa > 0 ? 'Perlu konfirmasi' : 'Nihil tanpa kabar'}
          </div>
        </div>

        {/* Rata-rata Nilai */}
        <div 
          onClick={() => setActiveTab('nilai')}
          className="p-3 bg-white rounded-xl border border-slate-200/90 shadow-xs hover:border-purple-200 transition-all cursor-pointer group active:scale-98"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium text-slate-500">Rata-rata Nilai</span>
            <div className="w-7 h-7 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
              <Award className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-1 flex items-baseline gap-1.5">
            <span className="text-xl font-bold text-purple-700">{overallAverageScore || '-'}</span>
            <span className="text-[11px] text-slate-400">/ 100</span>
          </div>
          <div className="mt-0.5 text-[10px] text-purple-600 font-medium">
            KKM Standar: 75
          </div>
        </div>

        {/* Saldo Kas Kelas */}
        <div 
          onClick={() => setActiveTab('administrasi')}
          className="p-3 bg-white rounded-xl border border-slate-200/90 shadow-xs hover:border-emerald-200 transition-all cursor-pointer active:scale-98"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium text-slate-500">Kas Kelas</span>
            <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Wallet className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-1 flex items-baseline gap-1 truncate">
            <span className="text-base sm:text-lg font-bold text-slate-900">
              Rp {cashBalance.balance.toLocaleString('id-ID')}
            </span>
          </div>
          <div className="mt-0.5 text-[10px] text-slate-400">
            Saldo bersih aktif
          </div>
        </div>

        {/* Siswa Perlu Perhatian */}
        <div 
          onClick={() => setActiveTab('catatan')}
          className="p-3 bg-white rounded-xl border border-slate-200/90 shadow-xs hover:border-rose-200 transition-all cursor-pointer active:scale-98"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium text-slate-500">Perlu Perhatian</span>
            <div className="w-7 h-7 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
              <AlertTriangle className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-1 flex items-baseline gap-1.5">
            <span className="text-xl font-bold text-rose-600">{studentsNeedingAttention.length}</span>
            <span className="text-[11px] text-slate-500">Siswa</span>
          </div>
          <div className="mt-0.5 text-[10px] text-rose-600 font-medium">
            Absensi / Nilai
          </div>
        </div>
      </div>

      {/* Visual Charts & Progress Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 sm:gap-4">
        
        {/* Chart 1: Grafik Kehadiran Siswa */}
        <div className="lg:col-span-2 bg-white rounded-xl p-4 sm:p-5 border border-slate-200/90 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="text-sm font-semibold text-slate-900">Grafik Kehadiran Siswa</h3>
              <p className="text-[11px] text-slate-500">Persentase kehadiran dan status absensi kelas</p>
            </div>
            <button 
              onClick={() => setActiveTab('absensi')}
              className="text-xs font-medium text-[#D9468F] hover:underline flex items-center gap-1"
            >
              Lihat Rekap <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Clean custom SVG chart for attendance */}
          <div className="space-y-3">
            <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden flex shadow-inner">
              <div 
                style={{ width: `${totalStudents > 0 ? (todayAttendanceSummary.hadir / totalStudents) * 100 : 0}%` }} 
                className="bg-emerald-500 h-full transition-all duration-500" 
                title={`Hadir: ${todayAttendanceSummary.hadir}`}
              />
              <div 
                style={{ width: `${totalStudents > 0 ? (todayAttendanceSummary.sakit / totalStudents) * 100 : 0}%` }} 
                className="bg-amber-400 h-full transition-all duration-500" 
                title={`Sakit: ${todayAttendanceSummary.sakit}`}
              />
              <div 
                style={{ width: `${totalStudents > 0 ? (todayAttendanceSummary.izin / totalStudents) * 100 : 0}%` }} 
                className="bg-sky-400 h-full transition-all duration-500" 
                title={`Izin: ${todayAttendanceSummary.izin}`}
              />
              <div 
                style={{ width: `${totalStudents > 0 ? (todayAttendanceSummary.alfa / totalStudents) * 100 : 0}%` }} 
                className="bg-rose-500 h-full transition-all duration-500" 
                title={`Alfa: ${todayAttendanceSummary.alfa}`}
              />
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-0.5 text-xs">
              <div className="flex items-center gap-2 p-1.5 px-2 rounded-lg bg-emerald-50/60 border border-emerald-100">
                <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                <div>
                  <span className="text-slate-500 text-[10px]">Hadir</span>
                  <div className="font-semibold text-xs text-slate-800">{todayAttendanceSummary.hadir} siswa</div>
                </div>
              </div>
              <div className="flex items-center gap-2 p-1.5 px-2 rounded-lg bg-amber-50/60 border border-amber-100">
                <span className="w-2 h-2 rounded-full bg-amber-400 shrink-0" />
                <div>
                  <span className="text-slate-500 text-[10px]">Sakit</span>
                  <div className="font-semibold text-xs text-slate-800">{todayAttendanceSummary.sakit} siswa</div>
                </div>
              </div>
              <div className="flex items-center gap-2 p-1.5 px-2 rounded-lg bg-sky-50/60 border border-sky-100">
                <span className="w-2 h-2 rounded-full bg-sky-400 shrink-0" />
                <div>
                  <span className="text-slate-500 text-[10px]">Izin</span>
                  <div className="font-semibold text-xs text-slate-800">{todayAttendanceSummary.izin} siswa</div>
                </div>
              </div>
              <div className="flex items-center gap-2 p-1.5 px-2 rounded-lg bg-rose-50/60 border border-rose-100">
                <span className="w-2 h-2 rounded-full bg-rose-500 shrink-0" />
                <div>
                  <span className="text-slate-500 text-[10px]">Alfa</span>
                  <div className="font-semibold text-xs text-slate-800">{todayAttendanceSummary.alfa} siswa</div>
                </div>
              </div>
            </div>

            {/* Performance by Subject bars */}
            <div className="pt-2.5 border-t border-slate-100">
              <h4 className="text-[11px] font-semibold text-slate-700 uppercase tracking-wider mb-2">
                Rata-rata Nilai Mata Pelajaran
              </h4>
              <div className="space-y-2">
                {subjectAverages.length > 0 ? (
                  subjectAverages.map(sub => (
                    <div key={sub.subject} className="space-y-0.5">
                      <div className="flex justify-between text-xs">
                        <span className="font-medium text-slate-700 text-xs">{sub.subject}</span>
                        <span className={`font-semibold text-xs ${sub.avg >= 85 ? 'text-emerald-600' : sub.avg >= 75 ? 'text-[#D9468F]' : 'text-rose-600'}`}>
                          {sub.avg} / 100
                        </span>
                      </div>
                      <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full transition-all duration-500 ${
                            sub.avg >= 85 ? 'bg-emerald-500' : sub.avg >= 75 ? 'bg-[#D9468F]' : 'bg-rose-500'
                          }`}
                          style={{ width: `${Math.min(100, sub.avg)}%` }}
                        />
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-slate-400 py-1">Belum ada data nilai mata pelajaran.</p>
                )}
              </div>
            </div>

          </div>
        </div>

        {/* Ringkasan Kas & Bulan Berjalan */}
        <div className="bg-white rounded-xl p-4 sm:p-5 border border-slate-200/90 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-slate-900">Keuangan Kelas</h3>
              <button 
                onClick={() => setActiveTab('administrasi')}
                className="text-xs font-medium text-[#D9468F] hover:underline"
              >
                Detail
              </button>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-500">Total Pemasukan</span>
                <span className="font-semibold text-emerald-600">+Rp {cashBalance.totalIncome.toLocaleString('id-ID')}</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-500">Total Pengeluaran</span>
                <span className="font-semibold text-rose-600">-Rp {cashBalance.totalExpense.toLocaleString('id-ID')}</span>
              </div>
              <div className="pt-1.5 border-t border-slate-200 flex justify-between items-center text-xs font-bold text-slate-900">
                <span>Saldo Kas Saat Ini</span>
                <span className="text-[#D9468F]">Rp {cashBalance.balance.toLocaleString('id-ID')}</span>
              </div>
            </div>

            <div className="mt-3.5 space-y-1">
              <h4 className="text-[11px] font-semibold text-slate-700 uppercase tracking-wider">
                Status Iuran Siswa
              </h4>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                Catat dan pantau iuran buku, uang kas, maupun kegiatan kelas secara berkala untuk transparansi wali murid.
              </p>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 mt-3">
            <button
              onClick={() => setActiveTab('administrasi')}
              className="w-full py-2 px-3 rounded-lg text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors text-center active:scale-98 min-h-[38px] flex items-center justify-center"
            >
              Buka Buku Kas & Iuran
            </button>
          </div>
        </div>

      </div>

      {/* Siswa Perlu Perhatian & Aktivitas Terbaru */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4">
        
        {/* Siswa Perlu Perhatian */}
        <div className="bg-white rounded-xl p-4 sm:p-5 border border-slate-200/90 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                <span>Siswa Perlu Perhatian</span>
                {studentsNeedingAttention.length > 0 && (
                  <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-700">
                    {studentsNeedingAttention.length}
                  </span>
                )}
              </h3>
              <p className="text-[11px] text-slate-500 mt-0.5">Siswa dengan catatan nilai, kedisiplinan, atau absensi</p>
            </div>
            <button
              onClick={() => setActiveTab('catatan')}
              className="text-xs font-medium text-[#D9468F] hover:underline"
            >
              Lihat Semua
            </button>
          </div>

          {studentsNeedingAttention.length === 0 ? (
            <div className="py-6 text-center bg-slate-50/70 rounded-xl border border-dashed border-slate-200">
              <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-1.5">
                <TrendingUp className="w-4 h-4" />
              </div>
              <p className="text-xs font-semibold text-slate-800">Kondisi Kelas Terpantau Baik</p>
              <p className="text-[11px] text-slate-500 mt-0.5 max-w-sm mx-auto">
                Tidak ada siswa yang memiliki catatan mendesak atau kehadiran kritis.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {studentsNeedingAttention.slice(0, 4).map(({ student, reasons }) => (
                <div
                  key={student.id}
                  onClick={() => onSelectStudent(student)}
                  className="p-2.5 rounded-lg border border-rose-100/90 bg-rose-50/30 hover:bg-rose-50/70 transition-colors flex items-center justify-between gap-2.5 cursor-pointer group active:scale-98"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-8 h-8 rounded-lg bg-rose-100 text-rose-700 flex items-center justify-center font-bold text-xs shrink-0">
                      {student.name.charAt(0)}
                    </div>
                    <div className="min-w-0">
                      <div className="font-semibold text-xs text-slate-900 truncate group-hover:text-[#D9468F] transition-colors">
                        {student.name}
                      </div>
                      <div className="flex flex-wrap gap-1 mt-0.5">
                        {reasons.map((r, idx) => (
                          <span 
                            key={idx} 
                            className="inline-block px-1.5 py-0.2 rounded text-[10px] font-medium bg-rose-100 text-rose-700"
                          >
                            {r}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-[#D9468F] shrink-0" />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Aktivitas Terbaru */}
        <div className="bg-white rounded-xl p-4 sm:p-5 border border-slate-200/90 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="text-sm font-semibold text-slate-900">Aktivitas Terbaru</h3>
              <p className="text-[11px] text-slate-500 mt-0.5">Log pembaruan data absensi, nilai, kas & catatan</p>
            </div>
          </div>

          {recentActivities.length === 0 ? (
            <div className="py-6 text-center text-slate-400 text-xs">
              Belum ada aktivitas yang tercatat.
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {recentActivities.map(act => (
                <div key={act.id} className="py-2 flex items-start gap-2.5">
                  <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${
                    act.type === 'attendance' ? 'bg-emerald-500' :
                    act.type === 'grade' ? 'bg-purple-500' :
                    act.type === 'cash' ? 'bg-sky-500' :
                    'bg-[#D9468F]'
                  }`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-slate-800 leading-snug">
                      {act.title}
                    </p>
                    <span className="text-[10px] text-slate-400 mt-0.5 block">{act.time}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
