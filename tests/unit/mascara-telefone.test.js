// Caracterização de js/util.js (aplicarMascaraTelefone).
const { test } = require("node:test");
const assert = require("node:assert/strict");
const { carregarScript } = require("../apoio/carregar-script");

const { aplicarMascaraTelefone } = carregarScript("js/util.js");

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

const CASOS = [
    ["", ""],
    ["1", "1"],
    ["11", "11"],
    ["119", "(11) 9"],
    ["119876", "(11) 9876"],
    ["1198765", "(11) 98765-"],
    ["11987654321", "(11) 98765-4321"],
    ["1133334444", "(11) 33334-444"],          // fixo de 10 dígitos fica com o hífen deslocado
    ["119876543219999", "(11) 98765-4321"],    // corta em 11 dígitos
    ["(11) 98765-4321", "(11) 98765-4321"],    // reaplicar é idempotente
    ["11 a9b8", "(11) 98"]                     // descarta não dígitos
];

for (const [entrada, esperado] of CASOS) {
    test(`máscara: ${JSON.stringify(entrada)} → ${JSON.stringify(esperado)}`, () => {
        const campo = campoFalso();
        aplicarMascaraTelefone(campo);
        campo.digitar(entrada);
        assert.equal(campo.value, esperado);
    });
}

test("cada chamada adiciona um novo ouvinte 'input' (base do D9: chat.js reaplicava a máscara a cada submit até a F2)", () => {
    const campo = campoFalso();
    aplicarMascaraTelefone(campo);
    aplicarMascaraTelefone(campo);
    assert.equal(campo.ouvintes.length, 2);
});
