// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCSv9dfxE8vEsXx9a9FZld_o8l2LfN0bRE",
  authDomain: "medicalshop-308eb.firebaseapp.com",
  projectId: "medicalshop-308eb",
  storageBucket: "medicalshop-308eb.appspot.com",
  messagingSenderId: "288878891120",
  appId: "1:288878891120:web:4a929443fa13c76a4024b5"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

const auth = getAuth(app)

export default auth