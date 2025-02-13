// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCkvN1h5JI20-sO0dnSa7ufD98lun41uzQ",
  authDomain: "ctrlbordados.firebaseapp.com",
  projectId: "ctrlbordados",
  storageBucket: "ctrlbordados.firebasestorage.app",
  messagingSenderId: "607936250652",
  appId: "1:607936250652:web:e9ff705ad257aae97bf0d9",
  measurementId: "G-FGCX3T58QD"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);