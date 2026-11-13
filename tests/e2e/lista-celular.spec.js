const { test, expect } = require("@playwright/test");
const { ligarApiFalsa } = require("./apoio");
const { USUARIO } = require("../apoio/api-falsa");

async function abrirApp(browser, viewport) {
    const contexto = await browser.newContext({ viewport });
    const page = await contexto.newPage();
    await ligarApiFalsa(page);
    await page.addInitScript(sessao => localStorage.setItem("sessao", JSON.stringify(sessao)), USUARIO);
    await page.goto("/app.html");
    await expect(page.locator("#listaConversas .chat-contact").first()).toBeAttached();
    return { page, contexto };
}

for (const largura of [390, 597, 750]) {
    test.describe(`celular (${largura}px)`, () => {
        test("a lista aparece primeiro, a conversa abre ao tocar e o botão volta para a lista", async ({ browser }) => {
            const { page, contexto } = await abrirApp(browser, { width: largura, height: 800 });

            await expect(page.locator("#listaConversas")).toBeVisible();
            await expect(page.locator("#listaConversas .chat-contact", { hasText: "João Lima" })).toBeVisible();
            await expect(page.locator(".conversation")).toBeHidden();

            await page.locator("#listaConversas .chat-contact", { hasText: "João Lima" }).click();
            await expect(page.locator(".conversation")).toBeVisible();
            await expect(page.locator("#listaConversas")).toBeHidden();
            await expect(page.locator("#voltarLista")).toBeVisible();
            await expect(page.locator("#nomeGrupo")).toHaveText("João Lima");

            await page.locator("#voltarLista").click();
            await expect(page.locator("#listaConversas")).toBeVisible();
            await expect(page.locator(".conversation")).toBeHidden();
            await expect(page.locator("#listaConversas .chat-contact.selected")).toHaveCount(0);

            await page.locator("#listaConversas .chat-contact", { hasText: "João Lima" }).click();
            await expect(page.locator("#mensagens .message-row").first()).toBeVisible();
            await contexto.close();
        });

        test("a lista não aparece nas outras telas", async ({ browser }) => {
            const { page, contexto } = await abrirApp(browser, { width: largura, height: 800 });
            await page.locator('.menu-item[data-view="tarefas"]').click();
            await expect(page.locator("#listaConversas")).toBeHidden();
            await page.locator('.menu-item[data-view="chat"]').click();
            await expect(page.locator("#listaConversas")).toBeVisible();
            await contexto.close();
        });
    });
}

test("no desktop a lista continua na barra lateral e não há botão de voltar", async ({ browser }) => {
    const { page, contexto } = await abrirApp(browser, { width: 1400, height: 900 });
    await expect(page.locator("#listaConversas")).toBeVisible();
    await expect(page.locator(".conversation")).toBeVisible();
    await expect(page.locator("#voltarLista")).toBeHidden();
    await page.locator("#listaConversas .chat-contact", { hasText: "João Lima" }).click();
    await expect(page.locator("#listaConversas")).toBeVisible();
    await expect(page.locator("#voltarLista")).toBeHidden();
    await contexto.close();
});
