
function abreMenu(){
  const navMenu = document.getElementById('navLinks');
  if (navMenu) {
      navMenu.classList.toggle('active');
  }
}


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

  const url = `http://168.231.92.116:8081/prestador/solicitacao/lista/semAtendimento/${idUsuario}`;

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
          console.log("Proposta enviada com sucesso!");
          proposalForm.reset();
          proposalModal.style.display = "none";
        } else {
          const errorText = await response.text();
          console.log("Erro ao enviar proposta: " + errorText);
        }
      } catch (error) {
        console.error("Erro na requisição:", error);
        console.log("Erro de conexão. Tente novamente.");
      }
    });
  });
  



  function carregarHistorico() {
    const id = localStorage.getItem("id");
    const token = localStorage.getItem("token");
  
    if (!id || !token) {
      alert("Usuário não autenticado.");
      return;
    }
  
    const authorizationHeader = `Bearer ${token}`;
  
    fetch(`http://168.231.92.116:8081/prestador/solicitacao/lista/${id}`, {
      method: "GET",
      headers: {
        "Authorization": authorizationHeader,
        "Content-Type": "application/json"
      }
    })
    .then(response => response.json())
    .then(solicitacoes => {
      const container = document.getElementById("historico-container");
      container.innerHTML = "";
  
      solicitacoes.forEach(s => {
        const valorStatus = s.status.replace("_", " ") || "Indefinido";
  
        const item = document.createElement("div");
        item.classList.add("card");
        item.innerHTML = `
          <div class="service-category category-Hidraulico">${s.categoria?.descricao || ''}</div>
          <div class="card-content">
            <input type="hidden" value="${s.id}" id="solicitacao_${s.id}">
            <h3 class="card-title">${s.titulo} - ${s.servico?.nome || ''}</h3>
            <p class="card-description">${s.descricao || "Sem descrição"}</p>
            <div class="proposta-card"></div>
            <p class="badge"><strong>Status:</strong> ${valorStatus}</p>
          </div>
        `;
  
        // chama chamarProposta e só adiciona o item se houver proposta
        chamarProposta(s.id, item).then(temProposta => {
          if (temProposta) {
            container.appendChild(item);
          }
        }).catch(error => {
          console.error("Erro ao verificar proposta:", error);
        });
      });
    })
    .catch(error => {
      console.error("Erro ao carregar histórico:", error);
      console.log("Erro ao carregar histórico. " + error);
    });
  }
  
  function chamarProposta(id, item) {
    return new Promise((resolve, reject) => {
      const token = localStorage.getItem("token"); 
      const authorizationHeader = `Bearer ${token}`;
      const idUsuario = localStorage.getItem("id"); 
  
      fetch(`http://168.231.92.116:8081/prestador/proposta/listar/${idUsuario}/${id}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": authorizationHeader 
        }
      })
      .then(response => response.json())
      .then(propostas => {
        const container = item.querySelector('.proposta-card');
        container.innerHTML = ""; // limpa container
  
        if (Array.isArray(propostas) && propostas.length > 0) {
          const temFinalizada = propostas.some(p => p.statusPropostaEnum === "FINALIZADA_PRESTADOR");
  
          const propostasParaExibir = temFinalizada
            ? propostas.filter(p => p.statusPropostaEnum === "FINALIZADA_PRESTADOR")
            : propostas;
  
          propostasParaExibir.forEach(p => {
            let propostaHTML = `
              <div class="proposal-card">
                <div class="proposal-provider">
                  <span>${p.prestador?.nome || 'Prestador desconhecido'} ${p.prestador?.sobrenome || ''}</span>
                </div>
                <div class="proposal-price">R$ ${p.valorProposta?.toFixed(2) || "0,00"}</div>
                <p class="proposal-message">${p.descricao || 'Sem mensagem'}</p>
            `;
  
            if (p.statusPropostaEnum === "ACEITA_CLIENTE") {
              propostaHTML += `
                <div class="proposal-actions">
                  <button class="btn btn-sm btn-success accept-proposal-btn"
                    data-request-id="${p.solicitacaoModel.id}"
                    id="${p.id}"
                    data-proposal-id="${p.id}"
                    data-telefone="${p.prestador?.telefone || 'Telefone não disponível'}"
                    onclick="finalizarServico(this)">
                    Finalizar Proposta E Serviço
                  </button>
                  <button class="btn btn-sm btn-success accept-proposal-btn"
                    data-request-id="${p.solicitacaoModel.id}"
                    id="${p.id}"
                    data-proposal-id="${p.id}"
                    data-telefone="${p.prestador?.telefone || 'Telefone não disponível'}"
                    onclick="cancelarProposta(this)">
                    Cancelar Proposta E Serviço
                  </button>
                  
                  <br>
                </div>
                <div class="phone-display mt-2 text-primary" style="display:none;"></div>
              </div>`;
            } else if (p.statusPropostaEnum === "AGUARDANDO_RESPOSTA") {
              propostaHTML += `
                <div class="proposal-actions">
                  <button class="btn btn-sm btn-success accept-proposal-btn"
                    data-request-id="${p.solicitacaoModel.id}"
                    id="${p.id}"
                    data-proposal-id="${p.id}"
                    data-telefone="${p.prestador?.telefone || 'Telefone não disponível'}"
                  >
                    Aguardando uma Resposta
                  </button><br>
                </div>
              </div>`;
            } else if (p.statusPropostaEnum === "FINALIZADA_PRESTADOR") {
              propostaHTML += `
                <div class="proposal-actions">
                  <button class="btn btn-sm btn-success accept-proposal-btn"
                    data-request-id="${p.solicitacaoModel.id}"
                    id="${p.id}"
                    data-proposal-id="${p.id}"
                    data-telefone="${p.prestador?.telefone || 'Telefone não disponível'}"
                  >
                   Serviço já Realizado
                  </button><br>
                </div>
              </div>`;
            }

            else if (p.statusPropostaEnum === "CANCELADA") {
              propostaHTML += `
                <div class="proposal-actions">
                  <button class="btn btn-sm btn-success accept-proposal-btn"
                    data-request-id="${p.solicitacaoModel.id}"
                    id="${p.id}"
                    data-proposal-id="${p.id}"
                    data-telefone="${p.prestador?.telefone || 'Telefone não disponível'}"
                  >
                   Cancelado
                  </button><br>
                </div>
              </div>`;
            }
  
            container.innerHTML += propostaHTML;
          });
  
          resolve(true); // há propostas para exibir
        } else {
          resolve(false); // nenhuma proposta
        }
      })
      .catch(error => {
        console.error('Erro ao carregar propostas:', error);
        reject(error);
      });
    });
  }
  




  function finalizarServico(botao) {
    const propostaId = botao.getAttribute("data-proposal-id");
    const token = localStorage.getItem("token");
  
    if (!propostaId || !token) {
      alert("ID da proposta ou token não encontrado.");
      return;
    }
  
    const url = `http://168.231.92.116:8081/prestador/proposta/finalizar/${propostaId}`;
  
    fetch(url, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json"
      }
    })
    .then(response => {
      if (!response.ok) {
        return response.text().then(texto => { throw new Error(texto) });
      }
      return response.text(); // <- retorna o texto direto
    })
    .then(msg => {
      console.log(msg); // Ex: "Proposta finalizada com sucesso pelo prestador."
      carregarHistorico();
    })
    .catch(error => {
      console("Erro ao finalizar proposta: " + error.message);
      carregarHistorico();
    });
  }
  

  function cancelarProposta(botao){
    const propostaId = botao.getAttribute("data-proposal-id");
    const token = localStorage.getItem("token");
  
    if (!propostaId || !token) {
      alert("ID da proposta ou token não encontrado.");
      return;
    }

    alert(token);
    alert(propostaId);
  
    const url = `http://168.231.92.116:8081/prestador/proposta/cancelar/${propostaId}`;

    alert(url);
  
    fetch(url, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json"
      }
    })
    .then(response => {
      if (!response.ok) {
        return response.text().then(texto => { throw new Error(texto) });
      }
      return response.text(); // <- retorna o texto direto
    })
    .then(msg => {
      console.log(msg); // Ex: "Proposta finalizada com sucesso pelo prestador."
      carregarHistorico();
    })
    .catch(error => {
      console("Erro ao finalizar proposta: " + error.message);
      carregarHistorico();
    });
  }