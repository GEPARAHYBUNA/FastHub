// Suponha que este script seja incluído na página do painel (dashboard.html)

let currentUser = null;
let userRequests = [];
let availableServices = [];

window.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('authToken');
    if (!token) {
        window.location.href = '/login.html';
        return;
    }

    fetchUserInfo(token)
        .then(user => {
            currentUser = user;
            updateUserUI();
            fetchUserRequests(user.id, token);
            fetchAvailableServices(token);
        })
        .catch(error => {
            console.error('Erro ao carregar dados do usuário:', error);
            localStorage.removeItem('authToken');
            window.location.href = '/login.html';
        });
});

function fetchUserInfo(token) {
    return fetch('http://172.22.109.92:8081/usuario', {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    })
    .then(res => {
        if (!res.ok) throw new Error('Falha ao obter usuário');
        return res.json();
    });
}

function fetchUserRequests(userId, token) {
    fetch(`http://172.22.109.92:8081/usuarios/${userId}/solicitacoes`, {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    })
    .then(res => res.json())
    .then(data => {
        userRequests = data;
        generateActiveRequests();
        generateCompletedRequests();
    })
    .catch(err => {
        console.error('Erro ao buscar solicitações:', err);
    });
}

function fetchAvailableServices(token) {
    fetch('http://172.22.109.92:8081/servicos', {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    })
    .then(res => res.json())
    .then(data => {
        availableServices = data;
        generateServiceCards();
    })
    .catch(err => {
        console.error('Erro ao buscar serviços:', err);
    });
}

function updateUserUI() {
    document.getElementById('profileNameDisplay').textContent = currentUser.nome || 'Usuário';
    document.getElementById('profileEmailDisplay').textContent = currentUser.email || 'email@exemplo.com';
    document.getElementById('profilePhoneDisplay').textContent = currentUser.telefone || '';
    document.getElementById('profileImage').textContent = (currentUser.nome?.[0] || 'U').toUpperCase();

    document.getElementById('profileName').value = currentUser.nome || '';
    document.getElementById('profileEmail').value = currentUser.email || '';
    document.getElementById('profilePhone').value = currentUser.telefone || '';
    document.getElementById('profileAddress').value = currentUser.endereco || '';
}

function generateActiveRequests() {
    const container = document.getElementById('activeRequestsContainer');
    container.innerHTML = '';

    const activeRequests = userRequests.filter(req => req.status !== 'concluído');

    if (activeRequests.length === 0) {
        container.innerHTML = '<p>Nenhuma solicitação ativa encontrada.</p>';
        return;
    }

    activeRequests.forEach(req => {
        const div = document.createElement('div');
        div.className = 'request-card';
        div.innerHTML = `<strong>${req.titulo}</strong><p>${req.descricao}</p><span>Status: ${req.status}</span>`;
        container.appendChild(div);
    });
}

function generateCompletedRequests() {
    const container = document.getElementById('completedRequestsContainer');
    container.innerHTML = '';

    const completedRequests = userRequests.filter(req => req.status === 'concluído');

    if (completedRequests.length === 0) {
        container.innerHTML = '<p>Nenhuma solicitação concluída encontrada.</p>';
        return;
    }

    completedRequests.forEach(req => {
        const div = document.createElement('div');
        div.className = 'request-card completed';
        div.innerHTML = `<strong>${req.titulo}</strong><p>${req.descricao}</p><span>Finalizado</span>`;
        container.appendChild(div);
    });
}

function generateServiceCards() {
    const container = document.getElementById('availableServicesContainer');
    container.innerHTML = '';

    if (availableServices.length === 0) {
        container.innerHTML = '<p>Nenhum serviço disponível no momento.</p>';
        return;
    }

    availableServices.forEach(service => {
        const div = document.createElement('div');
        div.className = 'service-card';
        div.innerHTML = `<h3>${service.nome}</h3><p>${service.descricao}</p>`;
        container.appendChild(div);
    });
}

// Sugestão para logout:
document.getElementById('logoutBtn').addEventListener('click', () => {
    localStorage.removeItem('authToken');
    window.location.href = '/login.html';
});
