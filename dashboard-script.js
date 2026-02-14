// Toggle Sidebar
function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('overlay');
    
    sidebar.classList.toggle('open');
    overlay.classList.toggle('active');
}

// Initialize page
document.addEventListener('DOMContentLoaded', function() {
    // Close sidebar on outside click
    document.addEventListener('click', function(e) {
        const sidebar = document.getElementById('sidebar');
        const menuToggle = document.querySelector('.menu-toggle');
        
        if (sidebar.classList.contains('open') && 
            !sidebar.contains(e.target) && 
            !menuToggle.contains(e.target)) {
            toggleSidebar();
        }
    });
    
    // Handle window resize
    let resizeTimer;
    window.addEventListener('resize', function() {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(function() {
            if (window.innerWidth > 768) {
                const sidebar = document.getElementById('sidebar');
                const overlay = document.getElementById('overlay');
                
                sidebar.classList.remove('open');
                overlay.classList.remove('active');
            }
        }, 250);
    });
    
    // Page load animation
    const statsCards = document.querySelectorAll('.stat-card');
    statsCards.forEach((card, index) => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(20px)';
        
        setTimeout(() => {
            card.style.transition = 'all 0.6s ease';
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
        }, 100 + (index * 100));
    });
    
    // Animate quick actions
    const actionBtns = document.querySelectorAll('.action-btn');
    actionBtns.forEach((btn, index) => {
        btn.style.opacity = '0';
        btn.style.transform = 'translateY(20px)';
        
        setTimeout(() => {
            btn.style.transition = 'all 0.6s ease';
            btn.style.opacity = '1';
            btn.style.transform = 'translateY(0)';
        }, 300 + (index * 100));
    });
});
