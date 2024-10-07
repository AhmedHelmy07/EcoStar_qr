




// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyDpn7uC5OxYN51JYcxbokcy2cOTsQksIoc",
    authDomain: "ecostar-qr.firebaseapp.com",
    projectId: "ecostar-qr",
    storageBucket: "ecostar-qr.appspot.com",
    messagingSenderId: "574927859578",
    appId: "1:574927859578:web:02b4c527318924d4b730c3"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

export default app;
export { auth };