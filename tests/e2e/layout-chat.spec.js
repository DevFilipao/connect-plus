const { test, expect } = require("@playwright/test");
const { ligarApiFalsa } = require("./apoio");
const { USUARIO } = require("../apoio/api-falsa");

const TELAS = [
    { nome: "desktop", largura: 1400, altura: 900 },
    { nome: "janela média (1100px)", largura: 1100, altura: 900 },
    { nome: "janela estreita (800px)", largura: 800, altura: 900 },
    { nome: "celular largo (597px)", largura: 597, altura: 1027 }
];

async function abrirConversa(browser, tela, quantidade) {
    const contexto = await browser.newContext({ viewport: { width: tela.largura, height: tela.altura } });
    const page = await contexto.newPage();
    const api = await ligarApiFalsa(page);
    for (let i = 2; i <= quantidade; i++) {
        api.estado.mensagens.push({
            id: i, conversaId: 10, de: i % 2 ? USUARIO.telefone : "11911112222", nome: "João",
            texto: `Mensagem de teste número ${i}`, dataHora: "2026-11-11T12:00:00.000Z"
        });
    }
    await page.addInitScript(sessao => localStorage.setItem("sessao", JSON.stringify(sessao)), USUARIO);
    await page.goto("/app.html");
    await page.evaluate(() => {
        [...document.querySelectorAll("#listaConversas .chat-contact")]
            .find(b => b.textContent.includes("João Lima")).click();
    });
    await page.waitForFunction(n => document.querySelectorAll("#mensagens .message-row").length >= n, quantidade);

    const medidas = await page.evaluate(() => {
        const mensagens = document.querySelector("#mensagens");
        return {
            janela: innerHeight,
            pagina: document.documentElement.scrollHeight,
            conversa: Math.round(document.querySelector(".conversation").getBoundingClientRect().height),
            mensagensVisivel: mensagens.clientHeight,
            mensagensConteudo: mensagens.scrollHeight
        };
    });
    await contexto.close();
    return medidas;
}

for (const tela of TELAS) {
    test.describe(`${tela.nome}: ${tela.largura}x${tela.altura}`, () => {
        test("a conversa não cresce com o número de mensagens", async ({ browser }) => {
            const poucas = await abrirConversa(browser, tela, 3);
            const muitas = await abrirConversa(browser, tela, 40);
            expect(muitas.conversa).toBe(poucas.conversa);
            expect(muitas.pagina).toBe(poucas.pagina);
        });

        test("com muitas mensagens, a lista rola por dentro da conversa", async ({ browser }) => {
            const medidas = await abrirConversa(browser, tela, 40);
            expect(medidas.mensagensConteudo).toBeGreaterThan(medidas.mensagensVisivel);
            expect(medidas.conversa).toBeLessThanOrEqual(medidas.janela);
        });
    });
}
