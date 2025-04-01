import { NextResponse } from "next/server";
import { CategoriaNombre, PrismaClient } from "@prisma/client";
import { writeFile } from "fs/promises";
import { join } from "path";

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    
    // Procesar imágenes
    const imageFiles = formData.getAll("imagenes") as File[];
    const imageUrls: string[] = [];

    // Guardar imágenes
    for (const file of imageFiles) {
      const buffer = Buffer.from(await file.arrayBuffer());
      const filename = `${Date.now()}-${file.name}`;
      const path = join(process.cwd(), "public/uploads", filename);
      await writeFile(path, buffer);
      imageUrls.push(`/uploads/${filename}`);
    }

    // Obtener y validar categoría
    const categoriaNombre = formData.get("categoria") as CategoriaNombre;
    
    // Verificar si la categoría existe
    let categoria = await prisma.categoria.findUnique({
      where: { nombre: categoriaNombre }
    });

    // Si no existe, crear la categoría
    if (!categoria) {
      categoria = await prisma.categoria.create({
        data: { nombre: categoriaNombre }
      });
    }

    // Crear producto con relación a categoría
    const nuevoProducto = await prisma.producto.create({
      data: {
        nombre: formData.get("nombre") as string,
        descripcion: formData.get("descripcion") as string,
        precio: parseFloat(formData.get("precio") as string),
        stock: parseInt(formData.get("stock") as string),
        categoriaId: categoria.id, // Usar el ID directamente
        activo: formData.get("activo") === "true",
        imagenes: {
          create: imageUrls.map(url => ({ url }))
        }
      },
      include: {
        imagenes: true,
        categoria: true
      }
    });

    return NextResponse.json(nuevoProducto, { status: 201 });
    
  } catch (error) {
    console.error("Error al crear producto:", error);
    return NextResponse.json(
      { 
        message: "Error al crear producto", 
        error: error instanceof Error ? error.message : "Error desconocido",
        details: error instanceof Error ? error.stack : null
      },
      { status: 500 }
    );
  }
}

// ... (mantén tus otros métodos PATCH, GET, DELETE iguales)

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

// En GET (para obtener productos)
export async function GET() {
  try {
    const productos = await prisma.producto.findMany({
      include: { 
        imagenes: true,
        categoria: true // Añade esto para incluir la categoría
      },
      orderBy: { createdAt: 'desc' }
    });

    return new NextResponse(JSON.stringify(productos), {
      status: 200,
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
      },
    });
  } catch (error) {
    console.error("Error al obtener productos:", error);
    return new NextResponse(
      JSON.stringify({ message: "Error al obtener productos" }),
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json; charset=utf-8' },
      }
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