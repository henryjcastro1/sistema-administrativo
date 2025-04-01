import { NextResponse } from 'next/server';
import { PrismaClient, CategoriaNombre } from '@prisma/client';
import * as csv from 'csv-parser';
import { Readable } from 'stream';

const prisma = new PrismaClient();

interface CsvProduct {
  nombre: string;
  descripcion?: string;
  precio: string;
  stock: string;
  categoria: string;
  activo?: string;
  [key: string]: string | undefined;
}

interface ProcessedProduct {
  nombre: string;
  descripcion: string;
  precio: number;
  stock: number;
  categoriaId: number;
  activo: boolean;
}

interface ErrorResponse {
  error: string;
  details?: string;
  invalidProducts?: Array<{ product: Partial<CsvProduct>; error: string }>;
}

export async function POST(request: Request): Promise<NextResponse> {
  try {
    const formData = await request.formData();
    const csvFile = formData.get('csv');

    if (!(csvFile instanceof File)) {
      return NextResponse.json(
        { error: 'No se proporcionó un archivo CSV válido' },
        { status: 400 }
      );
    }

    const results: CsvProduct[] = [];
    const buffer = Buffer.from(await csvFile.arrayBuffer());
    const stream = Readable.from(buffer.toString());

    await new Promise((resolve, reject) => {
      stream
        .pipe(csv())
        .on('data', (data: CsvProduct) => results.push(data))
        .on('end', resolve)
        .on('error', reject);
    });

    if (results.length === 0) {
      return NextResponse.json(
        { error: 'El archivo CSV está vacío o no contiene datos válidos' },
        { status: 400 }
      );
    }

    const processedProducts: ProcessedProduct[] = [];
    const invalidProducts: Array<{ product: Partial<CsvProduct>; error: string }> = [];

    for (const row of results) {
      try {
        if (!row.nombre?.trim() || !row.precio || !row.stock || !row.categoria?.trim()) {
          throw new Error('Faltan campos requeridos');
        }

        const precio = parseFloat(row.precio);
        if (isNaN(precio) || precio <= 0) {
          throw new Error('Precio no válido');
        }

        const stock = parseInt(row.stock);
        if (isNaN(stock) || stock < 0) {
          throw new Error('Stock no válido');
        }

        // Validar si la categoría existe en el enum
        const categoriaNombre = row.categoria.trim().toUpperCase() as CategoriaNombre;
        if (!Object.values(CategoriaNombre).includes(categoriaNombre)) {
          throw new Error(`Categoría no válida: ${row.categoria}`);
        }

        let categoria = await prisma.categoria.findUnique({
          where: { nombre: categoriaNombre }
        });

        if (!categoria) {
          categoria = await prisma.categoria.create({
            data: { nombre: categoriaNombre }
          });
        }

        processedProducts.push({
          nombre: row.nombre.trim(),
          descripcion: row.descripcion?.trim() || '',
          precio,
          stock,
          categoriaId: categoria.id,
          activo: row.activo?.toLowerCase() === 'true' || true,
        });
      } catch (error) {
        invalidProducts.push({
          product: row,
          error: error instanceof Error ? error.message : 'Error desconocido al procesar producto'
        });
      }
    }

    if (processedProducts.length === 0) {
      return NextResponse.json(
        { 
          error: 'No se pudo procesar ningún producto',
          invalidProducts 
        } as ErrorResponse,
        { status: 400 }
      );
    }

    const createdProducts = await prisma.$transaction(
      processedProducts.map(product => 
        prisma.producto.create({ data: product })
      )
    );

    const response = {
      message: 'Productos importados correctamente',
      count: createdProducts.length,
      products: createdProducts,
      ...(invalidProducts.length > 0 && {
        warnings: {
          count: invalidProducts.length,
          invalidProducts
        }
      })
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('Error al importar productos:', error);
    return NextResponse.json(
      { 
        error: 'Error al importar productos',
        details: error instanceof Error ? error.message : 'Error desconocido'
      } as ErrorResponse,
      { status: 500 }
    );
  }
}
