// Caracterização de login.html (js/login.js + js/auth.js) com a API falsa.
// O submit é disparado direto (sem a validação HTML `required`): fixamos só a lógica JS.
const { test, describe } = require("node:test");
const assert = require("node:assert/strict");
const { carregarPagina, assentar } = require("../apoio/carregar-pagina");
const { criarApiFalsa, erro } = require("../apoio/api-falsa");

async function abrirLogin(opcoes) {
    const p = await carregarPagina("login.html", opcoes);
    return p;
}

function preencherLogin(p, { numero = "(11) 98765-4321", senha = "segredo1", termos = true, dados = true, lembrar = false } = {}) {
    p.digitar("#loginNumero", numero);
    p.$("#loginSenha").value = senha;
    p.$("#termosLogin").checked = termos;
    p.$("#termosDados").checked = dados;
    p.$("#lembrarLogin").checked = lembrar;
}

describe("login: validações", () => {
    const CASOS = [
        [{ numero: "" }, "Informe o número de telefone."],
        [{ senha: "" }, "Informe a senha."],
        [{ numero: "11 9876" }, "Digite um número válido com DDD!"],
        [{ senha: "12345" }, "Digite sua senha (mínimo de 6 caracteres)."],
        [{ termos: false }, "Para continuar, aceite os Termos de Uso e a Política de Privacidade."],
        [{ dados: false }, "Para continuar, confirme que você é o titular da conta."]
    ];
    for (const [campos, mensagem] of CASOS) {
        test(`${JSON.stringify(campos)} → alert "${mensagem}" e nenhuma chamada à API`, async () => {
            const p = await abrirLogin();
            try {
                preencherLogin(p, campos);
                p.submeter("#formularioLogin");
                await assentar();
                assert.deepEqual(p.alertas, [mensagem]);
                assert.equal(p.api.doTipo("login").length, 0);
                assert.equal(p.$("#btnLogin").disabled, false);
            } finally { p.fechar(); }
        });
    }
});

describe("login: vários problemas ao mesmo tempo", () => {
    test("tudo errado → um único alert, o do primeiro problema (telefone)", async () => {
        const p = await abrirLogin();
        try {
            preencherLogin(p, { numero: "", senha: "", termos: false, dados: false });
            p.submeter("#formularioLogin");
            await assentar();
            assert.deepEqual(p.alertas, ["Informe o número de telefone."]);
        } finally { p.fechar(); }
    });

    test("número curto e senha vazia → mostra o da senha vazia", async () => {
        const p = await abrirLogin();
        try {
            preencherLogin(p, { numero: "(11) 9876", senha: "" });
            p.submeter("#formularioLogin");
            await assentar();
            assert.deepEqual(p.alertas, ["Informe a senha."]);
        } finally { p.fechar(); }
    });

    test("número curto e senha curta → mostra o do número", async () => {
        const p = await abrirLogin();
        try {
            preencherLogin(p, { numero: "(11) 9876", senha: "123" });
            p.submeter("#formularioLogin");
            await assentar();
            assert.deepEqual(p.alertas, ["Digite um número válido com DDD!"]);
        } finally { p.fechar(); }
    });

    test("só os termos faltando (telefone e senha válidos) → mostra o dos termos, não o do titular", async () => {
        const p = await abrirLogin();
        try {
            preencherLogin(p, { termos: false, dados: false });
            p.submeter("#formularioLogin");
            await assentar();
            assert.deepEqual(p.alertas, ["Para continuar, aceite os Termos de Uso e a Política de Privacidade."]);
        } finally { p.fechar(); }
    });
});

