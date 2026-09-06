import { db } from './index.js';
import { 
  classInfo, 
  students, 
  attendance, 
  grades, 
  schedules, 
  dutySchedules, 
  cashTransactions, 
  payments, 
  studentNotes 
} from './schema.js';
import { eq } from 'drizzle-orm';

// Class Info
export async function fetchClassInfo() {
  try {
    const rows = await db.select().from(classInfo);
    if (rows.length > 0) {
      return rows[0];
    }
    return null;
  } catch (error: any) {
    console.error('Error fetching class info:', error);
    throw new Error('DB Error: ' + error.message + ' | Code: ' + error.code + ' | Routine: ' + error.routine);
  }
}

export async function upsertClassInfo(infoData: any) {
  try {
    const record = {
      id: infoData.id || 'default',
      userId: infoData.userId || null,
      className: infoData.className,
      academicYear: infoData.academicYear,
      semester: infoData.semester,
      homeroomTeacher: infoData.homeroomTeacher,
      homeroomTeacherNip: infoData.homeroomTeacherNip || null,
      schoolName: infoData.schoolName,
      schoolLogo: infoData.schoolLogo || null,
      headmasterName: infoData.headmasterName || null,
      headmasterNip: infoData.headmasterNip || null,
      updatedAt: new Date(),
    };

    const result = await db.insert(classInfo)
      .values(record)
      .onConflictDoUpdate({
        target: classInfo.id,
        set: record,
      })
      .returning();

    return result[0];
  } catch (error) {
    console.error('Error saving class info:', error);
    throw new Error('Gagal menyimpan profil kelas', { cause: error });
  }
}

// Students
export async function fetchStudents() {
  try {
    return await db.select().from(students);
  } catch (error) {
    console.error('Error fetching students:', error);
    throw new Error('Gagal memuat daftar siswa', { cause: error });
  }
}

export async function upsertStudent(studentData: any) {
  try {
    const record = {
      id: studentData.id,
      userId: studentData.userId || null,
      name: studentData.name,
      nis: studentData.nis,
      nisn: studentData.nisn,
      gender: studentData.gender,
      className: studentData.className,
      status: studentData.status || 'Aktif',
      avatarUrl: studentData.avatarUrl || null,
      birthPlace: studentData.birthPlace || null,
      birthDate: studentData.birthDate || null,
      address: studentData.address || null,
      phone: studentData.phone || null,
      parentName: studentData.parentName || null,
      parentMotherName: studentData.parentMotherName || null,
      parentPhone: studentData.parentPhone || null,
      parentJob: studentData.parentJob || null,
      bloodType: studentData.bloodType || null,
      healthNotes: studentData.healthNotes || null,
      specialNotes: studentData.specialNotes || null,
      createdAt: studentData.createdAt || new Date().toISOString(),
    };

    const result = await db.insert(students)
      .values(record)
      .onConflictDoUpdate({
        target: students.id,
        set: record,
      })
      .returning();

    return result[0];
  } catch (error) {
    console.error('Error upserting student:', error);
    throw new Error('Gagal menyimpan data siswa', { cause: error });
  }
}

export async function removeStudent(id: string) {
  try {
    await db.delete(students).where(eq(students.id, id));
    // Also cascade cleanup related records
    await db.delete(attendance).where(eq(attendance.studentId, id));
    await db.delete(grades).where(eq(grades.studentId, id));
    await db.delete(payments).where(eq(payments.studentId, id));
    await db.delete(studentNotes).where(eq(studentNotes.studentId, id));
    return { success: true };
  } catch (error) {
    console.error('Error removing student:', error);
    throw new Error('Gagal menghapus siswa', { cause: error });
  }
}

// Attendance
export async function fetchAttendance() {
  try {
    return await db.select().from(attendance);
  } catch (error) {
    console.error('Error fetching attendance:', error);
    throw new Error('Gagal memuat data presensi', { cause: error });
  }
}

export async function saveAttendanceBatch(records: any[], date: string) {
  try {
    const results = [];
    for (const item of records) {
      const id = `${item.studentId}_${date}`;
      const record = {
        id,
        studentId: item.studentId,
        date,
        time: item.time || new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
        status: item.status,
        note: item.note || null,
        createdAt: new Date().toISOString(),
      };

      const res = await db.insert(attendance)
        .values(record)
        .onConflictDoUpdate({
          target: attendance.id,
          set: record,
        })
        .returning();

      results.push(res[0]);
    }
    return results;
  } catch (error) {
    console.error('Error saving attendance batch:', error);
    throw new Error('Gagal menyimpan presensi', { cause: error });
  }
}

export async function removeAttendance(id: string) {
  try {
    await db.delete(attendance).where(eq(attendance.id, id));
    return { success: true };
  } catch (error) {
    console.error('Error removing attendance:', error);
    throw new Error('Gagal menghapus presensi', { cause: error });
  }
}

