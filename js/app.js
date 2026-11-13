
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

function carregarDados(chave, padrao) {
    try {
        const dados = localStorage.getItem(chave);
        return dados ? JSON.parse(dados) : padrao;
    } catch {
        return padrao;
    }
}

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


// O chat com a IA sempre começa vazio ao entrar
localStorage.removeItem("connect_conversas");

// Os grupos criados continuam salvos no navegador
const gruposSalvos = carregarDados("connect_grupos", []);
let conversas = [CONVERSA_IA, ...gruposSalvos];

let tarefas = carregarDados("connect_tarefas", []);
let eventos = carregarDados("connect_eventos", []);
let enquetes = carregarDados("connect_enquetes", []);
let memoria = [];
localStorage.removeItem("connect_memoria");


let conversaAtual = CONVERSA_IA.id;
let sugestaoAtual = null;
let tipoModal = "";
let contatosGrupo = []; // contatos adicionados no modal "Novo grupo"


// FUNÇÕES AUXILIARES


function salvarDados() {

    localStorage.setItem("connect_tarefas", JSON.stringify(tarefas));
    localStorage.setItem("connect_eventos", JSON.stringify(eventos));
    localStorage.setItem("connect_enquetes", JSON.stringify(enquetes));
    localStorage.setItem("connect_memoria", JSON.stringify(memoria));
    localStorage.setItem(
        "connect_grupos",
        JSON.stringify(conversas.filter(c => c.tipo === "grupo"))
    );
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


// CONVERSAS




function renderizarListaConversas() {
    const lista = document.getElementById("listaConversas");
    if (!lista || lista.dataset.origem === "api") return;


    lista.innerHTML = conversas.map(conversa => {
        const ultima = conversa.mensagens.at(-1);


        return `
            <button class="chat-contact ${conversa.id === conversaAtual ? "selected" : ""}"
                data-id="${conversa.id}">
                <div class="avatar">${escaparHTML(conversa.avatar)}</div>
                <div class="contact-info">
                    <strong>${escaparHTML(conversa.nome)}</strong>
                    <small>${escaparHTML(ultima?.texto || "Nova conversa")}</small>
                </div>
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
            abrirPagina("chat");
        });
    });
}


function renderizarChat() {
    const conversa = obterConversa();


    if (!conversa) return;


    document.getElementById("nomeGrupo").textContent = conversa.nome;
    document.getElementById("avatarGrupo").textContent = conversa.avatar;
    document.getElementById("statusGrupo").textContent = conversa.descricao;
    document.getElementById("adicionarParticipantes").hidden = conversa.tipo !== "grupo";


    mensagens.innerHTML = conversa.mensagens.map(mensagem => mensagem.tipo === "quadro" ? htmlQuadro(mensagem) : `
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


// ENVIAR MENSAGEM


async function enviarMensagem(texto) {
    const conversa = obterConversa();


    if (!conversa || !texto.trim()) return;


    const textoLimpo = texto.trim();


    const mensagem = {
        autor: nomeUsuario,
        texto: textoLimpo,
        hora: horaPtBR(),
        minha: true
    };


    conversa.mensagens.push(mensagem);


    salvarDados();
    renderizarChat();
    renderizarListaConversas();


    analisarMensagem(textoLimpo);
}




// FORMULÁRIO DE ENVIO


formulario.addEventListener("submit", async event => {
    event.preventDefault();

    if (formulario.dataset.origem === "api") return;


    const texto = campoMensagem.value.trim();
    if (!texto) return;


    await enviarMensagem(texto);


    campoMensagem.value = "";
    campoMensagem.focus();
});




// CRIAR NOVA CONVERSA


document.getElementById("novoChat").addEventListener("click", () => {
    abrirModal("chat");
    var campoTelefone = document.getElementById('novo-telefone');
    aplicarMascaraTelefone(campoTelefone);
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

// QUADRO DE COMPROMISSO FEITO PELA IA


const OPCOES_QUADRO = ["Vou", "Talvez", "Não vou"];

const DIAS_SEMANA = [
    { chaves: ["domingo"], indice: 0, nome: "Domingo" },
    { chaves: ["segunda"], indice: 1, nome: "Segunda-feira" },
    { chaves: ["terça", "terca"], indice: 2, nome: "Terça-feira" },
    { chaves: ["quarta"], indice: 3, nome: "Quarta-feira" },
    { chaves: ["quinta"], indice: 4, nome: "Quinta-feira" },
    { chaves: ["sexta"], indice: 5, nome: "Sexta-feira" },
    { chaves: ["sábado", "sabado"], indice: 6, nome: "Sábado" }
];

const TIPOS_COMPROMISSO = [
    ["jogo", "Jogo"], ["reunião", "Reunião"], ["reuniao", "Reunião"],
    ["encontro", "Encontro"], ["aniversário", "Aniversário"],
    ["aniversario", "Aniversário"], ["passeio", "Passeio"],
    ["viagem", "Viagem"], ["festa", "Festa"]
];


// Lê a frase e tenta descobrir tipo, dia, horário e local
function extrairCompromisso(texto) {
    const minusculo = texto.toLowerCase();
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);

    let titulo = "Compromisso";
    const tipo = TIPOS_COMPROMISSO.find(([chave]) => minusculo.includes(chave));
    if (tipo) titulo = tipo[1];

    let data = "";
    let diaNome = "";

    const explicita = minusculo.match(/\b(\d{1,2})\/(\d{1,2})(?:\/(\d{2,4}))?\b/);
    if (explicita) {
        const ano = explicita[3]
            ? (explicita[3].length === 2 ? 2000 + Number(explicita[3]) : Number(explicita[3]))
            : hoje.getFullYear();
        data = `${ano}-${explicita[2].padStart(2, "0")}-${explicita[1].padStart(2, "0")}`;
    } else if (/\bamanh[ãa]\b/.test(minusculo)) {
        const d = new Date(hoje);
        d.setDate(d.getDate() + 1);
        data = dataISO(d);
        diaNome = "Amanhã";
    } else if (/\bhoje\b/.test(minusculo)) {
        data = dataISO(hoje);
        diaNome = "Hoje";
    } else {
        const dia = DIAS_SEMANA.find(item => item.chaves.some(c => minusculo.includes(c)));
        if (dia) {
            const d = new Date(hoje);
            const falta = (dia.indice - d.getDay() + 7) % 7 || 7;
            d.setDate(d.getDate() + falta);
            data = dataISO(d);
            diaNome = dia.nome;
        }
    }

    let horario = "";
    const hora = minusculo.match(/\b(\d{1,2})\s*(?:h|:)\s*(\d{2})?\b/) ||
        minusculo.match(/\bàs\s+(\d{1,2})()\b/);
    if (hora && Number(hora[1]) < 24) {
        horario = `${hora[1].padStart(2, "0")}:${hora[2] || "00"}`;
    }

    let local = "";
    const achouLocal = texto.match(
        /\b(?:no|na|em|n[oa]s)\s+((?:[A-ZÀ-Ú][\wÀ-ú]*)(?:\s+(?:d[aeo]s?\s+)?[A-ZÀ-Ú][\wÀ-ú]*)*)/
    );
    if (achouLocal) local = achouLocal[1];

    if (diaNome) titulo = `${titulo} · ${diaNome}`;

    return { titulo, data, horario, local };
}


function publicarQuadro(compromisso, { conversaId, salvo = false } = {}) {
    const conversa = conversas.find(c => c.id === conversaId);
    if (!conversa) return;

    const quadro = {
        id: gerarId(),
        titulo: compromisso.titulo,
        data: compromisso.data || "",
        horario: compromisso.horario || "",
        local: compromisso.local || "",
        opcoes: OPCOES_QUADRO.map(texto => ({ texto, votos: 0 })),
        voto: null,
        salvo
    };

    // Pequena pausa para parecer que a IA está organizando
    setTimeout(() => {
        conversa.mensagens.push({
            tipo: "quadro",
            autor: "Connect+ IA",
            texto: `📋 ${quadro.titulo}`,
            hora: horaPtBR(),
            minha: false,
            quadro
        });

        salvarDados();
        renderizarListaConversas();
        if (conversaAtual === conversa.id) renderizarChat();
    }, 700);
}


function htmlQuadro(mensagem) {
    const q = mensagem.quadro;
    const total = q.opcoes.reduce((soma, o) => soma + o.votos, 0);

    return `
        <div class="message-row ai-row">
            <div class="message-avatar ai-avatar">✦</div>
            <div class="message-content">
                <div class="message-name">Connect+ IA</div>
                <div class="ai-board">
                    <span class="tag">📋 Quadro do compromisso</span>
                    <h4>${escaparHTML(q.titulo)}</h4>
                    <ul class="ai-board-info">
                        <li>📅 ${q.data ? escaparHTML(formatarData(q.data)) : "Data a definir"}</li>
                        <li>🕒 ${q.horario ? escaparHTML(q.horario) : "Horário a definir"}</li>
                        <li>📍 ${q.local ? escaparHTML(q.local) : "Local a definir"}</li>
                    </ul>
                    <p class="ai-board-question">Quem vai?</p>
                    ${q.opcoes.map((opcao, indice) => {
                        const pct = total ? Math.round(opcao.votos / total * 100) : 0;
                        return `
                            <button type="button" class="ai-option ${q.voto === indice ? "voted" : ""}"
                                data-quadro="${q.id}" data-opcao="${indice}">
                                <span class="ai-option-bar" style="width:${pct}%"></span>
                                <span class="ai-option-text">${escaparHTML(opcao.texto)}</span>
                                <strong>${opcao.votos}</strong>
                            </button>
                        `;
                    }).join("")}
                    ${q.salvo
                        ? `<div class="ai-board-saved">✓ Salvo em Eventos</div>`
                        : `<button type="button" class="secondary small" data-quadro-salvar="${q.id}">＋ Adicionar aos eventos</button>`}
                </div>
                <span class="message-time">${escaparHTML(mensagem.hora)}</span>
            </div>
        </div>
    `;
}


function acharQuadro(id) {
    const conversa = obterConversa();
    const mensagem = conversa?.mensagens.find(m => m.tipo === "quadro" && m.quadro.id === id);
    return mensagem?.quadro;
}


// Cliques nos quadros (votar e salvar em Eventos)
mensagens.addEventListener("click", event => {
    const votar = event.target.closest("[data-quadro]");
    const salvarEvento = event.target.closest("[data-quadro-salvar]");

    if (votar) {
        const q = acharQuadro(Number(votar.dataset.quadro));
        if (!q) return;

        const indice = Number(votar.dataset.opcao);
        if (q.voto !== null) q.opcoes[q.voto].votos--;

        if (q.voto === indice) {
            q.voto = null; // clicar de novo remove o voto
        } else {
            q.opcoes[indice].votos++;
            q.voto = indice;
        }

        salvarDados();
        renderizarChat();
    }

    if (salvarEvento) {
        const q = acharQuadro(Number(salvarEvento.dataset.quadroSalvar));
        if (!q || q.salvo) return;

        q.salvo = true;
        adicionarEvento(q.titulo, q.data, q.horario, q.local);
        renderizarChat();
    }
});


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
        // A IA do Connect+ monta o quadro do compromisso direto no chat
        sugestao.hidden = true;
        sugestaoAtual = null;
        publicarQuadro(extrairCompromisso(texto), { conversaId: conversaAtual });
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
                data: dataISO()
            });


            salvarDados();
            renderizarResumoMemoria();
        }
    }
}


