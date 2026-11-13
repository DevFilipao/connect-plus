// Caracterização dos utilitários de formatação de js/app.js, lidos de `window`.
// Na F3 eles vão para js/dominio/formato.js; estes casos devem continuar valendo.
const { test, before, after } = require("node:test");
const assert = require("node:assert/strict");
const { carregarApp } = require("../apoio/carregar-pagina");

let w;
let pagina;
before(async () => { pagina = await carregarApp(); w = pagina.window; });
after(() => pagina.fechar());

test("escaparHTML troca os 5 caracteres especiais", () => {
    assert.equal(w.escaparHTML(`<a href="x" title='y'>&</a>`),
        "&lt;a href=&quot;x&quot; title=&#39;y&#39;&gt;&amp;&lt;/a&gt;");
});

test("escaparHTML converte não-string com String()", () => {
    assert.equal(w.escaparHTML(42), "42");
    assert.equal(w.escaparHTML(null), "null");
});

test("formatarData: ISO → dd/mm/aaaa", () => {
    assert.equal(w.formatarData("2026-11-05"), "05/11/2026");
});

test("formatarData: vazio → 'Sem data definida'", () => {
    assert.equal(w.formatarData(""), "Sem data definida");
    assert.equal(w.formatarData(undefined), "Sem data definida");
});

test("formatarData: formato inesperado volta como veio", () => {
    assert.equal(w.formatarData("amanhã"), "amanhã");
    assert.equal(w.formatarData("2026-11"), "2026-11");
});

test("dataAtual e dataParaTexto produzem a mesma data ISO (duplicação a fundir na F3)", () => {
    assert.equal(w.dataAtual(), "2026-11-11");
    assert.equal(w.dataParaTexto(new w.Date(2027, 0, 5)), "2027-01-05");
});

test("horarioAtual devolve HH:MM em pt-BR", () => {
    assert.equal(w.horarioAtual(), "10:00");
});

test("gerarId devolve número baseado em Date.now()", () => {
    const id = w.gerarId();
    assert.equal(typeof id, "number");
    assert.ok(id >= w.Date.now() - 5 && id <= w.Date.now() + 1000);
});
