const mensagens = document.getElementById("mensagens");
const campoMensagem = document.getElementById("campoMensagem");
const formulario = document.getElementById("formMensagem");
const sugestao = document.getElementById("sugestao");
const textoSugestao = document.getElementById("textoSugestao");


const repositorio = criarRepositorio(localStorage);

// Usuário logado (sessão salva em js/storage.js)
const usuario = Sessao.ler();
const nomeUsuario = (usuario && usuario.nome ? usuario.nome.trim().split(" ")[0] : "") || "Maria";


const CONVERSA_IA = {
    id: 1,
    nome: "CONNECT+ AI",
    avatar: "C+",
    descricao: "Chat privado com a IA",
    mensagens: []
};


repositorio.limparConversasEMemoria();

let conversas = [CONVERSA_IA, ...repositorio.carregarGrupos()];
let tarefas = repositorio.carregarTarefas();
let eventos = repositorio.carregarEventos();
let enquetes = repositorio.carregarEnquetes();
let memoria = [];


let conversaAtual = CONVERSA_IA.id;
let sugestaoAtual = null;
let tipoModal = "";
let contatosGrupo = []; // contatos adicionados no modal "Novo grupo"


// FUNÇÕES AUXILIARES


function salvarDados() {
    repositorio.salvar({
        tarefas,
        eventos,
        enquetes,
        memoria,
        grupos: conversas.filter(c => c.tipo === "grupo")
    });
}


function gerarId() {
    return Date.now() + Math.floor(Math.random() * 1000);
}


function obterConversa() {
    return conversas.find(c => c.id === conversaAtual);
}


function criarVazio(titulo, descricao) {
    return `
        <div class="empty-state">
            <strong>${escaparHTML(titulo)}</strong>
            ${escaparHTML(descricao)}
        </div>
    `;
}


// NAVEGAÇÃO


const titulos = {
    chat: ["Conversas", "Converse e organize sua rotina."],
    tarefas: ["Minhas tarefas", "Organize suas atividades em um só lugar."],
    eventos: ["Eventos", "Organize seus compromissos."],
    enquetes: ["Enquetes", "Ajude seu grupo a tomar decisões."],
    memoria: ["Memória inteligente", "Informações importantes das suas conversas."]
};


function abrirPagina(pagina) {
    document.querySelectorAll(".view").forEach(view => {
        view.classList.remove("active");
    });


    document.getElementById(`view-${pagina}`).classList.add("active");


    document.querySelectorAll(".menu-item").forEach(botao => {
        botao.classList.toggle("active", botao.dataset.view === pagina);
    });


    document.getElementById("tituloPagina").textContent = titulos[pagina][0];
    document.getElementById("subtituloPagina").textContent = titulos[pagina][1];


    if (pagina === "tarefas") renderizarTarefas();
    if (pagina === "eventos") renderizarEventos();
    if (pagina === "enquetes") renderizarEnquetes();
    if (pagina === "memoria") renderizarMemoria();
}


document.querySelectorAll(".menu-item").forEach(botao => {
    botao.addEventListener("click", () => abrirPagina(botao.dataset.view));
});


document.querySelectorAll("[data-go]").forEach(botao => {
    botao.addEventListener("click", () => abrirPagina(botao.dataset.go));
});


// CRIAR NOVO GRUPO

