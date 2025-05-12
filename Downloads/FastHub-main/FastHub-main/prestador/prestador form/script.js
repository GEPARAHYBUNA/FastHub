document.addEventListener('DOMContentLoaded', function () {
    let currentStep = 1;
    const form = document.getElementById('registrationForm');
    const nextBtn = document.getElementById('nextBtn');
    const prevBtn = document.getElementById('prevBtn');
    const steps = document.querySelectorAll('.step');
    const sections = document.querySelectorAll('.form-section');
    const stepLines = document.querySelectorAll('.step-line');
    const serviceModal = document.getElementById('serviceRequestModal');
    const successOverlay = document.getElementById('successOverlay');

    function carregarCategorias() {
        const apiUrl = "http://168.231.92.116:8081/administracao/categoria/listar";

        fetch(apiUrl)
            .then(response => {
                if (!response.ok) throw new Error("Erro ao buscar as categorias");
                return response.json();
            })
            .then(categorias => {
                const select = document.querySelector('select[name="categoriaId"]');
                select.innerHTML = '<option value="" disabled selected>Selecione a Área</option>';
                categorias.forEach(categoria => {
                    const option = document.createElement('option');
                    option.value = categoria.id;
                    option.textContent = categoria.descricao;
                    option.dataset.nomeCategoria = categoria.descricao;
                    select.appendChild(option);
                });
            })
            .catch(error => console.error("Erro ao carregar categorias:", error));
    }

    function atualizarNomeCategoria(selectElement) {
        const selectedOption = selectElement.options[selectElement.selectedIndex];
        const nomeCategoria = selectedOption.dataset.nomeCategoria || "";
        document.getElementById("nomeCategoria").value = nomeCategoria;
    }

    carregarCategorias();

    const masks = {
        documento: v => v.replace(/\D/g, '')
            .replace(/(\d{3})(\d)/, '$1.$2')
            .replace(/(\d{3})(\d)/, '$1.$2')
            .replace(/(\d{3})(\d{1,2})/, '$1-$2')
            .replace(/(-\d{2})\d+?$/, '$1'),
        telefone: v => v.replace(/\D/g, '')
            .replace(/(\d{2})(\d)/, '($1) $2')
            .replace(/(\d{4,5})(\d{4})$/, '$1-$2'),
        cep: v => v.replace(/\D/g, '')
            .replace(/(\d{5})(\d)/, '$1-$2')
            .replace(/(-\d{3})\d+?$/, '$1')
    };

    ['documento', 'telefone', 'cep'].forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            console.log(`${id} encontrado`);
            el.addEventListener('input', e => {
                e.target.value = masks[id](e.target.value);
            });
        }
    });
    

    function validaStep(step) {
        const section = document.querySelector(`.form-section[data-step="${step}"]`);
        const inputs = section.querySelectorAll('[required]');
        let valid = true;

        inputs.forEach(input => {
            if (input.value.trim() === '') {
                input.style.borderColor = '#ef4444';
                valid = false;
            } else {
                input.style.borderColor = '';
            }
        });

        return valid;
    }

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

        if (currentStep === 3) preencherConfirmacao();
    }

    function preencherConfirmacao() {
        const formData = new FormData(form);
        const dados = {};
        formData.forEach((v, k) => dados[k] = v);

        document.getElementById('dadosConfirmacao').innerHTML = Object.entries(dados)
            .map(([k, v]) => `<p><strong>${k.charAt(0).toUpperCase() + k.slice(1)}:</strong> ${v}</p>`)
            .join('');
    }

    function showToast(title, message, type = 'success') {
        const toast = document.createElement('div');
        toast.className = 'toast';

        const iconSvg = type === 'success'
            ? `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>`
            : `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>`;

        toast.innerHTML = `<div class="toast-icon">${iconSvg}</div><div class="toast-content"><div class="toast-title">${title}</div><div class="toast-message">${message}</div></div>`;
        document.getElementById('toastContainer').appendChild(toast);
        setTimeout(() => toast.remove(), 3000);
    }

    function submitFormData() {
        const formData = new FormData(form);
        const postData = {};

        formData.forEach((v, k) => postData[k] = v);

        // Adiciona manualmente o campo login (igual ao email)
        const login = document.getElementById('login').value;
        postData.login = login;

        postData.role = 'PRESTADOR';
        postData.telefone = document.getElementById("telefone").value.replace(/\D/g, '');
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

    // Sincroniza email com login automaticamente
    const emailInput = form.querySelector('input[name="email"]');
    const loginInput = document.getElementById('login');

    emailInput.addEventListener('input', () => {
        loginInput.value = emailInput.value;
    });

    // Serviços (modal)
    window.openServiceModal = () => serviceModal.style.display = 'flex';
    window.closeServiceModal = () => serviceModal.style.display = 'none';

    window.submitServiceRequest = () => {
        const name = document.getElementById('serviceName').value;
        const desc = document.getElementById('serviceDescription').value;

        if (!name.trim() || !desc.trim()) {
            showToast('Erro', 'Preencha todos os campos', 'error');
            return;
        }

        showToast('Solicitação Enviada', 'Sua solicitação foi encaminhada para análise', 'success');
        closeServiceModal();
        document.getElementById('serviceName').value = '';
        document.getElementById('serviceDescription').value = '';
    };

    window.hideSuccess = function () {
        successOverlay.style.display = 'none';
        document.body.style.overflow = 'auto';
        form.reset();
        currentStep = 1;
        updateUI();
    };

    serviceModal.addEventListener('click', e => {
        if (e.target === serviceModal) closeServiceModal();
    });

    form.querySelectorAll('input, select').forEach(input => {
        input.addEventListener('input', () => input.style.borderColor = '');
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
