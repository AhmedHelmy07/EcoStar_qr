import { getFirestore, collection, getDocs, doc, updateDoc } from "firebase/firestore";
import Swal from 'sweetalert2';

const db = getFirestore();

const userTable = $('#userTable').DataTable();

// Fetch users from Firebase and display in the table
const loadUsers = async () => {
    const querySnapshot = await getDocs(collection(db, "users"));
    querySnapshot.forEach((doc) => {
        const user = doc.data();
        userTable.row.add([
            user.email,
            user.role,
            `<button class="btn btn-primary editUserBtn" data-id="${doc.id}" data-email="${user.email}" data-role="${user.role}" data-sub-end="${user.sub_end}">Edit</button>`
        ]).draw();
    });
};

// Event listener for edit buttons
$(document).on('click', '.editUserBtn', function() {
    const userId = $(this).data('id');
    const userEmail = $(this).data('email');
    const userRole = $(this).data('role');
    const sub_end = $(this).data('sub-end')

    $('#editUserId').val(userId);
    $('#editEmail').val(userEmail);
    $('#editRole').val(userRole);
    $('#editSub').val(sub_end);
    $('#editUserModal').modal('show');
});

// Save changes to user
$('#saveChangesBtn').click(async () => {
    const userId = $('#editUserId').val();
    const newEmail = $('#editEmail').val();
    const newRole = $('#editRole').val();
    const newSub = $('#editSub').val();

    try {
        await updateDoc(doc(db, "users", userId), {
            email: newEmail,
            role: newRole,
            sub_end: newSub
        });
        Swal.fire('Updated!', 'User details updated successfully', 'success');
        location.reload();
    } catch (error) {
        Swal.fire('Error', error.message, 'error');
    }
});

// Load users when page loads
$(document).ready(() => {
    loadUsers();
});
