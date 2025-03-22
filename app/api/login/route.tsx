// app/api/login/route.ts
import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs"; // Asegúrate de que bcryptjs esté instalado

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    const { email, contraseña } = await request.json();

    // Buscar el usuario por email
    const usuario = await prisma.usuarios.findUnique({
      where: { email },
    });

    if (!usuario) {
      return NextResponse.json(
        { message: "Correo electrónico o contraseña incorrectos" },
        { status: 400 }
      );
    }

    // Verificar si el usuario está inactivo
    if (!usuario.activo) {
      return NextResponse.json(
        { message: "Usuario inactivo. Contacte con el administrador." },
        { status: 403 } // Código de estado 403: Prohibido
      );
    }

    // Comparar la contraseña proporcionada con la almacenada en la base de datos
    const contraseñaValida = await bcrypt.compare(contraseña, usuario.contraseña);

    if (!contraseñaValida) {
      return NextResponse.json(
        { message: "Correo electrónico o contraseña incorrectos" },
        { status: 400 }
      );
    }

    // Si todo está bien, devolver el usuario (sin la contraseña)
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { contraseña: _, ...usuarioSinContraseña } = usuario; // Deshabilitar ESLint para esta línea
    return NextResponse.json(usuarioSinContraseña, { status: 200 });

  } catch (error) {
    console.error("Error en el login:", error);
    return NextResponse.json({ message: "Error en el login" }, { status: 500 });
  }
}