const { test, describe } = require("node:test");
const assert = require("node:assert/strict");
const { carregarScript } = require("../apoio/carregar-script");

function carregarAuth({ sessao = null, resposta = async () => ({}) } = {}) {
    const chamadas = [];
    const eventos = [];
    const globais = {
        Sessao: {
            ler: () => sessao,
            salvar: (dados, lembrar) => eventos.push(["salvar", dados, lembrar]),
            limpar: () => eventos.push(["limpar"])
        },
        chamarApi: async (acao, dados) => {
            chamadas.push([acao, JSON.parse(JSON.stringify(dados))]);
            eventos.push(["api", acao]);
            return resposta(acao, dados);
        },
        location: { replace: destino => eventos.push(["ir", destino]) }
    };
    return { ctx: carregarScript("js/auth.js", globais), chamadas, eventos };
}

test("carrega sem DOM, sem login.js e sem tocar na página", () => {
    assert.doesNotThrow(() => carregarAuth());
});

test("expõe só as quatro funções de conta", () => {
    const { ctx } = carregarAuth();
    for (const nome of ["exigirLogin", "sair", "entrar", "cadastrar"]) assert.equal(typeof ctx[nome], "function", nome);
    for (const nome of ["ligarFormulario", "finalizarLogin"]) assert.equal(ctx[nome], undefined, nome);
});

describe("exigirLogin", () => {
    test("sem sessão → vai para o login e devolve null", () => {
        const { ctx, eventos } = carregarAuth({ sessao: null });
        assert.equal(ctx.exigirLogin(), null);
        assert.deepEqual(eventos, [["ir", "login.html"]]);
    });

    test("sessão sem token → vai para o login", () => {
        const { ctx, eventos } = carregarAuth({ sessao: { nome: "Maria" } });
        assert.equal(ctx.exigirLogin(), null);
        assert.deepEqual(eventos, [["ir", "login.html"]]);
    });

    test("sessão com token → devolve a sessão sem redirecionar", () => {
        const sessao = { token: "t", nome: "Maria" };
        const { ctx, eventos } = carregarAuth({ sessao });
        assert.equal(ctx.exigirLogin(), sessao);
        assert.deepEqual(eventos, []);
    });
});

describe("entrar", () => {
    test("chama a ação login, salva a sessão com a preferência de lembrar e devolve os dados", async () => {
        const dados = { token: "t", nome: "Maria", telefone: "11987654321" };
        const { ctx, chamadas, eventos } = carregarAuth({ resposta: async () => dados });
        assert.equal(await ctx.entrar("11987654321", "segredo1", false), dados);
        assert.deepEqual(chamadas, [["login", { telefone: "11987654321", senha: "segredo1" }]]);
        assert.deepEqual(eventos.at(-1), ["salvar", dados, false]);
    });

    test("erro da API não salva sessão e é repassado", async () => {
        const { ctx, eventos } = carregarAuth({ resposta: async () => { throw new Error("Senha incorreta."); } });
        await assert.rejects(ctx.entrar("1", "x", true), /Senha incorreta\./);
        assert.ok(!eventos.some(([tipo]) => tipo === "salvar"));
    });
});

test("cadastrar chama a ação cadastro com os dados recebidos", async () => {
    const { ctx, chamadas } = carregarAuth({ resposta: async () => ({ criado: true }) });
    const dados = { nome: "Ana", telefone: "21999990000", email: "a@b.com", senha: "segredo9" };
    assert.deepEqual({ ...(await ctx.cadastrar(dados)) }, { criado: true });
    assert.deepEqual(chamadas, [["cadastro", dados]]);
});

describe("sair", () => {
    test("limpa a sessão antes de avisar a API e vai para o login", async () => {
        const { ctx, eventos } = carregarAuth({ sessao: { token: "t" } });
        await ctx.sair();
        assert.deepEqual(eventos, [["limpar"], ["api", "logout"], ["ir", "login.html"]]);
    });

    test("envia o token no logout", async () => {
        const { ctx, chamadas } = carregarAuth({ sessao: { token: "abc" } });
        await ctx.sair();
        assert.deepEqual(chamadas, [["logout", { token: "abc" }]]);
    });

    test("falha no logout é ignorada e ainda vai para o login", async () => {
        const { ctx, eventos } = carregarAuth({ sessao: { token: "t" }, resposta: async () => { throw new Error("offline"); } });
        await ctx.sair();
        assert.deepEqual(eventos.at(-1), ["ir", "login.html"]);
    });

    test("sem sessão não chama a API, mas vai para o login", async () => {
        const { ctx, chamadas, eventos } = carregarAuth({ sessao: null });
        await ctx.sair();
        assert.deepEqual(chamadas, []);
        assert.deepEqual(eventos, [["limpar"], ["ir", "login.html"]]);
    });
});
