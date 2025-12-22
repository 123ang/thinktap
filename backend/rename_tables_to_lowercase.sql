-- Rename all tables to lowercase
-- Run this script in your PostgreSQL database

-- Rename User table to user
ALTER TABLE "User" RENAME TO "user";

-- Rename Quiz table to quiz
ALTER TABLE "Quiz" RENAME TO "quiz";

-- Rename Session table to session
ALTER TABLE "Session" RENAME TO "session";

-- Rename Question table to question
ALTER TABLE "Question" RENAME TO "question";

-- Rename Response table to response
ALTER TABLE "Response" RENAME TO "response";

