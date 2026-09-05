import React, { useState, useMemo } from 'react';
import { useClassData } from '../../context/ClassDataContext';
import { NoteCategory, StudentNote, NoteStatus, Student } from '../../types';
import { 
  BookOpen, 
  Plus, 
  Search, 
  Trash2, 
  Check, 
  Download
} from 'lucide-react';
import { Modal } from '../Modal';
import { ConfirmDialog } from '../ConfirmDialog';

interface CatatanViewProps {
  isAddNoteOpen?: boolean;
  setIsAddNoteOpen?: (open: boolean) => void;
  onSelectStudent?: (student: Student) => void;
}

export const CatatanView: React.FC<CatatanViewProps> = ({
  isAddNoteOpen: externalAddOpen,
  setIsAddNoteOpen: externalSetAddOpen,
  onSelectStudent,
}) => {
  const { notes, students, addStudentNote, deleteStudentNote, classInfo } = useClassData();

  const [internalAddOpen, setInternalAddOpen] = useState(false);
  const isModalOpen = externalAddOpen !== undefined ? externalAddOpen : internalAddOpen;
  const setModalOpen = externalSetAddOpen || setInternalAddOpen;

  // Deletion state
  const [deletingNote, setDeletingNote] = useState<StudentNote | null>(null);

  // Filters
  const [selectedCategory, setSelectedCategory] = useState<'Semua' | NoteCategory>('Semua');
  const [selectedStatus, setSelectedStatus] = useState<'Semua' | NoteStatus>('Semua');
  const [searchTerm, setSearchTerm] = useState('');

  // Form State
  const [noteForm, setNoteForm] = useState<{
    studentId: string;
    date: string;
    category: NoteCategory;
    note: string;
    followUpPlan: string;
    status: NoteStatus;
  }>({
    studentId: students[0]?.id || '',
    date: new Date().toISOString().split('T')[0],
    category: 'Akademik',
    note: '',
    followUpPlan: '',
    status: 'Positif',
  });

  const categories: NoteCategory[] = [
    'Prestasi',
    'Akademik',
    'Perilaku',
    'Kedisiplinan',
    'Sosial',
    'Konseling',
    'Lainnya',
  ];

  const filteredNotes = useMemo(() => {
    return notes.filter(n => {
      const studentObj = students.find(s => s.id === n.studentId);
      const studentName = studentObj ? studentObj.name : '';
      const matchCat = selectedCategory === 'Semua' || n.category === selectedCategory;
      const matchStatus = selectedStatus === 'Semua' || n.status === selectedStatus;
      const matchSearch = 
        studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        n.note.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (n.followUpPlan && n.followUpPlan.toLowerCase().includes(searchTerm.toLowerCase()));
      return matchCat && matchStatus && matchSearch;
    });
  }, [notes, students, selectedCategory, selectedStatus, searchTerm]);

  const handleSubmitNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteForm.studentId || !noteForm.note.trim()) return;

    addStudentNote({
      studentId: noteForm.studentId,
      date: noteForm.date,
      category: noteForm.category,
      note: noteForm.note.trim(),
      followUpPlan: noteForm.followUpPlan.trim(),
      status: noteForm.status,
    });

    setModalOpen(false);
    setNoteForm({
      studentId: students[0]?.id || '',
      date: new Date().toISOString().split('T')[0],
      category: 'Akademik',
      note: '',
      followUpPlan: '',
      status: 'Positif',
    });
  };

  // Export Notes
  const handleExportCSV = () => {
    if (notes.length === 0) return;
    const headers = ['No', 'Tanggal', 'Nama Siswa', 'Kategori', 'Status', 'Catatan / Deskripsi', 'Tindak Lanjut'];
    const rows = filteredNotes.map((n, idx) => {
      const studentObj = students.find(s => s.id === n.studentId);
      return [
        idx + 1,
        n.date,
        `"${studentObj?.name || 'Siswa'}"`,
        `"${n.category}"`,
        n.status,
        `"${n.note.replace(/"/g, '""')}"`,
        `"${(n.followUpPlan || '').replace(/"/g, '""')}"`,
      ];
    });

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Catatan_Siswa_${classInfo.className.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-3.5 pb-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-slate-900">Catatan & Perkembangan Siswa</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Jurnal pembinaan karakter, prestasi, kedisiplinan, dan komunikasi dengan orang tua
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors active:scale-97 min-h-[36px]"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={() => {
              if (students.length > 0 && !noteForm.studentId) {
                setNoteForm(prev => ({ ...prev, studentId: students[0].id }));
              }
              setModalOpen(true);
            }}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[#D9468F] hover:bg-[#C2357A] text-white text-xs font-semibold shadow-xs transition-colors active:scale-97 min-h-[36px]"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>+ Catatan Baru</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-2.5 rounded-xl border border-slate-200/90 shadow-xs flex flex-col md:flex-row items-center justify-between gap-2.5">
        <div className="relative w-full md:w-72">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="Cari siswa atau isi catatan..."
            className="w-full pl-8 pr-2.5 py-1.5 rounded-lg border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-[#D9468F] min-h-[36px]"
          />
        </div>

        <div className="flex items-center gap-1.5 w-full md:w-auto">
          <select
            value={selectedCategory}
            onChange={e => setSelectedCategory(e.target.value as 'Semua' | NoteCategory)}
            className="flex-1 md:flex-initial px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#D9468F] bg-white min-h-[36px]"
          >
            <option value="Semua">Semua Kategori</option>
            {categories.map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>

          <select
            value={selectedStatus}
            onChange={e => setSelectedStatus(e.target.value as 'Semua' | NoteStatus)}
            className="flex-1 md:flex-initial px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#D9468F] bg-white min-h-[36px]"
          >
            <option value="Semua">Semua Status</option>
            <option value="Positif">Positif / Prestasi</option>
            <option value="Perlu Perhatian">Perlu Perhatian</option>
            <option value="Perlu Tindak Lanjut">Perlu Tindak Lanjut</option>
          </select>
        </div>
      </div>

      {/* Notes Cards Stream */}
      {filteredNotes.length === 0 ? (
        <div className="py-12 text-center bg-white rounded-xl border border-dashed border-slate-200 p-5">
          <BookOpen className="w-10 h-10 text-slate-300 mx-auto mb-2" />
          <p className="text-xs font-semibold text-slate-700">Belum Ada Catatan Siswa</p>
          <p className="text-[11px] text-slate-400 mt-0.5 max-w-sm mx-auto">
            Catat perkembangan sikap, prestasi, maupun tindak lanjut pembinaan siswa agar terdokumentasi dengan baik.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {filteredNotes.map(record => {
            const studentObj = students.find(s => s.id === record.studentId);
            const studentName = studentObj ? studentObj.name : 'Siswa';

            return (
              <div
                key={record.id}
                className={`p-3 sm:p-3.5 rounded-xl border bg-white shadow-xs flex flex-col justify-between transition-all ${
                  record.status === 'Perlu Tindak Lanjut' 
                    ? 'border-rose-200 hover:border-rose-300' :
                  record.status === 'Perlu Perhatian'
                    ? 'border-amber-200 hover:border-amber-300' :
                  'border-slate-200/90 hover:border-slate-300'
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-2.5">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center font-bold text-xs">
                        {studentName.charAt(0)}
                      </div>
                      <div>
                        <h3 
                          onClick={() => studentObj && onSelectStudent && onSelectStudent(studentObj)}
                          className="font-bold text-xs text-slate-900 hover:text-[#D9468F] transition-colors cursor-pointer"
                        >
                          {studentName}
                        </h3>
                        <span className="text-[10px] text-slate-400">{record.date}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                        record.status === 'Positif' 
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' :
                        record.status === 'Perlu Perhatian'
                          ? 'bg-amber-50 text-amber-700 border border-amber-100' :
                        'bg-rose-50 text-rose-700 border border-rose-100'
                      }`}>
                        {record.status}
                      </span>
                      <button
                        onClick={() => setDeletingNote(record)}
                        className="p-1 rounded-md text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                        title="Hapus catatan"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>

                  <div className="mt-2.5">
                    <span className="inline-block px-2 py-0.5 rounded-md text-[10px] font-semibold bg-slate-100 text-slate-700 mb-1">
                      {record.category}
                    </span>
                    <p className="text-xs text-slate-700 leading-relaxed">
                      {record.note}
                    </p>
                  </div>
                </div>

                {record.followUpPlan && (
                  <div className="mt-3 pt-2.5 border-t border-slate-100 bg-slate-50/70 -mx-3 sm:-mx-3.5 -mb-3 sm:-mb-3.5 p-2.5 sm:px-3.5 rounded-b-xl">
                    <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider block">
                      Tindak Lanjut / Solusi:
                    </span>
                    <p className="text-xs text-slate-700 font-medium mt-0.5">
                      {record.followUpPlan}
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Add Note Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setModalOpen(false)}
        title="Catatan Perkembangan Siswa"
        subtitle="Dokumentasikan prestasi, pelanggaran, atau komunikasi orang tua"
        maxWidth="lg"
      >
        <form onSubmit={handleSubmitNote} className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">
              Pilih Siswa <span className="text-rose-500">*</span>
            </label>
            <select
              value={noteForm.studentId}
              onChange={e => setNoteForm({ ...noteForm, studentId: e.target.value })}
              className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#D9468F] bg-white min-h-[36px]"
            >
              {students.map(s => (
                <option key={s.id} value={s.id}>{s.name} ({s.nis})</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Tanggal</label>
              <input
                type="date"
                value={noteForm.date}
                onChange={e => setNoteForm({ ...noteForm, date: e.target.value })}
                className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-[#D9468F] bg-white min-h-[36px]"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Kategori</label>
              <select
                value={noteForm.category}
                onChange={e => setNoteForm({ ...noteForm, category: e.target.value as NoteCategory })}
                className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#D9468F] bg-white min-h-[36px]"
              >
                {categories.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Klasifikasi Sifat</label>
              <select
                value={noteForm.status}
                onChange={e => setNoteForm({ ...noteForm, status: e.target.value as NoteStatus })}
                className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#D9468F] bg-white min-h-[36px]"
              >
                <option value="Positif">Positif / Prestasi</option>
                <option value="Perlu Perhatian">Perlu Perhatian</option>
                <option value="Perlu Tindak Lanjut">Perlu Tindak Lanjut</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">
              Isi Catatan Perkembangan <span className="text-rose-500">*</span>
            </label>
            <textarea
              required
              rows={3}
              value={noteForm.note}
              onChange={e => setNoteForm({ ...noteForm, note: e.target.value })}
              placeholder="Jelaskan secara objektif perilaku, prestasi, atau kronologi kejadian..."
              className="w-full px-2.5 py-2 rounded-lg border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-[#D9468F]"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">
              Rencana Tindak Lanjut / Arahan Wali Kelas
            </label>
            <input
              type="text"
              value={noteForm.followUpPlan}
              onChange={e => setNoteForm({ ...noteForm, followUpPlan: e.target.value })}
              placeholder="mis. Konseling empat mata, apresiasi sertifikat, atau hubungi wali murid via WA"
              className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-[#D9468F] min-h-[36px]"
            />
          </div>

          <div className="pt-2.5 border-t border-slate-100 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="px-3 py-1.5 rounded-lg text-xs font-medium text-slate-600 hover:bg-slate-100 min-h-[36px]"
            >
              Batal
            </button>
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-[#D9468F] hover:bg-[#C2357A] text-white text-xs font-semibold transition-colors min-h-[36px]"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Simpan Catatan</span>
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Note Confirmation Alert Dialog */}
      <ConfirmDialog
        isOpen={Boolean(deletingNote)}
        onClose={() => setDeletingNote(null)}
        onConfirm={() => {
          if (deletingNote) {
            deleteStudentNote(deletingNote.id);
            setDeletingNote(null);
          }
        }}
        title="Hapus Catatan Siswa"
        itemName={deletingNote ? `${deletingNote.studentName} • ${deletingNote.category} (${deletingNote.status})` : undefined}
        message={`Apakah Anda yakin ingin menghapus catatan untuk siswa "${deletingNote?.studentName}"? Riwayat catatan ini akan dihapus permanen.`}
        confirmText="Hapus Catatan"
        isDangerous
      />
    </div>
  );
};
