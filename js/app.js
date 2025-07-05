// التهيئة الآمنة لـ Firebase
const firebaseConfig = {
    apiKey: "AIzaSyDpSF4J0bsd6T0ImMpse0KQQRADaxiYUQw",
    authDomain: "darhassna-484c3.firebaseapp.com",
    projectId: "darhassna-484c3",
    storageBucket: "darhassna-484c3.appspot.com",
    messagingSenderId: "141393162149",
    appId: "1:141393162149:web:0717227eac221f5ddfc24c"
};

// Initialize Firebase
const app = firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
const auth = firebase.auth();

// Data Storage
let menuData = {
    breakfast: [],
    lunch: [],
    dinner: []
};
let restaurantLogo = "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyMDAgMTAwIj48dGV4dCB4PSIxMDAiIHk9IjUwIiBmb250LWZhbWlseT0iR2VvcmdpYSIgZm9udC1zaXplPSIyNCIgZmlsbD0iIzVhNGE0MiIgdGV4dC1hbmNob3I9Im1pZGRsZSI+REFSIEhBU1NOQTwvdGV4dD48L3N2Zz4=";
let currentOrder = [];
let currentLanguage = 'fr';

// Initialize the app
document.addEventListener('DOMContentLoaded', () => {
    loadInitialData();
    setupEventListeners();
    updateLanguageDisplay();
    
    // Add click event listener to restaurant name
    document.querySelector('.main-title').addEventListener('click', handleRestaurantNameClick);
});

// Load initial data from Firebase
async function loadInitialData() {
    try {
        // Load menu
        const menuSnapshot = await db.collection('menu').get();
        if (!menuSnapshot.empty) {
            menuData = { breakfast: [], lunch: [], dinner: [] };
            menuSnapshot.forEach(doc => {
                const item = doc.data();
                menuData[item.category].push(item);
            });
        }

        // Load restaurant settings
        const settingsDoc = await db.collection('settings').doc('restaurant').get();
        if (settingsDoc.exists) {
            const settings = settingsDoc.data();
            restaurantLogo = settings.logo || restaurantLogo;
            currentLanguage = settings.language || currentLanguage;
            document.getElementById('restaurant-logo').src = restaurantLogo;
        }

        loadMenu();
    } catch (error) {
        console.error("Error loading initial data:", error);
        showAlert(currentLanguage === 'fr' ? 
            "Erreur de chargement des données" : "خطأ في تحميل البيانات", "error");
    }
}

// Save settings to Firebase
async function saveSettings() {
    try {
        await db.collection('settings').doc('restaurant').set({
            logo: restaurantLogo,
            language: currentLanguage,
            lastUpdated: firebase.firestore.FieldValue.serverTimestamp()
        });
        return true;
    } catch (error) {
        console.error("Error saving settings:", error);
        return false;
    }
}

// Save menu to Firebase
async function saveMenu() {
    try {
        // Show loading state
        const saveBtn = document.getElementById('save-menu');
        const saveText = document.getElementById(currentLanguage === 'fr' ? 'save-text' : 'save-text-ar');
        const saveSpinner = document.getElementById('save-spinner');
        
        saveText.classList.add('hidden');
        saveSpinner.classList.remove('hidden');
        saveBtn.disabled = true;

        const batch = db.batch();
        
        // 1. Delete existing menu
        const menuRef = db.collection('menu');
        const snapshot = await menuRef.get();
        snapshot.forEach(doc => {
            batch.delete(doc.ref);
        });
        
        // 2. Add new items
        const allItems = [
            ...menuData.breakfast,
            ...menuData.lunch,
            ...menuData.dinner
        ];
        
        allItems.forEach(item => {
            const newDocRef = menuRef.doc();
            batch.set(newDocRef, {
                id: newDocRef.id,
                name: item.name,
                name_ar: item.name_ar,
                price: item.price,
                category: item.category,
                image: item.image
            });
        });
        
        // 3. Execute batch
        await batch.commit();
        
        // 4. Save settings
        await saveSettings();
        
        return true;
    } catch (error) {
        console.error("Error saving menu:", error);
        return false;
    } finally {
        // Reset save button
        const saveBtn = document.getElementById('save-menu');
        const saveText = document.getElementById(currentLanguage === 'fr' ? 'save-text' : 'save-text-ar');
        const saveSpinner = document.getElementById('save-spinner');
        
        saveText.classList.remove('hidden');
        saveSpinner.classList.add('hidden');
        saveBtn.disabled = false;
    }
}

