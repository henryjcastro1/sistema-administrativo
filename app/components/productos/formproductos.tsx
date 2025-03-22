'use client'
import { useState, useCallback, useEffect } from "react";
import React from "react";

interface ProductoFormData {
  nombre: string;
  descripcion: string;
  precio: string;
  stock: string;
  categoria: string;
  activo: boolean;
  imagenes: File[];
}

const FormProducto = () => {
  const [formData, setFormData] = useState<ProductoFormData>({
    nombre: "",
    descripcion: "",
    precio: "",
    stock: "",
    categoria: "",
    activo: true,
    imagenes: []
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<"idle" | "success" | "error">("idle");
  const [showForm, setShowForm] = useState(false);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  }, []);

  const handleImageChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      setFormData(prev => ({
        ...prev,
        imagenes: [...prev.imagenes, ...files]
      }));
    }
  }, []);

  const removeImage = useCallback((index: number) => {
    setFormData(prev => ({
      ...prev,
      imagenes: prev.imagenes.filter((_, i) => i !== index)
    }));
  }, []);

  useEffect(() => {
    if (submitStatus !== "idle") {
      const timer = setTimeout(() => setSubmitStatus("idle"), 3000);
      return () => clearTimeout(timer);
    }
  }, [submitStatus]);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.nombre || !formData.precio || !formData.stock || !formData.categoria) {
      alert("Complete los campos obligatorios (*)");
      return;
    }

    setIsSubmitting(true);

    try {
      const formDataToSend = new FormData();
      formDataToSend.append("nombre", formData.nombre);
      formDataToSend.append("descripcion", formData.descripcion);
      formDataToSend.append("precio", formData.precio);
      formDataToSend.append("stock", formData.stock);
      formDataToSend.append("categoria", formData.categoria);
      formDataToSend.append("activo", String(formData.activo));
      
      formData.imagenes.forEach((file) => {
        formDataToSend.append(`imagenes`, file);
      });

      const response = await fetch("/api/productos", {
        method: "POST",
        body: formDataToSend
      });

      if (response.ok) {
        setSubmitStatus("success");
        setFormData({
          nombre: "",
          descripcion: "",
          precio: "",
          stock: "",
          categoria: "",
          activo: true,
          imagenes: []
        });
        setTimeout(() => setShowForm(false), 2000);
      } else {
        setSubmitStatus("error");
        console.error("Error:", await response.json());
      }
    } catch (error) {
      setSubmitStatus("error");
      console.error("Error al agregar producto:", error);
    } finally {
      setIsSubmitting(false);
    }
  }, [formData]);

  return (
    <div className="max-w-4xl mx-auto mt-10 p-8 bg-white rounded-lg shadow-md">
      <div className="flex justify-center">
        <button 
          onClick={() => setShowForm(!showForm)} 
          className="mb-4 px-4 py-2 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700"
        >
          {showForm ? "Cerrar Formulario" : "Agregar Producto"}
        </button>
      </div>

      {showForm && (
        <div>
          <h1 className="text-2xl font-bold mb-6 text-center">Nuevo Producto</h1>
          <form onSubmit={handleSubmit} className="space-y-6" encType="multipart/form-data">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre *
                  <input
                    type="text"
                    name="nombre"
                    value={formData.nombre}
                    onChange={handleChange}
                    className="mt-1 block w-full px-3 py-2 border rounded-md"
                    required
                  />
                </label>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Precio *
                  <input
                    type="number"
                    name="precio"
                    value={formData.precio}
                    onChange={handleChange}
                    className="mt-1 block w-full px-3 py-2 border rounded-md"
                    step="0.01"
                    required
                  />
                </label>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Stock *
                  <input
                    type="number"
                    name="stock"
                    value={formData.stock}
                    onChange={handleChange}
                    className="mt-1 block w-full px-3 py-2 border rounded-md"
                    required
                  />
                </label>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Categoría *
                  <input
                    type="text"
                    name="categoria"
                    value={formData.categoria}
                    onChange={handleChange}
                    className="mt-1 block w-full px-3 py-2 border rounded-md"
                    required
                  />
                </label>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Descripción
                  <textarea
                    name="descripcion"
                    value={formData.descripcion}
                    onChange={handleChange}
                    className="mt-1 block w-full px-3 py-2 border rounded-md h-24"
                  />
                </label>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Imágenes
                  <input
                    type="file"
                    multiple
                    onChange={handleImageChange}
                    className="mt-1 block w-full px-3 py-2 border rounded-md"
                    accept="image/*"
                  />
                </label>

                <div className="grid grid-cols-3 gap-4 mt-4">
                  {formData.imagenes.map((file, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={URL.createObjectURL(file)}
                        alt={`Preview ${index}`}
                        className="h-32 w-full object-cover rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    name="activo"
                    checked={formData.activo}
                    onChange={(e) => setFormData(prev => ({ ...prev, activo: e.target.checked }))}
                  />
                  Producto Activo
                </label>
              </div>
            </div>

            <button
              type="submit"
              className="w-full px-4 py-2 bg-green-600 text-white rounded-lg shadow hover:bg-green-700"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Guardando..." : "Guardar Producto"}
            </button>
          </form>
        </div>
      )}

      {submitStatus === "success" && (
        <div className="mt-4 p-3 bg-green-100 text-green-700 rounded-md">
          ¡Producto creado exitosamente!
        </div>
      )}

      {submitStatus === "error" && (
        <div className="mt-4 p-3 bg-red-100 text-red-700 rounded-md">
          Error al guardar el producto
        </div>
      )}
    </div>
  );
};

export default FormProducto;