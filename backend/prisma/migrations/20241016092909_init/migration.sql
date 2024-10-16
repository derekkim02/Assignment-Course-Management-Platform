/*
  Warnings:

  - You are about to drop the column `role` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "User" DROP COLUMN "role";

-- DropEnum
DROP TYPE "Role";

-- CreateTable
CREATE TABLE "MarkingAssignment" (
    "markerId" INTEGER NOT NULL,
    "termYear" INTEGER NOT NULL,
    "termTerm" INTEGER NOT NULL,
    "courseCode" TEXT NOT NULL,

    CONSTRAINT "MarkingAssignment_pkey" PRIMARY KEY ("markerId","courseCode","termYear","termTerm")
);

-- AddForeignKey
ALTER TABLE "MarkingAssignment" ADD CONSTRAINT "MarkingAssignment_markerId_fkey" FOREIGN KEY ("markerId") REFERENCES "User"("zid") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MarkingAssignment" ADD CONSTRAINT "MarkingAssignment_termYear_termTerm_fkey" FOREIGN KEY ("termYear", "termTerm") REFERENCES "Term"("year", "term") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MarkingAssignment" ADD CONSTRAINT "MarkingAssignment_courseCode_fkey" FOREIGN KEY ("courseCode") REFERENCES "Course"("code") ON DELETE RESTRICT ON UPDATE CASCADE;
