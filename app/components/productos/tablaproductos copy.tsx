'use client';
import { useEffect, useState } from "react";
import { FiSearch, FiTrash2, FiEdit, FiImage } from "react-icons/fi";
import Image from "next/image";
import React from 'react';

type Producto = {
  id: number;
  nombre: string;
  descripcion: string;
  precio: number;
  stock: number;
  categoria: string;
  activo: boolean;
  imagenes: { url: string }[];
};

const formatPrecio = (precio: number): string => {
  return precio.toLocaleString('es-ES'); // Formato español con separadores de miles
};

export default function Tablaproducts() {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    const fetchProductos = async () => {
      try {
        const response = await fetch("/api/productos");
        if (!response.ok) throw new Error("Error al cargar productos");
        const data: Producto[] = await response.json();
        setProductos(data);
      } catch (error) {
        console.error(error);
      }
    };
    fetchProductos();
  }, []);

  const filteredProductos = productos.filter(
    (producto) =>
      producto.nombre.toLowerCase().includes(search.toLowerCase()) ||
      producto.categoria.toLowerCase().includes(search.toLowerCase()) ||
      producto.descripcion.toLowerCase().includes(search.toLowerCase())
  );

  const totalPages = Math.ceil(filteredProductos.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentProductos = filteredProductos.slice(startIndex, startIndex + itemsPerPage);

  const changePage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const toggleActivo = async (id: number) => {
    const producto = productos.find((p) => p.id === id);
    if (!producto) return;

    const confirmacion = window.confirm(
      `¿Estás seguro de que quieres ${producto.activo ? "inactivar" : "activar"} el producto ${producto.nombre}?`
    );
    if (!confirmacion) return;

    try {
      const response = await fetch("/api/productos", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, activo: !producto.activo }),
      });

      if (response.ok) {
        setProductos((prev) =>
          prev.map((p) => (p.id === id ? { ...p, activo: !p.activo } : p))
        );
      }
    } catch (error) {
      console.error("Error al actualizar producto:", error);
    }
  };

  const eliminarProducto = async (id: number) => {
    const producto = productos.find((p) => p.id === id);
    if (!producto) return;

    const confirmacion = window.confirm(
      `¿Estás seguro de eliminar el producto ${producto.nombre}?`
    );
    if (!confirmacion) return;

    try {
      const response = await fetch("/api/productos", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });

      if (response.ok) {
        setProductos((prev) => prev.filter((p) => p.id !== id));
      }
    } catch (error) {
      console.error("Error al eliminar producto:", error);
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4 text-gray-800">Catálogo de Productos</h1>

      {/* Buscador */}
      <div className="flex items-center bg-white shadow-md rounded-lg p-2 mb-4">
        <FiSearch className="text-gray-500 mx-2" />
        <input
          type="text"
          placeholder="Buscar productos..."
          className="w-full p-2 outline-none"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Tabla de productos */}
      <div className="bg-white shadow-md rounded-lg overflow-y-auto max-h-96">
        <table className="min-w-full text-sm text-left text-gray-600">
          <thead className="bg-gray-100 text-gray-700 uppercase">
            <tr>
              <th className="p-3">Imagen</th>
              <th className="p-3">Nombre</th>
              <th className="p-3">Precio</th>
              <th className="p-3">Stock</th>
              <th className="p-3">Categoría</th>
              <th className="p-3">Estado</th>
              <th className="p-3 text-center">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {currentProductos.map((producto) => (
              <tr key={producto.id} className="hover:bg-gray-100">
                <td className="p-3">
                  {producto.imagenes.length > 0 ? (
                    <Image
                      src={producto.imagenes[0].url}
                      alt={producto.nombre}
                      width={50}
                      height={50}
                      className="object-cover rounded"
                    />
                  ) : (
                    <FiImage className="text-gray-400 text-xl" />
                  )}
                </td>
                <td className="p-3 font-medium">{producto.nombre}</td>
                <td className="p-3">${formatPrecio(producto.precio)}</td>
                <td className="p-3">{producto.stock}</td>
                <td className="p-3">{producto.categoria}</td>
                <td className="p-3">
                  <span
                    className={`px-3 py-1 rounded-full text-white ${
                      producto.activo ? "bg-green-500" : "bg-red-500"
                    }`}
                  >
                    {producto.activo ? "Activo" : "Inactivo"}
                  </span>
                </td>
                <td className="p-3 flex justify-center gap-3">
                  <button
                    className="bg-yellow-500 hover:bg-yellow-600 text-white flex items-center gap-2 px-3 py-2 rounded-lg"
                    onClick={() => toggleActivo(producto.id)}
                  >
                    <FiEdit />
                    {producto.activo ? "Inactivar" : "Activar"}
                  </button>
                  <button
                    className="bg-red-500 hover:bg-red-600 text-white flex items-center gap-2 px-3 py-2 rounded-lg"
                    onClick={() => eliminarProducto(producto.id)}
                  >
                    <FiTrash2 />
                    Eliminar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Paginación */}
      <div className="flex justify-between items-center mt-4">
        <span>Mostrando {currentProductos.length} de {filteredProductos.length} productos</span>
        <div className="flex gap-4">
          <button
            className="bg-gray-300 text-gray-700 px-3 py-2 rounded-lg disabled:opacity-50"
            onClick={() => changePage(currentPage - 1)}
            disabled={currentPage === 1}
          >
            Anterior
          </button>
          <span>{`Página ${currentPage} de ${totalPages}`}</span>
          <button
            className="bg-gray-300 text-gray-700 px-3 py-2 rounded-lg disabled:opacity-50"
            onClick={() => changePage(currentPage + 1)}
            disabled={currentPage === totalPages || totalPages === 0}
          >
            Siguiente
          </button>
        </div>
      </div>
    </div>
  );
}