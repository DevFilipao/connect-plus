// Caracterização do assistente simulado (js/app.js:478-804).
// Hoje ele é INALCANÇÁVEL pela interface (D4): analisarMensagem é chamada aqui direto de `window`.
// Na F4 a classificação vai para js/dominio/assistente.js; na F8 (opcional) ele é religado ao chat.
const { test, describe } = require("node:test");
const assert = require("node:assert/strict");
const { carregarApp, assentar, esperar } = require("../apoio/carregar-pagina");

const QUADRO_MS = 800; // publicarQuadro espera 700 ms

describe("classificação e sugestão", () => {
    const CASOS = [
        ["preciso estudar para a prova", "tarefa", "Criar tarefa"],
        ["não esquecer de comprar pão", "tarefa", "Criar tarefa"],
        ["qual dia vocês preferem?", "enquete", "Criar enquete"],
        // enquete vence evento e tarefa
        ["quem vai no jogo sábado? preciso levar bola", "enquete", "Criar enquete"]
    ];
    for (const [texto, tipo, rotulo] of CASOS) {
        test(`${JSON.stringify(texto)} → sugestão '${tipo}'`, async () => {
            const p = await carregarApp();
            try {
                p.window.analisarMensagem(texto);
                assert.equal(p.$("#sugestao").hidden, false);
                assert.equal(p.$("#criarAcao").textContent, rotulo);
            } finally { p.fechar(); }
        });
    }

    test("evento (sem palavra de enquete) não sugere: publica quadro na conversa da IA", async () => {
        const p = await carregarApp();
        try {
            p.window.analisarMensagem("jogo sábado às 19h no Ginásio Central");
            assert.equal(p.$("#sugestao").hidden, true);
            assert.equal(p.$$("#mensagens .ai-board").length, 0);
            await esperar(QUADRO_MS);
            assert.equal(p.$("#mensagens .ai-board h4").textContent, "Jogo · Sábado");
            assert.deepEqual(p.$$("#mensagens .ai-board-info li").map(li => li.textContent),
                ["📅 14/11/2026", "🕒 19:00", "📍 Ginásio Central"]);
            assert.deepEqual(p.$$("#mensagens .ai-option .ai-option-text").map(e => e.textContent), ["Vou", "Talvez", "Não vou"]);
        } finally { p.fechar(); }
    });

    test("evento vence tarefa ('reunião' + 'preciso')", async () => {
        const p = await carregarApp();
        try {
            p.window.analisarMensagem("preciso ir na reunião");
            assert.equal(p.$("#sugestao").hidden, true);
            await esperar(QUADRO_MS);
            assert.equal(p.$("#mensagens .ai-board h4").textContent, "Reunião");
        } finally { p.fechar(); }
    });

    test("mensagem neutra esconde a sugestão e não guarda memória", async () => {
        const p = await carregarApp();
        try {
            p.window.analisarMensagem("preciso estudar");
            p.window.analisarMensagem("bom dia");
            assert.equal(p.$("#sugestao").hidden, true);
            assert.equal(p.lerLocal("connect_memoria").length, 1);
        } finally { p.fechar(); }
    });
});

describe("memória", () => {
    test("mensagem relevante entra no topo da memória, com a conversa e a data de hoje", async () => {
        const p = await carregarApp();
        try {
            p.window.analisarMensagem("preciso estudar");
            p.window.analisarMensagem("qual dia vocês preferem?");
            const memoria = p.lerLocal("connect_memoria");
            assert.deepEqual(memoria.map(m => ({ texto: m.texto, conversa: m.conversa, data: m.data })), [
                { texto: "qual dia vocês preferem?", conversa: "CONNECT+ AI", data: "2026-11-11" },
                { texto: "preciso estudar", conversa: "CONNECT+ AI", data: "2026-11-11" }
            ]);
            assert.deepEqual(p.$$("#resumoMemoria .memory-mini").map(e => e.textContent), ["qual dia vocês preferem?", "preciso estudar"]);
        } finally { p.fechar(); }
    });

    test("o mesmo texto não é guardado duas vezes", async () => {
        const p = await carregarApp();
        try {
            p.window.analisarMensagem("preciso estudar");
            p.window.analisarMensagem("preciso estudar");
            assert.equal(p.lerLocal("connect_memoria").length, 1);
        } finally { p.fechar(); }
    });

    test("excluir item da memória", async () => {
        const p = await carregarApp();
        try {
            p.window.analisarMensagem("preciso estudar");
            p.clicar('.menu-item[data-view="memoria"]');
            p.clicar("#listaMemoria [data-delete-memory]");
            assert.deepEqual(p.lerLocal("connect_memoria"), []);
        } finally { p.fechar(); }
    });
});

