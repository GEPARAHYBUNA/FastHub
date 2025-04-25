// Funcionalidade para o menu móvel
document.addEventListener('DOMContentLoaded', function() {
    const menuToggle = document.getElementById('menuToggle');
    const navMenu = document.getElementById('navMenu');
    
    if (menuToggle && navMenu) {
        menuToggle.addEventListener('click', function() {
            navMenu.classList.toggle('active');
        });
    }
    
    // Funcionalidade do formulário e da tabela
    const serviceForm = document.getElementById('serviceForm');
    const serviceList = document.getElementById('serviceList');
    
    // Variável para armazenar o ID do serviço em edição
    let editingId = null;
    
    // Carregar serviços do localStorage ao iniciar
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
    
    // Delegação de evento para botões de edição e exclusão
    serviceList.addEventListener('click', function(e) {
        // Verificar se o clique foi em um botão de editar
        if (e.target.closest('.btn-edit')) {
            const button = e.target.closest('.btn-edit');
            const id = button.getAttribute('data-id');
            editService(id);
        }
        
        // Verificar se o clique foi em um botão de excluir
        if (e.target.closest('.btn-delete')) {
            const button = e.target.closest('.btn-delete');
            const id = button.getAttribute('data-id');
            deleteService(id);
        }
    });
    
    // Função para adicionar um novo serviço
    function addService(name, description, category) {
        // Obter serviços existentes
        let services = getServices();
        
        // Gerar novo ID
        const newId = services.length > 0 ? Math.max(...services.map(s => s.id)) + 1 : 1;
        
        // Adicionar novo serviço
        services.push({
            id: newId,
            name: name,
            description: description,
            category: category
        });
        
        // Salvar e atualizar a interface
        saveServices(services);
        loadServices();
    }
    
    // Função para atualizar um serviço existente
    function updateService(id, name, description, category) {
        // Obter serviços existentes
        let services = getServices();
        
        // Encontrar e atualizar o serviço com o ID correspondente
        const index = services.findIndex(s => s.id == id);
        if (index !== -1) {
            services[index] = {
                id: parseInt(id),
                name: name,
                description: description,
                category: category
            };
            
            // Salvar e atualizar a interface
            saveServices(services);
            loadServices();
        }
    }
    
    // Função para editar um serviço (carregar dados no formulário)
    function editService(id) {
        // Obter serviços existentes
        let services = getServices();
        
        // Encontrar o serviço com o ID correspondente
        const service = services.find(s => s.id == id);
        if (service) {
            // Preencher o formulário com os dados do serviço
            document.getElementById('serviceName').value = service.name;
            document.getElementById('serviceDescription').value = service.description;
            document.getElementById('serviceCategory').value = service.category;
            
            // Definir o ID de edição
            editingId = id;
        }
    }
    
    // Função para excluir um serviço
    function deleteService(id) {
        // Solicitar confirmação
        if (confirm('Tem certeza que deseja excluir este serviço?')) {
            // Obter serviços existentes
            let services = getServices();
            
            // Filtrar serviços, removendo o que possui o ID correspondente
            services = services.filter(s => s.id != id);
            
            // Salvar e atualizar a interface
            saveServices(services);
            loadServices();
            
            // Se estiver editando o serviço que foi excluído, limpar o formulário
            if (editingId == id) {
                serviceForm.reset();
                editingId = null;
            }
        }
    }
    
    // Função para obter serviços do localStorage
    function getServices() {
        const servicesJson = localStorage.getItem('fastHubServices');
        return servicesJson ? JSON.parse(servicesJson) : [];
    }
    
    // Função para salvar serviços no localStorage
    function saveServices(services) {
        localStorage.setItem('fastHubServices', JSON.stringify(services));
    }
    
    // Função para carregar serviços na tabela
    function loadServices() {
        // Obter serviços
        const services = getServices();
        
        // Se não houver dados salvos e a tabela estiver vazia (primeira execução),
        // mantemos os dados de exemplo. Caso contrário, limpamos a tabela.
        if (services.length > 0 || serviceList.querySelector('tr:not(.example-row)')) {
            // Limpar a tabela
            serviceList.innerHTML = '';
            
            // Adicionar cada serviço à tabela
            services.forEach(service => {
                // Obter nome da categoria formatado
                let categoryName;
                switch (service.category) {
                    case 'eletrico': categoryName = 'Elétrico'; break;
                    case 'hidraulico': categoryName = 'Hidráulico'; break;
                    case 'ar-condicionado': categoryName = 'Ar-Condicionado'; break;
                    case 'limpeza': categoryName = 'Limpeza'; break;
                    case 'pintura': categoryName = 'Pintura'; break;
                    default: categoryName = 'Outro';
                }
                
                // Criar linha da tabela
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${service.id}</td>
                    <td>${service.name}</td>
                    <td>${service.description}</td>
                    <td>${categoryName}</td>
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
                
                // Adicionar à tabela
                serviceList.appendChild(row);
            });
        }
    }
});
