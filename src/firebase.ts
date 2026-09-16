import { initializeApp } from "firebase/app";
import {
  getAnalytics,
  isSupported,
} from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyCuV76iaCgAnAhXplwGez2sqb9abTdCt4E",
  authDomain: "campushere-c352f.firebaseapp.com",
  projectId: "campushere-c352f",
  storageBucket: "campushere-c352f.firebasestorage.app",
  messagingSenderId: "500045865900",
  appId: "1:500045865900:web:478c11cdd7c7edbcfd1009",
  measurementId: "G-51FVZKR12M",
};

export const app = initializeApp(firebaseConfig);

export const analyticsPromise = isSupported().then(
  (supported) => (supported ? getAnalytics(app) : null)
);