function mostrarSugestao(tipo, texto, descricao) {
    const rotulos = {
        tarefa: "Criar tarefa",
        evento: "Criar evento",
        enquete: "Criar enquete"
    };


    sugestaoAtual = { tipo, texto };
    textoSugestao.textContent = descricao;
    document.getElementById("criarAcao").textContent = rotulos[tipo] || "Criar tarefa";
    sugestao.hidden = false;
}


document.getElementById("dispensarSugestao").addEventListener("click", () => {
    sugestao.hidden = true;
    sugestaoAtual = null;
});


document.getElementById("criarAcao").addEventListener("click", () => {
    const conversa = obterConversa();
    const texto = sugestaoAtual?.texto || conversa?.mensagens.at(-1)?.texto;
    const tipo = sugestaoAtual?.tipo || "tarefa";


    if (!texto) {
        alert("Envie uma mensagem antes de criar uma tarefa.");
        return;
    }


    // Abre o formulário certo conforme o que o Connect+ identificou
    if (tipo === "enquete") {
        abrirModal("enquete", { pergunta: texto });
    } else if (tipo === "evento") {
        abrirModal("evento", { titulo: texto });
    } else {
        abrirModal("tarefa", { titulo: texto });
    }


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
        lista.innerHTML = criarVazio("Nenhuma tarefa por enquanto", "Crie uma tarefa ou transforme uma mensagem em atividade.");
        return;
    }


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
            atualizarTudo();
        });
    });


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
        lista.innerHTML = criarVazio("Nenhum evento cadastrado", "Crie um evento para organizar seus compromissos.");
        return;
    }


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
        id: gerarId(),
        pergunta,
        opcoes: opcoes.map(texto => ({ texto, votos: 0 })),
        voto: null
    });


    salvarDados();
    atualizarTudo();
}


