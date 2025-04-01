// app/api/usuarios/route.ts
import { NextResponse } from "next/server";
import { PrismaClient, TipoUsuario } from "@prisma/client";
import bcrypt from "bcryptjs";


const prisma = new PrismaClient();

// Obtener todos los usuarios (GET)
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const tipo = searchParams.get('tipo');
    
    const usuarios = await prisma.usuario.findMany({
      where: tipo ? { tipo: tipo as TipoUsuario } : {},
      select: {
        id: true,
        nombre: true,
        apellido: true,
        email: true,
        telefono: true,
        tipo: true,
        activo: true,
        createdAt: true
      }
    });
    
    return NextResponse.json(usuarios, { status: 200 });
  } catch (error) {
    console.error("Error al obtener usuarios:", error);
    return NextResponse.json(
      { message: "Error al obtener usuarios", error: error instanceof Error ? error.message : "Error desconocido" },
      { status: 500 }
    );
  }
}

// Crear un usuario (POST)
export async function POST(request: Request) {
  try {
    const { nombre, apellido, email, contraseña, telefono, tipo, activo } = await request.json();

    // Verificar si el usuario ya existe
    const usuarioExistente = await prisma.usuario.findUnique({
      where: { email },
    });

    if (usuarioExistente) {
      return NextResponse.json(
        { message: "El correo electrónico ya está registrado" },
        { status: 400 }
      );
    }

    // Hashear la contraseña antes de guardarla
    const hashedPassword = await bcrypt.hash(contraseña, 10);

    // Crear el nuevo usuario con la contraseña hasheada
    const nuevoUsuario = await prisma.usuario.create({
      data: { 
        nombre, 
        apellido, 
        email, 
        contraseña: hashedPassword,
        telefono, 
        tipo: tipo as TipoUsuario, 
        activo 
      },
    });

    return NextResponse.json(nuevoUsuario, { status: 201 });
  } catch (error) {
    console.error("Error al crear usuario:", error);
    return NextResponse.json(
      { 
        message: "Error al crear usuario",
        error: error instanceof Error ? error.message : "Error desconocido" 
      }, 
      { status: 500 }
    );
  }
}

// Actualizar el estado de un usuario (PATCH)
export async function PATCH(request: Request) {
  try {
    const { id, activo } = await request.json();

    const usuarioActualizado = await prisma.usuario.update({
      where: { id },
      data: { activo },
    });

    return NextResponse.json(usuarioActualizado, { status: 200 });
  } catch (error) {
    console.error("Error al actualizar usuario:", error);
    return NextResponse.json(
      { 
        message: "Error al actualizar usuario",
        error: error instanceof Error ? error.message : "Error desconocido" 
      }, 
      { status: 500 }
    );
  }
}

// Eliminar un usuario (DELETE)
export async function DELETE(request: Request) {
  try {
    const { id } = await request.json();

    await prisma.usuario.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Usuario eliminado correctamente" }, { status: 200 });
  } catch (error) {
    console.error("Error al eliminar usuario:", error);
    return NextResponse.json(
      { 
        message: "Error al eliminar usuario",
        error: error instanceof Error ? error.message : "Error desconocido" 
      }, 
      { status: 500 }
    );
  }
}