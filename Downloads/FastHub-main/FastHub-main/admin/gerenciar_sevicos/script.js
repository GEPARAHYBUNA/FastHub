document.addEventListener('DOMContentLoaded', function () {
    const menuToggle = document.getElementById('menuToggle');
    const navMenu = document.getElementById('navMenu');
    const serviceForm = document.getElementById('serviceForm');
    const serviceList = document.getElementById('serviceList');
    const categorySelect = document.getElementById('serviceCategory');
  
    let editingId = null;
  
    if (menuToggle && navMenu) {
      menuToggle.addEventListener('click', function () {
        navMenu.classList.toggle('active');
      });
    }
  
    loadCategories();
    loadServices();
  
    serviceList.addEventListener('click', function (e) {
      const buttonEdit = e.target.closest('.btn-edit');
      const buttonDelete = e.target.closest('.btn-delete');
  
      if (buttonEdit) {
        const id = buttonEdit.getAttribute('data-id');
        editService(id);
      }
  
      if (buttonDelete) {
        const id = buttonDelete.getAttribute('data-id');
        showCustomConfirm('Tem certeza que deseja excluir este serviço?', () => {
          deleteService(id);
        });
      }
    });
  
    serviceForm.addEventListener('submit', function (e) {
      e.preventDefault();
  
      const nome = document.getElementById('nome').value.trim();
      const descricao = document.getElementById('descricao').value.trim();
      const categoriaId = categorySelect.value;
  
      if (!nome || !descricao || !categoriaId) {
        showAlert('error', 'Preencha todos os campos!');
        return;
      }
  
      const servico = {
        nome,
        descricao,
        categoria: { id: parseInt(categoriaId) }
      };
  
      const id = document.getElementById('servicoId').value;
      if (id) {
        updateService(id, servico);
      } else {
        createService(servico);
      }
    });
  
    function resetForm() {
      document.getElementById('servicoId').value = '';
      serviceForm.reset();
    }
  
    async function createService(servico) {
      try {
        const response = await fetch('http://168.231.92.116:8081/administracao/servico/criar', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(servico)
        });
  
        if (!response.ok) throw new Error('Erro ao criar serviço.');
  
        showAlert('success', 'Serviço criado com sucesso!');
        resetForm();
        loadServices();
      } catch (error) {
        console.error('Erro ao criar serviço:', error);
        showAlert('error', 'Erro ao criar serviço.');
      }
    }
  
    async function updateService(id, servico) {
      try {
        const response = await fetch(`http://168.231.92.116:8081/administracao/servico/atualizar/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(servico)
        });
  
        if (!response.ok) throw new Error('Erro ao atualizar serviço.');
  
        showAlert('success', 'Serviço atualizado com sucesso!');
        resetForm();
        loadServices();
      } catch (error) {
        console.error('Erro ao atualizar serviço:', error);
        showAlert('error', 'Erro ao atualizar serviço.');
      }
    }
  
    async function editService(id) {
      try {
        const services = await getServices();
        const service = services.find(s => s.id == id);
  
        if (service) {
          document.getElementById('servicoId').value = service.id;
          document.getElementById('nome').value = service.nome;
          document.getElementById('descricao').value = service.descricao;
          categorySelect.value = service.categoria?.id || '';
        }
      } catch (error) {
        console.error('Erro ao carregar serviço para edição:', error);
      }
    }
  
    async function deleteService(id) {
      try {
        const response = await fetch(`http://168.231.92.116:8081/administracao/servico/excluir/${id}`, {
          method: 'DELETE'
        });
  
        if (!response.ok) throw new Error('Erro ao excluir serviço.');
  
        showAlert('success', 'Serviço excluído com sucesso!');
        loadServices();
      } catch (error) {
        console.error('Erro ao excluir serviço:', error);
        showAlert('error', 'Erro ao excluir o serviço.');
      }
    }
  
    async function getServices() {
      try {
        const response = await fetch('http://168.231.92.116:8081/administracao/servico/lista');
        if (!response.ok) throw new Error('Erro ao buscar serviços');
        return await response.json();
      } catch (error) {
        console.error('Erro ao buscar serviços:', error);
        showAlert('error', 'Erro ao buscar serviços.');
        return [];
      }
    }
  
    async function loadServices() {
      const services = await getServices();
      serviceList.innerHTML = '';
  
      services.forEach(service => {
        const row = document.createElement('tr');
        row.innerHTML = `
          <td>${service.id}</td>
          <td>${service.nome}</td>
          <td>${service.descricao}</td>
          <td>${service.categoria?.descricao || 'N/A'}</td>
          <td>
            <div class="action-buttons">
              <button class="btn-action btn-edit" data-id="${service.id}">✏️</button>
              <button class="btn-action btn-delete" data-id="${service.id}">🗑️</button>
            </div>
          </td>
        `;
        serviceList.appendChild(row);
      });
    }
  
    async function loadCategories() {
      try {
        const response = await fetch('http://168.231.92.116:8081/administracao/categoria/lista');
        if (!response.ok) throw new Error('Erro ao buscar categorias');
  
        const categorias = await response.json();
        categorySelect.innerHTML = '<option value="" disabled selected>Selecione uma categoria</option>';
  
        categorias.forEach(cat => {
          const option = document.createElement('option');
          option.value = cat.id;
          option.textContent = cat.descricao;
          categorySelect.appendChild(option);
        });
      } catch (error) {
        console.error('Erro ao carregar categorias:', error);
        showAlert('error', 'Erro ao carregar categorias.');
      }
    }
  
    window.showAlert = function (type, message) {
      const alertBox = document.getElementById('alertBox');
      alertBox.className = `alert show ${type}`;
      alertBox.textContent = message;
  
      setTimeout(() => {
        alertBox.className = 'alert';
        alertBox.textContent = '';
      }, 4000);
    }
  
    // ✅ Função de confirmação customizada
    window.showCustomConfirm = function (message, onConfirm) {
      const modal = document.getElementById('confirmModal');
      const confirmMessage = document.getElementById('confirmMessage');
      const btnYes = document.getElementById('confirmYes');
      const btnNo = document.getElementById('confirmNo');
  
      confirmMessage.textContent = message;
      modal.classList.remove('hidden');
  
      function cleanUp() {
        btnYes.removeEventListener('click', yesHandler);
        btnNo.removeEventListener('click', noHandler);
        modal.classList.add('hidden');
      }
  
      function yesHandler() {
        cleanUp();
        onConfirm();
      }
  
      function noHandler() {
        cleanUp();
      }
  
      btnYes.addEventListener('click', yesHandler);
      btnNo.addEventListener('click', noHandler);
    };
  });
  