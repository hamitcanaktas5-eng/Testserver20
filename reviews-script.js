// ─── DEMO VERİLER (Firebase'den gelecek) ───
const DEMO_REVIEWS = [
    {
        id: 1,
        name: 'Ahmet K.',
        email: 'ahmet@test.com',
        rating: 5,
        text: 'Hızlı ve güvenilir hizmet. Siparişim anında tamamlandı, çok memnun kaldım. Kesinlikle tavsiye ederim!',
        date: '2 gün önce',
        status: 'replied',
        reply: 'Memnuniyetiniz bizim için çok değerli! Tekrar bekleriz 🙏'
    },
    {
        id: 2,
        name: 'Mehmet Y.',
        email: 'mehmet@test.com',
        rating: 5,
        text: 'Destek ekibi çok ilgili, her sorumda yardımcı oldular. Roxy Store\'u herkese öneririm.',
        date: '5 gün önce',
        status: 'approved',
        reply: null
    },
    {
        id: 3,
        name: 'Zeynep S.',
        email: 'zeynep@test.com',
        rating: 4,
        text: 'Fiyatlar uygun ve kaliteli hizmet. Tek eksi bazen yoğunluktan kaynaklı gecikmeler oluyor ama sonuçta çözülüyor.',
        date: '1 hafta önce',
        status: 'replied',
        reply: 'Geri bildiriminiz için teşekkürler! Yoğun dönemlerde yaşanan gecikmeleri minimize etmek için çalışıyoruz.'
    },
    {
        id: 4,
        name: 'Can T.',
        email: 'can@test.com',
        rating: 5,
        text: 'TikTok takipçi aldım, çok hızlı geldi. Kaliteli takipçiler, düşmedi. Süper!',
        date: '1 hafta önce',
        status: 'approved',
        reply: null
    },
    {
        id: 5,
        name: 'Selin A.',
        email: 'selin@test.com',
        rating: 5,
        text: 'WhatsApp sanal numara hizmetinden yararlandım. Gerçekten çok pratik ve güvenilir. Teşekkürler Roxy Store!',
        date: '2 hafta önce',
        status: 'replied',
        reply: 'Güveniniz için teşekkürler, her zaman hizmetinizdeyiz! 🚀'
    }
];

// Avatar renkleri
const AVATAR_COLORS = [
    'linear-gradient(135deg,#00D9FF,#A855F7)',
    'linear-gradient(135deg,#A855F7,#EC4899)',
    'linear-gradient(135deg,#00FF88,#00D9FF)',
    'linear-gradient(135deg,#FFB800,#FF6584)',
    'linear-gradient(135deg,#EC4899,#A855F7)'
];

// ─── SİDEBAR ───
function toggleSidebar() {
    document.getElementById('sidebar').classList.toggle('open');
    document.getElementById('overlay').classList.toggle('active');
}

