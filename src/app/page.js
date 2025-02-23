'use client';

import Image from "next/image";
import { useRouter } from "next/navigation"; // Importa useRouter

export default function Home() {
  const router = useRouter(); // Instancia del router

  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <main className="flex flex-col gap-8 row-start-2 items-center sm:items-start">

          {/* Botón para redirigir a Login */}
          <button
            onClick={() => router.push("/login")}
            className="rounded-full border border-solid border-transparent transition-colors flex items-center justify-center bg-blue-500 text-white hover:bg-blue-600 text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5"
          >
            Ir a Login
            
          </button>
      </main>
      <footer className="row-start-3 flex gap-6 flex-wrap items-center justify-center">
       
      </footer>
    </div>
  );
}
