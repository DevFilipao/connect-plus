const { test, describe } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { carregarApp } = require("../apoio/carregar-pagina");
const { RAIZ } = require("../apoio/caminhos");

const scriptsDe = pagina =>
    [...fs.readFileSync(path.join(RAIZ, pagina), "utf8").matchAll(/<script src="([^"]+)"/g)].map(m => m[1]);

const antes = (lista, a, b) => {
    assert.ok(lista.includes(a), `${a} não está na página`);
    assert.ok(lista.includes(b), `${b} não está na página`);
    return lista.indexOf(a) < lista.indexOf(b);
};

const FUNCIONALIDADES = [
    "js/conversas.js", "js/quadro.js", "js/sugestao.js", "js/tarefas.js",
    "js/eventos.js", "js/enquetes.js", "js/memoria.js", "js/modal.js"
];

describe("app.html: ordem dos scripts", () => {
    const scripts = scriptsDe("app.html");

    test("todo script referenciado existe", () => {
        for (const src of scripts) assert.ok(fs.existsSync(path.join(RAIZ, src)), src);
    });

    test("módulos de domínio e repositório vêm antes do app.js", () => {
        for (const base of ["js/dominio/formato.js", "js/dominio/compromisso.js", "js/dominio/assistente.js",
            "js/dominio/votacao.js", "js/util.js", "js/storage.js", "js/repositorio.js"]) {
            assert.ok(antes(scripts, base, "js/app.js"), `${base} deve vir antes de js/app.js`);
        }
    });

    test("formato.js vem antes de compromisso.js, que o usa", () => {
        assert.ok(antes(scripts, "js/dominio/formato.js", "js/dominio/compromisso.js"));
    });

    test("app.js (estado e elementos) vem antes de cada funcionalidade", () => {
        for (const f of FUNCIONALIDADES) assert.ok(antes(scripts, "js/app.js", f), `js/app.js deve vir antes de ${f}`);
    });

    test("inicio.js roda depois de todas as funcionalidades e antes de api, auth e chat", () => {
        for (const f of FUNCIONALIDADES) assert.ok(antes(scripts, f, "js/inicio.js"), `${f} deve vir antes de js/inicio.js`);
        for (const depois of ["js/api.js", "js/auth.js", "js/chat.js"]) {
            assert.ok(antes(scripts, "js/inicio.js", depois), `js/inicio.js deve vir antes de ${depois}`);
        }
    });

    test("api, auth e chat mantêm a ordem entre si", () => {
        assert.ok(antes(scripts, "js/api.js", "js/auth.js"));
        assert.ok(antes(scripts, "js/auth.js", "js/chat.js"));
    });
});

describe("login.html: ordem dos scripts", () => {
    const scripts = scriptsDe("login.html");

    test("todo script referenciado existe", () => {
        for (const src of scripts) assert.ok(fs.existsSync(path.join(RAIZ, src)), src);
    });

    test("formato.js vem antes de util.js, que usa formatarTelefone", () => {
        assert.ok(antes(scripts, "js/dominio/formato.js", "js/util.js"));
    });

    test("login.js vem por último, depois de tudo o que ele usa", () => {
        for (const base of ["js/dominio/formato.js", "js/dominio/validacao.js", "js/util.js",
            "js/storage.js", "js/api.js", "js/auth.js"]) {
            assert.ok(antes(scripts, base, "js/login.js"), `${base} deve vir antes de js/login.js`);
        }
    });

    test("storage.js e api.js vêm antes de auth.js", () => {
        assert.ok(antes(scripts, "js/storage.js", "js/auth.js"));
        assert.ok(antes(scripts, "js/api.js", "js/auth.js"));
    });
});

test("cada módulo de funcionalidade foi carregado e define suas funções", async () => {
    const esperado = {
        "js/conversas.js": ["renderizarListaConversas", "renderizarChat", "enviarMensagem"],
        "js/quadro.js": ["publicarQuadro", "htmlQuadro", "acharQuadro"],
        "js/sugestao.js": ["analisarMensagem", "mostrarSugestao"],
        "js/tarefas.js": ["adicionarTarefa", "renderizarTarefas"],
        "js/eventos.js": ["adicionarEvento", "renderizarEventos"],
        "js/enquetes.js": ["adicionarEnquete", "renderizarEnquetes"],
        "js/memoria.js": ["renderizarMemoria", "renderizarResumoMemoria"],
        "js/modal.js": ["abrirModal", "fecharModal", "campoFormulario"],
        "js/app.js": ["salvarDados", "abrirPagina", "atualizarTudo", "renderizarResumoAtividades"]
    };
    const p = await carregarApp();
    try {
        for (const [arquivo, funcoes] of Object.entries(esperado)) {
            for (const nome of funcoes) assert.equal(typeof p.window[nome], "function", `${nome} (${arquivo})`);
        }
        assert.deepEqual(p.erros.map(e => e.message), []);
    } finally { p.fechar(); }
});
