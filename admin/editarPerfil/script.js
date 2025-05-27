// script.js

document.addEventListener('DOMContentLoaded', () => {
  const menuToggle = document.getElementById('menuToggle');
  const navMenu = document.getElementById('navMenu');

  // Toggle menu mobile
  menuToggle.addEventListener('click', () => {
    navMenu.classList.toggle('active');
  });

  // Preencher formulário com dados simulados
  document.getElementById('profileName').value = userData.name;
  document.getElementById('profileEmail').value = userData.email;
  document.getElementById('profilePhone').value = userData.phone;
  document.getElementById('profileAddress').value = userData.address;
  document.getElementById('profileNumber').value = userData.number;
  document.getElementById('profileCEP').value = userData.cep;
  document.getElementById('profileState').value = userData.state;
  document.getElementById('profileSpecialty').value = userData.specialty;
  document.getElementById('profileBio').value = userData.bio;

  // Form submit
  const form = document.getElementById('profileForm');
  form.addEventListener('submit', (e) => {
    e.preventDefault();

    // Simples validação
    const name = form.profileName.value.trim();
    const email = form.profileEmail.value.trim();

    if (!name || !email) {
      alert('Por favor, preencha os campos Nome e E-mail.');
      return;
    }

    // Aqui você pode chamar sua API POST para salvar dados
    // Exemplo: apiPOSTMeuPerfil_ADM.js

    alert('Perfil atualizado com sucesso!');

    // Opcional: você pode limpar ou atualizar dados do formulário aqui
  });
});
