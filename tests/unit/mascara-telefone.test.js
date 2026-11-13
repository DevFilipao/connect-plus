// js/util.js (aplicarMascaraTelefone): só a ligação da máscara a um campo.
// A regra de formatação em si é testada em formato.test.js (formatarTelefone).
const { test } = require("node:test");
const assert = require("node:assert/strict");
const { carregarScript } = require("../apoio/carregar-script");
const { formatarTelefone } = require("../../js/dominio/formato");

// util.js depende do global formatarTelefone (no navegador vem de dominio/formato.js).
const { aplicarMascaraTelefone } = carregarScript("js/util.js", { formatarTelefone });

function campoFalso() {
    const ouvintes = [];
    return {
        value: "",
        addEventListener: (tipo, fn) => ouvintes.push({ tipo, fn }),
        digitar(valor) {
            this.value = valor;
            ouvintes.filter(o => o.tipo === "input").forEach(o => o.fn());
        },
        ouvintes
    };
}

test("ao digitar, o valor do campo passa pela máscara", () => {
    const campo = campoFalso();
    aplicarMascaraTelefone(campo);
    campo.digitar("11987654321");
    assert.equal(campo.value, "(11) 98765-4321");
});

test("só reage ao evento 'input'", () => {
    const campo = campoFalso();
    aplicarMascaraTelefone(campo);
    assert.deepEqual(campo.ouvintes.map(o => o.tipo), ["input"]);
});

test("não mexe no campo antes de o usuário digitar", () => {
    const campo = campoFalso();
    campo.value = "11987654321";
    aplicarMascaraTelefone(campo);
    assert.equal(campo.value, "11987654321");
});

test("cada chamada adiciona um novo ouvinte 'input' (base do D9: chat.js reaplicava a máscara a cada submit até a F2)", () => {
    const campo = campoFalso();
    aplicarMascaraTelefone(campo);
    aplicarMascaraTelefone(campo);
    assert.equal(campo.ouvintes.length, 2);
});
