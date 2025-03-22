import React from "react";
import FormUsuario from "../components/users/formusuarios";
import TableUser from "../components/users/tableuser";
import MenuLateral from "../components/sidebarmenu/sidebarmenu";
import ProtectedRoute from "../components/ProtectedRoute/ProtectedRoute";
import HamburgerMenu from "app/components/menuLogout/HamburgerMenu";

export default function Page() {
  return (
    <div className="flex">
      <MenuLateral />
      <HamburgerMenu />

      <div className="flex-1 p-4"> {/* Contenido principal */}
        <ProtectedRoute>
          {/* Pasa los componentes dentro de ProtectedRoute */}
          <FormUsuario />
          <TableUser />
        </ProtectedRoute>
      </div>
    </div>
  );
}
