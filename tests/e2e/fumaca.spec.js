const { test, expect } = require("@playwright/test");
const { ligarApiFalsa } = require("./apoio");

test("fumaça: index sem sessão leva ao login", async ({ page }) => {
    await ligarApiFalsa(page);
    await page.goto("/index.html");
    await expect(page).toHaveURL(/\/login\.html$/);
    await expect(page.locator("#tituloPagina")).toHaveText("Entrar na sua conta");
});
