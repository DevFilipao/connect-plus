// Caracterização de js/app.js: navegação, tarefas, eventos, enquetes, memória e modais.
const { test, describe } = require("node:test");
const assert = require("node:assert/strict");
const { carregarApp, assentar, esperar } = require("../apoio/carregar-pagina");

const textos = (p, seletor) => p.$$(seletor).map(e => e.textContent.trim());
const ir = (p, view) => p.clicar(`.menu-item[data-view="${view}"]`);

function preencherModal(p, campos) {
    for (const [id, valor] of Object.entries(campos)) p.$(`#modalCampos #${id}`).value = valor;
}

describe("navegação", () => {
    const PAGINAS = [
        ["tarefas", "Minhas tarefas", "Organize suas atividades em um só lugar."],
        ["eventos", "Eventos", "Organize seus compromissos."],
        ["enquetes", "Enquetes", "Ajude seu grupo a tomar decisões."],
        ["memoria", "Memória inteligente", "Informações importantes das suas conversas."],
        ["chat", "Conversas", "Converse e organize sua rotina."]
    ];
    for (const [view, titulo, subtitulo] of PAGINAS) {
        test(`menu '${view}' ativa a view e troca o título`, async () => {
            const p = await carregarApp();
            try {
                ir(p, view);
                assert.deepEqual(textos(p, ".view.active").length, 1);
                assert.equal(p.$(".view.active").id, `view-${view}`);
                assert.equal(p.$(`.menu-item[data-view="${view}"]`).classList.contains("active"), true);
                assert.equal(p.$("#tituloPagina").textContent, titulo);
                assert.equal(p.$("#subtituloPagina").textContent, subtitulo);
            } finally { p.fechar(); }
        });
    }

    test("botões data-go também navegam", async () => {
        const p = await carregarApp();
        try {
            p.clicar('[data-go="memoria"]');
            assert.equal(p.$(".view.active").id, "view-memoria");
        } finally { p.fechar(); }
    });
});

describe("tarefas", () => {
    test("criar pelo modal → salva em connect_tarefas, lista, contador e resumo", async () => {
        const p = await carregarApp();
        try {
            p.clicar("#novaTarefa");
            assert.equal(p.$("#modalTitulo").textContent, "Nova tarefa");
            preencherModal(p, { titulo: "  Comprar bola  ", descricao: "Para o jogo", data: "2026-11-20" });
            p.submeter("#formModal");
            const salvas = p.lerLocal("connect_tarefas");
            assert.equal(salvas.length, 1);
            assert.deepEqual({ ...salvas[0], id: 0 },
                { id: 0, titulo: "Comprar bola", descricao: "Para o jogo", data: "2026-11-20", concluida: false });
            assert.equal(typeof salvas[0].id, "number");
            assert.deepEqual(textos(p, "#listaTarefas .task-details strong"), ["Comprar bola"]);
            assert.match(p.$("#listaTarefas .task-details p").textContent, /Para o jogo\s+· 20\/11\/2026/);
            assert.equal(p.$("#contadorTarefas").textContent, "1");
            assert.deepEqual(textos(p, "#estatisticasTarefas strong"), ["1", "1", "0"]);
            assert.deepEqual(textos(p, "#resumoAtividades strong"), ["Comprar bola"]);
            assert.equal(p.$("#modal").hasAttribute("open"), false);
        } finally { p.fechar(); }
    });

    test("tarefa nova entra no topo da lista", async () => {
        const p = await carregarApp({ local: { connect_tarefas: [{ id: 1, titulo: "Antiga", descricao: "", data: "", concluida: false }] } });
        try {
            p.clicar("#novaTarefa");
            preencherModal(p, { titulo: "Nova" });
            p.submeter("#formModal");
            assert.deepEqual(textos(p, "#listaTarefas .task-details strong"), ["Nova", "Antiga"]);
        } finally { p.fechar(); }
    });

    test("dados salvos de antes são lidos e desenhados (sem migração)", async () => {
        const p = await carregarApp({
            local: {
                connect_tarefas: [
                    { id: 1, titulo: "Estudar", descricao: "", data: "", concluida: false },
                    { id: 2, titulo: "Lavar", descricao: "Carro", data: "2026-11-01", concluida: true }
                ]
            }
        });
        try {
            assert.deepEqual(textos(p, "#listaTarefas .task-details strong"), ["Estudar", "Lavar"]);
            assert.deepEqual(textos(p, "#listaTarefas .tag"), ["Pendente", "Concluída"]);
            assert.equal(p.$("#contadorTarefas").textContent, "1");
            assert.match(p.$$("#listaTarefas .task-details p")[0].textContent, /Sem descrição/);
        } finally { p.fechar(); }
    });

    test("marcar como concluída e excluir", async () => {
        const p = await carregarApp({ local: { connect_tarefas: [{ id: 7, titulo: "Estudar", descricao: "", data: "", concluida: false }] } });
        try {
            const check = p.$('[data-check="7"]');
            check.checked = true;
            check.dispatchEvent(new p.window.Event("change"));
            assert.equal(p.lerLocal("connect_tarefas")[0].concluida, true);
            assert.equal(p.$("#contadorTarefas").textContent, "0");
            p.clicar('[data-delete-task="7"]');
            assert.deepEqual(p.lerLocal("connect_tarefas"), []);
            assert.match(p.$("#listaTarefas").textContent, /Nenhuma tarefa por enquanto/);
        } finally { p.fechar(); }
    });
});

