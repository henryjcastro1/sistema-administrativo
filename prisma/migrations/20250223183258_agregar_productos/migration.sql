/*
  Warnings:

  - You are about to drop the `Imagen` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Producto` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Imagen" DROP CONSTRAINT "Imagen_productoId_fkey";

-- DropTable
DROP TABLE "Imagen";

-- DropTable
DROP TABLE "Producto";

-- CreateTable
CREATE TABLE "producto" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT NOT NULL,
    "precio" DOUBLE PRECISION NOT NULL,
    "stock" INTEGER NOT NULL,
    "categoria" TEXT NOT NULL,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "producto_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "imagen" (
    "id" SERIAL NOT NULL,
    "url" TEXT NOT NULL,
    "productoId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "imagen_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "imagen" ADD CONSTRAINT "imagen_productoId_fkey" FOREIGN KEY ("productoId") REFERENCES "producto"("id") ON DELETE CASCADE ON UPDATE CASCADE;
