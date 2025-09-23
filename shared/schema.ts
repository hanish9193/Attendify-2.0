import { pgTable, serial, text, integer, timestamp, boolean, real } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// Users table for authentication
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  googleId: text('google_id').unique(),
  email: text('email').notNull().unique(),
  name: text('name').notNull(),
  avatar: text('avatar'),
  isGuest: boolean('is_guest').default(false),
  createdAt: timestamp('created_at').defaultNow(),
});

// Subjects/Courses table
export const subjects = pgTable('subjects', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  targetAttendance: real('target_attendance').default(75), // percentage
  totalClasses: integer('total_classes').default(0),
  attendedClasses: integer('attended_classes').default(0),
  semesterEndDate: timestamp('semester_end_date'),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Individual attendance records
export const attendanceRecords = pgTable('attendance_records', {
  id: serial('id').primaryKey(),
  subjectId: integer('subject_id').references(() => subjects.id, { onDelete: 'cascade' }),
  userId: integer('user_id').references(() => users.id, { onDelete: 'cascade' }),
  date: timestamp('date').notNull(),
  status: text('status', { enum: ['present', 'absent'] }).notNull(),
  notes: text('notes'),
  createdAt: timestamp('created_at').defaultNow(),
});

// TrOCR processed screenshots table
export const processedScreenshots = pgTable('processed_screenshots', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id, { onDelete: 'cascade' }),
  filename: text('filename').notNull(),
  extractedText: text('extracted_text'),
  extractedData: text('extracted_data'), // JSON string of parsed attendance data
  processingStatus: text('processing_status', { enum: ['pending', 'processing', 'completed', 'failed'] }).default('pending'),
  createdAt: timestamp('created_at').defaultNow(),
});

// User preferences and settings
export const userSettings = pgTable('user_settings', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id, { onDelete: 'cascade' }),
  defaultTargetAttendance: real('default_target_attendance').default(75),
  notificationsEnabled: boolean('notifications_enabled').default(true),
  theme: text('theme').default('dark'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Define relations
export const usersRelations = relations(users, ({ many, one }) => ({
  subjects: many(subjects),
  attendanceRecords: many(attendanceRecords),
  processedScreenshots: many(processedScreenshots),
  settings: one(userSettings),
}));

export const subjectsRelations = relations(subjects, ({ one, many }) => ({
  user: one(users, {
    fields: [subjects.userId],
    references: [users.id],
  }),
  attendanceRecords: many(attendanceRecords),
}));

export const attendanceRecordsRelations = relations(attendanceRecords, ({ one }) => ({
  subject: one(subjects, {
    fields: [attendanceRecords.subjectId],
    references: [subjects.id],
  }),
  user: one(users, {
    fields: [attendanceRecords.userId],
    references: [users.id],
  }),
}));

export const processedScreenshotsRelations = relations(processedScreenshots, ({ one }) => ({
  user: one(users, {
    fields: [processedScreenshots.userId],
    references: [users.id],
  }),
}));

export const userSettingsRelations = relations(userSettings, ({ one }) => ({
  user: one(users, {
    fields: [userSettings.userId],
    references: [users.id],
  }),
}));

// Export types
export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;
export type Subject = typeof subjects.$inferSelect;
export type InsertSubject = typeof subjects.$inferInsert;
export type AttendanceRecord = typeof attendanceRecords.$inferSelect;
export type InsertAttendanceRecord = typeof attendanceRecords.$inferInsert;
export type ProcessedScreenshot = typeof processedScreenshots.$inferSelect;
export type InsertProcessedScreenshot = typeof processedScreenshots.$inferInsert;
export type UserSettings = typeof userSettings.$inferSelect;
export type InsertUserSettings = typeof userSettings.$inferInsert;