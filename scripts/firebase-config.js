//IMPORTS
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";


//CONFIGURATION
const firebaseConfig = {
    apiKey: "AIzaSyDP60D1Spda8RzM-4j9NjH8sqqlF4TUZmc",
    authDomain: "culina-316c2.firebaseapp.com",
    projectId: "culina-316c2",
    storageBucket: "culina-316c2.firebasestorage.app",
    messagingSenderId: "301661900672",
    appId: "1:301661900672:web:a91256e09e2f3191a93b65",
    measurementId: "G-1V2E1W1RHL"
};


//INITIALIZATION
// Launch Firebase (establish connection with the cloud)
const app = initializeApp(firebaseConfig);

// Accessing a specific Database service
const db = getFirestore(app);


//EXPORTS
export { db };