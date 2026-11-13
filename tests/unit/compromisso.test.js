// js/dominio/compromisso.js — extrairCompromisso, testada direto com require (sem jsdom).
// A tabela vem da caracterização da F1, quando a função ainda vivia em app.js e lia o relógio sozinha.
// "Hoje" fixo: quarta-feira, 11/11/2026, 10:00 (hora local; os resultados não dependem do fuso).
const { test, describe } = require("node:test");
const assert = require("node:assert/strict");
const { extrairCompromisso, DIAS_SEMANA, TIPOS_COMPROMISSO } = require("../../js/dominio/compromisso");
const { dataISO } = require("../../js/dominio/formato");

const HOJE = new Date(2026, 10, 11, 10, 0);
const extrair = (texto, hoje = HOJE) => ({ ...extrairCompromisso(texto, hoje) });

const TABELA = [
    // tipo + dia da semana + "19h" + local capitalizado
    ["jogo sábado às 19h no Ginásio Central", { titulo: "Jogo · Sábado", data: "2026-11-14", horario: "19:00", local: "Ginásio Central" }],
    ["festa sabado", { titulo: "Festa · Sábado", data: "2026-11-14", horario: "", local: "" }],
    ["jogo domingo no Parque das Flores", { titulo: "Jogo · Domingo", data: "2026-11-15", horario: "", local: "Parque das Flores" }],
    ["vamos segunda às 7", { titulo: "Compromisso · Segunda-feira", data: "2026-11-16", horario: "", local: "" }],
    ["reuniao terca 9:15", { titulo: "Reunião · Terça-feira", data: "2026-11-17", horario: "09:15", local: "" }],
    // mesmo dia da semana que hoje (quarta) → semana que vem (+7)
    ["encontro quarta 8h", { titulo: "Encontro · Quarta-feira", data: "2026-11-18", horario: "08:00", local: "" }],
    ["encontro quinta", { titulo: "Encontro · Quinta-feira", data: "2026-11-12", horario: "", local: "" }],
    ["partida sexta 25h", { titulo: "Compromisso · Sexta-feira", data: "2026-11-13", horario: "", local: "" }],
    // datas explícitas
    ["festa dia 20/12 às 21h", { titulo: "Festa", data: "2026-12-20", horario: "21:00", local: "" }],
    ["aniversário em 05/01/27 na Casa da Ana", { titulo: "Aniversário", data: "2027-01-05", horario: "", local: "Casa da Ana" }],
    ["passeio 3/2/2027", { titulo: "Passeio", data: "2027-02-03", horario: "", local: "" }],
    // hoje / amanhã (sem til)
    ["viagem hoje", { titulo: "Viagem · Hoje", data: "2026-11-11", horario: "", local: "" }],
    ["churrasco amanha na casa do Pedro", { titulo: "Compromisso · Amanhã", data: "2026-11-12", horario: "", local: "" }],
    // sem data
    ["Encontro em Belo Horizonte", { titulo: "Encontro", data: "", horario: "", local: "Belo Horizonte" }],
    ["Jogo no campo", { titulo: "Jogo", data: "", horario: "", local: "" }],          // local só com inicial maiúscula
    ["estudar para a prova", { titulo: "Compromisso", data: "", horario: "", local: "" }]
];

for (const [frase, esperado] of TABELA) {
    test(`extrairCompromisso(${JSON.stringify(frase)})`, () => {
        assert.deepEqual(extrair(frase), esperado);
    });
}

describe("bugs conhecidos (comportamento atual, a corrigir em fase própria)", () => {
    test("BUG CONHECIDO: 'amanhã' com til não é reconhecido (\\b do JS não trata 'ã' como letra, regex de 'amanhã')", () => {
        assert.deepEqual(extrair("Reunião amanhã 14:30 na Sala Azul"),
            { titulo: "Reunião", data: "", horario: "14:30", local: "Sala Azul" });
    });

    test("BUG CONHECIDO: 'às 10' sem 'h' não vira horário (\\bàs nunca casa, regex de horário)", () => {
        assert.deepEqual(extrair("Reunião às 10 no Escritório"),
            { titulo: "Reunião", data: "", horario: "", local: "Escritório" });
    });

    test("BUG CONHECIDO: data inexistente (31/02) é aceita sem validação (regex de data explícita)", () => {
        assert.equal(extrair("jogo 31/02").data, "2026-02-31");
    });
});

test("primeiro tipo da lista vence quando há vários ('jogo' antes de 'festa')", () => {
    assert.equal(extrair("festa depois do jogo").titulo, "Jogo");
});

describe("o 'hoje' vem por parâmetro", () => {
    test("não altera a data recebida", () => {
        const hoje = new Date(2026, 10, 11, 15, 30, 45, 123);
        const antes = hoje.getTime();
        extrairCompromisso("jogo amanha", hoje);
        extrairCompromisso("jogo sábado", hoje);
        extrairCompromisso("jogo hoje", hoje);
        assert.equal(hoje.getTime(), antes);
    });

    test("a hora do dia de 'hoje' não muda o resultado", () => {
        const cedo = new Date(2026, 10, 11, 0, 0, 1);
        const tarde = new Date(2026, 10, 11, 23, 59, 59);
        for (const frase of ["viagem hoje", "festa amanha", "jogo quarta", "reuniao sexta"]) {
            assert.deepEqual(extrair(frase, cedo), extrair(frase, tarde), frase);
        }
    });

    test("data dd/mm sem ano usa o ano de 'hoje'", () => {
        assert.equal(extrair("festa 10/03", new Date(2027, 0, 5)).data, "2027-03-10");
        assert.equal(extrair("festa 10/03", new Date(2026, 10, 11)).data, "2026-03-10");
    });

    test("'amanha' na virada do ano", () => {
        assert.equal(extrair("festa amanha", new Date(2026, 11, 31)).data, "2027-01-01");
    });

    test("dia da semana na virada do ano (terça 29/12 → sexta 01/01)", () => {
        assert.equal(extrair("jogo sexta", new Date(2026, 11, 29)).data, "2027-01-01");
    });

    test("sem 'hoje', usa o momento atual", () => {
        assert.equal(extrairCompromisso("viagem hoje").data, dataISO());
    });
});

test("as tabelas de apoio estão exportadas e completas", () => {
    assert.equal(DIAS_SEMANA.length, 7);
    assert.deepEqual(DIAS_SEMANA.map(d => d.indice), [0, 1, 2, 3, 4, 5, 6]);
    assert.ok(TIPOS_COMPROMISSO.some(([chave, nome]) => chave === "reuniao" && nome === "Reunião"));
});
