const mensagens = document.getElementById("mensagens");
const campoMensagem = document.getElementById("campoMensagem");
const formulario = document.getElementById("formMensagem");
const sugestao = document.getElementById("sugestao");
const textoSugestao = document.getElementById("textoSugestao");
const modal = document.getElementById("modal");
const modalTitulo = document.getElementById("modalTitulo");
const modalCampos = document.getElementById("modalCampos");
const formModal = document.getElementById("formModal");


// DADOS SALVOS NO NAVEGADOR

=======
"use strict";

/* =========================================================
   CONNECT+ — script.js (reestruturado)
   Use no HTML: <script src="script.js" defer></script>
   ========================================================= */

// ---------- 1. HELPERS DE DOM ----------

const $ = id => document.getElementById(id);

// Adiciona evento sem quebrar o script se o elemento não existir
function on(id, evento, fn) {
    const elemento = $(id);
    if (!elemento) {
        console.warn(`Elemento #${id} não encontrado no HTML.`);
        return;
    }
    elemento.addEventListener(evento, fn);
}

// Liga um evento a todos os elementos de um seletor dentro de um container
function vincular(container, seletor, fn) {
    container.querySelectorAll(seletor).forEach(item => {
        item.addEventListener("click", () => fn(item));
    });
}

const el = {
    mensagens: $("mensagens"),
    campoMensagem: $("campoMensagem"),
    formulario: $("formMensagem"),
    sugestao: $("sugestao"),
    textoSugestao: $("textoSugestao"),
    botaoCriarAcao: $("criarAcao"),
    modal: $("modal"),
    modalTitulo: $("modalTitulo"),
    modalCampos: $("modalCampos"),
    formModal: $("formModal")
};

// ---------- 2. ESTADO E ARMAZENAMENTO ----------
>>>>>>> c375084dd465732e06c79ea8bbd3deaf94c79f6e

function carregarDados(chave, padrao) {
    try {
        const dados = localStorage.getItem(chave);
        return dados ? JSON.parse(dados) : padrao;
    } catch {
        return padrao;
    }
}

<<<<<<< HEAD

let conversas = carregarDados("connect_conversas", [
=======
const conversasPadrao = [
>>>>>>> c375084dd465732e06c79ea8bbd3deaf94c79f6e
    {
        id: 1,
        nome: "Time de Futsal",
        avatar: "F",
        descricao: "Grupo de conversa · 8 participantes",
        mensagens: [
<<<<<<< HEAD
            {
                autor: "Lucas",
                texto: "Pessoal, precisamos organizar o próximo jogo do time!",
                hora: "09:30",
                minha: false
            },
            {
                autor: "Ana",
                texto: "Podemos jogar sábado à tarde. Quem consegue ir?",
                hora: "09:32",
                minha: false
            },
            {
                autor: "Maria",
                texto: "Boa ideia! Precisamos confirmar o local e o horário.",
                hora: "09:35",
                minha: true
            }
=======
            { autor: "Lucas", texto: "Pessoal, precisamos organizar o próximo jogo do time!", hora: "09:30", minha: false },
            { autor: "Ana", texto: "Podemos jogar sábado à tarde. Quem consegue ir?", hora: "09:32", minha: false },
            { autor: "Maria", texto: "Boa ideia! Precisamos confirmar o local e o horário.", hora: "09:35", minha: true }
>>>>>>> c375084dd465732e06c79ea8bbd3deaf94c79f6e
        ]
    },
    {
        id: 2,
        nome: "Amigos da escola",
        avatar: "A",
        descricao: "Grupo de conversa · 5 participantes",
        mensagens: [
<<<<<<< HEAD
            {
                autor: "Julia",
                texto: "Gente, não esqueçam da prova de matemática!",
                hora: "10:10",
                minha: false
            },
            {
                autor: "Maria",
                texto: "Vou separar um tempo para estudar hoje.",
                hora: "10:12",
                minha: true
            }
        ]
    }
]);


let tarefas = carregarDados("connect_tarefas", []);
let eventos = carregarDados("connect_eventos", []);
let enquetes = carregarDados("connect_enquetes", []);
let memoria = carregarDados("connect_memoria", []);


let conversaAtual = conversas[0]?.id ?? null;
let sugestaoAtual = null;
let tipoModal = "";


// FUNÇÕES AUXILIARES


function salvarDados() {
    localStorage.setItem("connect_conversas", JSON.stringify(conversas));
    localStorage.setItem("connect_tarefas", JSON.stringify(tarefas));
    localStorage.setItem("connect_eventos", JSON.stringify(eventos));
    localStorage.setItem("connect_enquetes", JSON.stringify(enquetes));
    localStorage.setItem("connect_memoria", JSON.stringify(memoria));
}


function escaparHTML(texto) {
    return String(texto).replace(/[&<>"']/g, caractere => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
    })[caractere]);
}


function horarioAtual() {
    return new Date().toLocaleTimeString("pt-BR", {
        hour: "2-digit",
        minute: "2-digit"
    });
}


=======
            { autor: "Julia", texto: "Gente, não esqueçam da prova de matemática!", hora: "10:10", minha: false },
            { autor: "Maria", texto: "Vou separar um tempo para estudar hoje.", hora: "10:12", minha: true }
        ]
    }
];

const estado = {
    conversas: carregarDados("connect_conversas", conversasPadrao),
    tarefas: carregarDados("connect_tarefas", []),
    eventos: carregarDados("connect_eventos", []),
    enquetes: carregarDados("connect_enquetes", []),
    memoria: carregarDados("connect_memoria", []),
    conversaAtual: null,
    sugestao: null,   // { tipo, texto }
    tipoModal: ""
};

estado.conversaAtual = estado.conversas[0]?.id ?? null;

