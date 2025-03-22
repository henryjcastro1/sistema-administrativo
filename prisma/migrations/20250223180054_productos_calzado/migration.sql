/*
  Warnings:

  - You are about to drop the `imagen` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `categoria` to the `productos` table without a default value. This is not possible if the table is not empty.
  - Added the required column `color` to the `productos` table without a default value. This is not possible if the table is not empty.
  - Added the required column `marca` to the `productos` table without a default value. This is not possible if the table is not empty.
  - Added the required column `talla` to the `productos` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "imagen" DROP CONSTRAINT "imagen_productoId_fkey";

-- AlterTable
ALTER TABLE "productos" ADD COLUMN     "categoria" TEXT NOT NULL,
ADD COLUMN     "color" TEXT NOT NULL,
ADD COLUMN     "marca" TEXT NOT NULL,
ADD COLUMN     "talla" TEXT NOT NULL;

-- DropTable
DROP TABLE "imagen";

-- CreateTable
CREATE TABLE "imagenes" (
    "id" SERIAL NOT NULL,
    "url" TEXT NOT NULL,
    "productoId" INTEGER NOT NULL,

    CONSTRAINT "imagenes_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "imagenes" ADD CONSTRAINT "imagenes_productoId_fkey" FOREIGN KEY ("productoId") REFERENCES "productos"("id") ON DELETE CASCADE ON UPDATE CASCADE;
