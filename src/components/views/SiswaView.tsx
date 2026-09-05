import React, { useState, useMemo } from 'react';
import { useClassData } from '../../context/ClassDataContext';
import { Student, Gender, StudentStatus } from '../../types';
import { 
  Search, 
  Filter, 
  UserPlus, 
  Eye, 
  Edit3, 
  Trash2, 
  RotateCcw,
  Users,
  Download,
  Phone,
  CheckCircle2
} from 'lucide-react';
import { StudentDetailModal } from './StudentDetailModal';
import { StudentFormModal } from './StudentFormModal';
import { ConfirmDialog } from '../ConfirmDialog';

interface SiswaViewProps {
  onOpenAddStudent: () => void;
  selectedStudentForDetail?: Student | null;
  onClearSelectedStudent?: () => void;
}

export const SiswaView: React.FC<SiswaViewProps> = ({
  onOpenAddStudent,
  selectedStudentForDetail,
  onClearSelectedStudent,
}) => {
  const { students, deleteStudent, loadDemoData } = useClassData();

  // Search and filters
  const [searchTerm, setSearchTerm] = useState('');
  const [genderFilter, setGenderFilter] = useState<'Semua' | Gender>('Semua');
  const [statusFilter, setStatusFilter] = useState<'Semua' | StudentStatus>('Semua');

  // Modal states
  const [detailStudent, setDetailStudent] = useState<Student | null>(selectedStudentForDetail || null);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [deletingStudent, setDeletingStudent] = useState<Student | null>(null);

  // Sync external prop if passed
  React.useEffect(() => {
    if (selectedStudentForDetail) {
      setDetailStudent(selectedStudentForDetail);
    }
  }, [selectedStudentForDetail]);

  const filteredStudents = useMemo(() => {
    return students.filter(student => {
      const matchSearch = 
        student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.nis.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (student.nisn && student.nisn.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchGender = genderFilter === 'Semua' || student.gender === genderFilter;
      const matchStatus = statusFilter === 'Semua' || student.status === statusFilter;

      return matchSearch && matchGender && matchStatus;
    });
  }, [students, searchTerm, genderFilter, statusFilter]);

  // Export CSV of students
  const handleExportCSV = () => {
    if (students.length === 0) return;
    const headers = ['Nama Lengkap', 'NIS', 'NISN', 'JK', 'Kelas', 'Status', 'Tempat Lahir', 'Tanggal Lahir', 'No HP', 'Nama Ayah', 'Nama Ibu', 'No HP Orang Tua', 'Golongan Darah', 'Alamat'];
    const rows = filteredStudents.map(s => [
      `"${s.name}"`,
      `"${s.nis}"`,
      `"${s.nisn || ''}"`,
      s.gender === 'L' ? 'Laki-laki' : 'Perempuan',
      `"${s.className}"`,
      s.status,
      `"${s.birthPlace || ''}"`,
      `"${s.birthDate || ''}"`,
      `"${s.phone || ''}"`,
      `"${s.parentName || ''}"`,
      `"${s.parentMotherName || ''}"`,
      `"${s.parentPhone || ''}"`,
      `"${s.bloodType || ''}"`,
      `"${(s.address || '').replace(/"/g, '""')}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Daftar_Siswa_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-3.5 pb-8">
      {/* Top Header & Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-slate-900">Data Siswa</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Daftar lengkap biodata, profil, dan rekapitulasi siswa kelas
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            disabled={filteredStudents.length === 0}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50 transition-colors active:scale-97 min-h-[38px]"
            title="Export Excel/CSV"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span className="hidden sm:inline">Export CSV</span>
          </button>

          <button
            onClick={() => {
              setEditingStudent(null);
              setIsFormOpen(true);
            }}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#D9468F] hover:bg-[#C2357A] text-white text-xs font-semibold shadow-xs transition-colors active:scale-97 min-h-[38px]"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>+ Tambah Siswa</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-2.5 rounded-xl border border-slate-200/90 shadow-xs flex flex-col md:flex-row items-center gap-2">
        {/* Search */}
        <div className="relative flex-1 w-full">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="Cari berdasarkan nama, NIS, atau NISN..."
            className="w-full pl-8 pr-3 py-1.5 rounded-lg border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-[#D9468F] placeholder:text-slate-400 min-h-[38px]"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600 p-1"
            >
              Clear
            </button>
          )}
        </div>

        {/* Filter JK & Status */}
        <div className="flex items-center gap-2 w-full md:w-auto">
          <select
            value={genderFilter}
            onChange={e => setGenderFilter(e.target.value as 'Semua' | Gender)}
            className="flex-1 md:flex-initial px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#D9468F] bg-white min-h-[38px]"
          >
            <option value="Semua">Semua JK (L & P)</option>
            <option value="L">Laki-laki (L)</option>
            <option value="P">Perempuan (P)</option>
          </select>

          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value as 'Semua' | StudentStatus)}
            className="flex-1 md:flex-initial px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#D9468F] bg-white min-h-[38px]"
          >
            <option value="Semua">Semua Status</option>
            <option value="Aktif">Aktif</option>
            <option value="Mutasi">Mutasi</option>
            <option value="Lulus">Lulus</option>
            <option value="Non-Aktif">Non-Aktif</option>
          </select>
        </div>
      </div>

      {/* Main Student List / Table */}
      {filteredStudents.length === 0 ? (
        <div className="py-12 text-center bg-white rounded-xl border border-dashed border-slate-200 p-5">
          <div className="w-12 h-12 rounded-xl bg-rose-50 text-[#D9468F] flex items-center justify-center mx-auto mb-2.5">
            <Users className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-semibold text-slate-900">
            {students.length === 0 ? 'Belum Ada Data Siswa' : 'Tidak Ada Siswa yang Sesuai'}
          </h3>
          <p className="text-xs text-slate-500 mt-0.5 max-w-sm mx-auto">
            {students.length === 0 
              ? 'Tambahkan data siswa secara manual atau muat data contoh untuk menguji seluruh fitur aplikasi.' 
              : 'Coba ubah kata kunci pencarian atau sesuaikan pilihan filter di atas.'}
          </p>

          <div className="flex flex-wrap items-center justify-center gap-2.5 mt-4">
            <button
              onClick={() => {
                setEditingStudent(null);
                setIsFormOpen(true);
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-white bg-[#D9468F] hover:bg-[#C2357A] transition-colors active:scale-97 min-h-[38px]"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>+ Tambah Siswa</span>
            </button>
            {students.length === 0 && (
              <button
                onClick={loadDemoData}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-700 border border-slate-200 hover:bg-slate-50 transition-colors active:scale-97 min-h-[38px]"
              >
                <RotateCcw className="w-3.5 h-3.5 text-[#D9468F]" />
                <span>Muat Data Contoh (Demo)</span>
              </button>
            )}
          </div>
        </div>
      ) : (
        <>
          {/* Desktop Table View */}
          <div className="hidden md:block bg-white rounded-xl border border-slate-200/90 overflow-hidden shadow-xs">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200/90 bg-slate-50/80 text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
                  <th className="py-2 px-3 w-10 text-center">No</th>
                  <th className="py-2 px-3">Siswa</th>
                  <th className="py-2 px-3">NIS / NISN</th>
                  <th className="py-2 px-3 text-center">JK</th>
                  <th className="py-2 px-3">Kontak Orang Tua</th>
                  <th className="py-2 px-3 text-center">Status</th>
                  <th className="py-2 px-3 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {filteredStudents.map((student, index) => (
                  <tr 
                    key={student.id} 
                    className="hover:bg-slate-50/80 transition-colors group cursor-pointer"
                    onClick={() => setDetailStudent(student)}
                  >
                    <td className="py-2 px-3 text-center text-slate-400 font-medium">{index + 1}</td>
                    
                    <td className="py-2 px-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-lg bg-[#D9468F]/10 text-[#D9468F] font-bold text-xs flex items-center justify-center shrink-0 overflow-hidden">
                          {student.avatarUrl ? (
                            <img src={student.avatarUrl} alt={student.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                          ) : (
                            student.name.charAt(0)
                          )}
                        </div>
                        <div>
                          <div className="font-semibold text-slate-900 text-xs group-hover:text-[#D9468F] transition-colors">
                            {student.name}
                          </div>
                          <div className="text-[10px] text-slate-400">{student.className}</div>
                        </div>
                      </div>
                    </td>

                    <td className="py-2 px-3">
                      <div className="font-mono text-slate-800 font-medium text-xs">{student.nis}</div>
                      <div className="text-[10px] text-slate-400 font-mono">{student.nisn || '-'}</div>
                    </td>

                    <td className="py-2 px-3 text-center">
                      <span className={`inline-block px-1.5 py-0.2 rounded font-semibold text-[10px] ${
                        student.gender === 'L' ? 'bg-sky-50 text-sky-700 border border-sky-100' : 'bg-pink-50 text-pink-700 border border-pink-100'
                      }`}>
                        {student.gender === 'L' ? 'L' : 'P'}
                      </span>
                    </td>

                    <td className="py-2 px-3">
                      <div className="text-slate-700 font-medium text-xs">{student.parentName || '-'}</div>
                      <div className="text-[10px] text-slate-500 flex items-center gap-1 mt-0.5">
                        <Phone className="w-3 h-3 text-slate-400" />
                        <span>{student.parentPhone || student.phone || '-'}</span>
                      </div>
                    </td>

                    <td className="py-2 px-3 text-center">
                      <span className="inline-block px-2 py-0.5 rounded-md text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-100">
                        {student.status}
                      </span>
                    </td>

                    <td className="py-2 px-3 text-right" onClick={e => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-0.5">
                        <button
                          onClick={() => setDetailStudent(student)}
                          className="p-1 rounded-md text-slate-500 hover:text-[#D9468F] hover:bg-rose-50 transition-colors"
                          title="Lihat Detail Profil"
                          aria-label="Detail"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            setEditingStudent(student);
                            setIsFormOpen(true);
                          }}
                          className="p-1 rounded-md text-slate-500 hover:text-sky-600 hover:bg-sky-50 transition-colors"
                          title="Edit Biodata"
                          aria-label="Edit"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setDeletingStudent(student)}
                          className="p-1 rounded-md text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                          title="Hapus Siswa"
                          aria-label="Hapus"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Card List View */}
          <div className="md:hidden space-y-2.5">
            {filteredStudents.map(student => (
              <div
                key={student.id}
                onClick={() => setDetailStudent(student)}
                className="bg-white p-3 rounded-xl border border-slate-200/90 shadow-xs active:scale-98 transition-all"
              >
                <div className="flex items-start justify-between gap-2.5">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-9 h-9 rounded-xl bg-[#D9468F]/10 text-[#D9468F] font-bold text-sm flex items-center justify-center shrink-0 overflow-hidden">
                      {student.avatarUrl ? (
                        <img src={student.avatarUrl} alt={student.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                      ) : (
                        student.name.charAt(0)
                      )}
                    </div>
                    <div className="min-w-0">
                      <h4 className="font-semibold text-xs text-slate-900 truncate">
                        {student.name}
                      </h4>
                      <div className="flex items-center gap-1.5 text-[11px] text-slate-500 mt-0.5">
                        <span className="font-mono">NIS: {student.nis}</span>
                        <span>•</span>
                        <span className={`px-1 py-0.2 rounded text-[10px] font-semibold ${
                          student.gender === 'L' ? 'text-sky-700 bg-sky-50' : 'text-pink-700 bg-pink-50'
                        }`}>
                          {student.gender === 'L' ? 'L' : 'P'}
                        </span>
                      </div>
                    </div>
                  </div>
                  <span className="px-1.5 py-0.5 rounded-md text-[10px] font-semibold bg-emerald-50 text-emerald-700 shrink-0">
                    {student.status}
                  </span>
                </div>

                <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
                  <div className="truncate text-slate-500 text-[11px]">
                    Ortu: <span className="text-slate-800 font-medium">{student.parentName || '-'}</span>
                  </div>

                  <div className="flex items-center gap-1 shrink-0" onClick={e => e.stopPropagation()}>
                    <button
                      onClick={() => setDetailStudent(student)}
                      className="px-2 py-1 rounded-md text-xs font-medium text-[#D9468F] hover:bg-rose-50"
                    >
                      Detail
                    </button>
                    <button
                      onClick={() => {
                        setEditingStudent(student);
                        setIsFormOpen(true);
                      }}
                      className="px-2 py-1 rounded-md text-xs font-medium text-slate-600 hover:bg-slate-100"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => setDeletingStudent(student)}
                      className="p-1 rounded-md text-rose-600 hover:bg-rose-50"
                      aria-label="Hapus"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Student Detail Modal */}
      <StudentDetailModal
        student={detailStudent}
        isOpen={Boolean(detailStudent)}
        onClose={() => {
          setDetailStudent(null);
          if (onClearSelectedStudent) onClearSelectedStudent();
        }}
        onEdit={std => {
          setEditingStudent(std);
          setIsFormOpen(true);
        }}
        onDelete={std => setDeletingStudent(std)}
      />

      {/* Student Form Modal (Add / Edit) */}
      <StudentFormModal
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setEditingStudent(null);
        }}
        studentToEdit={editingStudent}
      />

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={Boolean(deletingStudent)}
        onClose={() => setDeletingStudent(null)}
        onConfirm={() => {
          if (deletingStudent) {
            deleteStudent(deletingStudent.id);
            setDeletingStudent(null);
          }
        }}
        title="Hapus Data Siswa"
        itemName={deletingStudent ? `${deletingStudent.name} • NIS: ${deletingStudent.nis}` : undefined}
        message={`Apakah Anda yakin ingin menghapus data siswa "${deletingStudent?.name}"? Seluruh riwayat absensi, rekap nilai, dan catatan siswa ini akan ikut dihapus secara permanen.`}
        confirmText="Hapus Siswa"
        isDangerous
      />
    </div>
  );
};
