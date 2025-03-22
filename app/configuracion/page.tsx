'use client';

import React from "react";
import HamburgerMenu from "app/components/menuLogout/HamburgerMenu";
import ProtectedRoute from "app/components/ProtectedRoute/ProtectedRoute";
import MenuLateral from "app/components/sidebarmenu/sidebarmenu"; // Asegúrate de que la ruta esté bien

const Configuracion = () => {
  return (
    <ProtectedRoute>
      <div className="flex h-screen">
        {/* Menú lateral */}
        <MenuLateral />

        {/* Contenedor principal */}
        <div className="flex-1 relative p-4">
          {/* Botón de menú hamburguesa en la esquina superior derecha */}
          <div className="absolute top-4 right-4">
            <HamburgerMenu />
          </div>

          {/* Contenido de configuración */}
          <h1 className="text-2xl font-bold">Configuración</h1>
          <p className="mt-2 text-gray-600">Aquí puedes modificar los ajustes de tu cuenta.</p>
        </div>
      </div>
    </ProtectedRoute>
  );
};

export default Configuracion;
