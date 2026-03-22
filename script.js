// --- قاعدة البيانات الوهمية (مصفوفات) ---
let materials = [
    { id: 1, name: "غسالة سامسونج", buy: 300000, cash: 350000, p10: 400000, p12: 430000 },
    { id: 2, name: "ثلاجة إل جي", buy: 500000, cash: 580000, p10: 650000, p12: 690000 }
];

let customers = [
    { id: 1, name: "أحمد علي", phone: "07701234567", notes: "زبون قديم", date: "2023-01-10", totalDebt: 400000, isLate: false, transactions: [] },
    { id: 2, name: "مصطفى حسين", phone: "07809876543", notes: "موظف", date: "2023-05-20", totalDebt: 650000, isLate: true, transactions: [] }
];

// --- نظام النوافذ المنبثقة المخصص ---
function showModal({ type, message, defaultValue = '' }) {
    return new Promise((resolve) => {
        const modal = document.getElementById('customModal');
        const modalText = document.getElementById('modalText');
        const modalInput = document.getElementById('modalInput');
        const modalButtons = document.getElementById('modalButtons');

        modalText.innerText = typeof message === 'string' ? message : '';
        modalButtons.innerHTML = '';
        modalInput.style.display = 'none';
        modalInput.value = defaultValue;

        const closeAction = (val) => {
            modal.classList.remove('active');
            setTimeout(() => { 
                const existingForm = document.getElementById('modalForm');
                if(existingForm) existingForm.remove();
                resolve(val); 
            }, 300);
        };

        if (type === 'alert') {
            const btn = document.createElement('button');
            btn.className = 'btn-modal btn-modal-confirm';
            btn.innerText = 'موافق (Enter)';
            btn.onclick = () => closeAction(true);
            modalButtons.appendChild(btn);

            window.addEventListener('keydown', function onKey(e) {
                if (e.key === 'Enter' && modal.classList.contains('active')) {
                    window.removeEventListener('keydown', onKey);
                    btn.click();
                }
            });
        } 
        else if (type === 'confirm') {
            const btnYes = document.createElement('button');
            btnYes.className = 'btn-modal btn-modal-confirm';
            btnYes.innerText = 'موافق (Enter)';
            btnYes.onclick = () => closeAction(true);

            const btnNo = document.createElement('button');
            btnNo.className = 'btn-modal btn-modal-cancel';
            btnNo.innerText = 'إلغاء';
            btnNo.onclick = () => closeAction(false);

            modalButtons.appendChild(btnYes);
            modalButtons.appendChild(btnNo);

            window.addEventListener('keydown', function onKey(e) {
                if (e.key === 'Enter' && modal.classList.contains('active')) {
                    window.removeEventListener('keydown', onKey);
                    btnYes.click();
                }
            });
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
                if (e.key === 'Enter') btnYes.click();
            };

            setTimeout(() => modalInput.focus(), 300);
        }
        else if (type === 'form') {
            const formContainer = document.createElement('div');
            formContainer.id = 'modalForm';
            
            message.fields.forEach(f => {
                if (f.type === 'select') {
                    let optionsHtml = f.options.map(o => `<option value="${o.value}">${o.text}</option>`).join('');
                    formContainer.innerHTML += `
                        <div class="modal-form-group">
                            <label>${f.label}</label>
                            <select id="${f.id}">${optionsHtml}</select>
                        </div>
                    `;
                } else {
                    formContainer.innerHTML += `
                        <div class="modal-form-group">
                            <label>${f.label}</label>
                            <input type="${f.type || 'text'}" id="${f.id}" ${f.readonly ? 'readonly' : ''} value="${f.value || ''}">
                        </div>
                    `;
                }
            });

            modalText.innerText = message.title;
            modalText.after(formContainer);

            const btnYes = document.createElement('button');
            btnYes.className = 'btn-modal btn-modal-confirm';
            btnYes.innerText = 'حفظ (Enter)';
            btnYes.onclick = () => {
                let results = {};
                message.fields.forEach(f => { results[f.id] = document.getElementById(f.id).value; });
                closeAction(results);
            };

            const btnNo = document.createElement('button');
            btnNo.className = 'btn-modal btn-modal-cancel';
            btnNo.innerText = 'إلغاء';
            btnNo.onclick = () => closeAction(null);

            modalButtons.appendChild(btnYes);
            modalButtons.appendChild(btnNo);

            formContainer.addEventListener('keydown', function(e) {
                if (e.key === 'Enter') btnYes.click();
            });

            setTimeout(() => {
                let firstInput = document.getElementById(message.fields[0].id);
                if(firstInput && !firstInput.readOnly) firstInput.focus();
            }, 300);
        }

        modal.classList.add('active');
    });
}

