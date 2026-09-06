import express from "express";
import { optionalAuth, AuthRequest } from "./src/middleware/auth.js";
import { getOrCreateUser } from "./src/db/users.js";
import {
  fetchClassInfo,
  upsertClassInfo,
  fetchStudents,
  upsertStudent,
  removeStudent,
  fetchAttendance,
  saveAttendanceBatch,
  removeAttendance,
  fetchGrades,
  upsertGrade,
  bulkUpsertGrades,
  removeGrade,
  fetchSchedules,
  upsertSchedule,
  removeSchedule,
  fetchDutySchedules,
  upsertDutySchedule,
  removeDutySchedule,
  fetchCashTransactions,
  upsertCashTransaction,
  removeCashTransaction,
  fetchPayments,
  upsertPayment,
  removePayment,
  fetchStudentNotes,
  upsertStudentNote,
  removeStudentNote,
  seedInitialData,
  resetAllData,
} from "./src/db/queries.js";

const app = express();

// Standard middleware
app.use(express.json({ limit: "15mb" }));
app.use(express.urlencoded({ extended: true, limit: "15mb" }));

// Health and Status route
app.get("/api/health", (_req, res) => {
  res.json({
    status: "ok",
    database: "connected",
    mode: "Supabase / PostgreSQL Database",
    timestamp: new Date().toISOString(),
  });
});

// User auth sync
app.post("/api/auth/sync", optionalAuth, async (req: AuthRequest, res) => {
  try {
    const { uid, email, name } = req.body;
    const targetUid = req.user?.uid || uid;
    const targetEmail = req.user?.email || email;
    if (!targetUid || !targetEmail) {
      return res.status(400).json({ error: "Missing uid or email" });
    }
    const user = await getOrCreateUser(targetUid, targetEmail, name || req.user?.name);
    res.json({ success: true, user });
  } catch (err: any) {
    console.error("Auth sync error:", err);
    res.status(500).json({ error: err.message || "Failed to sync user" });
  }
});

// Get full app state from PostgreSQL
app.get("/api/data", optionalAuth, async (_req: AuthRequest, res) => {
  try {
    const [
      classInfoData,
      studentsData,
      attendanceData,
      gradesData,
      scheduleData,
      dutyScheduleData,
      cashTransactionsData,
      paymentsData,
      notesData,
    ] = await Promise.all([
      fetchClassInfo(),
      fetchStudents(),
      fetchAttendance(),
      fetchGrades(),
      fetchSchedules(),
      fetchDutySchedules(),
      fetchCashTransactions(),
      fetchPayments(),
      fetchStudentNotes(),
    ]);

    res.json({
      classInfo: classInfoData,
      students: studentsData,
      attendance: attendanceData,
      grades: gradesData,
      schedule: scheduleData,
      dutySchedule: dutyScheduleData,
      cashTransactions: cashTransactionsData,
      payments: paymentsData,
      notes: notesData,
    });
  } catch (err: any) {
    console.error("Error fetching data:", err);
    res.status(500).json({ error: err.message || "Failed to fetch data" });
  }
});

// Seed initial data if empty
app.post("/api/seed", optionalAuth, async (req: AuthRequest, res) => {
  try {
    const result = await seedInitialData(req.body);
    res.json(result);
  } catch (err: any) {
    console.error("Error seeding initial data:", err);
    res.status(500).json({ error: err.message || "Failed to seed data" });
  }
});

// Class info
app.post("/api/class-info", optionalAuth, async (req: AuthRequest, res) => {
  try {
    const info = await upsertClassInfo(req.body);
    res.json(info);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Students
app.post("/api/students", optionalAuth, async (req: AuthRequest, res) => {
  try {
    const student = await upsertStudent(req.body);
    res.json(student);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.delete("/api/students/:id", optionalAuth, async (req: AuthRequest, res) => {
  try {
    await removeStudent(req.params.id);
    res.json({ success: true, id: req.params.id });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Attendance
app.post("/api/attendance", optionalAuth, async (req: AuthRequest, res) => {
  try {
    const { records, date } = req.body;
    const result = await saveAttendanceBatch(records, date);
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.delete("/api/attendance/:id", optionalAuth, async (req: AuthRequest, res) => {
  try {
    await removeAttendance(req.params.id);
    res.json({ success: true, id: req.params.id });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Grades
app.post("/api/grades", optionalAuth, async (req: AuthRequest, res) => {
  try {
    const grade = await upsertGrade(req.body);
    res.json(grade);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/grades/bulk", optionalAuth, async (req: AuthRequest, res) => {
  try {
    const grades = await bulkUpsertGrades(req.body.grades);
    res.json(grades);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.delete("/api/grades/:id", optionalAuth, async (req: AuthRequest, res) => {
  try {
    await removeGrade(req.params.id);
    res.json({ success: true, id: req.params.id });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Schedules
app.post("/api/schedules", optionalAuth, async (req: AuthRequest, res) => {
  try {
    const item = await upsertSchedule(req.body);
    res.json(item);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.delete("/api/schedules/:id", optionalAuth, async (req: AuthRequest, res) => {
  try {
    await removeSchedule(req.params.id);
    res.json({ success: true, id: req.params.id });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Duty Schedules
app.post("/api/duty-schedules", optionalAuth, async (req: AuthRequest, res) => {
  try {
    const duty = await upsertDutySchedule(req.body);
    res.json(duty);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.delete("/api/duty-schedules/:id", optionalAuth, async (req: AuthRequest, res) => {
  try {
    await removeDutySchedule(req.params.id);
    res.json({ success: true, id: req.params.id });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Cash Transactions
app.post("/api/cash-transactions", optionalAuth, async (req: AuthRequest, res) => {
  try {
    const trx = await upsertCashTransaction(req.body);
    res.json(trx);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.delete("/api/cash-transactions/:id", optionalAuth, async (req: AuthRequest, res) => {
  try {
    await removeCashTransaction(req.params.id);
    res.json({ success: true, id: req.params.id });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Payments
app.post("/api/payments", optionalAuth, async (req: AuthRequest, res) => {
  try {
    const payment = await upsertPayment(req.body);
    res.json(payment);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.delete("/api/payments/:id", optionalAuth, async (req: AuthRequest, res) => {
  try {
    await removePayment(req.params.id);
    res.json({ success: true, id: req.params.id });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Student Notes
app.post("/api/student-notes", optionalAuth, async (req: AuthRequest, res) => {
  try {
    const note = await upsertStudentNote(req.body);
    res.json(note);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.delete("/api/student-notes/:id", optionalAuth, async (req: AuthRequest, res) => {
  try {
    await removeStudentNote(req.params.id);
    res.json({ success: true, id: req.params.id });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Reset all data
app.post("/api/reset", optionalAuth, async (_req: AuthRequest, res) => {
  try {
    await resetAllData();
    res.json({ success: true, message: "Seluruh data berhasil dikosongkan" });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default app;