describe("login: envio", () => {
    test("sucesso sem 'lembrar' → sessão em sessionStorage, limpa chaves legadas e vai para app.html", async () => {
        const p = await abrirLogin({
            local: { connect_usuario: "{}", connect_lembrar: "true" },
            sessao: { rascunhoCadastro: "{}", termosAceitos: "sim" }
        });
        try {
            preencherLogin(p);
            p.submeter("#formularioLogin");
            await assentar();
            const [chamada] = p.api.doTipo("login");
            assert.deepEqual(chamada.corpo, { acao: "login", telefone: "11987654321", senha: "segredo1" });
            assert.deepEqual(JSON.parse(p.window.sessionStorage.getItem("sessao")),
                { token: "tok-123", nome: "Maria Souza", telefone: "11987654321" });
            assert.equal(p.window.localStorage.getItem("sessao"), null);
            for (const chave of ["connect_usuario", "connect_lembrar"]) {
                assert.equal(p.window.localStorage.getItem(chave), null, chave);
            }
            for (const chave of ["rascunhoCadastro", "termosAceitos"]) {
                assert.equal(p.window.sessionStorage.getItem(chave), null, chave);
            }
            assert.equal(p.$("#mensagem").textContent, "Login realizado com sucesso!");
            assert.deepEqual(p.navegacoes, [{ destino: "app.html", substituir: true }]);
            assert.deepEqual(p.alertas, []);
        } finally { p.fechar(); }
    });

    test("sucesso com 'lembrar' → sessão em localStorage", async () => {
        const p = await abrirLogin();
        try {
            preencherLogin(p, { lembrar: true });
            p.submeter("#formularioLogin");
            await assentar();
            assert.equal(JSON.parse(p.window.localStorage.getItem("sessao")).token, "tok-123");
            assert.equal(p.window.sessionStorage.getItem("sessao"), null);
        } finally { p.fechar(); }
    });

    test("erro da API → mensagem de erro em #mensagem (classe mensagem-erro), sem alert e sem navegar", async () => {
        const p = await abrirLogin();
        try {
            preencherLogin(p, { senha: "errada1" });
            p.submeter("#formularioLogin");
            await assentar();
            const mensagem = p.$("#mensagem");
            assert.equal(mensagem.textContent, "Número ou senha incorretos.");
            assert.ok(mensagem.classList.contains("mensagem-erro"));
            assert.equal(mensagem.style.color, "");
            assert.equal(mensagem.style.backgroundColor, "");
            assert.equal(mensagem.style.border, "");
            assert.equal(mensagem.style.display, "block");
            assert.deepEqual(p.alertas, []);
            assert.deepEqual(p.navegacoes, []);
            assert.equal(p.$("#btnLogin").disabled, false);
        } finally { p.fechar(); }
    });

    test("a classe de erro só vale para o erro: some enquanto verifica e volta se falhar de novo", async () => {
        const p = await abrirLogin();
        try {
            let liberar;
            const segurar = new Promise(resolve => { liberar = resolve; });
            const fetchOriginal = p.window.fetch;
            p.window.fetch = async (...args) => { await segurar; return fetchOriginal(...args); };

            preencherLogin(p, { senha: "errada1" });
            p.submeter("#formularioLogin");
            await assentar();
            const mensagem = p.$("#mensagem");
            assert.equal(mensagem.textContent, "Verificando sua conta...");
            assert.equal(mensagem.classList.contains("mensagem-erro"), false);
            assert.equal(mensagem.style.display, "block");

            liberar();
            await assentar();
            assert.equal(mensagem.classList.contains("mensagem-erro"), true);

            p.window.fetch = async (...args) => { await new Promise(() => {}); return fetchOriginal(...args); };
            p.submeter("#formularioLogin");
            await assentar();
            assert.equal(mensagem.textContent, "Verificando sua conta...");
            assert.equal(mensagem.classList.contains("mensagem-erro"), false);
        } finally { p.fechar(); }
    });

    test("resposta de erro sem texto mostra o padrão do cliente ('Erro na API.')", async () => {
        const api = criarApiFalsa({ login: () => ({ ok: false }) });
        const p = await abrirLogin({ api });
        try {
            preencherLogin(p);
            p.submeter("#formularioLogin");
            await assentar();
            assert.equal(p.$("#mensagem").textContent, "Erro na API.");
            assert.ok(p.$("#mensagem").classList.contains("mensagem-erro"));
        } finally { p.fechar(); }
    });

    test("já logado → redireciona para app.html ao abrir a página", async () => {
        const p = await abrirLogin({ local: { sessao: { token: "x" } } });
        try {
            assert.deepEqual(p.navegacoes, [{ destino: "app.html", substituir: true }]);
        } finally { p.fechar(); }
    });
});

describe("cadastro", () => {
    function preencherCadastro(p, { nome = "Ana Paula", telefone = "(21) 99999-0000", email = "ana@exemplo.com", senha = "segredo9", confirmar } = {}) {
        p.$("#nome").value = nome;
        p.digitar("#telefone", telefone);
        p.$("#email").value = email;
        p.$("#senha").value = senha;
        p.$("#confirmarSenha").value = confirmar ?? senha;
    }

    const CASOS = [
        [{ nome: "" }, "Informe o nome."],
        [{ nome: "Al" }, "O nome deve ter pelo menos 3 caracteres."],
        [{ confirmar: "outra" }, "As senhas não conferem."]
    ];
    for (const [campos, mensagem] of CASOS) {
        test(`${JSON.stringify(campos)} → "${mensagem}" em #erro`, async () => {
            const p = await abrirLogin();
            try {
                preencherCadastro(p, campos);
                p.submeter("#formulario");
                await assentar();
                assert.equal(p.$("#erro").textContent, mensagem);
                assert.equal(p.api.doTipo("cadastro").length, 0);
                assert.deepEqual(p.alertas, []);
            } finally { p.fechar(); }
        });
    }

    test("nome vazio e senhas diferentes → mostra só o do nome", async () => {
        const p = await abrirLogin();
        try {
            preencherCadastro(p, { nome: "", senha: "a", confirmar: "b" });
            p.submeter("#formulario");
            await assentar();
            assert.equal(p.$("#erro").textContent, "Informe o nome.");
            assert.equal(p.api.doTipo("cadastro").length, 0);
        } finally { p.fechar(); }
    });

    test("sucesso → cadastro + login, sessão lembrada (localStorage) e vai para app.html", async () => {
        const p = await abrirLogin();
        try {
            preencherCadastro(p);
            p.submeter("#formulario");
            await assentar();
            assert.deepEqual(p.api.chamadas.map(c => c.corpo), [
                { acao: "cadastro", nome: "Ana Paula", telefone: "21999990000", email: "ana@exemplo.com", senha: "segredo9" },
                { acao: "login", telefone: "21999990000", senha: "segredo9" }
            ]);
            assert.equal(JSON.parse(p.window.localStorage.getItem("sessao")).token, "tok-novo");
            assert.deepEqual(p.navegacoes, [{ destino: "app.html", substituir: true }]);
        } finally { p.fechar(); }
    });

    test("erro da API no cadastro → mensagem em #erro e botão reabilitado", async () => {
        const api = criarApiFalsa({ cadastro: () => erro("Número já cadastrado.") });
        const p = await abrirLogin({ api });
        try {
            preencherCadastro(p);
            p.submeter("#formulario");
            await assentar();
            assert.equal(p.$("#erro").textContent, "Número já cadastrado.");
            assert.equal(p.$("#formulario button[type=submit]").disabled, false);
        } finally { p.fechar(); }
    });

    test("o aceite dos termos no cadastro só é exigido pelo HTML (required), não pelo JS", async () => {
        const p = await abrirLogin();
        try {
            preencherCadastro(p);
            p.$("#termos").checked = false;
            p.submeter("#formulario");
            await assentar();
            assert.equal(p.api.doTipo("cadastro").length, 1);
        } finally { p.fechar(); }
    });
});

