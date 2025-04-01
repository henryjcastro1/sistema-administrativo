import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Interfaces para tipado seguro
interface RequestBody {
  clienteId: number;
  items: {
    productoId: number;
    cantidad: number;
    precioUnitario: number;
  }[];
}

interface ProductoResponse {
  id: number;
  nombre: string;
  stock: number;
}

interface ItemVentaResponse {
  id: number;
  productoId: number;
  cantidad: number;
  precioUnitario: number;
  subtotal: number;
  producto: ProductoResponse;
}

interface VentaResponse {
  id: number;
  clienteId: number;
  total: number;
  estado: string;
  createdAt: Date;
  items: ItemVentaResponse[];
  cliente: {
    nombre: string;
    email: string;
  };
}

interface DeleteRequestBody {
  id: number;
}

// POST - Crear nueva venta
export async function POST(request: Request) {
  try {
    const { clienteId, items }: RequestBody = await request.json();

    // Validación básica
    if (!clienteId || !items || items.length === 0) {
      return NextResponse.json(
        { success: false, message: "Datos de venta incompletos" },
        { status: 400 }
      );
    }

    // Verificar stock antes de procesar
    await Promise.all(
      items.map(async (item) => {
        const producto = await prisma.producto.findUnique({
          where: { id: item.productoId },
          select: { id: true, nombre: true, stock: true }
        });

        if (!producto) {
          throw new Error(`Producto con ID ${item.productoId} no encontrado`);
        }

        if (producto.stock < item.cantidad) {
          throw new Error(`Stock insuficiente para el producto ${producto.nombre}`);
        }
      })
    );

    // Calcular total
    const total = items.reduce((sum, item) => sum + (item.precioUnitario * item.cantidad), 0);

    // Crear la venta usando transacción
    const venta = await prisma.$transaction(async (tx) => {
      // 1. Crear la venta
      const nuevaVenta = await tx.venta.create({
        data: {
          clienteId,
          total,
          estado: 'COMPLETADA',
          items: {
            create: items.map(item => ({
              productoId: item.productoId,
              cantidad: item.cantidad,
              precioUnitario: item.precioUnitario,
              subtotal: item.precioUnitario * item.cantidad
            }))
          }
        },
        include: {
          cliente: {
            select: {
              nombre: true,
              email: true
            }
          },
          items: {
            include: {
              producto: {
                select: {
                  id: true,
                  nombre: true,
                  stock: true
                }
              }
            }
          }
        }
      });

      // 2. Actualizar stock de productos
      await Promise.all(
        items.map(item =>
          tx.producto.update({
            where: { id: item.productoId },
            data: { stock: { decrement: item.cantidad } }
          })
        )
      );

      return nuevaVenta;
    });

    // Formatear respuesta
    const response: VentaResponse = {
      id: venta.id,
      clienteId: venta.clienteId,
      total: venta.total,
      estado: venta.estado,
      createdAt: venta.createdAt,
      cliente: {
        nombre: venta.cliente.nombre,
        email: venta.cliente.email
      },
      items: venta.items.map(item => ({
        id: item.id,
        productoId: item.productoId,
        cantidad: item.cantidad,
        precioUnitario: item.precioUnitario,
        subtotal: item.subtotal,
        producto: {
          id: item.producto.id,
          nombre: item.producto.nombre,
          stock: item.producto.stock
        }
      }))
    };

    return NextResponse.json<VentaResponse>(response, { status: 201 });
  } catch (error) {
    console.error("Error al crear venta:", error);
    return NextResponse.json(
      { 
        success: false,
        message: "Error al crear venta", 
        error: error instanceof Error ? error.message : "Error desconocido",
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}

// GET - Obtener todas las ventas
export async function GET() {
  try {
    const ventas = await prisma.venta.findMany({
      include: {
        cliente: {
          select: {
            nombre: true,
            email: true
          }
        },
        items: {
          include: {
            producto: {
              select: {
                nombre: true
              }
            }
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json(ventas);
  } catch (error) {
    console.error("Error al obtener ventas:", error);
    return NextResponse.json(
      { error: "Error al obtener ventas" },
      { status: 500 }
    );
  }
}

// DELETE - Eliminar una venta
export async function DELETE(request: Request) {
  try {
    const { id }: DeleteRequestBody = await request.json();
    
    if (!id) {
      return NextResponse.json(
        { success: false, message: "ID de venta no proporcionado" },
        { status: 400 }
      );
    }

    // Verificar si la venta existe
    const ventaExistente = await prisma.venta.findUnique({
      where: { id },
      include: { items: true }
    });

    if (!ventaExistente) {
      return NextResponse.json(
        { success: false, message: "Venta no encontrada" },
        { status: 404 }
      );
    }

    // Usar transacción para revertir el stock y eliminar
    await prisma.$transaction(async (tx) => {
      // 1. Revertir stock de productos
      await Promise.all(
        ventaExistente.items.map(item =>
          tx.producto.update({
            where: { id: item.productoId },
            data: { stock: { increment: item.cantidad } }
          })
        )
      );

      // 2. Eliminar items de venta
      await tx.itemVenta.deleteMany({
        where: { ventaId: id }
      });

      // 3. Eliminar la venta
      await tx.venta.delete({
        where: { id }
      });
    });

    return NextResponse.json(
      { success: true, message: "Venta eliminada correctamente" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error al eliminar venta:", error);
    return NextResponse.json(
      { 
        success: false, 
        message: "Error al eliminar venta",
        error: error instanceof Error ? error.message : "Error desconocido"
      },
      { status: 500 }
    );
  }
}

// PATCH - Actualizar estado de venta
// PATCH - Actualizar estado de venta
export async function PATCH(request: Request) {
  try {
    const { id, estado }: { id: number; estado: string } = await request.json();
    
    if (!id || !estado) {
      return NextResponse.json(
        { success: false, message: "Datos incompletos" },
        { status: 400 }
      );
    }

    // Validar que el estado sea uno de los permitidos
    const estadosPermitidos = ['PENDIENTE', 'COMPLETADA', 'CANCELADA'];
    if (!estadosPermitidos.includes(estado)) {
      return NextResponse.json(
        { 
          success: false, 
          message: "Estado no válido. Los estados permitidos son: PENDIENTE, COMPLETADA, CANCELADA" 
        },
        { status: 400 }
      );
    }

    // Convertir el string a tipo Enum para Prisma
    const estadoActualizado = estado as 'PENDIENTE' | 'COMPLETADA' | 'CANCELADA';

    const ventaActualizada = await prisma.venta.update({
      where: { id },
      data: { 
        estado: estadoActualizado 
      },
      include: {
        cliente: {
          select: {
            nombre: true,
            email: true
          }
        }
      }
    });

    return NextResponse.json(
      { 
        success: true, 
        message: "Estado de venta actualizado",
        venta: ventaActualizada
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error al actualizar venta:", error);
    return NextResponse.json(
      { 
        success: false, 
        message: "Error al actualizar venta",
        error: error instanceof Error ? error.message : "Error desconocido"
      },
      { status: 500 }
    );
  }
}