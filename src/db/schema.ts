import { pgTable, text, serial, integer, timestamp } from 'drizzle-orm/pg-core';

// Users table (Firebase Auth UID)
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  uid: text('uid').notNull().unique(),
  email: text('email').notNull(),
  name: text('name'),
  createdAt: timestamp('created_at').defaultNow(),
});

// Class Info metadata
export const classInfo = pgTable('class_info', {
  id: text('id').primaryKey(),
  userId: text('user_id'),
  className: text('class_name').notNull(),
  academicYear: text('academic_year').notNull(),
  semester: text('semester').notNull(),
  homeroomTeacher: text('homeroom_teacher').notNull(),
  homeroomTeacherNip: text('homeroom_teacher_nip'),
  schoolName: text('school_name').notNull(),
  schoolLogo: text('school_logo'),
  headmasterName: text('headmaster_name'),
  headmasterNip: text('headmaster_nip'),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Students
export const students = pgTable('students', {
  id: text('id').primaryKey(),
  userId: text('user_id'),
  name: text('name').notNull(),
  nis: text('nis').notNull(),
  nisn: text('nisn').notNull(),
  gender: text('gender').notNull(),
  className: text('class_name').notNull(),
  status: text('status').notNull().default('Aktif'),
  avatarUrl: text('avatar_url'),
  birthPlace: text('birth_place'),
  birthDate: text('birth_date'),
  address: text('address'),
  phone: text('phone'),
  parentName: text('parent_name'),
  parentMotherName: text('parent_mother_name'),
  parentPhone: text('parent_phone'),
  parentJob: text('parent_job'),
  bloodType: text('blood_type'),
  healthNotes: text('health_notes'),
  specialNotes: text('special_notes'),
  createdAt: text('created_at').notNull(),
});

// Attendance records
export const attendance = pgTable('attendance', {
  id: text('id').primaryKey(),
  studentId: text('student_id').notNull(),
  date: text('date').notNull(),
  time: text('time'),
  status: text('status').notNull(),
  note: text('note'),
  createdAt: text('created_at').notNull(),
});

// Grades
export const grades = pgTable('grades', {
  id: text('id').primaryKey(),
  studentId: text('student_id').notNull(),
  subject: text('subject').notNull(),
  assessmentType: text('assessment_type').notNull(),
  score: integer('score').notNull(),
  date: text('date').notNull(),
  notes: text('notes'),
  createdAt: text('created_at').notNull(),
});

// Lesson Schedule
export const schedules = pgTable('schedules', {
  id: text('id').primaryKey(),
  day: text('day').notNull(),
  subject: text('subject').notNull(),
  teacher: text('teacher').notNull(),
  startTime: text('start_time').notNull(),
  endTime: text('end_time').notNull(),
  room: text('room').notNull(),
});

// Duty Schedule
export const dutySchedules = pgTable('duty_schedules', {
  id: text('id').primaryKey(),
  groupName: text('group_name').notNull(),
  day: text('day').notNull(),
  memberStudentIds: text('member_student_ids').notNull(), // JSON stringified array
  tasks: text('tasks').notNull(), // JSON stringified array
});

// Cash Transactions
export const cashTransactions = pgTable('cash_transactions', {
  id: text('id').primaryKey(),
  type: text('type').notNull(),
  amount: integer('amount').notNull(),
  date: text('date').notNull(),
  description: text('description').notNull(),
  category: text('category'),
  createdAt: text('created_at').notNull(),
});

// Student Payments
export const payments = pgTable('payments', {
  id: text('id').primaryKey(),
  studentId: text('student_id').notNull(),
  feeName: text('fee_name').notNull(),
  amount: integer('amount').notNull(),
  status: text('status').notNull(),
  date: text('date'),
  note: text('note'),
  createdAt: text('created_at').notNull(),
});

// Student Notes & Counseling
export const studentNotes = pgTable('student_notes', {
  id: text('id').primaryKey(),
  studentId: text('student_id').notNull(),
  category: text('category').notNull(),
  note: text('note').notNull(),
  status: text('status').notNull(),
  date: text('date').notNull(),
  followUpPlan: text('follow_up_plan'),
  createdAt: text('created_at').notNull(),
});