/** Cria um novo grupo de conversa. 
document.getElementById("novoGrupo").addEventListener("click", () => {
    abrirModal("grupo");
});

function criarGrupo(nome, contatos) {
    const novo = {
        id: gerarId(),
        tipo: "grupo",
        nome,
        avatar: nome.charAt(0).toUpperCase(),
        descricao: `Grupo · ${contatos.length + 1} participantes`,
        membros: contatos,
        mensagens: []
    };


    conversas.push(novo);
    conversaAtual = novo.id;
    sugestaoAtual = null;
    sugestao.hidden = true;


    salvarDados();
    renderizarListaConversas();
    renderizarChat();
    abrirPagina("chat");
}

// ADICIONAR PARTICIPANTES A UM GRUPO JÁ CRIADO


document.getElementById("adicionarParticipantes").addEventListener("click", () => {
    const conversa = obterConversa();
    if (!conversa || conversa.tipo !== "grupo") return;

    abrirModal("participantes");
});

function adicionarParticipantes(conversa, novos) {
    conversa.membros = [...(conversa.membros || []), ...novos];
    conversa.descricao = `Grupo · ${conversa.membros.length + 1} participantes`;

    salvarDados();
    renderizarListaConversas();
    renderizarChat();
}


// Lista de contatos mostrada dentro do modal "Novo grupo"
function renderizarContatosGrupo() {
    const lista = document.getElementById("grupoContatos");
    if (!lista) return;

    if (!contatosGrupo.length) {
        lista.innerHTML = `<p class="muted">Nenhum contato adicionado ainda.</p>`;
        return;
    }

    lista.innerHTML = contatosGrupo.map((contato, indice) => `
        <div class="group-contact">
            <div class="avatar small-avatar">${escaparHTML(contato.nome.charAt(0).toUpperCase())}</div>
            <div class="group-contact-info">
                <strong>${escaparHTML(contato.nome)}</strong>
                <small>${escaparHTML(contato.telefone)}</small>
            </div>
            <button type="button" class="delete-button" data-remover-contato="${indice}" title="Remover contato">✕</button>
        </div>
    `).join("");

    lista.querySelectorAll("[data-remover-contato]").forEach(botao => {
        botao.addEventListener("click", () => {
            contatosGrupo.splice(Number(botao.dataset.removerContato), 1);
            renderizarContatosGrupo();
        });
    });
}


function adicionarContatoGrupo() {
    const campoNome = document.getElementById("grupoContatoNome");
    const campoNumero = document.getElementById("grupoContatoNumero");

    const nome = campoNome.value.trim();
    const telefone = campoNumero.value.trim();

    if (!nome || !telefone) {
        alert("Informe o nome e o número do contato.");
        return;
    }

    const jaNoGrupo = tipoModal === "participantes"
        ? (obterConversa()?.membros || [])
        : [];

    if (contatosGrupo.some(c => c.telefone === telefone) ||
        jaNoGrupo.some(c => c.telefone === telefone)) {
        alert("Esse número já está no grupo.");
        return;
    }

    contatosGrupo.push({ nome, telefone });
    campoNome.value = "";
    campoNumero.value = "";
    campoNome.focus();
    renderizarContatosGrupo();
}


function prepararModalGrupo() {
    contatosGrupo = [];
    renderizarContatosGrupo();

    document.getElementById("grupoAdicionarContato").addEventListener("click", adicionarContatoGrupo);

    // Enter nos campos de contato adiciona o contato (e não salva o grupo)
    ["grupoContatoNome", "grupoContatoNumero"].forEach(id => {
        document.getElementById(id).addEventListener("keydown", event => {
            if (event.key === "Enter") {
                event.preventDefault();
                adicionarContatoGrupo();
            }
        });
    });
}

*/


// RESUMO DE ATIVIDADES


function renderizarResumoAtividades() {
    const resumo = document.getElementById("resumoAtividades");
    const pendentes = tarefas.filter(t => !t.concluida).slice(0, 3);


    if (!pendentes.length && !eventos.length) {
        resumo.innerHTML = `<p class="muted">Nenhuma atividade cadastrada.</p>`;
        return;
    }


    const itens = [
        ...pendentes.map(t => ({
            titulo: t.titulo,
            detalhe: t.data ? formatarData(t.data) : "Tarefa pendente"
        })),
        ...eventos.slice(0, 3).map(e => ({
            titulo: e.titulo,
            detalhe: `${formatarData(e.data)}${e.horario ? " · " + e.horario : ""}`
        }))
    ].slice(0, 4);


    resumo.innerHTML = itens.map(item => `
        <div class="activity-item">
            <div class="activity-dot"></div>
            <div>
                <strong>${escaparHTML(item.titulo)}</strong>
                <small>${escaparHTML(item.detalhe)}</small>
            </div>
        </div>
    `).join("");
}


function atualizarTudo() {
    salvarDados();
    renderizarListaConversas();
    renderizarChat();
    renderizarTarefas();
    renderizarEventos();
    renderizarEnquetes();
    renderizarMemoria();
    renderizarResumoAtividades();
    renderizarResumoMemoria();


    document.getElementById("contadorTarefas").textContent =
        tarefas.filter(t => !t.concluida).length;
}
