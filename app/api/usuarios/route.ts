// app/api/usuarios/route.ts
import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs"; // Importa bcrypt para hashear la contraseña

const prisma = new PrismaClient();

// Obtener todos los usuarios (GET)
export async function GET() {
  try {
    const usuarios = await prisma.usuarios.findMany();
    return NextResponse.json(usuarios, { status: 200 });
  } catch (error) {
    console.error("Error al obtener usuarios:", error);
    return NextResponse.json({ message: "Error al obtener usuarios" }, { status: 500 });
  }
}

// Crear un usuario (POST)
export async function POST(request: Request) {
  try {
    const { nombre, apellido, email, contraseña, telefono, tipo, activo } = await request.json();

    // Verificar si el usuario ya existe
    const usuarioExistente = await prisma.usuarios.findUnique({
      where: { email },
    });

    if (usuarioExistente) {
      return NextResponse.json(
        { message: "El correo electrónico ya está registrado" },
        { status: 400 }
      );
    }

    // Hashear la contraseña antes de guardarla
    const hashedPassword = await bcrypt.hash(contraseña, 10); // 10 es el número de rondas de hashing

    // Crear el nuevo usuario con la contraseña hasheada
    const nuevoUsuario = await prisma.usuarios.create({
      data: { 
        nombre, 
        apellido, 
        email, 
        contraseña: hashedPassword, // Guardar la contraseña hasheada
        telefono, 
        tipo, 
        activo 
      },
    });

    return NextResponse.json(nuevoUsuario, { status: 201 });
  } catch (error) {
    console.error("Error al crear usuario:", error);
    return NextResponse.json({ message: "Error al crear usuario" }, { status: 500 });
  }
}

// Actualizar el estado de un usuario (PATCH)
export async function PATCH(request: Request) {
  try {
    const { id, activo } = await request.json();

    const usuarioActualizado = await prisma.usuarios.update({
      where: { id },
      data: { activo },
    });

    return NextResponse.json(usuarioActualizado, { status: 200 });
  } catch (error) {
    console.error("Error al actualizar usuario:", error);
    return NextResponse.json({ message: "Error al actualizar usuario" }, { status: 500 });
  }
}

// Eliminar un usuario (DELETE)
export async function DELETE(request: Request) {
  try {
    const { id } = await request.json();

    await prisma.usuarios.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Usuario eliminado correctamente" }, { status: 200 });
  } catch (error) {
    console.error("Error al eliminar usuario:", error);
    return NextResponse.json({ message: "Error al eliminar usuario" }, { status: 500 });
  }
}