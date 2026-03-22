// --- قاعدة البيانات الوهمية (مصفوفات) ---
let materials = [
    { id: 1, name: "غسالة سامسونج", buy: 300, cash: 350, p10: 400, p12: 430 },
    { id: 2, name: "ثلاجة إل جي", buy: 500, cash: 580, p10: 650, p12: 690 }
];

let customers = [
    { id: 1, name: "أحمد علي", phone: "07701234567", paidMonths: 2, isLate: false },
    { id: 2, name: "مصطفى حسين", phone: "07809876543", paidMonths: 0, isLate: true }
];

// --- نظام النوافذ المنبثقة المخصص (بديل alert, confirm, prompt) ---
function showModal({ type, message, defaultValue = '' }) {
    return new Promise((resolve) => {
        const modal = document.getElementById('customModal');
        const modalText = document.getElementById('modalText');
        const modalInput = document.getElementById('modalInput');
        const modalButtons = document.getElementById('modalButtons');

        modalText.innerText = message;
        modalButtons.innerHTML = '';
        modalInput.style.display = 'none';
        modalInput.value = defaultValue;

        const closeAction = (val) => {
            modal.classList.remove('active');
            setTimeout(() => { resolve(val); }, 300); // الانتظار حتى انتهاء الأنيميشن
        };

        if (type === 'alert') {
            const btn = document.createElement('button');
            btn.className = 'btn-modal btn-modal-confirm';
            btn.innerText = 'موافق';
            btn.onclick = () => closeAction(true);
            modalButtons.appendChild(btn);
        } 
        else if (type === 'confirm') {
            const btnYes = document.createElement('button');
            btnYes.className = 'btn-modal btn-modal-confirm';
            btnYes.innerText = 'موافق';
            btnYes.onclick = () => closeAction(true);

            const btnNo = document.createElement('button');
            btnNo.className = 'btn-modal btn-modal-cancel';
            btnNo.innerText = 'إلغاء';
            btnNo.onclick = () => closeAction(false);

            modalButtons.appendChild(btnYes);
            modalButtons.appendChild(btnNo);
        } 
        else if (type === 'prompt') {
            modalInput.style.display = 'block';
            
            const btnYes = document.createElement('button');
            btnYes.className = 'btn-modal btn-modal-confirm';
            btnYes.innerText = 'حفظ (Enter)';
            btnYes.onclick = () => closeAction(modalInput.value);

            const btnNo = document.createElement('button');
            btnNo.className = 'btn-modal btn-modal-cancel';
            btnNo.innerText = 'إلغاء';
            btnNo.onclick = () => closeAction(null);

            modalButtons.appendChild(btnYes);
            modalButtons.appendChild(btnNo);

            modalInput.onkeydown = function(e) {
                if (e.key === 'Enter') {
                    btnYes.click();
                }
            };

            // تركيز المؤشر داخل الحقل بعد ظهور النافذة
            setTimeout(() => modalInput.focus(), 300);
        }

        modal.classList.add('active');
    });
}

// اختصارات سهلة الاستخدام للدوال
async function customAlert(msg) { return await showModal({ type: 'alert', message: msg }); }
async function customConfirm(msg) { return await showModal({ type: 'confirm', message: msg }); }
async function customPrompt(msg, def = '') { return await showModal({ type: 'prompt', message: msg, defaultValue: def }); }


// --- التبديل بين الواجهات ---
function switchPage(pageId, btnElement) {
    document.querySelectorAll('.page-section').forEach(page => page.classList.remove('active'));
    document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.remove('active'));
    document.getElementById(pageId).classList.add('active');
    btnElement.classList.add('active');
}

// --- وظائف إدارة المواد ---
function renderMaterials() {
    const tbody = document.getElementById('materialsTableBody');
    tbody.innerHTML = '';
    materials.forEach(m => {
        tbody.innerHTML += `
            <tr>
                <td>${m.name}</td>
                <td>${Number(m.buy).toLocaleString()} دينار</td>
                <td>${Number(m.cash).toLocaleString()} دينار</td>
                <td>${Number(m.p10).toLocaleString()} دينار</td>
                <td>${Number(m.p12).toLocaleString()} دينار</td>
                <td class="action-btns">
                    <button class="btn btn-warning" onclick="editMaterial(${m.id})">تعديل</button>
                    <button class="btn btn-danger" onclick="deleteMaterial(${m.id})">حذف</button>
                </td>
            </tr>
        `;
    });
}

async function addMaterial() {
    let name = await customPrompt("أدخل اسم المادة الجديدة:");
    if (!name) return;
    let buy = await customPrompt("سعر الشراء (دينار):") || 0;
    let cash = await customPrompt("سعر البيع نقداً (دينار):") || 0;
    let p10 = await customPrompt("سعر القسط لـ 10 أشهر (دينار):") || 0;
    let p12 = await customPrompt("سعر القسط لـ 12 شهر (دينار):") || 0;
    
    materials.push({ id: Date.now(), name, buy, cash, p10, p12 });
    renderMaterials();
    customAlert("تمت إضافة المادة بنجاح!");
}