async function customAlert(msg) { return await showModal({ type: 'alert', message: msg }); }
async function customConfirm(msg) { return await showModal({ type: 'confirm', message: msg }); }
async function customPrompt(msg, def = '') { return await showModal({ type: 'prompt', message: msg, defaultValue: def }); }

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
                <td>${Number(c.totalDebt).toLocaleString()} دينار</td>
                <td class="action-btns">
                    <button class="btn btn-success" onclick="payInstallment(${c.id})">تسديد</button>
                    <button class="btn btn-danger" onclick="addNewDebt(${c.id})">دين جديد</button>
                    <button class="btn btn-warning" onclick="cancelInstallment(${c.id})">إلغاء التسديد</button>
                </td>
                <td class="action-btns">
                    <button class="btn btn-primary" onclick="showDetails(${c.id})">تفاصيل</button>
                    <button class="btn btn-warning" onclick="editCustomer(${c.id})">تعديل</button>
                    <button class="btn btn-primary" onclick="showStatement(${c.id})">كشف حساب</button>
                </td>
            </tr>
        `;
    });
}

async function addCustomer() {
    let res = await showModal({
        type: 'form',
        message: {
            title: 'إضافة زبون جديد',
            fields: [
                {id: 'name', label: 'اسم الزبون'},
                {id: 'notes', label: 'تفاصيل / ملاحظات'},
                {id: 'date', type: 'date', label: 'التاريخ', value: new Date().toISOString().split('T')[0]}
            ]
        }
    });
    
    if (!res || !res.name) return;
    
    customers.push({ 
        id: Date.now(), 
        name: res.name, 
        phone: "-", 
        notes: res.notes, 
        date: res.date, 
        totalDebt: 0, 
        isLate: false, 
        transactions: [] 
    });
    
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
    
    let res = await showModal({
        type: 'form',
        message: {
            title: 'تسديد دفعة',
            fields: [
                {id: 'total', label: 'المبلغ الكلي', value: customer.totalDebt, readonly: true},
                {id: 'amount', label: 'مبلغ التسديد', type: 'number'},
                {id: 'date', label: 'التاريخ', type: 'date', value: new Date().toISOString().split('T')[0]},
                {id: 'notes', label: 'ملاحظات'}
            ]
        }
    });
    
    if (!res || !res.amount) return;

    let payAmount = Number(res.amount);
    customer.totalDebt -= payAmount;
    customer.transactions.push({ type: 'تسديد', amount: payAmount, date: res.date, notes: res.notes });
    customer.isLate = false;
    
    renderCustomers();
    customAlert(`تم تسديد مبلغ ${payAmount.toLocaleString()} دينار للزبون ${customer.name} بنجاح!`);
}

async function addNewDebt(id) {
    let customer = customers.find(c => c.id === id);
    
    let res = await showModal({
        type: 'form',
        message: {
            title: 'إضافة دين جديد',
            fields: [
                {id: 'amount', label: 'المبلغ', type: 'number'},
                {id: 'details', label: 'التفاصيل / ملاحظات'}
            ]
        }
    });
    
    if (!res || !res.amount) return;

    let debtAmount = Number(res.amount);
    customer.totalDebt += debtAmount;
    let today = new Date().toISOString().split('T')[0];
    customer.transactions.push({ type: 'دين جديد', amount: debtAmount, date: today, notes: res.details });
    
    renderCustomers();
    customAlert(`تمت إضافة دين بقيمة ${debtAmount.toLocaleString()} دينار للزبون ${customer.name} بنجاح!`);
}

async function showDetails(id) {
    let customer = customers.find(c => c.id === id);
    let detailsText = customer.transactions.map(t => `📅 التاريخ: ${t.date}\nالنوع: ${t.type}\nالمبلغ: ${Number(t.amount).toLocaleString()} دينار\nالتفاصيل: ${t.notes}`).join('\n-----------------\n');
    let msg = `تفاصيل الزبون: ${customer.name}\n\nفهرس وتفاصيل الحركات:\n\n${detailsText || 'لا توجد تفاصيل حالياً'}`;
    await customAlert(msg);
}

async function cancelInstallment(id) {
    let customer = customers.find(c => c.id === id);
    let payments = customer.transactions.filter(t => t.type === 'تسديد');
    
    if (payments.length === 0) {
        await customAlert("لا يوجد تسديدات سابقة لإلغائها.");
        return;
    }

    let res = await showModal({
        type: 'form',
        message: {
            title: 'إلغاء التسديد',
            fields: [
                {
                    id: 'paymentToCancel', 
                    label: 'الأشهر المسددة (اختر للإلغاء)', 
                    type: 'select', 
                    options: payments.map((p, index) => ({value: index, text: `تاريخ: ${p.date} - مبلغ: ${Number(p.amount).toLocaleString()} دينار`}))
                }
            ]
        }
    });
    
    if (res && res.paymentToCancel !== null && res.paymentToCancel !== "") {
        let pIndex = Number(res.paymentToCancel);
        let payment = payments[pIndex];
        
        customer.totalDebt += payment.amount;
        
        let exactIndex = customer.transactions.indexOf(payment);
        if(exactIndex > -1) {
            customer.transactions.splice(exactIndex, 1);
        }
        
        renderCustomers();
        customAlert("تم إلغاء التسديد وإرجاع المبلغ للرصيد بنجاح!");
    }
}

async function showStatement(id) {
    let customer = customers.find(c => c.id === id);
    let transText = customer.transactions.filter(t => t.type !== 'تسديد').map(t => `📅 ${t.date} | ${t.type}: ${Number(t.amount).toLocaleString()} | ملاحظات: ${t.notes}`).join('\n');
    let msg = `كشف حساب الزبون:\n\nالاسم: ${customer.name}\nرقم الهاتف: ${customer.phone}\nالرصيد الكلي المتبقي: ${Number(customer.totalDebt).toLocaleString()} دينار\n\nسجل العمليات:\n${transText || 'لا توجد عمليات مسجلة'}`;
    await customAlert(msg);
}

async function showLateCustomers() {
    let lateList = customers.filter(c => c.isLate).map(c => c.name).join("\n- ");
    if (lateList) {
        await customAlert("قائمة الزبائن المتأخرين:\n\n- " + lateList);
    } else {
        await customAlert("لا يوجد زبائن متأخرين حالياً.");
    }
}

window.onload = function() {
    renderMaterials();
    renderCustomers();
};
