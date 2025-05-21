
    function carregarCategorias() {
       
        fetch('http://168.231.92.116:8081/administracao/categoria/listar', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        })
        .then(response => response.json())  // Resposta como JSON
        .then(data => {
            const selectElement = document.getElementById('serviceCategory');
            data.forEach(categoria => {
                const option = document.createElement('option');
                option.value = categoria.id;
                option.textContent = categoria.descricao;  // Usando 'descricao' ao invés de 'nome'
                selectElement.appendChild(option);
            });
        })
        .catch(error => {
            console.error('Erro ao carregar categorias:', error);
            document.getElementById('mensagem').innerText = 'Erro ao carregar categorias. Tente novamente.';
        });
    }

    // Chama a função quando o DOM estiver completamente carregado
    document.addEventListener('DOMContentLoaded', function() {
        carregarCategorias();
    });



// Lógica para capturar o envio do formulário
document.getElementById('serviceForm').addEventListener('submit', function(event) {
    event.preventDefault();  // Impede o envio padrão do formulário

    const nome = document.getElementById('nome').value;
    const descricao = document.getElementById('descricao').value;
    const categoriaId = document.getElementById('categoriaId').value;
    const servicoId = document.getElementById("servicoId").value;


    if(servicoId==="" ){
        criarServico(nome, descricao, categoriaId);
    }  else{
        editarServico(nome, descricao, categoriaId, servicoId);

    }
});

// Atualiza o hidden com o id da categoria selecionada
document.getElementById('serviceCategory').addEventListener('change', function() {
    const selectedCategory = this.options[this.selectedIndex];
    const categoriaId = selectedCategory.value;
    document.getElementById('categoriaId').value = categoriaId;
});

function criarServico(nome, descricao, categoriaId) {
    // Criação do objeto com os dados do serviço
    const servico = {
        nome: nome,
        descricao: descricao,
        categoriaId: categoriaId
    };

    // Envio da requisição para a API
    fetch('http://168.231.92.116:8081/administracao/servico/insere', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(servico)  // Envia os dados do serviço como JSON
    })
    .then(response => response.text())  // Aqui esperamos uma resposta do tipo texto
    .then(data => {
        // Verifica se o tipo de dado é string e se a resposta é "Criado com sucesso"
        if (typeof data === 'string' || data === "Criado com sucesso") {
           location.reload();
            // Atualiza a página ou faz outra ação, se necessário
        } else {
            alert('Erro ao criar o serviço: ' + data);
        }
    })
    .catch(error => {
        console.error('Erro ao criar o serviço:', error);
        alert('Erro ao criar o serviço. Tente novamente.');
    });
}



function editarServico(nome, descricao, categoriaId, id) {
    const servicoId = id

    const servico = {
        nome: nome,
        descricao: descricao,
        categoriaId: categoriaId
    };

    fetch(`http://168.231.92.116:8081/administracao/servico/editar/${servicoId}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(servico)
    })
    .then(response => {
        if (!response.ok) {
            throw new Error(`Erro ao editar o serviço: ${response.status}`);
        }
        return response.text();
    })
    .then(data => {
        alert('Serviço atualizado com sucesso!');
        location.reload();
    })
    .catch(error => {
        console.error('Erro ao editar o serviço:', error);
        alert('Erro ao editar o serviço. Verifique os dados e tente novamente.');
    });
}

