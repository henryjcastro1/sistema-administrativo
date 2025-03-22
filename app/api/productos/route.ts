import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { writeFile } from "fs/promises";
import { join } from "path";

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    
    // Procesar imágenes
    const imageFiles = formData.getAll("imagenes") as File[];
    const imageUrls: string[] = [];

    // Guardar imágenes en el sistema de archivos (para desarrollo)
    for (const file of imageFiles) {
      const buffer = Buffer.from(await file.arrayBuffer());
      const filename = `${Date.now()}-${file.name}`;
      const path = join(process.cwd(), "public/uploads", filename);
      await writeFile(path, buffer);
      imageUrls.push(`/uploads/${filename}`);
    }

    // Crear producto con imágenes
    const nuevoProducto = await prisma.producto.create({
      data: {
        nombre: formData.get("nombre") as string,
        descripcion: formData.get("descripcion") as string,
        precio: parseFloat(formData.get("precio") as string),
        stock: parseInt(formData.get("stock") as string),
        categoria: formData.get("categoria") as string,
        activo: formData.get("activo") === "true",
        imagenes: {
          create: imageUrls.map(url => ({ url }))
        }
      },
      include: {
        imagenes: true
      }
    });

    return NextResponse.json(nuevoProducto, { status: 201 });
    
  } catch (error) {
    console.error("Error al crear producto:", error);
    return NextResponse.json(
      { message: "Error al crear producto" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
    try {
      const { id, activo } = await request.json();
      
      const productoActualizado = await prisma.producto.update({
        where: { id },
        data: { activo },
      });
  
      return NextResponse.json(productoActualizado);
    } catch (error) {
      console.error("Error al actualizar producto:", error);
      return NextResponse.json(
        { message: "Error al actualizar producto" },
        { status: 500 }
      );
    }
  }

  export async function GET() {
    try {
      const productos = await prisma.producto.findMany({
        include: {
          imagenes: true
        },
        orderBy: {
          createdAt: 'desc'
        }
      });
      return NextResponse.json(productos);
    } catch (error) {
      console.error("Error al obtener productos:", error);
      return NextResponse.json(
        { message: "Error al obtener productos" },
        { status: 500 }
      );
    }
  }

  export async function DELETE(request: Request) {
    try {
      const { id } = await request.json();
      
      await prisma.producto.delete({
        where: { id }
      });
  
      return NextResponse.json(
        { message: "Producto eliminado correctamente" },
        { status: 200 }
      );
    } catch (error) {
      console.error("Error al eliminar producto:", error);
      return NextResponse.json(
        { message: "Error al eliminar producto" },
        { status: 500 }
      );
    }
  }