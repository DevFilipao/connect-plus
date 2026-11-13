// js/dominio/assistente.js — classificarMensagem (qual tipo de ação a frase sugere).
const { test, describe } = require("node:test");
const assert = require("node:assert/strict");
const {
    classificarMensagem, PALAVRAS_TAREFA, PALAVRAS_EVENTO, PALAVRAS_ENQUETE
} = require("../../js/dominio/assistente");

describe("tipos", () => {
    const CASOS = [
        ["preciso estudar para a prova", "tarefa"],
        ["não esquecer de comprar pão", "tarefa"],
        ["nao esquecer de comprar pao", "tarefa"],
        ["vou fazer o trabalho de casa", "tarefa"],
        ["jogo sábado às 19h", "evento"],
        ["festa amanhã", "evento"],
        ["reuniao quinta", "evento"],
        ["qual dia vocês preferem?", "enquete"],
        ["quem consegue ir?", "enquete"],
        ["vamos escolher o horário", "enquete"],
        ["bom dia, tudo bem?", null],
        ["", null]
    ];
    for (const [texto, tipo] of CASOS) {
        test(`${JSON.stringify(texto)} → ${tipo}`, () => {
            assert.equal(classificarMensagem(texto), tipo);
        });
    }
});

describe("precedência: enquete > evento > tarefa", () => {
    test("enquete vence evento e tarefa juntos", () => {
        assert.equal(classificarMensagem("quem vai no jogo sábado? preciso levar bola"), "enquete");
    });

    test("evento vence tarefa", () => {
        assert.equal(classificarMensagem("preciso ir na reunião"), "evento");
    });

    test("tarefa só aparece quando não há palavra de evento nem de enquete", () => {
        assert.equal(classificarMensagem("preciso levar bola"), "tarefa");
    });
});

test("ignora maiúsculas e minúsculas", () => {
    assert.equal(classificarMensagem("REUNIÃO AMANHÃ"), "evento");
    assert.equal(classificarMensagem("Preciso Estudar"), "tarefa");
    assert.equal(classificarMensagem("QUAL DIA?"), "enquete");
});

test("casa por trecho, não por palavra inteira (comportamento atual: gera falsos positivos)", () => {
    assert.equal(classificarMensagem("as sextas são ótimas"), "evento");   // 'sextas' contém 'sexta'
    assert.equal(classificarMensagem("os jogos acabaram"), "evento");      // 'jogos' contém 'jogo'
    assert.equal(classificarMensagem("dados imprecisos"), "tarefa");       // 'imprecisos' contém 'preciso'
    assert.equal(classificarMensagem("o jogador chegou"), null);           // 'jogador' não contém 'jogo'
});

describe("cada palavra de cada lista dispara o seu tipo", () => {
    for (const palavra of PALAVRAS_ENQUETE) {
        test(`enquete: ${JSON.stringify(palavra)}`, () => assert.equal(classificarMensagem(palavra), "enquete"));
    }
    for (const palavra of PALAVRAS_EVENTO) {
        test(`evento: ${JSON.stringify(palavra)}`, () => assert.equal(classificarMensagem(palavra), "evento"));
    }
    for (const palavra of PALAVRAS_TAREFA) {
        test(`tarefa: ${JSON.stringify(palavra)}`, () => assert.equal(classificarMensagem(palavra), "tarefa"));
    }
});
