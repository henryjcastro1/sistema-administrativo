/*
  Warnings:

  - You are about to drop the column `color` on the `productos` table. All the data in the column will be lost.
  - You are about to drop the column `descripcion` on the `productos` table. All the data in the column will be lost.
  - You are about to drop the column `marca` on the `productos` table. All the data in the column will be lost.
  - You are about to drop the column `talla` on the `productos` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "productos" DROP COLUMN "color",
DROP COLUMN "descripcion",
DROP COLUMN "marca",
DROP COLUMN "talla",
ALTER COLUMN "stock" DROP DEFAULT;

-- CreateTable
CREATE TABLE "imagen" (
    "id" SERIAL NOT NULL,
    "url" TEXT NOT NULL,
    "productoId" INTEGER NOT NULL,

    CONSTRAINT "imagen_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "imagen" ADD CONSTRAINT "imagen_productoId_fkey" FOREIGN KEY ("productoId") REFERENCES "productos"("id") ON DELETE CASCADE ON UPDATE CASCADE;
