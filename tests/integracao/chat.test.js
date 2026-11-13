// Caracterização de js/chat.js (conversas via API) dentro do app.html real.
const { test, describe } = require("node:test");
const assert = require("node:assert/strict");
const { carregarApp, carregarPagina, assentar, esperar } = require("../apoio/carregar-pagina");
const { criarApiFalsa, erro } = require("../apoio/api-falsa");

const nomesNaLista = p => p.$$("#listaConversas .chat-contact strong").map(e => e.textContent);
const bolhas = p => p.$$("#mensagens .message-bubble").map(e => e.textContent);
const conversa = (p, nome) => p.$$("#listaConversas .chat-contact").find(b => b.querySelector("strong").textContent === nome);

describe("chat.js: carga", () => {
    test("sem sessão → manda para login.html e não chama a API", async () => {
        const p = await carregarPagina("app.html");
        try {
            await assentar();
            assert.ok(p.navegacoes.some(n => n.destino === "login.html"));
            assert.equal(p.api.chamadas.length, 0);
        } finally { p.fechar(); }
    });

    test("com sessão → mostra o nome e lista a conversa da IA + as da API", async () => {
        const p = await carregarApp();
        try {
            assert.equal(p.$("#meu-nome").textContent, "Maria Souza");
            assert.deepEqual(p.api.doTipo("conversas")[0].corpo, { acao: "conversas", token: "tok-123" });
            assert.deepEqual(nomesNaLista(p), ["CONNECT+ AI", "João Lima"]);
            assert.deepEqual(p.$$("#listaConversas small").map(e => e.textContent), ["Chat privado com a IA", "11911112222"]);
            assert.deepEqual(p.erros.map(e => e.message), []);
        } finally { p.fechar(); }
    });

    test("código SESSAO ao listar → limpa a sessão e volta ao login", async () => {
        const api = criarApiFalsa({ conversas: () => erro("Sessão expirada.", "SESSAO") });
        const p = await carregarApp({ api });
        try {
            assert.equal(p.window.localStorage.getItem("sessao"), null);
            assert.ok(p.navegacoes.some(n => n.destino === "login.html"));
        } finally { p.fechar(); }
    });

    test("erro comum ao listar → 'Sem conexão…' no status", async () => {
        const api = criarApiFalsa({ conversas: () => erro("Falhou.") });
        const p = await carregarApp({ api });
        try {
            assert.equal(p.$("#statusGrupo").textContent, "Sem conexão…");
        } finally { p.fechar(); }
    });
});

