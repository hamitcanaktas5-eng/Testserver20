// ─── VERİ ───
const SERVICES = {
    instagram: {
        takipci: {
            label: 'Takipçi',
            pricePerK: 100,   // 1000 başına ₺
            min: 200,
            max: 10000,
            status: 'active'
        },
        begeni: {
            label: 'Beğeni',
            pricePerK: 100,
            min: 500,
            max: 50000,
            status: 'active'
        },
        izlenme: {
            label: 'İzlenme',
            pricePerK: 0,
            min: 0,
            max: 0,
            status: 'maintenance'
        }
    },
    tiktok: {
        takipci: {
            label: 'Takipçi',
            pricePerK: 150,
            min: 350,
            max: 35000,
            status: 'active'
        },
        begeni: {
            label: 'Beğeni',
            pricePerK: 80,
            min: 200,
            max: 100000,
            status: 'active'
        },
        izlenme: {
            label: 'İzlenme',
            pricePerK: 0,
            min: 0,
            max: 0,
            status: 'maintenance'
        }
    }
};

// ─── MESAİ KONTROLÜ ───
function isWorkingHours() {
    const now   = new Date();
    const day   = now.getDay(); // 0=Pazar, 1-5=Hafta içi, 6=Cumartesi
    const hour  = now.getHours();
    const min   = now.getMinutes();
    const time  = hour + min / 60; // Ondalıklı saat

    const isWeekend = (day === 0 || day === 6);

    if (isWeekend) return true;           // Hafta sonu 7/24
    return (time >= 17 && time < 24);     // Hafta içi 17:00-00:00
}

// ─── MESAİ KARTI GÜNCELLE ───
function updateScheduleCard() {
    const card      = document.getElementById('scheduleCard');
    const icon      = document.getElementById('scheduleIcon');
    const title     = document.getElementById('scheduleTitle');
    const text      = document.getElementById('scheduleText');
    const working   = isWorkingHours();

    card.className  = 'schedule-card show';

    if (working) {
        card.classList.add('mesai-ici');
        icon.innerHTML  = '<i class="fas fa-check-circle"></i>';
        title.textContent = 'Mesai Saatlerindeyiz ✓';
        text.textContent  = 'Siparişiniz en geç 30 dakika içinde başlayacaktır.';
    } else {
        card.classList.add('mesai-disi');
        icon.innerHTML  = '<i class="fas fa-moon"></i>';
        title.textContent = 'Mesai Saati Dışı';
        text.innerHTML    =
            'Siparişiniz alınacak ve aşağıdaki mesai saatlerinde başlayacaktır:<br><br>' +
            '📅 <strong>Hafta içi:</strong> 17:00 – 00:00<br>' +
            '📅 <strong>Hafta sonu:</strong> 7/24 aktif';
    }
}

// ─── SİDEBAR ───
function toggleSidebar() {
    document.getElementById('sidebar').classList.toggle('open');
    document.getElementById('overlay').classList.toggle('active');
}

// ─── API DEĞİŞTİ ───
function selectPlatform(api) {
    // Kart seçimi
    document.querySelectorAll('.platform-card').forEach(c => c.classList.remove('active'));
    const card = document.getElementById('pc-' + api);
    if (card) card.classList.add('active');

    // Hidden input güncelle
    document.getElementById('apiSelect').value = api;

    // onApiChange'i çağır
    onApiChange();
}

function onApiChange() {
    const api = document.getElementById('apiSelect').value;
    const api = document.getElementById('apiSelect').value;
    const svcSel = document.getElementById('serviceSelect');

    svcSel.innerHTML = '<option value="">— Seçiniz —</option>';
    document.getElementById('amountGroup').style.display = 'none';
    hidePriceBox();
    hideScheduleCard();
    document.getElementById('buyBtn').disabled = true;

    if (!api) { svcSel.disabled = true; return; }

    svcSel.disabled = false;
    const opts = SERVICES[api];
    for (const key in opts) {
        const s = opts[key];
        const opt = document.createElement('option');
        opt.value = key;
        const icons = { takipci: '👥', begeni: '❤️', izlenme: '▶️' };
        if (s.status === 'maintenance') {
            opt.textContent = icons[key] + ' ' + s.label + ' (🔧 Bakımda)';
            opt.disabled = true;
        } else {
            opt.textContent = icons[key] + ' ' + s.label;
        }
        svcSel.appendChild(opt);
    }
}

