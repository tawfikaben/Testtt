// البيانات الأساسية
let menuData = { breakfast: [], lunch: [], dinner: [] };
let restaurantLogo = "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyMDAgMTAwIj48dGV4dCB4PSIxMDAiIHk9IjUwIiBmb250LWZhbWlseT0iR2VvcmdpYSIgZm9udC1zaXplPSIyNCIgZmlsbD0iIzVhNGE0MiIgdGV4dC1hbmNob3I9Im1pZGRsZSI+REFSIEhBU1NOQTwvdGV4dD48L3N2Zz4=";
let currentOrder = [];
let currentLanguage = 'fr';
let clickCount = 0;
let lastClickTime = 0;

// العناصر الأساسية
const { db, auth } = window.firebaseApp;

// تهيئة التطبيق
document.addEventListener('DOMContentLoaded', () => {
    updateCurrentDate();
    setupEventListeners();
    checkAuthState();
    loadInitialData();
});

// تحديث التاريخ الحالي
function updateCurrentDate() {
    const months = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
    const today = new Date();
    document.getElementById('current-date').textContent = 
        `${today.getDate()} ${months[today.getMonth()]}, ${today.getFullYear()}`;
}

// تحميل البيانات الأولية
async function loadInitialData() {
    try {
        // تحميل القائمة
        const menuSnapshot = await db.collection('menu').get();
        menuData = { breakfast: [], lunch: [], dinner: [] };
        menuSnapshot.forEach(doc => {
            const item = doc.data();
            menuData[item.category].push(item);
        });

        // تحميل الإعدادات
        const settingsDoc = await db.collection('settings').doc('restaurant').get();
        if (settingsDoc.exists) {
            const settings = settingsDoc.data();
            restaurantLogo = settings.logo || restaurantLogo;
            currentLanguage = settings.language || currentLanguage;
            document.getElementById('restaurant-logo').src = restaurantLogo;
        }

        loadMenu();
        updateLanguageDisplay();
    } catch (error) {
        console.error("Error loading initial data:", error);
    }
}

// دالة حفظ القائمة
async function saveMenu() {
    try {
        // عرض حالة التحميل
        document.getElementById('save-spinner').classList.remove('hidden');
        document.getElementById('save-text').classList.add('hidden');
        document.getElementById('save-text-ar').classList.add('hidden');
        document.getElementById('save-menu').disabled = true;

        const batch = db.batch();
        const menuRef = db.collection('menu');
        
        // حذف القائمة الحالية
        const snapshot = await menuRef.get();
        snapshot.forEach(doc => batch.delete(doc.ref));
        
        // إضافة العناصر الجديدة
        const allItems = [...menuData.breakfast, ...menuData.lunch, ...menuData.dinner];
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
        
        await batch.commit();
        
        // حفظ الإعدادات
        await db.collection('settings').doc('restaurant').set({
            logo: restaurantLogo,
            language: currentLanguage,
            lastUpdated: firebase.firestore.FieldValue.serverTimestamp()
        });
        
        return true;
    } catch (error) {
        console.error("Error saving menu:", error);
        return false;
    } finally {
        // إعادة تعيين زر الحفظ
        document.getElementById('save-spinner').classList.add('hidden');
        document.getElementById(currentLanguage === 'fr' ? 'save-text' : 'save-text-ar
