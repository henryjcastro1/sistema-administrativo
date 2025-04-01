'use client'
import { useState, useEffect } from "react";
import { FiPlus, FiMinus, FiTrash2, FiShoppingCart, FiX } from "react-icons/fi";

interface ProductoVenta {
  id: number;
  nombre: string;
  precio: number;
  stock: number;
  cantidad: number;
  subtotal: number;
}

interface Cliente {
  id: number;
  nombre: string;
  email: string;
}

interface ItemVenta {
  productoId: number;
  cantidad: number;
  precioUnitario: number;
}

interface ProductoAPI {
  id: number;
  nombre: string;
  precio: number;
  stock: number;
}

interface Usuario {
  id: number;
  nombre: string;
  apellido: string;
  email: string;
}

const FormVenta = () => {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [productos, setProductos] = useState<ProductoVenta[]>([]);
  const [productosDisponibles, setProductosDisponibles] = useState<ProductoVenta[]>([]);
  const [carrito, setCarrito] = useState<ProductoVenta[]>([]);
  const [clienteId, setClienteId] = useState<number | null>(null);
  const [searchProducto, setSearchProducto] = useState("");
  const [searchCliente, setSearchCliente] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<"idle" | "success" | "error">("idle");
  const [showForm, setShowForm] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const resClientes = await fetch("/api/usuarios?tipo=CLIENTE");
        const data: Usuario[] = await resClientes.json();

        const dataClientes: Cliente[] = data.map(usuario => ({
          id: usuario.id,
          nombre: `${usuario.nombre} ${usuario.apellido}`.trim(),
          email: usuario.email
        }));

        setClientes(dataClientes);

        const resProductos = await fetch("/api/productos?activo=true");
        const dataProductos: ProductoAPI[] = await resProductos.json();
        const productosFormateados: ProductoVenta[] = dataProductos.map(p => ({
          id: p.id,
          nombre: p.nombre,
          precio: p.precio,
          stock: p.stock,
          cantidad: 0,
          subtotal: 0
        }));
        setProductosDisponibles(productosFormateados);
        setProductos(productosFormateados);
      } catch (error) {
        console.error("Error cargando datos:", error);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (searchProducto) {
      const filtered = productosDisponibles.filter(p =>
        p.nombre.toLowerCase().includes(searchProducto.toLowerCase())
      );
      setProductos(filtered);
    } else {
      setProductos(productosDisponibles);
    }
  }, [searchProducto, productosDisponibles]);

  const clientesFiltrados = searchCliente
    ? clientes.filter(c =>
        c.nombre.toLowerCase().includes(searchCliente.toLowerCase()) ||
        c.email.toLowerCase().includes(searchCliente.toLowerCase())
      )
    : clientes;

  const handleCantidadChange = (id: number, cantidad: number) => {
    if (cantidad < 0) return;

    setProductos(prev =>
      prev.map(p =>
        p.id === id
          ? { ...p, cantidad, subtotal: cantidad * p.precio }
          : p
      )
    );
  };

  const agregarAlCarrito = (producto: ProductoVenta) => {
    if (producto.cantidad <= 0) {
      alert("La cantidad debe ser mayor a 0");
      return;
    }

    if (producto.cantidad > producto.stock) {
      alert("No hay suficiente stock disponible");
      return;
    }

    setCarrito(prev => {
      const existe = prev.find(p => p.id === producto.id);
      if (existe) {
        return prev.map(p =>
          p.id === producto.id
            ? { ...p, cantidad: p.cantidad + producto.cantidad, subtotal: (p.cantidad + producto.cantidad) * p.precio }
            : p
        );
      }
      return [...prev, { ...producto }];
    });

    setProductos(prev =>
      prev.map(p =>
        p.id === producto.id ? { ...p, cantidad: 0, subtotal: 0 } : p
      )
    );
  };

  const eliminarDelCarrito = (id: number) => {
    setCarrito(prev => prev.filter(p => p.id !== id));
  };

  const actualizarCantidadCarrito = (id: number, cantidad: number) => {
    if (cantidad < 0) return;

    setCarrito(prev =>
      prev.map(p =>
        p.id === id
          ? { ...p, cantidad, subtotal: cantidad * p.precio }
          : p
      )
    );
  };

  const total = carrito.reduce((sum, item) => sum + item.subtotal, 0);

  const getStockDisponible = (productoId: number): number => {
    const producto = productosDisponibles.find(p => p.id === productoId);
    return producto ? producto.stock : 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!clienteId) {
      alert("Seleccione un cliente");
      return;
    }

    if (carrito.length === 0) {
      alert("Agregue productos al carrito");
      return;
    }

    setIsSubmitting(true);

    try {
      const items: ItemVenta[] = carrito.map(item => ({
        productoId: item.id,
        cantidad: item.cantidad,
        precioUnitario: item.precio
      }));

      const response = await fetch("/api/ventas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clienteId, items }),
      });

      if (response.ok) {
        setSubmitStatus("success");
        setShowSuccessMessage(true);
        setCarrito([]);
        setClienteId(null);
        
        const data = await response.json();
        const productosActualizados = productosDisponibles.map(p => {
          const itemVendido = data.items.find((i: ItemVenta) => i.productoId === p.id);
          return itemVendido ? { ...p, stock: p.stock - itemVendido.cantidad } : p;
        });
        setProductosDisponibles(productosActualizados);
        setProductos(productosActualizados);

        setTimeout(() => {
          setShowForm(false);
          setShowSuccessMessage(false);
        }, 2000);
      } else {
        setSubmitStatus("error");
        console.error("Error:", await response.json());
      }
    } catch (error) {
      setSubmitStatus("error");
      console.error("Error al registrar venta:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    if (submitStatus !== "idle") {
      const timer = setTimeout(() => setSubmitStatus("idle"), 3000);
      return () => clearTimeout(timer);
    }
  }, [submitStatus]);

  return (
    <>
      {/* Botón flotante centrado en la parte superior */}
      <div className="fixed top-4 left-0 right-0 flex justify-center z-10">
        <button 
          onClick={() => setShowForm(!showForm)} 
          className="px-6 py-3 bg-blue-600 text-white rounded-lg shadow-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 transition-all duration-300 flex items-center gap-2"
        >
          {showForm ? <FiX size={20} /> : <FiShoppingCart size={20} />}
          {showForm ? "Cerrar" : "Nueva Venta"}
        </button>
      </div>

      {/* Overlay y formulario modal */}
      {showForm && (
        <>
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-20 transition-opacity duration-300"
            onClick={() => setShowForm(false)}
          ></div>
          
          <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-30 w-full max-w-4xl px-4">
            <div className="bg-white rounded-lg shadow-xl overflow-hidden animate-fadeIn">
              <div className="p-6 max-h-[80vh] overflow-y-auto">
                <h1 className="text-2xl font-bold mb-6 text-center">Nueva Venta</h1>
                
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Sección Cliente */}
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h2 className="text-lg font-semibold mb-3">Datos del Cliente</h2>
                    
                    <div className="mb-3">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Buscar Cliente
                        <input
                          type="text"
                          placeholder="Nombre o email del cliente..."
                          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                          value={searchCliente}
                          onChange={(e) => setSearchCliente(e.target.value)}
                        />
                      </label>
                    </div>

                    <div className="max-h-60 overflow-y-auto border rounded-md">
                      {clientesFiltrados.map(cliente => (
                        <div
                          key={cliente.id}
                          className={`p-3 border-b cursor-pointer hover:bg-gray-100 ${
                            clienteId === cliente.id ? "bg-blue-50" : ""
                          }`}
                          onClick={() => setClienteId(cliente.id)}
                        >
                          <div className="font-medium">{cliente.nombre}</div>
                          <div className="text-sm text-gray-600">{cliente.email}</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Sección Productos */}
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h2 className="text-lg font-semibold mb-3">Productos Disponibles</h2>
                    
                    <div className="mb-3">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Buscar Producto
                        <input
                          type="text"
                          placeholder="Nombre del producto..."
                          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                          value={searchProducto}
                          onChange={(e) => setSearchProducto(e.target.value)}
                        />
                      </label>
                    </div>

                    <div className="max-h-60 overflow-y-auto border rounded-md">
                      {productos.map(producto => (
                        <div key={producto.id} className="p-3 border-b">
                          <div className="flex justify-between items-center">
                            <div>
                              <div className="font-medium">{producto.nombre}</div>
                              <div className="text-sm">
                                <span className="font-semibold">${producto.precio.toFixed(2)}</span> - 
                                <span className={`ml-2 ${producto.stock < 10 ? "text-red-500" : "text-green-500"}`}>
                                  Stock: {producto.stock}
                                </span>
                              </div>
                            </div>
                            
                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() => handleCantidadChange(producto.id, producto.cantidad - 1)}
                                className="p-1 text-gray-500 hover:text-gray-700 disabled:opacity-30"
                                disabled={producto.cantidad <= 0}
                              >
                                <FiMinus />
                              </button>
                              
                              <input
                                type="number"
                                min="0"
                                max={producto.stock}
                                value={producto.cantidad}
                                onChange={(e) => handleCantidadChange(producto.id, parseInt(e.target.value) || 0)}
                                className="w-16 px-2 py-1 border rounded text-center"
                              />
                              
                              <button
                                type="button"
                                onClick={() => handleCantidadChange(producto.id, producto.cantidad + 1)}
                                className="p-1 text-gray-500 hover:text-gray-700 disabled:opacity-30"
                                disabled={producto.cantidad >= producto.stock}
                              >
                                <FiPlus />
                              </button>
                              
                              <button
                                type="button"
                                onClick={() => agregarAlCarrito(producto)}
                                className="ml-2 px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm disabled:opacity-50"
                                disabled={producto.cantidad <= 0}
                              >
                                Agregar
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Carrito de Compras */}
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
                      <FiShoppingCart /> Carrito de Compras
                    </h2>
                    
                    {carrito.length === 0 ? (
                      <div className="text-center py-4 text-gray-500 border rounded-md">
                        No hay productos en el carrito
                      </div>
                    ) : (
                      <>
                        <div className="max-h-60 overflow-y-auto border rounded-md">
                          {carrito.map(item => (
                            <div key={item.id} className="p-3 border-b">
                              <div className="flex justify-between items-center">
                                <div>
                                  <div className="font-medium">{item.nombre}</div>
                                  <div className="text-sm">
                                    ${item.precio.toFixed(2)} x {item.cantidad} = 
                                    <span className="font-semibold ml-1">${item.subtotal.toFixed(2)}</span>
                                  </div>
                                </div>
                                
                                <div className="flex items-center gap-2">
                                  <button
                                    type="button"
                                    onClick={() => actualizarCantidadCarrito(item.id, item.cantidad - 1)}
                                    className="p-1 text-gray-500 hover:text-gray-700 disabled:opacity-30"
                                    disabled={item.cantidad <= 1}
                                  >
                                    <FiMinus />
                                  </button>
                                  
                                  <span className="w-8 text-center">{item.cantidad}</span>
                                  
                                  <button
                                    type="button"
                                    onClick={() => actualizarCantidadCarrito(item.id, item.cantidad + 1)}
                                    className="p-1 text-gray-500 hover:text-gray-700 disabled:opacity-30"
                                    disabled={item.cantidad >= getStockDisponible(item.id)}
                                  >
                                    <FiPlus />
                                  </button>
                                  
                                  <button
                                    type="button"
                                    onClick={() => eliminarDelCarrito(item.id)}
                                    className="ml-2 p-1 text-red-500 hover:text-red-700"
                                  >
                                    <FiTrash2 />
                                  </button>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                        
                        <div className="mt-4 pt-3 border-t">
                          <div className="flex justify-between font-bold text-lg">
                            <span>Total:</span>
                            <span>${total.toFixed(2)}</span>
                          </div>
                        </div>
                      </>
                    )}
                  </div>

                  <button
                    type="submit"
                    className="w-full px-4 py-2 bg-green-600 text-white rounded-lg shadow hover:bg-green-700 focus:ring-2 focus:ring-green-500 disabled:opacity-50"
                    disabled={isSubmitting || carrito.length === 0 || !clienteId}
                  >
                    {isSubmitting ? (
                      <span className="flex items-center justify-center gap-2">
                        <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Procesando...
                      </span>
                    ) : (
                      "Registrar Venta"
                    )}
                  </button>
                </form>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Mensajes de estado */}
      {showSuccessMessage && (
        <div className="fixed top-24 left-1/2 transform -translate-x-1/2 z-40 bg-green-100 text-green-800 px-4 py-2 rounded-md shadow-lg">
          Venta registrada exitosamente
        </div>
      )}

      {submitStatus === "error" && (
        <div className="fixed top-24 left-1/2 transform -translate-x-1/2 z-40 bg-red-100 text-red-800 px-4 py-2 rounded-md shadow-lg">
          Error al registrar la venta
        </div>
      )}
    </>
  );
};

export default FormVenta;