'use client';

import React from "react";
import MenuLateral from "app/components/sidebarmenu/sidebarmenu";
import HamburgerMenu from "app/components/menuLogout/HamburgerMenu";
import ProtectedRoute from "app/components/ProtectedRoute/ProtectedRoute";
import FormProductos from "app/components/productos/formproductos";
import Tablaproducts from "app/components/productos/tablaproductos";




const CatalogoProductos = () => {
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


          {/* Formulario de productos */}
          <FormProductos />
          <Tablaproducts />

          
          

        </div>

        
      </div>
    </ProtectedRoute>
  );
};

export default CatalogoProductos;
