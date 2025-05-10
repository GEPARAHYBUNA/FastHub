// Variáveis globais
let selectedService = null;
const proposalModal = document.getElementById('proposalModal');
const modalClose = document.getElementById('modalClose');
const serviceTitle = document.getElementById('serviceTitle');
const serviceDescription = document.getElementById('serviceDescription');
const proposalForm = document.getElementById('proposalForm');
const proposalPrice = document.getElementById('proposalPrice');
const proposalPhone = document.getElementById('proposalPhone');
const proposalMessage = document.getElementById('proposalMessage');
const submitProposal = document.getElementById('submitProposal');
const toastContainer = document.getElementById('toastContainer');

// Função para buscar os dados da API
async function fetchServices() {
  const token = localStorage.getItem("token");
  const idUsuario = localStorage.getItem("id");

  if (!token || !idUsuario) {
    console.error("Token ou ID de usuário não encontrado no localStorage.");
    return;
  }

  const url = `http://168.231.92.116:8081/prestador/solicitacao/lista/${idUsuario}`;

  try {
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Authorization": "Bearer " + token,
        "Content-Type": "application/json"
      }
    });

    if (!response.ok) {
      throw new Error(`Erro na requisição: ${response.status}`);
    }

    const data = await response.json();
    generateServiceCards(data); // Chama a função para gerar os cards com os dados recebidos da API
  } catch (error) {
    console.error("Erro ao carregar solicitações da API:", error);
  }
}

// Função para gerar os cards de serviço
function generateServiceCards(serviceData) {
  const grid = document.getElementById('serviceGrid');
  grid.innerHTML = '';
  
  serviceData.forEach((service, index) => {
    const card = document.createElement('div');
    card.className = 'card';
    card.style.animationDelay = `${index * 0.1}s`;
    
    card.innerHTML = `
      <div class="service-category category-${service.categoria.descricao}">${service.categoria.descricao}</div>
      <div class="card-content">
        <h3 class="card-title">${service.titulo}</h3>
        <p class="card-description">${service.descricao}</p>
        
        <div class="card-meta"">
          
          <div class="card-urgency prazo">
            ${service.prazo}
          </div>
        </div>
        
        <div class="contact">
          <div class="contact-title">Solicitado por:</div>
          <div class="contact-info">
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                                    <circle cx="12" cy="7" r="4"></circle>
                                </svg>
                                <span class="contact-name">${service.cliente.nome}</span>
                            </div>
          
        </div>
      </div>
      <div class="action">
        <button class="btn" value="${service.id}" data-service-id="${service.id}">
          Aceitar Serviço
        </button>
      </div>
    `;
    
    grid.appendChild(card);
  });
  
  // Adiciona event listeners para botões de aceitar serviço
  document.querySelectorAll('.action .btn').forEach(button => {
    button.addEventListener('click', () => {
      const serviceId = parseInt(button.getAttribute('data-service-id'));
      document.getElementById("solicitacaoIdParaProposta").value = serviceId;

      openProposalModal(serviceId, serviceData); // Passa o serviceData
    });
  });
  
  // Adiciona event listeners para botões de contato
  document.querySelectorAll('.contact-btn').forEach(button => {
    button.addEventListener('click', () => {
      const action = button.getAttribute('data-action');
      const client = button.getAttribute('data-client');
      handleContactAction(action, client);
    });
  });
}

// Função para abrir o modal de proposta
function openProposalModal(serviceId, serviceData) {
  selectedService = serviceData.find(service => service.id === serviceId);
  
  if (selectedService) {
   
    serviceTitle.textContent = selectedService.titulo; // Corrigido para usar 'titulo'
    serviceDescription.textContent = selectedService.descricao; // Corrigido para usar 'descricao'
    proposalModal.classList.add('active');
    proposalModal.style.display="flex";

    
    // Limpa o formulário
    proposalForm.reset();
    
    // Pre-preenche telefone do usuário
    proposalPhone.value = "";
  }
}

// Função para controlar a navegação das seções
function navigateToPage(pageId) {
  const sections = document.querySelectorAll('.page');
  sections.forEach(section => {
    if (section.id === pageId) {
      section.classList.add('active');
    } else {
      section.classList.remove('active');
    }
  });
}

// Event listener para navegação entre as páginas
document.querySelectorAll('.nav-link').forEach(link => {
  link.addEventListener('click', (event) => {
    event.preventDefault();
    const pageId = event.target.getAttribute('data-page');
    navigateToPage(pageId);
  });
});

// Chama a função para buscar os dados da API
fetchServices();

document.addEventListener('DOMContentLoaded', function () {
    const closeBtn = document.getElementById('modalClose');
    const modal = document.getElementById('proposalModal');

    closeBtn.addEventListener('click', function () {
      document.getElementById("solicitacaoIdParaProposta").value ="";
      modal.style.display = 'none';
    });

    // (opcional) fecha ao clicar fora do modal
    window.addEventListener('click', function (e) {
        if (e.target === modal) {
            modal.style.display = 'none';
        }
    });
});


document.addEventListener('DOMContentLoaded', function () {


    modalClose.addEventListener('click', function () {
      proposalModal.style.display = 'none';
    });
  
    window.addEventListener('click', function (e) {
      if (e.target === proposalModal) {
        proposalModal.style.display = 'none';
      }
    });
  
    submitProposal.addEventListener("click", async function () {
      const valor = parseFloat(proposalPrice.value.replace(",", "."));
      const descricao = proposalMessage.value.trim();
      const solicitacaoId = document.getElementById("solicitacaoIdParaProposta").value;
      const idPrestador = parseInt(localStorage.getItem("id"));
      const token = localStorage.getItem("token");
      
  



      if (!descricao || isNaN(valor) || isNaN(solicitacaoId) || isNaN(idPrestador) || !token) {
        alert("Preencha todos os campos corretamente e verifique o login.");
        return;
      }
      alert(descricao);
      const payload = { valor, descricao, solicitacaoId, idPrestador };
  
      try {
        const response = await fetch("http://168.231.92.116:8081/prestador/proposta/enviar", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": "Bearer " + token
          },
          body: JSON.stringify(payload)
        });
  
        if (response.ok) {
          alert("Proposta enviada com sucesso!");
          proposalForm.reset();
          proposalModal.style.display = "none";
        } else {
          const errorText = await response.text();
          alert("Erro ao enviar proposta: " + errorText);
        }
      } catch (error) {
        console.error("Erro na requisição:", error);
        alert("Erro de conexão. Tente novamente.");
      }
    });
  });
  




  