// Show alert message
function showAlert(message, type) {
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type}`;
    alertDiv.textContent = message;
    document.body.appendChild(alertDiv);
    
    setTimeout(() => {
        alertDiv.remove();
    }, 3000);
}

// Load menu for customers
function loadMenu() {
    const container = document.getElementById('menu-container');
    container.innerHTML = '';

    // Create sections for each category
    const categories = [
        { id: 'breakfast', name: 'Petit-déjeuner', name_ar: 'الفطور' },
        { id: 'lunch', name: 'Déjeuner', name_ar: 'الغداء' },
        { id: 'dinner', name: 'Dîner', name_ar: 'العشاء' }
    ];

    categories.forEach(category => {
        const section = document.createElement('div');
        section.className = 'mb-8';
        section.innerHTML = `
            <h2 class="menu-section-title text-xl font-bold mb-4 pb-2">
                <span class="lang-fr">${category.name}</span>
                <span class="lang-ar hidden">${category.name_ar}</span>
            </h2>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4" id="${category.id}-items">
                ${menuData[category.id].map(item => `
                    <div class="food-item bg-white rounded shadow food-item-card overflow-hidden">
                        ${item.image ? `
                            <img src="${item.image}" class="food-image" alt="${currentLanguage === 'fr' ? item.name : item.name_ar}">
                        ` : `
                            <div class="food-image bg-gray-200 flex items-center justify-center">
                                <i class="fas fa-utensils text-4xl text-gray-400"></i>
                            </div>
                        `}
                        <div class="p-4">
                            <h3 class="font-bold text-[#5a4a42]">
                                <span class="lang-fr">${item.name}</span>
                                <span class="lang-ar hidden">${item.name_ar}</span>
                            </h3>
                            <div class="flex justify-between items-center mt-2">
                                <span class="text-[#8B4513] font-bold">${item.price} DH</span>
                                <button class="add-to-order px-3 py-1 text-white rounded" 
                                        data-id="${item.id}" data-name="${currentLanguage === 'fr' ? item.name : item.name_ar}" data-price="${item.price}">
                                    <span class="lang-fr">Ajouter</span>
                                    <span class="lang-ar hidden">أضف</span>
                                </button>
                            </div>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
        container.appendChild(section);
    });
}

// Load admin dashboard
async function loadAdminDashboard() {
    await loadOrdersForAdmin();
    loadMenuEditor();
}

// Load orders for admin view
async function loadOrdersForAdmin() {
    const container = document.getElementById('orders-list');
    
    try {
        const snapshot = await db.collection('orders')
            .orderBy('time', 'desc')
            .get();
        
        container.innerHTML = '';
        
        if (snapshot.empty) {
            container.innerHTML = `
                <p class="text-gray-500 lang-fr">Aucune commande pour le moment</p>
                <p class="text-gray-500 lang-ar hidden">لا توجد طلبات في الوقت الحالي</p>
            `;
            return;
        }
        
        snapshot.forEach(doc => {
            const order = doc.data();
            const orderElement = createOrderElement(order, doc.id);
            container.appendChild(orderElement);
        });
        
    } catch (error) {
        console.error("Error loading orders:", error);
        container.innerHTML = `
            <p class="text-red-500 lang-fr">Erreur de chargement des commandes</p>
            <p class="text-red-500 lang-ar hidden">خطأ في تحميل الطلبات</p>
        `;
    }
}

// Create order element for admin view
function createOrderElement(order, orderId) {
    const orderDiv = document.createElement('div');
    orderDiv.className = 'bg-white p-4 rounded shadow food-item-card';
    
    const statusClass = `order-status-${order.status || 'new'}`;
    const statusText = getStatusText(order.status || 'new');
    
    orderDiv.innerHTML = `
        <div class="flex justify-between items-start">
            <div>
                <h3 class="font-bold text-[#5a4a42]">
                    <span class="lang-fr">Commande #${orderId.substring(0, 6)}</span>
                    <span class="lang-ar hidden">طلب #${orderId.substring(0, 6)}</span>
                </h3>
                <p class="text-sm">
                    <span class="lang-fr">Table: ${order.tableNumber || 'N/A'}</span>
                    <span class="lang-ar hidden">طاولة: ${order.tableNumber || 'N/A'}</span>
                </p>
                <p class="text-sm">${new Date(order.time?.toDate()).toLocaleTimeString()}</p>
            </div>
            <span class="px-2 py-1 rounded text-xs ${statusClass}">${statusText}</span>
        </div>
        <div class="mt-2">
            ${order.items.map(item => `
                <div class="flex justify-between text-sm py-1 border-b border-[#d4a762]">
                    <span>${item.quantity}x ${currentLanguage === 'fr' ? item.name : item.name_ar}</span>
                    <span>${item.price * item.quantity} DH</span>
                </div>
            `).join('')}
        </div>
        <div class="flex justify-between items-center mt-2 pt-2 border-t border-[#d4a762]">
            <span class="font-bold text-[#5a4a42]">
                <span class="lang-fr">Total: ${order.total} DH</span>
                <span class="lang-ar hidden">المجموع: ${order.total} درهم</span>
            </span>
            <select class="order-status text-xs p-1 border border-[#d4a762] rounded" data-order-id="${orderId}">
                <option value="new" ${order.status === 'new' ? 'selected' : ''}>
                    <span class="lang-fr">Nouvelle</span>
                    <span class="lang-ar hidden">جديدة</span>
                </option>
                <option value="preparing" ${order.status === 'preparing' ? 'selected' : ''}>
                    <span class="lang-fr">En préparation</span>
                    <span class="lang-ar hidden">قيد التحضير</span>
                </option>
                <option value="ready" ${order.status === 'ready' ? 'selected' : ''}>
                    <span class="lang-fr">Prête</span>
                    <span class="lang-ar hidden">جاهزة</span>
                </option>
                <option value="delivered" ${order.status === 'delivered' ? 'selected' : ''}>
                    <span class="lang-fr">Livrée</span>
                    <span class="lang-ar hidden">تم التسليم</span>
                </option>
            </select>
        </div>
    `;
    
    return orderDiv;
}

// Load menu editor for admin
function loadMenuEditor() {
    const container = document.getElementById('menu-editor');
    
    container.innerHTML = `
        <div class="mb-6">
            <h3 class="font-bold mb-4 text-[#5a4a42]">
                <span class="lang-fr">Paramètres du Restaurant</span>
                <span class="lang-ar hidden">إعدادات المطعم</span>
            </h3>
            <div class="bg-white p-4 rounded shadow food-item-card mb-6">
                <h4 class="font-bold mb-2">
                    <span class="lang-fr">Logo du Restaurant</span>
                    <span class="lang-ar hidden">شعار المطعم</span>
                </h4>
                <div class="flex flex-col md:flex-row md:items-center">
                    <img id="logo-preview" src="${restaurantLogo}" class="w-20 h-20 object-contain mb-2 md:mb-0 md:mr-4">
                    <div class="flex-1">
                        <div class="mb-2">
                            <label class="block text-sm font-medium text-gray-700 mb-1">
                                <span class="lang-fr">URL de l'image du logo</span>
                                <span class="lang-ar hidden">رابط صورة الشعار</span>
                            </label>
                            <input type="text" id="logo-url" class="w-full p-2 border border-[#d4a762] rounded" 
                                   placeholder="https://example.com/logo.png" value="${restaurantLogo}">
                        </div>
                        <button id="update-logo" class="px-3 py-1 bg-[#5a4a42] text-white rounded text-sm">
                            <span class="lang-fr">Mettre à jour</span>
                            <span class="lang-ar hidden">تحديث</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
        ${Object.entries(menuData).map(([category, items]) => `
        <div class="mb-6">
            <h3 class="font-bold mb-2 text-[#5a4a42]">${getCategoryName(category)}</h3>
            <div class="space-y-3" id="${category}-editor">
                ${items.map(item => `
                    <div class="menu-item bg-white p-3 rounded shadow food-item-card flex flex-col md:flex-row">
                        <div class="md:w-1/4 mb-3 md:mb-0 md:mr-4">
                            <img src="${item.image || 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxMDAgMTAwIj48cmVjdCB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0iI2VlZSIvPjx0ZXh0IHg9IjUwIiB5PSI1MCIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjE0IiBmaWxsPSIjYWFhIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkb21pbmFudC1iYXNlbGluZT0ibWlkZGxlIj5JbWFnZSBub24gZGlzcG9uaWJsZTwvdGV4dD48L3N2Zz4='}" 
                                 class="w-full h-32 object-cover rounded mb-2">
                            <div class="mb-2">
                                <label class="block text-sm font-medium text-gray-700 mb-1">
                                    <span class="lang-fr">URL de l'image</span>
                                    <span class="lang-ar hidden">رابط الصورة</span>
                                </label>
                                <input type="text" value="${item.image}" 
                                       class="item-image-url w-full p-1 border border-[#d4a762] rounded" 
                                       data-id="${item.id}" data-category="${category}" placeholder="https://example.com/image.jpg">
                            </div>
                        </div>
                        <div class="flex-1">
                            <div class="flex-1 mr-4 mb-3">
                                <label class="block text-sm font-medium text-gray-700 mb-1">
                                    <span class="lang-fr">Nom (Français)</span>
                                    <span class="lang-ar hidden">الاسم (بالفرنسية)</span>
                                </label>
                                <input type="text" value="${item.name}" 
                                       class="item-name w-full p-1 border border-[#d4a762] rounded" 
                                       data-id="${item.id}" data-category="${category}">
                            </div>
                            <div class="flex-1 mr-4 mb-3">
                                <label class="block text-sm font-medium text-gray-700 mb-1">
                                    <span class="lang-fr">Nom (العربية)</span>
                                    <span class="lang-ar hidden">الاسم (بالعربية)</span>
                                </label>
                                <input type="text" value="${item.name_ar}" 
                                       class="item-name-ar w-full p-1 border border-[#d4a762] rounded" 
                                       data-id="${item.id}" data-category="${category}">
                            </div>
                            <div class="w-full mb-3">
                                <label class="block text-sm font-medium text-gray-700 mb-1">
                                    <span class="lang-fr">Prix (DH)</span>
                                    <span class="lang-ar hidden">السعر (درهم)</span>
                                </label>
                                <input type="number" value="${item.price}" 
                                       class="item-price w-full p-1 border border-[#d4a762] rounded" 
                                       data-id="${item.id}" data-category="${category}">
                            </div>
                        </div>
                        <div class="flex items-start">
                            <button class="delete-item ml-2 px-2 py-1 bg-red-500 text-white rounded text-sm">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    </div>
                `).join('')}
            </div>
            <button class="add-item mt-2 px-3 py-1 bg-gray-200 rounded text-sm" data-category="${category}">
                <i class="fas fa-plus mr-1"></i>
                <span class="lang-fr">Ajouter un plat</span>
                <span class="lang-ar hidden">إضافة طبق</span>
            </button>
        </div>
        `).join('')}

        <button id="save-menu" class="mt-4 px-4 py-2 bg-[#5a4a42] text-white rounded hover:bg-[#3a2a22] transition-colors duration-300">
            <span id="save-text" class="lang-fr">Enregistrer le Menu</span>
            <span id="save-text-ar" class="lang-ar hidden">حفظ القائمة</span>
            <span id="save-spinner" class="hidden ml-2"><i class="fas fa-spinner fa-spin"></i></span>
        </button>
    `;

    // Logo update
    document.getElementById('update-logo').addEventListener('click', async () => {
        const logoUrl = document.getElementById('logo-url').value.trim();
        if (logoUrl) {
            restaurantLogo = logoUrl;
            document.getElementById('restaurant-logo').src = restaurantLogo;
            document.getElementById('logo-preview').src = restaurantLogo;
            await saveSettings();
            showAlert(
                currentLanguage === 'fr' ? 'Logo
