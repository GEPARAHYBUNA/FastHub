// Configurações da API
const API_BASE_URL = 'http://168.231.92.116:8081';
const USER_PROFILE_ENDPOINT = '/cliente/meuperfil';
const USER_REQUESTS_ENDPOINT = '/solicitacoes';
const SERVICES_ENDPOINT = '/servicos';

// Variáveis globais
let currentUser = null;
let userRequests = [];
let availableServices = [];

// Função para mostrar notificações
function showToast(title, message, type = 'success') {
    const toastContainer = document.getElementById('toastContainer');
    const toast = document.createElement('div');
    toast.className = 'toast';
    
    if (type === 'error') {
        toast.style.borderColor = '#ef4444';
    }
    
    toast.innerHTML = `
        <div class="toast-icon" style="${type === 'error' ? 'color: #ef4444;' : ''}">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                ${type === 'success' ? 
                    '<polyline points="20 6 9 17 4 12"></polyline>' : 
                    '<line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line>'}
            </svg>
        </div>
        <div class="toast-content">
            <div class="toast-title">${title}</div>
            <div class="toast-message">${message}</div>
        </div>
    `;
    
    toastContainer.appendChild(toast);
    
    setTimeout(() => {
        toast.style.transform = 'translateX(0)';
    }, 10);
    
    setTimeout(() => {
        toast.style.transform = 'translateX(100%)';
        setTimeout(() => {
            toast.remove();
        }, 300);
    }, 4000);
}

// Carrega os dados quando a página é acessada
document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('authToken');
    const userId = localStorage.getItem('userId');
    
    if (!token || !userId) {
        window.location.href = '/login.html';
        return;
    }

    // Carrega os dados iniciais
    loadInitialData(userId, token);
    
    // Configura os event listeners
    setupEventListeners();
});

// Função para carregar todos os dados iniciais
async function loadInitialData(userId, token) {
    try {
        // Mostra loading
        showLoading(true);
        
        // Carrega dados do usuário
        currentUser = await fetchUserProfile(userId, token);
        updateUserUI();
        
        // Carrega dados em paralelo para melhor performance
        await Promise.all([
            fetchUserRequests(userId, token),
            fetchAvailableServices(token)
        ]);
        
    } catch (error) {
        console.error('Erro ao carregar dados:', error);
        showToast('Erro', 'Não foi possível carregar seus dados', 'error');
    } finally {
        showLoading(false);
    }
}

