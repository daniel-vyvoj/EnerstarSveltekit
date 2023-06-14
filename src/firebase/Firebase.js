import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getDatabase} from "firebase/database";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyAh5RVRAAmRT8UwIogGlY2AtDZUKcULFgk",
  authDomain: "enerstav.firebaseapp.com",
  projectId: "enerstav",
  storageBucket: "enerstav.appspot.com",
  messagingSenderId: "101325697125",
  appId: "1:101325697125:web:53b25088da1a466a46168c"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getDatabase(app);
const storage = getStorage(app);


export { app, auth, db, storage };