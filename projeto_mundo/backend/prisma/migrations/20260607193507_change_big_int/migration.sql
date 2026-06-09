/*
  Warnings:

  - You are about to alter the column `populacao` on the `cidade` table. The data in that column could be lost. The data in that column will be cast from `BigInt` to `Integer`.
  - You are about to alter the column `populacao` on the `pais` table. The data in that column could be lost. The data in that column will be cast from `BigInt` to `Integer`.

*/
-- AlterTable
ALTER TABLE "cidade" ALTER COLUMN "populacao" SET DATA TYPE INTEGER;

-- AlterTable
ALTER TABLE "pais" ALTER COLUMN "populacao" SET DATA TYPE INTEGER;
