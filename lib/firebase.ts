import { initializeApp } from "firebase/app"
import { getAuth } from "firebase/auth"

const firebaseConfig = {
  apiKey: "AIzaSyC-9Ax8jlzWEIMIn1vZHsHEBjaMjEQoab0",
  authDomain: "hvostalert.firebaseapp.com",
  projectId: "hvostalert",
  storageBucket: "hvostalert.firebasestorage.app",
  messagingSenderId: "327489972186",
  appId: "1:327489972186:web:d3130d1ea4dad8db2982e3",
  measurementId: "G-QVFZLJEW1Z"
}

// Initialize Firebase
const app = initializeApp(firebaseConfig)

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app)
export default app


