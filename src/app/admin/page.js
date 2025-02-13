'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { auth, firestore } from '../firebaseConfig';
import { signOut } from 'firebase/auth';
import { collection, addDoc, getDocs } from 'firebase/firestore';
import styles from './AdminPanel.module.css'; // Importa el archivo CSS Module

const AdminPanel = () => {
  const [user, setUser] = useState(null);
  const [color, setColor] = useState('');
  const [size, setSize] = useState('');
  const [montoPagado, setMontoPagado] = useState('');
  const [montoFaltante, setMontoFaltante] = useState('');
  const [metodoPago, setMetodoPago] = useState('');
  const [totalVentas, setTotalVentas] = useState(0);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (!user) {
        router.push('/login');
      } else {
        setUser(user);
      }
    });
    return unsubscribe;
  }, [router]);

  useEffect(() => {
    const fetchTotalVentas = async () => {
      try {
        const ventasSnapshot = await getDocs(collection(firestore, 'Ventas'));
        let total = 0;
        ventasSnapshot.forEach((doc) => {
          total += doc.data().monto_pagado;
        });
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

  const handleSaleSubmit = async (e) => {
    e.preventDefault();
    try {
      await addDoc(collection(firestore, 'Ventas'), {
        color,
        talla: size,
        monto_pagado: parseFloat(montoPagado),
        monto_faltante: parseFloat(montoFaltante),
        metodo_pago: metodoPago,
        fecha_pago: new Date(),
        pagado: montoFaltante === '0',
      });

      setColor('');
      setSize('');
      setMontoPagado('');
      setMontoFaltante('');
      setMetodoPago('');
      alert('Venta registrada correctamente');
      setTotalVentas(prevTotal => prevTotal + parseFloat(montoPagado));
    } catch (err) {
      console.error('Error al registrar la venta:', err);
    }
  };

  return (
    <div className={styles.container}>
      <h2 className={styles.header}>RxH Art Admin</h2>
      {user ? (
        <>
          <p>Bienvenido, {user.email}</p>
          <button onClick={handleLogout} className={styles.button}>Salir</button>
          
          <h3>Registrar Venta</h3>
          <form onSubmit={handleSaleSubmit}>
            <div className={styles.formGroup}>
              <label className={styles.label}>Color:</label>
              <input
                type="text"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                required
                className={styles.input}
              />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.label}>Talla:</label>
              <input
                type="text"
                value={size}
                onChange={(e) => setSize(e.target.value)}
                required
                className={styles.input}
              />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.label}>Monto Pagado:</label>
              <input
                type="number"
                value={montoPagado}
                onChange={(e) => setMontoPagado(e.target.value)}
                required
                className={styles.input}
              />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.label}>Monto Faltante:</label>
              <input
                type="number"
                value={montoFaltante}
                onChange={(e) => setMontoFaltante(e.target.value)}
                required
                className={styles.input}
              />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.label}>Método de Pago:</label>
              <input
                type="text"
                value={metodoPago}
                onChange={(e) => setMetodoPago(e.target.value)}
                required
                className={styles.input}
              />
            </div>
            <button type="submit" className={styles.button}>Registrar Venta</button>
          </form>

          <div className={styles.total}>
            <h3>Total de Ventas Realizadas: ${totalVentas}</h3>
          </div>
        </>
      ) : (
        <p>Cargando...</p>
      )}
    </div>
  );
};

export default AdminPanel;
