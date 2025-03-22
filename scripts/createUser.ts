import { PrismaClient } from '@prisma/client';

// Inicializa el cliente de Prisma
const prisma = new PrismaClient();

async function main() {
  try {
    // Crear un usuario con el tipo especificado
    const nuevoUsuario = await prisma.usuarios.create({
      data: {
        nombre: 'Juan',
        apellido: 'Pérez',
        email: 'juan.perez@example.com',
        contraseña: 'contraseñaSegura123',
        tipo: 'ADMINISTRADOR', // Especifica el tipo de usuario
        telefono: '1234567890',
      },
    });

    console.log('Usuario creado con éxito:', nuevoUsuario);
  } catch (error) {
    console.error('Error al crear el usuario:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Ejecuta la función principal
main();
