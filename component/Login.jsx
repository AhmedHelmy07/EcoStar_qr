// login.js
import {
    createUserWithEmailAndPassword,
    getAuth,
    onAuthStateChanged,
    signInWithEmailAndPassword
} from "firebase/auth";
import app from './fb-config';


const auth = getAuth(app);
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

loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;

    signInWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
            const user = userCredential.user;
            Swal.fire('مرحبًا!', `تم تسجيل الدخول كـ ${user.email}`, 'success')
                .then(() => {
                    window.location.href = 'index.html'; // توجيه إلى الصفحة الرئيسية
                });
        })
        .catch((error) => {
            // هنا نعرض التنبيه عند حدوث خطأ
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
                    errorMessage = 'البريد الإلكتروني او كلمة السر غير صالح.';
                    break;
                default:
                    errorMessage = error.message;
            }
            Swal.fire('خطأ!', errorMessage, 'error')
                .then(() => {
                    // إعادة تهيئة حقول الإدخال
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
        .then((userCredential) => {
            const user = userCredential.user;
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
        window.location.href = 'index.html'; // توجيه المستخدم إلى الصفحة الرئيسية
    }
});
