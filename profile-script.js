// ─── RATE LİMİT (localStorage ile tutulur, Firebase'e taşınacak) ───
const RATE_LIMITS = {
    password: 7 * 24 * 60 * 60 * 1000,   // 1 hafta (ms)
    username: 30 * 24 * 60 * 60 * 1000   // 1 ay (ms)
};

// ─── GERİ GİT ───
function goBack() {
    if (document.referrer) {
        window.history.back();
    } else {
        window.location.href = 'dashboard.html';
    }
}

// ─── PANEL AÇ/KAPAT ───
async function showPanel(type) {
    // Rate limit kontrolü - async olduğu için await gerekiyor
    const allowed = await checkRateLimitAsync(type);
    if (!allowed) return;

    document.getElementById('profileMain').style.display = 'none';
    document.getElementById(type + 'Panel').style.display = 'block';
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function hidePanel() {
    document.querySelectorAll('.panel').forEach(p => p.style.display = 'none');
    document.getElementById('profileMain').style.display = 'block';
    window.scrollTo({ top: 0, behavior: 'smooth' });

    // Formları sıfırla
    resetForms();
}

// ─── RATE LİMİT KONTROL ───
function checkRateLimit(type) {
    const lastChange = localStorage.getItem('roxy_last_' + type);
    if (!lastChange) return true;
    const diff = Date.now() - parseInt(lastChange);
    return diff >= RATE_LIMITS[type];
}

async function checkRateLimitAsync(type) {
    const lastChange = localStorage.getItem('roxy_last_' + type);
    if (!lastChange) return true;

    const diff = Date.now() - parseInt(lastChange);
    if (diff < RATE_LIMITS[type]) {
        const remaining = RATE_LIMITS[type] - diff;
        const days  = Math.floor(remaining / (24*60*60*1000));
        const hours = Math.floor((remaining % (24*60*60*1000)) / (60*60*1000));
        const label = type === 'password' ? 'Şifrenizi' : 'Kullanıcı adınızı';
        const limit = type === 'password' ? '1 hafta' : '1 ay';
        const kalan = days > 0 ? `${days} gün ${hours} saat` : `${hours} saat`;
        await RoxyUI.alert('İşlem Sınırı', `${label} ${limit} içinde sadece 1 kez değiştirebilirsiniz.<br><br>⏳ Kalan süre: <strong>${kalan}</strong>`, 'warning');
        return false;
    }
    return true;
}

// ─── ŞİFRE GÖSTERİM ───
function togglePw(inputId, btn) {
    const input = document.getElementById(inputId);
    const icon  = btn.querySelector('i');
    if (input.type === 'password') {
        input.type = 'text';
        icon.className = 'fas fa-eye-slash';
    } else {
        input.type = 'password';
        icon.className = 'fas fa-eye';
    }
}

// ─── ŞİFRE FORM KONTROL ───
function checkPasswordForm() {
    const oldPw  = document.getElementById('oldPassword').value;
    const newPw  = document.getElementById('newPassword').value;
    const confPw = document.getElementById('confirmPassword').value;
    const btn    = document.getElementById('btnSavePassword');
    const matchHint = document.getElementById('matchHint');

    // Gereksinimler
    const reqs = {
        len:   newPw.length >= 8,
        upper: /[A-Z]/.test(newPw),
        lower: /[a-z]/.test(newPw),
        num:   /\d/.test(newPw)
    };

    updateReq('req-len',   reqs.len,   'En az 8 karakter');
    updateReq('req-upper', reqs.upper, 'Büyük harf');
    updateReq('req-lower', reqs.lower, 'Küçük harf');
    updateReq('req-num',   reqs.num,   'Rakam');

    const allValid = reqs.len && reqs.upper && reqs.lower && reqs.num;

    // Eşleşme kontrolü
    if (confPw.length > 0) {
        if (newPw === confPw) {
            matchHint.textContent = '✓ Şifreler eşleşiyor';
            matchHint.className   = 'match-hint ok';
        } else {
            matchHint.textContent = '✗ Şifreler eşleşmiyor';
            matchHint.className   = 'match-hint error';
        }
    } else {
        matchHint.textContent = '';
        matchHint.className   = 'match-hint';
    }

    btn.disabled = !(oldPw.length >= 6 && allValid && newPw === confPw);
}

function updateReq(id, valid, text) {
    const el = document.getElementById(id);
    el.className = 'req' + (valid ? ' valid' : '');
    el.innerHTML = `<i class="fas fa-${valid ? 'check-circle' : 'times-circle'}"></i> ${text}`;
}

// ─── KULLANICI ADI FORM KONTROL ───
function checkUsernameForm() {
    const newUn  = document.getElementById('newUsername').value.trim();
    const confUn = document.getElementById('confirmUsername').value.trim();
    const btn    = document.getElementById('btnSaveUsername');
    const hint   = document.getElementById('usernameMatchHint');

    const validFormat = /^[a-zA-Z0-9_]{3,20}$/.test(newUn);

    if (confUn.length > 0) {
        if (newUn === confUn && validFormat) {
            hint.textContent = '✓ Kullanıcı adları eşleşiyor';
            hint.className   = 'match-hint ok';
        } else if (newUn !== confUn) {
            hint.textContent = '✗ Kullanıcı adları eşleşmiyor';
            hint.className   = 'match-hint error';
        } else {
            hint.textContent = '✗ Geçersiz format (harf, rakam, _ / 3-20 karakter)';
            hint.className   = 'match-hint error';
        }
    } else {
        hint.textContent = '';
        hint.className   = 'match-hint';
    }

    btn.disabled = !(validFormat && newUn === confUn);
}

// ─── ŞİFRE KAYDET ───
function savePassword() {
    const oldPw  = document.getElementById('oldPassword').value;
    const newPw  = document.getElementById('newPassword').value;
    const confPw = document.getElementById('confirmPassword').value;

    if (!oldPw || !newPw || newPw !== confPw) return;

    // TODO: Firebase Auth ile eski şifre doğrula ve güncelle
    localStorage.setItem('roxy_last_password', Date.now().toString());

    RoxyUI.toast('Şifreniz başarıyla güncellendi!', 'success');
    hidePanel();
}

// ─── KULLANICI ADI KAYDET ───
function saveUsername() {
    const newUn = document.getElementById('newUsername').value.trim();
    if (!newUn) return;

    // TODO: Firebase'de kullanıcı adını güncelle
    localStorage.setItem('roxy_last_username', Date.now().toString());

    // UI güncelle
    document.getElementById('profileUsername').textContent     = newUn;
    document.getElementById('currentUsernameDisplay').textContent = newUn;

    RoxyUI.toast('Kullanıcı adınız başarıyla güncellendi!', 'success');
    hidePanel();
}

// ─── ÇIKIŞ YAP ───
function handleLogout() {
    RoxyUI.confirm('Çıkış Yap', 'Hesabınızdan çıkış yapmak istediğinize emin misiniz?', 'Evet, Çıkış Yap', 'İptal', true).then(ok => { if (ok) {
        // TODO: Firebase Auth signOut
        window.location.href = 'auth.html';
    }
}

// ─── FORM SIFIRLA ───
function resetForms() {
    ['oldPassword','newPassword','confirmPassword'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.value = '';
    });
    ['newUsername','confirmUsername'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.value = '';
    });
    document.getElementById('matchHint').textContent = '';
    document.getElementById('matchHint').className   = 'match-hint';
    document.getElementById('usernameMatchHint').textContent = '';
    document.getElementById('btnSavePassword').disabled = true;
    document.getElementById('btnSaveUsername').disabled = true;

    // Gereksinimleri sıfırla
    ['req-len','req-upper','req-lower','req-num'].forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            el.className = 'req';
            const texts = { 'req-len':'En az 8 karakter','req-upper':'Büyük harf','req-lower':'Küçük harf','req-num':'Rakam' };
            el.innerHTML = `<i class="fas fa-times-circle"></i> ${texts[id]}`;
        }
    });
}

