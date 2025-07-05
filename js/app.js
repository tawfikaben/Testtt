import { db, auth, login, logout } from './firebase-config.js';

// عناصر واجهة المستخدم
const appContainer = document.getElementById('app-container');
let currentUser = null;

// متابعة حالة المصادقة
auth.onAuthStateChanged(user => {
    currentUser = user;
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

// عرض لوحة التحكم
function showAdminDashboard() {
    appContainer.innerHTML = `
        <header>
            <h1>لوحة تحكم دار حسنة</h1>
            <button id="logout-btn">تسجيل الخروج</button>
        </header>
        <main>
            <div class="tabs">
                <button class="tab-btn active" data-tab="orders">الطلبات</button>
                <button class="tab-btn" data-tab="menu">القائمة</button>
                <button class="tab-btn" data-tab="settings">الإعدادات</button>
            </div>
            <div id="tab-content"></div>
        </main>
    `;

    // تحميل محتوى تبويب الطلبات افتراضياً
    loadOrdersTab();

    // أحداث تغيير التبويبات
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            const tabId = btn.dataset.tab;
            if (tabId === 'orders') loadOrdersTab();
            else if (tabId === 'menu') loadMenuTab();
            else if (tabId === 'settings') loadSettingsTab();
        });
    });

    // حدث تسجيل الخروج
    document.getElementById('logout-btn').addEventListener('click', logout);
}

// تحميل تبويب الطلبات
async function loadOrdersTab() {
    const tabContent = document.getElementById('tab-content');
    tabContent.innerHTML = '<p>جاري تحميل الطلبات...</p>';
    
    try {
        const snapshot = await db.collection('orders').orderBy('timestamp', 'desc').get();
        const orders = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        
        tabContent.innerHTML = `
            <h2>الطلبات الحديثة</h2>
            <div class="orders-list">
                ${orders.map(order => `
                    <div class="order-card">
                        <h3>طلب #${order.id}</h3>
                        <p>الطاولة: ${order.tableNumber}</p>
                        <p>الحالة: ${getStatusText(order.status)}</p>
                        <p>التاريخ: ${new Date(order.timestamp?.toDate()).toLocaleString()}</p>
                        <select class="status-select" data-order-id="${order.id}">
                            <option value="new" ${order.status === 'new' ? 'selected' : ''}>جديد</option>
                            <option value="preparing" ${order.status === 'preparing' ? 'selected' : ''}>قيد التحضير</option>
                            <option value="ready" ${order.status === 'ready' ? 'selected' : ''}>جاهز</option>
                            <option value="delivered" ${order.status === 'delivered' ? 'selected' : ''}>تم التسليم</option>
                        </select>
                    </div>
                `).join('')}
            </div>
        `;
        
        // أحداث تغيير حالة الطلب
        document.querySelectorAll('.status-select').forEach(select => {
            select.addEventListener('change', async (e) => {
                const orderId = e.target.dataset.orderId;
                const newStatus = e.target.value;
                await db.collection('orders').doc(orderId).update({ status: newStatus });
            });
        });
        
    } catch (error) {
        tabContent.innerHTML = `<p class="error">حدث خطأ أثناء تحميل الطلبات: ${error.message}</p>`;
    }
}

// دالة مساعدة لعرض حالة الطلب كنص
function getStatusText(status) {
    const statusMap = {
        new: 'جديد',
        preparing: 'قيد التحضير',
        ready: 'جاهز',
        delivered: 'تم التسليم'
    };
    return statusMap[status] || status;
}