// Grades
export async function fetchGrades() {
  try {
    return await db.select().from(grades);
  } catch (error) {
    console.error('Error fetching grades:', error);
    throw new Error('Gagal memuat rekap nilai', { cause: error });
  }
}

export async function upsertGrade(gradeData: any) {
  try {
    const record = {
      id: gradeData.id,
      studentId: gradeData.studentId,
      subject: gradeData.subject,
      assessmentType: gradeData.assessmentType,
      score: Math.round(Number(gradeData.score)),
      date: gradeData.date,
      notes: gradeData.notes || null,
      createdAt: gradeData.createdAt || new Date().toISOString(),
    };

    const result = await db.insert(grades)
      .values(record)
      .onConflictDoUpdate({
        target: grades.id,
        set: record,
      })
      .returning();

    return result[0];
  } catch (error) {
    console.error('Error upserting grade:', error);
    throw new Error('Gagal menyimpan nilai', { cause: error });
  }
}

export async function bulkUpsertGrades(gradesData: any[]) {
  try {
    const results = [];
    for (const g of gradesData) {
      const res = await upsertGrade(g);
      results.push(res);
    }
    return results;
  } catch (error) {
    console.error('Error bulk upserting grades:', error);
    throw new Error('Gagal menyimpan rekap nilai serentak', { cause: error });
  }
}

export async function removeGrade(id: string) {
  try {
    await db.delete(grades).where(eq(grades.id, id));
    return { success: true };
  } catch (error) {
    console.error('Error removing grade:', error);
    throw new Error('Gagal menghapus nilai', { cause: error });
  }
}

// Schedules
export async function fetchSchedules() {
  try {
    return await db.select().from(schedules);
  } catch (error) {
    console.error('Error fetching schedules:', error);
    throw new Error('Gagal memuat jadwal pelajaran', { cause: error });
  }
}

export async function upsertSchedule(scheduleData: any) {
  try {
    const record = {
      id: scheduleData.id,
      day: scheduleData.day,
      subject: scheduleData.subject,
      teacher: scheduleData.teacher,
      startTime: scheduleData.startTime,
      endTime: scheduleData.endTime,
      room: scheduleData.room,
    };

    const result = await db.insert(schedules)
      .values(record)
      .onConflictDoUpdate({
        target: schedules.id,
        set: record,
      })
      .returning();

    return result[0];
  } catch (error) {
    console.error('Error upserting schedule:', error);
    throw new Error('Gagal menyimpan jadwal', { cause: error });
  }
}

export async function removeSchedule(id: string) {
  try {
    await db.delete(schedules).where(eq(schedules.id, id));
    return { success: true };
  } catch (error) {
    console.error('Error removing schedule:', error);
    throw new Error('Gagal menghapus jadwal', { cause: error });
  }
}

// Duty Schedules
export async function fetchDutySchedules() {
  try {
    const rows = await db.select().from(dutySchedules);
    return rows.map((r) => ({
      ...r,
      memberStudentIds: JSON.parse(r.memberStudentIds || '[]'),
      tasks: JSON.parse(r.tasks || '[]'),
    }));
  } catch (error) {
    console.error('Error fetching duty schedules:', error);
    throw new Error('Gagal memuat jadwal piket', { cause: error });
  }
}

export async function upsertDutySchedule(dutyData: any) {
  try {
    const record = {
      id: dutyData.id,
      groupName: dutyData.groupName,
      day: dutyData.day,
      memberStudentIds: JSON.stringify(dutyData.memberStudentIds || []),
      tasks: JSON.stringify(dutyData.tasks || []),
    };

    await db.insert(dutySchedules)
      .values(record)
      .onConflictDoUpdate({
        target: dutySchedules.id,
        set: record,
      });

    return {
      ...dutyData,
    };
  } catch (error) {
    console.error('Error upserting duty schedule:', error);
    throw new Error('Gagal menyimpan jadwal piket', { cause: error });
  }
}

export async function removeDutySchedule(id: string) {
  try {
    await db.delete(dutySchedules).where(eq(dutySchedules.id, id));
    return { success: true };
  } catch (error) {
    console.error('Error removing duty schedule:', error);
    throw new Error('Gagal menghapus jadwal piket', { cause: error });
  }
}

// Cash Transactions
export async function fetchCashTransactions() {
  try {
    return await db.select().from(cashTransactions);
  } catch (error) {
    console.error('Error fetching cash transactions:', error);
    throw new Error('Gagal memuat kas kelas', { cause: error });
  }
}

export async function upsertCashTransaction(trxData: any) {
  try {
    const record = {
      id: trxData.id,
      type: trxData.type,
      amount: Math.round(Number(trxData.amount)),
      date: trxData.date,
      description: trxData.description,
      category: trxData.category || null,
      createdAt: trxData.createdAt || new Date().toISOString(),
    };

    const result = await db.insert(cashTransactions)
      .values(record)
      .onConflictDoUpdate({
        target: cashTransactions.id,
        set: record,
      })
      .returning();

    return result[0];
  } catch (error) {
    console.error('Error upserting cash transaction:', error);
    throw new Error('Gagal menyimpan transaksi kas', { cause: error });
  }
}

