'use client';

import { createContext, useContext, ReactNode, useState, useEffect } from "react";

interface AuthContextType {
  login: (email: string, contraseña: string) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth debe estar dentro de un AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

  useEffect(() => {
    const authStatus = localStorage.getItem("isAuthenticated");
    if (authStatus === "true") {
      setIsAuthenticated(true);
    }
  }, []);

  const login = async (email: string, contraseña: string): Promise<boolean> => {
    try {
      const response = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, contraseña }),
      });

      const data: { estado?: string; message?: string } = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Error al intentar iniciar sesión");
      }

      if (data.estado === "inactivo") {
        throw new Error("Usuario inactivo. Contacte con el administrador.");
      }

      setIsAuthenticated(true);
      localStorage.setItem("isAuthenticated", "true");
      return true;
    } catch (error) {
      if (error instanceof Error) {
        // Se eliminó el console.error
        throw new Error(error.message);
      } else {
        throw new Error("Error desconocido al iniciar sesión.");
      }
    }
  };

  const logout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem("isAuthenticated");
  };

  return (
    <AuthContext.Provider value={{ login, logout, isAuthenticated }}>
      {children}
    </AuthContext.Provider>
  );
};
