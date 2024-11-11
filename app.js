// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyBGLzFJ-BQOpmr34CWJbfkC3NdgWSK-RFE",
    authDomain: "todoapp-ea2b0.firebaseapp.com",
    databaseURL: "https://todoapp-ea2b0-default-rtdb.firebaseio.com",
    projectId: "todoapp-ea2b0",
    storageBucket: "todoapp-ea2b0.appspot.com",
    messagingSenderId: "977909421903",
    appId: "1:977909421903:web:3f4b68fe70729dafb6d73a"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const database = firebase.database();

// Login Function
function Login() {
    const email = document.getElementById("Loginemail").value;
    const password = document.getElementById("Loginpassword").value;

    auth.signInWithEmailAndPassword(email, password)
        .then((userCredential) => {
            Swal.fire({
                icon: 'success',
                title: 'Login Successful',
                text: 'Welcome back!',
                confirmButtonColor: '#3085d6'
            }).then(() => {
                window.location.href = "./todo.html";
            });
        })
        .catch((error) => {
            Swal.fire({
                icon: 'error',
                title: 'Login Failed',
                text: 'Invalid email or password. Please try again.',
                confirmButtonColor: '#d33'
            });
        });
}

// Sign-Up Function
function signUp() {
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    auth.createUserWithEmailAndPassword(email, password)
        .then((userCredential) => {
            Swal.fire({
                icon: 'success',
                title: 'Account Created',
                text: 'Your account has been created successfully!',
                confirmButtonColor: '#3085d6'
            }).then(() => {
                window.location.href = "./index.html";
            });
        })
        .catch((error) => {
            Swal.fire({
                icon: 'error',
                title: 'Sign-Up Failed',
                text: error.message,
                confirmButtonColor: '#d33'
            });
        });
}

// Ensure the user is logged in on the Todo page
auth.onAuthStateChanged((user) => {
    if (user) {
        console.log("User is authenticated");
    } else {
        if (window.location.pathname.includes("todo.html")) {
            window.location.href = "./index.html";
        }
    }
});

document.addEventListener('DOMContentLoaded', () => {
    const inputElement = document.getElementById("input");
    inputElement.addEventListener("keypress", (event) => {
        if (event.key === "Enter") {
            event.preventDefault();
            addTodo();
        }
    });
    loadTodos();
});

function addTodo() {
    const inputElement = document.getElementById("input");
    const inputValue = inputElement.value.trim();
    if (inputValue) {
        const todoId = database.ref('todos').push().key;
        const todoData = { id: todoId, text: inputValue };

        database.ref('todos/' + todoId).set(todoData).then(() => {
            inputElement.value = '';
        });
    } else {
        Swal.fire({
            icon: 'warning',
            title: 'Empty Task',
            text: 'Please enter a task.',
            confirmButtonColor: '#f0ad4e'
        });
    }
}

function loadTodos() {
    const ulElement = document.getElementById("list");
    database.ref('todos').on('value', (snapshot) => {
        ulElement.innerHTML = '';
        snapshot.forEach(childSnapshot => {
            const todoData = childSnapshot.val();
            addTodoToDOM(todoData.id, todoData.text);
        });
    });
}

function addTodoToDOM(id, text) {
    const ulElement = document.getElementById("list");
    const liElement = document.createElement("li");
    liElement.setAttribute("data-id", id);
    liElement.textContent = text;

    const deleteButton = document.createElement("button");
    deleteButton.className = "delete";
    deleteButton.textContent = "Delete";
    deleteButton.onclick = () => deleteTodoFromFirebase(id);
    liElement.appendChild(deleteButton);

    const editButton = document.createElement("button");
    editButton.className = "edit";
    editButton.textContent = "Edit";
    editButton.onclick = () => editTodoInFirebase(id, liElement);
    liElement.appendChild(editButton);

    ulElement.appendChild(liElement);
}

function deleteTodoFromFirebase(id) {
    Swal.fire({
        title: 'Are you sure?',
        text: "This task will be deleted!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes, delete it!'
    }).then((result) => {
        if (result.isConfirmed) {
            database.ref('todos/' + id).remove();
            document.querySelector(`li[data-id='${id}']`).remove();
            Swal.fire({
                icon: 'success',
                title: 'Deleted!',
                text: 'The task has been deleted.',
                confirmButtonColor: '#3085d6'
            });
        }
    });
}

function editTodoInFirebase(id, liElement) {
    const currentValue = liElement.firstChild.nodeValue;
    Swal.fire({
        title: 'Edit Task',
        input: 'text',
        inputLabel: 'Update the task:',
        inputValue: currentValue,
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Update'
    }).then((result) => {
        if (result.isConfirmed && result.value.trim()) {
            database.ref('todos/' + id).update({ text: result.value });
            liElement.firstChild.nodeValue = result.value;
            Swal.fire({
                icon: 'success',
                title: 'Task Updated',
                text: 'The task has been updated successfully.',
                confirmButtonColor: '#3085d6'
            });
        }
    });
}

function deleteAllTodos() {
    Swal.fire({
        title: 'Delete All Tasks?',
        text: "This will remove all tasks permanently!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes, delete all!'
    }).then((result) => {
        if (result.isConfirmed) {
            database.ref('todos').remove();
            document.getElementById("list").innerHTML = '';
            Swal.fire({
                icon: 'success',
                title: 'All Tasks Deleted',
                text: 'All tasks have been removed.',
                confirmButtonColor: '#3085d6'
            });
        }
    });
}

function logout() {
    auth.signOut().then(() => {
        Swal.fire({
            icon: 'success',
            title: 'Logged Out',
            text: 'You have successfully logged out.',
            confirmButtonColor: '#3085d6'
        }).then(() => {
            window.location.href = "./index.html";
        });
    }).catch((error) => {
        Swal.fire({
            icon: 'error',
            title: 'Logout Failed',
            text: error.message,
            confirmButtonColor: '#d33'
        });
    });
}
