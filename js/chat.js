// Tela de conversas: lista, envio e polling.

var INTERVALO_MS = 500; // polling de mensagens
var INTERVALO_LISTA_MS = 8000; // atualização da lista de conversas

var sessao = exigirLogin();

var el = {
  app: document.getElementById('app'),
  nome: document.getElementById('meu-nome'),
  sair: document.getElementById('btn-sair'),
  formContato: document.getElementById('formModal'),
  erroContato: document.getElementById('erro-contato'),
  lista: document.getElementById('listaConversas'),
  avatar: document.getElementById('avatarGrupo'),
  titulo: document.getElementById('nomeGrupo'),
  status: document.getElementById('statusGrupo'),
  mensagens: document.getElementById('mensagens'),
  formMsg: document.getElementById('formMensagem'),
  texto: document.getElementById('campoMensagem')
};

el.sair.addEventListener('click', sair);


var conversaSelecionada = null;
var cacheMensagens = new Map();
var assinaturaLista = '';
var buscando = false;
var ultimaLista = 0;

// ---------------------------------------------------------------- erros

function tratarErro(e) {
  if (e.codigo === 'SESSAO') {
    Sessao.limpar();
    location.replace('login.html');
    return;
  }
  el.status.textContent = 'Sem conexão…';
  console.warn(e);
}

// ---------------------------------------------------------------- lista

async function carregarConversas() {
    const CONVERSA_IA = {
        id: 1,
        nome: "CONNECT+ AI",
        telefone: "Chat privado com a IA",
        mensagens: []
    };
    var lista = [CONVERSA_IA];
    var conversas = await chamarApi('conversas', { token: sessao.token });
    lista.push(...conversas);
    ultimaLista = Date.now();
    renderizarLista(lista);
}

function renderizarLista(lista) {
  var assinatura = JSON.stringify(lista);
  if (assinatura === assinaturaLista) return;
  assinaturaLista = assinatura;

  var fragmento = document.createDocumentFragment();
  lista.forEach(function (c) {
    var botao = document.createElement('button');
    botao.type = 'button';
    botao.dataset.id = c.id;
    botao.className = 'chat-contact' +
      (conversaSelecionada && conversaSelecionada.id === c.id ? ' selected' : '');

    var avatar = document.createElement('div');
    avatar.className = 'avatar';
    avatar.textContent = (c.nome || c.telefone || '?').charAt(0).toUpperCase();

    var info = document.createElement('div');
    info.className = 'contact-info';

    var nome = document.createElement('strong');
    nome.textContent = c.nome;

    var fone = document.createElement('small');
    fone.textContent = c.telefone;

    info.append(nome, fone);
    botao.append(avatar, info);
    botao.addEventListener('click', function () { selecionarConversa(c); });
    fragmento.appendChild(botao);
  });

  el.lista.textContent = '';
  el.lista.appendChild(fragmento);
}

async function selecionarConversa(c) {
  conversaSelecionada = c;
  abrirPagina("chat");

  el.lista.querySelectorAll('.chat-contact').forEach(function (botao) {
    botao.classList.toggle('selected', botao.dataset.id === String(c.id));
  });

  el.avatar.textContent = c.nome.charAt(0).toUpperCase();
  el.titulo.textContent = c.nome;
  el.status.textContent = '';
  el.formMsg.hidden = false;
  if (el.app) el.app.classList.add('em-conversa');
  el.texto.focus();
  pintarMensagens(obterCache(c).itens);

  try {
    await buscarMensagens();
  } catch (e) {
    tratarErro(e);
  }
}

// ---------------------------------------------------------------- mensagens

function obterCache(conv) {
  if (!cacheMensagens.has(conv.id)) {
    cacheMensagens.set(conv.id, { ultimoId: 0, ids: new Set(), itens: [] });
  }
  return cacheMensagens.get(conv.id);
}

async function buscarMensagens() {
  var conv = conversaSelecionada;
  if (!conv) return;
  var cache = obterCache(conv);
  var novas = await chamarApi('mensagens', {
    token: sessao.token,
    conversaId: conv.id,
    depoisId: cache.ultimoId
  });
  if (conv !== conversaSelecionada) return; // usuário trocou de conversa
  el.status.textContent = '';
  mostrarMensagens(cache, novas);
}

