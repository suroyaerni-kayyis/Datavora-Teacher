import React, { useState, useMemo } from 'react';
import { useClassData } from '../../context/ClassDataContext';
import { standardSubjects } from '../../data/mockData';
import { AssessmentType, GradeRecord } from '../../types';
import { 
  GraduationCap, 
  Plus, 
  Download, 
  Upload, 
  Check, 
  Edit3, 
  Trash2, 
  Calculator,
  Award,
  BookOpen,
  Filter
} from 'lucide-react';
import { Modal } from '../Modal';
import { ConfirmDialog } from '../ConfirmDialog';

type DeletingGradeTarget = 
  | {
      type: 'single';
      gradeId: string;
      studentName: string;
      assessmentType: AssessmentType;
      subject: string;
      score: number;
    }
  | {
      type: 'studentAll';
      studentId: string;
      studentName: string;
      subject: string;
      gradeIds: string[];
    }
  | {
      type: 'categoryAll';
      assessmentType: AssessmentType;
      subject: string;
      gradeIds: string[];
    };

export const NilaiView: React.FC = () => {
  const { students, grades, addGrade, updateGrade, deleteGrade, bulkAddGrades, classInfo } = useClassData();

  // Selected Subject
  const [selectedSubject, setSelectedSubject] = useState<string>('Matematika');

  // Deletion confirmation state
  const [deletingGradeTarget, setDeletingGradeTarget] = useState<DeletingGradeTarget | null>(null);

  // Input Modal state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newGradeData, setNewGradeData] = useState<{
    subject: string;
    assessmentType: AssessmentType;
    date: string;
    scores: { [studentId: string]: number | '' };
  }>({
    subject: 'Matematika',
    assessmentType: 'Ulangan Harian',
    date: new Date().toISOString().split('T')[0],
    scores: {},
  });

  // Assessment categories
  const assessmentCategories: AssessmentType[] = ['Tugas', 'Kuis', 'Ulangan Harian', 'PTS', 'PAS', 'Praktik'];

  // Map student scores for current subject
  const studentSubjectScores = useMemo(() => {
    return students.map(student => {
      const stdGrades = grades.filter(g => g.studentId === student.id && g.subject === selectedSubject);
      
      const scoresByCategory: { [key in AssessmentType]?: { score: number; id: string } } = {};
      let total = 0;
      let count = 0;

      assessmentCategories.forEach(cat => {
        const found = stdGrades.find(g => g.assessmentType === cat);
        if (found) {
          scoresByCategory[cat] = { score: found.score, id: found.id };
          total += found.score;
          count += 1;
        }
      });

      const average = count > 0 ? Math.round((total / count) * 10) / 10 : null;

      return {
        student,
        scores: scoresByCategory,
        average,
      };
    });
  }, [students, grades, selectedSubject]);

  // Overall subject average
  const subjectOverallAvg = useMemo(() => {
    const list = studentSubjectScores.filter(s => s.average !== null);
    if (list.length === 0) return 0;
    const sum = list.reduce((acc, curr) => acc + (curr.average || 0), 0);
    return Math.round((sum / list.length) * 10) / 10;
  }, [studentSubjectScores]);

  // Confirm delete grade handler
  const handleConfirmDeleteGrade = () => {
    if (!deletingGradeTarget) return;

    if (deletingGradeTarget.type === 'single') {
      deleteGrade(deletingGradeTarget.gradeId);
    } else if (deletingGradeTarget.type === 'studentAll' || deletingGradeTarget.type === 'categoryAll') {
      deletingGradeTarget.gradeIds.forEach(id => {
        deleteGrade(id);
      });
    }
    setDeletingGradeTarget(null);
  };

  // Quick single score edit inline
  const handleScoreChange = (studentId: string, assessmentType: AssessmentType, newScoreStr: string) => {
    if (newScoreStr === '') {
      // If teacher empties the field, prompt confirmation before deleting the record
      const existing = grades.find(g => g.studentId === studentId && g.subject === selectedSubject && g.assessmentType === assessmentType);
      if (existing) {
        const std = students.find(s => s.id === studentId);
        setDeletingGradeTarget({
          type: 'single',
          gradeId: existing.id,
          studentName: std?.name || 'Siswa',
          assessmentType,
          subject: selectedSubject,
          score: existing.score,
        });
      }
      return;
    }

    const scoreVal = parseInt(newScoreStr, 10);
    if (isNaN(scoreVal)) return;
    if (scoreVal < 0 || scoreVal > 100) return;

    const existing = grades.find(g => g.studentId === studentId && g.subject === selectedSubject && g.assessmentType === assessmentType);
    if (existing) {
      updateGrade(existing.id, { score: scoreVal });
    } else {
      addGrade({
        studentId,
        subject: selectedSubject,
        assessmentType,
        score: scoreVal,
        date: new Date().toISOString().split('T')[0],
      });
    }
  };

  // Handle batch grade submit
  const handleBatchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const toAdd: Omit<GradeRecord, 'id' | 'createdAt'>[] = [];

    Object.entries(newGradeData.scores).forEach(([studentId, scoreVal]) => {
      if (typeof scoreVal === 'number' && scoreVal >= 0 && scoreVal <= 100) {
        // Check if existing
        const existing = grades.find(g => 
          g.studentId === studentId && 
          g.subject === newGradeData.subject && 
          g.assessmentType === newGradeData.assessmentType
        );
        if (existing) {
          updateGrade(existing.id, { score: scoreVal, date: newGradeData.date });
        } else {
          toAdd.push({
            studentId,
            subject: newGradeData.subject,
            assessmentType: newGradeData.assessmentType,
            score: scoreVal,
            date: newGradeData.date,
          });
        }
      }
    });

    if (toAdd.length > 0) {
      bulkAddGrades(toAdd);
    }
    setIsAddModalOpen(false);
  };

  // Export CSV
  const handleExportCSV = () => {
    if (students.length === 0) return;
    const headers = ['No', 'Nama Siswa', 'NIS', 'Tugas', 'Kuis', 'Ulangan Harian', 'PTS', 'PAS', 'Praktik', 'Rata-rata', 'Predikat'];
    const rows = studentSubjectScores.map((item, idx) => {
      const t = item.scores['Tugas']?.score ?? '-';
      const k = item.scores['Kuis']?.score ?? '-';
      const uh = item.scores['Ulangan Harian']?.score ?? '-';
      const pts = item.scores['PTS']?.score ?? '-';
      const pas = item.scores['PAS']?.score ?? '-';
      const prk = item.scores['Praktik']?.score ?? '-';
      const avg = item.average ?? '-';
      const pred = (item.average || 0) >= 85 ? 'A (Sangat Baik)' : (item.average || 0) >= 75 ? 'B (Baik)' : (item.average || 0) >= 65 ? 'C (Cukup)' : 'D (Perlu Bimbingan)';

      return [idx + 1, `"${item.student.name}"`, `"${item.student.nis}"`, t, k, uh, pts, pas, prk, avg, pred];
    });

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Nilai_${selectedSubject.replace(/\s+/g, '_')}_${classInfo.className.replace(/\s+/g, '_')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-3.5 pb-10">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-slate-900">Buku Nilai Siswa</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Manajemen nilai per mata pelajaran, rekap ulangan & rata-rata otomatis
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
              setNewGradeData({
                subject: selectedSubject,
                assessmentType: 'Ulangan Harian',
                date: new Date().toISOString().split('T')[0],
                scores: {},
              });
              setIsAddModalOpen(true);
            }}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#D9468F] hover:bg-[#C2357A] text-white text-xs font-semibold shadow-xs transition-colors active:scale-97 min-h-[36px]"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>+ Input Penilaian</span>
          </button>
        </div>
      </div>

      {/* Subject Filter Carousel / Dropdown */}
      <div className="bg-white p-2.5 sm:p-3 rounded-xl border border-slate-200/90 shadow-xs flex flex-col md:flex-row items-center justify-between gap-2.5">
        <div className="flex items-center gap-2.5 w-full md:w-auto">
          <span className="text-xs font-semibold text-slate-600 shrink-0">Mata Pelajaran:</span>
          <select
            value={selectedSubject}
            onChange={e => setSelectedSubject(e.target.value)}
            className="w-full sm:w-60 px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#D9468F] bg-white min-h-[36px]"
          >
            {standardSubjects.map(sub => (
              <option key={sub} value={sub}>{sub}</option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end text-xs">
          <div className="flex items-center gap-1.5">
            <span className="text-slate-500 text-[11px]">Rata-rata Kelas:</span>
            <span className="font-bold text-slate-900 text-sm">{subjectOverallAvg || '-'}</span>
          </div>

          <div className="flex items-center gap-1.5 border-l border-slate-200 pl-3">
            <span className="text-slate-500 text-[11px]">KKM:</span>
            <span className="px-1.5 py-0.2 rounded font-bold text-[11px] bg-slate-100 text-slate-700">75</span>
          </div>
        </div>
      </div>

      {/* Visual Legend */}
      <div className="flex flex-wrap items-center gap-3 text-[10px] text-slate-500 px-1">
        <span>Indikator Nilai:</span>
        <div className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-emerald-500" />
          <span>Tinggi (≥ 85)</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-[#D9468F]" />
          <span>Sedang (75 – 84)</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-rose-500" />
          <span>Rendah / Remidi (&lt; 75)</span>
        </div>
      </div>

      {/* Grade Table */}
      <div className="bg-white rounded-xl border border-slate-200/90 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[750px]">
            <thead>
              <tr className="border-b border-slate-200/90 bg-slate-50/80 text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
                <th className="py-2 px-3 w-10 text-center">No</th>
                <th className="py-2 px-3">Nama Siswa</th>
                {assessmentCategories.map(cat => {
                  const catGradeIds = grades
                    .filter(g => g.subject === selectedSubject && g.assessmentType === cat)
                    .map(g => g.id);
                  return (
                    <th key={cat} className="py-2 px-2 text-center group/th">
                      <div className="inline-flex items-center justify-center gap-1">
                        <span>{cat}</span>
                        {catGradeIds.length > 0 && (
                          <button
                            type="button"
                            onClick={() => setDeletingGradeTarget({
                              type: 'categoryAll',
                              assessmentType: cat,
                              subject: selectedSubject,
                              gradeIds: catGradeIds,
                            })}
                            className="opacity-0 group-hover/th:opacity-100 p-0.5 rounded text-slate-400 hover:text-rose-600 transition-opacity"
                            title={`Hapus seluruh nilai kolom ${cat}`}
                            aria-label={`Hapus seluruh nilai ${cat}`}
                          >
                            <Trash2 className="w-2.5 h-2.5" />
                          </button>
                        )}
                      </div>
                    </th>
                  );
                })}
                <th className="py-2 px-3 text-center font-bold text-[#D9468F]">Rata-rata</th>
                <th className="py-2 px-3 text-right">Predikat</th>
                <th className="py-2 px-2 text-center w-12">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {studentSubjectScores.map((item, idx) => {
                const avg = item.average;
                return (
                  <tr key={item.student.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-2 px-3 text-center text-slate-400 font-medium">{idx + 1}</td>
                    
                    <td className="py-2 px-3">
                      <div className="font-semibold text-slate-900 text-xs">{item.student.name}</div>
                      <div className="text-[10px] text-slate-400 font-mono">NIS: {item.student.nis}</div>
                    </td>

                    {/* Category score inputs/display */}
                    {assessmentCategories.map(cat => {
                      const scoreObj = item.scores[cat];
                      const scoreVal = scoreObj?.score;

                      return (
                        <td key={cat} className="py-1.5 px-1.5 text-center">
                          <div className="relative group/cell inline-flex items-center justify-center">
                            <input
                              type="number"
                              min={0}
                              max={100}
                              value={scoreVal !== undefined ? scoreVal : ''}
                              placeholder="-"
                              onChange={e => handleScoreChange(item.student.id, cat, e.target.value)}
                              className={`w-12 text-center py-1 px-1 rounded-md border text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#D9468F] transition-colors ${
                                scoreVal === undefined 
                                  ? 'border-slate-200 text-slate-400 bg-slate-50/50' :
                                scoreVal >= 85 
                                  ? 'border-emerald-200 text-emerald-700 bg-emerald-50/50' :
                                scoreVal >= 75 
                                  ? 'border-rose-200 text-[#D9468F] bg-rose-50/30' :
                                  'border-rose-300 text-rose-700 bg-rose-50 font-bold'
                              }`}
                            />
                            {scoreObj && (
                              <button
                                type="button"
                                onClick={() => setDeletingGradeTarget({
                                  type: 'single',
                                  gradeId: scoreObj.id,
                                  studentName: item.student.name,
                                  assessmentType: cat,
                                  subject: selectedSubject,
                                  score: scoreVal !== undefined ? scoreVal : 0,
                                })}
                                className="absolute -top-1 -right-1 opacity-0 group-hover/cell:opacity-100 p-0.5 rounded-full bg-rose-100 text-rose-600 hover:bg-rose-200 transition-opacity shadow-xs"
                                title={`Hapus nilai ${cat} (${scoreVal})`}
                                aria-label={`Hapus nilai ${cat}`}
                              >
                                <Trash2 className="w-2.5 h-2.5" />
                              </button>
                            )}
                          </div>
                        </td>
                      );
                    })}

                    {/* Rata-rata */}
                    <td className="py-2 px-3 text-center">
                      <span className={`font-bold text-xs ${
                        avg === null ? 'text-slate-300' :
                        avg >= 85 ? 'text-emerald-600' :
                        avg >= 75 ? 'text-[#D9468F]' :
                        'text-rose-600'
                      }`}>
                        {avg !== null ? avg : '-'}
                      </span>
                    </td>

                    {/* Predikat */}
                    <td className="py-2 px-3 text-right">
                      <span className={`inline-block px-1.5 py-0.5 rounded-md text-[10px] font-semibold ${
                        avg === null ? 'bg-slate-100 text-slate-400' :
                        avg >= 85 ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' :
                        avg >= 75 ? 'bg-rose-50 text-[#D9468F] border border-rose-100' :
                        'bg-rose-100 text-rose-700'
                      }`}>
                        {avg === null ? 'Belum Ada' : avg >= 85 ? 'A (Sangat Baik)' : avg >= 75 ? 'B (Baik)' : 'C (Remidi)'}
                      </span>
                    </td>

                    {/* Aksi */}
                    <td className="py-2 px-2 text-center">
                      {Object.keys(item.scores).length > 0 ? (
                        <button
                          type="button"
                          onClick={() => {
                            const studentGradeIds = Object.values(item.scores)
                              .filter((s): s is { score: number; id: string } => Boolean(s))
                              .map(s => s.id);
                            setDeletingGradeTarget({
                              type: 'studentAll',
                              studentId: item.student.id,
                              studentName: item.student.name,
                              subject: selectedSubject,
                              gradeIds: studentGradeIds,
                            });
                          }}
                          className="p-1 rounded-md text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                          title={`Hapus seluruh nilai ${selectedSubject} siswa ini`}
                          aria-label={`Hapus nilai ${item.student.name}`}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      ) : (
                        <span className="text-[10px] text-slate-300">-</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Batch Add Assessment Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Input Penilaian Sekaligus"
        subtitle={`Input massal nilai untuk mata pelajaran ${selectedSubject}`}
        maxWidth="xl"
      >
        <form onSubmit={handleBatchSubmit} className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Mata Pelajaran</label>
              <select
                value={newGradeData.subject}
                onChange={e => setNewGradeData({ ...newGradeData, subject: e.target.value })}
                className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#D9468F] bg-white min-h-[36px]"
              >
                {standardSubjects.map(sub => (
                  <option key={sub} value={sub}>{sub}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Jenis Penilaian</label>
              <select
                value={newGradeData.assessmentType}
                onChange={e => setNewGradeData({ ...newGradeData, assessmentType: e.target.value as AssessmentType })}
                className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#D9468F] bg-white min-h-[36px]"
              >
                {assessmentCategories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Tanggal</label>
              <input
                type="date"
                value={newGradeData.date}
                onChange={e => setNewGradeData({ ...newGradeData, date: e.target.value })}
                className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-[#D9468F] bg-white min-h-[36px]"
              />
            </div>
          </div>

          <div className="pt-2 border-t border-slate-100">
            <span className="text-xs font-semibold text-slate-700 block mb-1.5">
              Daftar Nilai Siswa (Skala 0 - 100):
            </span>

            <div className="max-h-56 overflow-y-auto divide-y divide-slate-100 border border-slate-200 rounded-lg">
              {students.map((std, idx) => (
                <div key={std.id} className="p-2 flex items-center justify-between gap-2.5 text-xs">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-slate-400 w-4">{idx + 1}.</span>
                    <span className="font-medium text-slate-800 truncate">{std.name}</span>
                  </div>
                  <input
                    type="number"
                    min={0}
                    max={100}
                    placeholder="0-100"
                    value={newGradeData.scores[std.id] ?? ''}
                    onChange={e => {
                      const val = e.target.value === '' ? '' : parseInt(e.target.value, 10);
                      setNewGradeData(prev => ({
                        ...prev,
                        scores: {
                          ...prev.scores,
                          [std.id]: val,
                        }
                      }));
                    }}
                    className="w-16 px-2 py-1 text-center rounded-md border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#D9468F]"
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="pt-2.5 border-t border-slate-100 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsAddModalOpen(false)}
              className="px-3 py-1.5 rounded-lg text-xs font-medium text-slate-600 hover:bg-slate-100 min-h-[36px]"
            >
              Batal
            </button>
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-[#D9468F] hover:bg-[#C2357A] text-white text-xs font-semibold transition-colors min-h-[36px]"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Simpan Seluruh Nilai</span>
            </button>
          </div>
        </form>
      </Modal>

      {/* Grade Deletion Alert Dialog */}
      <ConfirmDialog
        isOpen={Boolean(deletingGradeTarget)}
        onClose={() => setDeletingGradeTarget(null)}
        onConfirm={handleConfirmDeleteGrade}
        title={
          deletingGradeTarget?.type === 'single'
            ? 'Hapus Data Nilai Siswa'
            : deletingGradeTarget?.type === 'studentAll'
            ? 'Hapus Rekap Nilai Siswa'
            : 'Hapus Seluruh Kolom Nilai'
        }
        itemName={
          deletingGradeTarget?.type === 'single'
            ? `${deletingGradeTarget.studentName} • ${deletingGradeTarget.assessmentType}: ${deletingGradeTarget.score}`
            : deletingGradeTarget?.type === 'studentAll'
            ? `${deletingGradeTarget.studentName} • Mapel ${deletingGradeTarget.subject}`
            : `Kolom ${deletingGradeTarget?.assessmentType} • Mapel ${deletingGradeTarget?.subject}`
        }
        message={
          deletingGradeTarget?.type === 'single'
            ? `Apakah Anda yakin ingin menghapus nilai ${deletingGradeTarget.assessmentType} untuk siswa "${deletingGradeTarget.studentName}" pada mata pelajaran ${deletingGradeTarget.subject}? Data nilai ini akan dikosongkan.`
            : deletingGradeTarget?.type === 'studentAll'
            ? `Apakah Anda yakin ingin menghapus seluruh nilai mata pelajaran ${deletingGradeTarget.subject} (${deletingGradeTarget.gradeIds.length} rekaman nilai) untuk siswa "${deletingGradeTarget.studentName}"?`
            : `Apakah Anda yakin ingin menghapus seluruh rekaman nilai "${deletingGradeTarget?.assessmentType}" pada mata pelajaran ${deletingGradeTarget?.subject} untuk semua siswa (${deletingGradeTarget?.gradeIds.length} data)?`
        }
        confirmText={
          deletingGradeTarget?.type === 'single'
            ? 'Hapus Nilai'
            : deletingGradeTarget?.type === 'studentAll'
            ? 'Hapus Nilai Siswa'
            : 'Hapus Seluruh Kolom'
        }
        isDangerous
      />
    </div>
  );
};
