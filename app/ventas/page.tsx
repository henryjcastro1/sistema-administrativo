import React from "react";
import MenuLateral from "../components/sidebarmenu/sidebarmenu";
import ProductoVenta from "../components/ventas/FormVentas"
import VentasPage from "../components/ventas/listventas"


export default function Page() {
  return (
    <div className="flex">
      <MenuLateral />
      <ProductoVenta />
      <VentasPage />

      

      <div className="flex-1 p-4"> {/* Contenido principal */}
          {/* Pasa los componentes dentro de ProtectedRoute */}
      </div>
    </div>
  );
}