// ─── SERVİS DEĞİŞTİ ───
function onServiceChange() {
    const api     = document.getElementById('apiSelect').value;
    const svc     = document.getElementById('serviceSelect').value;
    const amGroup = document.getElementById('amountGroup');
    const amInput = document.getElementById('amountInput');
    const amHint  = document.getElementById('amountHint');

    hidePriceBox();
    hideScheduleCard();
    document.getElementById('buyBtn').disabled = true;
    document.getElementById('amountInfo').textContent = '';

    if (!api || !svc) { amGroup.style.display = 'none'; return; }

    const s = SERVICES[api][svc];
    amHint.textContent = `Min ${s.min.toLocaleString('tr-TR')} – Maks ${s.max.toLocaleString('tr-TR')}`;
    amInput.min   = s.min;
    amInput.max   = s.max;
    amInput.value = '';
    amGroup.style.display = 'flex';
    setTimeout(() => amInput.focus(), 100);
}

// ─── MİKTAR DEĞİŞTİ ───
function onAmountChange() {
    const api     = document.getElementById('apiSelect').value;
    const svc     = document.getElementById('serviceSelect').value;
    const amount  = parseInt(document.getElementById('amountInput').value) || 0;
    const infoEl  = document.getElementById('amountInfo');

    hidePriceBox();
    hideScheduleCard();
    document.getElementById('buyBtn').disabled = true;
    infoEl.className = 'amount-info';
    infoEl.textContent = '';

    if (!api || !svc || !amount) return;

    const s = SERVICES[api][svc];

    if (amount < s.min) {
        infoEl.className = 'amount-info error';
        infoEl.textContent = `⚠ En az ${s.min.toLocaleString('tr-TR')} girilmelidir.`;
        return;
    }
    if (amount > s.max) {
        infoEl.className = 'amount-info error';
        infoEl.textContent = `⚠ En fazla ${s.max.toLocaleString('tr-TR')} girilebilir.`;
        return;
    }

    infoEl.className = 'amount-info ok';
    infoEl.textContent = `✓ Geçerli miktar`;

    // Fiyat hesapla
    const total = (amount / 1000) * s.pricePerK;
    showPriceBox(s, amount, total);
    updateScheduleCard();
    document.getElementById('buyBtn').disabled = false;
}

// ─── FİYAT KUTUSU ───
function showPriceBox(s, amount, total) {
    const box = document.getElementById('priceBox');
    document.getElementById('priceTotal').textContent =
        '₺' + total.toFixed(2);
    box.classList.add('show');
}
function hidePriceBox() {
    document.getElementById('priceBox').classList.remove('show');
}
function hideScheduleCard() {
    const c = document.getElementById('scheduleCard');
    c.classList.remove('show', 'mesai-ici', 'mesai-disi');
}

// ─── SİPARİŞ VER ───
async function handleOrder() {
    const api    = document.getElementById('apiSelect').value;
    const svc    = document.getElementById('serviceSelect').value;
    const amount = parseInt(document.getElementById('amountInput').value) || 0;

    if (!api || !svc || !amount) return;

    const s       = SERVICES[api][svc];
    const total   = (amount / 1000) * s.pricePerK;
    const orderId = 'SMM' + Date.now();

    // TODO: Firebase'den bakiye kontrolü
    const balance = 0;
    if (balance < total) {
        RoxyUI.alert('Yetersiz Bakiye', 'Sipariş vermek için yeterli bakiyeniz bulunmuyor.', 'warning').then(() => {
            window.location.href = 'balance.html';
        });
        return;
    }

    const apiName = document.getElementById('apiSelect').options[document.getElementById('apiSelect').selectedIndex].text.trim();
    const svcName = s.label;
    const working = isWorkingHours();
    const timeMsg = working
        ? 'Siparişiniz en geç 30 dakika içinde başlayacaktır.'
        : 'Siparişiniz mesai saatlerinde başlayacaktır.';

    const ok = await RoxyUI.confirm(
        'Sipariş Özeti',
        `Platform: <strong>${apiName}</strong><br>Servis: <strong>${svcName}</strong><br>Miktar: <strong>${amount.toLocaleString('tr-TR')}</strong><br>Tutar: <strong>₺${total.toFixed(2)}</strong><br><br>Sipariş No: <strong>${orderId}</strong><br><br>${timeMsg}`,
        'Onayla', 'İptal'
    );

    if (ok) {
        // TODO: Firebase – bakiye düş, sipariş kaydet
        RoxyUI.toast('Siparişiniz alındı! No: ' + orderId, 'success', 5000);

        // Reset
        document.getElementById('apiSelect').value    = '';
        document.getElementById('serviceSelect').value = '';
        document.getElementById('serviceSelect').disabled = true;
        document.getElementById('serviceSelect').innerHTML = '<option value="">— Önce API seçin —</option>';
        document.getElementById('amountGroup').style.display = 'none';
        document.getElementById('amountInput').value = '';
        document.getElementById('amountInfo').textContent = '';
        hidePriceBox();
        hideScheduleCard();
        document.getElementById('buyBtn').disabled = true;
    }
}
