/*
  Warnings:

  - Added the required column `tipo` to the `usuarios` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "TipoUsuario" AS ENUM ('ADMINISTRADOR', 'CLIENTE', 'TECNICO', 'OTRO');

-- AlterTable
ALTER TABLE "usuarios" ADD COLUMN     "tipo" TEXT NOT NULL;
