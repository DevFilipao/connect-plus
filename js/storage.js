// Guarda a sessão (token, nome, telefone) no navegador.
// lembrar === false → só nesta aba (sessionStorage); senão → neste aparelho (localStorage).
var Sessao = {
  salvar: function (dados, lembrar) {
    var destino = lembrar === false ? sessionStorage : localStorage;
    var outro = destino === localStorage ? sessionStorage : localStorage;
    outro.removeItem('sessao');
    destino.setItem('sessao', JSON.stringify(dados));
  },
  ler: function () {
    try {
      return JSON.parse(sessionStorage.getItem('sessao') || localStorage.getItem('sessao'));
    } catch (e) {
      return null;
    }
  },
  limpar: function () {
    localStorage.removeItem('sessao');
    sessionStorage.removeItem('sessao');
  }
};
