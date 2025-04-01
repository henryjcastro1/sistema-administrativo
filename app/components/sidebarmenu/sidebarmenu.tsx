"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { 
  FaHome, 
  FaUsers, 
  FaCog, 
  FaStore, 
  FaDollarSign,
  FaBars,
  FaTimes 
} from "react-icons/fa";
import { usePathname } from "next/navigation";

export default function MenuLateral() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const pathname = usePathname();

  // Efecto para detectar si estamos en móvil
  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth >= 768) {
        setIsOpen(true); // Siempre abierto en desktop
      }
    };

    checkIfMobile();
    window.addEventListener("resize", checkIfMobile);
    
    return () => window.removeEventListener("resize", checkIfMobile);
  }, []);

  // Cerrar menú al cambiar de ruta (solo en móvil)
  useEffect(() => {
    if (isMobile) {
      setIsOpen(false);
    }
  }, [pathname, isMobile]);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  return (
    <>
      {/* Botón de hamburguesa para móviles */}
      <button
        onClick={toggleMenu}
        className={`md:hidden fixed z-50 top-4 left-4 p-3 rounded-lg bg-blue-700 text-white shadow-lg transition-all duration-300 ${
          isOpen ? "opacity-0" : "opacity-100"
        }`}
        aria-label="Abrir menú"
      >
        <FaBars className="text-xl" />
      </button>

      {/* Menú lateral */}
      <div
        className={`fixed h-full w-64 bg-blue-700 text-white flex flex-col items-center p-6 shadow-lg overflow-y-auto transition-all duration-300 z-40 ${
          isOpen ? "left-0" : "-left-64"
        } md:left-0`}
      >
        {/* Botón de cerrar (solo en móvil) */}
        {isMobile && (
          <button
            onClick={toggleMenu}
            className="self-end mb-4 p-2 rounded-full hover:bg-blue-600 transition-colors"
            aria-label="Cerrar menú"
          >
            <FaTimes className="text-xl" />
          </button>
        )}

        {/* Logo */}
        <div className="mb-8 bg-white p-2 rounded-full flex-shrink-0">
          <img 
            src="/img/logo1.png" 
            alt="Logo" 
            className="w-24 h-24 rounded-full shadow-lg object-cover"
          />
        </div>
        
        {/* Menú de navegación */}
        <nav className="w-full flex flex-col gap-4 flex-grow">
          <Link 
            href="/dashboard" 
            className={`flex items-center gap-3 p-3 rounded-lg transition-colors duration-200 ${
              pathname === "/dashboard" ? "bg-blue-800" : "hover:bg-blue-600"
            }`}
          >
            <FaHome className="text-xl" />
            <span className="whitespace-nowrap">Dashboard</span>
          </Link>
          
          <Link 
            href="/ventas" 
            className={`flex items-center gap-3 p-3 rounded-lg transition-colors duration-200 ${
              pathname === "/ventas" ? "bg-blue-800" : "hover:bg-blue-600"
            }`}
          >
            <FaDollarSign className="text-xl" />
            <span className="whitespace-nowrap">Ventas</span>
          </Link>
          
          <Link 
            href="/catalogo-productos" 
            className={`flex items-center gap-3 p-3 rounded-lg transition-colors duration-200 ${
              pathname === "/catalogo-productos" ? "bg-blue-800" : "hover:bg-blue-600"
            }`}
          >
            <FaStore className="text-xl" />
            <span className="whitespace-nowrap">Productos</span>
          </Link>
          
          <Link 
            href="/users" 
            className={`flex items-center gap-3 p-3 rounded-lg transition-colors duration-200 ${
              pathname === "/users" ? "bg-blue-800" : "hover:bg-blue-600"
            }`}
          >
            <FaUsers className="text-xl" />
            <span className="whitespace-nowrap">Usuarios</span>
          </Link>
          
          <Link 
            href="/configuracion" 
            className={`flex items-center gap-3 p-3 rounded-lg transition-colors duration-200 ${
              pathname === "/configuracion" ? "bg-blue-800" : "hover:bg-blue-600"
            }`}
          >
            <FaCog className="text-xl" />
            <span className="whitespace-nowrap">Configuración</span>
          </Link>
        </nav>

        {/* Espacio adicional al final */}
        <div className="mt-auto pt-4 flex-shrink-0">
          {/* Información del usuario o botones adicionales */}
        </div>
      </div>

      {/* Overlay para móviles */}
      {isOpen && isMobile && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden"
          onClick={toggleMenu}
        />
      )}

      {/* Contenido principal con margen para el menú en desktop */}
      <div className={`transition-all duration-300 ${
        !isMobile && isOpen ? "md:ml-64" : ""
      }`}>
        {/* Aquí iría el contenido de tu página */}
      </div>
    </>
  );
}