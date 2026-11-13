// Caracterização de index.html (redirecionamento) e termos.html (js/termos.js).
const { test, describe } = require("node:test");
const assert = require("node:assert/strict");
const { carregarPagina } = require("../apoio/carregar-pagina");

describe("index.html", () => {
    test("sem sessão → login.html", async () => {
        const p = await carregarPagina("index.html");
        try {
            assert.deepEqual(p.navegacoes, [{ destino: "login.html", substituir: true }]);
        } finally { p.fechar(); }
    });

    test("com sessão lembrada → app.html", async () => {
        const p = await carregarPagina("index.html", { local: { sessao: { token: "t" } } });
        try {
            assert.deepEqual(p.navegacoes, [{ destino: "app.html", substituir: true }]);
        } finally { p.fechar(); }
    });

    test("com sessão só na aba → app.html", async () => {
        const p = await carregarPagina("index.html", { sessao: { sessao: { token: "t" } } });
        try {
            assert.deepEqual(p.navegacoes, [{ destino: "app.html", substituir: true }]);
        } finally { p.fechar(); }
    });

    test("sessão sem token → login.html", async () => {
        const p = await carregarPagina("index.html", { local: { sessao: { nome: "x" } } });
        try {
            assert.deepEqual(p.navegacoes, [{ destino: "login.html", substituir: true }]);
        } finally { p.fechar(); }
    });
});

describe("termos.html", () => {
    const ativo = p => p.$(".documento.ativo").id;

    test("sem hash abre Termos de Uso", async () => {
        const p = await carregarPagina("termos.html");
        try {
            assert.equal(ativo(p), "termos");
            assert.deepEqual(p.erros.map(e => e.message), []);
        } finally { p.fechar(); }
    });

    test("#privacidade abre a Política de Privacidade", async () => {
        const p = await carregarPagina("termos.html", { hash: "#privacidade" });
        try {
            assert.equal(ativo(p), "privacidade");
            assert.equal(p.$("#aba-privacidade").getAttribute("aria-selected"), "true");
        } finally { p.fechar(); }
    });

    test("âncora de seção (#p3) abre a aba de privacidade", async () => {
        const p = await carregarPagina("termos.html", { hash: "#p3" });
        try {
            assert.equal(ativo(p), "privacidade");
        } finally { p.fechar(); }
    });

    test("D16: qualquer hash iniciado por 'p' abre privacidade (startsWith, termos.js:33)", async () => {
        const p = await carregarPagina("termos.html", { hash: "#qualquer-p" });
        const q = await carregarPagina("termos.html", { hash: "#pagamento" });
        try {
            assert.equal(ativo(p), "termos");
            assert.equal(ativo(q), "privacidade");
        } finally { p.fechar(); q.fechar(); }
    });

    test("clicar numa aba troca o documento e o hash", async () => {
        const p = await carregarPagina("termos.html");
        try {
            p.clicar("#aba-privacidade");
            assert.equal(ativo(p), "privacidade");
            assert.equal(p.window.location.hash, "#privacidade");
        } finally { p.fechar(); }
    });

    test("'Entendi e aceito' grava termosAceitos e, sem histórico, vai para index.html", async () => {
        const p = await carregarPagina("termos.html");
        try {
            p.clicar("#btnAceitar");
            assert.equal(p.window.sessionStorage.getItem("termosAceitos"), "sim");
            assert.deepEqual(p.navegacoes, [{ destino: "index.html", substituir: false }]);
        } finally { p.fechar(); }
    });

    test("'Voltar' sem histórico vai para index.html", async () => {
        const p = await carregarPagina("termos.html");
        try {
            p.clicar(".voltar");
            assert.deepEqual(p.navegacoes, [{ destino: "index.html", substituir: false }]);
        } finally { p.fechar(); }
    });
});
