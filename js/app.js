// الانتظار حتى تحميل DOM
document.addEventListener('DOMContentLoaded', () => {
    const { db, auth, login, logout } = window.firebaseApp;
    const appContainer = document.getElementById('app-container');

    auth.onAuthStateChanged(user => {
        if (user) {
            appContainer.innerHTML = `
                <div class="dashboard">
                    <h2>مرحباً ${user.email}</h2>
                    <button id="logout-btn">تسجيل الخروج</button>
                </div>
            `;
            document.getElementById('logout-btn').addEventListener('click', logout);
        } else {
            appContainer.innerHTML = `
                <div class="login-container">
                    <h2>تسجيل الدخول</h2>
                    <input type="email" id="email" placeholder="البريد الإلكتروني">
                    <input type="password" id="password" placeholder="كلمة المرور">
                    <button id="login-btn">دخول</button>
                    <div id="error-msg" class="error-message"></div>
                </div>
            `;

            document.getElementById('login-btn').addEventListener('click', async () => {
                const email = document.getElementById('email').value;
                const password = document.getElementById('password').value;
                
                try {
                    await login(email, password);
                } catch (error) {
                    document.getElementById('error-msg').textContent = error.message;
                }
            });
        }
    });
});
