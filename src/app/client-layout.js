// src/app/client-layout.js
'use client';

import Navbar from './components/Navbar';

export default function ClientLayout({ children }) {
  return (
    <>
      <Navbar />
      <main className="min-h-screen">
        {children}
      </main>
    </>
  );
}