describe("chat.js: conversa", () => {
    test("selecionar conversa busca mensagens desde o id 0 e as desenha com hora local", async () => {
        const p = await carregarApp();
        try {
            p.clicar(conversa(p, "João Lima"));
            await assentar();
            assert.deepEqual(p.api.doTipo("mensagens")[0].corpo,
                { acao: "mensagens", token: "tok-123", conversaId: 10, depoisId: 0 });
            assert.equal(p.$("#nomeGrupo").textContent, "João Lima");
            assert.equal(p.$("#avatarGrupo").textContent, "J");
            assert.ok(conversa(p, "João Lima").classList.contains("selected"));
            assert.deepEqual(bolhas(p), ["Oi, Maria!"]);
            assert.equal(p.$("#mensagens .message-time").textContent, "09:58");
            assert.equal(p.$("#mensagens .message-row").classList.contains("mine"), false);
        } finally { p.fechar(); }
    });

    test("enviar → chamada 'enviar', busca a partir do último id e marca a mensagem como minha", async () => {
        const p = await carregarApp();
        try {
            p.clicar(conversa(p, "João Lima"));
            await assentar();
            p.$("#campoMensagem").value = "  Tudo certo?  ";
            p.submeter("#formMensagem");
            await assentar();
            assert.deepEqual(p.api.doTipo("enviar")[0].corpo,
                { acao: "enviar", token: "tok-123", conversaId: 10, texto: "Tudo certo?" });
            assert.ok(p.api.doTipo("mensagens").some(c => c.corpo.depoisId === 1));
            assert.deepEqual(bolhas(p), ["Oi, Maria!", "Tudo certo?"]);
            assert.ok(p.$$("#mensagens .message-row")[1].classList.contains("mine"));
            assert.equal(p.$("#campoMensagem").value, "");
        } finally { p.fechar(); }
    });

    test("polling não duplica mensagens já mostradas", async () => {
        const p = await carregarApp();
        try {
            p.clicar(conversa(p, "João Lima"));
            await esperar(1200); // pelo menos 2 ticks de 500 ms
            assert.ok(p.api.doTipo("mensagens").length >= 3);
            assert.deepEqual(bolhas(p), ["Oi, Maria!"]);
        } finally { p.fechar(); }
    });

    test("mensagem nova de outra pessoa chega pelo polling", async () => {
        const p = await carregarApp();
        try {
            p.clicar(conversa(p, "João Lima"));
            await assentar();
            p.api.estado.mensagens.push({ id: 2, conversaId: 10, de: "11911112222", nome: "João Lima", texto: "Bora?", dataHora: "2026-11-11T13:01:00.000Z" });
            await esperar(700);
            assert.deepEqual(bolhas(p), ["Oi, Maria!", "Bora?"]);
        } finally { p.fechar(); }
    });

    test("falha no envio devolve o texto ao campo", async () => {
        const api = criarApiFalsa({ enviar: () => erro("Falhou.") });
        const p = await carregarApp({ api });
        try {
            p.clicar(conversa(p, "João Lima"));
            await assentar();
            p.$("#campoMensagem").value = "não vai";
            p.submeter("#formMensagem");
            await assentar();
            assert.equal(p.$("#campoMensagem").value, "não vai");
            assert.equal(p.$("#statusGrupo").textContent, "Sem conexão…");
        } finally { p.fechar(); }
    });

    test("sem conversa selecionada, enviar não faz nada", async () => {
        const p = await carregarApp();
        try {
            p.$("#campoMensagem").value = "oi";
            p.submeter("#formMensagem");
            await assentar();
            assert.equal(p.api.doTipo("enviar").length, 0);
        } finally { p.fechar(); }
    });

    test("BUG CONHECIDO D7: selecionar a conversa da IA consulta a API com conversaId 1", async () => {
        const p = await carregarApp();
        try {
            p.clicar(conversa(p, "CONNECT+ AI"));
            await assentar();
            assert.equal(p.api.doTipo("mensagens")[0].corpo.conversaId, 1);
        } finally { p.fechar(); }
    });
});

describe("chat.js: nova conversa e sair", () => {
    test("abrir conversa por telefone (modal) → chamada abrirConversa com o valor mascarado", async () => {
        const p = await carregarApp();
        try {
            p.clicar("#novoChat");
            assert.equal(p.$("#modal").hasAttribute("open"), true);
            assert.equal(p.$("#modalTitulo").textContent, "Nova conversa");
            p.digitar("#novo-telefone", "11955554444");
            assert.equal(p.$("#novo-telefone").value, "(11) 95555-4444");
            p.submeter("#formModal");
            await assentar();
            assert.equal(p.api.doTipo("abrirConversa")[0].corpo.telefone, "(11) 95555-4444");
            assert.equal(p.$("#modal").hasAttribute("open"), false);
            assert.equal(p.$("#nomeGrupo").textContent, "Contato 4444");
            assert.ok(nomesNaLista(p).includes("Contato 4444"));
        } finally { p.fechar(); }
    });

    test("erro ao abrir conversa → mensagem em #erro-modal e modal continua aberto", async () => {
        const p = await carregarApp();
        try {
            p.clicar("#novoChat");
            p.digitar("#novo-telefone", "119");
            p.submeter("#formModal");
            await assentar();
            assert.equal(p.$("#erro-modal").textContent, "Número inválido.");
            assert.equal(p.$("#erro-modal").style.color, "red");
            assert.equal(p.$("#modal").hasAttribute("open"), true);
        } finally { p.fechar(); }
    });

    test("Sair → limpa a sessão, chama logout e vai para login.html", async () => {
        const p = await carregarApp();
        try {
            p.clicar("#btn-sair");
            await assentar();
            assert.equal(p.window.localStorage.getItem("sessao"), null);
            assert.deepEqual(p.api.doTipo("logout")[0].corpo, { acao: "logout", token: "tok-123" });
            assert.ok(p.navegacoes.some(n => n.destino === "login.html"));
        } finally { p.fechar(); }
    });
});