// ─── EKRAN GEÇİŞLERİ ───
function showMain() {
    document.getElementById('mainView').style.display      = 'block';
    document.getElementById('myReviewsView').style.display = 'none';
    document.getElementById('allReviewsView').style.display = 'none';
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function showMyReviews() {
    document.getElementById('mainView').style.display      = 'none';
    document.getElementById('myReviewsView').style.display = 'block';
    document.getElementById('allReviewsView').style.display = 'none';
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function showAllReviews() {
    document.getElementById('mainView').style.display       = 'none';
    document.getElementById('myReviewsView').style.display  = 'none';
    document.getElementById('allReviewsView').style.display = 'block';
    window.scrollTo({ top: 0, behavior: 'smooth' });

    // Tüm onaylanmış yorumları göster (demo)
    const approved = DEMO_REVIEWS.filter(r => r.status === 'approved' || r.status === 'replied');
    renderReviews('allReviewsList', approved, false);
}

// ─── YILDIZ PUANI ───
let currentRating = 0;

function setRating(val) {
    currentRating = val;
    document.querySelectorAll('.star').forEach((s, i) => {
        s.classList.toggle('active', i < val);
    });
    checkReviewForm();
}

// ─── FORM KONTROL ───
function checkReviewForm() {
    const name  = document.getElementById('reviewName').value.trim();
    const email = document.getElementById('reviewEmail').value.trim();
    const text  = document.getElementById('reviewText').value.trim();
    const valid = name.length >= 2 && email.includes('@') && text.length >= 10 && currentRating > 0;
    document.getElementById('btnSubmitReview').disabled = !valid;
}

function checkQueryForm() {
    const email = document.getElementById('queryEmail').value.trim();
    document.getElementById('btnQuery').disabled = !email.includes('@');
}

// ─── YORUM GÖNDER ───
function submitReview() {
    const name  = document.getElementById('reviewName').value.trim();
    const email = document.getElementById('reviewEmail').value.trim();
    const text  = document.getElementById('reviewText').value.trim();

    if (!name || !email || !text || !currentRating) return;

    // TODO: Firebase'e kaydet, admin onayına gönder
    const newReview = {
        id: Date.now(),
        name, email,
        rating: currentRating,
        text,
        date: 'Az önce',
        status: 'pending',
        reply: null
    };

    // Demo: Local olarak ekle
    DEMO_REVIEWS.unshift(newReview);

    // Formu sıfırla
    document.getElementById('reviewName').value  = '';
    document.getElementById('reviewEmail').value = '';
    document.getElementById('reviewText').value  = '';
    currentRating = 0;
    document.querySelectorAll('.star').forEach(s => s.classList.remove('active'));
    document.getElementById('btnSubmitReview').disabled = true;

    // Başarı mesajı
    RoxyUI.toast('Yorumunuz alındı! İncelendikten sonra yayınlanacaktır.', 'success');

    // Son yorumları yenile
    renderLatestReviews();
}

// ─── E-POSTA SORGULA ───
function queryReviews() {
    const email   = document.getElementById('queryEmail').value.trim().toLowerCase();
    const results = DEMO_REVIEWS.filter(r => r.email.toLowerCase() === email);

    document.getElementById('queryResults').style.display = 'block';
    document.getElementById('resultsCount').textContent   = results.length + ' yorum';

    if (results.length === 0) {
        document.getElementById('myReviewsList').innerHTML = `
            <div class="empty-state">
                <i class="fas fa-inbox"></i>
                <h4>Yorum bulunamadı</h4>
                <p>Bu e-posta adresiyle gönderilen yorum bulunamadı.</p>
            </div>`;
        return;
    }

    renderReviews('myReviewsList', results, true);

    setTimeout(() => {
        document.getElementById('queryResults').scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
}

// ─── YORUM RENDER ───
function renderReviews(containerId, reviews, showStatus) {
    const container = document.getElementById(containerId);
    if (!reviews.length) {
        container.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-comments"></i>
                <h4>Henüz yorum yok</h4>
                <p>İlk değerlendirmeyi siz yapın!</p>
            </div>`;
        return;
    }

    container.innerHTML = reviews.map((r, idx) => {
        const avatarBg  = AVATAR_COLORS[idx % AVATAR_COLORS.length];
        const initials  = r.name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0,2);
        const stars     = renderStars(r.rating);
        const statusBadge = showStatus ? renderStatus(r.status) : '';
        const replyHtml   = r.reply ? renderReply(r.reply) : '';

        return `
        <div class="review-card">
            <div class="review-top">
                <div class="reviewer">
                    <div class="reviewer-avatar" style="background:${avatarBg};">${initials}</div>
                    <div>
                        <div class="reviewer-name">${r.name}</div>
                        <div class="review-stars">${stars}</div>
                    </div>
                </div>
                <div style="display:flex;flex-direction:column;align-items:flex-end;gap:6px;">
                    <span class="review-date">${r.date}</span>
                    ${statusBadge}
                </div>
            </div>
            <p class="review-text">${r.text}</p>
            ${replyHtml}
        </div>`;
    }).join('');
}

function renderStars(rating) {
    let html = '';
    for (let i = 1; i <= 5; i++) {
        html += `<i class="fas fa-star${i <= rating ? '' : ' empty'}"></i>`;
    }
    return html;
}

function renderStatus(status) {
    const map = {
        pending:  { cls: 'status-pending',  icon: 'fa-clock',        label: 'Onay Bekliyor' },
        approved: { cls: 'status-approved', icon: 'fa-check-circle', label: 'Onaylandı' },
        replied:  { cls: 'status-replied',  icon: 'fa-reply',        label: 'Yanıtlandı' },
        rejected: { cls: 'status-rejected', icon: 'fa-times-circle', label: 'Reddedildi' }
    };
    const s = map[status] || map.pending;
    return `<span class="status-badge ${s.cls}"><i class="fas ${s.icon}"></i> ${s.label}</span>`;
}

function renderReply(replyText) {
    return `
    <div class="roxy-reply">
        <div class="roxy-reply-header">
            <span class="roxy-badge"><i class="fas fa-bolt"></i> ROXY STORE</span>
        </div>
        <p>${replyText}</p>
    </div>`;
}

// ─── SON YORUMLARI RENDER ET ───
function renderLatestReviews() {
    const approved = DEMO_REVIEWS
        .filter(r => r.status === 'approved' || r.status === 'replied')
        .slice(0, 5);
    renderReviews('latestReviews', approved, false);
}

// ─── TOAST MESAJI ───
function showSuccessToast(msg) {
    const toast = document.createElement('div');
    toast.style.cssText = `
        position:fixed; bottom:30px; left:50%; transform:translateX(-50%);
        background:linear-gradient(135deg,#00D9FF,#A855F7);
        color:#0A0A0F; padding:14px 28px; border-radius:12px;
        font-family:'Poppins',sans-serif; font-weight:700; font-size:14px;
        z-index:9999; box-shadow:0 10px 40px rgba(0,217,255,0.4);
        display:flex; align-items:center; gap:10px;
        animation: slideUp 0.4s ease;
        white-space:nowrap;
    `;
    toast.innerHTML = `<i class="fas fa-check-circle"></i> ${msg}`;
    document.body.appendChild(toast);
    setTimeout(() => { toast.style.opacity = '0'; toast.style.transition = 'opacity 0.5s'; setTimeout(() => toast.remove(), 500); }, 3500);
}

// ─── INIT ───
document.addEventListener('DOMContentLoaded', function () {
    renderLatestReviews();
});
