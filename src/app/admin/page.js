'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { auth, firestore } from '../firebaseConfig';
import { signOut } from 'firebase/auth';
import { collection, addDoc, getDocs } from 'firebase/firestore';
import styles from './AdminPanel.module.css';

export default function AdminPanel() {
  // Predefined lists
  const lists = {
    encargados: ["Bernyss", "Brayan", "Stephanie"],
    empresas: ["Boston", "Abbott", "HOLOGIC", "Custom"],
    generos: ["Hombre", "Mujer"],
    marcas: ["Okey", "Columbia", "Unicreses"],
    turnos: ["A", "B", "C"],
    tallas: ["XS", "S", "M", "L", "XL", "2XL", "3XL", "4XL"],
    colores: [
      "Vino",
      "Vino tinto",
      "Celeste Unicress",
      "Celeste Ok",
      "Rosado Uni",
      "Fuscia OK",
      "Fuscia Morado",
      "Fuscia Uni",
      "Morado",
      "Lila",
      "Negra",
      "Gris Claro",
      "Gris Oscuro",
      "Amarillo",
      "Verde Oscuro",
      "Verde Claro",
      "Rojo",
      "Azul Navi",
      "Azul Rey",
      "Naranja",
      "Turquesa",
      "Jade",
      "Beige",
      "Blanca",
      "Morado Uni",
      "Coral"
    ],
    // Map de colores a valores hexadecimales
    colorHexMap: {
      "Vino": "#722F37",
      "Vino tinto": "#5E1224",
      "Celeste Unicress": "#A5D8DD",
      "Celeste Ok": "#89CFF0",
      "Rosado Uni": "#FFC0CB",
      "Fuscia OK": "#FF00FF",
      "Fuscia Morado": "#CC33CC",
      "Fuscia Uni": "#FF66FF",
      "Morado": "#800080",
      "Lila": "#C8A2C8",
      "Negra": "#000000",
      "Gris Claro": "#D3D3D3",
      "Gris Oscuro": "#696969",
      "Amarillo": "#FFFF00",
      "Verde Oscuro": "#006400",
      "Verde Claro": "#90EE90",
      "Rojo": "#FF0000",
      "Azul Navi": "#000080",
      "Azul Rey": "#4169E1",
      "Naranja": "#FFA500",
      "Turquesa": "#40E0D0",
      "Jade": "#00A36C",
      "Beige": "#F5F5DC",
      "Blanca": "#FFFFFF",
      "Morado Uni": "#9370DB",
      "Coral": "#FF7F50"
    }
  };

  const [user, setUser] = useState(null);
  const [formData, setFormData] = useState({
    persona: '',
    encargadoPor: lists.encargados[0],
    pago: '',
    fechaPedido: '',
    turno: lists.turnos[0],
    empresa: lists.empresas[0],
    colores: lists.colores[0],
    marca: lists.marcas[0],
    talla: lists.tallas[0],
    genero: lists.generos[0],
    faltantes: false,
    compradas: false,
    entregadas: false,
    pagadas: false,
    bordada: false,
    comentarios: ''
  });

  const [totalVentas, setTotalVentas] = useState(0);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      currentUser ? setUser(currentUser) : router.push('/login');
    });
    return unsubscribe;
  }, [router]);

  useEffect(() => {
    const fetchTotalVentas = async () => {
      try {
        const ventasSnapshot = await getDocs(collection(firestore, 'Ventas'));
        const total = ventasSnapshot.docs.reduce((acc, doc) => {
          const data = doc.data();
          return data.pago ? acc + parseFloat(data.pago) : acc;
        }, 0);
        setTotalVentas(total);
      } catch (err) {
        console.error('Error al obtener las ventas:', err);
      }
    };
    
    fetchTotalVentas();
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.push('/login');
    } catch (err) {
      console.error('Error durante el logout:', err);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await addDoc(collection(firestore, 'Ventas'), {
        ...formData,
        fechaRegistro: new Date(),
      });

      // Reset form with default values
      setFormData({
        ...Object.fromEntries(
          Object.entries(formData).map(([key, val]) => 
            key === 'encargadoPor' ? [key, lists.encargados[0]] :
            key === 'turno' ? [key, lists.turnos[0]] :
            key === 'marca' ? [key, lists.marcas[0]] :
            key === 'talla' ? [key, lists.tallas[0]] :
            key === 'genero' ? [key, lists.generos[0]] :
            key === 'colores' ? [key, lists.colores[0]] :
            typeof val === 'boolean' ? [key, false] :
            [key, '']
          )
        )
      });

      alert('Pedido registrado correctamente');
      if (formData.pago) {
        setTotalVentas(prevTotal => prevTotal + parseFloat(formData.pago));
      }
    } catch (err) {
      console.error('Error al registrar el pedido:', err);
      alert('Error al registrar el pedido');
    }
  };

  // Componente personalizado para el selector de colores
  const ColorSelector = () => {
    const [isOpen, setIsOpen] = useState(false);
    
    return (
      <div className="relative">
        <label htmlFor="colores" className={styles['form-label']}>
          Colores
        </label>
        
        <div 
          className="flex items-center cursor-pointer p-2 border rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          onClick={() => setIsOpen(!isOpen)}
        >
          <div 
            className="w-6 h-6 mr-2 border border-gray-300 rounded" 
            style={{ backgroundColor: lists.colorHexMap[formData.colores] || '#FFFFFF' }}
          />
          <span className="text-sm">{formData.colores}</span>
          <svg className="w-4 h-4 ml-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
          </svg>
        </div>
        
        {isOpen && (
          <div className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-lg shadow-lg max-h-64 overflow-y-auto">
            <div className="grid grid-cols-4 gap-2 p-2">
              {lists.colores.map((color) => (
                <div 
                  key={color} 
                  className="flex flex-col items-center cursor-pointer p-1 hover:bg-gray-100 rounded"
                  onClick={() => {
                    setFormData(prev => ({ ...prev, colores: color }));
                    setIsOpen(false);
                  }}
                >
                  <div 
                    className="w-8 h-8 border border-gray-300 rounded-sm mb-1" 
                    style={{ backgroundColor: lists.colorHexMap[color] || '#FFFFFF' }}
                  />
                  <span className="text-xs text-center">{color}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className={styles.container}>
      <div className={styles['form-section']}>
        <h2 className={styles.title}>Agregar prenda</h2>
        
        {user ? (
          <>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className={styles['form-grid']}>
                {/* Static fields */}
                <div>
                  <label htmlFor="persona" className={styles['form-label']}>
                    Persona
                  </label>
                  <input
                    type="text"
                    name="persona"
                    value={formData.persona}
                    onChange={handleInputChange}
                    className={styles['form-input']}
                    required
                  />
                </div>

                <div>
                  <label htmlFor="encargadoPor" className={styles['form-label']}>
                    A quien se la encargo
                  </label>
                  <select
                    name="encargadoPor"
                    value={formData.encargadoPor}
                    onChange={handleInputChange}
                    className={styles['form-input']}
                    required
                  >
                    {lists.encargados.map((encargado) => (
                      <option key={encargado} value={encargado}>
                        {encargado}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="pago" className={styles['form-label']}>
                    Pago
                  </label>
                  <input
                    type="number"
                    name="pago"
                    value={formData.pago}
                    onChange={handleInputChange}
                    className={styles['form-input']}
                    required
                  />
                </div>

                <div>
                  <label htmlFor="fechaPedido" className={styles['form-label']}>
                    Fecha de pedido
                  </label>
                  <input
                    type="date"
                    name="fechaPedido"
                    value={formData.fechaPedido}
                    onChange={handleInputChange}
                    className={styles['form-input']}
                    required
                  />
                </div>

                <div>
                  <label htmlFor="turno" className={styles['form-label']}>
                    Turno
                  </label>
                  <select
                    name="turno"
                    value={formData.turno}
                    onChange={handleInputChange}
                    className={styles['form-input']}
                    required
                  >
                    {lists.turnos.map((turno) => (
                      <option key={turno} value={turno}>
                        {turno}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="empresa" className={styles['form-label']}>
                    Empresa
                  </label>
                  <select
                    name="empresa"
                    value={formData.empresa}
                    onChange={handleInputChange}
                    className={styles['form-input']}
                    required
                  >
                    {lists.empresas.map((empresas) => (
                      <option key={empresas} value={empresas}>
                        {empresas}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Custom color selector component */}
                <ColorSelector />

                <div>
                  <label htmlFor="marca" className={styles['form-label']}>
                    Marca
                  </label>
                  <select
                    name="marca"
                    value={formData.marca}
                    onChange={handleInputChange}
                    className={styles['form-input']}
                    required
                  >
                    {lists.marcas.map((marca) => (
                      <option key={marca} value={marca}>
                        {marca}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="talla" className={styles['form-label']}>
                    Talla
                  </label>
                  <select
                    name="talla"
                    value={formData.talla}
                    onChange={handleInputChange}
                    className={styles['form-input']}
                    required
                  >
                    {lists.tallas.map((talla) => (
                      <option key={talla} value={talla}>
                        {talla}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="genero" className={styles['form-label']}>
                    Género
                  </label>
                  <select
                    name="genero"
                    value={formData.genero}
                    onChange={handleInputChange}
                    className={styles['form-input']}
                    required
                  >
                    {lists.generos.map((genero) => (
                      <option key={genero} value={genero}>
                        {genero}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Checkboxes section */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
                {['faltantes', 'compradas', 'entregadas', 'pagadas', 'bordada'].map((checkbox) => (
                  <div key={checkbox} className={styles['checkbox-container']}>
                    <input
                      type="checkbox"
                      name={checkbox}
                      checked={formData[checkbox]}
                      onChange={handleInputChange}
                      className={styles['checkbox-input']}
                    />
                    <span className="text-sm text-gray-700">
                      {checkbox === 'bordada' ? '¿Ya se bordó?' : `¿${checkbox}?`}
                    </span>
                  </div>
                ))}
              </div>

              <div>
                <label htmlFor="comentarios" className={styles['form-label']}>
                  Comentarios
                </label>
                <textarea
                  name="comentarios"
                  value={formData.comentarios}
                  onChange={handleInputChange}
                  className={styles['form-input']}
                  rows="3"
                />
              </div>

              <button 
                type="submit"
                className={styles['submit-button']}
              >
                Registrar Pedido
              </button>
            </form>
          </>
        ) : (
          <p className="text-center text-gray-500">Cargando...</p>
        )}
      </div>
    </div>
  );
}