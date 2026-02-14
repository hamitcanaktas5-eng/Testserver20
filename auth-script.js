// Custom Alert System
function showAlert(type, title, message) {
    const alertBox = document.getElementById('customAlert');
    const alertIcon = document.getElementById('alertIcon');
    const alertTitle = document.getElementById('alertTitle');
    const alertMessage = document.getElementById('alertMessage');
    
    // Set icon based on type
    alertIcon.className = 'alert-icon ' + type;
    if (type === 'success') {
        alertIcon.innerHTML = '<i class="fas fa-check-circle"></i>';
    } else if (type === 'error') {
        alertIcon.innerHTML = '<i class="fas fa-times-circle"></i>';
    } else if (type === 'warning') {
        alertIcon.innerHTML = '<i class="fas fa-exclamation-circle"></i>';
    }
    
    alertTitle.textContent = title;
    alertMessage.textContent = message;
    
    // Show alert
    alertBox.classList.add('show');
    
    // Auto hide after 5 seconds
    setTimeout(() => {
        closeAlert();
    }, 5000);
}

function closeAlert() {
    const alertBox = document.getElementById('customAlert');
    alertBox.classList.remove('show');
}

// Switch between forms
function switchForm(formName) {
    // Hide all forms
    document.querySelectorAll('.form-content').forEach(form => {
        form.classList.remove('active');
    });
    
    // Show selected form
    const targetForm = document.getElementById(formName + 'Form');
    if (targetForm) {
        targetForm.classList.add('active');
    }
    
    // Update page title
    if (formName === 'login') {
        document.title = 'Giriş Yap - Roxy Store';
    } else if (formName === 'register') {
        document.title = 'Kayıt Ol - Roxy Store';
    } else if (formName === 'forgot') {
        document.title = 'Şifre Sıfırlama - Roxy Store';
    }
}

// Password toggle
function togglePassword(inputId) {
    const input = document.getElementById(inputId);
    const button = input.parentElement.querySelector('.password-toggle');
    const icon = button.querySelector('i');
    
    if (input.type === 'password') {
        input.type = 'text';
        icon.classList.remove('fa-eye');
        icon.classList.add('fa-eye-slash');
    } else {
        input.type = 'password';
        icon.classList.remove('fa-eye-slash');
        icon.classList.add('fa-eye');
    }
}

// Password validation
function validatePassword(password) {
    const requirements = {
        length: password.length >= 8,
        upper: /[A-Z]/.test(password),
        lower: /[a-z]/.test(password),
        number: /\d/.test(password)
    };
    
    return requirements;
}

// Password strength checker
function checkPasswordStrength(password) {
    const reqs = validatePassword(password);
    let strength = 0;
    
    if (reqs.length) strength++;
    if (reqs.upper) strength++;
    if (reqs.lower) strength++;
    if (reqs.number) strength++;
    
    return strength;
}

// Update password requirements
function updatePasswordRequirements() {
    const passwordInput = document.getElementById('registerPassword');
    const strengthBar = document.getElementById('passwordStrength');
    const passwordReqs = document.getElementById('passwordReqs');
    const reqLength = document.getElementById('reqLength');
    const reqUpper = document.getElementById('reqUpper');
    const reqLower = document.getElementById('reqLower');
    const reqNumber = document.getElementById('reqNumber');
    
    if (!passwordInput || !strengthBar) return;
    
    // Show/hide requirements on focus/blur
    passwordInput.addEventListener('focus', function() {
        passwordReqs.classList.add('show');
    });
    
    passwordInput.addEventListener('blur', function() {
        // Delay hiding to allow for interaction
        setTimeout(() => {
            if (document.activeElement !== passwordInput) {
                // Only hide if all requirements are met
                const reqs = validatePassword(this.value);
                if (reqs.length && reqs.upper && reqs.lower && reqs.number) {
                    passwordReqs.classList.remove('show');
                }
            }
        }, 200);
    });
    
    // Update requirements on input
    passwordInput.addEventListener('input', function() {
        const password = this.value;
        const reqs = validatePassword(password);
        const strength = checkPasswordStrength(password);
        
        // Update strength bar
        strengthBar.className = 'password-strength';
        
        if (password.length === 0) {
            strengthBar.style.width = '0';
        } else if (strength <= 2) {
            strengthBar.classList.add('weak');
        } else if (strength === 3) {
            strengthBar.classList.add('medium');
        } else {
            strengthBar.classList.add('strong');
        }
        
        // Update requirements - with animation
        updateRequirement(reqLength, reqs.length);
        updateRequirement(reqUpper, reqs.upper);
        updateRequirement(reqLower, reqs.lower);
        updateRequirement(reqNumber, reqs.number);
    });
}

// Update individual requirement
function updateRequirement(element, isValid) {
    if (isValid) {
        element.classList.add('valid');
        element.querySelector('i').classList.remove('fa-times-circle');
        element.querySelector('i').classList.add('fa-check-circle');
    } else {
        element.classList.remove('valid');
        element.querySelector('i').classList.remove('fa-check-circle');
        element.querySelector('i').classList.add('fa-times-circle');
    }
}

