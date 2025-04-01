'use client'
import { useEffect, useState } from "react";
import { FiSearch, FiTrash2, FiEye, FiChevronLeft, FiChevronRight } from "react-icons/fi";
import { Venta, ItemVenta } from "@prisma/client";
import React from "react";

interface VentaCompleta extends Venta {
  cliente: {
    nombre: string;
    email: string;
  };
  items: (ItemVenta & {
    producto: {
      nombre: string;
    };
  })[];
}

export default function VentasPage() {
  const [ventas, setVentas] = useState<VentaCompleta[]>([]);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const ventasPerPage = 10;

  useEffect(() => {
    const fetchVentas = async () => {
      try {
        setIsLoading(true);
        const response = await fetch("/api/ventas");
        if (!response.ok) throw new Error("Error al cargar ventas");
        const data = await response.json();
        setVentas(data);
        setError(null);
      } catch (err) {
        console.error(err);
        setError("No se pudieron cargar las ventas. Intente nuevamente.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchVentas();
  }, []);

  const filteredVentas = ventas.filter(
    (venta) =>
      venta.cliente.nombre.toLowerCase().includes(search.toLowerCase()) ||
      venta.cliente.email.toLowerCase().includes(search.toLowerCase()) ||
      venta.id.toString().includes(search.toLowerCase())
  );

  const totalPages = Math.ceil(filteredVentas.length / ventasPerPage);
  const startIndex = (currentPage - 1) * ventasPerPage;
  const currentVentas = filteredVentas.slice(startIndex, startIndex + ventasPerPage);

  const changePage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const eliminarVenta = async (id: number) => {
    const venta = ventas.find((v) => v.id === id);
    if (!venta) return;

    const confirmacion = window.confirm(
      `¿Estás seguro de que quieres eliminar la venta #${venta.id}? Esta acción no se puede deshacer.`
    );
    if (!confirmacion) return;

    try {
      const response = await fetch(`/api/ventas`, {
        method: "DELETE",
        body: JSON.stringify({ id }),
        headers: { "Content-Type": "application/json" },
      });

      if (response.ok) {
        setVentas((prevVentas) =>
          prevVentas.filter((venta) => venta.id !== id)
        );
      } else {
        throw new Error("Error al eliminar la venta");
      }
    } catch (error) {
      console.error(error);
      alert("Ocurrió un error al eliminar la venta");
    }
  };

  const formatearFecha = (fecha: Date | string) => {
    const fechaObj = new Date(fecha);
    return fechaObj.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-white rounded-xl shadow-md p-6">
        <h1 className="text-2xl font-bold mb-6 text-gray-800">Lista de Ventas</h1>

        {/* Buscador */}
        <div className="relative mb-6">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <FiSearch className="text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Buscar venta por ID, cliente o email..."
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
          />
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : error ? (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
            <strong className="font-bold">Error: </strong>
            <span className="block sm:inline">{error}</span>
          </div>
        ) : (
          <>
            {/* Tabla responsive */}
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      ID
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Cliente
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Fecha
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Productos
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Total
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Estado
                    </th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {currentVentas.length > 0 ? (
                    currentVentas.map((venta) => (
                      <tr key={venta.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          #{venta.id}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{venta.cliente.nombre}</div>
                          <div className="text-sm text-gray-500">{venta.cliente.email}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatearFecha(venta.createdAt)}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-col gap-1">
                            {venta.items.map((item) => (
                              <div key={item.id} className="text-sm text-gray-700">
                                {item.cantidad}x {item.producto.nombre} (${item.precioUnitario.toFixed(2)})
                              </div>
                            ))}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                          ${venta.total.toFixed(2)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`px-2 py-1 text-xs font-semibold rounded-full ${
                              venta.estado === 'COMPLETADA' ? 'bg-green-100 text-green-800' : 
                              venta.estado === 'PENDIENTE' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'
                            }`}
                          >
                            {venta.estado}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex justify-end space-x-2">
                            <button
                              className="text-blue-600 hover:text-blue-900"
                              onClick={() => window.alert(`Detalles de venta #${venta.id}`)}
                              title="Ver detalles"
                            >
                              <FiEye className="h-5 w-5" />
                            </button>
                            <button
                              className="text-red-600 hover:text-red-900"
                              onClick={() => eliminarVenta(venta.id)}
                              title="Eliminar"
                            >
                              <FiTrash2 className="h-5 w-5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={7} className="px-6 py-4 text-center text-sm text-gray-500">
                        No se encontraron ventas
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Paginación mejorada */}
            <div className="flex items-center justify-between mt-6">
              <div className="text-sm text-gray-700">
                Mostrando <span className="font-medium">{startIndex + 1}</span> a{' '}
                <span className="font-medium">
                  {Math.min(startIndex + ventasPerPage, filteredVentas.length)}
                </span>{' '}
                de <span className="font-medium">{filteredVentas.length}</span> ventas
              </div>
              
              <div className="flex space-x-2">
                <button
                  onClick={() => changePage(currentPage - 1)}
                  disabled={currentPage === 1}
                  className={`px-3 py-1 rounded-md ${currentPage === 1 ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                >
                  <FiChevronLeft className="h-5 w-5" />
                </button>
                
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }
                  
                  return (
                    <button
                      key={pageNum}
                      onClick={() => changePage(pageNum)}
                      className={`px-3 py-1 rounded-md ${currentPage === pageNum ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
                
                <button
                  onClick={() => changePage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className={`px-3 py-1 rounded-md ${currentPage === totalPages ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                >
                  <FiChevronRight className="h-5 w-5" />
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}