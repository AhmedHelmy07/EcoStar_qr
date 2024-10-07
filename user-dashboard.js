import app, { auth } from './fb-config';
import { getDatabase, ref, onValue , query, orderByChild, equalTo} from "firebase/database";
import { onAuthStateChanged } from "firebase/auth";
import Swal from 'sweetalert2';

// Firebase Auth and Database Initialization
const db = getDatabase();
const userLabel = document.getElementById('user-label');
const contentArea = document.getElementById('contentArea');
const contractDuration = document.getElementById('remainingContract');
const addTenantModal = document.getElementById('addTenantModal');

// Auth state check
onAuthStateChanged(auth, (user) => {
    if (user) {
        userLabel.innerText = user.email;
        loadContractDuration(user.uid);  // Load contract duration for the logged-in user
    } else {
        window.location.href = 'login.html'; // Redirect to login if not authenticated
    }
});

// Load contract duration from Firebase
const loadContractDuration = (userId) => {
    const userRef = ref(db, 'users/' + userId);
    onValue(userRef, (snapshot) => {
        const data = snapshot.val();
        if (data && data.sub_end) {
            const endTimestamp = data.sub_end;  // Assuming sub_end is a timestamp
            const endDate = new Date(endTimestamp * 1000);  // Convert to milliseconds
            const duration = Math.ceil((endDate - Date.now()) / (1000 * 60 * 60 * 24));
            contractDuration.innerText = `المدة المتبقية على التعاقد: ${duration} يوم`;
        } else {
            contractDuration.innerText = "لم يتم تحديد مدة التعاقد.";
        }
    });
};

// Event listeners for sidebar buttons


// Load tenants from Firebase
window.loadTenants = () => {
    onAuthStateChanged(auth, (user) => {
        if (user) {
            // جلب بيانات المستأجرين وفقًا لـ user_id الخاص بالمستخدم المسجل
            const tenantsRef = query(ref(db, 'tenants'), orderByChild('user_id'), equalTo(user.uid));
            onValue(tenantsRef, (snapshot) => {
                const tenantsData = snapshot.val();
                if (tenantsData) {
                    // تحويل البيانات إلى صيغة يمكن لـ DataTable التعامل معها
                    const tenantsArray = Object.keys(tenantsData).map(key => ({
                        id: key,
                        ...tenantsData[key]
                    }));

                    // إنشاء جدول داخل الصفحة
                    $('.page_title').html(`
                        <table id="tenantTable" class="display">
                            <thead>
                                <tr>
                                    <th>Name</th>
                                    <th>Email</th>
                                    <th>Start Date</th>
                                    <th>End Date</th>
                                    <th>Unit Code</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody></tbody>
                        </table>
                    `);

                    // إعداد DataTable باستخدام المكتبة
                    $('#tenantTable').DataTable({
                        data: tenantsArray,
                        columns: [
                            { data: 'name' },
                            { data: 'email' },
                            { data: 'start_date' },
                            { data: 'end_date' },
                            { data: 'unit_code' },
                            {
                                data: null,
                                render: function (data) {
                                    return `<button class="btn btn-warning" onclick="editTenant('${data.id}')">تعديل</button>`;
                                }
                            }
                        ]
                    });
                } else {
                    // إذا لم يتم العثور على بيانات
                    document.querySelector('.page_title').innerHTML = `<p>لا توجد بيانات مستأجرين.</p>`;
                }
            });
        } else {
            // إعادة التوجيه إلى صفحة تسجيل الدخول إذا لم يكن المستخدم مسجل الدخول
            window.location.href = 'login.html';
        }
    });
};