function renderizarMensagem(msg) {
  var minha = msg.de === sessao.telefone;
  var autor = minha ? sessao.nome : (msg.nome || msg.de || '?');

  var linha = document.createElement('div');
  linha.className = 'message-row' + (minha ? ' mine' : '');

//    var avatar = document.createElement('div');
//    avatar.className = 'message-avatar';
//    avatar.textContent = String(autor).charAt(0).toUpperCase();

  var conteudo = document.createElement('div');
  conteudo.className = 'message-content';

//    var nome = document.createElement('div');
//    nome.className = 'message-name';
//    nome.textContent = autor;

  var bolha = document.createElement('div');
  bolha.className = 'message-bubble';
  bolha.textContent = msg.texto;

  var hora = document.createElement('span');
  hora.className = 'message-time';
  hora.textContent = horaPtBR(new Date(msg.dataHora));

  conteudo.append(bolha, hora);
  linha.append(conteudo);
  return linha;
}

function pintarMensagens(itens) {
  var m = el.mensagens;
  var fragmento = document.createDocumentFragment();
  itens.forEach(function (msg) { fragmento.appendChild(renderizarMensagem(msg)); });
  m.textContent = '';
  m.appendChild(fragmento);
  m.scrollTop = m.scrollHeight;
}

function mostrarMensagens(cache, lista) {
  var novas = lista.filter(function (m) { return !cache.ids.has(m.id); });
  if (!novas.length) return;

  novas.forEach(function (msg) {
    cache.ids.add(msg.id);
    if (msg.id > cache.ultimoId) cache.ultimoId = msg.id;
    cache.itens.push(msg);
  });

  var m = el.mensagens;
  var noFim = m.scrollHeight - m.scrollTop - m.clientHeight < 80;
  var fragmento = document.createDocumentFragment();
  novas.forEach(function (msg) { fragmento.appendChild(renderizarMensagem(msg)); });
  m.appendChild(fragmento);

  if (noFim || novas.some(function (x) { return x.de === sessao.telefone; })) {
    m.scrollTop = m.scrollHeight;
  }
}

// ---------------------------------------------------------------- polling

async function tick() {
  if (document.hidden || buscando) return; // sem requisições sobrepostas
  buscando = true;
  try {
    if (conversaSelecionada) await buscarMensagens();
    if (Date.now() - ultimaLista > INTERVALO_LISTA_MS) await carregarConversas();
  } catch (e) {
    tratarErro(e);
  } finally {
    buscando = false;
  }
}

// ---------------------------------------------------------------- eventos

el.formContato.addEventListener('submit', async function (ev) {
  ev.preventDefault();
  var campoTelefone = document.getElementById('novo-telefone');
  if (!campoTelefone) return;

  var erroModal = document.getElementById('erro-modal');
  erroModal.textContent = '';
  try {
    var conv = await chamarApi('abrirConversa', {
      token: sessao.token,
      telefone: campoTelefone.value.trim()
    });
    fecharModal();
    selecionarConversa(conv);
    carregarConversas().catch(tratarErro);
  } catch (e) {
    if (e.codigo === 'SESSAO') return tratarErro(e);
    erroModal.style.backgroundColor = "#ff00001f";
    erroModal.style.border = "1px solid #ff000059";
    erroModal.style.borderRadius = "4px";
    erroModal.style.display = "block";
    erroModal.style.marginTop = "16px";
    erroModal.style.color = "red";
    erroModal.style.padding = "0.5em";
    erroModal.textContent = e.message;
  }
});

el.formMsg.addEventListener('submit', async function (ev) {
  ev.preventDefault();
  var texto = el.texto.value.trim();
  if (!texto || !conversaSelecionada) return;

  var conv = conversaSelecionada;
  var botao = el.formMsg.querySelector('button');
  el.texto.value = '';
  botao.disabled = true;
  try {
    await chamarApi('enviar', { token: sessao.token, conversaId: conv.id, texto: texto });
    await buscarMensagens();
  } catch (e) {
    el.texto.value = texto; // devolve o texto para reenviar
    tratarErro(e);
  } finally {
    botao.disabled = false;
    el.texto.focus();
  }
});


document.getElementById('novoChat').addEventListener('click', function () {
  abrirModal('chat');
  aplicarMascaraTelefone(document.getElementById('novo-telefone'));
});

document.getElementById('verInfo').addEventListener('click', function () {
  if (conversaSelecionada) {
    alert(conversaSelecionada.nome + '\n' + conversaSelecionada.telefone);
    return;
  }

  var conversa = obterConversa();
  if (!conversa) return;

  if (conversa.tipo === 'grupo') {
    var lista = (conversa.membros || [])
      .map(function (m) { return '• ' + m.nome + ' - ' + m.telefone; })
      .join('\n');
    alert(conversa.nome + '\n' + conversa.descricao + '\n\nParticipantes:\n• Você\n' + lista);
    return;
  }

  alert(conversa.nome + '\n' + conversa.descricao);
});


// ---------------------------------------------------------------- início

if (sessao) {
  el.nome.textContent = sessao.nome;
  carregarConversas().catch(tratarErro);
  setInterval(tick, INTERVALO_MS);
}
