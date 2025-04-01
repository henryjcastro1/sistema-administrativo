import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { writeFile } from "fs/promises";
import { join } from "path";

const prisma = new PrismaClient();

// Definimos tipos para los datos de la solicitud
type ImageUpdateFormData = {
  productoId: string;
  keepImageIds: string[];
  imagenes: File[];
};

type ProcessedImage = {
  url: string;
};

export async function PUT(request: Request) {
  try {
    const formData = await request.formData();
    
    // Validar y convertir datos del formulario
    const rawFormData: ImageUpdateFormData = {
      productoId: formData.get("productoId") as string,
      keepImageIds: formData.getAll("keepImageIds") as string[],
      imagenes: formData.getAll("imagenes") as File[],
    };

    // Validaciones básicas
    if (!rawFormData.productoId) {
      return NextResponse.json(
        { message: "El ID del producto es requerido" },
        { status: 400 }
      );
    }

    const productoId = Number(rawFormData.productoId);
    if (isNaN(productoId)) {
      return NextResponse.json(
        { message: "El ID del producto debe ser un número válido" },
        { status: 400 }
      );
    }

    const keepImageIds = rawFormData.keepImageIds.map(id => {
      const numId = Number(id);
      return isNaN(numId) ? null : numId;
    }).filter((id): id is number => id !== null);

    // 1. Eliminar imágenes no seleccionadas
    if (keepImageIds.length > 0) {
      await prisma.imagen.deleteMany({
        where: {
          productoId,
          NOT: { id: { in: keepImageIds } }
        }
      });
    } else {
      // Si no hay imágenes para mantener, eliminar todas
      await prisma.imagen.deleteMany({
        where: { productoId }
      });
    }

    // 2. Procesar y guardar nuevas imágenes
    const newImages: ProcessedImage[] = [];
    
    for (const file of rawFormData.imagenes) {
      try {
        // Validar que sea una imagen
        if (!file.type.startsWith('image/')) {
          console.warn(`Archivo ${file.name} no es una imagen, omitiendo...`);
          continue;
        }

        const buffer = Buffer.from(await file.arrayBuffer());
        const sanitizedName = file.name.replace(/[^\w.-]/g, '_');
        const filename = `${Date.now()}-${sanitizedName}`;
        const path = join(process.cwd(), "public/uploads", filename);
        
        await writeFile(path, buffer);
        newImages.push({ url: `/uploads/${filename}` });
      } catch (fileError) {
        console.error(`Error procesando archivo ${file.name}:`, fileError);
        // Continuar con las siguientes imágenes aunque falle una
      }
    }

    // 3. Actualizar producto con nuevas imágenes
    const updatedProducto = await prisma.producto.update({
      where: { id: productoId },
      data: {
        imagenes: {
          create: newImages
        }
      },
      include: {
        imagenes: true,
        categoria: true // Incluir categoría para consistencia con otros endpoints
      }
    });

    return NextResponse.json(updatedProducto);

  } catch (error) {
    console.error("Error en API:", error);
    
    const errorMessage = error instanceof Error ? error.message : "Error desconocido";
    const errorStack = error instanceof Error ? error.stack : undefined;
    
    return NextResponse.json(
      { 
        message: "Error al actualizar imágenes",
        error: errorMessage,
        ...(process.env.NODE_ENV === 'development' && { stack: errorStack })
      },
      { status: 500 }
    );
  }
}