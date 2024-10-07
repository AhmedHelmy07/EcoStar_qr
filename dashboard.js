import { getFirestore, doc, setDoc, collection, getDocs, addDoc } from "firebase/firestore";
import { getAuth, onAuthStateChanged } from "firebase/auth";

// إعداد Firebase
const db = getFirestore();
const auth = getAuth();

// مرجع إلى مجموعة المستخدمين
const usersCollectionRef = collection(db, "users");

// مرجع إلى عناصر HTML
const addUserForm = document.getElementById('add-user-form');
const totalUsersElement = document.getElementById('total-users');
const welcomeMsg = document.getElementById('welcome-msg');

// عرض رسالة ترحيب للمسؤول
onAuthStateChanged(auth, (user) => {
    if (user) {
        welcomeMsg.innerHTML = `<h4>Welcome, ${user.email}</h4>`;
    } else {
        window.location.href = 'login.html';
    }
});

// إضافة مستخدم جديد
addUserForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const userEmail = document.getElementById('userEmail').value;
    const userRole = document.getElementById('userRole').value;
    const subscriptionEnd = document.getElementById('subscriptionEnd').value;

    try {
        await addDoc(usersCollectionRef, {
            email: userEmail,
            role: userRole,
            subscriptionEnd: new Date(subscriptionEnd)
        });

        alert('User added successfully!');
        loadTotalUsers(); // تحديث عدد المستخدمين بعد الإضافة
    } catch (error) {
        console.error("Error adding user: ", error);
    }
});

// جلب العدد الإجمالي للمستخدمين
async function loadTotalUsers() {
    try {
        const usersSnapshot = await getDocs(usersCollectionRef);
        const usersCount = usersSnapshot.size;
        totalUsersElement.innerText = usersCount;
    } catch (error) {
        console.error("Error fetching users: ", error);
    }
}

// تحميل عدد المستخدمين عند تحميل الصفحة
loadTotalUsers();
