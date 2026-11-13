// Caracterização de extrairCompromisso (js/app.js:511-564).
// Hoje a função só existe dentro de app.js; ela é lida de `window` com app.html carregado.
// "Agora" fixo: quarta-feira, 11/11/2026, 10:00 (America/Sao_Paulo).
// Na F4 ela passa a ser um require de js/dominio/compromisso.js, e esta tabela não muda.
const { test, before, after } = require("node:test");
const assert = require("node:assert/strict");
const { carregarApp } = require("../apoio/carregar-pagina");

let pagina;
before(async () => { pagina = await carregarApp(); });
after(() => pagina.fechar());

const extrair = texto => ({ ...pagina.window.extrairCompromisso(texto) });

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

test("BUG CONHECIDO: 'amanhã' com til não é reconhecido (\\b do JS não trata 'ã' como letra, app.js:529)", () => {
    assert.deepEqual(extrair("Reunião amanhã 14:30 na Sala Azul"),
        { titulo: "Reunião", data: "", horario: "14:30", local: "Sala Azul" });
});

test("BUG CONHECIDO: 'às 10' sem 'h' não vira horário (\\bàs nunca casa, app.js:550)", () => {
    assert.deepEqual(extrair("Reunião às 10 no Escritório"),
        { titulo: "Reunião", data: "", horario: "", local: "Escritório" });
});

test("BUG CONHECIDO: data inexistente (31/02) é aceita sem validação (app.js:523-528)", () => {
    assert.equal(extrair("jogo 31/02").data, "2026-02-31");
});

test("primeiro tipo da lista vence quando há vários ('jogo' antes de 'festa')", () => {
    assert.equal(extrair("festa depois do jogo").titulo, "Jogo");
});
