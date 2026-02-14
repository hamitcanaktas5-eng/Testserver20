// Platform seç
function selectApi(api) {
    document.querySelectorAll('.platform-card').forEach(c => c.classList.remove('active'));
    const card = document.getElementById('pc-' + api);
    if (card) card.classList.add('active');
    document.getElementById('apiSelect').value = api;
    updatePrice();
}

// Sidebar toggle
function toggleSidebar() {
    document.getElementById('sidebar').classList.toggle('open');
    document.getElementById('overlay').classList.toggle('active');
}

// Fiyat güncelle
function updatePrice() {
    const api     = document.getElementById('apiSelect').value;
    const svcEl   = document.getElementById('serviceSelect');
    const service = svcEl ? svcEl.value : '';
    const priceBox = document.getElementById('priceBox');
    const buyBtn   = document.getElementById('buyBtn');
    const priceVal = document.getElementById('priceValue');

    if (api && service && svcEl.selectedIndex > 0) {
        const price = parseFloat(svcEl.options[svcEl.selectedIndex].dataset.price) || 0;
        if (priceVal) priceVal.textContent = '₺' + price.toFixed(2);
        if (priceBox) priceBox.classList.add('show');
        if (buyBtn) buyBtn.disabled = false;
    } else {
        if (priceBox) priceBox.classList.remove('show');
        if (buyBtn) buyBtn.disabled = true;
    }
}

// Sipariş ver
async function handleOrder() {
    const apiEl  = document.getElementById('apiSelect');
    const svcEl  = document.getElementById('serviceSelect');
    const api    = apiEl.value;
    const service = svcEl.value;

    if (!api || !service) return;

    const price    = parseFloat(svcEl.options[svcEl.selectedIndex].dataset.price);
    const apiName  = apiEl.options[apiEl.selectedIndex].text.trim();
    const svcName  = svcEl.options[svcEl.selectedIndex].text.trim();
    const orderId  = 'VN' + Date.now();

    // TODO: Firebase bakiye kontrolü
    const balance = 0;
    if (balance < price) {
        await RoxyUI.alert('Yetersiz Bakiye', 'Bu işlemi gerçekleştirmek için yeterli bakiyeniz bulunmuyor.<br><br>Bakiye eklemek için yönlendiriliyorsunuz.', 'warning');
        window.location.href = 'balance.html';
        return;
    }

    const ok = await RoxyUI.confirm('Sipariş Onayı', 'Siparişi onaylamak istiyor musunuz?', 'Onayla', 'İptal');

    if (ok) {
        const msg = encodeURIComponent(
            `Merhaba, sipariş numaram: ${orderId}\nAPI: ${apiName}\nServis: ${svcName}`
        );
        window.open(`https://wa.me/447795203704?text=${msg}`, '_blank');
        RoxyUI.toast('Siparişiniz alındı! WhatsApp üzerinden iletişime geçilecektir.', 'info');
        apiEl.value = ''; svcEl.value = '';
        updatePrice();
    }
}
