// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup } from 'firebase/auth'
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyBB_GVzJRYKS8O8b9VrkH2Mj-cUkb0oliw",
    authDomain: "pj03-8c062.firebaseapp.com",
    projectId: "pj03-8c062",
    storageBucket: "pj03-8c062.firebasestorage.app",
    messagingSenderId: "938005762245",
    appId: "1:938005762245:web:20a08223bb37b0fb61a0ac"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);


//google auth

const provider = new GoogleAuthProvider()

const auth = getAuth();

export const authWithGoogle = async () => {
    let user = null;
    await signInWithPopup(auth,provider)
    .then((result)=>{
        user = result.user
    })
    .catch((err)=>{
        console.log(err)
    })

    return user;
}