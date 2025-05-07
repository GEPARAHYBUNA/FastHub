document.addEventListener('DOMContentLoaded', () => {
    // ELEMENTOS
    const loginCard = document.getElementById('loginCard');
    const forgotPasswordCard = document.getElementById('forgotPasswordCard');
    const successMessage = document.getElementById('successMessage');
    const loginForm = document.getElementById('loginForm');
    const forgotPasswordForm = document.getElementById('forgotPasswordForm');
    const forgotPasswordLink = document.getElementById('forgotPasswordLink');
    const backToLoginBtn = document.getElementById('backToLoginBtn');
    const backToLoginFromSuccess = document.getElementById('backToLoginFromSuccess');
    const loginBtn = document.getElementById('loginBtn');
    const resetPasswordBtn = document.getElementById('resetPasswordBtn');
    const menuToggle = document.getElementById('menuToggle');
    const navMenu = document.getElementById('navMenu');
    const toastContainer = document.getElementById('toastContainer');
    const usernameInput = document.getElementById('username');
    const passwordInput = document.getElementById('password');
    const usernameGroup = document.getElementById('usernameGroup');
    const passwordGroup = document.getElementById('passwordGroup');

    let loginButtonOriginalContent = '';
    let resetButtonOriginalContent = '';

    // SCROLL - navbar
    window.addEventListener('scroll', () => {
        const navbar = document.querySelector('.aba_navegacao');
        if (window.scrollY > 10) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });

    // MENU MOBILE
    if (menuToggle && navMenu) {
        menuToggle.addEventListener('click', () => {
            navMenu.classList.toggle('active');
        });
    }

    // FOCO
    if (usernameInput) {
        usernameInput.addEventListener('focus', () => usernameGroup.classList.add('focused'));
        usernameInput.addEventListener('blur', () => usernameGroup.classList.remove('focused'));
    }
    if (passwordInput) {
        passwordInput.addEventListener('focus', () => passwordGroup.classList.add('focused'));
        passwordInput.addEventListener('blur', () => passwordGroup.classList.remove('focused'));
    }

    // TROCAR PARA ESQUECI A SENHA
    if (forgotPasswordLink) {
        forgotPasswordLink.addEventListener('click', e => {
            e.preventDefault();
            loginCard.style.display = 'none';
            forgotPasswordCard.style.display = 'block';
            document.getElementById('email').focus();
        });
    }

    if (backToLoginBtn) {
        backToLoginBtn.addEventListener('click', () => {
            forgotPasswordCard.style.display = 'none';
            loginCard.style.display = 'block';
        });
    }

    if (backToLoginFromSuccess) {
        backToLoginFromSuccess.addEventListener('click', () => {
            successMessage.style.display = 'none';
            loginCard.style.display = 'block';
        });
    }

    // TOAST
    function showToast(message, type = 'success') {
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.innerHTML = `
            <div class="toast-icon">
                ${type === 'success'
                    ? `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" stroke="#10b981" fill="none" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>`
                    : `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" stroke="#ef4444" fill="none" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>`
                }
            </div>
            <div class="toast-message">${message}</div>
            <button class="toast-close">&times;</button>
        `;
        toastContainer.appendChild(toast);

        toast.querySelector('.toast-close').addEventListener('click', () => {
            toast.remove();
        });

        setTimeout(() => {
            if (toast.parentNode) toast.remove();
        }, 5000);
    }

    // LOADER
    function setButtonLoading(button, isLoading) {
        if (isLoading) {
            const original = button.innerHTML;
            if (button === loginBtn) loginButtonOriginalContent = original;
            if (button === resetPasswordBtn) resetButtonOriginalContent = original;

            button.innerHTML = `
                <svg class="login-btn-spinner" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <line x1="12" y1="2" x2="12" y2="6"/><line x1="12" y1="18" x2="12" y2="22"/>
                    <line x1="4.93" y1="4.93" x2="7.76" y2="7.76"/><line x1="16.24" y1="16.24" x2="19.07" y2="19.07"/>
                    <line x1="2" y1="12" x2="6" y2="12"/><line x1="18" y1="12" x2="22" y2="12"/>
                    <line x1="4.93" y1="19.07" x2="7.76" y2="16.24"/><line x1="16.24" y1="7.76" x2="19.07" y2="4.93"/>
                </svg> <span>Carregando...</span>
            `;
            button.disabled = true;
        } else {
            button.innerHTML = button === loginBtn ? loginButtonOriginalContent : resetButtonOriginalContent;
            button.disabled = false;
        }
    }

    // LOGIN
    async function handleLogin(e) {
        e.preventDefault();

        const username = usernameInput.value.trim();
        const password = passwordInput.value.trim();

        if (!username || !password) {
            showToast('Preencha todos os campos!', 'error');
            return;
        }

        setButtonLoading(loginBtn, true);

        try {
            const response = await fetch('http://168.231.92.116:8081/autenticacao/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ login: username, password: password })
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Erro ao fazer login');
            }

            const data = await response.json();
          

            localStorage.setItem('token', data.token);
            localStorage.setItem('username', username);
            localStorage.setItem('userType', data.rules[0].authority);
            localStorage.setItem("id", data.id);

            showToast('Login realizado com sucesso!');

           // const pageMap = {
             //   admin: 'home_admin.html',
               // cliente: '../clientes/hoe_limpa.html',
                //prestador: 'home_prestador.html'
            //};
            //alert("DATA USER TYPE: "+ data.userType);
            
           // const redirect = pageMap[data.userType] || "../clientes/home_limpa.html";
           let redirect = '';

           if (data.rules.length === 1) {
               const role = data.rules[0].authority;
               
               if (role === "ROLE_CLIENTE") {
                   redirect = '../../clientes/home_limpa.html';
               } else if (role === "ROLE_PRESTADOR") {
                   redirect = '../../prestador/home_prestador.html';
               } else {
                   redirect = '../../admin/home_adm.html';
               }
           } else {
               redirect = '../../admin/home_adm.html';
           }
           
           // Redireciona o usuário
           window.location.href = redirect;
           
            setTimeout(() => {
                window.location.href = redirectPage;
            }, 1000);
        } catch (err) {
            showToast(err.message || 'Usuário ou senha incorretos.', 'error');
            console.error(err);
        } finally {
            setButtonLoading(loginBtn, false);
        }
    }

    // RECUPERAÇÃO DE SENHA
    async function handleForgotPassword(e) {
        e.preventDefault();

        const email = document.getElementById('email').value.trim();
        if (!email) {
            showToast('Informe seu e-mail.', 'error');
            return;
        }

        setButtonLoading(resetPasswordBtn, true);

        try {
            const response = await fetch('http://168.231.92.116:8081/autenticacao/reset-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email })
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Erro ao enviar recuperação');
            }

            showToast('E-mail de recuperação enviado.');
            forgotPasswordCard.style.display = 'none';
            successMessage.style.display = 'block';

        } catch (err) {
            showToast('Erro ao enviar o e-mail.', 'error');
            console.error(err);
        } finally {
            setButtonLoading(resetPasswordBtn, false);
        }
    }

    // EVENTOS
    if (loginForm) loginForm.addEventListener('submit', handleLogin);
    if (forgotPasswordForm) forgotPasswordForm.addEventListener('submit', handleForgotPassword);
});