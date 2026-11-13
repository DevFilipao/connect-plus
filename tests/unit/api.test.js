// Caracterização de js/api.js (chamarApi). Fixa o CONTRATO do lado cliente.
const { test } = require("node:test");
const assert = require("node:assert/strict");
const { carregarScript } = require("../apoio/carregar-script");

function novoContexto(resposta) {
    const chamadas = [];
    const fetch = async (url, init) => {
        chamadas.push({ url, init });
        return { json: async () => resposta };
    };
    const ctx = carregarScript("js/api.js", { fetch });
    return { ctx, chamadas };
}

test("API_URL aponta para um Web App do Apps Script (/exec)", () => {
    const { ctx } = novoContexto({ ok: true });
    assert.match(ctx.API_URL, /^https:\/\/script\.google\.com\/macros\/s\/[\w-]+\/exec$/);
});

test("envia POST com JSON em text/plain (sem preflight CORS) e corpo { acao, ...dados }", async () => {
    const { ctx, chamadas } = novoContexto({ ok: true, dados: 1 });
    await ctx.chamarApi("enviar", { token: "t", conversaId: 10, texto: "oi" });
    assert.equal(chamadas.length, 1);
    const { url, init } = chamadas[0];
    assert.equal(url, ctx.API_URL);
    assert.equal(init.method, "POST");
    assert.deepEqual({ ...init.headers }, { "Content-Type": "text/plain;charset=utf-8" });
    assert.equal(init.body, JSON.stringify({ acao: "enviar", token: "t", conversaId: 10, texto: "oi" }));
});

test("sem dados envia só { acao }", async () => {
    const { ctx, chamadas } = novoContexto({ ok: true });
    await ctx.chamarApi("logout");
    assert.equal(chamadas[0].init.body, "{\"acao\":\"logout\"}");
});

test("'acao' é sobrescrita se vier dentro de dados (Object.assign na ordem atual)", async () => {
    const { ctx, chamadas } = novoContexto({ ok: true });
    await ctx.chamarApi("login", { acao: "outra" });
    assert.equal(JSON.parse(chamadas[0].init.body).acao, "outra");
});

test("ok:true devolve só 'dados'", async () => {
    const { ctx } = novoContexto({ ok: true, dados: { id: 7 } });
    assert.deepEqual({ ...(await ctx.chamarApi("x")) }, { id: 7 });
});

test("ok:false lança Error com a mensagem e o código do servidor", async () => {
    const { ctx } = novoContexto({ ok: false, erro: "Sessão expirada.", codigo: "SESSAO" });
    await assert.rejects(ctx.chamarApi("conversas"), e => e.message === "Sessão expirada." && e.codigo === "SESSAO");
});

test("ok:false sem mensagem usa 'Erro na API.'", async () => {
    const { ctx } = novoContexto({ ok: false });
    await assert.rejects(ctx.chamarApi("x"), e => e.message === "Erro na API." && e.codigo === undefined);
});

test("API_URL ainda não configurada (COLE_AQUI...) lança erro sem chamar fetch", async () => {
    const { ctx, chamadas } = novoContexto({ ok: true });
    ctx.API_URL = "COLE_AQUI_A_URL";
    await assert.rejects(ctx.chamarApi("x"), /Configure API_URL em js\/api\.js/);
    assert.equal(chamadas.length, 0);
});
