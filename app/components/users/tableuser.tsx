"use client";
import { useEffect, useState } from "react";
import { FiSearch, FiTrash2, FiUserX } from "react-icons/fi"; // Importamos los íconos
import React from 'react';

type Usuario = {
  id: number;
  nombre: string;
  apellido: string;
  email: string;
  telefono: string;
  tipo: string;
  activo: boolean;
};

export default function UsuariosPage() {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const usersPerPage = 10;

  useEffect(() => {
    const fetchUsuarios = async () => {
      try {
        const response = await fetch("/api/usuarios");
        if (!response.ok) throw new Error("Error al cargar usuarios");
        const data: Usuario[] = await response.json();
        setUsuarios(data);
      } catch (error) {
        console.error(error);
      }
    };
    fetchUsuarios();
  }, []);

  const filteredUsuarios = usuarios.filter(
    (usuario) =>
      usuario.nombre.toLowerCase().includes(search.toLowerCase()) ||
      usuario.apellido.toLowerCase().includes(search.toLowerCase()) ||
      usuario.email.toLowerCase().includes(search.toLowerCase())
  );

  const totalPages = Math.ceil(filteredUsuarios.length / usersPerPage);
  const startIndex = (currentPage - 1) * usersPerPage;
  const currentUsuarios = filteredUsuarios.slice(startIndex, startIndex + usersPerPage);

  const changePage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const toggleActivo = async (id: number) => {
    const usuario = usuarios.find((u) => u.id === id);
    if (!usuario) return;

    const confirmacion = window.confirm(
      `¿Estás seguro de que quieres ${usuario.activo ? "inactivar" : "activar"} a ${usuario.nombre} ${usuario.apellido}?`
    );
    if (!confirmacion) return;

    try {
      const response = await fetch("/api/usuarios", {
        method: "PATCH",
        body: JSON.stringify({ id, activo: !usuario.activo }),
        headers: { "Content-Type": "application/json" },
      });

      if (response.ok) {
        setUsuarios((prevUsuarios) =>
          prevUsuarios.map((usuario) =>
            usuario.id === id ? { ...usuario, activo: !usuario.activo } : usuario
          )
        );
      } else {
        console.error("Error al actualizar el estado del usuario");
      }
    } catch (error) {
      console.error(error);
    }
  };

  const eliminarUsuario = async (id: number) => {
    const usuario = usuarios.find((u) => u.id === id);
    if (!usuario) return;

    const confirmacion = window.confirm(
      `¿Estás seguro de que quieres eliminar a ${usuario.nombre} ${usuario.apellido}? Esta acción no se puede deshacer.`
    );
    if (!confirmacion) return;

    try {
      const response = await fetch("/api/usuarios", {
        method: "DELETE",
        body: JSON.stringify({ id }),
        headers: { "Content-Type": "application/json" },
      });

      if (response.ok) {
        setUsuarios((prevUsuarios) =>
          prevUsuarios.filter((usuario) => usuario.id !== id)
        );
      } else {
        console.error("Error al eliminar el usuario");
      }
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4 text-gray-800">Lista de Usuarios</h1>

      {/* Buscador */}
      <div className="flex items-center bg-white shadow-md rounded-lg p-2 mb-4">
        <FiSearch className="text-gray-500 mx-2" />
        <input
          type="text"
          placeholder="Buscar usuario..."
          className="w-full p-2 outline-none"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Tabla con scroll */}
      <div className="bg-white shadow-md rounded-lg overflow-y-auto max-h-96">
        <table className="min-w-full text-sm text-left text-gray-600">
          <thead className="bg-gray-100 text-gray-700 uppercase">
            <tr>
              <th className="p-3">ID</th>
              <th className="p-3">Nombre</th>
              <th className="p-3">Apellido</th>
              <th className="p-3">Email</th>
              <th className="p-3">Teléfono</th>
              <th className="p-3">Tipo</th>
              <th className="p-3">Estado</th>
              <th className="p-3 text-center">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {currentUsuarios.map((usuario) => (
              <tr key={usuario.id} className="hover:bg-gray-100">
                <td className="p-3">{usuario.id}</td>
                <td className="p-3">{usuario.nombre}</td>
                <td className="p-3">{usuario.apellido}</td>
                <td className="p-3">{usuario.email}</td>
                <td className="p-3">{usuario.telefono}</td>
                <td className="p-3">{usuario.tipo}</td>
                <td className="p-3">
                  <span
                    className={`px-3 py-1 rounded-full text-white ${
                      usuario.activo ? "bg-green-500" : "bg-red-500"
                    }`}
                  >
                    {usuario.activo ? "Activo" : "Inactivo"}
                  </span>
                </td>
                {/* Botones de acción con etiquetas */}
                <td className="p-3 flex justify-center gap-3">
                  {/* Botón Inactivar/Activar */}
                  <button
                    className="bg-yellow-500 hover:bg-yellow-600 text-white flex items-center gap-2 px-3 py-2 rounded-lg"
                    onClick={() => toggleActivo(usuario.id)}
                  >
                    <FiUserX />
                    {usuario.activo ? "Inactivar" : "Activar"}
                  </button>
                  {/* Botón Eliminar */}
                  <button
                    className="bg-red-500 hover:bg-red-600 text-white flex items-center gap-2 px-3 py-2 rounded-lg"
                    onClick={() => eliminarUsuario(usuario.id)}
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
        <span>Total de usuarios: {filteredUsuarios.length}</span>
        <div className="flex gap-4">
          <button
            className="bg-gray-300 text-gray-700 px-3 py-2 rounded-lg"
            onClick={() => changePage(currentPage - 1)}
            disabled={currentPage === 1}
          >
            Anterior
          </button>
          <span>{`Página ${currentPage} de ${totalPages}`}</span>
          <button
            className="bg-gray-300 text-gray-700 px-3 py-2 rounded-lg"
            onClick={() => changePage(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            Siguiente
          </button>
        </div>
      </div>
    </div>
  );
}
