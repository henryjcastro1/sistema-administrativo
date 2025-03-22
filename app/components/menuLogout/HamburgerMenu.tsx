'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FaBars, FaTimes } from 'react-icons/fa';
import Link from 'next/link';
import { useAuth } from 'AuthContext';

const HamburgerMenu = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { logout } = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  return (
    <div className="fixed top-4 right-4 z-50"> {/* Fijado arriba a la derecha */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 rounded-md bg-gray-800 text-white hover:bg-gray-700 transition"
      >
        {isOpen ? <FaTimes size={25} /> : <FaBars size={25} />}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white shadow-lg rounded-lg">
          <ul className="py-2">
            <li>
              <Link href="/dashboard" className="block px-4 py-2 hover:bg-gray-100">
                Dashboard
              </Link>
            </li>
            <li>
              <button
                onClick={handleLogout}
                className="w-full text-left px-4 py-2 text-red-600 hover:bg-gray-100"
              >
                Salir
              </button>
            </li>
          </ul>
        </div>
      )}
    </div>
  );
};

export default HamburgerMenu;
