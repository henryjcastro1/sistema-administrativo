import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET() {
  try {
    const clientes = await prisma.usuario.findMany({
      where: { tipo: 'CLIENTE' },
      select: {
        id: true,
        nombre: true,
        apellido: true,
        email: true
      }
    });
    
    return NextResponse.json(clientes, { status: 200 });
  } catch (error) {
    console.error("Error al obtener clientes:", error);
    return NextResponse.json(
      { message: "Error al obtener clientes", error: error instanceof Error ? error.message : "Error desconocido" },
      { status: 500 }
    );
  }
}