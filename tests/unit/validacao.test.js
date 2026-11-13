const { test, describe } = require("node:test");
const assert = require("node:assert/strict");
const { validarLogin, validarCadastro } = require("../../js/dominio/validacao");

const loginValido = { telefone: "11987654321", senha: "segredo1", aceitouTermos: true, confirmouTitular: true };
const cadastroValido = { nome: "Ana Paula", senha: "segredo9", confirmarSenha: "segredo9" };

describe("validarLogin", () => {
    test("dados válidos → nenhum erro", () => {
        assert.deepEqual(validarLogin(loginValido), []);
    });

    const CASOS = [
        [{ telefone: "" }, "Informe o número de telefone."],
        [{ senha: "" }, "Informe a senha."],
        [{ telefone: "119876" }, "Digite um número válido com DDD!"],
        [{ senha: "12345" }, "Digite sua senha (mínimo de 6 caracteres)."],
        [{ aceitouTermos: false }, "Para continuar, aceite os Termos de Uso e a Política de Privacidade."],
        [{ confirmouTitular: false }, "Para continuar, confirme que você é o titular da conta."]
    ];
    for (const [campos, mensagem] of CASOS) {
        test(`${JSON.stringify(campos)} → "${mensagem}"`, () => {
            assert.deepEqual(validarLogin({ ...loginValido, ...campos }), [mensagem]);
        });
    }

    test("limites: 10 dígitos é aceito, 9 não; senha com 6 é aceita, com 5 não", () => {
        assert.deepEqual(validarLogin({ ...loginValido, telefone: "1133334444" }), []);
        assert.equal(validarLogin({ ...loginValido, telefone: "113333444" }).length, 1);
        assert.deepEqual(validarLogin({ ...loginValido, senha: "123456" }), []);
        assert.equal(validarLogin({ ...loginValido, senha: "12345" }).length, 1);
    });

    test("telefone vazio não gera também o aviso de DDD (só o de vazio)", () => {
        assert.deepEqual(validarLogin({ ...loginValido, telefone: "" }), ["Informe o número de telefone."]);
    });

    test("senha vazia não gera também o aviso de tamanho (só o de vazia)", () => {
        assert.deepEqual(validarLogin({ ...loginValido, senha: "" }), ["Informe a senha."]);
    });

    test("com vários problemas, devolve todos na ordem em que a tela mostra o primeiro", () => {
        const erros = validarLogin({ telefone: "119", senha: "", aceitouTermos: false, confirmouTitular: false });
        assert.deepEqual(erros, [
            "Informe a senha.",
            "Digite um número válido com DDD!",
            "Para continuar, aceite os Termos de Uso e a Política de Privacidade.",
            "Para continuar, confirme que você é o titular da conta."
        ]);
    });

    test("tudo vazio: o primeiro erro é o do telefone", () => {
        const erros = validarLogin({ telefone: "", senha: "", aceitouTermos: false, confirmouTitular: false });
        assert.equal(erros[0], "Informe o número de telefone.");
        assert.equal(erros.length, 4);
    });

    test("telefone inválido e senha curta: o do telefone vem primeiro", () => {
        const erros = validarLogin({ ...loginValido, telefone: "119", senha: "123" });
        assert.deepEqual(erros, ["Digite um número válido com DDD!", "Digite sua senha (mínimo de 6 caracteres)."]);
    });
});

describe("validarCadastro", () => {
    test("dados válidos → nenhum erro", () => {
        assert.deepEqual(validarCadastro(cadastroValido), []);
    });

    test("nome vazio → só 'Informe o nome.'", () => {
        assert.deepEqual(validarCadastro({ ...cadastroValido, nome: "" }), ["Informe o nome."]);
    });

    test("nome com 2 letras é curto; com 3 é aceito", () => {
        assert.deepEqual(validarCadastro({ ...cadastroValido, nome: "Al" }), ["O nome deve ter pelo menos 3 caracteres."]);
        assert.deepEqual(validarCadastro({ ...cadastroValido, nome: "Ana" }), []);
    });

    test("espaços contam no tamanho do nome (sem trim, como antes)", () => {
        assert.deepEqual(validarCadastro({ ...cadastroValido, nome: "   " }), []);
        assert.deepEqual(validarCadastro({ ...cadastroValido, nome: "  " }), ["O nome deve ter pelo menos 3 caracteres."]);
    });

    test("senhas diferentes", () => {
        assert.deepEqual(validarCadastro({ ...cadastroValido, confirmarSenha: "outra" }), ["As senhas não conferem."]);
    });

    test("com nome vazio e senhas diferentes, o do nome vem primeiro", () => {
        const erros = validarCadastro({ nome: "", senha: "a", confirmarSenha: "b" });
        assert.deepEqual(erros, ["Informe o nome.", "As senhas não conferem."]);
    });

    test("não exige tamanho mínimo da senha no cadastro (comportamento atual)", () => {
        assert.deepEqual(validarCadastro({ nome: "Ana", senha: "1", confirmarSenha: "1" }), []);
    });
});
