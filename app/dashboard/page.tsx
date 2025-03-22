'use client';

import React from "react";
import MenuLateral from "app/components/sidebarmenu/sidebarmenu";
import HamburgerMenu from "app/components/menuLogout/HamburgerMenu";
import ProtectedRoute from "app/components/ProtectedRoute/ProtectedRoute";

const Dashboard = () => {
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

          {/* Contenido del dashboard */}
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="mt-2 text-gray-600">Bienvenido al panel de control.</p>
        </div>
      </div>
    </ProtectedRoute>
  );
};

export default Dashboard;