// Função para buscar o perfil do usuário
async function fetchUserProfile(userId, token) {
    try {
        const response = await fetch(`${API_BASE_URL}${USER_PROFILE_ENDPOINT}/${userId}`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (response.status === 401) {
            // Token inválido ou expirado
            localStorage.removeItem('authToken');
            localStorage.removeItem('userId');
            window.location.href = '/login.html';
            return;
        }

        if (!response.ok) {
            throw new Error(`Erro ao carregar perfil: ${response.statusText}`);
        }

        return await response.json();
    } catch (error) {
        console.error('Erro ao buscar perfil:', error);
        throw error;
    }
}

// Função para buscar as solicitações do usuário
async function fetchUserRequests(userId, token) {
    try {
        const response = await fetch(`${API_BASE_URL}${USER_REQUESTS_ENDPOINT}?userId=${userId}`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error(`Erro ao carregar solicitações: ${response.statusText}`);
        }

        userRequests = await response.json();
        renderRequests();
    } catch (error) {
        console.error('Erro ao buscar solicitações:', error);
        showToast('Erro', 'Não foi possível carregar suas solicitações', 'error');
    }
}

// Função para buscar serviços disponíveis
async function fetchAvailableServices(token) {
    try {
        const response = await fetch(`${API_BASE_URL}${SERVICES_ENDPOINT}`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error(`Erro ao carregar serviços: ${response.statusText}`);
        }

        availableServices = await response.json();
        renderServices();
    } catch (error) {
        console.error('Erro ao buscar serviços:', error);
        showToast('Erro', 'Não foi possível carregar os serviços', 'error');
    }
}

// Atualiza a interface com os dados do usuário
function updateUserUI() {
    if (!currentUser) return;

    // Combina nome e sobrenome
    const fullName = `${currentUser.nome || ''} ${currentUser.sobrenome || ''}`.trim();
    
    // Atualiza campos do formulário
    document.getElementById('profileName').value = fullName;
    document.getElementById('profileEmail').value = currentUser.email || '';
    document.getElementById('profilePhone').value = currentUser.telefone || '';
    
    // Formata o endereço
    const address = [
        currentUser.rua,
        currentUser.estado,
        currentUser.cep ? `CEP: ${currentUser.cep}` : ''
    ].filter(Boolean).join(', ');
    
    document.getElementById('profileAddress').value = address;
    
    // Atualiza os campos de exibição
    document.getElementById('profileNameDisplay').textContent = fullName || 'Usuário';
    document.getElementById('profileEmailDisplay').textContent = currentUser.email || '';
    document.getElementById('profilePhoneDisplay').textContent = currentUser.telefone || '';
    
    // Atualiza o avatar
    const profileImage = document.getElementById('profileImage');
    profileImage.textContent = (currentUser.nome?.[0] || 'U').toUpperCase();
}

// Renderiza as solicitações
function renderRequests() {
    renderActiveRequests();
    renderCompletedRequests();
}

// Renderiza solicitações ativas
function renderActiveRequests() {
    const container = document.getElementById('activeTab');
    container.innerHTML = '';

    const activeRequests = userRequests.filter(req => req.status !== 'concluído');

    if (activeRequests.length === 0) {
        container.innerHTML = '<p class="text-center text-gray-500 my-8">Nenhuma solicitação ativa encontrada.</p>';
        return;
    }

    activeRequests.forEach(request => {
        const requestCard = createRequestCard(request);
        container.appendChild(requestCard);
    });
}

// Renderiza solicitações concluídas
function renderCompletedRequests() {
    const container = document.getElementById('completedTab');
    container.innerHTML = '';

    const completedRequests = userRequests.filter(req => req.status === 'concluído');

    if (completedRequests.length === 0) {
        container.innerHTML = '<p class="text-center text-gray-500 my-8">Nenhuma solicitação concluída encontrada.</p>';
        return;
    }

    completedRequests.forEach(request => {
        const requestCard = createRequestCard(request, true);
        container.appendChild(requestCard);
    });
}

// Cria card de solicitação
function createRequestCard(request, isCompleted = false) {
    const card = document.createElement('div');
    card.className = `card mb-6 ${isCompleted ? 'completed' : ''}`;
    
    card.innerHTML = `
        <div class="service-category category-${request.categoria || 'default'}">
            ${request.categoria || 'Geral'}
        </div>
        <div class="card-content">
            <h3 class="card-title">${request.titulo || 'Sem título'}</h3>
            <p class="card-description">${request.descricao || 'Sem descrição'}</p>
            <div class="card-meta border-t border-gray-100">
                <div class="flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                        <circle cx="12" cy="10" r="3"></circle>
                    </svg>
                    ${request.localizacao || 'Local não especificado'}
                </div>
                <div class="urgency-${request.urgencia || 'medium'}">
                    ${request.status || 'Status desconhecido'}
                </div>
            </div>
            ${isCompleted ? `
                <div class="mt-4 pt-4 border-t border-gray-100">
                    <div>Concluído em: ${new Date(request.dataConclusao || new Date()).toLocaleDateString()}</div>
                    <div>Prestador: ${request.prestador?.nome || 'Não especificado'}</div>
                </div>
            ` : ''}
        </div>
    `;
    
    return card;
}

// Renderiza os serviços
function renderServices() {
    const grid = document.getElementById('servicesGrid');
    grid.innerHTML = '';
    
    if (availableServices.length === 0) {
        grid.innerHTML = '<p class="text-center text-gray-500 my-8">Nenhum serviço disponível no momento.</p>';
        return;
    }
    
    availableServices.forEach((service, index) => {
        const card = document.createElement('div');
        card.className = 'card';
        card.style.animationDelay = `${index * 0.1}s`;
        
        card.innerHTML = `
            <div class="service-category category-${service.categoria || 'default'}">
                ${service.categoria || 'Serviço'}
            </div>
            <div class="card-content">
                <h3 class="card-title">${service.nome || 'Serviço sem nome'}</h3>
                <p class="card-description">${service.descricao || 'Descrição não disponível'}</p>
                <div class="card-meta">
                    <div>
                        <span style="color: #f59e0b;">★</span> ${service.avaliacao?.toFixed(1) || '5.0'}
                    </div>
                </div>
            </div>
        `;
        
        grid.appendChild(card);
    });
}

// Função para salvar as alterações do perfil
async function saveProfileChanges(e) {
    e.preventDefault();
    
    try {
        const userId = localStorage.getItem('userId');
        const token = localStorage.getItem('authToken');
        
        if (!userId || !token) {
            throw new Error('Usuário não autenticado');
        }

        // Obtém os valores do formulário
        const fullName = document.getElementById('profileName').value;
        const [nome, ...sobrenomeParts] = fullName.split(' ');
        const sobrenome = sobrenomeParts.join(' ');
        
        // Extrai os componentes do endereço
        const addressParts = document.getElementById('profileAddress').value.split(',');
        const rua = addressParts[0]?.trim() || '';
        const estado = addressParts[1]?.trim() || '';
        const cep = addressParts[2]?.replace('CEP:', '').trim() || '';

        const updatedProfile = {
            nome: nome,
            sobrenome: sobrenome,
            email: document.getElementById('profileEmail').value,
            telefone: document.getElementById('profilePhone').value,
            rua: rua,
            estado: estado,
            cep: cep
        };

        const response = await fetch(`${API_BASE_URL}${USER_PROFILE_ENDPOINT}/${userId}`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(updatedProfile)
        });

        if (!response.ok) {
            throw new Error(`Erro ao atualizar perfil: ${response.statusText}`);
        }

        const updatedData = await response.json();
        currentUser = updatedData;
        updateUserUI();
        
        showToast('Sucesso', 'Perfil atualizado com sucesso!');
    } catch (error) {
        console.error('Erro ao salvar perfil:', error);
        showToast('Erro', 'Não foi possível atualizar o perfil', 'error');
    }
}

