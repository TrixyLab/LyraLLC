// firebase-config.js

const firebaseConfig = {
  apiKey: "AIzaSyCR3Z8Peo8Voda7gtz5fAc2TibQJhB63Eg",
  authDomain: "lyra-esports.firebaseapp.com",
  projectId: "lyra-esports",
  storageBucket: "lyra-esports.firebasestorage.app",
  messagingSenderId: "927531070934",
  appId: "1:927531070934:web:6c3b528c681ac8a23be077",
  measurementId: "G-LQ4Y3C57NK",
  databaseURL: "https://lyra-esports-default-rtdb.firebaseio.com"
};

// Initialize Firebase
if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}
const db = firebase.database();
