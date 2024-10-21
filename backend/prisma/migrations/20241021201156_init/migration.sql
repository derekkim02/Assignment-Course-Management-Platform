/*
  Warnings:

  - You are about to drop the column `filePath` on the `TestCase` table. All the data in the column will be lost.
  - Added the required column `expectedOutput` to the `TestCase` table without a default value. This is not possible if the table is not empty.
  - Added the required column `input` to the `TestCase` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "TestCase_assignmentId_key";

-- AlterTable
ALTER TABLE "TestCase" DROP COLUMN "filePath",
ADD COLUMN     "expectedOutput" TEXT NOT NULL,
ADD COLUMN     "input" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "AutotestExecutable" (
    "id" SERIAL NOT NULL,
    "filePath" TEXT NOT NULL,
    "assignmentId" INTEGER NOT NULL,

    CONSTRAINT "AutotestExecutable_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "AutotestExecutable_assignmentId_key" ON "AutotestExecutable"("assignmentId");

-- AddForeignKey
ALTER TABLE "AutotestExecutable" ADD CONSTRAINT "AutotestExecutable_assignmentId_fkey" FOREIGN KEY ("assignmentId") REFERENCES "Assignment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
