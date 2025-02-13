'use client';

import { useState } from 'react';
import { auth, firestore, collection, doc, setDoc } from '../firebaseConfig'; // Asegúrate de que las funciones estén importadas correctamente
import { createUserWithEmailAndPassword } from 'firebase/auth'; 
import { useRouter } from 'next/navigation';

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
    <form onSubmit={handleRegister}>
      <h2>Register</h2>
      <input 
        type="email" 
        placeholder="Email" 
        value={email} 
        onChange={(e) => setEmail(e.target.value)} 
      />
      <input 
        type="password" 
        placeholder="Password" 
        value={password} 
        onChange={(e) => setPassword(e.target.value)} 
      />
      {error && <p>{error}</p>}
      <button type="submit">Registar</button>
    </form>
  );
};

export default Register;