function salvarDados() {
    localStorage.setItem("connect_conversas", JSON.stringify(estado.conversas));
    localStorage.setItem("connect_tarefas", JSON.stringify(estado.tarefas));
    localStorage.setItem("connect_eventos", JSON.stringify(estado.eventos));
    localStorage.setItem("connect_enquetes", JSON.stringify(estado.enquetes));
    localStorage.setItem("connect_memoria", JSON.stringify(estado.memoria));
}

// ---------- 3. UTILITÁRIOS ----------

function escaparHTML(texto) {
    return String(texto).replace(/[&<>"']/g, c => ({
        "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
    })[c]);
}

function horarioAtual() {
    return new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
}

>>>>>>> c375084dd465732e06c79ea8bbd3deaf94c79f6e
function dataAtual() {
    const agora = new Date();
    return [
        agora.getFullYear(),
        String(agora.getMonth() + 1).padStart(2, "0"),
        String(agora.getDate()).padStart(2, "0")
    ].join("-");
}

<<<<<<< HEAD

=======
>>>>>>> c375084dd465732e06c79ea8bbd3deaf94c79f6e
function gerarId() {
    return Date.now() + Math.floor(Math.random() * 1000);
}

<<<<<<< HEAD

function obterConversa() {
    return conversas.find(c => c.id === conversaAtual);
}


function formatarData(data) {
    if (!data) return "Sem data definida";


    const partes = data.split("-");
    if (partes.length !== 3) return data;


    return `${partes[2]}/${partes[1]}/${partes[0]}`;
}


=======
function formatarData(data) {
    if (!data) return "Sem data definida";
    const partes = data.split("-");
    return partes.length === 3 ? `${partes[2]}/${partes[1]}/${partes[0]}` : data;
}

>>>>>>> c375084dd465732e06c79ea8bbd3deaf94c79f6e
function criarVazio(titulo, descricao) {
    return `
        <div class="empty-state">
            <strong>${escaparHTML(titulo)}</strong>
            ${escaparHTML(descricao)}
<<<<<<< HEAD
        </div>
    `;
}


// NAVEGAÇÃO

=======
        </div>`;
}

function obterConversa() {
    return estado.conversas.find(c => c.id === estado.conversaAtual);
}

// ---------- 4. NAVEGAÇÃO ----------
>>>>>>> c375084dd465732e06c79ea8bbd3deaf94c79f6e

const titulos = {
    chat: ["Conversas", "Converse e organize sua rotina."],
    tarefas: ["Minhas tarefas", "Organize suas atividades em um só lugar."],
    eventos: ["Eventos", "Organize seus compromissos."],
    enquetes: ["Enquetes", "Ajude seu grupo a tomar decisões."],
    memoria: ["Memória inteligente", "Informações importantes das suas conversas."]
};

<<<<<<< HEAD

function abrirPagina(pagina) {
    document.querySelectorAll(".view").forEach(view => {
        view.classList.remove("active");
    });


    document.getElementById(`view-${pagina}`).classList.add("active");

=======
function abrirPagina(pagina) {
    if (!titulos[pagina] || !$(`view-${pagina}`)) return;

    document.querySelectorAll(".view").forEach(v => v.classList.remove("active"));
    $(`view-${pagina}`).classList.add("active");
>>>>>>> c375084dd465732e06c79ea8bbd3deaf94c79f6e

    document.querySelectorAll(".menu-item").forEach(botao => {
        botao.classList.toggle("active", botao.dataset.view === pagina);
    });

<<<<<<< HEAD

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


// CONVERSAS


function renderizarListaConversas() {
    const lista = document.getElementById("listaConversas");


    lista.innerHTML = conversas.map(conversa => {
        const ultima = conversa.mensagens.at(-1);


        return `
            <button class="chat-contact ${conversa.id === conversaAtual ? "selected" : ""}"
=======
    $("tituloPagina").textContent = titulos[pagina][0];
    $("subtituloPagina").textContent = titulos[pagina][1];
}

// ---------- 5. CONVERSAS ----------

function renderizarListaConversas() {
    const lista = $("listaConversas");

    lista.innerHTML = estado.conversas.map(conversa => {
        const ultima = conversa.mensagens.at(-1);
        return `
            <button type="button" class="chat-contact ${conversa.id === estado.conversaAtual ? "selected" : ""}"
>>>>>>> c375084dd465732e06c79ea8bbd3deaf94c79f6e
                data-id="${conversa.id}">
                <div class="avatar">${escaparHTML(conversa.avatar)}</div>
                <div class="contact-info">
                    <strong>${escaparHTML(conversa.nome)}</strong>
                    <small>${escaparHTML(ultima?.texto || "Nova conversa")}</small>
                </div>
<<<<<<< HEAD
            </button>
        `;
    }).join("");


    lista.querySelectorAll(".chat-contact").forEach(botao => {
        botao.addEventListener("click", () => {
            conversaAtual = Number(botao.dataset.id);
            sugestaoAtual = null;
            sugestao.hidden = true;
            renderizarChat();
            renderizarListaConversas();
        });
    });
}