// Email validation
function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

// Check if password is valid
function isPasswordValid(password) {
    const reqs = validatePassword(password);
    return reqs.length && reqs.upper && reqs.lower && reqs.number;
}

// Handle login
function handleLogin(e) {
    e.preventDefault();
    
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    const remember = document.getElementById('rememberMe').checked;
    
    // Validation
    if (!validateEmail(email)) {
        showAlert('error', 'Hata', 'Lütfen geçerli bir e-posta adresi girin.');
        return;
    }
    
    if (password.length < 8) {
        showAlert('error', 'Hata', 'Şifre en az 8 karakter olmalıdır.');
        return;
    }
    
    console.log('Login Data:', { email, password, remember });
    
    // TODO: Firebase Authentication
    showAlert('success', 'Başarılı', 'Giriş yapılıyor...');
    
    // Redirect to dashboard
    setTimeout(() => {
        window.location.href = 'dashboard.html';
    }, 1500);
}

// Handle register
function handleRegister(e) {
    e.preventDefault();
    
    const name = document.getElementById('registerName').value;
    const email = document.getElementById('registerEmail').value;
    const password = document.getElementById('registerPassword').value;
    const confirmPassword = document.getElementById('registerPasswordConfirm').value;
    
    // Validation
    if (name.trim().length < 3) {
        showAlert('error', 'Hata', 'Lütfen geçerli bir ad soyad girin.');
        return;
    }
    
    if (!validateEmail(email)) {
        showAlert('error', 'Hata', 'Lütfen geçerli bir e-posta adresi girin.');
        return;
    }
    
    if (!isPasswordValid(password)) {
        showAlert('error', 'Şifre Güvenli Değil', 'Lütfen tüm şifre gereksinimlerini karşılayın.');
        return;
    }
    
    if (password !== confirmPassword) {
        showAlert('error', 'Hata', 'Şifreler eşleşmiyor!');
        return;
    }
    
    console.log('Register Data:', { name, email, password });
    
    // TODO: Firebase Authentication
    showAlert('success', 'Başarılı', 'Hesabınız oluşturuluyor...');
    
    // Switch to login after 2 seconds
    setTimeout(() => {
        switchForm('login');
        document.getElementById('registerForm').querySelector('form').reset();
        document.getElementById('passwordStrength').style.width = '0';
        document.getElementById('passwordReqs').classList.remove('show');
        
        // Reset requirements
        document.querySelectorAll('.req-item').forEach(item => {
            item.classList.remove('valid');
            item.querySelector('i').classList.remove('fa-check-circle');
            item.querySelector('i').classList.add('fa-times-circle');
        });
        
        showAlert('success', 'Tebrikler!', 'Hesabınız oluşturuldu. Şimdi giriş yapabilirsiniz.');
    }, 2000);
}

// Handle forgot password
function handleForgot(e) {
    e.preventDefault();
    
    const email = document.getElementById('forgotEmail').value;
    
    // Validation
    if (!validateEmail(email)) {
        showAlert('error', 'Hata', 'Lütfen geçerli bir e-posta adresi girin.');
        return;
    }
    
    console.log('Forgot Password Email:', email);
    
    // TODO: Firebase Password Reset
    showAlert('success', 'E-posta Gönderiliyor', 'Lütfen bekleyin...');
    
    // Show success message
    setTimeout(() => {
        document.getElementById('forgotForm').querySelector('form').style.display = 'none';
        document.getElementById('forgotSuccess').style.display = 'block';
    }, 1500);
    
    // Redirect to login after 7 seconds
    setTimeout(() => {
        switchForm('login');
        document.getElementById('forgotForm').querySelector('form').style.display = 'flex';
        document.getElementById('forgotSuccess').style.display = 'none';
        document.getElementById('forgotForm').querySelector('form').reset();
    }, 7000);
}

// Initialize page
document.addEventListener('DOMContentLoaded', function() {
    // Update password requirements
    updatePasswordRequirements();
    
    // Page load animation
    const authCard = document.querySelector('.auth-card');
    if (authCard) {
        authCard.style.opacity = '0';
        authCard.style.transform = 'translateY(30px)';
        
        setTimeout(() => {
            authCard.style.transition = 'all 0.6s ease';
            authCard.style.opacity = '1';
            authCard.style.transform = 'translateY(0)';
        }, 100);
    }
    
    // Keyboard shortcuts
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            window.location.href = 'index.html';
        }
    });
    
    // Input focus animation
    const inputs = document.querySelectorAll('.input-group input');
    inputs.forEach(input => {
        input.addEventListener('focus', function() {
            this.parentElement.style.transform = 'scale(1.02)';
        });
        
        input.addEventListener('blur', function() {
            this.parentElement.style.transform = 'scale(1)';
        });
    });
    
    // Check for URL parameter to switch form
    const urlParams = new URLSearchParams(window.location.search);
    const tab = urlParams.get('tab');
    if (tab) {
        switchForm(tab);
    }
});

// Prevent form resubmission on page refresh
if (window.history.replaceState) {
    window.history.replaceState(null, null, window.location.href);
}
