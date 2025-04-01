'use client';

import React, { useState } from 'react';
import { FaFileUpload, FaSpinner } from 'react-icons/fa';
import { toast } from 'react-toastify';

const SubidaProductos = () => {
  const [file, setFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      toast.warning('Por favor, selecciona un archivo CSV');
      return;
    }

    setIsLoading(true);
    
    try {
      const formData = new FormData();
      formData.append('csv', file);

      const response = await fetch('/api/importar', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Error al importar productos');
      }

      const result = await response.json();
      toast.success(`¡Éxito! ${result.count} productos importados correctamente`);
      setFile(null);
      
      // Reset file input
      const fileInput = document.getElementById('csv-upload') as HTMLInputElement;
      if (fileInput) fileInput.value = '';
      
    } catch (error) {
      console.error('Error:', error);
      toast.error(error instanceof Error ? error.message : 'Error desconocido al importar productos');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md mb-6">
      <h2 className="text-xl font-semibold mb-4 text-gray-800">Importar Productos desde CSV</h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="csv-upload" className="block text-sm font-medium text-gray-700 mb-2">
            Seleccionar archivo CSV
          </label>
          <input
            id="csv-upload"
            type="file"
            accept=".csv"
            onChange={handleFileChange}
            className="block w-full text-sm text-gray-500
              file:mr-4 file:py-2 file:px-4
              file:rounded-md file:border-0
              file:text-sm file:font-semibold
              file:bg-blue-50 file:text-blue-700
              hover:file:bg-blue-100"
          />
          <p className="mt-1 text-sm text-gray-500">
            El archivo CSV debe tener las columnas: nombre, descripción, precio, stock, categoría
          </p>
        </div>

        <div className="flex items-center space-x-4">
          <button
            type="submit"
            disabled={!file || isLoading}
            className={`flex items-center px-4 py-2 rounded-md text-white ${!file || isLoading ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}`}
          >
            {isLoading ? (
              <>
                <FaSpinner className="animate-spin mr-2" />
                Procesando...
              </>
            ) : (
              <>
                <FaFileUpload className="mr-2" />
                Importar Productos
              </>
            )}
          </button>

          {file && (
            <span className="text-sm text-gray-600">
              Archivo seleccionado: {file.name}
            </span>
          )}
        </div>
      </form>
    </div>
  );
};

export default SubidaProductos;