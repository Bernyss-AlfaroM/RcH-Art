import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut as firebaseSignOut } from 'firebase/auth'; // Firebase Authentication
import { getFirestore, collection, doc, setDoc } from 'firebase/firestore'; // Firebase Firestore


const firebaseConfig = {
    apiKey: "AIzaSyCkvN1h5JI20-sO0dnSa7ufD98lun41uzQ",
    authDomain: "ctrlbordados.firebaseapp.com",
    projectId: "ctrlbordados",
    storageBucket: "ctrlbordados.firebasestorage.app",
    messagingSenderId: "607936250652",
    appId: "1:607936250652:web:e9ff705ad257aae97bf0d9",
    measurementId: "G-FGCX3T58QD"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const firestore = getFirestore(app);

// Exportar las funciones necesarias
export { auth, firestore, signInWithEmailAndPassword, createUserWithEmailAndPassword, firebaseSignOut as signOut, collection, doc, setDoc };