// Guarda a sessão (token, nome, telefone) no navegador.
var Sessao = {
  salvar: function (dados) {
    localStorage.setItem('sessao', JSON.stringify(dados));
  },
  ler: function () {
    try {
        
      return JSON.parse(localStorage.getItem('sessao'));
    } catch (e) {
      return null;
    }
  },
  limpar: function () {
    localStorage.removeItem('sessao');
  }
};
