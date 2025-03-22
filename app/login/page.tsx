"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../AuthContext";
import React from "react";
import { FiEye, FiEyeOff } from "react-icons/fi"; // Importamos los íconos

export default function LoginPage() {
  const [email, setEmail] = useState<string>("");
  const [contraseña, setContraseña] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false); 
  const [mostrarContraseña, setMostrarContraseña] = useState<boolean>(false); // Estado para mostrar u ocultar la contraseña

  const router = useRouter();
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(""); 
    setLoading(true);

    try {
      const success = await login(email, contraseña);
      if (success) {
        router.push("/dashboard");
      } else {
        setError("Credenciales incorrectas");
      }
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError("Error en el login. Intenta nuevamente.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md p-8 space-y-6 bg-white shadow-md rounded-lg">
        <h2 className="text-2xl font-bold text-center text-gray-800">Iniciar sesión</h2>

        {error && (
          <div className="text-red-500 text-center bg-red-100 p-2 rounded">
            <p>{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700" htmlFor="email">
              Correo electrónico
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full p-3 mt-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700" htmlFor="contraseña">
              Contraseña
            </label>
            <div className="relative">
              <input
                type={mostrarContraseña ? "text" : "password"}
                id="contraseña"
                name="contraseña"
                value={contraseña}
                onChange={(e) => setContraseña(e.target.value)}
                required
                className="w-full p-3 mt-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 pr-10"
              />
              <button
                type="button"
                onClick={() => setMostrarContraseña(!mostrarContraseña)}
                className="absolute inset-y-0 right-3 flex items-center text-gray-500"
              >
                {mostrarContraseña ? <FiEyeOff size={20} /> : <FiEye size={20} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3 mt-4 text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              loading ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            {loading ? "Iniciando sesión..." : "Iniciar sesión"}
          </button>
        </form>

        <p className="text-sm text-center text-gray-500">
          ¿No tienes una cuenta?{" "}
          <a href="/registro" className="text-blue-600 hover:underline">
            Regístrate
          </a>
        </p>
      </div>
    </div>
  );
}
