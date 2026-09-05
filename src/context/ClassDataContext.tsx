import React, { createContext, useContext, useState, useEffect, useMemo, ReactNode, useCallback } from 'react';
import { 
  Student, 
  AttendanceRecord, 
  GradeRecord, 
  ScheduleItem, 
  DutySchedule, 
  CashTransaction, 
  PaymentItem, 
  StudentNote, 
  ClassInfo,
  AttendanceStatus,
  PaymentStatus
} from '../types';
import { 
  initialClassInfo, 
  sampleStudents, 
  sampleAttendance, 
  sampleGrades, 
  sampleSchedule, 
  sampleDutySchedule, 
  sampleCashTransactions, 
  samplePayments, 
  sampleStudentNotes 
} from '../data/mockData';
import {
  checkDatabaseHealth,
  fetchAllRemoteData,
  seedRemoteData,
  syncRemoteStudent,
  deleteRemoteStudent,
  syncRemoteAttendanceBatch,
  deleteRemoteAttendance,
  syncRemoteGrade,
  syncRemoteBulkGrades,
  deleteRemoteGrade,
  syncRemoteSchedule,
  deleteRemoteSchedule,
  syncRemoteDutySchedule,
  deleteRemoteDutySchedule,
  syncRemoteCashTransaction,
  deleteRemoteCashTransaction,
  syncRemotePayment,
  deleteRemotePayment,
  syncRemoteStudentNote,
  deleteRemoteStudentNote,
  syncRemoteClassInfo,
  resetRemoteBackendData,
} from '../lib/databaseService';

export interface ToastMessage {
  id: string;
  message: string;
  type: 'success' | 'info' | 'warning' | 'error';
}

export interface ActivityItem {
  id: string;
  title: string;
  time: string;
  type: 'attendance' | 'grade' | 'cash' | 'note' | 'student';
  timestamp: number;
}

export type DbStatus = 'connected' | 'offline' | 'syncing';

interface ClassDataContextType {
  classInfo: ClassInfo;
  students: Student[];
  attendance: AttendanceRecord[];
  grades: GradeRecord[];
  schedule: ScheduleItem[];
  dutySchedule: DutySchedule[];
  cashTransactions: CashTransaction[];
  payments: PaymentItem[];
  notes: StudentNote[];
  toasts: ToastMessage[];

  // Database / Backend Sync Status
  dbStatus: DbStatus;
  dbMode: string;
  lastSyncTime: string | null;
  syncNow: () => Promise<void>;

  // Toast
  showToast: (message: string, type?: 'success' | 'info' | 'warning' | 'error') => void;
  removeToast: (id: string) => void;

  // Student actions
  addStudent: (student: Omit<Student, 'id' | 'createdAt'>) => void;
  updateStudent: (id: string, student: Partial<Student>) => void;
  deleteStudent: (id: string) => void;

  // Attendance actions
  saveAttendanceBatch: (records: { studentId: string; status: AttendanceStatus; note?: string; time?: string }[], date: string) => void;
  deleteAttendanceRecord: (id: string) => void;

  // Grade actions
  addGrade: (grade: Omit<GradeRecord, 'id' | 'createdAt'>) => void;
  updateGrade: (id: string, grade: Partial<GradeRecord>) => void;
  deleteGrade: (id: string) => void;
  bulkAddGrades: (grades: Omit<GradeRecord, 'id' | 'createdAt'>[]) => void;

  // Schedule actions
  addSchedule: (item: Omit<ScheduleItem, 'id'>) => void;
  updateSchedule: (id: string, item: Partial<ScheduleItem>) => void;
  deleteSchedule: (id: string) => void;

  // Duty actions
  addDutyGroup: (group: Omit<DutySchedule, 'id'>) => void;
  updateDutyGroup: (id: string, group: Partial<DutySchedule>) => void;
  deleteDutyGroup: (id: string) => void;

  // Cash actions
  addCashTransaction: (trx: Omit<CashTransaction, 'id' | 'createdAt'>) => void;
  deleteCashTransaction: (id: string) => void;

