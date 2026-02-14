// ─── VERİLER (Firebase'den gelecek, şimdilik boş) ───
const TICKETS = [];

let activeTicketId = null;

function toggleSidebar() {
    document.getElementById('sidebar').classList.toggle('open');
    document.getElementById('overlay').classList.toggle('active');
}

function showMain() {
    document.getElementById('mainView').style.display       = 'block';
    document.getElementById('newTicketView').style.display  = 'none';
    document.getElementById('chatView').style.display       = 'none';
    document.getElementById('mainFooter').style.display     = 'block';
    activeTicketId = null;
    window.scrollTo({ top: 0, behavior: 'smooth' });
    renderTickets();
}

function showNewTicket() {
    document.getElementById('mainView').style.display       = 'none';
    document.getElementById('newTicketView').style.display  = 'block';
    document.getElementById('chatView').style.display       = 'none';
    document.getElementById('mainFooter').style.display     = 'none';
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function openChat(ticketId) {
    const ticket = TICKETS.find(t => t.id === ticketId);
    if (!ticket) return;

    activeTicketId = ticketId;
    document.getElementById('mainView').style.display       = 'none';
    document.getElementById('newTicketView').style.display  = 'none';
    document.getElementById('chatView').style.display       = 'flex';
    document.getElementById('mainFooter').style.display     = 'none';

    document.getElementById('chatTitle').textContent    = ticket.title;
    document.getElementById('chatTicketId').textContent = ticket.id + ' · ' + ticket.date;

    const badge = document.getElementById('chatStatusBadge');
    if (ticket.status === 'open') {
        badge.textContent = 'Açık';
        badge.className   = 'chat-status-badge chat-badge-open';
    } else {
        badge.textContent = 'Kapalı';
        badge.className   = 'chat-status-badge chat-badge-closed';
    }

    renderMessages(ticket);

    const inputWrap    = document.getElementById('chatInputWrap');
    const closedNotice = document.getElementById('chatClosedNotice');

    if (ticket.status === 'closed') {
        inputWrap.style.display    = 'none';
        closedNotice.style.display = 'flex';
    } else {
        inputWrap.style.display    = 'flex';
        closedNotice.style.display = 'none';
        setTimeout(() => document.getElementById('chatInput').focus(), 200);
    }

    setTimeout(() => {
        const msgs = document.getElementById('chatMessages');
        msgs.scrollTop = msgs.scrollHeight;
    }, 100);
}

function renderMessages(ticket) {
    const container = document.getElementById('chatMessages');
    if (!ticket.messages || !ticket.messages.length) {
        container.innerHTML = '<div class="empty-chat"><i class="fas fa-comments"></i><p>Henüz mesaj yok.</p></div>';
        return;
    }
    container.innerHTML = ticket.messages.map(m => {
        if (m.from === 'system') return `<div class="msg system"><div class="msg-bubble">${m.text}</div></div>`;
        if (m.from === 'admin')  return `<div class="msg admin"><span class="msg-sender"><i class="fas fa-bolt"></i> ROXY STORE</span><div class="msg-bubble">${m.text}</div><span class="msg-time">${m.time}</span></div>`;
        return `<div class="msg user"><div class="msg-bubble">${m.text}</div><span class="msg-time">${m.time}</span></div>`;
    }).join('');
}

function sendMessage() {
    const input = document.getElementById('chatInput');
    const text  = input.value.trim();
    if (!text || !activeTicketId) return;
    const ticket = TICKETS.find(t => t.id === activeTicketId);
    if (!ticket || ticket.status === 'closed') return;
    const now = new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
    // TODO: Firebase
    ticket.messages.push({ from: 'user', text, time: now });
    renderMessages(ticket);
    input.value = '';
    input.style.height = 'auto';
    const msgs = document.getElementById('chatMessages');
    msgs.scrollTop = msgs.scrollHeight;
}

document.addEventListener('DOMContentLoaded', function () {
    const input = document.getElementById('chatInput');
    if (input) {
        input.addEventListener('keydown', function (e) {
            if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
        });
    }
    renderTickets();
});

function autoResize(el) {
    el.style.height = 'auto';
    el.style.height = Math.min(el.scrollHeight, 120) + 'px';
}

function checkTicketForm() {
    const title   = document.getElementById('ticketTitle').value.trim();
    const content = document.getElementById('ticketContent').value.trim();
    document.getElementById('titleCount').textContent   = title.length + '/100';
    document.getElementById('contentCount').textContent = content.length + '/1000';
    document.getElementById('btnSubmitTicket').disabled = !(title.length >= 5 && content.length >= 10);
}

function submitTicket() {
    const title   = document.getElementById('ticketTitle').value.trim();
    const content = document.getElementById('ticketContent').value.trim();
    if (!title || !content) return;

    const now     = new Date();
    const timeStr = now.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
    const dateStr = now.toLocaleDateString('tr-TR', { day: 'numeric', month: 'short', year: 'numeric' });
    const id      = 'TKT-' + String(TICKETS.length + 1).padStart(3, '0');

    TICKETS.unshift({
        id, title, date: dateStr, time: timeStr, status: 'open',
        messages: [
            { from: 'user',   text: content, time: timeStr },
            { from: 'system', text: 'Talebiniz alındı. Mesai saatleri içinde yanıt verilecektir.', time: timeStr }
        ]
    });

    document.getElementById('ticketTitle').value   = '';
    document.getElementById('ticketContent').value = '';
    document.getElementById('titleCount').textContent   = '0/100';
    document.getElementById('contentCount').textContent = '0/1000';
    document.getElementById('btnSubmitTicket').disabled = true;

    RoxyUI.toast('Talebiniz başarıyla gönderildi!', 'success');
    showMain();
}

function renderTickets() {
    const list  = document.getElementById('ticketsList');
    const count = document.getElementById('ticketCount');
    count.textContent = TICKETS.length + ' talep';

    if (!TICKETS.length) {
        list.innerHTML = '<div class="empty-tickets"><i class="fas fa-ticket-alt"></i><h4>Henüz talep yok</h4><p>Yeni bir destek talebi oluşturabilirsiniz.</p></div>';
        return;
    }

    list.innerHTML = TICKETS.map(t => {
        const isOpen = t.status === 'open';
        return `<div class="ticket-card" onclick="openChat('${t.id}')">
            <div class="ticket-left">
                <div class="ticket-dot ${isOpen ? 'dot-open' : 'dot-closed'}"></div>
                <div class="ticket-info">
                    <div class="ticket-title">${t.title}</div>
                    <div class="ticket-meta">${t.id} · ${t.date} ${t.time}</div>
                </div>
            </div>
            <div class="ticket-right">
                <span class="ticket-badge ${isOpen ? 'badge-open' : 'badge-closed'}">${isOpen ? 'Açık' : 'Kapalı'}</span>
                <i class="fas fa-chevron-right ticket-arrow"></i>
            </div>
        </div>`;
    }).join('');
}