describe("eventos", () => {
    test("criar pelo modal → salva, lista e publica quadro já salvo na conversa da IA", async () => {
        const p = await carregarApp();
        try {
            p.clicar("#novoEvento");
            preencherModal(p, { titulo: "Festa", data: "2026-12-20", horario: "21:00", local: "Clube", descricao: "Traje livre" });
            p.submeter("#formModal");
            assert.deepEqual({ ...p.lerLocal("connect_eventos")[0], id: 0 },
                { id: 0, titulo: "Festa", data: "2026-12-20", horario: "21:00", local: "Clube", descricao: "Traje livre" });
            assert.match(p.$("#listaEventos .event-date").textContent, /20\/12\/2026\s+· 21:00/);
            assert.equal(p.$("#listaEventos h3").textContent, "Festa");
            await esperar(800);
            assert.equal(p.$("#mensagens .ai-board h4").textContent, "Festa");
            assert.equal(p.$("#mensagens .ai-board-saved").textContent, "✓ Salvo em Eventos");
        } finally { p.fechar(); }
    });

    test("excluir evento", async () => {
        const p = await carregarApp({ local: { connect_eventos: [{ id: 3, titulo: "X", data: "", horario: "", local: "", descricao: "" }] } });
        try {
            assert.match(p.$("#listaEventos").textContent, /Sem data definida/);
            assert.match(p.$("#listaEventos").textContent, /Local não definido/);
            p.clicar('[data-delete-event="3"]');
            assert.deepEqual(p.lerLocal("connect_eventos"), []);
        } finally { p.fechar(); }
    });
});

describe("enquetes", () => {
    test("menos de duas opções → alert e o modal continua aberto", async () => {
        const p = await carregarApp();
        try {
            p.clicar("#novaEnquete");
            preencherModal(p, { pergunta: "Qual dia?", opcao1: "Sábado", opcao2: "  " });
            p.submeter("#formModal");
            assert.deepEqual(p.alertas, ["Informe pelo menos duas opções para a enquete."]);
            assert.equal(p.lerLocal("connect_enquetes").length, 0);
            assert.equal(p.$("#modal").hasAttribute("open"), true);
        } finally { p.fechar(); }
    });

    test("criar e votar uma única vez", async () => {
        const p = await carregarApp();
        try {
            p.clicar("#novaEnquete");
            preencherModal(p, { pergunta: "Qual dia?", opcao1: "Sábado", opcao2: "Domingo", opcao3: "" });
            p.submeter("#formModal");
            const [enquete] = p.lerLocal("connect_enquetes");
            assert.deepEqual(enquete.opcoes, [{ texto: "Sábado", votos: 0 }, { texto: "Domingo", votos: 0 }]);
            assert.equal(enquete.voto, null);
            assert.equal(p.$$("#listaEnquetes [data-votar]").length, 2);

            p.clicar(p.$$("#listaEnquetes [data-votar]")[1]);
            const depois = p.lerLocal("connect_enquetes")[0];
            assert.equal(depois.voto, 1);
            assert.deepEqual(depois.opcoes.map(o => o.votos), [0, 1]);
            assert.equal(p.$$("#listaEnquetes [data-votar]").length, 0);
            assert.match(p.$("#listaEnquetes .poll-card > p").textContent, /1 voto\(s\)/);
            assert.equal(p.$$("#listaEnquetes .poll-bar span")[1].style.width, "100%");
        } finally { p.fechar(); }
    });
});

