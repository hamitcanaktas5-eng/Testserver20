// ─── SİDEBAR ───
function toggleSidebar() {
    document.getElementById('sidebar').classList.toggle('open');
    document.getElementById('overlay').classList.toggle('active');
}

// ─── MESAİ KONTROLÜ ───
function isWorkingHours() {
    const now  = new Date();
    const day  = now.getDay();
    const time = now.getHours() + now.getMinutes() / 60;
    const isWeekend = (day === 0 || day === 6);
    if (isWeekend) return true;
    return (time >= 17 && time < 24);
}

// ─── YÖNTEM SEÇ ───
function selectMethod(method) {
    // Kartları güncelle
    document.querySelectorAll('.method-card').forEach(c => c.classList.remove('selected'));
    document.getElementById('card-' + method).classList.add('selected');

    // Formları gizle
    document.getElementById('form-payment').style.display = 'none';
    document.getElementById('form-iban').style.display    = 'none';

    // Seçilen formu göster
    const form = document.getElementById('form-' + method);
    form.style.display = 'block';

    // IBAN mesai durumunu render et
    if (method === 'iban') renderIbanSchedule();

    // OTOMATIK KAYDIRMA - forma git
    setTimeout(() => {
        form.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
}

// ─── IBAN MESAİ ───
function renderIbanSchedule() {
    const card    = document.getElementById('ibanSchedule');
    const icon    = document.getElementById('ibanScheduleIcon');
    const title   = document.getElementById('ibanScheduleTitle');
    const text    = document.getElementById('ibanScheduleText');
    const working = isWorkingHours();

    card.className = 'schedule-card ' + (working ? 'mesai-ici' : 'mesai-disi');

    if (working) {
        icon.innerHTML    = '<i class="fas fa-check-circle"></i>';
        title.textContent = 'Mesai Saatlerindeyiz ✓';
        text.textContent  = 'Dekontu gönderdikten sonra bakiyeniz en geç 30 dakika içinde yüklenecektir.';
    } else {
        icon.innerHTML    = '<i class="fas fa-moon"></i>';
        title.textContent = 'Mesai Saati Dışı';
        text.innerHTML    =
            'Dekontu şimdi gönderebilirsiniz, bakiyeniz aşağıdaki mesai saatlerinde onaylanacaktır:<br><br>' +
            '📅 <strong>Hafta içi:</strong> 17:00 – 00:00<br>' +
            '📅 <strong>Hafta sonu:</strong> 7/24 aktif';
    }
}

// ─── KOPYALAMA ───
function copyText(elementId, btn) {
    const text = document.getElementById(elementId).textContent;
    navigator.clipboard.writeText(text).then(() => showCopied(btn));
}

// İsim kopyalamada gerçek isim gönderilir, ekranda maskeli görünür
function copyRealName(btn) {
    const realName = 'Yağmur Tuncal';
    navigator.clipboard.writeText(realName).then(() => showCopied(btn));
}

function showCopied(btn) {
    const original = btn.innerHTML;
    btn.classList.add('copied');
    btn.innerHTML = '<i class="fas fa-check"></i>';
    setTimeout(() => {
        btn.classList.remove('copied');
        btn.innerHTML = original;
    }, 2500);
}

// ─── PRESET ───
function setPreset(amount, btn) {
    document.getElementById('paymentAmount').value = amount;
    document.querySelectorAll('.preset-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    onPaymentAmountChange();
}

// ─── ÖDEME TUTAR ───
function onPaymentAmountChange() {
    const val = parseFloat(document.getElementById('paymentAmount').value) || 0;
    document.getElementById('paymentTotal').textContent = '₺' + val.toFixed(2);
    document.getElementById('btnPay').disabled = val < 10;

    // Preset butonlarından active kaldır eğer elle girildiyse
    const presets = [50, 100, 250, 500];
    document.querySelectorAll('.preset-btn').forEach((b, i) => {
        b.classList.toggle('active', presets[i] === val);
    });
}

// ─── IBAN TUTAR ───
function onIbanAmountChange() {
    checkIbanForm();
}

// ─── DOSYA SEÇ ───
let selectedFile = null;

function onFileSelect(e) {
    selectedFile = e.target.files[0];
    if (!selectedFile) return;

    document.getElementById('uploadPlaceholder').style.display = 'none';
    document.getElementById('uploadPreview').style.display     = 'block';
    document.getElementById('fileName').textContent            = selectedFile.name;
    document.getElementById('uploadArea').classList.add('has-file');

    checkIbanForm();
}

function checkIbanForm() {
    const amount = parseFloat(document.getElementById('ibanAmount').value) || 0;
    document.getElementById('btnIban').disabled = !(amount >= 10 && selectedFile);
}

// ─── ÖDEME İŞLE ───
function handlePayment() {
    const amount = parseFloat(document.getElementById('paymentAmount').value) || 0;
    if (amount < 10) return;
    // TODO: Ödeme sağlayıcı entegrasyonu
    RoxyUI.alert('Bilgi', 'Ödeme sağlayıcı entegrasyonu yakında aktif olacaktır.', 'info');
}

// ─── IBAN İŞLE ───
async function handleIban() {
    const amount = parseFloat(document.getElementById('ibanAmount').value) || 0;
    if (amount < 10 || !selectedFile) return;

    const working = isWorkingHours();
    const timeMsg = working
        ? 'Bakiyeniz en geç <strong>30 dakika</strong> içinde yüklenecektir.'
        : 'Bakiyeniz mesai saatlerinde onaylanacaktır.<br>📅 Hafta içi 17:00–00:00 | Hafta sonu 7/24';

    const ok = await RoxyUI.confirm(
        'Dekont Gönder',
        `Tutar: <strong>₺${amount.toFixed(2)}</strong><br>Dosya: ${selectedFile.name}<br><br>${timeMsg}`,
        'Evet, Gönder',
        'İptal'
    );

    if (ok) {
        // TODO: Firebase Storage'a dekont yükle, admin'e bildirim
        RoxyUI.toast('Dekontun başarıyla gönderildi!', 'success');
        document.getElementById('ibanAmount').value             = '';
        document.getElementById('receiptFile').value            = '';
        selectedFile = null;
        document.getElementById('uploadPlaceholder').style.display = 'block';
        document.getElementById('uploadPreview').style.display     = 'none';
        document.getElementById('uploadArea').classList.remove('has-file');
        document.getElementById('btnIban').disabled = true;
    }
}
