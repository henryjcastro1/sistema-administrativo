'use client';
import React, { useEffect, useState } from "react"; // Agregar useState
import { useRouter } from "next/navigation";
import { useAuth } from "../../../AuthContext";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(true); // Estado para esperar que se cargue el estado

  useEffect(() => {
    const authStatus = localStorage.getItem("isAuthenticated");

    if (authStatus === "true") {
      // Si está autenticado, permitir la carga del contenido
      setLoading(false);
    } else {
      // Si no está autenticado, redirigir a login
      router.push("/login");
    }
  }, [isAuthenticated, router]);

  if (loading) {
    return <div>Loading...</div>; // Puedes mostrar un loader mientras se verifica la autenticación
  }

  return <>{children}</>;
};

export default ProtectedRoute;