  // Payment actions
  addPaymentItem: (item: Omit<PaymentItem, 'id' | 'createdAt'>) => void;
  updatePaymentStatus: (id: string, status: PaymentStatus, date?: string) => void;
  deletePaymentItem: (id: string) => void;
  createBatchPaymentForFee: (feeName: string, amount: number) => void;

  // Note actions
  addStudentNote: (note: Omit<StudentNote, 'id' | 'createdAt'>) => void;
  updateStudentNote: (id: string, note: Partial<StudentNote>) => void;
  deleteStudentNote: (id: string) => void;

  // System actions
  updateClassInfo: (info: Partial<ClassInfo>) => void;
  loadDemoData: () => void;
  clearAllData: () => void;
  exportBackupJSON: () => void;
  importBackupJSON: (jsonString: string) => boolean;

  // Computed properties
  totalStudents: number;
  cashBalance: {
    totalIncome: number;
    totalExpense: number;
    balance: number;
  };
  todayAttendanceSummary: {
    hadir: number;
    sakit: number;
    izin: number;
    alfa: number;
    belum: number;
    total: number;
  };
  overallAverageScore: number;
  studentsNeedingAttention: {
    student: Student;
    reasons: string[];
  }[];
  recentActivities: ActivityItem[];
}

const STORAGE_KEY = 'walikelas_plus_data_v1';

const ClassDataContext = createContext<ClassDataContextType | undefined>(undefined);

