import React, { useState } from 'react';
import { Modal } from '../Modal';
import { ConfirmDialog } from '../ConfirmDialog';
import { Student } from '../../types';
import { useClassData } from '../../context/ClassDataContext';
import { 
  User, 
  Phone, 
  MapPin, 
  Users2, 
  HeartPulse, 
  Award, 
  CalendarCheck2, 
  FileText, 
  Clock, 
  Edit3, 
  Trash2,
  AlertTriangle
} from 'lucide-react';

interface StudentDetailModalProps {
  student: Student | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit: (student: Student) => void;
  onDelete: (student: Student) => void;
}

export const StudentDetailModal: React.FC<StudentDetailModalProps> = ({
  student,
  isOpen,
  onClose,
  onEdit,
  onDelete,
}) => {
  const { attendance, grades, notes } = useClassData();
  const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] = useState(false);

  if (!student) return null;

  // Compute student stats
  const studentAttendance = attendance.filter(a => a.studentId === student.id);
  const hadirCount = studentAttendance.filter(a => a.status === 'Hadir').length;
  const sakitCount = studentAttendance.filter(a => a.status === 'Sakit').length;
  const izinCount = studentAttendance.filter(a => a.status === 'Izin').length;
  const alfaCount = studentAttendance.filter(a => a.status === 'Alfa').length;
  const attendanceRate = studentAttendance.length > 0 
    ? Math.round((hadirCount / studentAttendance.length) * 100) 
    : 100;

  // Lateness count
  const terlambatCount = studentAttendance.filter(a => a.note?.toLowerCase().includes('terlambat')).length;

  // Grades stats
  const studentGrades = grades.filter(g => g.studentId === student.id);
  const avgGrade = studentGrades.length > 0
    ? Math.round(studentGrades.reduce((sum, g) => sum + g.score, 0) / studentGrades.length)
    : 0;

  // Notes
  const studentNotes = notes.filter(n => n.studentId === student.id);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Profil Lengkap Siswa"
      subtitle={`${student.name} • ${student.className}`}
      maxWidth="3xl"
    >
      <div className="space-y-6">
        
        {/* Header Profile Card */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-2xl bg-gradient-to-r from-rose-50 to-pink-50/50 border border-rose-100">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-[#D9468F] text-white flex items-center justify-center font-bold text-2xl shadow-md shadow-rose-500/20 overflow-hidden shrink-0">
              {student.avatarUrl ? (
                <img 
                  src={student.avatarUrl} 
                  alt={student.name} 
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <span>{student.name.charAt(0)}</span>
              )}
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-lg font-bold text-slate-900">{student.name}</h3>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                  student.gender === 'L' ? 'bg-sky-100 text-sky-700' : 'bg-pink-100 text-pink-700'
                }`}>
                  {student.gender === 'L' ? 'Laki-laki' : 'Perempuan'}
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 text-emerald-700">
                  {student.status}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                NIS: <span className="font-mono text-slate-700">{student.nis}</span> • NISN: <span className="font-mono text-slate-700">{student.nisn}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-center">
            <button
              onClick={() => {
                onClose();
                onEdit(student);
              }}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 transition-colors active:scale-97 min-h-[44px]"
            >
              <Edit3 className="w-3.5 h-3.5 text-slate-600" />
              <span>Edit Data</span>
            </button>
            <button
              onClick={() => setIsConfirmDeleteOpen(true)}
              className="inline-flex items-center justify-center w-11 h-11 rounded-xl text-rose-600 dark:text-rose-400 bg-white dark:bg-slate-800 border border-rose-200 dark:border-rose-900/50 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors active:scale-97 min-h-[44px]"
              title="Hapus Siswa"
              aria-label="Hapus Siswa"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* 4 Summary Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/70">
            <div className="text-[11px] font-medium text-slate-500 flex items-center gap-1.5">
              <CalendarCheck2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>Kehadiran</span>
            </div>
            <div className="text-xl font-bold text-slate-900 mt-1">{attendanceRate}%</div>
            <div className="text-[10px] text-slate-400 mt-0.5">{hadirCount} Hadir • {sakitCount}S • {izinCount}I • {alfaCount}A</div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/70">
            <div className="text-[11px] font-medium text-slate-500 flex items-center gap-1.5">
              <Award className="w-3.5 h-3.5 text-purple-600" />
              <span>Rata-rata Nilai</span>
            </div>
            <div className="text-xl font-bold text-purple-700 mt-1">{avgGrade || '-'}</div>
            <div className="text-[10px] text-slate-400 mt-0.5">{studentGrades.length} Penilaian</div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/70">
            <div className="text-[11px] font-medium text-slate-500 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-amber-600" />
              <span>Keterlambatan</span>
            </div>
            <div className="text-xl font-bold text-amber-600 mt-1">{terlambatCount}x</div>
            <div className="text-[10px] text-slate-400 mt-0.5">Tercatat di catatan absensi</div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/70">
            <div className="text-[11px] font-medium text-slate-500 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-[#D9468F]" />
              <span>Catatan Khusus</span>
            </div>
            <div className="text-xl font-bold text-slate-900 mt-1">{studentNotes.length}</div>
            <div className="text-[10px] text-slate-400 mt-0.5">Perilaku & Akademik</div>
          </div>
        </div>

        {/* 3 Detail Tab Sections */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          
          {/* Section 1: Data Pribadi */}
          <div className="p-4 rounded-2xl border border-slate-200 bg-white space-y-3">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-100 font-semibold text-xs text-slate-800 uppercase tracking-wider">
              <User className="w-4 h-4 text-[#D9468F]" />
              <span>Data Pribadi</span>
            </div>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">Tempat, Tanggal Lahir:</span>
                <span className="font-medium text-slate-800 text-right">
                  {student.birthPlace || '-'}, {student.birthDate ? new Date(student.birthDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : '-'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">No. Telepon / WA Siswa:</span>
                <span className="font-medium text-slate-800">{student.phone || '-'}</span>
              </div>
              <div>
                <span className="text-slate-500 block mb-0.5">Alamat Tempat Tinggal:</span>
                <p className="font-medium text-slate-800 leading-relaxed bg-slate-50 p-2 rounded-xl">
                  {student.address || 'Belum diisi'}
                </p>
              </div>
            </div>
          </div>

          {/* Section 2: Data Orang Tua */}
          <div className="p-4 rounded-2xl border border-slate-200 bg-white space-y-3">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-100 font-semibold text-xs text-slate-800 uppercase tracking-wider">
              <Users2 className="w-4 h-4 text-[#D9468F]" />
              <span>Data Orang Tua / Wali</span>
            </div>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">Nama Ayah:</span>
                <span className="font-medium text-slate-800">{student.parentName || '-'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Nama Ibu:</span>
                <span className="font-medium text-slate-800">{student.parentMotherName || '-'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Pekerjaan Orang Tua:</span>
                <span className="font-medium text-slate-800">{student.parentJob || '-'}</span>
              </div>
              <div className="flex justify-between items-center pt-1">
                <span className="text-slate-500">No. Kontak Orang Tua:</span>
                <span className="font-semibold text-[#D9468F] flex items-center gap-1">
                  <Phone className="w-3.5 h-3.5" />
                  {student.parentPhone || '-'}
                </span>
              </div>
            </div>
          </div>

          {/* Section 3: Data Tambahan & Kesehatan */}
          <div className="p-4 rounded-2xl border border-slate-200 bg-white space-y-3">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-100 font-semibold text-xs text-slate-800 uppercase tracking-wider">
              <HeartPulse className="w-4 h-4 text-[#D9468F]" />
              <span>Data Kesehatan & Khusus</span>
            </div>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Golongan Darah:</span>
                <span className="px-2 py-0.5 rounded-md font-bold bg-slate-100 text-slate-800">
                  {student.bloodType || 'Belum diketahui'}
                </span>
              </div>
              <div>
                <span className="text-slate-500 block mb-0.5">Informasi Kesehatan / Alergi:</span>
                <p className="font-medium text-slate-700 bg-amber-50/70 p-2 rounded-xl border border-amber-100/80">
                  {student.healthNotes || 'Tidak ada catatan alergi atau penyakit khusus.'}
                </p>
              </div>
              <div>
                <span className="text-slate-500 block mb-0.5">Catatan Khusus Wali Kelas:</span>
                <p className="font-medium text-slate-700 bg-slate-50 p-2 rounded-xl">
                  {student.specialNotes || 'Belum ada catatan khusus.'}
                </p>
              </div>
            </div>
          </div>

          {/* Section 4: Riwayat Catatan Perkembangan */}
          <div className="p-4 rounded-2xl border border-slate-200 bg-white space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <span className="font-semibold text-xs text-slate-800 uppercase tracking-wider flex items-center gap-2">
                <FileText className="w-4 h-4 text-[#D9468F]" />
                Catatan Perilaku
              </span>
              <span className="text-[11px] text-slate-400">{studentNotes.length} Catatan</span>
            </div>

            {studentNotes.length === 0 ? (
              <p className="text-xs text-slate-400 py-3 text-center">Belum ada catatan perkembangan untuk siswa ini.</p>
            ) : (
              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {studentNotes.map(n => (
                  <div key={n.id} className="p-2.5 rounded-xl border border-slate-100 bg-slate-50 text-xs">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-semibold text-slate-800">{n.category}</span>
                      <span className={`px-2 py-0.5 rounded-md text-[10px] font-semibold ${
                        n.status === 'Positif' ? 'bg-emerald-100 text-emerald-700' :
                        n.status === 'Perlu Perhatian' ? 'bg-amber-100 text-amber-700' :
                        'bg-rose-100 text-rose-700'
                      }`}>
                        {n.status}
                      </span>
                    </div>
                    <p className="text-slate-600 leading-relaxed">{n.note}</p>
                    <div className="text-[10px] text-slate-400 mt-1">{n.date}</div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

      </div>

      {/* Delete Confirmation Alert Dialog */}
      <ConfirmDialog
        isOpen={isConfirmDeleteOpen}
        onClose={() => setIsConfirmDeleteOpen(false)}
        onConfirm={() => {
          setIsConfirmDeleteOpen(false);
          onDelete(student);
        }}
        title="Hapus Data Siswa"
        itemName={`${student.name} • NIS: ${student.nis}`}
        message={`Apakah Anda yakin ingin menghapus data siswa "${student.name}"? Seluruh riwayat absensi, rekap nilai, dan catatan siswa ini akan ikut dihapus secara permanen.`}
        confirmText="Hapus Siswa"
        isDangerous
      />
    </Modal>
  );
};
