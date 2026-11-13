// js/dominio/votacao.js — regras de voto do quadro do compromisso e das enquetes.
const { test, describe } = require("node:test");
const assert = require("node:assert/strict");
const { criarOpcoes, totalVotos, porcentagem, alternarVoto, votarUmaVez } = require("../../js/dominio/votacao");

const novo = () => ({ opcoes: criarOpcoes(["Vou", "Talvez", "Não vou"]), voto: null });
const votos = item => item.opcoes.map(o => o.votos);

describe("criarOpcoes", () => {
    test("transforma textos em opções sem votos", () => {
        assert.deepEqual(criarOpcoes(["A", "B"]), [{ texto: "A", votos: 0 }, { texto: "B", votos: 0 }]);
    });

    test("lista vazia → vazio", () => {
        assert.deepEqual(criarOpcoes([]), []);
    });

    test("cada chamada devolve objetos independentes", () => {
        const [a] = criarOpcoes(["A"]);
        const [b] = criarOpcoes(["A"]);
        a.votos++;
        assert.equal(b.votos, 0);
    });
});

describe("totalVotos e porcentagem", () => {
    test("soma os votos de todas as opções", () => {
        assert.equal(totalVotos([{ votos: 2 }, { votos: 0 }, { votos: 3 }]), 5);
        assert.equal(totalVotos([]), 0);
    });

    test("porcentagem inteira, arredondada", () => {
        assert.equal(porcentagem(1, 3), 33);
        assert.equal(porcentagem(2, 3), 67);
        assert.equal(porcentagem(1, 2), 50);
        assert.equal(porcentagem(3, 3), 100);
    });

    test("sem votos no total → 0 (sem dividir por zero)", () => {
        assert.equal(porcentagem(0, 0), 0);
    });
});

describe("alternarVoto (quadro do compromisso)", () => {
    test("votar registra o voto", () => {
        const q = novo();
        alternarVoto(q, 0);
        assert.deepEqual(votos(q), [1, 0, 0]);
        assert.equal(q.voto, 0);
    });

    test("clicar de novo na mesma opção remove o voto", () => {
        const q = novo();
        alternarVoto(q, 1);
        alternarVoto(q, 1);
        assert.deepEqual(votos(q), [0, 0, 0]);
        assert.equal(q.voto, null);
    });

    test("clicar em outra opção move o voto (nunca fica com dois)", () => {
        const q = novo();
        alternarVoto(q, 0);
        alternarVoto(q, 2);
        assert.deepEqual(votos(q), [0, 0, 1]);
        assert.equal(q.voto, 2);
        assert.equal(totalVotos(q.opcoes), 1);
    });

    test("respeita votos que já existiam de outras pessoas", () => {
        const q = { opcoes: [{ texto: "Vou", votos: 4 }, { texto: "Não vou", votos: 2 }], voto: null };
        alternarVoto(q, 0);
        assert.deepEqual(votos(q), [5, 2]);
        alternarVoto(q, 1);
        assert.deepEqual(votos(q), [4, 3]);
        alternarVoto(q, 1);
        assert.deepEqual(votos(q), [4, 2]);
    });

    test("altera o próprio objeto e o devolve", () => {
        const q = novo();
        assert.equal(alternarVoto(q, 0), q);
        assert.equal(q.voto, 0);
    });
});

describe("votarUmaVez (enquete)", () => {
    test("o primeiro voto é registrado e devolve true", () => {
        const e = novo();
        assert.equal(votarUmaVez(e, 1), true);
        assert.deepEqual(votos(e), [0, 1, 0]);
        assert.equal(e.voto, 1);
    });

    test("depois de votar, qualquer novo voto é ignorado e devolve false", () => {
        const e = novo();
        votarUmaVez(e, 1);
        assert.equal(votarUmaVez(e, 1), false);
        assert.equal(votarUmaVez(e, 0), false);
        assert.deepEqual(votos(e), [0, 1, 0]);
        assert.equal(e.voto, 1);
    });

    test("votar na primeira opção (índice 0) conta como voto", () => {
        const e = novo();
        votarUmaVez(e, 0);
        assert.equal(e.voto, 0);
        assert.equal(votarUmaVez(e, 2), false);
    });
});
