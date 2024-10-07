// main.js
import { getAuth, onAuthStateChanged, signOut } from "firebase/auth";
import {getFirestore, collection, addDoc, getDocs} from "firebase/firestore";
import Swal from 'sweetalert2';
import app from './fb-config';

const db = getFirestore();

async function createUser(user) {
    try {
        const docRef = await addDoc(collection(db, "users"), {
            email: user.email,
            role: user.role,
            subscriptionEnd: user.subscriptionEnd,
        });
        console.log("User created with ID: ", docRef.id); // المعرف التلقائي
    } catch (e) {
        console.error("Error adding document: ", e);
    }
}

$("#add_user").click(function(){
    alert("hi")
})

const auth = getAuth(app);
const logoutBtn = document.getElementById('logout-btn');
const userLabel = document.getElementById('user-label');

// التحقق من حالة المستخدم
onAuthStateChanged(auth, (user) => {
    if (user) {
        userLabel.innerText = `مرحبا، ${user.email}`; // عرض اسم المستخدم
        $("#logout-btn").show();
    } else {
        window.location.href = 'login.html'; // تحويل إلى صفحة تسجيل الدخول
    }
});



// تسجيل الخروج
if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
        Swal.fire({
            title: 'هل أنت متأكد؟',
            text: "سيتم تسجيل خروجك من حسابك!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'نعم، قم بتسجيل الخروج!'
        }).then((result) => {
            if (result.isConfirmed) {
                signOut(auth).then(() => {
                    Swal.fire(
                        'تم!',
                        'لقد تم تسجيل خروجك بنجاح.',
                        'success'
                    ).then(() => {
                        window.location.href = 'login.html'; // العودة إلى صفحة تسجيل الدخول
                    });
                }).catch((error) => {
                    Swal.fire(
                        'خطأ!',
                        'حدث خطأ أثناء تسجيل الخروج.',
                        'error'
                    );
                });
            }
        });
    });
}


//load users in main
$('#get_users').click(async function () {
    const userTable = $('#userTable').DataTable();

// Fetch users from Firebase and display in the table
    const loadUsers = async () => {
        const querySnapshot = await getDocs(collection(db, "users"));
        querySnapshot.forEach((doc) => {
            const user = doc.data();
            userTable.row.add([
                user.email,
                user.role,
                `<button class="btn btn-primary editUserBtn" data-id="${doc.id}" data-email="${user.email}" data-role="${user.role}">Edit</button>`
            ]).draw();
        });
    };
})