function selecionarConversa(id) {
    conversaAtual = id;
    sugestaoAtual = null;
    sugestao.hidden = true;
=======
            </button>`;
    }).join("");

    vincular(lista, ".chat-contact", botao => selecionarConversa(Number(botao.dataset.id)));
}

function selecionarConversa(id) {
    estado.conversaAtual = id;
    esconderSugestao();
>>>>>>> c375084dd465732e06c79ea8bbd3deaf94c79f6e
    renderizarChat();
    renderizarListaConversas();
}

<<<<<<< HEAD

function renderizarChat() {
    const conversa = obterConversa();


    if (!conversa) return;


    document.getElementById("nomeGrupo").textContent = conversa.nome;
    document.getElementById("avatarGrupo").textContent = conversa.avatar;
    document.getElementById("statusGrupo").textContent = conversa.descricao;


    mensagens.innerHTML = conversa.mensagens.map(mensagem => `
        <div class="message-row ${mensagem.minha ? "mine" : ""}">
            <div class="message-avatar">${escaparHTML(mensagem.autor.charAt(0).toUpperCase())}</div>
            <div class="message-content">
                <div class="message-name">${escaparHTML(mensagem.autor)}</div>
                <div class="message-bubble">${escaparHTML(mensagem.texto)}</div>
                <span class="message-time">${escaparHTML(mensagem.hora)}</span>
            </div>
        </div>
    `).join("");


    mensagens.scrollTop = mensagens.scrollHeight;
}


function enviarMensagem(texto) {
    const conversa = obterConversa();
    if (!conversa || !texto.trim()) return;


    const mensagem = {
        autor: "Maria",
        texto: texto.trim(),
        hora: horarioAtual(),
        minha: true
    };


    conversa.mensagens.push(mensagem);

=======
function renderizarChat() {
    const conversa = obterConversa();
    if (!conversa) return;

    $("nomeGrupo").textContent = conversa.nome;
    $("avatarGrupo").textContent = conversa.avatar;
    $("statusGrupo").textContent = conversa.descricao;

    el.mensagens.innerHTML = conversa.mensagens.map(m => `
        <div class="message-row ${m.minha ? "mine" : ""}">
            <div class="message-avatar">${escaparHTML(m.autor.charAt(0).toUpperCase())}</div>
            <div class="message-content">
                <div class="message-name">${escaparHTML(m.autor)}</div>
                <div class="message-bubble">${escaparHTML(m.texto)}</div>
                <span class="message-time">${escaparHTML(m.hora)}</span>
            </div>
        </div>`).join("");

    el.mensagens.scrollTop = el.mensagens.scrollHeight;
}

function enviarMensagem(texto) {
    const conversa = obterConversa();
    texto = texto.trim();
    if (!conversa || !texto) return;

    conversa.mensagens.push({ autor: "Maria", texto, hora: horarioAtual(), minha: true });
>>>>>>> c375084dd465732e06c79ea8bbd3deaf94c79f6e

    salvarDados();
    renderizarChat();
    renderizarListaConversas();
<<<<<<< HEAD
    analisarMensagem(texto.trim());
}


formulario.addEventListener("submit", event => {
    event.preventDefault();


    const texto = campoMensagem.value.trim();
    if (!texto) return;


    enviarMensagem(texto);
    campoMensagem.value = "";
    campoMensagem.focus();
});


// CRIAR NOVA CONVERSA


document.getElementById("novoChat").addEventListener("click", () => {
    abrirModal("chat");
});


function criarConversa(nome, telefone) {
    const nova = {
        id: gerarId(),
        nome,
        telefone,
        avatar: nome.charAt(0).toUpperCase(),
        descricao: telefone,
        mensagens: []
    };


    conversas.push(nova);
    conversaAtual = nova.id;

=======
    analisarMensagem(texto);
}

function criarConversa(nome) {
    const nova = {
        id: gerarId(),
        nome,
        avatar: nome.charAt(0).toUpperCase(),
        descricao: "Nova conversa",
        mensagens: []
    };

    estado.conversas.push(nova);
    estado.conversaAtual = nova.id;
>>>>>>> c375084dd465732e06c79ea8bbd3deaf94c79f6e

    salvarDados();
    renderizarListaConversas();
    renderizarChat();
    abrirPagina("chat");
}

<<<<<<< HEAD

// ASSISTENTE INTELIGENTE SIMULADO


function analisarMensagem(texto) {
    const textoMinusculo = texto.toLowerCase();


    const palavrasTarefa = [
        "preciso", "não esquecer", "nao esquecer",
        "lembrar", "estudar", "trabalho", "entregar",
        "fazer", "organizar", "levar", "comprar",
        "prova", "atividade", "tarefa", "treinar"
    ];


    const palavrasEvento = [
        "jogo", "reunião", "reuniao", "encontro",
        "aniversário", "aniversario", "passeio",
        "viagem", "festa", "sábado", "sabado",
        "domingo", "segunda", "terça", "terca",
        "quarta", "quinta", "sexta", "amanhã", "amanha"
    ];


    const palavrasEnquete = [
        "qual horário", "qual horario", "qual dia",
        "quem consegue", "quem vai", "vamos escolher",
        "o que vocês preferem", "o que voces preferem",
        "qual vocês preferem", "qual voces preferem"
    ];


    const temTarefa = palavrasTarefa.some(p => textoMinusculo.includes(p));
    const temEvento = palavrasEvento.some(p => textoMinusculo.includes(p));
    const temEnquete = palavrasEnquete.some(p => textoMinusculo.includes(p));


    if (temEnquete) {
        mostrarSugestao(
            "enquete",
            texto,
            "Parece que vocês estão tentando tomar uma decisão. Que tal criar uma enquete?"
        );
    } else if (temEvento) {
        mostrarSugestao(
            "evento",
            texto,
            "Parece que vocês estão organizando um compromisso. Que tal registrar um evento?"
        );
    } else if (temTarefa) {
        mostrarSugestao(
            "tarefa",
            texto,
            "Parece que essa mensagem contém uma tarefa ou algo importante para lembrar."
        );
    } else {
        sugestao.hidden = true;
        sugestaoAtual = null;
    }


    // Guarda mensagens que parecem conter informações importantes.
    if (temTarefa || temEvento || temEnquete) {
        if (!memoria.some(item => item.texto === texto)) {
            memoria.unshift({
                id: gerarId(),
                texto,
                conversa: obterConversa()?.nome || "Conversa",
                data: dataAtual()
            });


            salvarDados();
            renderizarResumoMemoria();
        }
    }
}


function mostrarSugestao(tipo, texto, descricao) {
    sugestaoAtual = { tipo, texto };
    textoSugestao.textContent = descricao;
    sugestao.hidden = false;
}


document.getElementById("dispensarSugestao").addEventListener("click", () => {
    sugestao.hidden = true;
    sugestaoAtual = null;
});


document.getElementById("criarAcao").addEventListener("click", () => {
    const conversa = obterConversa();
    const texto = sugestaoAtual?.texto || conversa?.mensagens.at(-1)?.texto;


    if (!texto) {
        alert("Envie uma mensagem antes de criar uma tarefa.");
        return;
    }


    abrirModal("tarefa", { titulo: texto });
    sugestao.hidden = true;
    sugestaoAtual = null;
});


// TAREFAS


function adicionarTarefa(titulo, descricao = "", data = "") {
    tarefas.unshift({
        id: gerarId(),
        titulo,
        descricao,
        data,
        concluida: false
    });


    salvarDados();
    atualizarTudo();
}


function renderizarTarefas() {
    const lista = document.getElementById("listaTarefas");
    const concluidas = tarefas.filter(t => t.concluida).length;
    const pendentes = tarefas.length - concluidas;


    document.getElementById("estatisticasTarefas").innerHTML = `
        <div class="stat-card">
            <small>Total de tarefas</small>
            <strong>${tarefas.length}</strong>
        </div>
        <div class="stat-card">
            <small>Pendentes</small>
            <strong>${pendentes}</strong>
        </div>
        <div class="stat-card">
            <small>Concluídas</small>
            <strong>${concluidas}</strong>
        </div>
    `;


    if (!tarefas.length) {
=======
// ---------- 6. ASSISTENTE INTELIGENTE (SUGESTÃO) ----------

// A ordem importa: enquete > evento > tarefa
const PALAVRAS_CHAVE = {
    enquete: [
        "qual horário", "qual horario", "qual dia", "quem consegue", "quem vai",
        "vamos escolher", "o que vocês preferem", "o que voces preferem",
        "qual vocês preferem", "qual voces preferem"
    ],
    evento: [
        "jogo", "reunião", "reuniao", "encontro", "aniversário", "aniversario",
        "passeio", "viagem", "festa", "sábado", "sabado", "domingo", "segunda",
        "terça", "terca", "quarta", "quinta", "sexta", "amanhã", "amanha"
    ],
    tarefa: [
        "preciso", "não esquecer", "nao esquecer", "lembrar", "estudar", "trabalho",
        "entregar", "fazer", "organizar", "levar", "comprar", "prova", "atividade",
        "tarefa", "treinar"
    ]
};

const TEXTOS_SUGESTAO = {
    enquete: "Parece que vocês estão tentando tomar uma decisão. Que tal criar uma enquete?",
    evento: "Parece que vocês estão organizando um compromisso. Que tal registrar um evento?",
    tarefa: "Parece que essa mensagem contém uma tarefa ou algo importante para lembrar."
};

const ROTULOS_BOTAO = {
    enquete: "Criar enquete",
    evento: "Criar evento",
    tarefa: "Criar tarefa"
};

function detectarTipo(texto) {
    const minusculo = texto.toLowerCase();
    return ["enquete", "evento", "tarefa"].find(tipo =>
        PALAVRAS_CHAVE[tipo].some(palavra => minusculo.includes(palavra))
    ) ?? null;
}

function mostrarSugestao(tipo, texto) {
    if (!el.sugestao) return;

    estado.sugestao = { tipo, texto };
    if (el.textoSugestao) el.textoSugestao.textContent = TEXTOS_SUGESTAO[tipo];
    if (el.botaoCriarAcao) el.botaoCriarAcao.textContent = ROTULOS_BOTAO[tipo];
    el.sugestao.hidden = false;
}

function esconderSugestao() {
    estado.sugestao = null;
    if (el.sugestao) el.sugestao.hidden = true;
}

function guardarNaMemoria(texto) {
    if (estado.memoria.some(item => item.texto === texto)) return;

    estado.memoria.unshift({
        id: gerarId(),
        texto,
        conversa: obterConversa()?.nome || "Conversa",
        data: dataAtual()
    });

    salvarDados();
    renderizarResumoMemoria();
}

function analisarMensagem(texto) {
    const tipo = detectarTipo(texto);

    if (!tipo) {
        esconderSugestao();
        return;
    }

    mostrarSugestao(tipo, texto);
    guardarNaMemoria(texto);
}

// Botão "Agora não"
function dispensarSugestao() {
    esconderSugestao();
}

// Botão "Criar tarefa" (ou evento/enquete, conforme a sugestão)
function aceitarSugestao() {
    if (!estado.sugestao) return;

    const { tipo, texto } = estado.sugestao;
    esconderSugestao(); // esconde primeiro, para não depender do modal abrir sem erro

    abrirModal(tipo, tipo === "enquete" ? { pergunta: texto } : { titulo: texto });
}

// ---------- 7. TAREFAS ----------

function adicionarTarefa(titulo, descricao = "", data = "") {
    estado.tarefas.unshift({ id: gerarId(), titulo, descricao, data, concluida: false });
    atualizarTudo();
}

function renderizarTarefas() {
    const lista = $("listaTarefas");
    const concluidas = estado.tarefas.filter(t => t.concluida).length;
    const pendentes = estado.tarefas.length - concluidas;

    $("estatisticasTarefas").innerHTML = `
        <div class="stat-card"><small>Total de tarefas</small><strong>${estado.tarefas.length}</strong></div>
        <div class="stat-card"><small>Pendentes</small><strong>${pendentes}</strong></div>
        <div class="stat-card"><small>Concluídas</small><strong>${concluidas}</strong></div>`;

    if (!estado.tarefas.length) {
>>>>>>> c375084dd465732e06c79ea8bbd3deaf94c79f6e
        lista.innerHTML = criarVazio("Nenhuma tarefa por enquanto", "Crie uma tarefa ou transforme uma mensagem em atividade.");
        return;
    }

<<<<<<< HEAD

    lista.innerHTML = tarefas.map(tarefa => `
        <div class="task-card ${tarefa.concluida ? "completed" : ""}">
            <input type="checkbox" class="task-check"
                data-check="${tarefa.id}" ${tarefa.concluida ? "checked" : ""}>
            <div class="task-details">
                <strong>${escaparHTML(tarefa.titulo)}</strong>
                <p>${escaparHTML(tarefa.descricao || "Sem descrição")}
                    ${tarefa.data ? " · " + formatarData(tarefa.data) : ""}
                </p>
                <span class="tag">${tarefa.concluida ? "Concluída" : "Pendente"}</span>
            </div>
            <button class="delete-button" data-delete-task="${tarefa.id}" title="Excluir tarefa">✕</button>
        </div>
    `).join("");


    lista.querySelectorAll("[data-check]").forEach(input => {
        input.addEventListener("change", () => {
            const tarefa = tarefas.find(t => t.id === Number(input.dataset.check));
            if (tarefa) tarefa.concluida = input.checked;
            salvarDados();
=======
    lista.innerHTML = estado.tarefas.map(t => `
        <div class="task-card ${t.concluida ? "completed" : ""}">
            <input type="checkbox" class="task-check" data-check="${t.id}" ${t.concluida ? "checked" : ""}>
            <div class="task-details">
                <strong>${escaparHTML(t.titulo)}</strong>
                <p>${escaparHTML(t.descricao || "Sem descrição")}${t.data ? " · " + formatarData(t.data) : ""}</p>
                <span class="tag">${t.concluida ? "Concluída" : "Pendente"}</span>
            </div>
            <button type="button" class="delete-button" data-delete-task="${t.id}" title="Excluir tarefa">✕</button>
        </div>`).join("");

    lista.querySelectorAll("[data-check]").forEach(input => {
        input.addEventListener("change", () => {
            const tarefa = estado.tarefas.find(t => t.id === Number(input.dataset.check));
            if (tarefa) tarefa.concluida = input.checked;
>>>>>>> c375084dd465732e06c79ea8bbd3deaf94c79f6e
            atualizarTudo();
        });
    });

<<<<<<< HEAD

    lista.querySelectorAll("[data-delete-task]").forEach(botao => {
        botao.addEventListener("click", () => {
            tarefas = tarefas.filter(t => t.id !== Number(botao.dataset.deleteTask));
            salvarDados();
            atualizarTudo();
        });
    });
}


document.getElementById("novaTarefa").addEventListener("click", () => {
    abrirModal("tarefa");
});


// EVENTOS


function adicionarEvento(titulo, data, horario, local, descricao = "") {
    eventos.unshift({
        id: gerarId(),
        titulo,
        data,
        horario,
        local,
        descricao
    });


    salvarDados();
    atualizarTudo();
}


function renderizarEventos() {
    const lista = document.getElementById("listaEventos");


    if (!eventos.length) {
=======
    vincular(lista, "[data-delete-task]", botao => {
        estado.tarefas = estado.tarefas.filter(t => t.id !== Number(botao.dataset.deleteTask));
        atualizarTudo();
    });
}

// ---------- 8. EVENTOS ----------

function adicionarEvento(titulo, data, horario, local, descricao = "") {
    estado.eventos.unshift({ id: gerarId(), titulo, data, horario, local, descricao });
    atualizarTudo();
}

function renderizarEventos() {
    const lista = $("listaEventos");

    if (!estado.eventos.length) {
>>>>>>> c375084dd465732e06c79ea8bbd3deaf94c79f6e
        lista.innerHTML = criarVazio("Nenhum evento cadastrado", "Crie um evento para organizar seus compromissos.");
        return;
    }

<<<<<<< HEAD

    lista.innerHTML = eventos.map(evento => `
        <div class="event-card">
            <span class="event-date">📅 ${formatarData(evento.data)} ${evento.horario ? " · " + escaparHTML(evento.horario) : ""}</span>
            <h3>${escaparHTML(evento.titulo)}</h3>
            <p>📍 ${escaparHTML(evento.local || "Local não definido")}</p>
            ${evento.descricao ? `<p>${escaparHTML(evento.descricao)}</p>` : ""}
            <button class="delete-button" data-delete-event="${evento.id}">✕ Excluir evento</button>
        </div>
    `).join("");


    lista.querySelectorAll("[data-delete-event]").forEach(botao => {
        botao.addEventListener("click", () => {
            eventos = eventos.filter(e => e.id !== Number(botao.dataset.deleteEvent));
            salvarDados();
            atualizarTudo();
        });
    });
}


document.getElementById("novoEvento").addEventListener("click", () => {
    abrirModal("evento");
});


// ENQUETES


function adicionarEnquete(pergunta, opcoes) {
    enquetes.unshift({
=======
    lista.innerHTML = estado.eventos.map(e => `
        <div class="event-card">
            <span class="event-date">📅 ${formatarData(e.data)}${e.horario ? " · " + escaparHTML(e.horario) : ""}</span>
            <h3>${escaparHTML(e.titulo)}</h3>
            <p>📍 ${escaparHTML(e.local || "Local não definido")}</p>
            ${e.descricao ? `<p>${escaparHTML(e.descricao)}</p>` : ""}
            <button type="button" class="delete-button" data-delete-event="${e.id}">✕ Excluir evento</button>
        </div>`).join("");

    vincular(lista, "[data-delete-event]", botao => {
        estado.eventos = estado.eventos.filter(e => e.id !== Number(botao.dataset.deleteEvent));
        atualizarTudo();
    });
}

// ---------- 9. ENQUETES ----------

function adicionarEnquete(pergunta, opcoes) {
    estado.enquetes.unshift({
>>>>>>> c375084dd465732e06c79ea8bbd3deaf94c79f6e
        id: gerarId(),
        pergunta,
        opcoes: opcoes.map(texto => ({ texto, votos: 0 })),
        voto: null
    });
<<<<<<< HEAD


    salvarDados();
    atualizarTudo();
}


function renderizarEnquetes() {
    const lista = document.getElementById("listaEnquetes");


    if (!enquetes.length) {
=======
    atualizarTudo();
}

function renderizarEnquetes() {
    const lista = $("listaEnquetes");

    if (!estado.enquetes.length) {
>>>>>>> c375084dd465732e06c79ea8bbd3deaf94c79f6e
        lista.innerHTML = criarVazio("Nenhuma enquete criada", "Crie uma enquete para ajudar seu grupo a tomar decisões.");
        return;
    }

<<<<<<< HEAD

    lista.innerHTML = enquetes.map(enquete => {
        const total = enquete.opcoes.reduce((soma, opcao) => soma + opcao.votos, 0);

=======
    lista.innerHTML = estado.enquetes.map(enquete => {
        const total = enquete.opcoes.reduce((soma, o) => soma + o.votos, 0);

        const opcoesHTML = enquete.opcoes.map((opcao, indice) => {
            const porcentagem = total ? Math.round(opcao.votos / total * 100) : 0;
            return `
                <div class="poll-result">
                    <div class="poll-result-label">
                        <span>${escaparHTML(opcao.texto)}</span>
                        <strong>${opcao.votos} voto(s)</strong>
                    </div>
                    <div class="poll-bar"><span style="width:${porcentagem}%"></span></div>
                    ${enquete.voto === null ? `
                        <button type="button" class="secondary small" data-votar="${enquete.id}" data-opcao="${indice}">
                            Votar nesta opção
                        </button>` : ""}
                </div>`;
        }).join("");
>>>>>>> c375084dd465732e06c79ea8bbd3deaf94c79f6e

        return `
            <div class="poll-card">
                <span class="tag">📊 Enquete</span>
                <h3>${escaparHTML(enquete.pergunta)}</h3>
                <p>${total} voto(s)</p>
<<<<<<< HEAD
                ${enquete.opcoes.map((opcao, indice) => {
                    const porcentagem = total ? Math.round(opcao.votos / total * 100) : 0;


                    return `
                        <div class="poll-result">
                            <div class="poll-result-label">
                                <span>${escaparHTML(opcao.texto)}</span>
                                <strong>${opcao.votos} voto(s)</strong>
                            </div>
                            <div class="poll-bar"><span style="width:${porcentagem}%"></span></div>
                            ${enquete.voto === null ? `
                                <button class="secondary small" data-votar="${enquete.id}" data-opcao="${indice}">
                                    Votar nesta opção
                                </button>
                            ` : ""}
                        </div>
                    `;
                }).join("")}
            </div>
        `;
    }).join("");


    lista.querySelectorAll("[data-votar]").forEach(botao => {
        botao.addEventListener("click", () => {
            const enquete = enquetes.find(e => e.id === Number(botao.dataset.votar));
            if (!enquete || enquete.voto !== null) return;


            const indice = Number(botao.dataset.opcao);
            enquete.opcoes[indice].votos++;
            enquete.voto = indice;


            salvarDados();
            renderizarEnquetes();
        });
    });
}


document.getElementById("novaEnquete").addEventListener("click", () => {
    abrirModal("enquete");
});


// MEMÓRIA INTELIGENTE


function renderizarMemoria() {
    const lista = document.getElementById("listaMemoria");


    if (!memoria.length) {
=======
                ${opcoesHTML}
            </div>`;
    }).join("");

    vincular(lista, "[data-votar]", botao => {
        const enquete = estado.enquetes.find(e => e.id === Number(botao.dataset.votar));
        if (!enquete || enquete.voto !== null) return;

        const indice = Number(botao.dataset.opcao);
        enquete.opcoes[indice].votos++;
        enquete.voto = indice;

        salvarDados();
        renderizarEnquetes();
    });
}

