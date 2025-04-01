'use client';
import { useEffect, useState } from "react";
import { FiSearch, FiTrash2, FiEdit, FiImage, FiPlus, FiX } from "react-icons/fi";
import Image from "next/image";

// Definimos el tipo para Categoria
type Categoria = {
  id: number;
  nombre: string;
  descripcion?: string;
  createdAt?: string;
  updatedAt?: string;
};

// Tipo para las imágenes
type ProductoImagen = {
  url: string;
  id?: number;
};

// Tipo completo para Producto (basado en tu API)
type Producto = {
  id: number;
  nombre: string;
  descripcion: string;
  precio: number;
  stock: number;
  categoria: Categoria;
  activo: boolean;
  imagenes: ProductoImagen[];
  createdAt?: string;
  updatedAt?: string;
};

type ProductosAPIResponse = Producto[];


const formatPrecio = (precio: number): string => {
  return precio.toLocaleString('es-ES');
};

export default function Tablaproducts() {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [editingImages, setEditingImages] = useState<{
    productoId: number | null;
    productoNombre: string;
    imagenes: File[];
    previews: string[];
    existingImages: { url: string; id?: number }[];
  }>({
    productoId: null,
    productoNombre: "",
    imagenes: [],
    previews: [],
    existingImages: []
  });
  
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const itemsPerPage = 10;

  useEffect(() => {
    const fetchProductos = async () => {
      try {
        const response = await fetch("/api/productos");
        if (!response.ok) throw new Error("Error al cargar productos");
        
        const data: ProductosAPIResponse = await response.json();
        
        // Transformamos los datos para asegurar que categoria sea un objeto
        const productosTransformados = data.map((producto) => ({
          ...producto,
          categoria: producto.categoria || { id: 0, nombre: 'Sin categoría' }
        }));
        
        setProductos(productosTransformados);
      } catch (error) {
        console.error(error);
        if (error instanceof Error) {
          console.error("Detalles del error:", error.message);
        }
      } finally {
        setIsLoading(false);
      }
    };
    fetchProductos();
  }, []);

  const filteredProductos = productos.filter(
    (producto) =>
      producto.nombre.toLowerCase().includes(search.toLowerCase()) ||
      producto.categoria.nombre.toLowerCase().includes(search.toLowerCase()) ||
      producto.descripcion.toLowerCase().includes(search.toLowerCase())
  );

  const totalPages = Math.ceil(filteredProductos.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentProductos = filteredProductos.slice(startIndex, startIndex + itemsPerPage);

  const changePage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const toggleActivo = async (id: number) => {
    const producto = productos.find((p) => p.id === id);
    if (!producto) return;

    const confirmacion = window.confirm(
      `¿Estás seguro de que quieres ${producto.activo ? "inactivar" : "activar"} el producto ${producto.nombre}?`
    );
    if (!confirmacion) return;

    try {
      const response = await fetch("/api/productos", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, activo: !producto.activo }),
      });

      if (response.ok) {
        setProductos((prev) =>
          prev.map((p) => (p.id === id ? { ...p, activo: !p.activo } : p))
        );
      }
    } catch (error) {
      console.error("Error al actualizar producto:", error);
    }
  };

  const eliminarProducto = async (id: number) => {
    const producto = productos.find((p) => p.id === id);
    if (!producto) return;

    const confirmacion = window.confirm(
      `¿Estás seguro de eliminar el producto ${producto.nombre}?`
    );
    if (!confirmacion) return;

    try {
      const response = await fetch("/api/productos", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });

      if (response.ok) {
        setProductos((prev) => prev.filter((p) => p.id !== id));
      }
    } catch (error) {
      console.error("Error al eliminar producto:", error);
    }
  };

  const openImageEditor = (producto: Producto) => {
    setEditingImages({
      productoId: producto.id,
      productoNombre: producto.nombre,
      imagenes: [],
      previews: [],
      existingImages: [...producto.imagenes]
    });
    setIsImageModalOpen(true);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      const newPreviews = newFiles.map(file => URL.createObjectURL(file));
      
      setEditingImages(prev => ({
        ...prev,
        imagenes: [...prev.imagenes, ...newFiles],
        previews: [...prev.previews, ...newPreviews],
      }));
    }
  };

  const removeImage = (index: number, isExisting: boolean) => {
    setEditingImages(prev => {
      if (isExisting) {
        const newExisting = [...prev.existingImages];
        newExisting.splice(index, 1);
        return { ...prev, existingImages: newExisting };
      } else {
        const newImagenes = [...prev.imagenes];
        const newPreviews = [...prev.previews];
        newImagenes.splice(index, 1);
        newPreviews.splice(index, 1);
        return { ...prev, imagenes: newImagenes, previews: newPreviews };
      }
    });
  };

  const saveImages = async () => {
    if (!editingImages.productoId) return;

    try {
      const formData = new FormData();
      formData.append("productoId", editingImages.productoId.toString());
      
      editingImages.imagenes.forEach(file => {
        formData.append("imagenes", file);
      });

      editingImages.existingImages.forEach(img => {
        if (img.id) {
          formData.append("keepImageIds", img.id.toString());
        }
      });

      const response = await fetch("/api/imagenes", {
        method: "PUT",
        body: formData,
      });

      if (response.ok) {
        const updatedProducto = await response.json();
        setProductos(prev =>
          prev.map(p =>
            p.id === updatedProducto.id ? updatedProducto : p
          )
        );
        setIsImageModalOpen(false);
      }
    } catch (error) {
      console.error("Error al actualizar imágenes:", error);
    }
  };

  if (isLoading) {
    return (
      <div className="p-6 flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4 text-gray-800">Catálogo de Productos</h1>

      {/* Buscador */}
      <div className="flex items-center bg-white shadow-md rounded-lg p-2 mb-4">
        <FiSearch className="text-gray-500 mx-2" />
        <input
          type="text"
          placeholder="Buscar productos..."
          className="w-full p-2 outline-none"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Tabla de productos */}
      <div className="bg-white shadow-md rounded-lg overflow-y-auto max-h-96">
        <table className="min-w-full text-sm text-left text-gray-600">
          <thead className="bg-gray-100 text-gray-700 uppercase">
            <tr>
              <th className="p-3">Imagen</th>
              <th className="p-3">Nombre</th>
              <th className="p-3">Precio</th>
              <th className="p-3">Stock</th>
              <th className="p-3">Categoría</th>
              <th className="p-3">Estado</th>
              <th className="p-3 text-center">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {currentProductos.map((producto) => (
              <tr key={producto.id} className="hover:bg-gray-100">
                <td 
                  className="p-3 cursor-pointer hover:bg-gray-50"
                  onClick={() => openImageEditor(producto)}
                >
                  {producto.imagenes.length > 0 ? (
                    <Image
                      src={producto.imagenes[0].url}
                      alt={producto.nombre}
                      width={50}
                      height={50}
                      className="object-cover rounded"
                    />
                  ) : (
                    <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded">
                      <FiImage className="text-gray-400 text-xl" />
                    </div>
                  )}
                </td>
                <td className="p-3 font-medium">{producto.nombre}</td>
                <td className="p-3">${formatPrecio(producto.precio)}</td>
                <td className="p-3">{producto.stock}</td>
                <td className="p-3">{producto.categoria.nombre}</td>
                <td className="p-3">
                  <span
                    className={`px-3 py-1 rounded-full text-white ${
                      producto.activo ? "bg-green-500" : "bg-red-500"
                    }`}
                  >
                    {producto.activo ? "Activo" : "Inactivo"}
                  </span>
                </td>
                <td className="p-3 flex justify-center gap-3">
                  <button
                    className="bg-yellow-500 hover:bg-yellow-600 text-white flex items-center gap-2 px-3 py-2 rounded-lg"
                    onClick={() => toggleActivo(producto.id)}
                  >
                    <FiEdit />
                    {producto.activo ? "Inactivar" : "Activar"}
                  </button>
                  <button
                    className="bg-red-500 hover:bg-red-600 text-white flex items-center gap-2 px-3 py-2 rounded-lg"
                    onClick={() => eliminarProducto(producto.id)}
                  >
                    <FiTrash2 />
                    Eliminar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Paginación */}
      <div className="flex justify-between items-center mt-4">
        <span>Mostrando {currentProductos.length} de {filteredProductos.length} productos</span>
        <div className="flex gap-4">
          <button
            className="bg-gray-300 text-gray-700 px-3 py-2 rounded-lg disabled:opacity-50"
            onClick={() => changePage(currentPage - 1)}
            disabled={currentPage === 1}
          >
            Anterior
          </button>
          <span>{`Página ${currentPage} de ${totalPages}`}</span>
          <button
            className="bg-gray-300 text-gray-700 px-3 py-2 rounded-lg disabled:opacity-50"
            onClick={() => changePage(currentPage + 1)}
            disabled={currentPage === totalPages || totalPages === 0}
          >
            Siguiente
          </button>
        </div>
      </div>

      {/* Modal para editar imágenes */}
      {isImageModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white p-6 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Editar Imágenes de {editingImages.productoNombre}</h2>
              <button 
                onClick={() => setIsImageModalOpen(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <FiX size={24} />
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mb-6">
              {/* Imágenes existentes */}
              {editingImages.existingImages.map((img, index) => (
                <div key={`existing-${index}`} className="relative group">
                  <Image
                    src={img.url}
                    alt={`Imagen existente ${index}`}
                    width={150}
                    height={150}
                    className="h-32 w-full object-cover rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={() => removeImage(index, true)}
                    className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    ×
                  </button>
                </div>
              ))}

              {/* Nuevas imágenes (previews) */}
              {editingImages.previews.map((preview, index) => (
                <div key={`new-${index}`} className="relative group">
                  <Image
                    src={preview}
                    alt={`Nueva imagen ${index}`}
                    width={150}
                    height={150}
                    className="h-32 w-full object-cover rounded-lg"
                    loader={({ src }) => src}
                  />
                  <button
                    type="button"
                    onClick={() => removeImage(index, false)}
                    className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    ×
                  </button>
                </div>
              ))}

              {/* Botón para agregar más imágenes */}
              <label className="flex flex-col items-center justify-center h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-500">
                <FiPlus className="text-gray-400 text-2xl mb-2" />
                <span className="text-sm text-gray-500">Agregar imágenes</span>
                <input
                  type="file"
                  multiple
                  onChange={handleImageChange}
                  className="hidden"
                  accept="image/*"
                />
              </label>
            </div>

            <div className="flex justify-end gap-4">
              <button
                onClick={() => setIsImageModalOpen(false)}
                className="px-4 py-2 bg-gray-300 rounded-lg hover:bg-gray-400 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={saveImages}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                disabled={editingImages.existingImages.length === 0 && editingImages.imagenes.length === 0}
              >
                Guardar Cambios
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}