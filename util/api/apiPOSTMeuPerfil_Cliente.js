document.getElementById("profileForm").addEventListener("submit", function (e) {
    e.preventDefault();

    const id = localStorage.getItem("id");

    const dadosAtualizados = {
        nome: document.getElementById("profileName").value,
        email: document.getElementById("profileEmail").value,
        telefone: document.getElementById("profilePhone").value,
        endereco: document.getElementById("profileAddress").value
    };

    const token = localStorage.getItem("token");

    if (!token) {
        alert("Token de autenticação não encontrado. Faça login novamente.");
        return;
    }

    fetch(`http://168.231.92.116:8081/prestador/meuperfil/alterar/${id}`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(dadosAtualizados)
    })
    .then(response => {
        if (!response.ok) {
            console.log("ERRO");
            throw new Error("Erro ao atualizar perfil");
        }

        // Verificar se a resposta não é JSON
        if (response.headers.get("Content-Type").includes("application/json")) {
            return response.json();
        } else {
            return response.text(); // caso seja uma string
        }
    })
    .then(data => {
        if (typeof data === 'string') {
            // Se a resposta for uma string (por exemplo, "Editado Com Sucesso")
            alert(data);
        } else {
            // Caso contrário, processe os dados JSON
            alert("Perfil atualizado com sucesso!");
            console.log(data);
        }
    })
    .catch(error => {
        console.error("Erro:", error);
        alert("Ocorreu um erro ao atualizar o perfil.");
    });
});
