// الوصول إلى كائنات Firebase من النطاق العام
const { db, auth, login, logout } = window.firebase;

// عناصر واجهة المستخدم
const appContainer = document.getElementById('app-container');

// متابعة حالة المصادقة
auth.onAuthStateChanged(user => {
    if (user) {
        showAdminDashboard();
    } else {
        showLoginScreen();
    }
});

// عرض شاشة تسجيل الدخول
function showLoginScreen() {
    appContainer.innerHTML = `
        <div class="login-container">
            <h2>تسجيل الدخول للإدارة</h2>
            <input type="email" id="login-email" placeholder="البريد الإلكتروني">
            <input type="password" id="login-password" placeholder="كلمة المرور">
            <button id="login-btn">تسجيل الدخول</button>
            <div id="login-error" class="error-message"></div>
        </div>
    `;

    document.getElementById('login-btn').addEventListener('click', async () => {
        const email = document.getElementById('login-email').value;
        const password = document.getElementById('login-password').value;
        const errorElement = document.getElementById('login-error');
        
        try {
            await login(email, password);
        } catch (error) {
            errorElement.textContent = error.message;
        }
    });
}

// ... (بقية الدوال كما هي بدون تغيير)
