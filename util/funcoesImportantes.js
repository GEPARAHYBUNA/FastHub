
window.onload = function() {
    const user = localStorage.getItem('token'); // ou 'token', etc.
    if (!user) {
      // Se não estiver logado, redireciona
      window.location.replace("../sistema/login/login.html");
    }
        }
        
        function sair() {
    localStorage.clear();
    // Substitui a página atual no histórico com a página de login
    window.location.replace("../sistema/login/login.html");
        }