document.addEventListener("DOMContentLoaded", function () {
    document.getElementById("btnMeuPerfil").addEventListener("click", function () {
      
        const userId = localStorage.getItem("id");
        const urlbusca = `http://168.231.92.116:8081/administracao/meuperfil/${userId}`;


        fetch(urlbusca)
            .then(response => response.json())
            .then(data => {
              console.log(data)
                document.getElementById("profileName").value = `${data.nome} ${data.sobrenome}`;
                document.getElementById("profileEmail").value = data.email;
                document.getElementById("profilePhone").value = data.telefone;
               // document.getElementById("profileAddress").value = `${data.rua}, ${data.cep} - ${data.estado}`;
            })
            .catch(error => {
                console.error("Erro ao buscar dados do perfil:", error);
            });

    });
});