describe("tela de login: abas, rascunho e termos", () => {
    test("abre na aba de login por padrão", async () => {
        const p = await abrirLogin();
        try {
            assert.equal(p.$("#formularioLogin").style.display, "block");
            assert.equal(p.$("#formulario").style.display, "none");
            assert.equal(p.$("#abaLogin").getAttribute("aria-selected"), "true");
        } finally { p.fechar(); }
    });

    test("clicar em 'Criar conta' troca a aba, o título e grava modoAuth", async () => {
        const p = await abrirLogin();
        try {
            p.clicar("#abaCadastro");
            assert.equal(p.$("#formulario").style.display, "block");
            assert.equal(p.$("#formularioLogin").style.display, "none");
            assert.equal(p.$("#tituloPagina").textContent, "Crie sua conta");
            assert.equal(p.window.sessionStorage.getItem("modoAuth"), "cadastro");
            p.clicar("#irLogin");
            assert.equal(p.$("#tituloPagina").textContent, "Entrar na sua conta");
        } finally { p.fechar(); }
    });

    test("restaura a aba salva em modoAuth", async () => {
        const p = await abrirLogin({ sessao: { modoAuth: "cadastro" } });
        try {
            assert.equal(p.$("#tituloPagina").textContent, "Crie sua conta");
        } finally { p.fechar(); }
    });

    test("termosAceitos=sim marca os dois checkboxes de termos", async () => {
        const p = await abrirLogin({ sessao: { termosAceitos: "sim" } });
        try {
            assert.equal(p.$("#termos").checked, true);
            assert.equal(p.$("#termosLogin").checked, true);
            assert.equal(p.$("#termosDados").checked, false);
        } finally { p.fechar(); }
    });

    test("clicar num link de termos salva o rascunho; ao voltar ele é restaurado", async () => {
        const p = await abrirLogin();
        try {
            p.$("#nome").value = "Ana";
            p.$("#email").value = "ana@x.com";
            p.clicar(".termos a");
            assert.deepEqual(JSON.parse(p.window.sessionStorage.getItem("rascunhoCadastro")),
                { nome: "Ana", telefone: "", email: "ana@x.com", loginNumero: "" });
        } finally { p.fechar(); }

        const volta = await abrirLogin({ sessao: { rascunhoCadastro: { nome: "Ana", loginNumero: "(11) 9" } } });
        try {
            assert.equal(volta.$("#nome").value, "Ana");
            assert.equal(volta.$("#loginNumero").value, "(11) 9");
        } finally { volta.fechar(); }
    });

    test("mostrarSenha alterna o tipo do campo e o ícone", async () => {
        const p = await abrirLogin();
        try {
            const botao = p.$("#loginSenha").parentElement.querySelector(".senha-botao");
            p.clicar(botao);
            assert.equal(p.$("#loginSenha").type, "text");
            assert.equal(botao.textContent, "🙈");
            p.clicar(botao);
            assert.equal(p.$("#loginSenha").type, "password");
            assert.equal(botao.textContent, "👁");
        } finally { p.fechar(); }
    });

    test("telefone do login recebe a máscara", async () => {
        const p = await abrirLogin();
        try {
            p.digitar("#loginNumero", "11987654321");
            assert.equal(p.$("#loginNumero").value, "(11) 98765-4321");
        } finally { p.fechar(); }
    });

    test("carrega sem erros de script", async () => {
        const p = await abrirLogin();
        try {
            assert.deepEqual(p.erros.map(e => e.message), []);
        } finally { p.fechar(); }
    });
});
