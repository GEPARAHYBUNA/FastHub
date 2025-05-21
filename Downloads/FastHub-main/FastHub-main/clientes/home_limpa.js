
function carregaFinalizadas() {
  const userId = localStorage.getItem("id");
  const token = localStorage.getItem("token");

  if (!userId || !token) {
    console.warn("ID do usuário ou token não encontrado no localStorage.");
    return;
  }

  fetch(`http://168.231.92.116:8081/cliente/solicitacao/lista/finalizadas/${userId}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    }
  })
    .then(response => {
      if (!response.ok) throw new Error("Erro ao buscar solicitações");
      return response.json();
    })
    .then(solicitacoes => {
      const completedTab = document.getElementById("completedTab");
      completedTab.innerHTML = "";

      if (solicitacoes.length === 0) {
        completedTab.innerHTML = "<p>Nenhuma solicitação finalizada encontrada.</p>";
        return;
      }

      solicitacoes.forEach(s => {
        const item = document.createElement("div");
        const espacador = document.createElement("div");
        item.classList.add("card", "completedTab", "tab-content", "active");

        let valorStatus = s.status.replace(/_/g, " ");
        

        item.innerHTML = `
          <div class="service-category category-alvenaria">${s.categoria?.descricao}</div>
          <div class="card-content">
            <input type="hidden" value="${s.id}" id="solicitacao_${s.id}">
            <h3 class="card-title">${s.titulo} - ${s.servico?.nome}</h3>
            <p class="card-description">${s.descricao || "Sem descrição"}</p>
            <div class="proposta-card"></div>
            <p class="badge"><strong>Status:</strong> ${valorStatus || "Indefinido"}</p>
          </div>
        `;

        espacador.innerHTML = `<div></div>`;

        completedTab.appendChild(item);
        completedTab.appendChild(espacador);
      });
    })
    .catch(error => {
      console.error("Erro:", error);
      document.getElementById("completedTab").innerHTML = "<p>Erro ao carregar solicitações.</p>";
    });
}


function carregaAtividade() {
   
    const userId = localStorage.getItem("id");
    const token = localStorage.getItem("token"); // Pegando o token do localStorage
  
    if (!userId || !token) {
      console.warn("ID do usuário ou token não encontrado no localStorage.");
      return;
    }
  
    fetch(`http://168.231.92.116:8081/cliente/solicitacao/lista/ativas/${userId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}` // <- Aqui vai o token
      }
    })
      .then(response => {
        if (!response.ok) throw new Error("Erro ao buscar solicitações");
        return response.json();
      })
      .then(solicitacoes => {
        const activeTab = document.getElementById("activeTab");
        activeTab.innerHTML = "";
  
        if (solicitacoes.length === 0) {
          activeTab.innerHTML = "<p>Nenhuma solicitação ativa encontrada.</p>";
          return;
        }
  
        solicitacoes.forEach(s => {
          const item = document.createElement("div");
          const espacador = document.createElement("div");
          item.classList.add("card", "activeTab", "tab-content", "active");
          let valorStatus='';
        
          if(s.status ==="SEM_ATENDIMENTO"){
            valorStatus = "SEM ATENDIMENTO";
          }else if(s.status==="FINALIZADO"){
            valorStatus ="FINALIZADO"
          }else if(s.status==="EM_ATENDIMENTO"){
            valorStatus = "EM ATENDIMENTO"
          }


          item.innerHTML = `
          
          <div class="service-category category-alvenaria">${s.categoria?.descricao}</div>
            <div class="card-content">
             <input type=hidden value="${s.id}" id="solicitacao_${s.id}">
              <h3 class="card-title">${s.titulo} - ${s.servico?.nome}</h3>
              <p class="card-description"> ${s.descricao || "Sem descrição"}</p>
              
              <div class="proposta-card"></div>

              <p class="badge"><strong>Status:</strong> ${valorStatus || "Indefinido"}</p>
              
            </div>
          `;


          espacador.innerHTML=` 
              <div></div>
          `;
        
          
          console.log(s);
          let elemento= document.getElementById("solicitacao_"+s.id);
          console.log(elemento);
          chamarProposta(s.id, item)
          
          activeTab.appendChild(item);
          activeTab.appendChild(espacador);

          
        });
      })
      .catch(error => {
        console.error("Erro:", error);
        document.getElementById("activeTab").innerHTML = "<p>...</p>";
      });
  }
  

function enviarSolicitacao(){
const tituloServico = document.getElementById("serviceTitle").value;
const categoriaId = document.getElementById("serviceCategory").value;
const servicoId = document.getElementById("serviceType").value;
const urgencia = document.getElementById("serviceUrgency").value;
const descricaoServico = document.getElementById("serviceDescription").value;

const token = localStorage.getItem("token");

const idClinte =localStorage.getItem("id");


const dados = {
    idCliente: idClinte,
    idServico: servicoId,
    idCategoria: categoriaId,
    prazo: urgencia,
    titulo: tituloServico,
    descricao: descricaoServico
  };


  fetch("http://168.231.92.116:8081/cliente/solicitacao/criar", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": "Bearer " + token
    },
  
    body: JSON.stringify(dados)
  })
  .then(response => {
    if (!response.ok) {
      throw new Error("Erro na requisição: " + response.status);
    }
    return response.json();
  })
  .then(data => {
    console.log("Sucesso:", data);
    location.reload();
    // você pode adicionar mais lógica aqui, como redirecionar ou exibir uma mensagem
  })
  .catch(error => {
    console.error("Erro ao enviar requisição:", error);
    location.reload();
  });

 
}


    document.addEventListener("DOMContentLoaded", function () {
    fetch("http://168.231.92.116:8081/administracao/categoria/listar")
        .then(response => response.json())
        .then(categorias => {
            const selectCategoria = document.getElementById("serviceCategory");
            categorias.forEach(categoria => {
                const option = document.createElement("option");
                option.value = categoria.id;
                option.textContent = categoria.descricao;
                selectCategoria.appendChild(option);
            });
        })
        .catch(error => {
            console.error("Erro ao buscar categorias:", error);
        });
});

