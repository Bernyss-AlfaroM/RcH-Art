'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { auth, signInWithEmailAndPassword } from '../firebaseConfig';
import styles from './Login.module.css'; // Importa el CSS

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const router = useRouter();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, email, password);
      router.push('/admin');
    } catch (err) {
      setError('Correo o contraseña incorrectos');
    }
  };

  return (
    <div className={styles.container}>
      <form onSubmit={handleLogin} className={styles.form}>
        <h2 className={styles.title}>Iniciar sesión</h2>
        <input 
          type="email" 
          placeholder="Correo electrónico" 
          value={email} 
          onChange={(e) => setEmail(e.target.value)} 
          className={styles.input}
        />
        <input 
          type="password" 
          placeholder="Contraseña" 
          value={password} 
          onChange={(e) => setPassword(e.target.value)} 
          className={styles.input}
        />
        {error && <p className={styles.error}>{error}</p>}
        <button type="submit" className={styles.button}>Iniciar sesión</button>
      </form>
    </div>
  );
};

export default Login;