export async function removeCashTransaction(id: string) {
  try {
    await db.delete(cashTransactions).where(eq(cashTransactions.id, id));
    return { success: true };
  } catch (error) {
    console.error('Error removing cash transaction:', error);
    throw new Error('Gagal menghapus transaksi kas', { cause: error });
  }
}

// Payments
export async function fetchPayments() {
  try {
    return await db.select().from(payments);
  } catch (error) {
    console.error('Error fetching payments:', error);
    throw new Error('Gagal memuat data iuran siswa', { cause: error });
  }
}

export async function upsertPayment(paymentData: any) {
  try {
    const record = {
      id: paymentData.id,
      studentId: paymentData.studentId,
      feeName: paymentData.feeName,
      amount: Math.round(Number(paymentData.amount)),
      status: paymentData.status,
      date: paymentData.date || null,
      note: paymentData.note || null,
      createdAt: paymentData.createdAt || new Date().toISOString(),
    };

    const result = await db.insert(payments)
      .values(record)
      .onConflictDoUpdate({
        target: payments.id,
        set: record,
      })
      .returning();

    return result[0];
  } catch (error) {
    console.error('Error upserting payment:', error);
    throw new Error('Gagal menyimpan data iuran', { cause: error });
  }
}

export async function removePayment(id: string) {
  try {
    await db.delete(payments).where(eq(payments.id, id));
    return { success: true };
  } catch (error) {
    console.error('Error removing payment:', error);
    throw new Error('Gagal menghapus data iuran', { cause: error });
  }
}

// Student Notes
export async function fetchStudentNotes() {
  try {
    return await db.select().from(studentNotes);
  } catch (error) {
    console.error('Error fetching student notes:', error);
    throw new Error('Gagal memuat catatan siswa', { cause: error });
  }
}

export async function upsertStudentNote(noteData: any) {
  try {
    const record = {
      id: noteData.id,
      studentId: noteData.studentId,
      category: noteData.category,
      note: noteData.note,
      status: noteData.status,
      date: noteData.date,
      followUpPlan: noteData.followUpPlan || null,
      createdAt: noteData.createdAt || new Date().toISOString(),
    };

    const result = await db.insert(studentNotes)
      .values(record)
      .onConflictDoUpdate({
        target: studentNotes.id,
        set: record,
      })
      .returning();

    return result[0];
  } catch (error) {
    console.error('Error upserting student note:', error);
    throw new Error('Gagal menyimpan catatan khusus', { cause: error });
  }
}

export async function removeStudentNote(id: string) {
  try {
    await db.delete(studentNotes).where(eq(studentNotes.id, id));
    return { success: true };
  } catch (error) {
    console.error('Error removing student note:', error);
    throw new Error('Gagal menghapus catatan khusus', { cause: error });
  }
}

// Bulk initialization from initial sample data if tables are empty
export async function seedInitialData(data: {
  classInfo: any;
  students: any[];
  attendance: any[];
  grades: any[];
  schedule: any[];
  dutySchedule: any[];
  cashTransactions: any[];
  payments: any[];
  notes: any[];
}) {
  try {
    // Check if students already exist
    const existing = await db.select().from(students);
    if (existing.length === 0) {
      if (data.classInfo) await upsertClassInfo(data.classInfo);
      for (const s of data.students) await upsertStudent(s);
      for (const a of data.attendance) {
        await db.insert(attendance).values({
          id: a.id,
          studentId: a.studentId,
          date: a.date,
          time: a.time || null,
          status: a.status,
          note: a.note || null,
          createdAt: a.createdAt,
        }).onConflictDoNothing();
      }
      for (const g of data.grades) await upsertGrade(g);
      for (const sc of data.schedule) await upsertSchedule(sc);
      for (const d of data.dutySchedule) await upsertDutySchedule(d);
      for (const c of data.cashTransactions) await upsertCashTransaction(c);
      for (const p of data.payments) await upsertPayment(p);
      for (const n of data.notes) await upsertStudentNote(n);
    }
    return { seeded: existing.length === 0 };
  } catch (error) {
    console.error('Error seeding initial data:', error);
    return { seeded: false, error };
  }
}

// Clear all data
export async function resetAllData() {
  try {
    await db.delete(attendance);
    await db.delete(grades);
    await db.delete(payments);
    await db.delete(studentNotes);
    await db.delete(dutySchedules);
    await db.delete(schedules);
    await db.delete(cashTransactions);
    await db.delete(students);
    return { success: true };
  } catch (error) {
    console.error('Error resetting all data:', error);
    throw new Error('Gagal mengosongkan data', { cause: error });
  }
}
