// script.js

// URL base da API
const API_BASE_URL = 'http://168.231.92.116:8081';
const CATEGORIAS_API_URL = `${API_BASE_URL}/administracao/categoria`;

// Funcionalidade para o menu móvel
document.addEventListener('DOMContentLoaded', function() {
    const menuToggle = document.getElementById('menuToggle');
    const navMenu = document.getElementById('navMenu');
    
    if (menuToggle && navMenu) {
        menuToggle.addEventListener('click', function() {
            navMenu.classList.toggle('active');
        });
    }
    
    // Elementos do DOM
    const serviceForm = document.getElementById('serviceForm');
    const serviceList = document.getElementById('serviceList');
    const categorySelect = document.getElementById('serviceCategory');
    
    // Variável para armazenar o ID do serviço em edição
    let editingId = null;
    
    // Carregar categorias e serviços ao iniciar
    loadCategories();
    loadServices();
    
    // Manipular envio do formulário
    serviceForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const serviceName = document.getElementById('serviceName').value;
        const serviceDescription = document.getElementById('serviceDescription').value;
        const serviceCategory = document.getElementById('serviceCategory').value;
        
        if (editingId) {
            // Atualizar serviço existente
            updateService(editingId, serviceName, serviceDescription, serviceCategory);
            editingId = null;
        } else {
            // Adicionar novo serviço
            addService(serviceName, serviceDescription, serviceCategory);
        }
        
        // Limpar formulário
        serviceForm.reset();
    });
    
    // Função para carregar categorias do backend
    async function loadCategories() {
        try {
            // Primeiro, carregar categorias existentes
            const response = await fetch(`${CATEGORIAS_API_URL}/listar`);
            if (!response.ok) throw new Error('Erro ao carregar categorias');
            
            const categorias = await response.json();
            
            // Limpar e popular o select
            categorySelect.innerHTML = '<option value="" disabled selected>Selecione uma categoria</option>';
            
            categorias.forEach(categoria => {
                const option = document.createElement('option');
                option.value = categoria.id;
                option.textContent = categoria.nome;
                categorySelect.appendChild(option);
            });
            
        } catch (error) {
            console.error('Erro ao carregar categorias:', error);
            showError('Erro ao carregar categorias. Tente novamente mais tarde.');
        }
    }
    
    // Função para incluir uma nova categoria
    async function addCategory(nomeCategoria) {
        try {
            const response = await fetch(`${CATEGORIAS_API_URL}/incluir`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ nome: nomeCategoria })
            });
            
            if (!response.ok) throw new Error('Erro ao incluir categoria');
            
            const novaCategoria = await response.json();
            console.log('Categoria incluída com sucesso:', novaCategoria);
            
            // Recarregar categorias para incluir a nova
            await loadCategories();
            
            return novaCategoria;
            
        } catch (error) {
            console.error('Erro ao incluir categoria:', error);
            throw error;
        }
    }
    
    // Função para carregar serviços (usando localStorage como fallback)
    async function loadServices() {
        try {
            // Aqui você pode implementar a chamada ao backend para carregar serviços
            // Por enquanto, usando localStorage como exemplo
            const services = getServices();
            
            // Limpar a tabela
            serviceList.innerHTML = '';
            
            // Adicionar cada serviço à tabela
            services.forEach(service => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${service.id}</td>
                    <td>${service.name}</td>
                    <td>${service.description}</td>
                    <td>${getCategoryName(service.category)}</td>
                    <td>
                        <div class="action-buttons">
                            <button class="btn-action btn-edit" data-id="${service.id}">
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                                </svg>
                            </button>
                            <button class="btn-action btn-delete" data-id="${service.id}">
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                    <polyline points="3 6 5 6 21 6"></polyline>
                                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                                    <line x1="10" y1="11" x2="10" y2="17"></line>
                                    <line x1="14" y1="11" x2="14" y2="17"></line>
                                </svg>
                            </button>
                        </div>
                    </td>
                `;
                serviceList.appendChild(row);
            });
            
        } catch (error) {
            console.error('Erro ao carregar serviços:', error);
            showError('Erro ao carregar serviços. Tente novamente mais tarde.');
        }
    }
    
    // Função auxiliar para obter o nome da categoria
    function getCategoryName(categoryId) {
        const option = categorySelect.querySelector(`option[value="${categoryId}"]`);
        return option ? option.textContent : categoryId;
    }
    
    // Função para adicionar um novo serviço
    async function addService(name, description, category) {
        try {
            // Aqui você pode implementar a chamada POST para adicionar no backend
            // Por enquanto, usando localStorage como exemplo
            let services = getServices();
            const newId = services.length > 0 ? Math.max(...services.map(s => s.id)) + 1 : 1;
            
            services.push({
                id: newId,
                name: name,
                description: description,
                category: category
            });
            
            saveServices(services);
            await loadServices();
            
            showSuccess('Serviço adicionado com sucesso!');
            
        } catch (error) {
            console.error('Erro ao adicionar serviço:', error);
            showError('Erro ao adicionar serviço. Tente novamente.');
        }
    }
    
    // Função para atualizar um serviço existente
    async function updateService(id, name, description, category) {
        try {
            // Aqui você pode implementar a chamada PUT para atualizar no backend
            // Por enquanto, usando localStorage como exemplo
            let services = getServices();
            const index = services.findIndex(s => s.id == id);
            
            if (index !== -1) {
                services[index] = {
                    id: parseInt(id),
                    name: name,
                    description: description,
                    category: category
                };
                
                saveServices(services);
                await loadServices();
                
                showSuccess('Serviço atualizado com sucesso!');
            }
            
        } catch (error) {
            console.error('Erro ao atualizar serviço:', error);
            showError('Erro ao atualizar serviço. Tente novamente.');
        }
    }
    
    // Funções para manipulação do localStorage (temporário)
    function getServices() {
        const servicesJson = localStorage.getItem('fastHubServices');
        return servicesJson ? JSON.parse(servicesJson) : [];
    }
    
    function saveServices(services) {
        localStorage.setItem('fastHubServices', JSON.stringify(services));
    }
    
    // Funções para exibir mensagens
    function showSuccess(message) {
        alert(message); // Você pode substituir por um toast ou modal mais elegante
    }
    
    function showError(message) {
        alert(message); // Você pode substituir por um toast ou modal mais elegante
    }
    
    // Delegação de eventos para editar/excluir
    serviceList.addEventListener('click', function(e) {
        if (e.target.closest('.btn-edit')) {
            const button = e.target.closest('.btn-edit');
            const id = button.getAttribute('data-id');
            editService(id);
        }
        
        if (e.target.closest('.btn-delete')) {
            const button = e.target.closest('.btn-delete');
            const id = button.getAttribute('data-id');
            if (confirm('Tem certeza que deseja excluir este serviço?')) {
                deleteService(id);
            }
        }
    });
    
    // Função para editar serviço
    function editService(id) {
        const services = getServices();
        const service = services.find(s => s.id == id);
        
        if (service) {
            document.getElementById('serviceName').value = service.name;
            document.getElementById('serviceDescription').value = service.description;
            document.getElementById('serviceCategory').value = service.category;
            editingId = id;
        }
    }
    
    // Função para excluir serviço
    async function deleteService(id) {
        try {
            // Aqui você pode implementar a chamada DELETE para remover no backend
            // Por enquanto, usando localStorage como exemplo
            let services = getServices();
            services = services.filter(s => s.id != id);
            
            saveServices(services);
            await loadServices();
            
            if (editingId == id) {
                serviceForm.reset();
                editingId = null;
            }
            
            showSuccess('Serviço excluído com sucesso!');
            
        } catch (error) {
            console.error('Erro ao excluir serviço:', error);
            showError('Erro ao excluir serviço. Tente novamente.');
        }
    }
    
    // Exemplo de como chamar a função para incluir uma nova categoria
    // Você pode chamar isso a partir de um botão ou formulário adicional
    async function exemploIncluirCategoria() {
        const nomeCategoria = prompt('Digite o nome da nova categoria:');
        if (nomeCategoria) {
            try {
                await addCategory(nomeCategoria);
                alert('Categoria adicionada com sucesso!');
            } catch (error) {
                alert('Erro ao adicionar categoria: ' + error.message);
            }
        }
    }
    
    // Descomente para testar
    // window.exemploIncluirCategoria = exemploIncluirCategoria;
});