function renderizarEnquetes() {
    const lista = document.getElementById("listaEnquetes");


    if (!enquetes.length) {
        lista.innerHTML = criarVazio("Nenhuma enquete criada", "Crie uma enquete para ajudar seu grupo a tomar decisões.");
        return;
    }


    lista.innerHTML = enquetes.map(enquete => {
        const total = enquete.opcoes.reduce((soma, opcao) => soma + opcao.votos, 0);


        return `
            <div class="poll-card">
                <span class="tag">📊 Enquete</span>
                <h3>${escaparHTML(enquete.pergunta)}</h3>
                <p>${total} voto(s)</p>
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
        lista.innerHTML = criarVazio("Sua memória está vazia", "Quando uma mensagem importante for identificada, ela poderá aparecer aqui.");
        return;
    }


    lista.innerHTML = memoria.map(item => `
        <div class="memory-card-item">
            <div class="memory-symbol">🧠</div>
            <div style="flex:1;min-width:0">
                <span class="tag">${escaparHTML(item.conversa)}</span>
                <p style="margin-top:10px">${escaparHTML(item.texto)}</p>
                <p>Guardado em ${formatarData(item.data)}</p>
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


// MODAIS


function campoFormulario(nome, rotulo, tipo = "text", valor = "", obrigatorio = true) {
    const id = `${nome}`;
    const required = obrigatorio ? "required" : "";


    if (tipo === "textarea") {
        return `
            <div class="form-field">
                <label for="${id}">${escaparHTML(rotulo)}</label>
                <textarea id="${id}" name="${nome}" ${required}>${escaparHTML(valor)}</textarea>
            </div>
        `;
    }


    return `
        <div class="form-field">
            <label for="${id}">${escaparHTML(rotulo)}</label>
            <input id="${id}" name="${nome}" type="${tipo}"
                value="${escaparHTML(valor)}" ${required}>
            <p id="erro-contato" class="erro" role="alert"></p>
        </div>
    `;
}

function campoFormularioTelefone(nome, rotulo, obrigatorio = true) {
    const id = `${nome}`;
    const required = obrigatorio ? "required" : "";
    
    return `
        <div class="form-field">
            <label for="${id}">${escaparHTML(rotulo)}</label>
            <input id="${id}" name="${nome}" type="tel" ${required}>
            <p id="erro-modal" class="erro" role="alert"></p>
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
            campos: campoFormularioTelefone("novo-telefone", "Número")
        }/** ,
        grupo: {
            titulo: "Novo grupo",
            campos:
                campoFormulario("nomeGrupo", "Nome", "text", "") + `
                <div class="form-field">
                    <label>Adicionar contato</label>
                    <div class="group-add">
                        <input id="grupoContatoNome" type="text" placeholder="Nome do contato" autocomplete="off">
                        <input id="grupoContatoNumero" type="tel" placeholder="Número" autocomplete="off">
                    </div>
                    <button type="button" class="secondary small group-add-button" id="grupoAdicionarContato">＋ Adicionar contato</button>
                    <div class="group-contacts" id="grupoContatos"></div>
                </div>
            `
        }*/
    };

    // Mesmo bloco de contatos do "Novo grupo", mas sem o campo do nome
   /** modelos.participantes = {
        titulo: "Adicionar participantes",
        campos: modelos.grupo.campos.replace(campoFormulario("nomeGrupo", "Nome", "text", ""), "")
    };*/ 

    modalTitulo.textContent = modelos[tipo].titulo;
    modalCampos.innerHTML = modelos[tipo].campos;

    if (tipo === "grupo" || tipo === "participantes") prepararModalGrupo();

    modal.showModal();
}

function fecharModal() {
    if (modal.open) modal.close();
    formModal.reset();
    contatosGrupo = [];
}

document.getElementById("fecharModal").addEventListener("click", fecharModal);
document.getElementById("cancelarModal").addEventListener("click", fecharModal);

// Esc também limpa o formulário
modal.addEventListener("cancel", () => {
    formModal.reset();
    contatosGrupo = [];
});

// Clique fora da janela fecha o modal
modal.addEventListener("click", event => {
    if (event.target === modal) fecharModal();
});

formModal.addEventListener("submit", event => {
    event.preventDefault();

    if (tipoModal === "chat") return;

    const dados = Object.fromEntries(new FormData(formModal).entries());
    const texto = campo => (dados[campo] || "").trim();

    if (tipoModal === "tarefa") {
        adicionarTarefa(texto("titulo"), texto("descricao"), dados.data || "");
    }

    if (tipoModal === "evento") {
        const compromisso = {
            titulo: texto("titulo"),
            data: dados.data || "",
            horario: dados.horario || "",
            local: texto("local")
        };

        adicionarEvento(
            compromisso.titulo,
            compromisso.data,
            compromisso.horario,
            compromisso.local,
            texto("descricao")
        );

        // Quadro da IA na conversa aberta, já marcado como salvo em Eventos
        if (obterConversa()) {
            publicarQuadro(compromisso, { conversaId: conversaAtual, salvo: true });
        }
    }

    if (tipoModal === "enquete") {
        const opcoes = [texto("opcao1"), texto("opcao2"), texto("opcao3")]
            .filter(Boolean);

        if (opcoes.length < 2) {
            alert("Informe pelo menos duas opções para a enquete.");
            return;
        }

        adicionarEnquete(texto("pergunta"), opcoes);
    }

    if (tipoModal === "grupo") {
        const nomeGrupo = texto("nomeGrupo");

        // Se o usuário preencheu um contato mas não clicou em "Adicionar contato", adiciona agora
        const nomePendente = (document.getElementById("grupoContatoNome")?.value || "").trim();
        const numeroPendente = (document.getElementById("grupoContatoNumero")?.value || "").trim();
        if (nomePendente && numeroPendente &&
            !contatosGrupo.some(c => c.telefone === numeroPendente)) {
            contatosGrupo.push({ nome: nomePendente, telefone: numeroPendente });
        }

        if (!nomeGrupo) {
            alert("Informe o nome do grupo.");
            return;
        }

        if (!contatosGrupo.length) {
            alert("Adicione pelo menos um contato ao grupo.");
            return;
        }

        criarGrupo(nomeGrupo, [...contatosGrupo]);
    }

    if (tipoModal === "participantes") {
        const conversa = obterConversa();
        if (!conversa || conversa.tipo !== "grupo") return;

        // Inclui o contato preenchido que ainda não foi adicionado com o botão
        const nomePendente = (document.getElementById("grupoContatoNome")?.value || "").trim();
        const numeroPendente = (document.getElementById("grupoContatoNumero")?.value || "").trim();
        const repetido = numeroPendente && (
            contatosGrupo.some(c => c.telefone === numeroPendente) ||
            (conversa.membros || []).some(c => c.telefone === numeroPendente)
        );
        if (nomePendente && numeroPendente && !repetido) {
            contatosGrupo.push({ nome: nomePendente, telefone: numeroPendente });
        }

        if (!contatosGrupo.length) {
            alert("Adicione pelo menos um contato.");
            return;
        }

        adicionarParticipantes(conversa, [...contatosGrupo]);
    }

    fecharModal();
});

document.getElementById("verInfo").addEventListener("click", () => {
    const conversa = obterConversa();
    if (!conversa) return;

    if (conversa.tipo === "grupo") {
        const lista = (conversa.membros || [])
            .map(m => `• ${m.nome} - ${m.telefone}`)
            .join("\n");
        alert(`${conversa.nome}\n${conversa.descricao}\n\nParticipantes:\n• Você\n${lista}`);
        return;
    }

    alert(`${conversa.nome}\n${conversa.descricao}`);
});


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

atualizarTudo();
abrirPagina("chat");
