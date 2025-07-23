// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth, GoogleAuthProvider, FacebookAuthProvider } from "firebase/auth";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBRcssNzHLWxNljNBMsnQsA4EwiLSFiCt4",
  authDomain: "jobs-portal-fyp.firebaseapp.com",
  projectId: "jobs-portal-fyp",
  storageBucket: "jobs-portal-fyp.firebasestorage.app",
  messagingSenderId: "303298074882",
  appId: "1:303298074882:web:67fee5f0b09b810d380a1b",
  measurementId: "G-MH4VSC50BR"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
// const analytics = getAnalytics(app);

const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();
const facebookProvider = new FacebookAuthProvider();

export { auth, googleProvider, facebookProvider };