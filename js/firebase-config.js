// js/firebase-config.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.4.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.4.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.4.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyAeoSw_tzVYyiqAas2VgdxAnP4oTN4pZRU",
  authDomain: "ihhs-26dde.firebaseapp.com",
  projectId: "ihhs-26dde",
  storageBucket: "ihhs-26dde.firebasestorage.app",
  messagingSenderId: "378462007910",
  appId: "1:378462007910:web:23551a2f87a1371cf273a7",
  measurementId: "G-4DZ5HLXXEK"
};

// Khởi tạo Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app); // Chuẩn bị sẵn Firestore để lưu điểm sau này

export { auth, db };