describe("memória", () => {
    test("BUG CONHECIDO D6: memória salva antes é apagada ao carregar (app.js:48-49)", async () => {
        const p = await carregarApp({ local: { connect_memoria: [{ id: 1, texto: "Prova sexta", conversa: "X", data: "2026-11-01" }] } });
        try {
            assert.deepEqual(p.lerLocal("connect_memoria"), []);
            assert.match(p.$("#listaMemoria").textContent, /Sua memória está vazia/);
            assert.match(p.$("#resumoMemoria").textContent, /Nenhuma informação guardada ainda/);
        } finally { p.fechar(); }
    });

    test("connect_conversas antigo é removido ao carregar (app.js:39)", async () => {
        const p = await carregarApp({ local: { connect_conversas: [{ id: 9 }] } });
        try {
            assert.equal(p.window.localStorage.getItem("connect_conversas"), null);
        } finally { p.fechar(); }
    });
});

describe("grupos (funcionalidade comentada, D3)", () => {
    test("grupos salvos são preservados em connect_grupos mesmo sem UI", async () => {
        const grupo = { id: 50, tipo: "grupo", nome: "Futsal", avatar: "F", descricao: "Grupo · 3 participantes", membros: [], mensagens: [] };
        const p = await carregarApp({ local: { connect_grupos: [grupo] } });
        try {
            assert.deepEqual(p.lerLocal("connect_grupos"), [grupo]);
            assert.ok(!textos(p, "#listaConversas strong").includes("Futsal"));
        } finally { p.fechar(); }
    });

    test("botão 'Novo grupo' não faz nada", async () => {
        const p = await carregarApp();
        try {
            p.clicar("#novoGrupo");
            assert.equal(p.$("#modal").hasAttribute("open"), false);
            assert.deepEqual(p.erros.map(e => e.message), []);
        } finally { p.fechar(); }
    });
});

describe("modal e cabeçalho", () => {
    test("Cancelar e ✕ fecham o modal", async () => {
        const p = await carregarApp();
        try {
            p.clicar("#novaTarefa");
            p.clicar("#cancelarModal");
            assert.equal(p.$("#modal").hasAttribute("open"), false);
            p.clicar("#novaTarefa");
            p.clicar("#fecharModal");
            assert.equal(p.$("#modal").hasAttribute("open"), false);
        } finally { p.fechar(); }
    });

    test("ⓘ mostra nome e descrição da conversa de app.js (a da IA)", async () => {
        const p = await carregarApp();
        try {
            p.clicar("#verInfo");
            assert.deepEqual(p.alertas, ["CONNECT+ AI\nChat privado com a IA"]);
        } finally { p.fechar(); }
    });

    test("BUG CONHECIDO D8: cada campo do modal cria outro id=\"erro-contato\"", async () => {
        const p = await carregarApp();
        try {
            p.clicar("#novaTarefa");
            // 1 do app.html + "titulo" e "data" (o ramo textarea de campoFormulario não gera o <p>)
            assert.equal(p.$$('[id="erro-contato"]').length, 3);
        } finally { p.fechar(); }
    });

    test("BUG CONHECIDO D5: criar tarefa com conversa da API aberta troca o painel pela conversa da IA", async () => {
        const p = await carregarApp();
        try {
            const joao = p.$$("#listaConversas .chat-contact").find(b => b.textContent.includes("João Lima"));
            p.clicar(joao);
            await assentar();
            assert.equal(p.$$("#mensagens .message-bubble").length, 1);

            p.clicar("#novaTarefa");
            preencherModal(p, { titulo: "Algo" });
            p.submeter("#formModal");

            assert.equal(p.$("#nomeGrupo").textContent, "CONNECT+ AI");
            assert.equal(p.$$("#mensagens .message-bubble").length, 0);
        } finally { p.fechar(); }
    });
});

describe("utilitários de app.js", () => {
    test("gerarId devolve número baseado em Date.now()", async () => {
        const p = await carregarApp();
        try {
            const id = p.window.gerarId();
            assert.equal(typeof id, "number");
            assert.ok(id >= p.window.Date.now() - 5 && id <= p.window.Date.now() + 1000);
        } finally { p.fechar(); }
    });

    test("as funções de formato chegam à página como globais (ordem dos scripts em app.html)", async () => {
        const p = await carregarApp();
        try {
            for (const nome of ["escaparHTML", "formatarData", "dataISO", "horaPtBR", "formatarTelefone"]) {
                assert.equal(typeof p.window[nome], "function", nome);
            }
            assert.equal(p.window.horaPtBR(), "10:00"); // relógio fixo da página
            assert.equal(p.window.dataISO(), "2026-11-11");
        } finally { p.fechar(); }
    });
});