async function editMaterial(id) {
    let material = materials.find(m => m.id === id);
    
    let newName = await customPrompt("تعديل اسم المادة:", material.name);
    if (newName === null) return;
    
    let newBuy = await customPrompt("تعديل سعر الشراء (دينار):", material.buy);
    if (newBuy === null) return;
    
    let newCash = await customPrompt("تعديل البيع نقداً (دينار):", material.cash);
    if (newCash === null) return;
    
    let newP10 = await customPrompt("تعديل قسط (10 أشهر) (دينار):", material.p10);
    if (newP10 === null) return;
    
    let newP12 = await customPrompt("تعديل قسط (12 شهر) (دينار):", material.p12);
    if (newP12 === null) return;

    material.name = newName;
    material.buy = newBuy;
    material.cash = newCash;
    material.p10 = newP10;
    material.p12 = newP12;

    renderMaterials();
    customAlert("تم تعديل المادة بنجاح!");
}

async function deleteMaterial(id) {
    if (await customConfirm("هل أنت متأكد من حذف هذه المادة؟")) {
        materials = materials.filter(m => m.id !== id);
        renderMaterials();
        customAlert("تم الحذف بنجاح!");
    }
}

// --- وظائف إدارة الزبائن والأقساط ---
function renderCustomers() {
    const tbody = document.getElementById('customersTableBody');
    tbody.innerHTML = '';
    customers.forEach(c => {
        let statusBadge = c.isLate ? '<span class="badge late">متأخر</span>' : '<span class="badge">منتظم</span>';
        tbody.innerHTML += `
            <tr>
                <td>${c.name} ${statusBadge}</td>
                <td>${c.phone}</td>
                <td>${c.paidMonths} أشهر</td>
                <td class="action-btns">
                    <button class="btn btn-success" onclick="payInstallment(${c.id})">تسديد قسط</button>
                    <button class="btn btn-danger" onclick="cancelInstallment(${c.id})">إلغاء التسديد</button>
                </td>
                <td class="action-btns">
                    <button class="btn btn-warning" onclick="editCustomer(${c.id})">تعديل</button>
                    <button class="btn btn-primary" onclick="showStatement(${c.id})">كشف حساب</button>
                </td>
            </tr>
        `;
    });
}

async function addCustomer() {
    let name = await customPrompt("أدخل اسم الزبون الجديد:");
    if (!name) return;
    let phone = await customPrompt("أدخل رقم الهاتف:");
    customers.push({ id: Date.now(), name, phone, paidMonths: 0, isLate: false });
    renderCustomers();
    customAlert("تمت إضافة الزبون بنجاح!");
}

async function editCustomer(id) {
    let customer = customers.find(c => c.id === id);
    let newName = await customPrompt("تعديل اسم الزبون:", customer.name);
    if (newName) {
        customer.name = newName;
        renderCustomers();
        customAlert("تم تعديل بيانات الزبون بنجاح!");
    }
}

async function payInstallment(id) {
    let customer = customers.find(c => c.id === id);
    customer.paidMonths += 1;
    customer.isLate = false; 
    renderCustomers();
    customAlert(`تم تسديد القسط للزبون ${customer.name} بنجاح!`);
}

async function cancelInstallment(id) {
    let customer = customers.find(c => c.id === id);
    if (customer.paidMonths > 0) {
        if(await customConfirm(`هل أنت متأكد من إلغاء آخر تسديد للزبون ${customer.name}؟`)){
            customer.paidMonths -= 1;
            renderCustomers();
            customAlert("تم إلغاء التسديد بنجاح.");
        }
    } else {
        customAlert("لا يوجد أقساط مسددة لإلغائها.");
    }
}

async function showStatement(id) {
    let customer = customers.find(c => c.id === id);
    await customAlert(`كشف حساب الزبون:\n\nالاسم: ${customer.name}\nرقم الهاتف: ${customer.phone}\nعدد الأقساط المسددة: ${customer.paidMonths} أشهر\nحالة الدفع: ${customer.isLate ? 'متأخر ⚠️' : 'منتظم ✅'}`);
}

async function showLateCustomers() {
    let lateList = customers.filter(c => c.isLate).map(c => c.name).join("\n- ");
    if (lateList) {
        await customAlert("قائمة الزبائن المتأخرين:\n\n- " + lateList);
    } else {
        await customAlert("لا يوجد زبائن متأخرين حالياً. الجميع مسدد!");
    }
}

// تشغيل دوال العرض عند تحميل الصفحة أول مرة
window.onload = function() {
    renderMaterials();
    renderCustomers();
};