// ---------- 10. MEMÓRIA INTELIGENTE ----------

function renderizarMemoria() {
    const lista = $("listaMemoria");

    if (!estado.memoria.length) {
>>>>>>> c375084dd465732e06c79ea8bbd3deaf94c79f6e
        lista.innerHTML = criarVazio("Sua memória está vazia", "Quando uma mensagem importante for identificada, ela poderá aparecer aqui.");
        return;
    }

<<<<<<< HEAD

    lista.innerHTML = memoria.map(item => `
=======
    lista.innerHTML = estado.memoria.map(item => `
>>>>>>> c375084dd465732e06c79ea8bbd3deaf94c79f6e
        <div class="memory-card-item">
            <div class="memory-symbol">🧠</div>
            <div style="flex:1;min-width:0">
                <span class="tag">${escaparHTML(item.conversa)}</span>
                <p style="margin-top:10px">${escaparHTML(item.texto)}</p>
                <p>Guardado em ${formatarData(item.data)}</p>
<<<<<<< HEAD
                <button class="delete-button" data-delete-memory="${item.id}">✕ Excluir</button>
            </div>
        </div>
    `).join("");


    lista.querySelectorAll("[data-delete-memory]").forEach(botao => {
        botao.addEventListener("click", () => {
            memoria = memoria.filter(item => item.id !== Number(botao.dataset.deleteMemory));
            salvarDados();
            atualizarTudo();
        });
    });
}


function renderizarResumoMemoria() {
    const resumo = document.getElementById("resumoMemoria");


    if (!memoria.length) {
        resumo.innerHTML = `<p class="muted">Nenhuma informação guardada ainda.</p>`;
        return;
    }


    resumo.innerHTML = memoria.slice(0, 3).map(item => `
        <div class="memory-mini">${escaparHTML(item.texto)}</div>
    `).join("");
}


// RESUMO DE ATIVIDADES


function renderizarResumoAtividades() {
    const resumo = document.getElementById("resumoAtividades");
    const pendentes = tarefas.filter(t => !t.concluida).slice(0, 3);


    if (!pendentes.length && !eventos.length) {
=======
                <button type="button" class="delete-button" data-delete-memory="${item.id}">✕ Excluir</button>
            </div>
        </div>`).join("");

    vincular(lista, "[data-delete-memory]", botao => {
        estado.memoria = estado.memoria.filter(i => i.id !== Number(botao.dataset.deleteMemory));
        atualizarTudo();
    });
}

