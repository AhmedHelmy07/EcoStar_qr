// login.js
import {
    createUserWithEmailAndPassword,
    getAuth,
    onAuthStateChanged,
    signInWithEmailAndPassword
} from "firebase/auth";
import {
    getFirestore,
    doc,
    getDoc,
    setDoc
} from "firebase/firestore";
import app from './fb-config';
import Swal from 'sweetalert2';

const auth = getAuth(app);
const db = getFirestore(app); // Firestore instance
const signupForm = document.getElementById('signup-form');
const loginForm = document.getElementById('login-form');
const toggleButtons = document.querySelectorAll('.toggle-btn');

// التبديل بين نماذج التسجيل وتسجيل الدخول
toggleButtons.forEach(button => {
    button.addEventListener('click', () => {
        signupForm.classList.toggle('active');
        loginForm.classList.toggle('active');
    });
});

// التحقق من صلاحية المستخدم وتوجيهه
const checkUserRole = async (user) => {
    const userDoc = await getDoc(doc(db, "users", user.uid));
    if (userDoc.exists()) {
        const userData = userDoc.data();
        if (userData.role === 'admin') {
            Swal.fire('مرحبًا!', `تم تسجيل الدخول كـ مدير المنصة ${user.email}`, 'success')
                .then(() => {
                    window.location.href = 'admin-dashboard.html'; // توجيه إلى لوحة تحكم المدير
                });
        } else if (userData.role === 'tenant') {
            Swal.fire('مرحبًا!', `تم تسجيل الدخول كـ صاحب منشأة ${user.email}`, 'success')
                .then(() => {
                    window.location.href = 'tenant-dashboard.html'; // توجيه إلى صفحة صاحب المنشأة
                });
        } else {
            Swal.fire('مرحبًا!', `تم تسجيل الدخول كـ ${user.email}`, 'success')
                .then(() => {
                    window.location.href = 'index.html'; // توجيه إلى الصفحة الرئيسية
                });
        }
    } else {
        Swal.fire('خطأ!', 'تعذر العثور على بيانات المستخدم.', 'error');
    }
};

// تسجيل الدخول
loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;

    signInWithEmailAndPassword(auth, email, password)
        .then(async (userCredential) => {
            const user = userCredential.user;
            await checkUserRole(user); // التحقق من دور المستخدم وتوجيهه
        })
        .catch((error) => {
            let errorMessage = '';
            switch (error.code) {
                case 'auth/user-not-found':
                    errorMessage = 'البريد الإلكتروني غير مسجل.';
                    break;
                case 'auth/wrong-password':
                    errorMessage = 'كلمة المرور خاطئة.';
                    break;
                case 'auth/invalid-email':
                    errorMessage = 'البريد الإلكتروني غير صالح.';
                    break;
                case 'auth/invalid-credential':
                    errorMessage = 'البريد الإلكتروني أو كلمة السر غير صالح.';
                    break;
                default:
                    errorMessage = error.message;
            }
            Swal.fire('خطأ!', errorMessage, 'error')
                .then(() => {
                    document.getElementById('login-email').value = '';
                    document.getElementById('login-password').value = '';
                });
        });
});

// تسجيل المستخدم الجديد
signupForm.addEventListener('submit', (e) => {
    e.preventDefault(); // منع إعادة التحميل
    const email = document.getElementById('signup-email').value;
    const password = document.getElementById('signup-password').value;

    createUserWithEmailAndPassword(auth, email, password)
        .then(async (userCredential) => {
            const user = userCredential.user;

            // إضافة المستخدم إلى Firestore مع الدور الافتراضي (مثلاً "user")
            await setDoc(doc(db, "users", user.uid), {
                email: user.email,
                role: 'user' // الدور الافتراضي للمستخدم الجديد
            });

            Swal.fire('مرحبًا!', `تم إنشاء حسابك بنجاح كـ ${user.email}`, 'success')
                .then(() => {
                    window.location.href = 'index.html'; // توجيه إلى الصفحة الرئيسية
                });
        })
        .catch((error) => {
            Swal.fire('خطأ!', error.message, 'error');
        });
});

// التحقق من حالة المستخدم
onAuthStateChanged(auth, (user) => {
    if (user) {
        checkUserRole(user); // تحقق من دور المستخدم وتوجيهه عند التحقق من حالة المصادقة
    }
});
