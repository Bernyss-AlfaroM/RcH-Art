// components/Navbar.js
'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { auth } from '../firebaseConfig';
import { signOut } from 'firebase/auth';

const Navbar = () => {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setUser(user);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.push('/login');
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  };

  if (loading) {
    return (
      <nav className="bg-white shadow-lg">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center">
          <span className="text-gray-500">Cargando...</span>
        </div>
      </nav>
    );
  }

  return (
    <nav className="bg-white shadow-lg">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex justify-between h-16">
          <div className="flex space-x-7">
            <Link href="/" className="flex items-center py-4 px-2">
              <span className="font-semibold text-gray-500 text-lg">Logo</span>
            </Link>
          </div>

          <div className="flex items-center space-x-4">
            {!user ? (
              <>
                <Link 
                  href="/login"
                  className="py-2 px-4 text-gray-500 hover:text-blue-500 transition duration-300"
                >
                  Login
                </Link>
                <Link 
                  href="/register"
                  className="py-2 px-4 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition duration-300"
                >
                  Register
                </Link>
              </>
            ) : (
              <>
                {user.email && (
                  <span className="text-gray-500 mr-4">
                    {user.email}
                  </span>
                )}
                <Link 
                  href="/admin"
                  className="py-2 px-4 text-gray-500 hover:text-blue-500 transition duration-300"
                >
                  Admin
                </Link>
                <Link 
                  href="/Views"
                  className="py-2 px-4 text-gray-500 hover:text-blue-500 transition duration-300"
                >
                  Views
                </Link>
                <Link 
                  href="/dashboard"
                  className="py-2 px-4 text-gray-500 hover:text-blue-500 transition duration-300"
                >
                  Dashboard
                </Link>
                <button
                  onClick={handleLogout}
                  className="py-2 px-4 text-red-500 hover:text-red-600 transition duration-300"
                >
                  Logout
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;