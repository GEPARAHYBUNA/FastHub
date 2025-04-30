document.addEventListener('DOMContentLoaded', function () {
    let currentStep = 1;
    const form = document.getElementById('registrationForm');
    const nextBtn = document.getElementById('nextBtn');
    const prevBtn = document.getElementById('prevBtn');
    const steps = document.querySelectorAll('.step');
    const sections = document.querySelectorAll('.form-section');
    const stepLines = document.querySelectorAll('.step-line');

    function showError(input, message) {
        const formGroup = input.parentElement;
        input.classList.add('error');
        input.classList.remove('success');

        let error = formGroup.querySelector('.error-message');
        if (!error) {
            error = document.createElement('div');
            error.className = 'error-message';
            formGroup.appendChild(error);
        }
        error.textContent = message;
    }

    function clearError(input) {
        const formGroup = input.parentElement;
        input.classList.remove('error');
        input.classList.add('success');

        const error = formGroup.querySelector('.error-message');
        if (error) {
            formGroup.removeChild(error);
        }
    }

    function validaEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    }

    function validaCPF(cpf) {
        cpf = cpf.replace(/[^\d]/g, '');
        if (cpf.length !== 11 || /^(\d)\1+$/.test(cpf)) return false;

        let soma = 0, resto;

        for (let i = 1; i <= 9; i++) {
            soma += parseInt(cpf[i - 1]) * (11 - i);
        }
        resto = (soma * 10) % 11;
        if (resto === 10 || resto === 11) resto = 0;
        if (resto !== parseInt(cpf[9])) return false;

        soma = 0;
        for (let i = 1; i <= 10; i++) {
            soma += parseInt(cpf[i - 1]) * (12 - i);
        }
        resto = (soma * 10) % 11;
        if (resto === 10 || resto === 11) resto = 0;
        return resto === parseInt(cpf[10]);
    }

    function validaStep(step) {
        const section = document.querySelector(`.form-section[data-step="${step}"]`);
        const inputs = section.querySelectorAll('input[required], select[required]');
        let valid = true;

        inputs.forEach(input => {
            if (input.value.trim() === '') {
                showError(input, 'Este campo é obrigatório');
                valid = false;
            } else {
                if (input.type === 'email' && !validaEmail(input.value)) {
                    showError(input, 'Email inválido');
                    valid = false;
                }
                if (input.id === 'cpf' && !validaCPF(input.value)) {
                    showError(input, 'CPF inválido');
                    valid = false;
                }
            }
        });

        return valid;
    }

    form.querySelectorAll('input, select').forEach(input => {
        input.addEventListener('input', () => clearError(input));
    });

    function updateUI() {
        sections.forEach((section, index) => {
            section.classList.toggle('active', index + 1 === currentStep);
        });

        steps.forEach((step, index) => {
            step.classList.toggle('active', index + 1 <= currentStep);
        });

        stepLines.forEach((line, index) => {
            line.classList.toggle('active', index + 1 < currentStep);
        });

        prevBtn.style.display = currentStep === 1 ? 'none' : 'block';
        nextBtn.textContent = currentStep === 3 ? 'Cadastrar' : 'Próximo';
    }

    function submitFormData() {
        const senha = document.getElementById('senha').value;
        const confirmarSenha = document.getElementById('confirmarSenha').value;

        if (senha !== confirmarSenha) {
            alert('As senhas não coincidem!');
            return;
        }

        const postData = {
            login: document.getElementById('email').value,
            email: document.getElementById('email').value,
            password: senha,
            role: document.getElementById('role').value,
            nome: document.getElementById('nome').value,
            sobrenome: document.getElementById('sobrenome').value,
            documento: document.getElementById('cpf').value,
            cep: document.getElementById('cep').value,
            endereco: document.getElementById('endereco').value,
            estado: document.getElementById('estado').value
        };

        console.log('Dados enviados:', postData);

        fetch('http://168.231.92.116:8081/autenticacao/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(postData),
        })
            .then(response => response.text())
            .then(data => {
                console.log('Resposta do servidor:', data);
                if (data === 'CRIADO') {
                    showFeedback('success', 'Cadastro realizado com sucesso!');
                    form.reset();
                    currentStep = 1;
                    updateUI();
                } else {
                    showFeedback('error', 'Erro no cadastro: ' + data);
                }
                
            })
            .catch((error) => {
                console.error('Erro ao enviar:', error);
                showFeedback('error', 'Ocorreu um erro ao enviar os dados.');
            });
            
    }

    nextBtn.addEventListener('click', function (e) {
        e.preventDefault();

        if (validaStep(currentStep)) {
            if (currentStep < 3) {
                currentStep++;
                updateUI();
            } else {
                submitFormData();
            }
        }
    });

    prevBtn.addEventListener('click', function (e) {
        e.preventDefault();

        if (currentStep > 1) {
            currentStep--;
            updateUI();
        }
    });

    form.addEventListener('submit', function (e) {
        e.preventDefault();
    });

    updateUI();
});

        // Função para mostrar feedback (atualizada)
        function showFeedback(type, message) {
            const popup = document.getElementById('feedbackPopup');
            const messageEl = document.getElementById('feedbackMessage');
            const iconEl = document.getElementById('feedbackIcon');
            
            popup.className = type;
            messageEl.textContent = message;
            iconEl.textContent = type === 'success' ? '✓' : '✗';
            popup.style.display = 'flex';
            
            if (type === 'success') {
                setTimeout(() => {
                    window.location.href = '/sistema/login/login.html';
                }, 3000);
            } else {
                setTimeout(() => {
                    popup.style.display = 'none';
                }, 5000);
            }
        }