function renderizarResumoMemoria() {
    const resumo = $("resumoMemoria");

    resumo.innerHTML = estado.memoria.length
        ? estado.memoria.slice(0, 3).map(i => `<div class="memory-mini">${escaparHTML(i.texto)}</div>`).join("")
        : `<p class="muted">Nenhuma informação guardada ainda.</p>`;
}

// ---------- 11. RESUMO DE ATIVIDADES ----------

function renderizarResumoAtividades() {
    const resumo = $("resumoAtividades");
    const pendentes = estado.tarefas.filter(t => !t.concluida).slice(0, 3);

    if (!pendentes.length && !estado.eventos.length) {
>>>>>>> c375084dd465732e06c79ea8bbd3deaf94c79f6e
        resumo.innerHTML = `<p class="muted">Nenhuma atividade cadastrada.</p>`;
        return;
    }

<<<<<<< HEAD

=======
>>>>>>> c375084dd465732e06c79ea8bbd3deaf94c79f6e
    const itens = [
        ...pendentes.map(t => ({
            titulo: t.titulo,
            detalhe: t.data ? formatarData(t.data) : "Tarefa pendente"
        })),
<<<<<<< HEAD
        ...eventos.slice(0, 3).map(e => ({
=======
        ...estado.eventos.slice(0, 3).map(e => ({
>>>>>>> c375084dd465732e06c79ea8bbd3deaf94c79f6e
            titulo: e.titulo,
            detalhe: `${formatarData(e.data)}${e.horario ? " · " + e.horario : ""}`
        }))
    ].slice(0, 4);

<<<<<<< HEAD

=======
>>>>>>> c375084dd465732e06c79ea8bbd3deaf94c79f6e
    resumo.innerHTML = itens.map(item => `
        <div class="activity-item">
            <div class="activity-dot"></div>
            <div>
                <strong>${escaparHTML(item.titulo)}</strong>
                <small>${escaparHTML(item.detalhe)}</small>
            </div>
<<<<<<< HEAD
        </div>
    `).join("");
}


// MODAIS


function campoFormulario(nome, rotulo, tipo = "text", valor = "", obrigatorio = true) {
    const id = `campo-${nome}`;

=======
        </div>`).join("");
}

// ---------- 12. MODAL ----------

function campoFormulario(nome, rotulo, tipo = "text", valor = "", obrigatorio = true) {
    const id = `campo-${nome}`;
    const required = obrigatorio ? "required" : "";
>>>>>>> c375084dd465732e06c79ea8bbd3deaf94c79f6e

    if (tipo === "textarea") {
        return `
            <div class="form-field">
                <label for="${id}">${rotulo}</label>
<<<<<<< HEAD
                <textarea id="${id}" name="${nome}" ${obrigatorio ? "required" : ""}>${escaparHTML(valor)}</textarea>
            </div>
        `;
    }


    return `
        <div class="form-field">
            <label for="${id}">${rotulo}</label>
            <input id="${id}" name="${nome}" type="${tipo}"
                value="${escaparHTML(valor)}"
                ${obrigatorio ? "required" : ""}>
        </div>
    `;
}


function abrirModal(tipo, dados = {}) {
    tipoModal = tipo;


    const modelos = {
        tarefa: {
            titulo: "Nova tarefa",
            campos:
                campoFormulario("titulo", "Nome da tarefa", "text", dados.titulo || "") +
                campoFormulario("descricao", "Descrição", "textarea", "", false) +
                campoFormulario("data", "Data de conclusão", "date", "", false)
        },
        evento: {
            titulo: "Novo evento",
            campos:
                campoFormulario("titulo", "Nome do evento", "text", dados.titulo || "") +
                campoFormulario("data", "Data", "date", dados.data || "") +
                campoFormulario("horario", "Horário", "time", "", false) +
                campoFormulario("local", "Local", "text", "", false) +
                campoFormulario("descricao", "Descrição", "textarea", "", false)
        },
        enquete: {
            titulo: "Nova enquete",
            campos:
                campoFormulario("pergunta", "Pergunta da enquete", "text", dados.pergunta || "") +
                campoFormulario("opcao1", "Opção 1", "text", "") +
                campoFormulario("opcao2", "Opção 2", "text", "") +
                campoFormulario("opcao3", "Opção 3 (opcional)", "text", "", false)
        },
        chat: {
    titulo: "Nova conversa",
    campos:
        campoFormulario("nome", "Nome do contato", "text", "") +
        campoFormulario("telefone", "Número de telefone", "tel", "")
      },
    };


    modalTitulo.textContent = modelos[tipo].titulo;
    modalCampos.innerHTML = modelos[tipo].campos;
    modal.showModal();
}


function fecharModal() {
    modal.close();
    formModal.reset();
}


document.getElementById("fecharModal").addEventListener("click", fecharModal);
document.getElementById("cancelarModal").addEventListener("click", fecharModal);


formModal.addEventListener("submit", event => {
    event.preventDefault();


    const dados = Object.fromEntries(new FormData(formModal).entries());


    if (tipoModal === "tarefa") {
        adicionarTarefa(dados.titulo.trim(), dados.descricao.trim(), dados.data);
    }


    if (tipoModal === "evento") {
        adicionarEvento(
            dados.titulo.trim(),
            dados.data,
            dados.horario,
            dados.local.trim(),
            dados.descricao.trim()
        );
    }


    if (tipoModal === "enquete") {
        const opcoes = [dados.opcao1, dados.opcao2, dados.opcao3]
            .map(opcao => opcao.trim())
            .filter(Boolean);


        if (opcoes.length < 2) {
            alert("Informe pelo menos duas opções para a enquete.");
            return;
        }


        adicionarEnquete(dados.pergunta.trim(), opcoes);
    }


   
     if (tipoModal === "chat") {
    criarConversa(
        dados.nome.trim(),
        dados.telefone.trim()
    );
}


    fecharModal();
});


// BOTÕES E ATUALIZAÇÃO


document.getElementById("verInfo").addEventListener("click", () => {
    const conversa = obterConversa();
    if (conversa) {
        alert(`${conversa.nome}\n${conversa.descricao}`);
    }
});

=======
                <textarea id="${id}" name="${nome}" ${required}>${escaparHTML(valor)}</textarea>
            </div>`;
    }

    return `
        <div class="form-field">
            <label for="${id}">${rotulo}</label>
            <input id="${id}" name="${nome}" type="${tipo}" value="${escaparHTML(valor)}" ${required}>
        </div>`;
}

const modelosModal = {
    tarefa: dados => ({
        titulo: "Nova tarefa",
        campos:
            campoFormulario("titulo", "Nome da tarefa", "text", dados.titulo || "") +
            campoFormulario("descricao", "Descrição", "textarea", "", false) +
            campoFormulario("data", "Data de conclusão", "date", "", false)
    }),
    evento: dados => ({
        titulo: "Novo evento",
        campos:
            campoFormulario("titulo", "Nome do evento", "text", dados.titulo || "") +
            campoFormulario("data", "Data", "date", dados.data || "") +
            campoFormulario("horario", "Horário", "time", "", false) +
            campoFormulario("local", "Local", "text", "", false) +
            campoFormulario("descricao", "Descrição", "textarea", "", false)
    }),
    enquete: dados => ({
        titulo: "Nova enquete",
        campos:
            campoFormulario("pergunta", "Pergunta da enquete", "text", dados.pergunta || "") +
            campoFormulario("opcao1", "Opção 1", "text", "") +
            campoFormulario("opcao2", "Opção 2", "text", "") +
            campoFormulario("opcao3", "Opção 3 (opcional)", "text", "", false)
    }),
    chat: () => ({
        titulo: "Nova conversa",
        campos: campoFormulario("nome", "Nome da conversa ou grupo", "text", "")
    })
};

function abrirModal(tipo, dados = {}) {
    if (!modelosModal[tipo] || !el.modal) return;

    estado.tipoModal = tipo;
    const modelo = modelosModal[tipo](dados);

    el.modalTitulo.textContent = modelo.titulo;
    el.modalCampos.innerHTML = modelo.campos;

    if (typeof el.modal.showModal === "function") el.modal.showModal();
    else el.modal.setAttribute("open", "");
}

function fecharModal() {
    if (typeof el.modal.close === "function") el.modal.close();
    else el.modal.removeAttribute("open");
    el.formModal.reset();
}

// Cada ação retorna false para manter o modal aberto (validação falhou)
const acoesModal = {
    tarefa: d => adicionarTarefa(d.titulo.trim(), d.descricao.trim(), d.data),
    evento: d => adicionarEvento(d.titulo.trim(), d.data, d.horario, d.local.trim(), d.descricao.trim()),
    enquete: d => {
        const opcoes = [d.opcao1, d.opcao2, d.opcao3].map(o => o.trim()).filter(Boolean);
        if (opcoes.length < 2) {
            alert("Informe pelo menos duas opções para a enquete.");
            return false;
        }
        adicionarEnquete(d.pergunta.trim(), opcoes);
    },
    chat: d => criarConversa(d.nome.trim())
};

function enviarModal(event) {
    event.preventDefault();

    const dados = Object.fromEntries(new FormData(el.formModal).entries());
    const resultado = acoesModal[estado.tipoModal]?.(dados);

    if (resultado !== false) fecharModal();
}

// ---------- 13. ATUALIZAÇÃO GERAL ----------
>>>>>>> c375084dd465732e06c79ea8bbd3deaf94c79f6e

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

<<<<<<< HEAD

    document.getElementById("contadorTarefas").textContent =
        tarefas.filter(t => !t.concluida).length;
}


// INICIALIZAÇÃO


atualizarTudo();
abrirPagina("chat");
=======
    $("contadorTarefas").textContent = estado.tarefas.filter(t => !t.concluida).length;
}

