"use client";
import React from "react";
import Link from "next/link";
import { FaHome, FaUsers, FaCog, FaStore } from "react-icons/fa";

export default function MenuLateral() {
  return (
    <div className="h-screen w-64 bg-blue-700 text-white flex flex-col items-center p-6 shadow-lg">
      {/* Logo en la parte superior */}
      <div className="mb-8 bg-white p-2 rounded-full">
        <img src="/img/logo1.png" alt="Logo" className="w-24 h-24 rounded-full shadow-lg" />
      </div>
      
      {/* Menú de navegación */}
      <nav className="w-full flex flex-col gap-4">
        <Link href="/dashboard" className="flex items-center gap-3 p-3 rounded-lg bg-gray-800 hover:bg-gray-700 transition duration-300">
          <FaHome className="text-xl" />
          <span>Dashboard</span>
        </Link>
        <Link href="/catalogo-productos" className="flex items-center gap-3 p-3 rounded-lg bg-gray-800 hover:bg-gray-700 transition duration-300">
          <FaStore className="text-xl" />
          <span>Productos</span>
        </Link>
        <Link href="/users" className="flex items-center gap-3 p-3 rounded-lg bg-gray-800 hover:bg-gray-700 transition duration-300">
          <FaUsers className="text-xl" />
          <span>Usuarios</span>
        </Link>
        <Link href="/configuracion" className="flex items-center gap-3 p-3 rounded-lg bg-gray-800 hover:bg-gray-700 transition duration-300">
          <FaCog className="text-xl" />
          <span>Configuración</span>
        </Link>
      </nav>
    </div>
  );
}