// ─── TOAST ───
function showToast(msg, type = 'success') {
    const toast = document.createElement('div');
    toast.style.cssText = `
        position:fixed; bottom:30px; left:50%; transform:translateX(-50%);
        background:${type === 'success' ? 'linear-gradient(135deg,#00D9FF,#A855F7)' : 'linear-gradient(135deg,#FF6584,#FF4458)'};
        color:#0A0A0F; padding:14px 28px; border-radius:12px;
        font-family:'Poppins',sans-serif; font-weight:700; font-size:14px;
        z-index:9999; box-shadow:0 10px 40px rgba(0,217,255,0.4);
        display:flex; align-items:center; gap:10px;
        white-space:nowrap; transition: opacity 0.5s;
    `;
    toast.innerHTML = `<i class="fas fa-check-circle"></i> ${msg}`;
    document.body.appendChild(toast);
    setTimeout(() => { toast.style.opacity = '0'; setTimeout(() => toast.remove(), 500); }, 3000);
}

// ─── SON DEĞİŞİKLİK TARİHLERİNİ GÖSTER ───
document.addEventListener('DOMContentLoaded', function () {
    const menuSubs = document.querySelectorAll('.menu-sub');

    const lastPw = localStorage.getItem('roxy_last_password');
    const lastUn = localStorage.getItem('roxy_last_username');

    if (lastPw && menuSubs[0]) menuSubs[0].textContent = 'Son değişiklik: ' + formatDate(parseInt(lastPw));
    if (lastUn && menuSubs[1]) menuSubs[1].textContent = 'Son değişiklik: ' + formatDate(parseInt(lastUn));
});

function formatDate(ts) {
    const d = new Date(ts);
    return d.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' });
}