// دالة لتعديل بيانات المستأجر
const editTenant = (tenantId) => {
    // جلب بيانات المستأجر بناءً على المعرف
    const tenantRef = ref(db, 'tenants/' + tenantId);
    onValue(tenantRef, (snapshot) => {
        const tenantData = snapshot.val();
        if (tenantData) {
            // عرض نافذة لتعديل البيانات باستخدام SweetAlert
            Swal.fire({
                title: 'تعديل بيانات المستأجر',
                html: `
                    <input type="text" id="editName" class="swal2-input" placeholder="Name" value="${tenantData.name}">
                    <input type="email" id="editEmail" class="swal2-input" placeholder="Email" value="${tenantData.email}">
                    <input type="date" id="editStartDate" class="swal2-input" value="${tenantData.start_date}">
                    <input type="date" id="editEndDate" class="swal2-input" value="${tenantData.end_date}">
                    <input type="text" id="editUnitCode" class="swal2-input" placeholder="Unit Code" value="${tenantData.unit_code}">
                `,
                confirmButtonText: 'حفظ',
                preConfirm: () => {
                    const updatedTenant = {
                        name: document.getElementById('editName').value,
                        email: document.getElementById('editEmail').value,
                        start_date: document.getElementById('editStartDate').value,
                        end_date: document.getElementById('editEndDate').value,
                        unit_code: document.getElementById('editUnitCode').value
                    };

                    // تحديث بيانات المستأجر في Firebase
                    return tenantRef.update(updatedTenant).then(() => {
                        Swal.fire('تم التحديث!', 'تم تحديث بيانات المستأجر بنجاح', 'success');
                        loadTenants(); // إعادة تحميل المستأجرين بعد التعديل
                    }).catch((error) => {
                        Swal.fire('خطأ', 'حدث خطأ أثناء التحديث: ' + error.message, 'error');
                    });
                }
            });
        } else {
            Swal.fire('خطأ', 'لم يتم العثور على بيانات المستأجر', 'error');
        }
    });
};


// Add new tenant
const addTenant = () => {
    const email = document.getElementById('tenantEmail').value;
    const password = document.getElementById('tenantPassword').value;
    const unitCode = document.getElementById('unitCode').value;  // Optional: generate a unique unit code

    // Assuming you handle tenant creation in Firebase (you need to integrate user creation logic)
    const newTenantRef = ref(db, 'tenants/' + new Date().getTime());  // Unique tenant ref
    set(newTenantRef, {
        email,
        password,  // It's better not to store passwords directly in Firebase Database for security reasons.
        unitCode
    }).then(() => {
        Swal.fire('نجاح!', 'تم إضافة المستأجر بنجاح!', 'success');
        $('#addTenantModal').modal('hide');
    }).catch((error) => {
        Swal.fire('خطأ!', 'حدث خطأ أثناء إضافة المستأجر.', 'error');
    });
};



// Update account settings (name, email, password)
document.getElementById('saveAccountSettingsBtn').addEventListener('click', () => {
    const newName = document.getElementById('newName').value;
    const newEmail = document.getElementById('newEmail').value;
    const newPassword = document.getElementById('newPassword').value;

    const user = auth.currentUser;

    if (newName) {
        update(ref(db, 'users/' + user.uid), { name: newName }).then(() => {
            Swal.fire('نجاح!', 'تم تحديث الاسم بنجاح.', 'success');
        });
    }

    if (newEmail) {
        updateEmail(user, newEmail).then(() => {
            Swal.fire('نجاح!', 'تم تحديث البريد الإلكتروني بنجاح.', 'success');
        }).catch((error) => {
            Swal.fire('خطأ!', 'حدث خطأ أثناء تحديث البريد الإلكتروني.', 'error');
        });
    }

    if (newPassword) {
        updatePassword(user, newPassword).then(() => {
            Swal.fire('نجاح!', 'تم تحديث كلمة المرور بنجاح.', 'success');
        }).catch((error) => {
            Swal.fire('خطأ!', 'حدث خطأ أثناء تحديث كلمة المرور.', 'error');
        });
    }

    $('#accountSettingsModal').modal('hide');
});

// Logout function
const logout = () => {
    auth.signOut().then(() => {
        Swal.fire('تم تسجيل الخروج', 'تم تسجيل خروجك بنجاح!', 'success').then(() => {
            window.location.href = 'login.html';  // Redirect to login page
        });
    }).catch((error) => {
        Swal.fire('خطأ', 'حدث خطأ أثناء تسجيل الخروج!', 'error');
    });
};
document.getElementById('viewTenantsBtn').addEventListener('click', loadTenants);
document.getElementById('addTenantBtn').addEventListener('click', () => {
    $('#addTenantModal').modal('show');  // Show add tenant modal
});
document.getElementById('accountSettingsBtn').addEventListener('click', () => {
    $('#accountSettingsModal').modal('show');  // Show account settings modal
});
document.getElementById('logout-btn').addEventListener('click', logout);
