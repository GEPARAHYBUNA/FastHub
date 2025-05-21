document.addEventListener("DOMContentLoaded", function () {
    // Obtém o ID do usuário do localStorage
    const userId = localStorage.getItem("id");

    if (!userId) {
        console.error("ID do usuário não encontrado no localStorage.");
        return;
    }

    // Define a URL para a requisição GET
    const urlbusca = `http://168.231.92.116:8081/administracao/meuperfil/${userId}`;

    // Realiza o GET para buscar os dados do perfil
    fetch(urlbusca)
        .then(response => response.json())
        .then(data => {
            // Preenche os dados do perfil na página
            document.getElementById("profileNameDisplay").textContent = `${data.nome} ${data.sobrenome}`;
            document.getElementById("profileEmailDisplay").textContent = data.email;
            document.getElementById("profilePhoneDisplay").textContent = data.telefone;

            document.getElementById("profileName").value = `${data.nome} ${data.sobrenome}`;
            document.getElementById("profileEmail").value = data.email;
            document.getElementById("profilePhone").value = data.telefone;
            document.getElementById("profileAddress").value = `${data.rua}, ${data.cep} - ${data.estado}`;
        })
        .catch(error => {
            console.error("Erro ao buscar dados do perfil:", error);
        });
});
