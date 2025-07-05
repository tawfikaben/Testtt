// في قسم event listeners
document.addEventListener('click', async (e) => {
    if (e.target.id === 'save-menu') {
        try {
            // عرض رسالة تحميل
            const saveBtn = document.getElementById('save-menu');
            saveBtn.innerHTML = currentLanguage === 'fr' ? 
                '<i class="fas fa-spinner fa-spin"></i> Enregistrement...' : 
                '<i class="fas fa-spinner fa-spin"></i> جاري الحفظ...';
            saveBtn.disabled = true;

            // حفظ القائمة في Firebase
            const success = await saveMenu();
            
            if (success) {
                alert(currentLanguage === 'fr' ? 
                    "Menu enregistré avec succès!" : "تم حفظ القائمة بنجاح!");
                loadMenu(); // تحديث واجهة العميل
            } else {
                throw new Error("Save failed");
            }
        } catch (error) {
            console.error("Error saving menu:", error);
            alert(currentLanguage === 'fr' ? 
                "Erreur lors de l'enregistrement du menu" : "حدث خطأ أثناء حفظ القائمة");
        } finally {
            // إعادة تعيين زر الحفظ
            const saveBtn = document.getElementById('save-menu');
            saveBtn.innerHTML = currentLanguage === 'fr' ? 
                "Enregistrer le Menu" : "حفظ القائمة";
            saveBtn.disabled = false;
        }
    }
});

// دالة حفظ القائمة المعدلة
async function saveMenu() {
    try {
        const batch = db.batch();
        
        // حذف القائمة الحالية
        const menuSnapshot = await db.collection('menu').get();
        menuSnapshot.forEach(doc => {
            batch.delete(doc.ref);
        });
        
        // إضافة العناصر الجديدة
        const allItems = [
            ...menuData.breakfast,
            ...menuData.lunch,
            ...menuData.dinner
        ];
        
        allItems.forEach(item => {
            const newDocRef = db.collection('menu').doc(); // إنشاء معرف فريد
            batch.set(newDocRef, {
                id: newDocRef.id, // استخدام معرف الوثيقة كمعرف للعنصر
                name: item.name,
                name_ar: item.name_ar,
                price: item.price,
                category: item.category,
                image: item.image
            });
        });
        
        await batch.commit();
        return true;
    } catch (error) {
        console.error("Error saving menu:", error);
        return false;
    }
}
