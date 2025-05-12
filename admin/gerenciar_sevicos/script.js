


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
    loadServices();
    
    // Manipular envio do formulário
    
    
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
           
            loadServices();
        }
    }
    
    // Função para editar um serviço (carregar dados no formulário)
    function editService(id) {
        getServices().then(services => {
            const service = services.find(s => s.id == id);
            if (service) {
                document.getElementById("servicoId").value= service.id;
                document.getElementById('nome').value = service.nome;
                document.getElementById('descricao').value = service.descricao;
                document.getElementById('categoriaId').value = service.categoria?.id || '';
                editingId = id;
            }
        });
    }
    
    
    // Função para excluir um serviço
    function deleteService(id) {
        try{
        if (confirm('Tem certeza que deseja excluir este serviço?')) {
            fetch(`http://168.231.92.116:8081/administracao/servico/excluir/${id}`, {
                method: 'DELETE'
            })
            .then(response => {
                if (!response.ok) {
                    throw new Error(`Erro ao excluir: ${response.status}`);
                }
                return response.text(); // ou .json() se a resposta for JSON
            })
            .then(data => {
                console.log('Excluído com sucesso!');
                loadServices(); // Recarrega a lista após excluir
            })
            .catch(error => {
                console.error('Erro ao excluir serviço:', error);
                console.log('Erro ao excluir o serviço. Tente novamente.');
            });
            
        } }catch (error) {
            console.error('Erro ao carregar serviços:', error);
            showError('Erro ao carregar serviços. Tente novamente mais tarde.');
        }
    }
    
    
    // Função para obter serviços do localStorage
   // Função para obter serviços da API
async function getServices() {
   
    try {
        const response = await fetch('http://168.231.92.116:8081/administracao/servico/lista'); // ajuste o endpoint conforme sua API
        if (!response.ok) {
            throw new Error('Erro ao buscar serviços');
        }
        const services = await response.json();
        return services;
    } catch (error) {
        console.error('Erro ao buscar serviços:', error);
        return [];
    }
}

    
  
    // Função para carregar serviços na tabela
    // Carrega os serviços e exibe na tabela
async function loadServices() {
    const services = await getServices();
    const serviceList = document.getElementById('serviceList');
    serviceList.innerHTML = ''; // Limpa a tabela antes de preencher
    
    services.forEach(service => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${service.id}</td>
            <td>${service.nome}</td>
            <td>${service.descricao}</td>
            <td>${service.categoria?.descricao || 'N/A'}</td>
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
}

});