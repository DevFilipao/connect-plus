const { test, expect } = require("@playwright/test");
const { ligarApiFalsa } = require("./apoio");

const estilo = locator => locator.evaluate(el => {
    const c = getComputedStyle(el);
    return {
        display: c.display,
        color: c.color,
        fundo: c.backgroundColor,
        borda: `${c.borderTopWidth} ${c.borderTopStyle} ${c.borderTopColor}`,
        texto: el.textContent.trim()
    };
});

const PADRAO = {
    color: "rgb(77, 163, 255)",
    fundo: "rgba(0, 123, 255, 0.12)",
    borda: "1px solid rgba(0, 123, 255, 0.35)"
};

const ERRO = {
    color: "rgb(255, 0, 0)",
    fundo: "rgba(255, 0, 0, 0.12)",
    borda: "1px solid rgba(255, 0, 0, 0.35)"
};

async function preencherLogin(page, senha) {
    await page.goto("/login.html");
    await page.locator("#loginNumero").pressSequentially("11987654321");
    await page.locator("#loginSenha").fill(senha);
    await page.locator("#termosLogin").check();
    await page.locator("#termosDados").check();
}

test("senha errada: a mensagem aparece em vermelho", async ({ page }) => {
    await ligarApiFalsa(page);
    await preencherLogin(page, "errada1");
    await page.locator("#btnLogin").click();

    const mensagem = page.locator("#mensagem");
    await expect(mensagem).toHaveText("Número ou senha incorretos.");
    expect(await estilo(mensagem)).toEqual({
        display: "block", ...ERRO, texto: "Número ou senha incorretos."
    });
});

test("enquanto verifica a conta, a mensagem usa o estilo padrão (azul)", async ({ page }) => {
    await ligarApiFalsa(page);
    let liberar;
    const segurar = new Promise(resolve => { liberar = resolve; });
    await page.route("https://script.google.com/**", async route => {
        await segurar;
        await route.fallback();
    });

    await preencherLogin(page, "errada1");
    await page.locator("#btnLogin").click();

    const mensagem = page.locator("#mensagem");
    await expect(mensagem).toHaveText("Verificando sua conta...");
    expect(await estilo(mensagem)).toEqual({
        display: "block", ...PADRAO, texto: "Verificando sua conta..."
    });
    liberar();
    await expect(mensagem).toHaveText("Número ou senha incorretos.");
});

test("depois de um erro, uma nova tentativa volta ao estilo padrão enquanto verifica", async ({ page }) => {
    await ligarApiFalsa(page);
    await preencherLogin(page, "errada1");
    await page.locator("#btnLogin").click();
    await expect(page.locator("#mensagem")).toHaveText("Número ou senha incorretos.");

    let liberar;
    const segurar = new Promise(resolve => { liberar = resolve; });
    await page.route("https://script.google.com/**", async route => {
        await segurar;
        await route.fallback();
    });
    await page.locator("#btnLogin").click();

    await expect(page.locator("#mensagem")).toHaveText("Verificando sua conta...");
    expect(await estilo(page.locator("#mensagem"))).toMatchObject(PADRAO);
    liberar();
    await expect(page.locator("#mensagem")).toHaveText("Número ou senha incorretos.");
    expect(await estilo(page.locator("#mensagem"))).toMatchObject(ERRO);
});

test("a mensagem some ao trocar de aba", async ({ page }) => {
    await ligarApiFalsa(page);
    await preencherLogin(page, "errada1");
    await page.locator("#btnLogin").click();
    await expect(page.locator("#mensagem")).toBeVisible();
    await page.locator("#abaCadastro").click();
    await expect(page.locator("#mensagem")).toBeHidden();
});
