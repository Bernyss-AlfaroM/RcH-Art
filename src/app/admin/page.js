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
    ]
  };

  const [user, setUser] = useState(null);
  const [formData, setFormData] = useState({
    persona: '',
    encargadoPor: lists.encargados[0],
    pago: '',
    fechaPedido: '',
    turno: lists.turnos[0],
    empresa: '',
    colores:lists.colores[0], // Explicitly added colors field
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

  return (
    <div className={styles.container}>
      <div className={styles['form-section']}>
        <h2 className={styles.title}>Agregar prenda</h2>
        
        {user ? (
          <>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className={styles['form-grid']}>
                {/* Static fields including Colores */}
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
                  <input
                    type="text"
                    name="empresa"
                    value={formData.empresa}
                    onChange={handleInputChange}
                    className={styles['form-input']}
                    required
                  />
                </div>

                {/* Explicitly added Colores field */}
                <div>
                  <label htmlFor="colores" className={styles['form-label']}>
                    Colores
                  </label>

                  <select
                    type="text"
                    name="colores"
                    value={formData.colores}
                    onChange={handleInputChange}
                    className={styles['form-input']}
                    required
                    >
                    {lists.colores.map((colores) => (
                      <option key={colores} value={colores}>
                        {colores}
                      </option>
                    ))}
                  </select>
                </div>

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
{/*
            <div className={styles['sales-summary']}>
              <h3 className={styles['sales-total']}>
                Total de Ventas: ${totalVentas.toLocaleString()}
              </h3>
            </div>
*/}
          </>
        ) : (
          <p className="text-center text-gray-500">Cargando...</p>
        )}
      </div>
    </div>
  );
}