describe("ações da sugestão", () => {
    test("'Criar tarefa' abre o modal com o texto da mensagem como título", async () => {
        const p = await carregarApp();
        try {
            p.window.analisarMensagem("preciso estudar");
            p.clicar("#criarAcao");
            assert.equal(p.$("#modalTitulo").textContent, "Nova tarefa");
            assert.equal(p.$("#modalCampos #titulo").value, "preciso estudar");
            assert.equal(p.$("#sugestao").hidden, true);
        } finally { p.fechar(); }
    });

    test("'Criar enquete' abre o modal com o texto como pergunta", async () => {
        const p = await carregarApp();
        try {
            p.window.analisarMensagem("qual dia vocês preferem?");
            p.clicar("#criarAcao");
            assert.equal(p.$("#modalTitulo").textContent, "Nova enquete");
            assert.equal(p.$("#modalCampos #pergunta").value, "qual dia vocês preferem?");
        } finally { p.fechar(); }
    });

    test("sem sugestão e sem mensagens, 'Criar' avisa por alert", async () => {
        const p = await carregarApp();
        try {
            p.clicar("#criarAcao");
            assert.deepEqual(p.alertas, ["Envie uma mensagem antes de criar uma tarefa."]);
        } finally { p.fechar(); }
    });

    test("'Agora não' esconde a sugestão", async () => {
        const p = await carregarApp();
        try {
            p.window.analisarMensagem("preciso estudar");
            p.clicar("#dispensarSugestao");
            assert.equal(p.$("#sugestao").hidden, true);
        } finally { p.fechar(); }
    });
});

describe("quadro do compromisso", () => {
    async function comQuadro() {
        const p = await carregarApp();
        p.window.analisarMensagem("jogo sábado às 19h no Ginásio Central");
        await esperar(QUADRO_MS);
        return p;
    }
    const votos = p => p.$$("#mensagens .ai-option strong").map(e => Number(e.textContent));
    const opcao = (p, i) => p.$(`#mensagens [data-opcao="${i}"]`);

    test("votar, desfazer clicando de novo e trocar de opção", async () => {
        const p = await comQuadro();
        try {
            p.clicar(opcao(p, 0));
            assert.deepEqual(votos(p), [1, 0, 0]);
            assert.ok(opcao(p, 0).classList.contains("voted"));
            assert.equal(opcao(p, 0).querySelector(".ai-option-bar").style.width, "100%");

            p.clicar(opcao(p, 0));
            assert.deepEqual(votos(p), [0, 0, 0]);

            p.clicar(opcao(p, 0));
            p.clicar(opcao(p, 2));
            assert.deepEqual(votos(p), [0, 0, 1]);
        } finally { p.fechar(); }
    });

    test("'Adicionar aos eventos' cria o evento uma vez e troca o botão pelo selo", async () => {
        const p = await comQuadro();
        try {
            p.clicar("#mensagens [data-quadro-salvar]");
            const eventos = p.lerLocal("connect_eventos");
            assert.deepEqual(eventos.map(e => ({ titulo: e.titulo, data: e.data, horario: e.horario, local: e.local, descricao: e.descricao })),
                [{ titulo: "Jogo · Sábado", data: "2026-11-14", horario: "19:00", local: "Ginásio Central", descricao: "" }]);
            assert.equal(p.$("#mensagens [data-quadro-salvar]"), null);
            assert.equal(p.$("#mensagens .ai-board-saved").textContent, "✓ Salvo em Eventos");
        } finally { p.fechar(); }
    });

    test("o quadro não é persistido entre carregamentos (conversa da IA começa vazia)", async () => {
        const p = await comQuadro();
        try {
            assert.equal(p.window.localStorage.getItem("connect_conversas"), null);
        } finally { p.fechar(); }
    });
});

test("BUG CONHECIDO D4: enviar pelo chat (formMensagem da API) não aciona o assistente", async () => {
    const p = await carregarApp();
    try {
        const joao = p.$$("#listaConversas .chat-contact").find(b => b.textContent.includes("João Lima"));
        p.clicar(joao);
        await assentar();
        p.$("#campoMensagem").value = "preciso estudar para a prova";
        p.submeter("#formMensagem");
        await assentar();
        assert.equal(p.api.doTipo("enviar").length, 1);
        assert.equal(p.$("#sugestao").hidden, true);
        assert.deepEqual(p.lerLocal("connect_memoria"), []);
    } finally { p.fechar(); }
});
