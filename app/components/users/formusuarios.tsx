'use client'
import { useState, useCallback, useEffect } from "react";
import React from "react";
import { FiEye, FiEyeOff } from "react-icons/fi"; // Importamos los íconos

interface FormData {
  nombre: string;
  apellido: string;
  email: string;
  contraseña: string;
  telefono: string;
  tipo: "ADMINISTRADOR" | "CLIENTE" | "TECNICO" | "OTRO";
  activo: boolean;
}

const FormUsuario = () => {
  const [formData, setFormData] = useState<FormData>({
    nombre: "",
    apellido: "",
    email: "",
    contraseña: "",
    telefono: "",
    tipo: "ADMINISTRADOR",
    activo: true,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<"idle" | "success" | "error">("idle");
  const [showForm, setShowForm] = useState(false);
  const [showPassword, setShowPassword] = useState(false); // Estado para mostrar/ocultar la contraseña
  const [showSuccessMessage, setShowSuccessMessage] = useState(false); // Estado para mostrar el mensaje de éxito
  const [emailError, setEmailError] = useState<string>(""); // Estado para manejar el error del correo

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === "checkbox") {
      const target = e.target as HTMLInputElement;
      setFormData((prevData) => ({
        ...prevData,
        [name]: target.checked,
      }));
    } else {
      setFormData((prevData) => ({
        ...prevData,
        [name]: value,
      }));
    }
  }, []);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();

      // Validación del correo
      if (!formData.email.includes("@")) {
        alert("Por favor, introduce un email válido.");
        return;
      }

      if (formData.contraseña.length < 6) {
        alert("La contraseña debe tener al menos 6 caracteres.");
        return;
      }

      setIsSubmitting(true);
      setEmailError(""); // Limpiar errores previos

      try {
        const response = await fetch("/api/usuarios", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });

        if (response.ok) {
          setSubmitStatus("success");
          setShowSuccessMessage(true);  // Mostrar el mensaje de éxito
          setFormData({
            nombre: "",
            apellido: "",
            email: "",
            contraseña: "",
            telefono: "",
            tipo: "ADMINISTRADOR",
            activo: true,
          });

          // Cerrar el formulario después de 2 segundos
          setTimeout(() => {
            setShowForm(false);
          }, 2000);
        } else {
          const error = await response.json();
          if (error.message.includes("correo")) {
            setEmailError("El correo electrónico ya está registrado.");
          } else {
            setSubmitStatus("error");
            if (typeof error === "object" && error !== null && "message" in error) {
              console.error("Error:", (error as { message: string }).message);
            } else {
              console.error("Error desconocido:", error);
            }
                      }
        }
      } catch (error) {
        setSubmitStatus("error");
        console.error("Error al agregar usuario:", error);
      } finally {
        setIsSubmitting(false);
      }
    },
    [formData]
  );

  useEffect(() => {
    if (submitStatus !== "idle") {
      const timer = setTimeout(() => setSubmitStatus("idle"), 3000);
      return () => clearTimeout(timer);
    }
  }, [submitStatus]);

  return (
    <div className="max-w-4xl mx-auto mt-10 p-8 bg-white rounded-lg shadow-md">
<div className="flex justify-center">
  <button 
    onClick={() => setShowForm(!showForm)} 
    className="mb-4 px-4 py-2 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 focus:ring-2 focus:ring-blue-500"
  >
    {showForm ? "Cerrar Formulario" : "Agregar Usuario"}
  </button>
</div>


      {showForm && (
        <div>
          <h1 className="text-2xl font-bold mb-6 text-center">Agregar Usuario</h1>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="nombre" className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre
                </label>
                <input
                  type="text"
                  id="nombre"
                  name="nombre"
                  value={formData.nombre}
                  onChange={handleChange}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  required
                />
              </div>
              <div>
                <label htmlFor="apellido" className="block text-sm font-medium text-gray-700 mb-1">
                  Apellido
                </label>
                <input
                  type="text"
                  id="apellido"
                  name="apellido"
                  value={formData.apellido}
                  onChange={handleChange}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  required
                />
              </div>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  required
                />
                {emailError && (
                  <p className="mt-2 text-sm text-red-500">{emailError}</p>
                )}
              </div>
              <div>
                <label htmlFor="contraseña" className="block text-sm font-medium text-gray-700 mb-1">
                  Contraseña
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    id="contraseña"
                    name="contraseña"
                    value={formData.contraseña}
                    onChange={handleChange}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute top-1/2 right-3 transform -translate-y-1/2 text-gray-500"
                  >
                    {showPassword ? <FiEyeOff /> : <FiEye />}
                  </button>
                </div>
              </div>
              <div>
                <label htmlFor="telefono" className="block text-sm font-medium text-gray-700 mb-1">
                  Teléfono
                </label>
                <input
                  type="text"
                  id="telefono"
                  name="telefono"
                  value={formData.telefono}
                  onChange={handleChange}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>
              <div>
                <label htmlFor="tipo" className="block text-sm font-medium text-gray-700 mb-1">
                  Tipo de Usuario
                </label>
                <select
                  id="tipo"
                  name="tipo"
                  value={formData.tipo}
                  onChange={handleChange}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                >
                  <option value="ADMINISTRADOR">Administrador</option>
                  <option value="CLIENTE">Cliente</option>
                  <option value="TECNICO">Técnico</option>
                  <option value="OTRO">Otro</option>
                </select>
              </div>
              <div>
  <label htmlFor="activo" className="block text-sm font-medium text-gray-700 mb-1">
    Estado
  </label>
  <div className="flex items-center">
    <input
      type="checkbox"
      id="activo"
      name="activo"
      checked={formData.activo}
      onChange={handleChange}
      className="mr-2"
    />
    <span>{formData.activo ? "Activo" : "Inactivo"}</span>
  </div>
</div>
            </div>
            
            <button
              type="submit"
              className="w-full px-4 py-2 bg-green-600 text-white rounded-lg shadow hover:bg-green-700 focus:ring-2 focus:ring-green-500"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Guardando..." : "Guardar Usuario"}
            </button>
          </form>
        </div>
      )}

      {showSuccessMessage && (
        <div className="mt-4 text-center text-green-600">
          <p>Usuario agregado con éxito</p>
        </div>
      )}
    </div>
  );
};

export default FormUsuario;
