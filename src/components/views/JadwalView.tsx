import React, { useState } from 'react';
import { useClassData } from '../../context/ClassDataContext';
import { DayOfWeek, ScheduleItem, DutySchedule } from '../../types';
import { 
  CalendarRange, 
  Sparkles, 
  Plus, 
  Edit3, 
  Trash2, 
  Clock, 
  User, 
  MapPin, 
  Check
} from 'lucide-react';
import { Modal } from '../Modal';
import { ConfirmDialog } from '../ConfirmDialog';
import { standardSubjects } from '../../data/mockData';

export const JadwalView: React.FC = () => {
  const { 
    schedule, 
    dutySchedule, 
    students, 
    addSchedule, 
    updateSchedule, 
    deleteSchedule, 
    updateDutyGroup,
    addDutyGroup,
    classInfo
  } = useClassData();

  const [activeSubTab, setActiveSubTab] = useState<'pelajaran' | 'piket'>('pelajaran');
  const [selectedDay, setSelectedDay] = useState<DayOfWeek | 'Semua'>('Semua');

  // Deletion state
  const [deletingLesson, setDeletingLesson] = useState<ScheduleItem | null>(null);

  const days: DayOfWeek[] = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat'];

  // Modal Lesson state
  const [isLessonModalOpen, setIsLessonModalOpen] = useState(false);
  const [editingLesson, setEditingLesson] = useState<ScheduleItem | null>(null);
  const [lessonForm, setLessonForm] = useState<{
    day: DayOfWeek;
    startTime: string;
    endTime: string;
    subject: string;
    teacher: string;
    room: string;
  }>({
    day: 'Senin',
    startTime: '07:00',
    endTime: '08:30',
    subject: 'Matematika',
    teacher: '',
    room: 'Ruang 8-B',
  });

  // Modal Duty state
  const [isDutyModalOpen, setIsDutyModalOpen] = useState(false);
  const [dutyDayToEdit, setDutyDayToEdit] = useState<DayOfWeek>('Senin');
  const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([]);

  // Open Lesson Form
  const handleOpenAddLesson = (day?: DayOfWeek) => {
    setEditingLesson(null);
    setLessonForm({
      day: day || 'Senin',
      startTime: '07:00',
      endTime: '08:30',
      subject: 'Matematika',
      teacher: '',
      room: classInfo.className || 'Ruang Kelas',
    });
    setIsLessonModalOpen(true);
  };

  const handleOpenEditLesson = (lesson: ScheduleItem) => {
    setEditingLesson(lesson);
    setLessonForm({
      day: lesson.day,
      startTime: lesson.startTime,
      endTime: lesson.endTime,
      subject: lesson.subject,
      teacher: lesson.teacher,
      room: lesson.room || '',
    });
    setIsLessonModalOpen(true);
  };

  const handleSaveLesson = (e: React.FormEvent) => {
    e.preventDefault();
    if (!lessonForm.subject || !lessonForm.startTime || !lessonForm.endTime) return;

    if (editingLesson) {
      updateSchedule(editingLesson.id, lessonForm);
    } else {
      addSchedule(lessonForm);
    }
    setIsLessonModalOpen(false);
  };

  // Open Duty Edit
  const handleOpenEditDuty = (duty: DutySchedule | undefined, day: DayOfWeek) => {
    setDutyDayToEdit(day);
    setSelectedStudentIds(duty ? [...duty.memberStudentIds] : []);
    setIsDutyModalOpen(true);
  };

  const handleSaveDuty = () => {
    const existing = dutySchedule.find(d => d.day === dutyDayToEdit);
    if (existing) {
      updateDutyGroup(existing.id, { memberStudentIds: selectedStudentIds });
    } else {
      addDutyGroup({
        groupName: `Piket ${dutyDayToEdit}`,
        day: dutyDayToEdit,
        memberStudentIds: selectedStudentIds,
        tasks: ['Menyapu lantai', 'Membersihkan papan tulis', 'Menata meja'],
      });
    }
    setIsDutyModalOpen(false);
  };

  const toggleStudentForDuty = (studentId: string) => {
    if (selectedStudentIds.includes(studentId)) {
      setSelectedStudentIds(selectedStudentIds.filter(id => id !== studentId));
    } else {
      setSelectedStudentIds([...selectedStudentIds, studentId]);
    }
  };

  return (
    <div className="space-y-3.5 pb-10">
      {/* Header & Sub-tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-slate-900">Jadwal Kelas</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Manajemen jam pelajaran harian dan daftar regu piket kebersihan kelas
          </p>
        </div>

        <div className="flex items-center p-0.5 bg-slate-200/70 rounded-lg w-full sm:w-auto">
          <button
            onClick={() => setActiveSubTab('pelajaran')}
            className={`flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all min-h-[34px] ${
              activeSubTab === 'pelajaran'
                ? 'bg-white text-[#D9468F] shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <CalendarRange className="w-3.5 h-3.5" />
            <span>Jadwal Pelajaran</span>
          </button>
          <button
            onClick={() => setActiveSubTab('piket')}
            className={`flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all min-h-[34px] ${
              activeSubTab === 'piket'
                ? 'bg-white text-[#D9468F] shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Jadwal Piket</span>
          </button>
        </div>
      </div>

      {activeSubTab === 'pelajaran' ? (
        /* Sub-tab 1: Jadwal Pelajaran */
        <div className="space-y-3">
          {/* Day Filter & Add button */}
          <div className="bg-white p-2.5 rounded-xl border border-slate-200/90 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
            <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0">
              <button
                onClick={() => setSelectedDay('Semua')}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors min-h-[32px] ${
                  selectedDay === 'Semua'
                    ? 'bg-[#D9468F] text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                Semua Hari
              </button>
              {days.map(day => (
                <button
                  key={day}
                  onClick={() => setSelectedDay(day)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors min-h-[32px] ${
                    selectedDay === day
                      ? 'bg-[#D9468F] text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {day}
                </button>
              ))}
            </div>

            <button
              onClick={() => handleOpenAddLesson()}
              className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#D9468F] hover:bg-[#C2357A] text-white text-xs font-semibold shadow-xs transition-colors active:scale-97 min-h-[36px]"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+ Tambah Mata Pelajaran</span>
            </button>
          </div>

          {/* Days Grid / List */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {days
              .filter(day => selectedDay === 'Semua' || selectedDay === day)
              .map(day => {
                const dayLessons = schedule
                  .filter(l => l.day === day)
                  .sort((a, b) => a.startTime.localeCompare(b.startTime));

                return (
                  <div 
                    key={day} 
                    className="bg-white rounded-xl border border-slate-200/90 overflow-hidden shadow-xs flex flex-col"
                  >
                    {/* Day Header */}
                    <div className="bg-slate-50/80 px-3 py-2 border-b border-slate-100 flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-[#D9468F]" />
                        <h3 className="font-bold text-xs text-slate-900">{day}</h3>
                      </div>
                      <button
                        onClick={() => handleOpenAddLesson(day)}
                        className="text-[10px] font-semibold text-[#D9468F] hover:underline flex items-center gap-0.5"
                      >
                        <Plus className="w-3 h-3" />
                        <span>Tambah</span>
                      </button>
                    </div>

                    {/* Lessons list */}
                    <div className="p-2.5 divide-y divide-slate-100 flex-1">
                      {dayLessons.length === 0 ? (
                        <div className="py-6 text-center text-slate-400 text-xs">
                          Belum ada jadwal di hari {day}.
                        </div>
                      ) : (
                        dayLessons.map(lesson => (
                          <div key={lesson.id} className="py-2 first:pt-0 last:pb-0 group">
                            <div className="flex items-start justify-between gap-2">
                              <div>
                                <div className="flex items-center gap-1 text-[11px] text-[#D9468F] font-semibold">
                                  <Clock className="w-3 h-3" />
                                  <span>{lesson.startTime} - {lesson.endTime}</span>
                                </div>
                                <h4 className="font-bold text-xs text-slate-800 mt-0.5">
                                  {lesson.subject}
                                </h4>
                                <div className="flex items-center gap-2.5 text-[10px] text-slate-500 mt-0.5">
                                  {lesson.teacher && (
                                    <span className="flex items-center gap-1">
                                      <User className="w-3 h-3 text-slate-400" />
                                      {lesson.teacher}
                                    </span>
                                  )}
                                  {lesson.room && (
                                    <span className="flex items-center gap-1">
                                      <MapPin className="w-3 h-3 text-slate-400" />
                                      {lesson.room}
                                    </span>
                                  )}
                                </div>
                              </div>

                              <div className="flex items-center gap-0.5 opacity-80 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                                <button
                                  onClick={() => handleOpenEditLesson(lesson)}
                                  className="p-1 rounded-md text-slate-400 hover:text-sky-600 hover:bg-sky-50"
                                  title="Edit"
                                >
                                  <Edit3 className="w-3 h-3" />
                                </button>
                                <button
                                  onClick={() => setDeletingLesson(lesson)}
                                  className="p-1 rounded-md text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                                  title="Hapus"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </button>
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      ) : (
        /* Sub-tab 2: Jadwal Piket */
        <div className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            {days.map(day => {
              const duty = dutySchedule.find(d => d.day === day);
              const assignedStudentIds = duty?.memberStudentIds || [];
              const assignedStudents = students.filter(s => assignedStudentIds.includes(s.id));

              return (
                <div 
                  key={day}
                  className="bg-white rounded-xl border border-slate-200/90 shadow-xs overflow-hidden flex flex-col"
                >
                  <div className="p-2.5 bg-gradient-to-r from-rose-50 to-pink-50/40 border-b border-rose-100 flex items-center justify-between">
                    <div>
                      <h3 className="font-bold text-xs text-slate-900">{day}</h3>
                      <span className="text-[10px] text-[#D9468F] font-semibold">
                        {assignedStudents.length} Siswa Piket
                      </span>
                    </div>
                    <button
                      onClick={() => handleOpenEditDuty(duty, day)}
                      className="p-1 rounded-md bg-white border border-rose-200 text-[#D9468F] hover:bg-rose-50 text-xs font-semibold shadow-2xs"
                      title="Ubah Siswa Piket"
                    >
                      <Edit3 className="w-3 h-3" />
                    </button>
                  </div>

                  <div className="p-2 space-y-1.5 flex-1">
                    {assignedStudents.length === 0 ? (
                      <p className="text-xs text-slate-400 text-center py-5">
                        Belum ada siswa ditugaskan.
                      </p>
                    ) : (
                      assignedStudents.map((std, idx) => (
                        <div key={std.id} className="p-1.5 rounded-lg bg-slate-50 border border-slate-100 flex items-center gap-2">
                          <div className="w-5 h-5 rounded-md bg-[#D9468F]/15 text-[#D9468F] font-bold text-[10px] flex items-center justify-center shrink-0">
                            {idx + 1}
                          </div>
                          <div className="min-w-0">
                            <div className="font-semibold text-xs text-slate-800 truncate">{std.name}</div>
                            <div className="text-[10px] text-slate-400">NIS: {std.nis}</div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Lesson Add/Edit Modal */}
      <Modal
        isOpen={isLessonModalOpen}
        onClose={() => setIsLessonModalOpen(false)}
        title={editingLesson ? 'Edit Jadwal Pelajaran' : 'Tambah Jadwal Pelajaran'}
        subtitle={`Atur sesi pelajaran untuk kelas ${classInfo.className}`}
        maxWidth="md"
      >
        <form onSubmit={handleSaveLesson} className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Hari</label>
            <select
              value={lessonForm.day}
              onChange={e => setLessonForm({ ...lessonForm, day: e.target.value as DayOfWeek })}
              className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#D9468F] bg-white min-h-[36px]"
            >
              {days.map(d => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Jam Mulai</label>
              <input
                type="text"
                value={lessonForm.startTime}
                onChange={e => setLessonForm({ ...lessonForm, startTime: e.target.value })}
                placeholder="07:00"
                className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-[#D9468F] min-h-[36px]"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Jam Selesai</label>
              <input
                type="text"
                value={lessonForm.endTime}
                onChange={e => setLessonForm({ ...lessonForm, endTime: e.target.value })}
                placeholder="08:30"
                className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-[#D9468F] min-h-[36px]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Mata Pelajaran</label>
            <select
              value={lessonForm.subject}
              onChange={e => setLessonForm({ ...lessonForm, subject: e.target.value })}
              className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#D9468F] bg-white min-h-[36px]"
            >
              {standardSubjects.map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Guru Pengajar</label>
            <input
              type="text"
              value={lessonForm.teacher}
              onChange={e => setLessonForm({ ...lessonForm, teacher: e.target.value })}
              placeholder="mis. Budi Santoso, M.Pd"
              className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-[#D9468F] min-h-[36px]"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Ruangan / Lab</label>
            <input
              type="text"
              value={lessonForm.room}
              onChange={e => setLessonForm({ ...lessonForm, room: e.target.value })}
              placeholder="mis. Ruang Kelas / Lab IPA"
              className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-[#D9468F] min-h-[36px]"
            />
          </div>

          <div className="pt-2.5 border-t border-slate-100 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsLessonModalOpen(false)}
              className="px-3 py-1.5 rounded-lg text-xs font-medium text-slate-600 hover:bg-slate-100 min-h-[36px]"
            >
              Batal
            </button>
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-[#D9468F] hover:bg-[#C2357A] text-white text-xs font-semibold transition-colors min-h-[36px]"
            >
              <Check className="w-3.5 h-3.5" />
              <span>{editingLesson ? 'Simpan Perubahan' : 'Tambahkan'}</span>
            </button>
          </div>
        </form>
      </Modal>

      {/* Duty Assign Modal */}
      <Modal
        isOpen={isDutyModalOpen}
        onClose={() => setIsDutyModalOpen(false)}
        title={`Atur Siswa Piket Hari ${dutyDayToEdit}`}
        subtitle="Pilih siswa yang bertugas menjaga kebersihan kelas pada hari ini"
        maxWidth="lg"
      >
        <div className="space-y-3">
          <p className="text-xs text-slate-500">
            Centang siswa yang bertugas piket ({selectedStudentIds.length} dipilih):
          </p>

          <div className="max-h-60 overflow-y-auto divide-y divide-slate-100 border border-slate-200 rounded-lg">
            {students.map(std => {
              const isSelected = selectedStudentIds.includes(std.id);
              return (
                <div
                  key={std.id}
                  onClick={() => toggleStudentForDuty(std.id)}
                  className={`p-2.5 flex items-center justify-between cursor-pointer transition-colors ${
                    isSelected ? 'bg-rose-50/60' : 'hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <div className={`w-4 h-4 rounded border flex items-center justify-center ${
                      isSelected ? 'bg-[#D9468F] border-[#D9468F] text-white' : 'border-slate-300'
                    }`}>
                      {isSelected && <Check className="w-3 h-3" />}
                    </div>
                    <div>
                      <div className="font-semibold text-xs text-slate-800">{std.name}</div>
                      <div className="text-[10px] text-slate-400">NIS: {std.nis} • {std.gender}</div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="pt-2.5 border-t border-slate-100 flex items-center justify-end gap-2">
            <button
              onClick={() => setIsDutyModalOpen(false)}
              className="px-3 py-1.5 rounded-lg text-xs font-medium text-slate-600 hover:bg-slate-100 min-h-[36px]"
            >
              Batal
            </button>
            <button
              onClick={handleSaveDuty}
              className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-[#D9468F] hover:bg-[#C2357A] text-white text-xs font-semibold transition-colors min-h-[36px]"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Simpan Regu Piket</span>
            </button>
          </div>
        </div>
      </Modal>

      {/* Delete Schedule Confirmation Alert Dialog */}
      <ConfirmDialog
        isOpen={Boolean(deletingLesson)}
        onClose={() => setDeletingLesson(null)}
        onConfirm={() => {
          if (deletingLesson) {
            deleteSchedule(deletingLesson.id);
            setDeletingLesson(null);
          }
        }}
        title="Hapus Jadwal Pelajaran"
        itemName={deletingLesson ? `${deletingLesson.day} • ${deletingLesson.subject} (${deletingLesson.startTime} - ${deletingLesson.endTime})` : undefined}
        message={`Apakah Anda yakin ingin menghapus jadwal pelajaran ${deletingLesson?.subject} pada hari ${deletingLesson?.day}?`}
        confirmText="Hapus Jadwal"
        isDangerous
      />
    </div>
  );
};
