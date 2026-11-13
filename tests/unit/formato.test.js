// js/dominio/formato.js — funções puras, testadas direto com require (sem jsdom).
// Os casos vêm da caracterização feita na F1, quando essas funções ainda viviam em app.js e util.js.
const { test, describe } = require("node:test");
const assert = require("node:assert/strict");
const { escaparHTML, formatarData, dataISO, horaPtBR, formatarTelefone } = require("../../js/dominio/formato");

describe("escaparHTML", () => {
    test("troca os 5 caracteres especiais", () => {
        assert.equal(escaparHTML(`<a href="x" title='y'>&</a>`),
            "&lt;a href=&quot;x&quot; title=&#39;y&#39;&gt;&amp;&lt;/a&gt;");
    });

    test("converte não-string com String()", () => {
        assert.equal(escaparHTML(42), "42");
        assert.equal(escaparHTML(null), "null");
    });

    test("texto sem caracteres especiais fica igual", () => {
        assert.equal(escaparHTML("Olá, mundo! ção"), "Olá, mundo! ção");
    });
});

describe("formatarData", () => {
    test("ISO → dd/mm/aaaa", () => {
        assert.equal(formatarData("2026-11-05"), "05/11/2026");
    });

    test("vazio → 'Sem data definida'", () => {
        assert.equal(formatarData(""), "Sem data definida");
        assert.equal(formatarData(undefined), "Sem data definida");
        assert.equal(formatarData(null), "Sem data definida");
    });

    test("formato inesperado volta como veio", () => {
        assert.equal(formatarData("amanhã"), "amanhã");
        assert.equal(formatarData("2026-11"), "2026-11");
        assert.equal(formatarData("2026-11-05-01"), "2026-11-05-01");
    });
});

describe("dataISO (fusão de dataAtual e dataParaTexto)", () => {
    test("formata a data local com zeros à esquerda", () => {
        assert.equal(dataISO(new Date(2027, 0, 5)), "2027-01-05");
        assert.equal(dataISO(new Date(2026, 11, 31)), "2026-12-31");
    });

    test("usa a data local, não a UTC (23h do dia 5 continua dia 5)", () => {
        assert.equal(dataISO(new Date(2027, 0, 5, 23, 59)), "2027-01-05");
    });

    test("sem argumento usa o dia de hoje", () => {
        assert.equal(dataISO(), dataISO(new Date()));
    });
});

describe("horaPtBR (fusão de horarioAtual e do toLocaleTimeString de chat.js)", () => {
    test("HH:MM com zeros à esquerda", () => {
        assert.equal(horaPtBR(new Date(2026, 10, 11, 9, 58)), "09:58");
        assert.equal(horaPtBR(new Date(2026, 10, 11, 0, 5)), "00:05");
    });

    test("formato de 24 horas", () => {
        assert.equal(horaPtBR(new Date(2026, 10, 11, 21, 30)), "21:30");
    });

    test("sem argumento usa o horário de agora", () => {
        assert.match(horaPtBR(), /^\d{2}:\d{2}$/);
    });
});

describe("formatarTelefone (extraída de aplicarMascaraTelefone)", () => {
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
        test(`${JSON.stringify(entrada)} → ${JSON.stringify(esperado)}`, () => {
            assert.equal(formatarTelefone(entrada), esperado);
        });
    }

    test("aceita número (não string)", () => {
        assert.equal(formatarTelefone(11987654321), "(11) 98765-4321");
    });
});