// Evento para buscar os serviços quando uma categoria for selecionada
document.getElementById("serviceCategory").addEventListener("change", function () {
    const categoriaId = this.value;
    const selectServico = document.getElementById("serviceType");

    // Limpa os serviços anteriores
    selectServico.innerHTML = '<option value="">Selecione um tipo de serviço</option>';

    if (categoriaId) {
        fetch(`http://168.231.92.116:8081/administracao/servico/buscarServicoPorCategoria/${categoriaId}`)
            .then(response => response.json())
            .then(servicos => {
                servicos.forEach(servico => {
                    const option = document.createElement("option");
                    option.value = servico.id;
                    option.textContent = servico.nome;
                    selectServico.appendChild(option);
                });
            })
            .catch(error => {
                console.error("Erro ao buscar serviços:", error);
            });
    }
});
    
  
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

    document.addEventListener("DOMContentLoaded", function () {
    // Obter todos os links de navegação
    const navLinks = document.querySelectorAll('.nav-link');
    
    // Adicionar evento de clique a cada link
    navLinks.forEach(link => {
        link.addEventListener('click', function (event) {
            event.preventDefault();
            
            // Remover a classe 'active' de todas as seções
            document.querySelectorAll('.page').forEach(page => {
                page.classList.remove('active');
            });
            
            // Mostrar a página correspondente ao link clicado
            const pageId = link.getAttribute('data-page');
            document.getElementById(pageId).classList.add('active');
        });
    });
});

function chamarProposta(id, item){
  const token = localStorage.getItem("token"); 
  const authorizationHeader = `Bearer ${token}`;
  fetch(`http://168.231.92.116:8081/cliente/proposta/servico/listar/${id}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      "Authorization": authorizationHeader 
    }
  })
  .then(response => response.json())
  .then(propostas => {
    if (Array.isArray(propostas) && propostas.length > 0) {
      
      const container = item.querySelector('.proposta-card');
      propostas.forEach(p => {
        const propostaHTML = `
  <div class="proposal-card">
    <div class="proposal-provider">
      <div class="provider-icon">${(p.prestador?.nome || 'P')[0]}</div>
      <span>${p.prestador?.nome || 'Prestador desconhecido'} ${p.prestador?.sobrenome || ''}</span>
    </div>
    <div class="proposal-price">R$ ${p.valorProposta?.toFixed(2) || "0,00"}</div>
    <p class="proposal-message">${p.descricao || 'Sem mensagem'}</p>
    <div class="proposal-actions">
     <button class="btn btn-sm btn-success accept-proposal-btn"
        data-request-id="${p.solicitacaoModel.id}"
        id="${p.id}"
        data-proposal-id="${p.id}"
        data-telefone="${p.prestador?.telefone || 'Telefone não disponível'}"
        onclick="modalParaAbrirAceiteProposta(this)">
  Aceitar Proposta
</button>



    </div>
    <div class="phone-display mt-2 text-primary" style="display:none;"></div>
  </div>
`;

        container.innerHTML += propostaHTML;
      });
    }else{
      const propostaHTML = `
          <div class="proposal-card">
            <div class="proposal-provider">
              <div class="provider-icon">Sem Nenhuma Proposta no momento!</div>
            
            </div>
          </div>
        `;
        container.innerHTML += propostaHTML;
    }
  })
  .catch(error => console.error('Erro ao carregar propostas:', error));

return item;


}


function modalParaAbrirAceiteProposta(button) {
  const propostaId = button.getAttribute("data-proposal-id");
  const telefone = button.getAttribute("data-telefone");

  document.getElementById("valorDoIdPropostaParaEnviar").value=propostaId;


  document.getElementById("modal-aceite").style.display = "flex";
  document.getElementById("propostaIdAceite").value = propostaId;

  // Mostra o telefone no modal
  const telefoneElement = document.getElementById("telefonePrestador");
  telefoneElement.textContent = `Telefone do prestador: ${telefone}`;
}

function fecharModal() {
  document.getElementById("modal-aceite").style.display = "none";
  document.getElementById("valorDoIdPropostaParaEnviar").value="";

}
document.getElementById("formAceite").addEventListener("submit", function(e) {
  e.preventDefault();
  const propostaId = document.getElementById("propostaIdAceite").value;
  const token = localStorage.getItem("token");

  fetch(`http://168.231.92.116:8081/cliente/proposta/aceitar/${propostaId}`, {
    method: "POST",
    headers: {
      "Authorization": "Bearer " + token
    }
  })
  .then(response => {
    if (!response.ok) throw new Error("Erro ao aceitar proposta.");
    return response.json();
  })
  .then(data => {
    fecharModal();
    carregaAtividade();
  })
  .catch(error => {
    console.error(error);
    alert("Erro ao aceitar a proposta.");
  });
});

function aceitarPropostaCliente(){


  const token = localStorage.getItem('token'); // pega o token do localStorage
  const idProposta =  document.getElementById("valorDoIdPropostaParaEnviar").value;  

  fetch(`http://168.231.92.116:8081/cliente/proposta/aceitar/${idProposta}`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  })
  .then(response => {
    if (response.ok) {
      return response.text(); // ou response.json() se for JSON
    } else {
      throw new Error('Erro ao aceitar proposta');
    }
  })
  .then(data => {
   console.log(data);
  })
  .catch(error => {
    console.log(error);
  });

  document.getElementById("valorDoIdPropostaParaEnviar").value="";

}