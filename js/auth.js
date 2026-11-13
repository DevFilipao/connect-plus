// Sessão e acesso à API de contas. Usado em login.html e app.html.
function exigirLogin() {
  var s = Sessao.ler();
  if (!s || !s.token) {
    location.replace('login.html');
    return null;
  }
  return s;
}

async function sair() {
  var s = Sessao.ler();
  Sessao.limpar();
  if (s) {
    try { await chamarApi('logout', { token: s.token }); } catch (e) { /* ignora */ }
  }
  location.replace('login.html');
}

async function entrar(telefone, senha, lembrar) {
  var dados = await chamarApi('login', { telefone: telefone, senha: senha });
  Sessao.salvar(dados, lembrar);
  return dados;
}

function cadastrar(dados) {
  return chamarApi('cadastro', dados);
}