export const ClassDataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Initialize state from localStorage or demo defaults
  const [classInfo, setClassInfo] = useState<ClassInfo>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_info`);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return {
          ...initialClassInfo,
          ...parsed,
          schoolLogo: parsed.schoolLogo !== undefined ? parsed.schoolLogo : initialClassInfo.schoolLogo,
          headmasterName: parsed.headmasterName || initialClassInfo.headmasterName,
          headmasterNip: parsed.headmasterNip || initialClassInfo.headmasterNip,
        };
      } catch {
        return initialClassInfo;
      }
    }
    return initialClassInfo;
  });

  const [students, setStudents] = useState<Student[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_students`);
    return saved ? JSON.parse(saved) : [];
  });

  const [attendance, setAttendance] = useState<AttendanceRecord[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_attendance`);
    return saved ? JSON.parse(saved) : [];
  });

  const [grades, setGrades] = useState<GradeRecord[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_grades`);
    return saved ? JSON.parse(saved) : [];
  });

  const [schedule, setSchedule] = useState<ScheduleItem[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_schedule`);
    return saved ? JSON.parse(saved) : [];
  });

  const [dutySchedule, setDutySchedule] = useState<DutySchedule[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_duty`);
    return saved ? JSON.parse(saved) : [];
  });

  const [cashTransactions, setCashTransactions] = useState<CashTransaction[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_cash`);
    return saved ? JSON.parse(saved) : [];
  });

  const [payments, setPayments] = useState<PaymentItem[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_payments`);
    return saved ? JSON.parse(saved) : [];
  });

  const [notes, setNotes] = useState<StudentNote[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_notes`);
    return saved ? JSON.parse(saved) : [];
  });

  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [dbStatus, setDbStatus] = useState<DbStatus>('syncing');
  const [dbMode, setDbMode] = useState<string>('Supabase / PostgreSQL');
  const [lastSyncTime, setLastSyncTime] = useState<string | null>(null);

  // Sync state changes to localStorage cache
  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_info`, JSON.stringify(classInfo));
  }, [classInfo]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_students`, JSON.stringify(students));
  }, [students]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_attendance`, JSON.stringify(attendance));
  }, [attendance]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_grades`, JSON.stringify(grades));
  }, [grades]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_schedule`, JSON.stringify(schedule));
  }, [schedule]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_duty`, JSON.stringify(dutySchedule));
  }, [dutySchedule]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_cash`, JSON.stringify(cashTransactions));
  }, [cashTransactions]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_payments`, JSON.stringify(payments));
  }, [payments]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_notes`, JSON.stringify(notes));
  }, [notes]);

  // Toast handling
  const showToast = (message: string, type: 'success' | 'info' | 'warning' | 'error' = 'success') => {
    const id = Date.now().toString() + Math.random().toString(36).substring(2, 5);
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3500);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  // Sync data from remote database
  const syncNow = useCallback(async () => {
    setDbStatus('syncing');
    try {
      const health = await checkDatabaseHealth();
      setDbMode(health.backend);

      if (health.status !== 'connected') {
        setDbStatus('offline');
        return;
      }

      const remoteData = await fetchAllRemoteData();
      if (remoteData) {
        // If remote database has students, populate state
        if (Array.isArray(remoteData.students) && remoteData.students.length > 0) {
          if (remoteData.classInfo) {
            setClassInfo(prev => ({ ...prev, ...remoteData.classInfo }));
          }
          setStudents(remoteData.students);
          if (Array.isArray(remoteData.attendance)) setAttendance(remoteData.attendance);
          if (Array.isArray(remoteData.grades)) setGrades(remoteData.grades);
          if (Array.isArray(remoteData.schedule)) setSchedule(remoteData.schedule);
          if (Array.isArray(remoteData.dutySchedule)) setDutySchedule(remoteData.dutySchedule);
          if (Array.isArray(remoteData.cashTransactions)) setCashTransactions(remoteData.cashTransactions);
          if (Array.isArray(remoteData.payments)) setPayments(remoteData.payments);
          if (Array.isArray(remoteData.notes)) setNotes(remoteData.notes);
        } else {
          // If remote is empty, ensure local state is also empty (fresh install)
          setStudents([]);
          setAttendance([]);
          setGrades([]);
          setSchedule([]);
          setDutySchedule([]);
          setCashTransactions([]);
          setPayments([]);
          setNotes([]);
        }
        setDbStatus('connected');
        setLastSyncTime(new Date().toLocaleTimeString('id-ID'));
      } else {
        setDbStatus('offline');
      }
    } catch (err) {
      console.warn('Sync failed, continuing with local state:', err);
      setDbStatus('offline');
    }
  }, [classInfo]);

  // Initial load on mount
  useEffect(() => {
    syncNow();
  }, [syncNow]);

  // Student actions
  const addStudent = (studentData: Omit<Student, 'id' | 'createdAt'>) => {
    const newStudent: Student = {
      ...studentData,
      id: 'std-' + Date.now(),
      createdAt: new Date().toISOString(),
    };
    setStudents(prev => [newStudent, ...prev]);
    showToast(`Data siswa "${newStudent.name}" berhasil ditambahkan!`, 'success');

    // Sync to PostgreSQL backend
    syncRemoteStudent(newStudent).then(() => {
      setLastSyncTime(new Date().toLocaleTimeString('id-ID'));
    });
  };

  const updateStudent = (id: string, updatedData: Partial<Student>) => {
    let updatedStudent: Student | null = null;
    setStudents(prev => prev.map(std => {
      if (std.id === id) {
        updatedStudent = { ...std, ...updatedData };
        return updatedStudent;
      }
      return std;
    }));
    showToast('Data siswa berhasil diperbarui', 'success');

    if (updatedStudent) {
      syncRemoteStudent(updatedStudent).then(() => {
        setLastSyncTime(new Date().toLocaleTimeString('id-ID'));
      });
    }
  };

  const deleteStudent = (id: string) => {
    const target = students.find(s => s.id === id);
    setStudents(prev => prev.filter(std => std.id !== id));
    setAttendance(prev => prev.filter(a => a.studentId !== id));
    setGrades(prev => prev.filter(g => g.studentId !== id));
    setPayments(prev => prev.filter(p => p.studentId !== id));
    setNotes(prev => prev.filter(n => n.studentId !== id));
    setDutySchedule(prev => prev.map(d => ({
      ...d,
      memberStudentIds: d.memberStudentIds.filter(mid => mid !== id)
    })));
    showToast(`Data siswa "${target?.name || ''}" berhasil dihapus`, 'info');

    // Sync to backend
    deleteRemoteStudent(id).then(() => {
      setLastSyncTime(new Date().toLocaleTimeString('id-ID'));
    });
  };

  // Attendance actions
  const saveAttendanceBatch = (
    records: { studentId: string; status: AttendanceStatus; note?: string; time?: string }[],
    date: string
  ) => {
    const studentIds = new Set(records.map(r => r.studentId));
    const newRecords: AttendanceRecord[] = records.map(r => ({
      id: `${r.studentId}_${date}`,
      studentId: r.studentId,
      date,
      time: r.time || new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
      status: r.status,
      note: r.note || '',
      createdAt: new Date().toISOString(),
    }));

    setAttendance(prev => {
      const filtered = prev.filter(item => !(item.date === date && studentIds.has(item.studentId)));
      return [...newRecords, ...filtered];
    });
    showToast(`Absensi tanggal ${date} berhasil disimpan (${records.length} siswa)`, 'success');

    // Sync to backend
    syncRemoteAttendanceBatch(records, date).then(() => {
      setLastSyncTime(new Date().toLocaleTimeString('id-ID'));
    });
  };

  const deleteAttendanceRecord = (id: string) => {
    setAttendance(prev => prev.filter(a => a.id !== id));
    showToast('Catatan absensi berhasil dihapus', 'info');
    deleteRemoteAttendance(id).then(() => {
      setLastSyncTime(new Date().toLocaleTimeString('id-ID'));
    });
  };

  // Grade actions
  const addGrade = (gradeData: Omit<GradeRecord, 'id' | 'createdAt'>) => {
    const newGrade: GradeRecord = {
      ...gradeData,
      id: 'grd-' + Date.now() + '-' + Math.random().toString(36).substring(2, 5),
      createdAt: new Date().toISOString(),
    };
    setGrades(prev => [newGrade, ...prev]);
    showToast('Nilai berhasil disimpan', 'success');

    syncRemoteGrade(newGrade).then(() => {
      setLastSyncTime(new Date().toLocaleTimeString('id-ID'));
    });
  };

  const updateGrade = (id: string, updatedData: Partial<GradeRecord>) => {
    let updatedGrade: GradeRecord | null = null;
    setGrades(prev => prev.map(g => {
      if (g.id === id) {
        updatedGrade = { ...g, ...updatedData };
        return updatedGrade;
      }
      return g;
    }));
    showToast('Nilai berhasil diperbarui', 'success');

    if (updatedGrade) {
      syncRemoteGrade(updatedGrade).then(() => {
        setLastSyncTime(new Date().toLocaleTimeString('id-ID'));
      });
    }
  };

  const deleteGrade = (id: string) => {
    setGrades(prev => prev.filter(g => g.id !== id));
    showToast('Data nilai berhasil dihapus', 'info');
    deleteRemoteGrade(id).then(() => {
      setLastSyncTime(new Date().toLocaleTimeString('id-ID'));
    });
  };

  const bulkAddGrades = (newGradesList: Omit<GradeRecord, 'id' | 'createdAt'>[]) => {
    const timestamp = new Date().toISOString();
    const formatted = newGradesList.map((g, idx) => ({
      ...g,
      id: 'grd-' + Date.now() + '-' + idx,
      createdAt: timestamp,
    }));
    setGrades(prev => [...formatted, ...prev]);
    showToast(`${formatted.length} nilai berhasil diinput sekaligus`, 'success');

    syncRemoteBulkGrades(formatted).then(() => {
      setLastSyncTime(new Date().toLocaleTimeString('id-ID'));
    });
  };

  // Schedule actions
  const addSchedule = (item: Omit<ScheduleItem, 'id'>) => {
    const newItem: ScheduleItem = {
      ...item,
      id: 'sch-' + Date.now(),
    };
    setSchedule(prev => [...prev, newItem]);
    showToast(`Jadwal ${newItem.subject} berhasil ditambahkan`, 'success');

    syncRemoteSchedule(newItem).then(() => {
      setLastSyncTime(new Date().toLocaleTimeString('id-ID'));
    });
  };

  const updateSchedule = (id: string, item: Partial<ScheduleItem>) => {
    let updatedSchedule: ScheduleItem | null = null;
    setSchedule(prev => prev.map(s => {
      if (s.id === id) {
        updatedSchedule = { ...s, ...item };
        return updatedSchedule;
      }
      return s;
    }));
    showToast('Jadwal pelajaran berhasil diperbarui', 'success');

    if (updatedSchedule) {
      syncRemoteSchedule(updatedSchedule).then(() => {
        setLastSyncTime(new Date().toLocaleTimeString('id-ID'));
      });
    }
  };

  const deleteSchedule = (id: string) => {
    setSchedule(prev => prev.filter(s => s.id !== id));
    showToast('Jadwal berhasil dihapus', 'info');
    deleteRemoteSchedule(id).then(() => {
      setLastSyncTime(new Date().toLocaleTimeString('id-ID'));
    });
  };

  // Duty group actions
  const addDutyGroup = (group: Omit<DutySchedule, 'id'>) => {
    const newGroup: DutySchedule = {
      ...group,
      id: 'duty-' + Date.now(),
    };
    setDutySchedule(prev => [...prev, newGroup]);
    showToast(`Kelompok piket "${newGroup.groupName}" berhasil ditambahkan`, 'success');

    syncRemoteDutySchedule(newGroup).then(() => {
      setLastSyncTime(new Date().toLocaleTimeString('id-ID'));
    });
  };

  const updateDutyGroup = (id: string, group: Partial<DutySchedule>) => {
    let updatedDuty: DutySchedule | null = null;
    setDutySchedule(prev => prev.map(d => {
      if (d.id === id) {
        updatedDuty = { ...d, ...group };
        return updatedDuty;
      }
      return d;
    }));
    showToast('Data piket berhasil diperbarui', 'success');

    if (updatedDuty) {
      syncRemoteDutySchedule(updatedDuty).then(() => {
        setLastSyncTime(new Date().toLocaleTimeString('id-ID'));
      });
    }
  };

  const deleteDutyGroup = (id: string) => {
    setDutySchedule(prev => prev.filter(d => d.id !== id));
    showToast('Kelompok piket berhasil dihapus', 'info');
    deleteRemoteDutySchedule(id).then(() => {
      setLastSyncTime(new Date().toLocaleTimeString('id-ID'));
    });
  };

  // Cash actions
  const addCashTransaction = (trx: Omit<CashTransaction, 'id' | 'createdAt'>) => {
    const newTrx: CashTransaction = {
      ...trx,
      id: 'cash-' + Date.now(),
      createdAt: new Date().toISOString(),
    };
    setCashTransactions(prev => [newTrx, ...prev]);
    showToast(`Transaksi kas (${newTrx.type}) berhasil dicatat`, 'success');

    syncRemoteCashTransaction(newTrx).then(() => {
      setLastSyncTime(new Date().toLocaleTimeString('id-ID'));
    });
  };

  const deleteCashTransaction = (id: string) => {
    setCashTransactions(prev => prev.filter(c => c.id !== id));
    showToast('Transaksi kas berhasil dihapus', 'info');
    deleteRemoteCashTransaction(id).then(() => {
      setLastSyncTime(new Date().toLocaleTimeString('id-ID'));
    });
  };

  // Payment actions
  const addPaymentItem = (item: Omit<PaymentItem, 'id' | 'createdAt'>) => {
    const newItem: PaymentItem = {
      ...item,
      id: 'pay-' + Date.now(),
      createdAt: new Date().toISOString(),
    };
    setPayments(prev => [newItem, ...prev]);
    showToast('Catatan iuran siswa ditambahkan', 'success');

    syncRemotePayment(newItem).then(() => {
      setLastSyncTime(new Date().toLocaleTimeString('id-ID'));
    });
  };

  const updatePaymentStatus = (id: string, status: PaymentStatus, date?: string) => {
    let updatedPayment: PaymentItem | null = null;
    setPayments(prev => prev.map(p => {
      if (p.id === id) {
        updatedPayment = {
          ...p,
          status,
          date: status === 'Sudah Bayar' ? (date || new Date().toISOString().split('T')[0]) : undefined,
        };
        return updatedPayment;
      }
      return p;
    }));
    showToast(`Status pembayaran diperbarui: ${status}`, 'success');

    if (updatedPayment) {
      syncRemotePayment(updatedPayment).then(() => {
        setLastSyncTime(new Date().toLocaleTimeString('id-ID'));
      });
    }
  };

  const deletePaymentItem = (id: string) => {
    setPayments(prev => prev.filter(p => p.id !== id));
    showToast('Data tagihan iuran dihapus', 'info');
    deleteRemotePayment(id).then(() => {
      setLastSyncTime(new Date().toLocaleTimeString('id-ID'));
    });
  };

  const createBatchPaymentForFee = (feeName: string, amount: number) => {
    if (students.length === 0) {
      showToast('Tidak ada siswa untuk membuat tagihan iuran', 'error');
      return;
    }
    const timestamp = new Date().toISOString();
    const newItems: PaymentItem[] = students.map((std, idx) => ({
      id: 'pay-' + Date.now() + '-' + idx,
      studentId: std.id,
      feeName,
      amount,
      status: 'Belum Bayar',
      createdAt: timestamp,
    }));
    setPayments(prev => [...newItems, ...prev]);
    showToast(`Tagihan "${feeName}" berhasil dibuat untuk ${students.length} siswa`, 'success');

    // Sync each to backend
    newItems.forEach(item => syncRemotePayment(item));
  };

  // Student Note actions
  const addStudentNote = (noteData: Omit<StudentNote, 'id' | 'createdAt'>) => {
    const newNote: StudentNote = {
      ...noteData,
      id: 'note-' + Date.now(),
      createdAt: new Date().toISOString(),
    };
    setNotes(prev => [newNote, ...prev]);
    showToast('Catatan perkembangan siswa berhasil ditambahkan', 'success');

    syncRemoteStudentNote(newNote).then(() => {
      setLastSyncTime(new Date().toLocaleTimeString('id-ID'));
    });
  };

  const updateStudentNote = (id: string, noteData: Partial<StudentNote>) => {
    let updatedNote: StudentNote | null = null;
    setNotes(prev => prev.map(n => {
      if (n.id === id) {
        updatedNote = { ...n, ...noteData };
        return updatedNote;
      }
      return n;
    }));
    showToast('Catatan perkembangan diperbarui', 'success');

    if (updatedNote) {
      syncRemoteStudentNote(updatedNote).then(() => {
        setLastSyncTime(new Date().toLocaleTimeString('id-ID'));
      });
    }
  };

  const deleteStudentNote = (id: string) => {
    setNotes(prev => prev.filter(n => n.id !== id));
    showToast('Catatan siswa berhasil dihapus', 'info');
    deleteRemoteStudentNote(id).then(() => {
      setLastSyncTime(new Date().toLocaleTimeString('id-ID'));
    });
  };

  // System actions
  const updateClassInfo = (info: Partial<ClassInfo>) => {
    const updated = { ...classInfo, ...info };
    setClassInfo(updated);
    showToast('Informasi kelas berhasil diperbarui', 'success');
    syncRemoteClassInfo(updated).then(() => {
      setLastSyncTime(new Date().toLocaleTimeString('id-ID'));
    });
  };

  const loadDemoData = () => {
    setClassInfo(initialClassInfo);
    setStudents(sampleStudents);
    setAttendance(sampleAttendance);
    setGrades(sampleGrades);
    setSchedule(sampleSchedule);
    setDutySchedule(sampleDutySchedule);
    setCashTransactions(sampleCashTransactions);
    setPayments(samplePayments);
    setNotes(sampleStudentNotes);
    showToast('Data contoh (Demo) berhasil dimuat', 'success');

    // Reseed backend
    seedRemoteData({
      classInfo: initialClassInfo,
      students: sampleStudents,
      attendance: sampleAttendance,
      grades: sampleGrades,
      schedule: sampleSchedule,
      dutySchedule: sampleDutySchedule,
      cashTransactions: sampleCashTransactions,
      payments: samplePayments,
      notes: sampleStudentNotes,
    }).then(() => {
      setLastSyncTime(new Date().toLocaleTimeString('id-ID'));
    });
  };

  const clearAllData = () => {
    setStudents([]);
    setAttendance([]);
    setGrades([]);
    setSchedule([]);
    setDutySchedule([]);
    setCashTransactions([]);
    setPayments([]);
    setNotes([]);
    showToast('Semua data kelas telah dikosongkan (Mulai Baru)', 'info');
    resetRemoteBackendData().then(() => {
      setLastSyncTime(new Date().toLocaleTimeString('id-ID'));
    });
  };

  const exportBackupJSON = () => {
    const exportData = {
      app: 'DATAVORA',
      version: '1.0.0',
      exportDate: new Date().toISOString(),
      classInfo,
      students,
      attendance,
      grades,
      schedule,
      dutySchedule,
      cashTransactions,
      payments,
      notes,
    };
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `DATAVORA_${classInfo.className.replace(/\s+/g, '_')}_Backup_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    showToast('File backup data berhasil diunduh', 'success');
  };

  const importBackupJSON = (jsonString: string): boolean => {
    try {
      const data = JSON.parse(jsonString);
      if (data.classInfo) setClassInfo(data.classInfo);
      if (Array.isArray(data.students)) setStudents(data.students);
      if (Array.isArray(data.attendance)) setAttendance(data.attendance);
      if (Array.isArray(data.grades)) setGrades(data.grades);
      if (Array.isArray(data.schedule)) setSchedule(data.schedule);
      if (Array.isArray(data.dutySchedule)) setDutySchedule(data.dutySchedule);
      if (Array.isArray(data.cashTransactions)) setCashTransactions(data.cashTransactions);
      if (Array.isArray(data.payments)) setPayments(data.payments);
      if (Array.isArray(data.notes)) setNotes(data.notes);
      showToast('Backup data berhasil dipulihkan!', 'success');

      // Sync imported data to backend
      seedRemoteData({
        classInfo: data.classInfo || classInfo,
        students: data.students || [],
        attendance: data.attendance || [],
        grades: data.grades || [],
        schedule: data.schedule || [],
        dutySchedule: data.dutySchedule || [],
        cashTransactions: data.cashTransactions || [],
        payments: data.payments || [],
        notes: data.notes || [],
      });
      return true;
    } catch {
      showToast('Gagal membaca file backup. Format tidak valid.', 'error');
      return false;
    }
  };

  // Computed: Cash balance
  const cashBalance = useMemo(() => {
    let totalIncome = 0;
    let totalExpense = 0;
    cashTransactions.forEach(trx => {
      if (trx.type === 'Pemasukan') totalIncome += trx.amount;
      if (trx.type === 'Pengeluaran') totalExpense += trx.amount;
    });
    return {
      totalIncome,
      totalExpense,
      balance: totalIncome - totalExpense,
    };
  }, [cashTransactions]);

  // Computed: Today's attendance summary
  const todayAttendanceSummary = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    const todayRecords = attendance.filter(a => a.date === today);
    const recordedIds = new Set(todayRecords.map(r => r.studentId));

    let hadir = 0;
    let sakit = 0;
    let izin = 0;
    let alfa = 0;

    todayRecords.forEach(rec => {
      if (rec.status === 'Hadir') hadir++;
      else if (rec.status === 'Sakit') sakit++;
      else if (rec.status === 'Izin') izin++;
      else if (rec.status === 'Alfa') alfa++;
    });

    const activeStudents = students.filter(s => s.status === 'Aktif');
    const total = activeStudents.length;
    const belum = Math.max(0, total - recordedIds.size);

    return { hadir, sakit, izin, alfa, belum, total };
  }, [attendance, students]);

  // Computed: Overall average score
  const overallAverageScore = useMemo(() => {
    if (grades.length === 0) return 0;
    const sum = grades.reduce((acc, curr) => acc + curr.score, 0);
    return Math.round((sum / grades.length) * 10) / 10;
  }, [grades]);

  // Computed: Students needing attention
  const studentsNeedingAttention = useMemo(() => {
    const list: { student: Student; reasons: string[] }[] = [];

    students.forEach(std => {
      const reasons: string[] = [];

      // Check attendance
      const stdAttendance = attendance.filter(a => a.studentId === std.id);
      const alfaCount = stdAttendance.filter(a => a.status === 'Alfa').length;
      const sakitCount = stdAttendance.filter(a => a.status === 'Sakit').length;
      if (alfaCount >= 1) reasons.push(`${alfaCount}x Alfa (tanpa keterangan)`);
      if (sakitCount >= 3) reasons.push(`${sakitCount}x Sakit`);

      // Check grades
      const stdGrades = grades.filter(g => g.studentId === std.id);
      if (stdGrades.length > 0) {
        const avg = stdGrades.reduce((acc, g) => acc + g.score, 0) / stdGrades.length;
        if (avg < 75) reasons.push(`Rata-rata nilai ${Math.round(avg)} (< KKM 75)`);
      }

      // Check critical notes
      const stdNotes = notes.filter(n => n.studentId === std.id && (n.status === 'Perlu Tindak Lanjut' || n.status === 'Perlu Perhatian'));
      if (stdNotes.length > 0) {
        reasons.push(`${stdNotes.length} catatan khusus (${stdNotes[0].category})`);
      }

      // Check pending payments
      const stdPending = payments.filter(p => p.studentId === std.id && p.status === 'Belum Bayar');
      if (stdPending.length >= 2) {
        reasons.push(`${stdPending.length} iuran tertunggak`);
      }

      if (reasons.length > 0) {
        list.push({ student: std, reasons });
      }
    });

    return list;
  }, [students, attendance, grades, notes, payments]);

  // Computed: Recent activities feed
  const recentActivities = useMemo(() => {
    const list: ActivityItem[] = [];

    attendance.slice(-4).forEach(a => {
      const std = students.find(s => s.id === a.studentId);
      if (std) {
        list.push({
          id: a.id,
          title: `${std.name} tercatat status "${a.status}" (${a.date})`,
          time: a.date,
          type: 'attendance',
          timestamp: new Date(a.createdAt || a.date).getTime(),
        });
      }
    });

    grades.slice(-4).forEach(g => {
      const std = students.find(s => s.id === g.studentId);
      if (std) {
        list.push({
          id: g.id,
          title: `Nilai ${g.subject} (${g.assessmentType}) untuk ${std.name}: ${g.score}`,
          time: g.date,
          type: 'grade',
          timestamp: new Date(g.createdAt || g.date).getTime(),
        });
      }
    });

    cashTransactions.slice(-3).forEach(c => {
      list.push({
        id: c.id,
        title: `${c.type} kas: ${c.description} (Rp ${c.amount.toLocaleString('id-ID')})`,
        time: c.date,
        type: 'cash',
        timestamp: new Date(c.createdAt || c.date).getTime(),
      });
    });

    notes.slice(-3).forEach(n => {
      const std = students.find(s => s.id === n.studentId);
      if (std) {
        list.push({
          id: n.id,
          title: `Catatan [${n.category}] untuk ${std.name}: "${n.status}"`,
          time: n.date,
          type: 'note',
          timestamp: new Date(n.createdAt || n.date).getTime(),
        });
      }
    });

    return list.sort((a, b) => b.timestamp - a.timestamp).slice(0, 8);
  }, [attendance, grades, cashTransactions, notes, students]);

  return (
    <ClassDataContext.Provider
      value={{
        classInfo,
        students,
        attendance,
        grades,
        schedule,
        dutySchedule,
        cashTransactions,
        payments,
        notes,
        toasts,
        dbStatus,
        dbMode,
        lastSyncTime,
        syncNow,
        showToast,
        removeToast,
        addStudent,
        updateStudent,
        deleteStudent,
        saveAttendanceBatch,
        deleteAttendanceRecord,
        addGrade,
        updateGrade,
        deleteGrade,
        bulkAddGrades,
        addSchedule,
        updateSchedule,
        deleteSchedule,
        addDutyGroup,
        updateDutyGroup,
        deleteDutyGroup,
        addCashTransaction,
        deleteCashTransaction,
        addPaymentItem,
        updatePaymentStatus,
        deletePaymentItem,
        createBatchPaymentForFee,
        addStudentNote,
        updateStudentNote,
        deleteStudentNote,
        updateClassInfo,
        loadDemoData,
        clearAllData,
        exportBackupJSON,
        importBackupJSON,
        totalStudents: students.length,
        cashBalance,
        todayAttendanceSummary,
        overallAverageScore,
        studentsNeedingAttention,
        recentActivities,
      }}
    >
      {children}
    </ClassDataContext.Provider>
  );
};

export const useClassData = () => {
  const context = useContext(ClassDataContext);
  if (!context) {
    throw new Error('useClassData must be used within a ClassDataProvider');
  }
  return context;
};
