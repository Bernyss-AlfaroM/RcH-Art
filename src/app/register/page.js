'use client';

import { useState } from 'react';
import { auth, firestore, collection, doc, setDoc } from '../firebaseConfig'; // Asegúrate de que las funciones estén importadas correctamente
import { createUserWithEmailAndPassword } from 'firebase/auth'; 
import { useRouter } from 'next/navigation';
import styles from './Register.module.css'; // Importa el CSS

const Register = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const router = useRouter();

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Guardar la información del usuario en Firestore usando la nueva API modular
      await setDoc(doc(collection(firestore, 'usuarios'), user.uid), {
        email: user.email,
        uid: user.uid,
      });

      router.push('/admin'); // Redirigir al panel de admin
    } catch (err) {
      setError(err.message); // Mostrar mensaje de error si falla
    }
  };

  return (
    <div className={styles.container}>
    <form onSubmit={handleRegister} className={styles.form}>
      <h2 className={styles.title}>Register</h2>
      <input 
        type="email" 
        placeholder="Email" 
        value={email} 
        onChange={(e) => setEmail(e.target.value)} 
        className={styles.input}
      />
      <input 
        type="password" 
        placeholder="Password" 
        value={password} 
        onChange={(e) => setPassword(e.target.value)} 
        className={styles.input }
      />
      {error && <p className={styles.error}>{error}</p>}
      <button type="submit"className={styles.button}>Registar</button>
    </form>
  </div>
  );
};

export default Register;
