// التهيئة الأساسية لـ Firebase
const firebaseConfig = {
    apiKey: "AIzaSyDpSF4J0bsd6T0ImMpse0KQQRADaxiYUQw",
    authDomain: "darhassna-484c3.firebaseapp.com",
    projectId: "darhassna-484c3",
    storageBucket: "darhassna-484c3.appspot.com",
    messagingSenderId: "141393162149",
    appId: "1:141393162149:web:0717227eac221f5ddfc24c"
};

// Initialize Firebase
const app = firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
const auth = firebase.auth();

// دالة تسجيل الدخول
async function login(email, password) {
    try {
        const userCredential = await auth.signInWithEmailAndPassword(email, password);
        return userCredential.user;
    } catch (error) {
        console.error("خطأ في تسجيل الدخول:", error);
        throw new Error("فشل تسجيل الدخول: " + error.message);
    }
}

// دالة تسجيل الخروج
function logout() {
    return auth.signOut();
}

// جعل المتغيرات متاحة عالمياً
window.firebase = { db, auth, login, logout };
