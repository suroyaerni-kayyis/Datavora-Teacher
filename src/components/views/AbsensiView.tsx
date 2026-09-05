import React, { useState, useMemo } from 'react';
import { useClassData } from '../../context/ClassDataContext';
import { AttendanceStatus, Student } from '../../types';
import { 
  CalendarCheck2, 
  Calendar, 
  Check, 
  Clock, 
  Users, 
  Download, 
  Printer, 
  AlertCircle, 
  HelpCircle, 
  CheckCircle2, 
  UserCheck,
  ChevronDown
} from 'lucide-react';

export const AbsensiView: React.FC = () => {
  const { 
    students, 
    attendance, 
    saveAttendanceBatch, 
    classInfo 
  } = useClassData();

  // Active sub-tab
  const [activeSubTab, setActiveSubTab] = useState<'input' | 'rekap'>('input');

  // Input tab states
  const todayStr = new Date().toISOString().split('T')[0];
  const [selectedDate, setSelectedDate] = useState<string>(todayStr);
  const [sessionTime, setSessionTime] = useState<string>(
    new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
  );

  // Map of studentId -> status & note for the selectedDate
  const [attendanceDraft, setAttendanceDraft] = useState<Record<string, { status: AttendanceStatus; note: string }>>({});

  // When selectedDate changes, load existing records for that date if any
  React.useEffect(() => {
    const existing = attendance.filter(a => a.date === selectedDate);
    const draft: Record<string, { status: AttendanceStatus; note: string }> = {};
    
    students.forEach(std => {
      const rec = existing.find(e => e.studentId === std.id);
      draft[std.id] = {
        status: rec ? rec.status : 'Hadir', // default to Hadir
        note: rec?.note || '',
      };
    });
    setAttendanceDraft(draft);
  }, [selectedDate, students, attendance]);

  // Handle single status change
  const handleStatusChange = (studentId: string, status: AttendanceStatus) => {
    setAttendanceDraft(prev => ({
      ...prev,
      [studentId]: {
        status,
        note: prev[studentId]?.note || '',
      }
    }));
  };

  // Handle single note change
  const handleNoteChange = (studentId: string, note: string) => {
    setAttendanceDraft(prev => ({
      ...prev,
      [studentId]: {
        status: prev[studentId]?.status || 'Hadir',
        note,
      }
    }));
  };

  // Mark all students as Hadir
  const handleMarkAllPresent = () => {
    setAttendanceDraft(prev => {
      const updated: Record<string, { status: AttendanceStatus; note: string }> = { ...prev };
      students.forEach(std => {
        updated[std.id] = {
          status: 'Hadir',
          note: prev[std.id]?.note || '',
        };
      });
      return updated;
    });
  };

  // Save current attendance batch
  const handleSaveAttendance = () => {
    const records = Object.entries(attendanceDraft).map(([studentId, data]) => ({
      studentId,
      status: (data as { status: AttendanceStatus; note: string }).status,
      note: (data as { status: AttendanceStatus; note: string }).note,
      time: sessionTime,
    }));
    saveAttendanceBatch(records, selectedDate);
  };

  // Summary counts for current draft
  const draftSummary = useMemo(() => {
    let h = 0, s = 0, i = 0, a = 0;
    (Object.values(attendanceDraft) as { status: AttendanceStatus; note: string }[]).forEach(item => {
      if (item.status === 'Hadir') h++;
      else if (item.status === 'Sakit') s++;
      else if (item.status === 'Izin') i++;
      else if (item.status === 'Alfa') a++;
    });
    return { h, s, i, a, total: students.length };
  }, [attendanceDraft, students.length]);

  // Rekap sub-tab states
  const [rekapPeriod, setRekapPeriod] = useState<'hari' | 'minggu' | 'bulan' | 'semester'>('bulan');
  const [rekapSearch, setRekapSearch] = useState('');

  // Filter attendance records by period
  const filteredAttendanceByPeriod = useMemo(() => {
    const now = new Date();
    return attendance.filter(rec => {
      const recDate = new Date(rec.date);
      if (rekapPeriod === 'hari') {
        return rec.date === selectedDate;
      } else if (rekapPeriod === 'minggu') {
        const diffDays = (now.getTime() - recDate.getTime()) / (1000 * 3600 * 24);
        return diffDays >= 0 && diffDays <= 7;
      } else if (rekapPeriod === 'bulan') {
        const diffDays = (now.getTime() - recDate.getTime()) / (1000 * 3600 * 24);
        return diffDays >= 0 && diffDays <= 30;
      }
      return true; // semester (all)
    });
  }, [attendance, rekapPeriod, selectedDate]);

  // Student summary table for rekap
  const studentRekapData = useMemo(() => {
    return students
      .filter(std => std.name.toLowerCase().includes(rekapSearch.toLowerCase()) || std.nis.includes(rekapSearch))
      .map(std => {
        const stdRecords = filteredAttendanceByPeriod.filter(r => r.studentId === std.id);
        const h = stdRecords.filter(r => r.status === 'Hadir').length;
        const s = stdRecords.filter(r => r.status === 'Sakit').length;
        const i = stdRecords.filter(r => r.status === 'Izin').length;
        const a = stdRecords.filter(r => r.status === 'Alfa').length;
        const totalSessions = stdRecords.length;
        const rate = totalSessions > 0 ? Math.round((h / totalSessions) * 100) : 100;

        return {
          student: std,
          hadir: h,
          sakit: s,
          izin: i,
          alfa: a,
          total: totalSessions,
          rate,
        };
      });
  }, [students, filteredAttendanceByPeriod, rekapSearch]);

  // Export Rekap CSV
  const handleExportRekapCSV = () => {
    if (studentRekapData.length === 0) return;
    const headers = ['No', 'Nama Siswa', 'NIS', 'Hadir (H)', 'Sakit (S)', 'Izin (I)', 'Alfa (A)', 'Total Pertemuan', '% Kehadiran'];
    const rows = studentRekapData.map((d, index) => [
      index + 1,
      `"${d.student.name}"`,
      `"${d.student.nis}"`,
      d.hadir,
      d.sakit,
      d.izin,
      d.alfa,
      d.total,
      `${d.rate}%`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Rekap_Absensi_${classInfo.className.replace(/\s+/g, '_')}_${rekapPeriod}_${todayStr}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-3.5 pb-10">
      {/* Top Title & Sub-tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-slate-900">Absensi Kelas</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Pencatatan cepat kehadiran harian dan analisis rekapitulasi semester
          </p>
        </div>

        {/* Sub-tab Switcher */}
        <div className="flex items-center p-0.5 bg-slate-200/70 rounded-xl w-full sm:w-auto">
          <button
            onClick={() => setActiveSubTab('input')}
            className={`flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all min-h-[36px] ${
              activeSubTab === 'input'
                ? 'bg-white text-[#D9468F] shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <CalendarCheck2 className="w-3.5 h-3.5" />
            <span>Absensi Hari Ini</span>
          </button>
          <button
            onClick={() => setActiveSubTab('rekap')}
            className={`flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all min-h-[36px] ${
              activeSubTab === 'rekap'
                ? 'bg-white text-[#D9468F] shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>Rekap Absensi</span>
          </button>
        </div>
      </div>

      {activeSubTab === 'input' ? (
        /* Tab 1: Absensi Hari Ini */
        <div className="space-y-3.5">
          {/* Controls Bar */}
          <div className="bg-white p-2.5 sm:p-3 rounded-xl border border-slate-200/90 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
            <div className="flex flex-wrap items-center gap-2.5">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-semibold text-slate-600">Tanggal:</span>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={e => setSelectedDate(e.target.value)}
                  className="px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#D9468F] bg-white min-h-[36px]"
                />
              </div>

              <div className="flex items-center gap-1.5">
                <span className="text-xs font-semibold text-slate-600">Jam:</span>
                <input
                  type="text"
                  value={sessionTime}
                  onChange={e => setSessionTime(e.target.value)}
                  placeholder="07:15"
                  className="w-18 px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#D9468F] bg-white min-h-[36px]"
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleMarkAllPresent}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-emerald-200 bg-emerald-50 text-emerald-700 text-xs font-semibold hover:bg-emerald-100 transition-colors active:scale-97 min-h-[36px]"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Tandai Semua Hadir</span>
              </button>

              <button
                type="button"
                onClick={handleSaveAttendance}
                disabled={students.length === 0}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[#D9468F] hover:bg-[#C2357A] disabled:opacity-50 text-white text-xs font-semibold shadow-xs transition-colors active:scale-97 min-h-[36px]"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Simpan Absensi</span>
              </button>
            </div>
          </div>

          {/* Quick Counter Pills */}
          <div className="grid grid-cols-4 gap-2 sm:gap-3">
            <div className="p-2 rounded-xl bg-emerald-50/70 border border-emerald-100 text-center">
              <span className="text-[10px] font-semibold text-emerald-700 block">Hadir</span>
              <span className="text-base sm:text-lg font-bold text-emerald-800">{draftSummary.h}</span>
            </div>
            <div className="p-2 rounded-xl bg-amber-50/70 border border-amber-100 text-center">
              <span className="text-[10px] font-semibold text-amber-700 block">Sakit</span>
              <span className="text-base sm:text-lg font-bold text-amber-800">{draftSummary.s}</span>
            </div>
            <div className="p-2 rounded-xl bg-sky-50/70 border border-sky-100 text-center">
              <span className="text-[10px] font-semibold text-sky-700 block">Izin</span>
              <span className="text-base sm:text-lg font-bold text-sky-800">{draftSummary.i}</span>
            </div>
            <div className="p-2 rounded-xl bg-rose-50/70 border border-rose-100 text-center">
              <span className="text-[10px] font-semibold text-rose-700 block">Alfa</span>
              <span className="text-base sm:text-lg font-bold text-rose-800">{draftSummary.a}</span>
            </div>
          </div>

          {/* Student Attendance List */}
          {students.length === 0 ? (
            <div className="p-10 text-center bg-white rounded-xl border border-dashed border-slate-200">
              <Users className="w-8 h-8 text-slate-300 mx-auto mb-1.5" />
              <p className="text-xs font-semibold text-slate-700">Belum Ada Data Siswa</p>
              <p className="text-[11px] text-slate-400 mt-0.5">Tambahkan siswa terlebih dahulu pada menu Siswa.</p>
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-slate-200/90 divide-y divide-slate-100 overflow-hidden shadow-xs">
              {students.map((student, idx) => {
                const currentStatus = attendanceDraft[student.id]?.status || 'Hadir';
                const currentNote = attendanceDraft[student.id]?.note || '';

                return (
                  <div 
                    key={student.id} 
                    className="p-2.5 sm:p-3 hover:bg-slate-50/60 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-2.5"
                  >
                    {/* Student Info */}
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className="text-xs font-medium text-slate-400 w-5 text-center shrink-0">
                        {idx + 1}
                      </span>
                      <div className="w-7 h-7 rounded-lg bg-[#D9468F]/10 text-[#D9468F] font-bold text-xs flex items-center justify-center shrink-0">
                        {student.name.charAt(0)}
                      </div>
                      <div className="min-w-0">
                        <div className="font-semibold text-xs text-slate-900 truncate">
                          {student.name}
                        </div>
                        <div className="text-[10px] text-slate-400">
                          NIS: {student.nis} • {student.gender === 'L' ? 'L' : 'P'}
                        </div>
                      </div>
                    </div>

                    {/* Status Segmented Buttons & Note */}
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
                      
                      {/* 4 Segmented Status Buttons */}
                      <div className="grid grid-cols-4 sm:flex items-center p-0.5 bg-slate-100/90 rounded-lg gap-0.5">
                        <button
                          type="button"
                          onClick={() => handleStatusChange(student.id, 'Hadir')}
                          className={`py-1 px-2.5 sm:px-3 rounded-md text-xs font-bold transition-all min-h-[34px] ${
                            currentStatus === 'Hadir'
                              ? 'bg-emerald-500 text-white shadow-xs'
                              : 'text-slate-600 hover:text-emerald-700 hover:bg-emerald-50'
                          }`}
                        >
                          Hadir
                        </button>
                        <button
                          type="button"
                          onClick={() => handleStatusChange(student.id, 'Sakit')}
                          className={`py-1 px-2.5 sm:px-3 rounded-md text-xs font-bold transition-all min-h-[34px] ${
                            currentStatus === 'Sakit'
                              ? 'bg-amber-500 text-white shadow-xs'
                              : 'text-slate-600 hover:text-amber-700 hover:bg-amber-50'
                          }`}
                        >
                          Sakit
                        </button>
                        <button
                          type="button"
                          onClick={() => handleStatusChange(student.id, 'Izin')}
                          className={`py-1 px-2.5 sm:px-3 rounded-md text-xs font-bold transition-all min-h-[34px] ${
                            currentStatus === 'Izin'
                              ? 'bg-sky-500 text-white shadow-xs'
                              : 'text-slate-600 hover:text-sky-700 hover:bg-sky-50'
                          }`}
                        >
                          Izin
                        </button>
                        <button
                          type="button"
                          onClick={() => handleStatusChange(student.id, 'Alfa')}
                          className={`py-1 px-2.5 sm:px-3 rounded-md text-xs font-bold transition-all min-h-[34px] ${
                            currentStatus === 'Alfa'
                              ? 'bg-rose-500 text-white shadow-xs'
                              : 'text-slate-600 hover:text-rose-700 hover:bg-rose-50'
                          }`}
                        >
                          Alfa
                        </button>
                      </div>

                      {/* Optional Note input */}
                      <input
                        type="text"
                        value={currentNote}
                        onChange={e => handleNoteChange(student.id, e.target.value)}
                        placeholder="Keterangan..."
                        className="w-full sm:w-40 px-2.5 py-1 rounded-lg border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-[#D9468F] min-h-[34px]"
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Sticky Bottom Save Action Bar */}
          {students.length > 0 && (
            <div className="sticky bottom-14 md:bottom-4 z-20 bg-white/95 backdrop-blur-md p-2.5 sm:p-3 rounded-xl border border-slate-200 shadow-lg flex items-center justify-between gap-3">
              <div className="text-xs text-slate-600">
                <span className="font-semibold text-slate-800">{draftSummary.total} Siswa</span> ({draftSummary.h} Hadir, {draftSummary.s} Sakit, {draftSummary.i} Izin, {draftSummary.a} Alfa)
              </div>
              <button
                type="button"
                onClick={handleSaveAttendance}
                className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-[#D9468F] hover:bg-[#C2357A] text-white font-semibold text-xs shadow-sm transition-all active:scale-97 min-h-[36px]"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Simpan Absensi</span>
              </button>
            </div>
          )}
        </div>
      ) : (
        /* Tab 2: Rekap Absensi */
        <div className="space-y-3.5">
          {/* Rekap Filter Bar */}
          <div className="bg-white p-2.5 sm:p-3 rounded-xl border border-slate-200/90 shadow-xs flex flex-col md:flex-row items-center justify-between gap-2.5">
            {/* Period selector */}
            <div className="flex items-center gap-1 p-0.5 bg-slate-100 rounded-lg w-full md:w-auto">
              {(['hari', 'minggu', 'bulan', 'semester'] as const).map(period => (
                <button
                  key={period}
                  onClick={() => setRekapPeriod(period)}
                  className={`flex-1 md:flex-initial px-2.5 py-1 rounded-md text-xs font-medium capitalize transition-all min-h-[34px] ${
                    rekapPeriod === period
                      ? 'bg-white text-[#D9468F] shadow-xs font-semibold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {period === 'hari' ? 'Hari Ini' : period === 'minggu' ? '1 Minggu' : period === 'bulan' ? '1 Bulan' : 'Semester'}
                </button>
              ))}
            </div>

            {/* Search & Export */}
            <div className="flex items-center gap-2 w-full md:w-auto">
              <input
                type="text"
                value={rekapSearch}
                onChange={e => setRekapSearch(e.target.value)}
                placeholder="Cari siswa..."
                className="flex-1 md:w-48 px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-[#D9468F] min-h-[36px]"
              />

              <button
                type="button"
                onClick={handleExportRekapCSV}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors active:scale-97 min-h-[36px]"
              >
                <Download className="w-3.5 h-3.5 text-slate-500" />
                <span className="hidden sm:inline">Export CSV</span>
              </button>
            </div>
          </div>

          {/* Rekap Table */}
          <div className="bg-white rounded-xl border border-slate-200/90 overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[650px]">
                <thead>
                  <tr className="border-b border-slate-200/90 bg-slate-50/80 text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
                    <th className="py-2 px-3 w-10 text-center">No</th>
                    <th className="py-2 px-3">Nama Siswa</th>
                    <th className="py-2 px-2.5 text-center text-emerald-700">Hadir</th>
                    <th className="py-2 px-2.5 text-center text-amber-700">Sakit</th>
                    <th className="py-2 px-2.5 text-center text-sky-700">Izin</th>
                    <th className="py-2 px-2.5 text-center text-rose-700">Alfa</th>
                    <th className="py-2 px-3 text-center">% Kehadiran</th>
                    <th className="py-2 px-3 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {studentRekapData.map((item, idx) => (
                    <tr key={item.student.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-2 px-3 text-center text-slate-400 font-medium">{idx + 1}</td>
                      <td className="py-2 px-3">
                        <div className="font-semibold text-slate-900 text-xs">{item.student.name}</div>
                        <div className="text-[10px] text-slate-400">NIS: {item.student.nis}</div>
                      </td>
                      <td className="py-2 px-2.5 text-center font-semibold text-emerald-600">{item.hadir}</td>
                      <td className="py-2 px-2.5 text-center font-semibold text-amber-600">{item.sakit}</td>
                      <td className="py-2 px-2.5 text-center font-semibold text-sky-600">{item.izin}</td>
                      <td className="py-2 px-2.5 text-center font-semibold text-rose-600">{item.alfa}</td>
                      <td className="py-2 px-3 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <div className="w-14 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                            <div 
                              className={`h-full rounded-full ${
                                item.rate >= 90 ? 'bg-emerald-500' : item.rate >= 75 ? 'bg-[#D9468F]' : 'bg-rose-500'
                              }`} 
                              style={{ width: `${item.rate}%` }} 
                            />
                          </div>
                          <span className="font-bold text-slate-800 text-xs">{item.rate}%</span>
                        </div>
                      </td>
                      <td className="py-2 px-3 text-right">
                        <span className={`inline-block px-1.5 py-0.5 rounded-md text-[10px] font-semibold ${
                          item.alfa > 1 ? 'bg-rose-50 text-rose-700 border border-rose-100' :
                          item.rate >= 90 ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' :
                          'bg-amber-50 text-amber-700 border border-amber-100'
                        }`}>
                          {item.alfa > 1 ? 'Perlu Perhatian' : item.rate >= 90 ? 'Sangat Rajin' : 'Cukup'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
