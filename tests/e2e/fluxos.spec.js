// Fluxos ponta a ponta no Chromium real. A API do Apps Script é interceptada (apoio.js).
const { test, expect } = require("@playwright/test");
const { ligarApiFalsa } = require("./apoio");
const { erro, USUARIO } = require("../apoio/api-falsa");

// Grava a sessão uma única vez, numa página que não redireciona.
async function entrarDireto(page) {
    await page.goto("/termos.html");
    await page.evaluate(s => localStorage.setItem("sessao", JSON.stringify(s)), USUARIO);
}

async function fazerLogin(page, { lembrar }) {
    await page.goto("/login.html");
    await page.locator("#loginNumero").pressSequentially("11987654321");
    await expect(page.locator("#loginNumero")).toHaveValue("(11) 98765-4321");
    await page.locator("#loginSenha").fill("segredo1");
    await page.locator("#termosLogin").check();
    await page.locator("#termosDados").check();
    if (lembrar) await page.locator("#lembrarLogin").check();
    await page.locator("#btnLogin").click();
    await expect(page).toHaveURL(/\/app\.html$/);
    await expect(page.locator("#meu-nome")).toHaveText("Maria Souza");
}

test.describe("login e sessão", () => {
    test("sem 'lembrar': a sessão vale só na aba", async ({ context, page }) => {
        await ligarApiFalsa(context);
        await fazerLogin(page, { lembrar: false });

        const outraAba = await context.newPage();
        await outraAba.goto("/index.html");
        await expect(outraAba).toHaveURL(/\/login\.html$/);
    });

    test("com 'lembrar': outra aba já entra no app", async ({ context, page }) => {
        await ligarApiFalsa(context);
        await fazerLogin(page, { lembrar: true });

        const outraAba = await context.newPage();
        await outraAba.goto("/index.html");
        await expect(outraAba).toHaveURL(/\/app\.html$/);
    });

    test("navegador bloqueia o envio sem aceitar os termos (required) e não chama a API", async ({ page }) => {
        const api = await ligarApiFalsa(page);
        await page.goto("/login.html");
        await page.locator("#loginNumero").fill("11987654321");
        await page.locator("#loginSenha").fill("segredo1");
        await page.locator("#btnLogin").click();
        await expect(page).toHaveURL(/\/login\.html$/);
        expect(api.doTipo("login")).toHaveLength(0);
    });

    test("sessão expirada no servidor → volta ao login e apaga a sessão", async ({ page }) => {
        await ligarApiFalsa(page, { conversas: () => erro("Sessão expirada.", "SESSAO") });
        await entrarDireto(page);
        await page.goto("/app.html");
        await expect(page).toHaveURL(/\/login\.html$/);
        expect(await page.evaluate(() => localStorage.getItem("sessao"))).toBeNull();
    });
});

test("abrir conversa por telefone e enviar mensagem", async ({ page }) => {
    const api = await ligarApiFalsa(page);
    await entrarDireto(page);
    await page.goto("/app.html");

    await page.locator("#listaConversas .chat-contact", { hasText: "João Lima" }).click();
    await expect(page.locator("#mensagens .message-bubble")).toHaveText(["Oi, Maria!"]);

    await page.locator("#novoChat").click();
    await expect(page.locator("#modal")).toBeVisible();
    await page.locator("#novo-telefone").pressSequentially("11955554444");
    await page.locator("#formModal button[type=submit]").click();
    await expect(page.locator("#modal")).toBeHidden();
    await expect(page.locator("#nomeGrupo")).toHaveText("Contato 4444");

    await page.locator("#campoMensagem").fill("Olá!");
    await page.locator("#formMensagem button[type=submit]").click();
    await expect(page.locator("#mensagens .message-row.mine .message-bubble")).toHaveText(["Olá!"]);
    expect(api.doTipo("enviar").map(c => c.corpo.texto)).toEqual(["Olá!"]);
    expect(api.doTipo("enviar")[0].headers["content-type"]).toBe("text/plain;charset=utf-8");
});

test("criar tarefa e ela continuar lá depois de recarregar", async ({ page }) => {
    await ligarApiFalsa(page);
    await entrarDireto(page);
    await page.goto("/app.html");

    await page.locator('.menu-item[data-view="tarefas"]').click();
    await page.locator("#novaTarefa").click();
    await page.locator("#modalCampos #titulo").fill("Comprar bola");
    await page.locator("#formModal button[type=submit]").click();
    await expect(page.locator("#modal")).toBeHidden();
    await expect(page.locator("#listaTarefas .task-details strong")).toHaveText(["Comprar bola"]);
    await expect(page.locator("#contadorTarefas")).toHaveText("1");

    await page.reload();
    await page.locator('.menu-item[data-view="tarefas"]').click();
    await expect(page.locator("#listaTarefas .task-details strong")).toHaveText(["Comprar bola"]);
});