// Configura os event listeners
function setupEventListeners() {
    // Formulário de perfil
    document.getElementById('profileForm').addEventListener('submit', saveProfileChanges);
    
    // Logout
    document.getElementById('logoutBtn')?.addEventListener('click', () => {
        localStorage.removeItem('authToken');
        localStorage.removeItem('userId');
        window.location.href = '/login.html';
    });
    
    // Navegação entre abas
    document.querySelectorAll('.tab').forEach(tab => {
        tab.addEventListener('click', function() {
            const tabId = this.getAttribute('data-tab');
            
            document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
            document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
            
            this.classList.add('active');
            document.getElementById(`${tabId}Tab`).classList.add('active');
        });
    });
    
    // Menu mobile
    document.getElementById('menuToggle')?.addEventListener('click', function() {
        document.getElementById('navLinks').classList.toggle('active');
    });
    
    // Navegação entre páginas
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const pageId = this.getAttribute('data-page');
            navigateTo(pageId);
            
            // Recarrega dados específicos para cada página
            switch(pageId) {
                case 'home':
                    fetchAvailableServices(localStorage.getItem('authToken'));
                    break;
                case 'myrequests':
                    fetchUserRequests(localStorage.getItem('userId'), localStorage.getItem('authToken'));
                    break;
                case 'profile':
                    fetchUserProfile(localStorage.getItem('userId'), localStorage.getItem('authToken'))
                        .then(user => {
                            currentUser = user;
                            updateUserUI();
                        });
                    break;
            }
        });
    });
    
    // Botão para solicitar serviço
    document.getElementById('requestServiceBtn')?.addEventListener('click', function() {
        navigateTo('request');
    });
}

// Função para navegar entre páginas
function navigateTo(pageId) {
    document.querySelectorAll('.page').forEach(page => {
        page.classList.remove('active');
    });
    document.getElementById(pageId).classList.add('active');
    
    // Fecha o menu mobile se estiver aberto
    const navLinks = document.getElementById('navLinks');
    if(navLinks.classList.contains('active')) {
        navLinks.classList.remove('active');
    }
}

// Mostra/oculta loading
function showLoading(show) {
    const loader = document.getElementById('loadingOverlay');
    if (loader) {
        loader.style.display = show ? 'flex' : 'none';
    }
}













