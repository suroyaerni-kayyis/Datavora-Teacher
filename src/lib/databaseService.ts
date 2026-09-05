import { 
  Student, 
  AttendanceRecord, 
  GradeRecord, 
  ScheduleItem, 
  DutySchedule, 
  CashTransaction, 
  PaymentItem, 
  StudentNote, 
  ClassInfo 
} from '../types';

export interface DatabaseHealth {
  status: 'connected' | 'offline';
  backend: string;
  lastChecked: string;
}

export async function checkDatabaseHealth(): Promise<DatabaseHealth> {
  try {
    const res = await fetch('/api/health', { method: 'GET' });
    if (!res.ok) throw new Error('Health check failed');
    const data = await res.json();
    return {
      status: 'connected',
      backend: data.mode || 'PostgreSQL Cloud SQL / Supabase',
      lastChecked: new Date().toLocaleTimeString('id-ID'),
    };
  } catch {
    return {
      status: 'offline',
      backend: 'Local Storage Cache',
      lastChecked: new Date().toLocaleTimeString('id-ID'),
    };
  }
}

export async function fetchAllRemoteData(token?: string | null) {
  try {
    const headers: Record<string, string> = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const res = await fetch('/api/data', { headers });
    if (!res.ok) return null;
    return await res.json();
  } catch (err) {
    console.warn('Gagal memuat data dari server backend, menggunakan cache lokal:', err);
    return null;
  }
}

export async function seedRemoteData(payload: any, token?: string | null) {
  try {
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const res = await fetch('/api/seed', {
      method: 'POST',
      headers,
      body: JSON.stringify(payload),
    });
    return res.ok;
  } catch {
    return false;
  }
}

// Student Sync
export async function syncRemoteStudent(student: Student, token?: string | null) {
  try {
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    await fetch('/api/students', {
      method: 'POST',
      headers,
      body: JSON.stringify(student),
    });
  } catch (err) {
    console.warn('Sync student warning:', err);
  }
}

export async function deleteRemoteStudent(id: string, token?: string | null) {
  try {
    const headers: Record<string, string> = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;

    await fetch(`/api/students/${id}`, {
      method: 'DELETE',
      headers,
    });
  } catch (err) {
    console.warn('Delete student warning:', err);
  }
}

// Attendance Sync
export async function syncRemoteAttendanceBatch(records: any[], date: string, token?: string | null) {
  try {
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    await fetch('/api/attendance', {
      method: 'POST',
      headers,
      body: JSON.stringify({ records, date }),
    });
  } catch (err) {
    console.warn('Sync attendance warning:', err);
  }
}

export async function deleteRemoteAttendance(id: string, token?: string | null) {
  try {
    const headers: Record<string, string> = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;

    await fetch(`/api/attendance/${id}`, {
      method: 'DELETE',
      headers,
    });
  } catch (err) {
    console.warn('Delete attendance warning:', err);
  }
}

// Grade Sync
export async function syncRemoteGrade(grade: GradeRecord, token?: string | null) {
  try {
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    await fetch('/api/grades', {
      method: 'POST',
      headers,
      body: JSON.stringify(grade),
    });
  } catch (err) {
    console.warn('Sync grade warning:', err);
  }
}

export async function syncRemoteBulkGrades(grades: GradeRecord[], token?: string | null) {
  try {
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    await fetch('/api/grades/bulk', {
      method: 'POST',
      headers,
      body: JSON.stringify({ grades }),
    });
  } catch (err) {
    console.warn('Sync bulk grades warning:', err);
  }
}

export async function deleteRemoteGrade(id: string, token?: string | null) {
  try {
    const headers: Record<string, string> = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;

    await fetch(`/api/grades/${id}`, {
      method: 'DELETE',
      headers,
    });
  } catch (err) {
    console.warn('Delete grade warning:', err);
  }
}

// Schedule Sync
export async function syncRemoteSchedule(schedule: ScheduleItem, token?: string | null) {
  try {
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    await fetch('/api/schedules', {
      method: 'POST',
      headers,
      body: JSON.stringify(schedule),
    });
  } catch (err) {
    console.warn('Sync schedule warning:', err);
  }
}

export async function deleteRemoteSchedule(id: string, token?: string | null) {
  try {
    const headers: Record<string, string> = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;

    await fetch(`/api/schedules/${id}`, {
      method: 'DELETE',
      headers,
    });
  } catch (err) {
    console.warn('Delete schedule warning:', err);
  }
}

// Duty Schedule Sync
export async function syncRemoteDutySchedule(duty: DutySchedule, token?: string | null) {
  try {
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    await fetch('/api/duty-schedules', {
      method: 'POST',
      headers,
      body: JSON.stringify(duty),
    });
  } catch (err) {
    console.warn('Sync duty schedule warning:', err);
  }
}

export async function deleteRemoteDutySchedule(id: string, token?: string | null) {
  try {
    const headers: Record<string, string> = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;

    await fetch(`/api/duty-schedules/${id}`, {
      method: 'DELETE',
      headers,
    });
  } catch (err) {
    console.warn('Delete duty schedule warning:', err);
  }
}

// Cash Transactions Sync
export async function syncRemoteCashTransaction(trx: CashTransaction, token?: string | null) {
  try {
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    await fetch('/api/cash-transactions', {
      method: 'POST',
      headers,
      body: JSON.stringify(trx),
    });
  } catch (err) {
    console.warn('Sync cash transaction warning:', err);
  }
}

export async function deleteRemoteCashTransaction(id: string, token?: string | null) {
  try {
    const headers: Record<string, string> = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;

    await fetch(`/api/cash-transactions/${id}`, {
      method: 'DELETE',
      headers,
    });
  } catch (err) {
    console.warn('Delete cash transaction warning:', err);
  }
}

// Payments Sync
export async function syncRemotePayment(payment: PaymentItem, token?: string | null) {
  try {
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    await fetch('/api/payments', {
      method: 'POST',
      headers,
      body: JSON.stringify(payment),
    });
  } catch (err) {
    console.warn('Sync payment warning:', err);
  }
}

export async function deleteRemotePayment(id: string, token?: string | null) {
  try {
    const headers: Record<string, string> = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;

    await fetch(`/api/payments/${id}`, {
      method: 'DELETE',
      headers,
    });
  } catch (err) {
    console.warn('Delete payment warning:', err);
  }
}

// Student Notes Sync
export async function syncRemoteStudentNote(note: StudentNote, token?: string | null) {
  try {
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    await fetch('/api/student-notes', {
      method: 'POST',
      headers,
      body: JSON.stringify(note),
    });
  } catch (err) {
    console.warn('Sync student note warning:', err);
  }
}

export async function deleteRemoteStudentNote(id: string, token?: string | null) {
  try {
    const headers: Record<string, string> = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;

    await fetch(`/api/student-notes/${id}`, {
      method: 'DELETE',
      headers,
    });
  } catch (err) {
    console.warn('Delete student note warning:', err);
  }
}

// Class Info Sync
export async function syncRemoteClassInfo(info: ClassInfo, token?: string | null) {
  try {
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    await fetch('/api/class-info', {
      method: 'POST',
      headers,
      body: JSON.stringify(info),
    });
  } catch (err) {
    console.warn('Sync class info warning:', err);
  }
}

// Reset Remote Data
export async function resetRemoteBackendData(token?: string | null) {
  try {
    const headers: Record<string, string> = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;

    await fetch('/api/reset', {
      method: 'POST',
      headers,
    });
  } catch (err) {
    console.warn('Reset remote backend warning:', err);
  }
}
