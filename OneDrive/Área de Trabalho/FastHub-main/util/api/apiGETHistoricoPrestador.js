document.addEventListener("DOMContentLoaded", function () {
    document.getElementById("btnHistorico").addEventListener("click", function () {
        const userId = localStorage.getItem("id");
        const token = localStorage.getItem("token");
        const urlbusca = `http://168.231.92.116:8081/prestador/solicitacao/${userId}`;
        fetch(urlbusca, {
            method: "GET",
            headers: {
                "Authorization": "Bearer " + token
            }
        })
        .then(response => {
            if (!response.ok) throw new Error("Erro na requisição");
            return response.json();
        })
        .then(lista => {
            alert( "heei: "+ lista);
            const container = document.getElementById("timelineContainer");
            container.innerHTML = ""; // limpa antes de popular

            lista.forEach(item => {
                const card = document.createElement("div");
                card.className = "timeline-item";
                card.innerHTML = `
                    <div class="timeline-icon">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none"
                            stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <polyline points="20 6 9 17 4 12"></polyline>
                        </svg>
                    </div>
                    <div class="timeline-content">
                        <div class="timeline-date">${new Date(item.dataCriacao).toLocaleDateString()}</div>
                        <h3 class="card-title">${item.titulo}</h3>
                        <p class="card-description">${item.descricao}</p>
                        <div class="card-meta">
                            <div>${item.cliente.nome} ${item.cliente.sobrenome}</div>
                            <div>${item.avaliacao?.nota ?? "Sem avaliação"}</div>
                        </div>
                    </div>
                `;
                container.appendChild(card);
            });
        })
        .catch(error => {
            console.error("Erro ao buscar histórico:", error);
        });
    });
});

