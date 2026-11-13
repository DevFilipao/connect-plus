const { test, expect } = require("@playwright/test");
const { ligarApiFalsa } = require("./apoio");
const { USUARIO } = require("../apoio/api-falsa");

test("a lista de mensagens usa a barra de rolagem fina, na cor do tema", async ({ page }) => {
    await ligarApiFalsa(page);
    await page.addInitScript(sessao => localStorage.setItem("sessao", JSON.stringify(sessao)), USUARIO);
    await page.goto("/app.html");

    const estilo = await page.locator("#mensagens").evaluate(el => {
        const c = getComputedStyle(el);
        return { largura: c.scrollbarWidth, cor: c.scrollbarColor };
    });

    expect(estilo.largura).toBe("thin");
    expect(estilo.cor).toBe("rgb(95, 120, 150) rgba(0, 0, 0, 0)");
});