// ---------- 14. EVENTOS DA INTERFACE ----------

function configurarEventos() {
    // Menu e atalhos de navegação
    document.querySelectorAll(".menu-item").forEach(botao => {
        botao.addEventListener("click", () => abrirPagina(botao.dataset.view));
    });
    document.querySelectorAll("[data-go]").forEach(botao => {
        botao.addEventListener("click", () => abrirPagina(botao.dataset.go));
    });

    // Chat
    el.formulario.addEventListener("submit", event => {
        event.preventDefault();
        const texto = el.campoMensagem.value.trim();
        if (!texto) return;

        enviarMensagem(texto);
        el.campoMensagem.value = "";
        el.campoMensagem.focus();
    });

    on("novoChat", "click", () => abrirModal("chat"));
    on("verInfo", "click", () => {
        const conversa = obterConversa();
        if (conversa) alert(`${conversa.nome}\n${conversa.descricao}`);
    });

    // Sugestão do assistente
    on("dispensarSugestao", "click", event => {
        event.preventDefault();
        dispensarSugestao();
    });
    on("criarAcao", "click", event => {
        event.preventDefault();
        aceitarSugestao();
    });

    // Botões de criação
    on("novaTarefa", "click", () => abrirModal("tarefa"));
    on("novoEvento", "click", () => abrirModal("evento"));
    on("novaEnquete", "click", () => abrirModal("enquete"));

    // Modal
    on("fecharModal", "click", fecharModal);
    on("cancelarModal", "click", fecharModal);
    el.formModal.addEventListener("submit", enviarModal);
}

// ---------- 15. INICIALIZAÇÃO ----------

configurarEventos();
esconderSugestao();
atualizarTudo();
abrirPagina("chat");
>>>>>>> c375084dd465732e06c79ea8bbd3deaf94c79f6e
