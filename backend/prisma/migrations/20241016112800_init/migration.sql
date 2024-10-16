/*
  Warnings:

  - The primary key for the `TeachingAssignment` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `Term` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `role` on the `User` table. All the data in the column will be lost.
  - Changed the type of `termTerm` on the `Assignment` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `termTerm` on the `TeachingAssignment` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `term` on the `Term` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "Trimester" AS ENUM ('T1', 'T2', 'T3');

-- DropForeignKey
ALTER TABLE "Assignment" DROP CONSTRAINT "Assignment_termYear_termTerm_fkey";

-- DropForeignKey
ALTER TABLE "TeachingAssignment" DROP CONSTRAINT "TeachingAssignment_termYear_termTerm_fkey";

-- AlterTable
ALTER TABLE "Assignment" DROP COLUMN "termTerm",
ADD COLUMN     "termTerm" "Trimester" NOT NULL;

-- AlterTable
ALTER TABLE "TeachingAssignment" DROP CONSTRAINT "TeachingAssignment_pkey",
DROP COLUMN "termTerm",
ADD COLUMN     "termTerm" "Trimester" NOT NULL,
ADD CONSTRAINT "TeachingAssignment_pkey" PRIMARY KEY ("lecturerId", "courseId", "termYear", "termTerm");

-- AlterTable
ALTER TABLE "Term" DROP CONSTRAINT "Term_pkey",
DROP COLUMN "term",
ADD COLUMN     "term" "Trimester" NOT NULL,
ADD CONSTRAINT "Term_pkey" PRIMARY KEY ("year", "term");

-- AlterTable
ALTER TABLE "User" DROP COLUMN "role";

-- DropEnum
DROP TYPE "Role";

-- CreateTable
CREATE TABLE "MarkingAssignment" (
    "markerId" INTEGER NOT NULL,
    "termYear" INTEGER NOT NULL,
    "termTerm" "Trimester" NOT NULL,
    "courseCode" TEXT NOT NULL,

    CONSTRAINT "MarkingAssignment_pkey" PRIMARY KEY ("markerId","courseCode","termYear","termTerm")
);

-- CreateTable
CREATE TABLE "ELSType" (
    "id" SERIAL NOT NULL,
    "extraDays" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "ELSType_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ELSDuration" (
    "studentId" INTEGER NOT NULL,
    "elsTypeId" INTEGER NOT NULL,
    "startYear" INTEGER NOT NULL,
    "startTerm" "Trimester" NOT NULL,
    "endYear" INTEGER NOT NULL,
    "endTerm" "Trimester" NOT NULL,

    CONSTRAINT "ELSDuration_pkey" PRIMARY KEY ("studentId","elsTypeId")
);

-- CreateIndex
CREATE UNIQUE INDEX "ELSDuration_studentId_key" ON "ELSDuration"("studentId");

-- AddForeignKey
ALTER TABLE "TeachingAssignment" ADD CONSTRAINT "TeachingAssignment_termYear_termTerm_fkey" FOREIGN KEY ("termYear", "termTerm") REFERENCES "Term"("year", "term") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MarkingAssignment" ADD CONSTRAINT "MarkingAssignment_markerId_fkey" FOREIGN KEY ("markerId") REFERENCES "User"("zid") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MarkingAssignment" ADD CONSTRAINT "MarkingAssignment_termYear_termTerm_fkey" FOREIGN KEY ("termYear", "termTerm") REFERENCES "Term"("year", "term") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MarkingAssignment" ADD CONSTRAINT "MarkingAssignment_courseCode_fkey" FOREIGN KEY ("courseCode") REFERENCES "Course"("code") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Assignment" ADD CONSTRAINT "Assignment_termYear_termTerm_fkey" FOREIGN KEY ("termYear", "termTerm") REFERENCES "Term"("year", "term") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ELSDuration" ADD CONSTRAINT "ELSDuration_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "User"("zid") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ELSDuration" ADD CONSTRAINT "ELSDuration_elsTypeId_fkey" FOREIGN KEY ("elsTypeId") REFERENCES "ELSType"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ELSDuration" ADD CONSTRAINT "ELSDuration_startYear_startTerm_fkey" FOREIGN KEY ("startYear", "startTerm") REFERENCES "Term"("year", "term") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ELSDuration" ADD CONSTRAINT "ELSDuration_endYear_endTerm_fkey" FOREIGN KEY ("endYear", "endTerm") REFERENCES "Term"("year", "term") ON DELETE RESTRICT ON UPDATE CASCADE;
