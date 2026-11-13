// Caracterização de js/storage.js (Sessao).
const { test } = require("node:test");
const assert = require("node:assert/strict");
const { carregarScript, criarStorage } = require("../apoio/carregar-script");

function novoContexto(local = {}, sessao = {}) {
    const localStorage = criarStorage(local);
    const sessionStorage = criarStorage(sessao);
    const ctx = carregarScript("js/storage.js", { localStorage, sessionStorage });
    return { Sessao: ctx.Sessao, localStorage, sessionStorage };
}

const DADOS = { token: "t1", nome: "Maria", telefone: "11987654321" };

test("salvar sem 'lembrar' (undefined) grava em localStorage", () => {
    const { Sessao, localStorage, sessionStorage } = novoContexto();
    Sessao.salvar(DADOS);
    assert.equal(localStorage.getItem("sessao"), JSON.stringify(DADOS));
    assert.equal(sessionStorage.getItem("sessao"), null);
});

test("salvar com lembrar=true grava em localStorage e limpa sessionStorage", () => {
    const { Sessao, localStorage, sessionStorage } = novoContexto({}, { sessao: "{\"token\":\"velho\"}" });
    Sessao.salvar(DADOS, true);
    assert.equal(localStorage.getItem("sessao"), JSON.stringify(DADOS));
    assert.equal(sessionStorage.getItem("sessao"), null);
});

test("salvar com lembrar=false grava só em sessionStorage e limpa localStorage", () => {
    const { Sessao, localStorage, sessionStorage } = novoContexto({ sessao: "{\"token\":\"velho\"}" });
    Sessao.salvar(DADOS, false);
    assert.equal(sessionStorage.getItem("sessao"), JSON.stringify(DADOS));
    assert.equal(localStorage.getItem("sessao"), null);
});

test("ler prefere sessionStorage a localStorage", () => {
    const { Sessao } = novoContexto({ sessao: "{\"token\":\"local\"}" }, { sessao: "{\"token\":\"aba\"}" });
    assert.equal(Sessao.ler().token, "aba");
});

test("ler cai para localStorage quando a aba não tem sessão", () => {
    const { Sessao } = novoContexto({ sessao: "{\"token\":\"local\"}" });
    assert.equal(Sessao.ler().token, "local");
});

test("ler sem sessão nenhuma devolve null", () => {
    const { Sessao } = novoContexto();
    assert.equal(Sessao.ler(), null);
});

test("ler com JSON inválido devolve null", () => {
    const { Sessao } = novoContexto({ sessao: "{quebrado" });
    assert.equal(Sessao.ler(), null);
});

test("limpar remove a sessão dos dois armazenamentos", () => {
    const { Sessao, localStorage, sessionStorage } = novoContexto({ sessao: "{}" }, { sessao: "{}" });
    Sessao.limpar();
    assert.equal(localStorage.getItem("sessao"), null);
    assert.equal(sessionStorage.getItem("sessao"), null);
});
